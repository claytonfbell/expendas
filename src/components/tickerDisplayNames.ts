export const tickerDisplayNames: Record<string, string> = {
  VOO: "S&P 500",
  FBND: "Bond Index",
  VTIP: "TIPS Fund",
  VB: "Small Cap Index",
  VTI: "Total Market Index",
  CASH: "Cash",
}

export function getTickerDisplayName(ticker: string): string {
  return tickerDisplayNames[ticker] || ticker
}
