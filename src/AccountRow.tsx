import { IconButton, TableCell } from "@material-ui/core"
import EditIcon from "@material-ui/icons/Edit"
import React from "react"
import { StyledTableRow } from "../pages/planner"
import { useAccount } from "./AccountProvider"
import { IAccount } from "./db/Account"

interface Props {
  account: IAccount
  onEdit: (account: IAccount) => void
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

  function handleClick() {
    props.onEdit(state)
  }

  return (
    <StyledTableRow key={props.account._id}>
      <TableCell>{props.account.name}</TableCell>
      <TableCell>{props.account.type}</TableCell>
      <TableCell>{props.account.creditCardType}</TableCell>
      <TableCell>
        <IconButton onClick={handleClick}>
          <EditIcon />
        </IconButton>
      </TableCell>
    </StyledTableRow>
  )
}
