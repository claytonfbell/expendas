import AccountBalanceIcon from "@mui/icons-material/AccountBalance"
import {
  Box,
  Button,
  Dialog,
  DialogContent,
  DialogTitle,
  Stack,
} from "@mui/material"
import { Account } from "@prisma/client"
import {
  CheckboxBase,
  DisplayDateTime,
  DisplayError,
  ResponsiveTable,
} from "material-ui-pack"
import { Products } from "plaid"
import { useEffect, useState } from "react"
import {
  PlaidLinkOnSuccessMetadata,
  PlaidLinkOptions,
  usePlaidLink,
} from "react-plaid-link"
import { AccountDialog } from "./AccountDialog"
import { AccountWithIncludes } from "./AccountWithIncludes"
import { AssetDialog } from "./AssetDialog"
import { BottomStatusBar } from "./BottomStatusBar"
import ConfirmDialog from "./ConfirmDialog"
import { Currency } from "./Currency"
import { useGlobalState } from "./GlobalStateProvider"
import { displayAccountType } from "./accountTypes"
import { useCheckLogin } from "./api/hooks/useCheckLogin"
import { useCreateLinkToken } from "./api/hooks/useCreateLinkToken"
import { useCreatePlaidCredential } from "./api/hooks/useCreatePlaidCredential"
import { useFetchAccounts } from "./api/hooks/useFetchAccounts"
import { useRefreshPlaidAccounts } from "./api/hooks/useRefreshPlaidAccounts"
import { useRemoveAccount } from "./api/hooks/useRemoveAccount"
import { useScrapeEmailsFromFidelityAndUpdateBalances } from "./api/hooks/useScrapeEmailsFromFidelityAndUpdateBalances"
import { displayCreditCardType } from "./creditCardTypes"

export function AccountManage() {
  const { organizationId } = useGlobalState()
  const { data: login } = useCheckLogin()
  const { data, error: fetchError } = useFetchAccounts()

  const { mutateAsync: removeAccount, error: removeError } = useRemoveAccount()
  const [accountToRemove, setAccountToRemove] = useState<Account>()
  const [accountToUpdate, setAccountToUpdate] = useState<Account>()
  const [accountForAssets, setAccountForAssets] =
    useState<AccountWithIncludes>()
  function handleDelete() {
    if (accountToRemove !== undefined) {
      removeAccount(accountToRemove)
      setAccountToRemove(undefined)
    }
  }

  const [asc, setAsc] = useState(true)
  useEffect(() => {
    console.log(asc)
  }, [asc])

  const {
    mutateAsync: createLinkToken,
    data: linkToken,
    status: linkStatus,
    error: createLinkTokenError,
    reset: resetLinkToken,
  } = useCreateLinkToken()

  const {
    mutateAsync: refreshPlaidAccounts,
    status: refreshStatus,
    error: refreshError,
  } = useRefreshPlaidAccounts()

  const {
    mutateAsync: scrape,
    status: scrapeStatus,
    error: scrapeError,
  } = useScrapeEmailsFromFidelityAndUpdateBalances()

  const error = fetchError || removeError || refreshError || scrapeError

  const [showPlaidOptions, setShowPlaidOptions] = useState(false)
  const products: Products[] = [
    Products.Transactions,
    Products.Investments,
    Products.Liabilities,
  ]
  const [selectedProducts, setSelectedProducts] = useState<Products[]>([])

  useEffect(() => {
    if (showPlaidOptions) {
      resetLinkToken()
    }
  }, [resetLinkToken, showPlaidOptions])

  return (
    <>
      <DisplayError error={error?.message} />

      <Stack spacing={2}>
        <Stack direction={{ xs: "column", sm: "row" }} spacing={3}>
          <Button
            startIcon={<AccountBalanceIcon />}
            variant="outlined"
            onClick={() => setShowPlaidOptions(true)}
          >
            Link Accounts and Import Data
          </Button>
          {linkToken !== undefined ? (
            <PlaidLink token={linkToken.link_token} />
          ) : null}
          <Button
            variant="outlined"
            disabled={refreshStatus === "pending"}
            onClick={() => refreshPlaidAccounts()}
          >
            Refresh Accounts
          </Button>
          {login?.isSuperAdmin === true ? (
            <Button
              variant="outlined"
              disabled={scrapeStatus === "pending"}
              onClick={() => scrape()}
            >
              Scrape Fidelity Balances from Emails
            </Button>
          ) : null}
        </Stack>

        <Dialog
          open={showPlaidOptions}
          onClose={() => setShowPlaidOptions(false)}
          fullWidth
          maxWidth="xs"
        >
          <DialogTitle>Link Accounts and Import Data</DialogTitle>
          <DialogContent>
            <Stack spacing={1}>
              <DisplayError error={createLinkTokenError?.message} />
              {products.map((product) => (
                <Box key={product}>
                  <CheckboxBase
                    label={product}
                    value={selectedProducts.includes(product)}
                    onChange={() => {
                      setSelectedProducts((prev) =>
                        prev.includes(product)
                          ? prev.filter((x) => x !== product)
                          : [...prev, product]
                      )
                    }}
                  />
                </Box>
              ))}
              <Stack direction="row" spacing={2}>
                <Button
                  disabled={linkStatus === "pending"}
                  fullWidth
                  size="large"
                  variant="contained"
                  onClick={() => {
                    createLinkToken({ products: selectedProducts }).then(() => {
                      setShowPlaidOptions(false)
                    })
                  }}
                >
                  Continue
                </Button>
                <Button
                  fullWidth
                  size="large"
                  variant="outlined"
                  onClick={() => setShowPlaidOptions(false)}
                >
                  Cancel
                </Button>
              </Stack>
            </Stack>
          </DialogContent>
        </Dialog>

        <ResponsiveTable
          striped
          size="small"
          elevation={4}
          onEdit={(account) => setAccountToUpdate(account)}
          onDelete={(account) => setAccountToRemove(account)}
          rowData={(data || []).sort(
            (a, b) => Math.abs(b.balance) - Math.abs(a.balance)
          )}
          schema={[
            {
              label: "Account",
              render: (account) =>
                `${account.name} ${
                  account.accountType === "Credit_Card" &&
                  account.creditCardType !== null
                    ? displayCreditCardType(account.creditCardType)
                    : displayAccountType(account.accountType)
                }`,
            },
            {
              label: "Last Refreshed (Plaid)",
              render: (account) => (
                <>
                  {(account.plaidCredential?.lastUpdated || null) === null ? (
                    ""
                  ) : (
                    <DisplayDateTime
                      fromNow
                      iso8601={account.plaidCredential?.lastUpdated}
                    />
                  )}
                </>
              ),
            },
            {
              label: "Balance / Value",
              alignRight: true,
              render: function render(account) {
                return <Currency value={account.balance} red />
              },
            },
            {
              label: "Assets",
              render: (account) =>
                account.accountType === "Investment" ? (
                  <Button
                    size="small"
                    variant="outlined"
                    onClick={() => setAccountForAssets(account)}
                  >
                    Manage Assets
                  </Button>
                ) : null,
            },
          ]}
        />
      </Stack>

      <br />
      <br />
      <Button
        onClick={() =>
          setAccountToUpdate({
            id: 0,
            organizationId: organizationId || 0,
            name: "",
            accountType: "Checking_Account",
            balance: 0,
            creditCardType: null,
            accountBucket: "After_Tax",
            plaidCredentialId: null,
            plaidAccountId: null,
          } as Account)
        }
      >
        Add Account
      </Button>
      <AccountDialog
        account={accountToUpdate}
        onClose={() => setAccountToUpdate(undefined)}
      />

      <AssetDialog
        account={accountForAssets}
        onClose={() => setAccountForAssets(undefined)}
      />

      <ConfirmDialog
        open={accountToRemove !== undefined}
        onClose={() => setAccountToRemove(undefined)}
        onAccept={handleDelete}
        message="Are you sure you want to delete account?"
      />

      <BottomStatusBar />
    </>
  )
}

interface PlaidLinkProps {
  token: string
}

function PlaidLink({ token }: PlaidLinkProps) {
  const { mutateAsync: createPlaidCredential } = useCreatePlaidCredential()

  const config: PlaidLinkOptions = {
    onSuccess: (public_token: string, metadata: PlaidLinkOnSuccessMetadata) => {
      createPlaidCredential({ public_token, metadata })
    },
    onExit: (err, metadata) => {},
    onEvent: (eventName, metadata) => {},
    token,
  }
  const { open, exit, ready } = usePlaidLink(config)

  useEffect(() => {
    if (ready) {
      open()
    }
  }, [open, ready])

  return <></>
}
