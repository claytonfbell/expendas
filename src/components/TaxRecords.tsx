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
import { useState } from "react"
import type { TaxRecordWithIncludes } from "../app/api/organizations.$id.taxRecords"
import { useFetchTaxRecords } from "./api/hooks/useFetchTaxRecords"
import rest from "./api/rest"
import { BottomStatusBar } from "./BottomStatusBar"
import { ExpendasTable } from "./ExpendasTable"
import { useGlobalState } from "./GlobalStateContext"
import { TaxRecordCreateDialog } from "./TaxRecordCreateDialog"
import { TaxRecordDialog } from "./TaxRecordDialog"

export function TaxRecords() {
  const { data: taxRecords } = useFetchTaxRecords()
  const { organizationId } = useGlobalState()
  const [taxRecord, setTaxRecord] = useState<TaxRecordWithIncludes | null>(null)
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
              <TableCell>Tax Year</TableCell>
              <TableCell>User</TableCell>
              <TableCell>Files</TableCell>
              <TableCell align="right">Actions</TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {taxRecords?.map((taxRecord) => (
              <TableRow key={taxRecord.id}>
                <TableCell>{taxRecord.taxYear}</TableCell>
                <TableCell>
                  {taxRecord.user.firstName} {taxRecord.user.lastName}
                </TableCell>
                <TableCell>
                  <Stack
                    direction="row"
                    spacing={1}
                    sx={{
                      flexWrap: "wrap",
                      gap: 1,
                    }}
                  >
                    {taxRecord.taxRecordFiles.map((taxRecordFile) => (
                      <Button
                        key={taxRecordFile.id}
                        size="small"
                        variant="outlined"
                        component={Link}
                        href={`${rest.baseURL}/organizations/${organizationId}/taxRecords/${taxRecord.id}/files/${taxRecordFile.id}/open`}
                        target="_blank"
                      >
                        {taxRecordFile.organizationCloudFile.name}
                      </Button>
                    ))}
                  </Stack>
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
                      component={Link}
                      href={`${rest.baseURL}/organizations/${organizationId}/taxRecords/${taxRecord.id}/download`}
                    >
                      <DownloadIcon />
                    </IconButton>
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

      <BottomStatusBar />
    </>
  )
}