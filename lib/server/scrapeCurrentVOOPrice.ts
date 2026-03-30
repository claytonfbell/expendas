export async function scrapeCurrentVOOPrice(): Promise<number | null> {
  try {
    // const response = await fetch("https://finance.yahoo.com/quote/VOO/")
    // // <span class="price yf-1ommk34 base" data-testid="qsp-price">582.96</span>
    // const priceRegex = /data-testid="qsp-price">(.*?)<\/span>/

    const url = "https://www.cnbc.com/quotes/VOO"
    //<span class="QuoteStrip-lastPrice">585.23</span>
    const priceRegex = /<span class="QuoteStrip-lastPrice">(.*?)<\/span>/

    const response = await fetch(url)

    const html = await response.text()

    const match = html.match(priceRegex)
    const price = match
      ? parseFloat(match[1].trim().replace(/,/g, "")) * 100
      : null

    return price
  } catch (error) {
    console.error("Error scraping VOO price: ", error)
    return null
  }
}
