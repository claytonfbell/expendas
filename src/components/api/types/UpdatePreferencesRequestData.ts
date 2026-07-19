export interface UpdatePreferencesRequestData {
  firstName?: string
  lastName?: string
  receiveDigestEmails?: boolean
  digestEmailTimes?: number[]
  digestEmailDays?: number[]
  timeZone?: string
}
