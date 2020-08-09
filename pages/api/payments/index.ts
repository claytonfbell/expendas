import moment from "moment"
import mongoose from "mongoose"
import { MethodNotAllowedException } from "../../../src/exceptions/HttpException"
import applyMiddleware, {
  NextApiRequestApplied,
  NextApiResponseApplied,
} from "../../../src/middleware/applyMiddleware"
import ExpendasSessionData from "../../../src/model/ExpendasSessionData"
import Household from "../../../src/model/Household"
import Payment from "../../../src/model/Payment"
import PaymentMethod from "../../../src/model/PaymentMethod"

export default async (
  req: NextApiRequestApplied,
  res: NextApiResponseApplied
) => {
  await applyMiddleware(req, res)
  res.build(async () => {
    switch (req.method) {
      case "GET":
        // household

        console.log("here")
        const sessionData: ExpendasSessionData = req.session.data
        const household = await Household.findOne({
          _id: sessionData.householdId,
        })

        // seed payment methods
        let appleCard = await PaymentMethod.findOne({ name: "Apple Card" })
        if (appleCard === null) {
          appleCard = await PaymentMethod.create({
            household: household.id,
            name: "Apple Card",
            type: "Credit Card",
            creditCardType: "Mastercard",
          })
        }

        // seed checking account
        let checkingAccount = await PaymentMethod.findOne({
          name: "Checking Account",
        })
        if (checkingAccount === null) {
          checkingAccount = await PaymentMethod.create({
            household: household.id,
            name: "Checking Account",
            type: "Check",
            creditCardType: null,
          })
        }

        // seed paycheck
        let paycheckDeposit = await PaymentMethod.findOne({
          name: "Paycheck Deposit",
        })
        if (paycheckDeposit === null) {
          paycheckDeposit = await PaymentMethod.create({
            household: household.id,
            name: "Paycheck Deposit",
            type: "Paycheck",
            creditCardType: null,
          })
        }

        // seed payments
        let petCube = await Payment.findOne({ paidTo: "Pet Cube" })
        if (petCube === null) {
          petCube = await Payment.create({
            household: household._id,
            method: appleCard._id,
            amount: 5.99,
            paidTo: "Pet Cube",
            when: moment()
              .year(2020)
              .month(7)
              .date(2)
              .hour(0)
              .minute(0)
              .second(0)
              .millisecond(0)
              .toDate(),
            repeatsUntil: null,
            repeatsOnMonthsOfYear: null,
            repeatsOnDaysOfMonth: [2],
            repeatsWeekly: null,
            repeatsDayOfWeek: null,
          })
        }

        // seed clay's pay days
        let claysPaycheck = await Payment.findOne({
          method: paycheckDeposit._id,
        })
        if (claysPaycheck === null) {
          claysPaycheck = await Payment.create({
            household: household._id,
            method: paycheckDeposit._id,
            amount: 4500.04,
            paidTo: "Clay's Paycheck",
            when: moment()
              .year(2020)
              .month(7)
              .date(1)
              .hour(0)
              .minute(0)
              .second(0)
              .millisecond(0)
              .toDate(),
            repeatsUntil: null,
            repeatsOnMonthsOfYear: null,
            repeatsOnDaysOfMonth: [1, 15],
            repeatsWeekly: null,
            repeatsDayOfWeek: null,
          })
        }

        // seed water bill
        let waterBill = await Payment.findOne({
          paidTo: "Portland Water Utility",
        })
        if (waterBill === null) {
          waterBill = await Payment.create({
            household: household._id,
            method: checkingAccount._id,
            amount: 333,
            paidTo: "Portland Water Utility",
            when: moment()
              .year(2020)
              .month(3)
              .date(17)
              .hour(0)
              .minute(0)
              .second(0)
              .millisecond(0)
              .toDate(),
            repeatsUntil: null,
            repeatsOnMonthsOfYear: [1, 4, 7, 10],
            repeatsOnDaysOfMonth: [17],
            repeatsWeekly: null,
            repeatsDayOfWeek: null,
          })
        }

        // FETCH ALL PAYMENTS
        const allPayments = await Payment.find().populate("method")

        mongoose.disconnect()

        return allPayments
        break
      default:
        throw new MethodNotAllowedException()
    }
  })
}
