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
