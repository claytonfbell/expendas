import AccountBalanceIcon from "@mui/icons-material/AccountBalance"
import AccountTreeIcon from "@mui/icons-material/AccountTree"
import AddTaskIcon from "@mui/icons-material/AddTask"
import AddTaskOutlinedIcon from "@mui/icons-material/AddTaskOutlined"
import AssessmentIcon from "@mui/icons-material/Assessment"
import AssessmentOutlinedIcon from "@mui/icons-material/AssessmentOutlined"
import EventNoteIcon from "@mui/icons-material/EventNote"
import EventNoteOutlinedIcon from "@mui/icons-material/EventNoteOutlined"
import MonetizationOnIcon from "@mui/icons-material/MonetizationOn"
import MonetizationOnOutlinedIcon from "@mui/icons-material/MonetizationOnOutlined"
import PaymentsIcon from "@mui/icons-material/Payments"
import ReceiptLongIcon from "@mui/icons-material/ReceiptLong"
import RestaurantIcon from "@mui/icons-material/Restaurant"
import RestaurantOutlinedIcon from "@mui/icons-material/RestaurantOutlined"
import SavingsIcon from "@mui/icons-material/Savings"
import SavingsOutlinedIcon from "@mui/icons-material/SavingsOutlined"
import ShowChartIcon from "@mui/icons-material/ShowChart"
import ShowChartOutlinedIcon from "@mui/icons-material/ShowChartOutlined"
import React from "react"

export type NavigationLink = {
  label: string
  xsLabel?: string
  mdLabel?: string
  href: string
  ActiveIcon: React.ElementType
  Icon: React.ElementType
  navs: ("top-desktop" | "bottom-mobile")[]
}

export const navigationLinks: NavigationLink[] = [
  {
    label: "Ledger",
    href: "/",
    ActiveIcon: EventNoteIcon,
    Icon: EventNoteOutlinedIcon,
    navs: ["top-desktop", "bottom-mobile"],
  },
  {
    label: "Tasks",
    href: "/tasks",
    ActiveIcon: AddTaskIcon,
    Icon: AddTaskOutlinedIcon,
    navs: ["top-desktop", "bottom-mobile"],
  },
  {
    label: "Meals Out",
    href: "/mealsOut",
    ActiveIcon: RestaurantIcon,
    Icon: RestaurantOutlinedIcon,
    navs: ["top-desktop", "bottom-mobile"],
  },
  {
    label: "Investments",
    href: "/investments",
    ActiveIcon: AssessmentIcon,
    Icon: AssessmentOutlinedIcon,
    navs: ["top-desktop", "bottom-mobile"],
  },
  {
    label: "Fixed Income",
    xsLabel: "Fixed Inc.",
    mdLabel: "Fixed",
    href: "/fixedIncome",
    ActiveIcon: MonetizationOnIcon,
    Icon: MonetizationOnOutlinedIcon,
    navs: [],
  },
  {
    label: "Trends",
    href: "/trends",
    ActiveIcon: ShowChartIcon,
    Icon: ShowChartOutlinedIcon,
    navs: ["top-desktop", "bottom-mobile"],
  },
  {
    label: "Retirement",
    href: "/retirement",
    ActiveIcon: SavingsIcon,
    Icon: SavingsOutlinedIcon,
    navs: ["top-desktop"],
  },
  {
    label: "Accounts",
    href: "/accounts",
    ActiveIcon: AccountBalanceIcon,
    Icon: AccountBalanceIcon,
    navs: [],
  },
  {
    label: "Payments",
    href: "/payments",
    ActiveIcon: PaymentsIcon,
    Icon: PaymentsIcon,
    navs: [],
  },
  {
    label: "Receipts",
    href: "/receipts",
    ActiveIcon: ReceiptLongIcon,
    Icon: ReceiptLongIcon,
    navs: [],
  },
  {
    label: "Tax Records",
    href: "/taxes",
    ActiveIcon: AccountTreeIcon,
    Icon: AccountTreeIcon,
    navs: [],
  },
]
