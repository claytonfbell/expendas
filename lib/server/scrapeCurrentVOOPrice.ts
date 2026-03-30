export async function scrapeCurrentVOOPrice(): Promise<number | null> {
  try {
    // from cnbc (yahoo and fideliety use javascript for anti-scraping)
    const url = "https://www.cnbc.com/quotes/VOO"
    //<span class="QuoteStrip-lastPrice">585.23</span>
    const priceRegex = /<span class="QuoteStrip-lastPrice">.*?<\/span>/g

    const response = await fetch(url)
    const html = await response.text()
    const matches = html.match(priceRegex)
    if (matches && matches.length > 0) {
      const regex = /<span class="QuoteStrip-lastPrice">(.*?)<\/span>/
      const match = matches[matches.length - 1].match(regex)
      if (match && match.length > 1) {
        const priceStr = match[1].replace(/,/g, "")
        const price = parseFloat(priceStr)
        return price
      }
    }
    return null
  } catch (error) {
    console.error("Error scraping VOO price: ", error)
    return null
  }
}
