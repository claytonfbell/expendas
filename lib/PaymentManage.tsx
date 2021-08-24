/* eslint-disable react/display-name */
import { Box } from "@material-ui/core"
import { Payment } from "@prisma/client"
import { Button } from "material-ui-bootstrap"
import React, { useState } from "react"
import { displayAccountType } from "./accountTypes"
import { useFetchPayments, useRemovePayment } from "./api/api"
import ConfirmDialog from "./ConfirmDialog"
import { Currency } from "./Currency"
import DisplayError from "./DisplayError"
import { getRepeatingPaymentFeedback } from "./getRepeatingPaymentFeedback"
import { useGlobalState } from "./GlobalStateProvider"
import { PaymentDialog } from "./PaymentDialog"
import { ResponsiveTable } from "./ResponsiveTable"

export function PaymentManage() {
  const { organizationId } = useGlobalState()
  const { data, error: fetchError } = useFetchPayments(organizationId)

  const { mutateAsync: removePayment, error: removeError } = useRemovePayment()
  const [paymentToRemove, setPaymentToRemove] = useState<Payment>()
  const [paymentToUpdate, setPaymentToUpdate] = useState<Payment>()
  function handleDelete() {
    if (paymentToRemove !== undefined) {
      removePayment(paymentToRemove)
      setPaymentToRemove(undefined)
    }
  }

  const error = fetchError || removeError

  return (
    <>
      <DisplayError error={error} />

      <ResponsiveTable
        onEdit={(payment) => setPaymentToUpdate(payment)}
        onDelete={(payment) => setPaymentToRemove(payment)}
        rowData={(data || []).sort(
          (a, b) => Math.abs(b.amount) - Math.abs(a.amount)
        )}
        schema={[
          {
            headerLabel: "Description",
            render: (payment) => {
              return <>{payment.description}</>
            },
          },
          {
            headerLabel: "Account",
            render: (payment) => {
              return (
                <>
                  {payment.account.name}{" "}
                  {displayAccountType(payment.account.accountType)}
                </>
              )
            },
          },
          {
            headerLabel: "When",
            render: (payment) => {
              return (
                <Box maxWidth={400}>
                  {getRepeatingPaymentFeedback(payment).description}
                </Box>
              )
            },
          },
          {
            headerLabel: "Amount",
            render: (payment) => {
              return <Currency value={payment.amount} green />
            },
          },
        ]}
      />

      <br />
      <Button
        onClick={() =>
          setPaymentToUpdate({
            id: 0,
            accountId: 0,
            description: "",
            amount: 0,
            date: "",
            repeatsOnDates: [],
            repeatsUntilDate: null,
            repeatsOnDaysOfMonth: [],
            repeatsOnMonthsOfYear: [],
            repeatsWeekly: null,
            isPaycheck: false,
          })
        }
      >
        Add Payment
      </Button>
      {paymentToUpdate !== undefined ? (
        <PaymentDialog
          payment={paymentToUpdate}
          onClose={() => setPaymentToUpdate(undefined)}
        />
      ) : null}

      <ConfirmDialog
        open={paymentToRemove !== undefined}
        onClose={() => setPaymentToRemove(undefined)}
        onAccept={handleDelete}
        message="Are you sure you want to delete payment?"
      />
    </>
  )
}
