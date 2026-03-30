export async function scrapeCurrentVOOPrice(): Promise<number | null> {
  try {
    // from cnbc (yahoo and fideliety use javascript for anti-scraping)
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
