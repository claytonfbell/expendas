import AddIcon from "@mui/icons-material/Add"
import EditIcon from "@mui/icons-material/Edit"
import {
  Button,
  IconButton,
  Stack,
  TableBody,
  TableCell,
  TableHead,
  TableRow,
  Typography,
} from "@mui/material"
import { useState } from "react"
import { useFetchInsurancePolicies } from "./api/hooks/useFetchInsurancePolicies"
import AnimatedCounter from "./AnimatedCounter"
import { BottomStatusBar } from "./BottomStatusBar"
import { ExpendasTable } from "./ExpendasTable"
import { formatMoney } from "./formatMoney"
import { LifeInsuranceDialog } from "./LifeInsuranceDialog"
import dayjs from "./dayjs"
import type { InsurancePolicyWithIncludes } from "../app/api/organizations.$id.insurancePolicies"

function ageAtTermEnd(policy: InsurancePolicyWithIncludes): string | null {
  if (!policy.termEnd || !policy.user.dateOfBirth) return null
  const age = dayjs(policy.termEnd, "YYYY-MM-DD").diff(
    dayjs(policy.user.dateOfBirth, "YYYY-MM-DD"),
    "year"
  )
  return age >= 0 ? String(age) : null
}

export function LifeInsurance() {
  const { data: policies } = useFetchInsurancePolicies()
  const [dialogOpen, setDialogOpen] = useState(false)
  const [editPolicy, setEditPolicy] = useState<InsurancePolicyWithIncludes | null>(null)

  const handleEdit = (policy: InsurancePolicyWithIncludes) => {
    setEditPolicy(policy)
    setDialogOpen(true)
  }

  const handleAdd = () => {
    setEditPolicy(null)
    setDialogOpen(true)
  }

  return (
    <>
      <Stack spacing={2}>
        <Stack
          direction="row"
          sx={{
            justifyContent: "space-between",
            alignItems: "center",
          }}
        >
          <Typography variant="h1">Life Insurance</Typography>
          <Button
            variant="contained"
            startIcon={<AddIcon />}
            onClick={handleAdd}
          >
            Add Policy
          </Button>
        </Stack>

        <ExpendasTable>
          <TableHead>
            <TableRow>
              <TableCell>Company</TableCell>
              <TableCell>Type</TableCell>
              <TableCell sx={{ display: { xs: "none", md: "table-cell" } }}>
                Policyholder
              </TableCell>
              <TableCell sx={{ display: { xs: "none", md: "table-cell" } }}>
                Policy Number
              </TableCell>
              <TableCell sx={{ display: { xs: "none", md: "table-cell" } }}>
                Term Years
              </TableCell>
              <TableCell sx={{ display: { xs: "none", md: "table-cell" } }}>
                Term End
              </TableCell>
              <TableCell sx={{ display: { xs: "none", md: "table-cell" } }}>
                Age at Term End
              </TableCell>
              <TableCell>Coverage</TableCell>
              <TableCell sx={{ display: { xs: "none", md: "table-cell" } }}>
                Premium
              </TableCell>
              <TableCell sx={{ display: { xs: "none", md: "table-cell" } }}>
                Files
              </TableCell>
              <TableCell align="right">Actions</TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {policies?.map((policy) => (
              <TableRow key={policy.id}>
                <TableCell>{policy.company}</TableCell>
                <TableCell>{policy.type}</TableCell>
                <TableCell sx={{ display: { xs: "none", md: "table-cell" } }}>
                  {policy.user.firstName} {policy.user.lastName}
                </TableCell>
                <TableCell sx={{ display: { xs: "none", md: "table-cell" } }}>
                  {policy.policyNumber}
                </TableCell>
                <TableCell sx={{ display: { xs: "none", md: "table-cell" } }}>
                  {policy.termYears ?? "\u2014"}
                </TableCell>
                <TableCell sx={{ display: { xs: "none", md: "table-cell" } }}>
                  {policy.termEnd
                    ? dayjs(policy.termEnd, "YYYY-MM-DD").format("ll")
                    : "\u2014"}
                </TableCell>
                <TableCell sx={{ display: { xs: "none", md: "table-cell" } }}>
                  {ageAtTermEnd(policy) ?? "\u2014"}
                </TableCell>
                <TableCell>{formatMoney(policy.amount)}</TableCell>
                <TableCell sx={{ display: { xs: "none", md: "table-cell" } }}>
                  {policy.premium != null ? formatMoney(policy.premium) : "\u2014"}
                </TableCell>
                <TableCell sx={{ display: { xs: "none", md: "table-cell" } }}>
                  {policy.insurancePolicyFiles.length > 0
                    ? policy.insurancePolicyFiles.length
                    : "\u2014"}
                </TableCell>
                <TableCell align="right">
                  <Stack direction="row" sx={{ justifyContent: "flex-end" }}>
                    <IconButton
                      size="small"
                      onClick={() => handleEdit(policy)}
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

      <LifeInsuranceDialog
        open={dialogOpen}
        onClose={() => {
          setDialogOpen(false)
          setEditPolicy(null)
        }}
        policy={editPolicy}
      />

      <BottomStatusBar>
        <Stack
          direction="row"
          spacing={4}
          sx={{
            justifyContent: "end",
          }}
        >
          <Stack
            sx={{
              alignItems: "end",
            }}
          >
            <Typography>Total Coverage</Typography>
            <AnimatedCounter
              value={(policies ?? []).reduce(
                (sum, p) => sum + p.amount,
                0
              )}
              roundNearestDollar
            />
          </Stack>
        </Stack>
      </BottomStatusBar>
    </>
  )
}