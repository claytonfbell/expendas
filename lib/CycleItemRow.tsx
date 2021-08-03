import { Box, Checkbox, Grid, Link, Tooltip } from "@material-ui/core"
import { Payment } from "@prisma/client"
import clsx from "clsx"
import React, { ChangeEvent } from "react"
import { useAccountBoxStyles } from "./AccountBox"
import { AmountInputTool } from "./AmountInputTool"
import { useUpdateItem } from "./api/api"
import { ItemWithIncludes } from "./ItemWithIncludes"

type Props = {
  item: ItemWithIncludes
  onEditPayment: (payment: Payment) => void
}

export function CycleItemRow(props: Props) {
  const classes = useAccountBoxStyles()
  const { item } = props

  const { mutateAsync: updateItem } = useUpdateItem()

  const handlePaidClick =
    (item: ItemWithIncludes) => (e: ChangeEvent<HTMLInputElement>) => {
      updateItem({ ...item, isPaid: e.target.checked })
    }

  return (
    <Box className={clsx(classes.item, item.isPaid ? "paid" : undefined)}>
      <Grid container>
        <Grid item xs={8} className={classes.left}>
          <Grid container spacing={2}>
            <Grid item alignContent="flex-start">
              <Tooltip
                placement="left"
                title="Check if this item has already been settled and no longer impacts your account balance."
              >
                <Checkbox
                  className={classes.checkbox}
                  size="small"
                  checked={item.isPaid}
                  onChange={handlePaidClick(item)}
                />
              </Tooltip>
            </Grid>
            <Grid item xs={10}>
              <Link
                color="inherit"
                className={classes.link}
                onClick={() => props.onEditPayment(item.payment)}
              >
                {item.payment.description}
              </Link>
            </Grid>
          </Grid>
        </Grid>
        <Grid item xs={4} className={classes.right}>
          <AmountInputTool
            green={!item.isPaid}
            enabled
            value={item.amount}
            onChange={(x) => updateItem({ ...item, amount: x })}
          />
        </Grid>
      </Grid>
    </Box>
  )
}
