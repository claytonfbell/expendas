import humanizeDuration from "humanize-duration"
import moment, { Moment } from "moment"

export function formatFromNow(dateTime: string | Date | Moment) {
  const mom = moment(dateTime)
  const timeDiff = mom.diff(moment())

  return `${timeDiff > 0 ? "in " : ""}${formatDuration(timeDiff)}${
    timeDiff < 0 ? " ago" : ""
  }`
}

export function formatDuration(timeDiff: number) {
  let str = humanizeDuration(timeDiff, {
    units: ["d", "h", "m"],
    round: true,
  })

  // use seconds unit of measure
  if (str === "0 minutes" || str === "1 minute") {
    str = humanizeDuration(timeDiff, {
      units: ["d", "h", "m", "s"],
      round: true,
    })
  }
  console.log(str)

  return str
}
