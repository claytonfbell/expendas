import { Ping, PingSetup } from "@prisma/client"
import moment from "moment"
import { MonitorItem, MonitorStatus } from "../api/MonitorResponse"

type PingSetupWithIncludes = PingSetup & {
  lastPing: Ping | null
  lastSuccessfulPing: Ping | null
}

export async function buildMonitorItem(ps: PingSetupWithIncludes) {
  const { lastPing, lastSuccessfulPing, ...pingSetup } = ps

  if (lastPing !== null && lastSuccessfulPing !== null) {
    let status: MonitorStatus = "failed"
    const due: Date = moment().subtract(lastPing.interval, "minutes").toDate()
    if (lastSuccessfulPing.time > due) {
      status = "ok"
    }

    const item: MonitorItem = {
      pingSetup,
      lastPing,
      lastSuccessfulPing,
      status,
      nextDue: moment(lastSuccessfulPing.time)
        .add(lastPing.interval, "minutes")
        .toISOString(),
    }
    return item
  }
  return null
}
