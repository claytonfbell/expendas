export interface UserPreferencesResponseData {
  user: {
    id: number
    firstName: string | null
    lastName: string | null
    email: string
    receiveDigestEmails: boolean
    digestEmailTimes: number[]
    digestEmailDays: number[]
    timeZone: string
  }
}
