import dayjs, { Dayjs } from "../dayjs"

const hits: Hit[] = []

export class RateLimit {
  private name: string
  private options: LimitOption[]

  constructor(name: string, options: LimitOption[]) {
    this.name = name
    this.options = options
  }

  isRateLimited(): boolean {
    const now = dayjs()

    // remove hits that are outside the longest time window
    const longestDurationMs = Math.max(...this.options.map((o) => o.durationMs))
    const timeAgo = now.clone().subtract(longestDurationMs, "milliseconds")
    while (hits.length > 0 && hits[0].dayjs.isBefore(timeAgo)) {
      hits.shift()
    }

    // check if any of the options have been exceeded
    for (const option of this.options) {
      const hitsInWindow = hits.filter(
        (hit) =>
          hit.name === this.name &&
          hit.dayjs.isAfter(
            now.clone().subtract(option.durationMs, "milliseconds")
          )
      )
      if (hitsInWindow.length >= option.max) {
        console.log(
          `Rate limit exceeded for ${this.name}: ${hitsInWindow.length} hits in the last ${option.durationMs} ms`
        )
        console.log(
          hitsInWindow.map((hit) => hit.dayjs.toISOString()).join(", ")
        )
        return true
      }
    }

    // record the hit
    hits.push({ name: this.name, dayjs: now })
    return false
  }
}

type Hit = {
  dayjs: Dayjs
  name: string
}

type LimitOption = {
  max: number
  durationMs: number
}
