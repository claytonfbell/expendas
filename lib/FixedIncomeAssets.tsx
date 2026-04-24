import CloseIcon from "@mui/icons-material/Close"
import {
  Chip,
  IconButton,
  Stack,
  TableBody,
  TableCell,
  TableHead,
  TableRow,
  Typography,
} from "@mui/material"
import { FixedIncomeAssetType } from "@prisma/client"
import moment from "moment-timezone"
import { useMemo, useState } from "react"
import { displayAccountBucket } from "./accountBuckets"
import { AmountInputTool } from "./AmountInputTool"
import AnimatedCounter from "./AnimatedCounter"
import {
  FixedIncomeAssetWithIncludes,
  useFetchFixedIncomeAssets,
  useRemoveFixedIncomeAsset,
  useUpdateFixedIncomeAsset,
} from "./api/api"
import { BottomStatusBar } from "./BottomStatusBar"
import ConfirmDialog from "./ConfirmDialog"
import { Currency } from "./Currency"
import { ExpendasTable } from "./ExpendasTable"
import { FixedIncomeAssetCreateDialog } from "./FixedIncomeAssetCreateDialog"
import { formatMoney } from "./formatMoney"
import { Percentage } from "./Percentage"
import { PercentInputTool } from "./PercentInputTool"

export function FixedIncomeAssets() {
  const { data: fixedIncomeAssets } = useFetchFixedIncomeAssets()

  const assetsWithCalculations: AssetWithCalculations[] = useMemo(() => {
    if (!fixedIncomeAssets) {
      return []
    }
    return (
      fixedIncomeAssets
        .map((asset) => {
          const hasCalculatedApr: FixedIncomeAssetType[] = [
            "US_Treasury_T_Bill",
          ]
          const hasCalculatedGains: FixedIncomeAssetType[] = [
            "US_Treasury_T_Bill",
            "Bond_Fund",
            "CD",
          ]

          const calculatedApr = (() => {
            if (!hasCalculatedApr.includes(asset.type)) {
              return null
            }
            if (
              asset.duration === null ||
              asset.durationUnit === null ||
              asset.originalCostBasis === null
            ) {
              return null
            }
            const apr =
              ((asset.amount - asset.originalCostBasis) *
                (asset.durationUnit === "Weeks"
                  ? 52 / asset.duration
                  : 12 / asset.duration)) /
              asset.amount
            return Math.round(apr * 10_000)
          })()

          const calculatedGains = (() => {
            if (!hasCalculatedGains.includes(asset.type)) {
              return null
            }
            if (
              asset.type === "US_Treasury_T_Bill" ||
              asset.type === "Bond_Fund"
            ) {
              return asset.amount - (asset.originalCostBasis ?? 0)
            } else if (asset.type === "CD") {
              return (
                asset.amount *
                ((asset.apr ?? 0) / 10000) *
                ((asset.duration ?? 0) /
                  (asset.durationUnit === "Weeks" ? 52 : 12))
              )
            }
            return null
          })()

          return {
            asset,
            calculatedApr,
            calculatedGains,
            daysLeft:
              asset.matureDate !== null
                ? moment(`${asset.matureDate} 00:00:00`)
                    .tz("America/Los_Angeles")
                    .startOf("day")
                    .diff(
                      moment().tz("America/Los_Angeles").startOf("day"),
                      "days"
                    )
                : null,
          }
        })
        // sort by days left ascending
        .sort((a, b) => {
          if (a.daysLeft === null && b.daysLeft === null) {
            // sort amount desc if both have no days left
            return b.asset.amount - a.asset.amount
          }
          if (a.daysLeft === null) {
            return -1
          }
          if (b.daysLeft === null) {
            return 1
          }

          return a.daysLeft - b.daysLeft
        })
        // sort bond funds at the end (sort by apr asc)
        .sort((a, b) => {
          if (a.asset.type === "Bond_Fund" && b.asset.type !== "Bond_Fund") {
            return 1
          }
          if (a.asset.type !== "Bond_Fund" && b.asset.type === "Bond_Fund") {
            return -1
          }
          if (a.asset.type === "Bond_Fund" && b.asset.type === "Bond_Fund") {
            const aApr = a.calculatedApr ?? a.asset.apr ?? 0
            const bApr = b.calculatedApr ?? b.asset.apr ?? 0
            return aApr - bApr
          }
          return 0
        })
    )
  }, [fixedIncomeAssets])

  const totalAmount = useMemo(() => {
    return assetsWithCalculations.reduce(
      (sum, asset) => sum + asset.asset.amount,
      0
    )
  }, [assetsWithCalculations])

  const totalGains = useMemo(() => {
    return assetsWithCalculations.reduce((sum, asset) => {
      if (asset.calculatedGains !== null) {
        return sum + asset.calculatedGains
      }
      return sum
    }, 0)
  }, [assetsWithCalculations])

  const calulateAnnualGainsWithApr = useMemo(() => {
    return assetsWithCalculations.reduce((sum, asset) => {
      const apr = asset.calculatedApr ?? asset.asset.apr ?? 0
      return sum + asset.asset.amount * (apr / 10_000)
    }, 0)
  }, [assetsWithCalculations])

  const calculateAverageApr = useMemo(() => {
    return calulateAnnualGainsWithApr / totalAmount
  }, [calulateAnnualGainsWithApr, totalAmount])

  return (
    <>
      <Stack spacing={2}>
        <Stack
          direction="row"
          justifyContent="space-between"
          alignItems={"start"}
        >
          <Typography variant="h1">Fixed Income Assets</Typography>
          <FixedIncomeAssetCreateDialog />
        </Stack>

        <ExpendasTable>
          <TableHead>
            <TableRow>
              <TableCell>Account</TableCell>
              <TableCell>Settle Date</TableCell>
              <TableCell>Mature Date</TableCell>
              <TableCell align="right">Days Left</TableCell>
              <TableCell>Type</TableCell>
              <TableCell align="right">Amount</TableCell>
              <TableCell align="right">Cost Basis</TableCell>
              <TableCell>APR</TableCell>
              <TableCell align="right">Gains</TableCell>
              <TableCell align="right">&nbsp;</TableCell>
            </TableRow>
          </TableHead>

          <TableBody>
            {assetsWithCalculations?.map((row) => (
              <FixedIncomeAssetRow
                key={row.asset.id}
                assetWithCalculations={row}
              />
            ))}

            <TableRow hover>
              <TableCell colSpan={5}>TOTAL</TableCell>
              <TableCell align="right">
                <Currency value={totalAmount} />
              </TableCell>
              <TableCell colSpan={2} align="center">
                &nbsp;
              </TableCell>
              <TableCell align="right">
                <Currency value={totalGains} />
              </TableCell>
              <TableCell align="right">&nbsp;</TableCell>
            </TableRow>
          </TableBody>
        </ExpendasTable>
      </Stack>

      {/* <pre>{JSON.stringify(assetsWithCalculations, null, 2)}</pre> */}

      <BottomStatusBar>
        <Stack direction="row" spacing={4} justifyContent="end">
          <Stack alignItems={"end"}>
            <Typography>Total Amount</Typography>
            <AnimatedCounter value={totalAmount} roundNearestDollar />
          </Stack>
          <Stack alignItems={"end"}>
            <Typography>Overall APR</Typography>
            <Stack>
              <Percentage value={calculateAverageApr} decimals={2} />
            </Stack>
          </Stack>
          <Stack alignItems={"end"}>
            <Typography>Annual Gains</Typography>
            <AnimatedCounter
              value={calulateAnnualGainsWithApr}
              roundNearestDollar
            />
          </Stack>
        </Stack>
      </BottomStatusBar>
    </>
  )
}

type AssetWithCalculations = {
  asset: FixedIncomeAssetWithIncludes
  calculatedApr: number | null
  calculatedGains: number | null
  daysLeft: number | null
}

function FixedIncomeAssetRow({
  assetWithCalculations: { asset, calculatedApr, calculatedGains, daysLeft },
}: {
  assetWithCalculations: AssetWithCalculations
}) {
  const { mutateAsync: removeFixedIncomeAsset } = useRemoveFixedIncomeAsset()
  const { mutateAsync: updateFixedIncomeAsset, status: updateStatus } =
    useUpdateFixedIncomeAsset()

  function handleUpdate(changes: Partial<FixedIncomeAssetWithIncludes>) {
    return updateFixedIncomeAsset({ ...asset, ...changes })
  }

  const hasDuration: FixedIncomeAssetType[] = ["CD", "US_Treasury_T_Bill"]

  const [confirmDelete, setConfirmDelete] = useState(false)

  return (
    <TableRow key={asset.id} hover>
      <TableCell>
        {asset.account.name}{" "}
        {asset.account.accountBucket &&
          ` (${displayAccountBucket(asset.account.accountBucket)})`}
      </TableCell>
      <TableCell>
        {asset.settlementDate &&
          moment(`${asset.settlementDate} 00:00:00`).format("M/D/YYYY")}
      </TableCell>
      <TableCell>
        {asset.matureDate &&
          moment(`${asset.matureDate} 00:00:00`).format("M/D/YYYY")}
      </TableCell>
      <TableCell align="right">
        {asset.matureDate !== null
          ? moment(`${asset.matureDate} 00:00:00`)
              .tz("America/Los_Angeles")
              .startOf("day")
              .diff(moment().tz("America/Los_Angeles").startOf("day"), "days")
          : null}
      </TableCell>
      <TableCell>
        <Stack direction="row" spacing={1} alignItems="baseline">
          <Stack>{displayFixedIncomeAssetType(asset.type)}</Stack>
          {asset.institution && <Stack>{asset.institution}</Stack>}
          {hasDuration.includes(asset.type) &&
            asset.duration &&
            asset.durationUnit && (
              <Chip
                size="small"
                label={`${asset.duration} ${asset.durationUnit}`}
              />
            )}
        </Stack>
      </TableCell>
      <TableCell align="right">
        <AmountInputTool
          enabled={updateStatus !== "pending"}
          value={asset.amount}
          onChange={(amount) => handleUpdate({ amount })}
        />
      </TableCell>

      <TableCell align="right">
        {asset.originalCostBasis && (
          <AmountInputTool
            enabled={updateStatus !== "pending"}
            value={asset.originalCostBasis}
            onChange={(originalCostBasis) =>
              handleUpdate({
                originalCostBasis,
              })
            }
          />
        )}
      </TableCell>

      <TableCell>
        {calculatedApr !== null ? (
          <>
            {(calculatedApr / 100).toLocaleString(undefined, {
              maximumFractionDigits: 2,
            })}
            %
          </>
        ) : (
          <PercentInputTool
            enabled={updateStatus !== "pending"}
            value={asset.apr ?? 0}
            onChange={(apr) => handleUpdate({ apr })}
          />
        )}
      </TableCell>

      <TableCell align="right">
        {calculatedGains !== null ? formatMoney(calculatedGains) : null}
      </TableCell>

      <TableCell align="right">
        <IconButton
          sx={{ padding: 0 }}
          size="small"
          onClick={() => setConfirmDelete(true)}
        >
          <CloseIcon
            sx={{
              color: (theme) => theme.palette.text.disabled,
            }}
          />
        </IconButton>
        <ConfirmDialog
          open={confirmDelete}
          onClose={() => setConfirmDelete(false)}
          message="Delete Fixed Income Asset?"
          onAccept={() => removeFixedIncomeAsset(asset)}
        />
      </TableCell>
    </TableRow>
  )
}

export const displayFixedIncomeAssetType = (
  fixedIncomeAssetType: FixedIncomeAssetType
) =>
  fixedIncomeAssetType === "US_Treasury_T_Bill"
    ? "U.S. Treasury"
    : fixedIncomeAssetType.replace(/_/g, " ")

export const allFixedIncomeAssetTypes: FixedIncomeAssetType[] = [
  "Bond_Fund",
  "CD",
  "Money_Market_Fund",
  "US_Treasury_T_Bill",
]
