import moment, { Moment } from "moment"

const hits: Hit[] = []

export class RateLimit {
  private name: string
  private options: LimitOption[]

  constructor(name: string, options: LimitOption[]) {
    this.name = name
    this.options = options
  }

  isRateLimited(): boolean {
    const now = moment()

    // remove hits that are outside the longest time window
    const longestDurationMs = Math.max(...this.options.map((o) => o.durationMs))
    const timeAgo = now.clone().subtract(longestDurationMs, "milliseconds")
    while (hits.length > 0 && hits[0].moment.isBefore(timeAgo)) {
      hits.shift()
    }

    // check if any of the options have been exceeded
    for (const option of this.options) {
      const hitsInWindow = hits.filter(
        (hit) =>
          hit.name === this.name &&
          hit.moment.isAfter(
            now.clone().subtract(option.durationMs, "milliseconds")
          )
      ).length
      if (hitsInWindow >= option.max) {
        return true
      }
    }

    // record the hit
    hits.push({ name: this.name, moment: now })
    return false
  }
}

type Hit = {
  moment: Moment
  name: string
}

type LimitOption = {
  max: number
  durationMs: number
}
