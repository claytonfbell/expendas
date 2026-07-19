import dayjs from "dayjs"
import advancedFormat from "dayjs/plugin/advancedFormat"
import customParseFormat from "dayjs/plugin/customParseFormat"
import isBetween from "dayjs/plugin/isBetween"
import isSameOrAfter from "dayjs/plugin/isSameOrAfter"
import isSameOrBefore from "dayjs/plugin/isSameOrBefore"
import localeData from "dayjs/plugin/localeData"
import timezone from "dayjs/plugin/timezone"
import utc from "dayjs/plugin/utc"

dayjs.extend(utc)
dayjs.extend(timezone)
dayjs.extend(advancedFormat)
dayjs.extend(localeData)
dayjs.extend(isBetween)
dayjs.extend(isSameOrBefore)
dayjs.extend(isSameOrAfter)
dayjs.extend(customParseFormat)

export default dayjs
export type { Dayjs } from "dayjs"
