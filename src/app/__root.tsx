import { CacheProvider } from "@emotion/react"
import CssBaseline from "@mui/material/CssBaseline"
import { ThemeProvider } from "@mui/material/styles"
import { QueryClient, QueryClientProvider } from "@tanstack/react-query"
import {
  createRootRoute,
  HeadContent,
  Outlet,
  Scripts,
} from "@tanstack/react-router"
import { DarkModeProvider, useDarkMode } from "material-ui-pack"
import React, { Suspense } from "react"
import rest from "../components/api/rest"
import createEmotionCache from "../components/createEmotionCache"
import theme, { PRIMARY_COLOR } from "../components/theme"

const clientSideEmotionCache = createEmotionCache()
const queryClient = new QueryClient({
  defaultOptions: { queries: { refetchOnWindowFocus: true } },
})

rest.setBaseURL("/api")

export const Route = createRootRoute({
  head: () => ({
    meta: [
      { charSet: "utf-8" },
      { name: "viewport", content: "initial-scale=1, width=device-width" },
      { name: "theme-color", content: PRIMARY_COLOR },
      { property: "og:image", content: "/social.png" },
      { title: "Expendas" },
    ],
    links: [
      {
        rel: "stylesheet",
        href: "https://fonts.googleapis.com/css?family=Roboto:300,400,500,700&display=swap",
      },
      { rel: "icon", href: "/favicon-32x32.png" },
    ],
  }),
  component: RootLayout,
})

function RootLayout() {
  return (
    <html lang="en">
      <head>
        <HeadContent />
      </head>
      <body>
        <CacheProvider value={clientSideEmotionCache}>
          <QueryClientProvider client={queryClient}>
            <DarkModeProvider>
              <MyThemeProvider>
                <CssBaseline />
                <Suspense fallback={null}>
                  <Outlet />
                </Suspense>
              </MyThemeProvider>
            </DarkModeProvider>
          </QueryClientProvider>
        </CacheProvider>
        <Scripts />
      </body>
    </html>
  )
}

function MyThemeProvider(props: { children: React.ReactNode }) {
  const { createMuiThemeWithDarkMode, darkMode } = useDarkMode()
  const myTheme = createMuiThemeWithDarkMode({
    ...theme,
    palette: {
      ...theme.palette,
      background: {
        default: darkMode ? "#000" : "#f5f5f5",
        paper: darkMode ? "#121212" : "#fff",
      },
    },
  })
  return <ThemeProvider theme={myTheme}>{props.children}</ThemeProvider>
}
