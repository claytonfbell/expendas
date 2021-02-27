import { Grid, Link } from "@material-ui/core"
import clsx from "clsx"
import React, { ChangeEvent, useState } from "react"
import { useUpdateCycleItem } from "../api/cycleItems"
import { ICycleItemPopulated } from "../db/CycleItem"
import { IPayment } from "../db/Payment"
import { AmountInput } from "./AmountInput"
import { Currency } from "./Currency"
import { LargeTooltip } from "./LargeTooltip"
import { usePlannerStyles } from "./usePlannerStyles"

export function CycleItemRow({
  item,
  onEditPayment,
}: {
  item: ICycleItemPopulated
  onEditPayment: (payment: IPayment) => void
}) {
  const classes = usePlannerStyles()
  //   const { updateCycleItem } = useCycle()
  const [updateCycleItem] = useUpdateCycleItem()

  const handlePaidClick = (item: ICycleItemPopulated) => (
    e: ChangeEvent<HTMLInputElement>
  ) => {
    updateCycleItem({ ...item, isPaid: e.target.checked })
  }

  const [editAmount, setEditAmount] = useState<number>()

  function handleUpdateAmount(amount: number) {
    updateCycleItem({ ...item, amount })
    setEditAmount(undefined)
  }

  return (
    <>
      <Grid
        container
        spacing={0}
        justify="space-between"
        key={item._id}
        className={clsx(classes.row, item.isPaid ? classes.isPaid : undefined)}
        wrap="nowrap"
      >
        <Grid item className={classes.leftCell}>
          <Link
            href="javascript:;"
            onClick={() =>
              onEditPayment({
                ...item.payment,
                account: item.payment.account._id,
              })
            }
            className={classes.itemLink}
          >
            {item.payment.paidTo}
          </Link>
        </Grid>
        <Grid item className={classes.rightCell}>
          {editAmount === undefined ? (
            <>
              {
                <LargeTooltip
                  arrow
                  placement="left"
                  title="Check if this item has already been settled and no longer impacts your account balance."
                >
                  <input
                    type="checkbox"
                    checked={item.isPaid}
                    onChange={handlePaidClick(item)}
                  />
                </LargeTooltip>
              }
              <Link
                href="javascript:;"
                onClick={() => setEditAmount(item.amount)}
                className={classes.itemLink}
              >
                <Currency value={item.amount} green />
              </Link>
            </>
          ) : (
            <AmountInput value={editAmount} onChange={handleUpdateAmount} />
          )}
        </Grid>
      </Grid>
    </>
  )
}
