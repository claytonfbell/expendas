import { Grid, Stack } from "@mui/material"
import { AccountBucket, RetirementPlan } from "@prisma/client"
import { CurrencyFieldBase } from "material-ui-pack"
import { useEffect, useMemo, useState } from "react"
import { displayAccountBucket } from "./accountBuckets"
import { AccountWithIncludes } from "./AccountWithIncludes"
import {
  useFetchAccounts,
  useFetchRetirementPlanContributions,
  useUpdateRetirementPlanContributions,
} from "./api/api"
import DisplayError from "./DisplayError"
import { formatMoney } from "./formatMoney"
import { RetirementPlanSection } from "./RetirementPlanSection"

type StateItem = {
  accountId: number
  amount: number
}

type FormState = { id: number; items: StateItem[] }

interface Props {
  retirementPlan: RetirementPlan
}

export function RetirementPlanSavings({ retirementPlan }: Props) {
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

  const [state, setState] = useState<FormState>({
    id: retirementPlan.id,
    items: [],
  })

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
      setState({ id: retirementPlan.id, items: newState })
    }
  }, [contributions, retirementAccounts])

  const { mutateAsync: updateRetirementContributions, error } =
    useUpdateRetirementPlanContributions()

  useEffect(() => {
    const timeout = setTimeout(() => {
      updateRetirementContributions({
        retirementPlanId: state.id,
        contributions: state.items.map((item) => ({
          accountId: item.accountId,
          amount: item.amount,
        })),
      })
    }, 1000)

    return () => clearTimeout(timeout)
  }, [state, retirementPlan.id, updateRetirementContributions])

  const totalSavedPerMonth =
    state.items.length > 0 ? state.items.reduce((a, b) => a + b.amount, 0) : 0
  const totalSavedPerYear = totalSavedPerMonth * 12

  const savedSoFar = useMemo(() => {
    return retirementAccounts.reduce((sum, account) => {
      return sum + account.balance
    }, 0)
  }, [retirementAccounts])

  const accountsGroupedByBucket = useMemo(() => {
    const groups: {
      [bucket: string]: AccountWithIncludes[]
    } = {}
    state.items.forEach((item) => {
      const account = accounts?.find((a) => a.id === item.accountId)
      if (account) {
        const bucket = account.accountBucket ?? "Other"
        if (!groups[bucket]) {
          groups[bucket] = []
        }
        groups[bucket].push(account)
      }
    })
    return groups
  }, [state, accounts])

  return (
    <RetirementPlanSection
      title="Savings"
      summary={
        <>
          <Stack>{formatMoney(savedSoFar, true)} current</Stack>
          <Stack>
            {formatMoney(totalSavedPerMonth, true)} mo /{" "}
            {formatMoney(totalSavedPerYear, true)} yr
          </Stack>
        </>
      }
      collapsible
    >
      <DisplayError error={error} />
      <Stack spacing={2}>
        {Object.entries(accountsGroupedByBucket).map(([bucket, accounts]) => {
          return (
            <Grid
              key={bucket}
              container
              spacing={2}
              width={"100%"}
              columns={16}
              alignItems={{ sm: "start", md: "center" }}
            >
              <Grid size={{ xs: 4, sm: 3, md: 2 }} key={bucket}>
                {displayAccountBucket(bucket as AccountBucket)}
              </Grid>
              <Grid size={12}>
                <Grid container spacing={2} columns={12}>
                  {accounts
                    // sort by account balance descending, then by name ascending
                    .sort((a, b) => {
                      if (b.balance !== a.balance) {
                        return b.balance - a.balance
                      }
                      return a.name.localeCompare(b.name)
                    })
                    .map((account) => {
                      return (
                        <Grid
                          key={account.id}
                          size={{ xs: 6, sm: 4, md: 3, lg: 2 }}
                        >
                          <CurrencyFieldBase
                            size="small"
                            fullWidth
                            currency="USD"
                            allowCents={false}
                            label={account.name}
                            value={
                              (state.items.find(
                                (item) => item.accountId === account.id
                              )?.amount ?? 0) / 100
                            }
                            onChange={(x) => {
                              setState((prev) => {
                                const newState = [...prev.items]
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
                                return { id: prev.id, items: newState }
                              })
                            }}
                          />
                        </Grid>
                      )
                    })}
                </Grid>
              </Grid>
            </Grid>
          )
        })}
      </Stack>
    </RetirementPlanSection>
  )
}
