import { Hidden, IconButton, TableCell } from "@material-ui/core"
import EditIcon from "@material-ui/icons/Edit"
import { useEffect, useState } from "react"
import { AccountIcon, formatMoney, StyledTableRow } from "../pages/planner"
import { IAccount } from "./db/Account"

interface Props {
  account: IAccount
  onEdit: (account: IAccount) => void
}

export default function AccountRow(props: Props) {
  const [state, setState] = useState<IAccount>(props.account)
  useEffect(() => {
    setState(props.account)
  }, [props.account])

  function handleClick() {
    props.onEdit(state)
  }

  return (
    <StyledTableRow key={props.account._id}>
      <TableCell>
        <AccountIcon account={props.account} />
      </TableCell>
      <TableCell>{props.account.name}</TableCell>
      <Hidden xsDown>
        <TableCell>{props.account.type}</TableCell>
        <TableCell>{props.account.creditCardType}</TableCell>
      </Hidden>
      <TableCell align="right">
        {formatMoney(props.account.currentBalance)}
      </TableCell>
      <TableCell>
        <IconButton size="small" onClick={handleClick}>
          <EditIcon />
        </IconButton>
      </TableCell>
    </StyledTableRow>
  )
}
