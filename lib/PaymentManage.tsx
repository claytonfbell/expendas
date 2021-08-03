import {
  IconButton,
  Paper,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
} from "@material-ui/core"
import DeleteIcon from "@material-ui/icons/Delete"
import EditIcon from "@material-ui/icons/Edit"
import { Payment } from "@prisma/client"
import { Button } from "material-ui-bootstrap"
import React, { useState } from "react"
import { useFetchPayments, useRemovePayment } from "./api/api"
import ConfirmDialog from "./ConfirmDialog"
import { Currency } from "./Currency"
import DisplayError from "./DisplayError"
import { getRepeatingPaymentFeedback } from "./getRepeatingPaymentFeedback"
import { useGlobalState } from "./GlobalStateProvider"
import { PaymentDialog } from "./PaymentDialog"

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
      <TableContainer component={Paper}>
        <Table>
          <TableHead>
            <TableRow>
              <TableCell>Description</TableCell>
              <TableCell>When</TableCell>
              <TableCell>Amount</TableCell>
              <TableCell></TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {(data || []).map((payment) => (
              <TableRow key={payment.id}>
                <TableCell>{payment.description}</TableCell>
                <TableCell>
                  {getRepeatingPaymentFeedback(payment).description}
                </TableCell>
                <TableCell>
                  <Currency value={payment.amount} green />
                </TableCell>
                <TableCell>
                  <IconButton onClick={() => setPaymentToUpdate(payment)}>
                    <EditIcon />
                  </IconButton>
                  <IconButton onClick={() => setPaymentToRemove(payment)}>
                    <DeleteIcon />
                  </IconButton>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </TableContainer>

      <br />
      <br />
      <Button
        onClick={() =>
          setPaymentToUpdate({
            id: 0,
            accountId: 0,
            description: "",
            amount: 0,
            date: "",
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
