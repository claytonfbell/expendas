import { Ping } from "@prisma/client"
import { MonitorItem } from "./MonitorResponse"
export interface FetchMonitorItemResponse {
  pings: Ping[]
  monitorItem: MonitorItem
}
