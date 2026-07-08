# Preferences

Add new page "/preferences" in user menu for managing user preferences with ability to:

- Update profile information
- Change password
- Configure notification settings
  - User can enable with an MUI toggle switch to receive the digest emails.
  - They can select multiple hours (12am to 11pm) for receiving multiple digest emails a day.
  - They can select multiple days of the week for receiving the digest emails.
- User can disable receiving the digest emails entirely with a toggle switch.

## Schema Changes

Add new columns to user table

- receiveDigestEmails (boolean) - default to true
- digestEmailTimes (array of times of day) - default to 6am, and 6pm
- digestEmailDays (array of days of the week) - default to all days of the week

## Schedule Tasks

Add scheduled task to send digest emails to users who have enabled them. The task should:

- Run at the appropriate times based on the user's selected hours and days.
- Query users who have `receiveDigestEmails` set to true and match the current time and day with their `digestEmailTimes` and `digestEmailDays`.
- Send the digest email to each matching user.
- Log the results of the task for monitoring and troubleshooting.

## Digest Email Changes

- Add a small link in the footer to the preferences page so the user can update their email notification settings.