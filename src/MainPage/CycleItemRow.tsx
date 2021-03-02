import { Box, Checkbox, Grid, Link } from "@material-ui/core"
import clsx from "clsx"
import React, { ChangeEvent } from "react"
import { useUpdateCycleItem } from "../api/cycleItems"
import { ICycleItemPopulated } from "../db/CycleItem"
import { IPayment } from "../db/Payment"
import { useAccountBoxStyles } from "./AccountBox"
import { AmountInputTool } from "./AmountInputTool"
import { LargeTooltip } from "./LargeTooltip"

type Props = {
  item: ICycleItemPopulated
  onEditPayment: (payment: IPayment) => void
}

export function CycleItemRow(props: Props) {
  const classes = useAccountBoxStyles()
  const { item } = props

  const [updateCycleItem] = useUpdateCycleItem()

  const handlePaidClick = (item: ICycleItemPopulated) => (
    e: ChangeEvent<HTMLInputElement>
  ) => {
    updateCycleItem({ ...item, isPaid: e.target.checked })
  }

  return (
    <Box
      key={item._id}
      className={clsx(classes.item, item.isPaid ? "paid" : undefined)}
    >
      <Grid container>
        <Grid item xs={8} className={classes.left}>
          <Grid container spacing={2}>
            <Grid item alignContent="flex-start">
              <LargeTooltip
                arrow
                placement="left"
                title="Check if this item has already been settled and no longer impacts your account balance."
              >
                <Checkbox
                  className={classes.checkbox}
                  size="small"
                  checked={item.isPaid}
                  onChange={handlePaidClick(item)}
                />
              </LargeTooltip>
            </Grid>
            <Grid item xs={10}>
              <Link
                color="inherit"
                className={classes.link}
                onClick={() => props.onEditPayment(item.payment)}
              >
                {item.payment.paidTo}
              </Link>
            </Grid>
          </Grid>
        </Grid>
        <Grid item xs={4} className={classes.right}>
          <AmountInputTool
            green={!item.isPaid}
            enabled
            value={item.amount}
            onChange={(x) => updateCycleItem({ ...item, amount: x })}
          />
        </Grid>
      </Grid>
    </Box>
  )
}
