import {
  Checkbox,
  Collapse,
  FormControl,
  FormControlLabel,
  Grid,
  IconButton,
  makeStyles,
  TableCell,
} from "@material-ui/core"
import CloseIcon from "@material-ui/icons/Close"
import EditIcon from "@material-ui/icons/Edit"
import SaveIcon from "@material-ui/icons/Save"
import CurrencyField from "material-ui-pack/dist/CurrencyField"
import Form from "material-ui-pack/dist/Form"
import React from "react"
import { formatMoney, StyledTableRow } from "../pages/planner"
import { useCycle } from "./CycleProvider"
import { ICycleItem } from "./db/CycleItem"
const useStyles = makeStyles({
  root: {
    "& input": {
      textAlign: "right",
    },
  },
})

interface Props {
  cycleItem: ICycleItem
}

export default function CycleItem(props: Props) {
  const classes = useStyles()
  const [state, setState] = React.useState<ICycleItem>(props.cycleItem)
  React.useEffect(() => {
    setState(props.cycleItem)
  }, [props.cycleItem])

  const { updateCycleItem, busy } = useCycle()

  function handleSubmit() {
    updateCycleItem(state)
  }

  const [edit, setEdit] = React.useState(false)

  return (
    <StyledTableRow className={classes.root}>
      <TableCell>{props.cycleItem.payment.paidTo}</TableCell>
      <TableCell>{props.cycleItem.payment.account.name}</TableCell>
      <TableCell
        align="right"
        style={{
          maxWidth: 120,
          fontWeight: props.cycleItem.amount > 0 ? "bold" : undefined,
          color: props.cycleItem.amount > 0 ? "green" : undefined,
        }}
      >
        <Form
          busy={busy}
          size="small"
          state={state}
          setState={setState}
          onSubmit={handleSubmit}
        >
          <Collapse in={!edit}>
            <Grid container alignItems="center">
              <Grid item xs={8}>
                {formatMoney(props.cycleItem.amount)}
              </Grid>
              <Grid item xs={2}></Grid>
              <Grid item xs={2}>
                <IconButton size="small" onClick={() => setEdit(!edit)}>
                  <EditIcon />
                </IconButton>
              </Grid>
            </Grid>
          </Collapse>
          <Collapse in={edit}>
            <Grid container alignItems="center">
              <Grid item xs={8}>
                <CurrencyField name="amount" label="" allowNegative />
              </Grid>
              <Grid item xs={2}>
                <IconButton size="small" onClick={handleSubmit}>
                  <SaveIcon />
                </IconButton>
              </Grid>
              <Grid item xs={2}>
                <IconButton size="small" onClick={() => setEdit(!edit)}>
                  <CloseIcon />
                </IconButton>
              </Grid>
            </Grid>
          </Collapse>
        </Form>
      </TableCell>
      <TableCell>
        <FormControl>
          <FormControlLabel
            control={<Checkbox checked={state.isPaid} />}
            onChange={(e: React.ChangeEvent<HTMLInputElement>, checked) => {
              setState((x: any) => ({ ...x, isPaid: checked }))
              // eslint-disable-next-line @typescript-eslint/ban-ts-comment
              // @ts-ignore
              updateCycleItem({ ...state, isPaid: checked })
            }}
            label="Paid"
          />
        </FormControl>
      </TableCell>
    </StyledTableRow>
  )
}
