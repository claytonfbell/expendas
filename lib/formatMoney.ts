export function formatMoney(input: number, round = false) {
  return new Intl.NumberFormat("en-US", {
    style: "currency",
    currency: "USD",
    maximumFractionDigits: round ? 0 : 2,
  }).format(input / 100)
}
