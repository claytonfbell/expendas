import { Box } from "@mui/material"
import { useEffect, useState } from "react"

const EMBED_SCRIPT_ID = "it-9ad1f"
const EMBED_SCRIPT_SRC =
  "https://dev-secure.interactiveticketing.com/2.0/0a2f15/api/v60-dev/embed.js?cn=it-9ad1f"

export function Test2() {
  const [loaded, setLoaded] = useState(false)

  useEffect(() => {
    if (loaded) return
    setLoaded(true)

    if (document.getElementById(EMBED_SCRIPT_ID)) return

    const script = document.createElement("script")
    script.id = EMBED_SCRIPT_ID
    script.src = EMBED_SCRIPT_SRC

    const firstScript = document.getElementsByTagName("script")[0]
    if (firstScript) {
      firstScript.parentNode?.insertBefore(script, firstScript)
    } else {
      document.head.appendChild(script)
    }
  }, [loaded])

  return (
    <Box>
      <div className="it-9ad1f" />
    </Box>
  )
}
