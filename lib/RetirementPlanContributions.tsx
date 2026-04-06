import { Stack, Typography } from "@mui/material"
import { RetirementPlan } from "@prisma/client"
import { CurrencyFieldBase } from "material-ui-pack"
import { useEffect, useMemo, useState } from "react"
import { displayAccountBucket } from "./accountBuckets"
import {
  useFetchAccounts,
  useFetchRetirementPlanContributions,
  useUpdateRetirementPlanContributions,
} from "./api/api"
import DisplayError from "./DisplayError"
import { formatMoney } from "./formatMoney"

type StateItem = {
  accountId: number
  amount: number
}

interface Props {
  retirementPlan: RetirementPlan
}

export function RetirementPlanContributions({ retirementPlan }: Props) {
  const { data: contributions } = useFetchRetirementPlanContributions(
    retirementPlan.id
  )
  const { data: accounts } = useFetchAccounts()
  const retirementAccounts = useMemo(
    () =>
      accounts
        ?.filter((x) => x.accountType === "Investment")
        .sort((a, b) =>
          a.accountBucket && b.accountBucket
            ? a.accountBucket.localeCompare(b.accountBucket)
            : 0
        ) ?? [],
    [accounts]
  )

  const [state, setState] = useState<StateItem[]>([])

  useEffect(() => {
    if (contributions !== undefined) {
      const newState: StateItem[] = []
      retirementAccounts.forEach((account) => {
        const contribution = contributions.find(
          (c) => c.accountId === account.id
        )
        newState.push({
          accountId: account.id,
          amount: contribution?.amount ?? 0,
        })
      })
      setState(newState)
    }
  }, [contributions, retirementAccounts])

  const {
    mutateAsync: updateRetirementContributions,
    status,
    error,
  } = useUpdateRetirementPlanContributions()

  useEffect(() => {
    const timeout = setTimeout(() => {
      updateRetirementContributions({
        retirementPlanId: retirementPlan.id,
        contributions: state.map((item) => ({
          accountId: item.accountId,
          amount: item.amount,
        })),
      })
    }, 1000)

    return () => clearTimeout(timeout)
  }, [state, retirementPlan.id])

  return (
    <Stack spacing={1} alignItems={"start"}>
      <Typography variant="h4">Monthly Contributions</Typography>
      <DisplayError error={error} />
      {retirementAccounts.map((account) => {
        return (
          <Stack
            key={account.id}
            direction={"row"}
            spacing={2}
            alignItems={"center"}
          >
            <CurrencyFieldBase
              label={
                account.accountBucket
                  ? displayAccountBucket(account.accountBucket)
                  : undefined
              }
              size="small"
              value={
                (state.find((item) => item.accountId === account.id)?.amount ??
                  0) / 100
              }
              onChange={(x) => {
                setState((prev) => {
                  const newState = [...prev]
                  const index = newState.findIndex(
                    (item) => item.accountId === account.id
                  )
                  if (index !== -1) {
                    newState[index] = {
                      accountId: account.id,
                      amount: Math.round(x * 100),
                    }
                  } else {
                    newState.push({
                      accountId: account.id,
                      amount: Math.round(x * 100),
                    })
                  }
                  return newState
                })
              }}
            />
            <div>{account.name}</div>
          </Stack>
        )
      })}
      <Stack>
        Total Contributions:{" "}
        {formatMoney(
          state.length > 0 ? state.reduce((a, b) => a + b.amount, 0) : 0
        )}{" "}
        per month
      </Stack>
    </Stack>
  )
}
