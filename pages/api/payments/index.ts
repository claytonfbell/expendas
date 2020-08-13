import {
  default as Account,
  default as PaymentMethod,
} from "../../../src/db/Account"
import Payment from "../../../src/db/Payment"
import {
  BadRequestException,
  MethodNotAllowedException,
} from "../../../src/exceptions/HttpException"
import applyMiddleware, {
  NextApiRequestApplied,
  NextApiResponseApplied,
} from "../../../src/middleware/applyMiddleware"
import PaymentRequest from "../../../src/model/PaymentRequest"
import validate from "../../../src/util/validate"

export default async (
  req: NextApiRequestApplied,
  res: NextApiResponseApplied
) => {
  await applyMiddleware(req, res)
  res.build(async () => {
    switch (req.method) {
      case "POST":
        const {
          amount,
          paidTo,
          account,
          when,
          repeatsUntil,
          repeatsOnDaysOfMonth,
          repeatsOnMonthsOfYear,
          repeatsWeekly,
        }: PaymentRequest = req.body

        validate({ paidTo }).min(1)
        validate({ account }).notEmpty()

        const accountModel = await Account.findOne({
          _id: account,
          household: req.household._id,
        })
        if (accountModel === null) {
          throw new BadRequestException("Account missing.")
        }

        Payment.create({
          household: req.household._id,
          amount,
          paidTo,
          account: accountModel._id,
          date: when,
          repeatsUntilDate: repeatsUntil,
          repeatsOnDaysOfMonth,
          repeatsOnMonthsOfYear,
          repeatsWeekly,
        })
        break
      case "GET":
        // seed payment methods
        let appleCard = await PaymentMethod.findOne({ name: "Apple Card" })
        if (appleCard === null) {
          appleCard = await PaymentMethod.create({
            household: req.household.id,
            name: "Apple Card",
            type: "Credit Card",
            creditCardType: "Mastercard",
            currentBalance: -1794.28,
          })
        }

        // seed checking account
        let onpointChecking = await PaymentMethod.findOne({
          name: "Onpoint Checking Account",
        })
        if (onpointChecking === null) {
          onpointChecking = await PaymentMethod.create({
            household: req.household.id,
            name: "Onpoint Checking Account",
            type: "Checking Account",
            creditCardType: null,
            currentBalance: 114.49,
          })
        }

        // seed checking account
        let cashWallet = await PaymentMethod.findOne({
          name: "Cash Wallet",
        })
        if (cashWallet === null) {
          cashWallet = await PaymentMethod.create({
            household: req.household.id,
            name: "Cash Wallet",
            type: "Cash",
            creditCardType: null,
            currentBalance: 120,
          })
        }

        // seed checking account
        let onpointVisa = await PaymentMethod.findOne({
          name: "Onpoint Visa",
        })
        if (onpointVisa === null) {
          onpointVisa = await PaymentMethod.create({
            household: req.household.id,
            name: "Onpoint Visa",
            type: "Credit Card",
            creditCardType: "Visa",
            currentBalance: 0,
          })
        }

        // // seed payments
        // let petCube = await Payment.findOne({ paidTo: "Pet Cube" })
        // if (petCube === null) {
        //   petCube = await Payment.create({
        //     household: req.household._id,
        //     account: appleCard._id,
        //     amount: -5.99,
        //     paidTo: "Pet Cube",
        //     when: moment()
        //       .year(2020)
        //       .month(7)
        //       .date(2)
        //       .hour(0)
        //       .minute(0)
        //       .second(0)
        //       .millisecond(0)
        //       .toDate(),
        //     repeatsUntil: null,
        //     repeatsOnMonthsOfYear: null,
        //     repeatsOnDaysOfMonth: [2],
        //     repeatsWeekly: null,
        //   })
        // }

        // // seed clay's pay days
        // let claysPaycheck = await Payment.findOne({
        //   paidTo: "Clay's Paycheck",
        // })
        // if (claysPaycheck === null) {
        //   claysPaycheck = await Payment.create({
        //     household: req.household._id,
        //     account: onpointChecking._id,
        //     amount: 4500.04,
        //     paidTo: "Clay's Paycheck",
        //     when: moment()
        //       .year(2020)
        //       .month(7)
        //       .date(1)
        //       .hour(0)
        //       .minute(0)
        //       .second(0)
        //       .millisecond(0)
        //       .toDate(),
        //     repeatsUntil: null,
        //     repeatsOnMonthsOfYear: null,
        //     repeatsOnDaysOfMonth: [1, 15],
        //     repeatsWeekly: null,
        //   })
        // }

        // // seed water bill
        // let waterBill = await Payment.findOne({
        //   paidTo: "Portland Water Utility",
        // })
        // if (waterBill === null) {
        //   waterBill = await Payment.create({
        //     household: req.household._id,
        //     account: onpointChecking._id,
        //     amount: -333,
        //     paidTo: "Portland Water Utility",
        //     when: moment()
        //       .year(2020)
        //       .month(3)
        //       .date(17)
        //       .hour(0)
        //       .minute(0)
        //       .second(0)
        //       .millisecond(0)
        //       .toDate(),
        //     repeatsUntil: null,
        //     repeatsOnMonthsOfYear: [0, 3, 6, 9],
        //     repeatsOnDaysOfMonth: [17],
        //     repeatsWeekly: null,
        //   })
        // }

        // // seed door bill
        // let doorBill = await Payment.findOne({
        //   paidTo: "Door Works",
        // })
        // if (doorBill === null) {
        //   doorBill = await Payment.create({
        //     household: req.household._id,
        //     account: onpointChecking._id,
        //     amount: -600,
        //     paidTo: "Door Works",
        //     when: moment()
        //       .year(2020)
        //       .month(7)
        //       .date(6)
        //       .hour(0)
        //       .minute(0)
        //       .second(0)
        //       .millisecond(0)
        //       .toDate(),
        //     repeatsUntil: null,
        //     repeatsOnMonthsOfYear: null,
        //     repeatsOnDaysOfMonth: null,
        //     repeatsWeekly: null,
        //   })
        // }

        // // house keeper
        // let housekeeper = await Payment.findOne({
        //   paidTo: "Orendi Housekeeper",
        // })
        // if (housekeeper === null) {
        //   housekeeper = await Payment.create({
        //     household: req.household._id,
        //     account: onpointChecking._id,
        //     amount: -100,
        //     paidTo: "Orendi Housekeeper",
        //     when: moment()
        //       .year(2020)
        //       .month(7)
        //       .date(14)
        //       .hour(0)
        //       .minute(0)
        //       .second(0)
        //       .millisecond(0)
        //       .toDate(),
        //     repeatsUntil: null,
        //     repeatsOnMonthsOfYear: null,
        //     repeatsOnDaysOfMonth: null,
        //     repeatsWeekly: 2,
        //   })
        // }
        // let housekeeperTip = await Payment.findOne({
        //   paidTo: "Orendi Tip",
        // })
        // if (housekeeperTip === null) {
        //   housekeeperTip = await Payment.create({
        //     household: req.household._id,
        //     account: cashWallet._id,
        //     amount: -20,
        //     paidTo: "Orendi Tip",
        //     when: moment()
        //       .year(2020)
        //       .month(7)
        //       .date(14)
        //       .hour(0)
        //       .minute(0)
        //       .second(0)
        //       .millisecond(0)
        //       .toDate(),
        //     repeatsUntil: null,
        //     repeatsOnMonthsOfYear: null,
        //     repeatsOnDaysOfMonth: null,
        //     repeatsWeekly: 2,
        //   })
        // }

        // let foodCash = await Payment.findOne({
        //   paidTo: "Cash for food",
        // })
        // if (foodCash === null) {
        //   foodCash = await Payment.create({
        //     household: req.household._id,
        //     account: cashWallet._id,
        //     amount: -140,
        //     paidTo: "Cash for food",
        //     when: moment()
        //       .year(2020)
        //       .month(7)
        //       .date(7)
        //       .hour(0)
        //       .minute(0)
        //       .second(0)
        //       .millisecond(0)
        //       .toDate(),
        //     repeatsUntil: null,
        //     repeatsOnMonthsOfYear: null,
        //     repeatsOnDaysOfMonth: null,
        //     repeatsWeekly: 1,
        //   })
        // }

        // // mortgage payment
        // //
        // let mortgage = await Payment.findOne({
        //   paidTo: "Flagstar Mortgage Payment",
        // })
        // if (mortgage === null) {
        //   mortgage = await Payment.create({
        //     household: req.household._id,
        //     account: onpointChecking._id,
        //     amount: -2296.16 + 500,
        //     paidTo: "Flagstar Mortgage Payment",
        //     when: moment()
        //       .year(2020)
        //       .month(7)
        //       .date(1)
        //       .hour(0)
        //       .minute(0)
        //       .second(0)
        //       .millisecond(0)
        //       .toDate(),
        //     repeatsUntil: null,
        //     repeatsOnMonthsOfYear: null,
        //     repeatsOnDaysOfMonth: [1],
        //     repeatsWeekly: null,
        //   })
        // }

        // FETCH ALL PAYMENTS
        const allPayments = await Payment.find({
          household: req.household._id,
        }).populate("account")
        return allPayments.sort(
          (a, b) => Math.abs(b.amount) - Math.abs(a.amount)
        )
        break
      default:
        throw new MethodNotAllowedException()
    }
  })
}
