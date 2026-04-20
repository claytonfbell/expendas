import CloudUploadIcon from "@mui/icons-material/CloudUpload"
import Box from "@mui/material/Box"
import Stack from "@mui/material/Stack"
import Typography from "@mui/material/Typography"
import acceptFunc from "attr-accept"
import { DisplayError } from "material-ui-pack"
import mime from "mime-types"
import prettyBytes from "pretty-bytes"
import React, { useCallback, useState } from "react"
import { useDropzone } from "react-dropzone"
import DropZoneStyleBox from "./DropZoneStyleBox"

export type ContentType =
  | "application/pdf"
  | "application/vnd.ms-excel"
  | "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet"
  | "image/gif"
  | "image/jpeg"
  | "image/jpg"
  | "image/png"
  | "text/csv"
  | "text/plain"
  | "text/rtf"
  | "text/xml"

export interface FileInfo {
  name: string
  file: File
  base64: string
  type: string
}

interface Props {
  acceptedContentTypes?: ContentType[]
  details?: React.ReactNode
  label?: React.ReactNode
  maxSize?: number
  onSelect: (fileInfo: FileInfo) => void
  recommendedAtLeastDimensions?: string
}

export function SelectFile({
  onSelect,
  details,
  label,
  acceptedContentTypes = [],
  maxSize = 10_485_760,
  recommendedAtLeastDimensions,
}: Props) {
  label = label || "Upload File"

  mime.extensions["image/jpg"] = ["jpg"]
  const [error, setError] = useState<string>()
  const fileExtensions = acceptedContentTypes
    .map((a) => mime.extension(a))
    .join(", ")

  const onDrop = useCallback(
    (acceptedFiles: File[]) => {
      const [file] = acceptedFiles
      let { type } = file
      const { name } = file

      const errors: string[] = []
      if (file.size > maxSize) {
        errors.push("File is too large.")
      }
      if (errors.length === 0) {
        let accepted = acceptedContentTypes.length === 0
        acceptedContentTypes.forEach((contentType) => {
          if (acceptFunc({ name: file.name, type: file.type }, contentType)) {
            accepted = true
          }
        })

        if (!accepted) {
          errors.push(
            `File Type is not accepted: ${mime.extension(file.type) || file.type}`
          )
        }
      }
      // display error
      if (errors.length > 0) {
        setError(errors.join(" "))
      }
      // successfully selected a valid file
      else {
        setError(undefined)
        if (type === undefined || type === null || type === "") {
          type = "application/octet-stream"
        }
        const reader = new FileReader()
        reader.onload = (event) => {
          if (
            event !== null &&
            event.target !== null &&
            event.target.result !== null
          ) {
            const base64 = (event.target.result as string).replace(
              /^.*base64,/,
              ""
            )
            const srcPrefix = `data:${type};base64,`
            onSelect({ name, type, base64, file })
          }
        }
        reader.readAsDataURL(file)
      }
    },
    [acceptedContentTypes, maxSize, onSelect]
  )

  const { getRootProps, getInputProps, isDragActive } = useDropzone({ onDrop })

  return (
    <>
      <DisplayError error={error} />
      <DropZoneStyleBox
        className={isDragActive ? " active" : ""}
        {...getRootProps()}
      >
        <input {...getInputProps()} />
        <Stack
          spacing={0}
          minHeight={120}
          alignItems="center"
          justifyContent={"space-around"}
        >
          <Stack spacing={0} alignItems="center">
            {isDragActive ? (
              <Stack
                direction="row"
                spacing={1}
                alignItems="center"
                sx={{ fontSize: 18 }}
              >
                <CloudUploadIcon fontSize="inherit" />
                <Box>Drop File Here ...</Box>
              </Stack>
            ) : (
              <>
                <Stack
                  direction="row"
                  spacing={1}
                  alignItems="center"
                  sx={{ fontSize: 18 }}
                >
                  <CloudUploadIcon fontSize="inherit" />
                  <Box>{label}</Box>
                </Stack>
                {fileExtensions !== "" ? (
                  <Typography color="inherit" variant="caption">
                    Accepted: {fileExtensions}
                  </Typography>
                ) : null}
                <Typography color="inherit" variant="caption">
                  Maximum File Size: {prettyBytes(maxSize)}
                </Typography>
                {recommendedAtLeastDimensions !== undefined ? (
                  <Typography color="inherit" variant="caption">
                    Recommended at least {recommendedAtLeastDimensions}
                  </Typography>
                ) : null}
                {details !== undefined ? (
                  <Typography color="inherit" variant="caption">
                    {details}
                  </Typography>
                ) : null}
              </>
            )}
          </Stack>
        </Stack>
      </DropZoneStyleBox>
    </>
  )
}
