import { Grid, IconButton, TableCell } from "@material-ui/core"
import SaveIcon from "@material-ui/icons/Save"
import CurrencyField from "material-ui-pack/dist/CurrencyField"
import Form from "material-ui-pack/dist/Form"
import React from "react"
import { StyledTableRow } from "../pages/planner"
import { useAccount } from "./AccountProvider"
import { IAccount } from "./db/Account"

interface Props {
  account: IAccount
}

export default function AccountRow(props: Props) {
  const [state, setState] = React.useState<IAccount>(props.account)
  const [busy, setBusy] = React.useState(false)
  React.useEffect(() => {
    setState(props.account)
  }, [props.account])

  const { updateAccount } = useAccount()

  function handleSubmit() {
    setBusy(true)
    updateAccount(state).finally(() => setBusy(false))
  }

  return (
    <StyledTableRow key={props.account._id}>
      <TableCell>{props.account.name}</TableCell>
      <TableCell>{props.account.type}</TableCell>
      <TableCell>{props.account.creditCardType}</TableCell>
      <TableCell align="right" style={{ maxWidth: 80 }}>
        <Form
          state={state}
          setState={setState}
          onSubmit={handleSubmit}
          busy={busy}
        >
          <Grid container>
            <Grid item xs={9}>
              <CurrencyField
                name={`currentBalance`}
                label=""
                allowNegative
                inPennies
                alignRight
              />
            </Grid>
            <Grid item xs={3}>
              <IconButton onClick={handleSubmit} disabled={busy}>
                <SaveIcon />
              </IconButton>
            </Grid>
          </Grid>
        </Form>
      </TableCell>
    </StyledTableRow>
  )
}
