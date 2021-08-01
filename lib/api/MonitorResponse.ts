import { Ping, PingSetup } from "@prisma/client"

export interface MonitorResponse {
  groups: MonitorGroup[]
}

export interface MonitorGroup {
  groupName: string
  items: MonitorItem[]
}

export interface MonitorItem {
  status: MonitorStatus
  pingSetup: PingSetup
  lastPing: Ping
  lastSuccessfulPing: Ping
  nextDue: string
}

export type MonitorStatus = "ok" | "failed"
