import chroma from "chroma-js"

export function adjustColorForAACompliance(
  primaryColor: string,
  minimumContrast: number,
  mode: "dark" | "light"
) {
  if (!chroma.valid(primaryColor)) {
    // avoid "Uncaught Error: unknown format" error in subsequent process
    return primaryColor
  }
  let adjustedPrimaryColor = primaryColor
  const maxLoops = 100
  let loopCount = 0

  // minimum contrast with black if dark mode
  if (mode === "dark") {
    while (
      chroma.contrast(adjustedPrimaryColor, "#000000") < minimumContrast &&
      loopCount < maxLoops
    ) {
      adjustedPrimaryColor = chroma(adjustedPrimaryColor).brighten(0.05).hex()
      //-->console.log(`contrast: ${chroma.contrast(adjustedPrimaryColor, "#000000")}`)
      loopCount++
    }
  } else {
    // minimum contrast with white
    while (
      chroma.contrast(adjustedPrimaryColor, "#ffffff") < minimumContrast &&
      loopCount < maxLoops
    ) {
      adjustedPrimaryColor = chroma(adjustedPrimaryColor).darken(0.05).hex()
      //-->console.log(`contrast: ${chroma.contrast(adjustedPrimaryColor, "#ffffff")}`)
      loopCount++
    }
  }

  return adjustedPrimaryColor
}
