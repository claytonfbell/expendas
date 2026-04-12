import AddIcon from "@mui/icons-material/Add"
import {
  Button,
  Dialog,
  DialogContent,
  DialogTitle,
  Fab,
  Stack,
  TextField,
} from "@mui/material"
import {
  FixedIncomeAssetDurationUnit,
  FixedIncomeAssetType,
} from "@prisma/client"
import {
  CurrencyFieldBase,
  DatePickerBase,
  NumberFieldBase,
  PercentageFieldBase,
  SelectBase,
} from "material-ui-pack"
import { useCallback, useEffect, useMemo, useState } from "react"
import { NewFixedIncomeAssetRequestBody } from "../pages/api/organizations/[id]/fixedIncomeAssets/index"
import { displayAccountBucket } from "./accountBuckets"
import { useAddFixedIncomeAsset, useFetchAccounts } from "./api/api"
import DisplayError from "./DisplayError"
import {
  allFixedIncomeAssetTypes,
  displayFixedIncomeAssetType,
} from "./FixedIncomeAssets"

const defaultState: NewFixedIncomeAssetRequestBody = {
  accountId: null,
  type: "Money_Market_Fund",
  amount: 0,
  originalCostBasis: null,
  apr: null,
  matureDate: null,
  settlementDate: null,
  institution: null,
  duration: null,
  durationUnit: null,
}

export function FixedIncomeAssetCreateDialog() {
  const {
    mutateAsync: addFixedIncomeAsset,
    status,
    error,
  } = useAddFixedIncomeAsset()
  const [open, setOpen] = useState(false)
  const { data: accounts } = useFetchAccounts()
  const investmentAccounts = useMemo(
    () =>
      accounts?.filter((account) => account.accountType === "Investment") ?? [],
    [accounts]
  )

  const [state, setState] =
    useState<NewFixedIncomeAssetRequestBody>(defaultState)

  const Show = useCallback(
    ({
      types,
      children,
    }: {
      types: FixedIncomeAssetType[]
      children: React.ReactNode
    }) => {
      const show = types.includes(state.type)
      return show ? <>{children}</> : null
    },
    [state.type]
  )

  useEffect(() => {
    if (!open) {
      setState(defaultState)
    }
  }, [open])

  return (
    <>
      <Fab
        size="small"
        color="primary"
        onClick={() => {
          setOpen(true)
        }}
      >
        <AddIcon />
      </Fab>
      <Dialog
        open={open}
        onClose={() => setOpen(false)}
        fullWidth
        maxWidth="xs"
      >
        <DialogTitle>Add Fixed Income Asset</DialogTitle>
        <DialogContent>
          <form
            onSubmit={(e) => {
              e.preventDefault()
              addFixedIncomeAsset(state).then(() => setOpen(false))
            }}
          >
            <Stack spacing={2} marginTop={1}>
              {/* <pre>{JSON.stringify(state, null, 2)}</pre> */}
              <DisplayError error={error} />
              <SelectBase
                size="small"
                allowNull
                options={(investmentAccounts ?? []).map((account) => ({
                  label: `${account.name}${account.accountBucket && `(${displayAccountBucket(account.accountBucket)})`}`,
                  value: account.id,
                }))}
                value={state.accountId}
                onChange={(accountId) =>
                  setState((prev) => ({
                    ...prev,
                    accountId: accountId as number,
                  }))
                }
                label="Account"
              />

              <SelectBase
                size="small"
                allowNull
                options={allFixedIncomeAssetTypes.map(
                  (fixedIncomeAssetType) => ({
                    value: fixedIncomeAssetType,
                    label: displayFixedIncomeAssetType(fixedIncomeAssetType),
                  })
                )}
                value={state.type}
                onChange={(type) =>
                  setState((prev) => ({
                    ...prev,
                    type: type as FixedIncomeAssetType,
                  }))
                }
                label="Type"
              />

              <CurrencyFieldBase
                size="small"
                value={state.amount / 100}
                onChange={(amount) =>
                  setState((prev) => ({
                    ...prev,
                    amount: Math.round(amount * 100),
                  }))
                }
                label="Amount"
                currency="USD"
              />

              <Show types={["Bond_Fund", "US_Treasury_T_Bill"]}>
                <CurrencyFieldBase
                  size="small"
                  value={(state.originalCostBasis ?? 0) / 100}
                  onChange={(originalCostBasis) =>
                    setState((prev) => ({
                      ...prev,
                      originalCostBasis: Math.round(originalCostBasis * 100),
                    }))
                  }
                  label="Original Cost Basis"
                  currency="USD"
                />
              </Show>

              <Show types={["Money_Market_Fund", "CD", "Bond_Fund"]}>
                <PercentageFieldBase
                  size="small"
                  value={(state.apr ?? 0) / 10_000}
                  onChange={(apr) =>
                    setState((prev) => ({
                      ...prev,
                      apr: apr === 0 ? null : apr * 10_000,
                    }))
                  }
                  decimals={4}
                  label="APR"
                />
              </Show>

              <Show types={["US_Treasury_T_Bill", "CD"]}>
                <DatePickerBase
                  size="small"
                  label="Settlement Date"
                  value={state.settlementDate}
                  onChange={(settlementDate) =>
                    setState((prev) => ({
                      ...prev,
                      settlementDate,
                    }))
                  }
                />
              </Show>

              <Show types={["US_Treasury_T_Bill", "CD"]}>
                <DatePickerBase
                  size="small"
                  label="Mature Date"
                  value={state.matureDate}
                  onChange={(matureDate) =>
                    setState((prev) => ({
                      ...prev,
                      matureDate,
                    }))
                  }
                />
              </Show>

              <Show types={["Bond_Fund", "CD", "Money_Market_Fund"]}>
                <TextField
                  size="small"
                  label="Institution"
                  value={state.institution ?? ""}
                  onChange={(e) =>
                    setState((prev) => ({
                      ...prev,
                      institution: e.target.value,
                    }))
                  }
                />
              </Show>

              <Show types={["US_Treasury_T_Bill", "CD"]}>
                <NumberFieldBase
                  setZeroToNull
                  size="small"
                  label="Duration"
                  value={state.duration}
                  onChange={(duration) =>
                    setState((prev) => ({
                      ...prev,
                      duration: duration === 0 ? null : duration,
                    }))
                  }
                />
              </Show>

              <Show types={["US_Treasury_T_Bill", "CD"]}>
                <SelectBase
                  size="small"
                  allowNull
                  options={[
                    { value: "Weeks", label: "Weeks" },
                    { value: "Months", label: "Months" },
                  ]}
                  value={state.durationUnit}
                  onChange={(durationUnit) =>
                    setState((prev) => ({
                      ...prev,
                      durationUnit:
                        (durationUnit as FixedIncomeAssetDurationUnit) || null,
                    }))
                  }
                  label="Duration Unit"
                />
              </Show>

              <Stack direction="row" justifyContent="flex-end" spacing={2}>
                <Button
                  type="submit"
                  variant="contained"
                  disabled={status === "pending"}
                >
                  Create
                </Button>
                <Button variant="outlined" onClick={() => setOpen(false)}>
                  Cancel
                </Button>
              </Stack>
            </Stack>
          </form>
        </DialogContent>
      </Dialog>
    </>
  )
}
