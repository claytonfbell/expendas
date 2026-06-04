import dayjs, { Dayjs } from "dayjs"

interface GlidePath {
  targetEquityPercentage: number
  targetEquityPercentageAtRetirement: number
  glideMonthsPriorToRetirement: number
  glideMonthsAfterRetirement: number
  retirementDate: string
}

export const temporaryGlidePath: GlidePath = {
  targetEquityPercentage: 0.9,
  targetEquityPercentageAtRetirement: 0.87,
  glideMonthsPriorToRetirement: 3,
  glideMonthsAfterRetirement: 3,
  retirementDate: "2026-06-22",
}

export const customGlidePath: GlidePath = {
  targetEquityPercentage: 0.9,
  targetEquityPercentageAtRetirement: 0.7,
  glideMonthsPriorToRetirement: 12 * 4,
  glideMonthsAfterRetirement: 12 * 10,
  retirementDate: "2034-08-01",
}

// calculate the target equity percentage based on the glide path and the time to retirement
export const getTargetEquityPercentageWithGlidePaths = function (
  forDate: Dayjs
) {
  const glidePath = forDate.isAfter(dayjs("2027-01-01"))
    ? customGlidePath
    : temporaryGlidePath

  const retirementDate = dayjs(glidePath.retirementDate)
  const startOfFirstGlidePeriod = retirementDate.subtract(
    glidePath.glideMonthsPriorToRetirement,
    "month"
  )
  const endOfLastGlidePeriod = retirementDate.add(
    glidePath.glideMonthsAfterRetirement,
    "month"
  )

  if (
    forDate.isBefore(startOfFirstGlidePeriod) ||
    forDate.isAfter(endOfLastGlidePeriod)
  ) {
    return glidePath.targetEquityPercentage
  } else if (
    forDate.isAfter(startOfFirstGlidePeriod) &&
    forDate.isBefore(retirementDate)
  ) {
    const monthsIntoGlide = forDate.diff(startOfFirstGlidePeriod, "month")
    const glideProgress =
      monthsIntoGlide / glidePath.glideMonthsPriorToRetirement
    return (
      glidePath.targetEquityPercentage -
      glideProgress *
        (glidePath.targetEquityPercentage -
          glidePath.targetEquityPercentageAtRetirement)
    )
  } else {
    const monthsIntoGlide = forDate.diff(retirementDate, "month")
    const glideProgress = monthsIntoGlide / glidePath.glideMonthsAfterRetirement
    return (
      glidePath.targetEquityPercentageAtRetirement +
      glideProgress *
        (glidePath.targetEquityPercentage -
          glidePath.targetEquityPercentageAtRetirement)
    )
  }
}
