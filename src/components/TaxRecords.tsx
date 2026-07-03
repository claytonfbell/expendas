import DownloadIcon from "@mui/icons-material/Download"
import EditIcon from "@mui/icons-material/Edit"
import {
  Button,
  IconButton,
  Link,
  Stack,
  TableBody,
  TableCell,
  TableHead,
  TableRow,
  Typography,
} from "@mui/material"
import prettyBytes from "pretty-bytes"
import { useState } from "react"
import type { TaxRecordWithIncludes } from "../app/api/organizations.$id.taxRecords"
import { useFetchTaxRecords } from "./api/hooks/useFetchTaxRecords"
import { useGlobalState } from "./GlobalStateContext"
import rest from "./api/rest"
import { ExpendasTable } from "./ExpendasTable"
import { formatMoney } from "./formatMoney"
import { TaxRecordCreateDialog } from "./TaxRecordCreateDialog"
import { TaxRecordDialog } from "./TaxRecordDialog"
import { displayTaxRecordType } from "./taxRecordTypes"

export function TaxRecords() {
  const { data: taxRecords } = useFetchTaxRecords()
  const { organizationId } = useGlobalState()
  const [taxRecord, setTaxRecord] =
    useState<TaxRecordWithIncludes | null>(null)
  return (
    <>
      <Stack spacing={2}>
        <Stack
          direction="row"
          sx={{
            justifyContent: "space-between",
          }}
        >
          <Typography variant="h1">Tax Records</Typography>
          <TaxRecordCreateDialog />
        </Stack>
        <ExpendasTable>
          <TableHead>
            <TableRow>
              <TableCell>Type</TableCell>
              <TableCell>Tax Year</TableCell>
              <TableCell>User</TableCell>
              <TableCell>File</TableCell>
              <TableCell align="right">Download</TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {taxRecords?.map((taxRecord) => (
              <TableRow key={taxRecord.id}>
                <TableCell>
                  {displayTaxRecordType(taxRecord.taxRecordType)}
                </TableCell>
                <TableCell>{taxRecord.taxYear}</TableCell>
                <TableCell>
                  {taxRecord.user.firstName} {taxRecord.user.lastName}
                </TableCell>
                <TableCell>
                  <Button
                    startIcon={<DownloadIcon />}
                    size="small"
                    component={Link}
                    href={`${rest.baseURL}/organizations/${organizationId}/taxRecords/${taxRecord.id}/download`}
                  >
                    {taxRecord.organizationCloudFile.name} (
                    {prettyBytes(
                      taxRecord.organizationCloudFile.cloudFile.size
                    )}
                    )
                  </Button>
                </TableCell>
                <TableCell align="right">
                  <Stack
                    direction="row"
                    sx={{
                      justifyContent: "flex-end",
                    }}
                  >
                    <IconButton
                      size="small"
                      onClick={() => setTaxRecord(taxRecord)}
                    >
                      <EditIcon />
                    </IconButton>
                  </Stack>
                </TableCell>
              </TableRow>
))}

          </TableBody>
        </ExpendasTable>
      </Stack>
      <TaxRecordDialog
        taxRecord={taxRecord}
        onClose={() => setTaxRecord(null)}
      />
    </>
  )
}