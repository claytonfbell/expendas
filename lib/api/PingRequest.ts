export interface PingRequest {
  name: string
  groupName: string
  details: string | null
  tag: string | null
  interval: number
  apiKey: string
  progressBar: number | null
  success: boolean
  emails: string[] | null
}
