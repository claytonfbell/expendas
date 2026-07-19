import {
  Box,
  FormControl,
  InputLabel,
  MenuItem,
  Paper,
  Select,
  ThemeProvider,
  Typography,
  createTheme,
} from "@mui/material"
import React, { useEffect, useMemo, useState } from "react"
import { useFetchApiKeys } from "./api/hooks/useFetchApiKeys"

const lightTheme = createTheme({ palette: { mode: "light" } })

export function ApiDocsView() {
  const { data: keys } = useFetchApiKeys()
  const [selectedKeyId, setSelectedKeyId] = useState<number | "">("")
  const [spec, setSpec] = useState<any>(null)
  const [loaded, setLoaded] = useState(false)

  const selectedApiKey = useMemo(() => {
    if (selectedKeyId === "") return null
    const found = keys.find((k) => k.id === selectedKeyId)
    return found ? found.key : null
  }, [keys, selectedKeyId])

  useEffect(() => {
    fetch("/api/openapi")
      .then((r) => r.json())
      .then(setSpec)
  }, [])

  useEffect(() => {
    if (!spec || loaded) return
    setLoaded(true)

    const link = document.createElement("link")
    link.rel = "stylesheet"
    link.href = "https://unpkg.com/swagger-ui-dist@5/swagger-ui.css"
    document.head.appendChild(link)

    const script = document.createElement("script")
    script.src = "https://unpkg.com/swagger-ui-dist@5/swagger-ui-bundle.js"
    script.onload = () => {
      ;(window as any).SwaggerUIBundle({
        spec,
        dom_id: "#swagger-ui",
        presets: [(window as any).SwaggerUIBundle.presets.apis],
        requestInterceptor: (req: any) => {
          if (selectedApiKey) {
            req.headers["Authorization"] = `Bearer ${selectedApiKey}`
          }
          return req
        },
      })
    }
    document.body.appendChild(script)
  }, [spec, loaded])

  useEffect(() => {
    if (loaded && (window as any).SwaggerUIBundle) {
      const currentSpec = spec
      if (currentSpec) {
        ;(window as any).SwaggerUIBundle({
          spec: currentSpec,
          dom_id: "#swagger-ui",
          presets: [(window as any).SwaggerUIBundle.presets.apis],
          requestInterceptor: (req: any) => {
            if (selectedApiKey) {
              req.headers["Authorization"] = `Bearer ${selectedApiKey}`
            }
            return req
          },
        })
      }
    }
  }, [selectedApiKey])

  return (
    <ThemeProvider theme={lightTheme}>
      <Paper sx={{ p: 2 }}>
        <Box sx={{ display: "flex", alignItems: "center", gap: 2, mb: 2 }}>
          <Typography variant="h6" sx={{ whiteSpace: "nowrap" }}>
            REST API Documentation
          </Typography>
          <FormControl size="small" sx={{ minWidth: 300 }}>
            <InputLabel>API Key for Testing</InputLabel>
            <Select
              value={selectedKeyId}
              label="API Key for Testing"
              onChange={(e) => setSelectedKeyId(e.target.value as number | "")}
            >
              <MenuItem value="">
                <em>No API key</em>
              </MenuItem>
              {keys.map((k) => (
                <MenuItem key={k.id} value={k.id}>
                  {k.key.slice(0, 8)}…
                </MenuItem>
              ))}
            </Select>
          </FormControl>
        </Box>
        <Box id="swagger-ui" />
      </Paper>
    </ThemeProvider>
  )
}
