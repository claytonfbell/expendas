import {
  GetObjectCommand,
  PutObjectCommand,
  S3Client,
} from "@aws-sdk/client-s3"
import { CloudFile } from "@prisma/client"
import crypto from "crypto"
import fs from "fs"
import os from "os"
import path from "path"
import prisma from "./prisma"

const s3 = new S3Client({
  endpoint: process.env.S3_ENDPOINT,
  region: process.env.AWS_REGION,
})

const bucketName = process.env.AWS_BUCKET_NAME

type PutFileParams = {
  fileName: string
  fileContentType: string
  fileBase64: string
}

export async function putCloudFile({
  fileName,
  fileContentType,
  fileBase64,
}: PutFileParams) {
  const buffer = Buffer.from(fileBase64, "base64")

  const md5Hash = crypto.createHash("md5").update(buffer).digest("hex")

  // check if file exists
  const exists = await prisma.cloudFile.findUnique({
    where: {
      md5: md5Hash,
    },
  })
  if (exists) {
    // no need to upload again, just return the existing file metadata
    return exists
  }

  // upload to S3
  await s3.send(
    new PutObjectCommand({
      Bucket: bucketName,
      Key: md5Hash,
      Body: buffer,
    })
  )

  // persist the file into local temp folder for caching
  saveToTempFile(md5Hash, buffer)
  1
  // save file metadata to database
  const cloudFile = await prisma.cloudFile.create({
    data: {
      md5: md5Hash,
      originalName: fileName,
      contentType: fileContentType,
      size: buffer.length,
    },
  })

  if (!cloudFile) {
    throw new Error("Failed to save file metadata to database")
  }

  return cloudFile
}

function saveToTempFile(md5Hash: string, buffer: Buffer) {
  const tempDir = os.tmpdir()
  const filePath = path.join(tempDir, md5Hash)
  fs.writeFileSync(filePath, buffer)
}

export async function getCloudFileStream(cloudFile: CloudFile) {
  // first check if file exists in local temp folder
  const tempDir = os.tmpdir()
  const filePath = path.join(tempDir, cloudFile.md5)
  if (fs.existsSync(filePath)) {
    console.log("Serving file from local cache:", filePath)
    return fs.createReadStream(filePath)
  }

  console.log("Fetching file from S3:", cloudFile.md5)
  const data = await s3.send(
    new GetObjectCommand({
      Bucket: bucketName,
      Key: cloudFile.md5,
    })
  )

  // convert to read stream and return
  const stream = data.Body as any as fs.ReadStream

  const buffer: Buffer[] = []
  for await (const chunk of stream) {
    buffer.push(chunk)
  }
  const fileBuffer = Buffer.concat(buffer)

  // persist the file into local temp folder for caching
  saveToTempFile(cloudFile.md5, fileBuffer)

  return fs.createReadStream(filePath)
}
