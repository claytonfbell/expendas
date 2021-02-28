import { Box, Checkbox, Fade, Grid, Link } from "@material-ui/core"
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

  const [isHover, setIsHover] = React.useState(false)

  return (
    <Box
      onMouseOver={() => setIsHover(true)}
      onMouseOut={() => setIsHover(false)}
      key={item._id}
      className={clsx(classes.item, item.isPaid ? "paid" : undefined)}
    >
      <Grid container>
        <Grid item xs={9} className={classes.left}>
          <Grid container spacing={1}>
            <Grid item xs={1} alignContent="flex-start">
              <Fade in={isHover}>
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
              </Fade>
            </Grid>
            <Grid item xs={11}>
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
        <Grid item xs={3} className={classes.right}>
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
