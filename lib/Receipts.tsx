import DownloadIcon from "@mui/icons-material/Download"
import EditIcon from "@mui/icons-material/Edit"
import {
  Chip,
  IconButton,
  Link,
  Stack,
  TableBody,
  TableCell,
  TableHead,
  TableRow,
  Typography,
} from "@mui/material"
import moment from "moment"
import prettyBytes from "pretty-bytes"
import { useState } from "react"
import { ReceiptWithIncludes } from "../pages/api/organizations/[id]/receipts"
import { useFetchReceipts } from "./api/api"
import rest from "./api/rest"
import { ExpendasTable } from "./ExpendasTable"
import { formatMoney } from "./formatMoney"
import { ReceiptCreateDialog } from "./ReceiptCreateDialog"
import { ReceiptDialog } from "./ReceiptDialog"
import { displayReceiptType } from "./receiptTypes"

export function Receipts() {
  const { data: receipts } = useFetchReceipts()
  const [receipt, setReceipt] = useState<ReceiptWithIncludes | null>(null)
  return (
    <>
      <Stack spacing={2}>
        <Stack direction="row" justifyContent="space-between">
          <Typography variant="h1">Receipts</Typography>
          <ReceiptCreateDialog />
        </Stack>
        <ExpendasTable>
          <TableHead>
            <TableRow>
              <TableCell>Merchant</TableCell>
              <TableCell>Type</TableCell>
              <TableCell align="right">Amount</TableCell>
              <TableCell>Date</TableCell>
              <TableCell>Date Paid</TableCell>
              <TableCell>Account</TableCell>
              <TableCell>File</TableCell>
              <TableCell align="right">Download</TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {receipts?.map((receipt) => (
              <TableRow key={receipt.id}>
                <TableCell>{receipt.merchant}</TableCell>
                <TableCell>{displayReceiptType(receipt.receiptType)}</TableCell>
                <TableCell align="right">
                  {formatMoney(receipt.amount)}
                </TableCell>
                <TableCell>
                  {receipt.date &&
                    moment(receipt.date, "YYYY-MM-DD").format("ll")}
                </TableCell>
                <TableCell>
                  {receipt.datePaid &&
                    moment(receipt.datePaid, "YYYY-MM-DD").format("ll")}
                </TableCell>
                <TableCell>{receipt.account.name}</TableCell>
                <TableCell>
                  <Stack direction="row" spacing={1} alignItems="center">
                    <Stack>{receipt.organizationCloudFile.name}</Stack>
                    <Chip
                      size="small"
                      label={prettyBytes(
                        receipt.organizationCloudFile.cloudFile.size
                      )}
                    />
                    <IconButton
                      size="small"
                      component={Link}
                      href={`${rest.baseURL}/organizations/${receipt.account.organizationId}/receipts/${receipt.id}/download`}
                    >
                      <DownloadIcon />
                    </IconButton>
                  </Stack>
                </TableCell>
                <TableCell align="right">
                  <Stack direction="row" justifyContent="flex-end">
                    <IconButton
                      size="small"
                      onClick={() => setReceipt(receipt)}
                    >
                      <EditIcon />
                    </IconButton>
                  </Stack>
                </TableCell>
              </TableRow>
            ))}

            {/* total row */}
            <TableRow>
              <TableCell sx={{ fontWeight: "bold" }}>TOTAL</TableCell>
              <TableCell></TableCell>
              <TableCell align="right" sx={{ fontWeight: "bold" }}>
                {formatMoney(
                  receipts?.reduce(
                    (total, receipt) => total + receipt.amount,
                    0
                  ) ?? 0
                )}
              </TableCell>
              <TableCell></TableCell>
              <TableCell></TableCell>
              <TableCell></TableCell>
              <TableCell align="right"></TableCell>
            </TableRow>
          </TableBody>
        </ExpendasTable>
      </Stack>

      <ReceiptDialog receipt={receipt} onClose={() => setReceipt(null)} />
    </>
  )
}
