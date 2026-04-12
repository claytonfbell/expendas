import { CacheProvider, EmotionCache } from "@emotion/react"
import CssBaseline from "@mui/material/CssBaseline"
import { ThemeProvider } from "@mui/material/styles"
import { QueryClient, QueryClientProvider } from "@tanstack/react-query"
import { DarkModeProvider, useDarkMode } from "material-ui-pack"
import { AppProps } from "next/app"
import Head from "next/head"
import createEmotionCache from "../lib/createEmotionCache"
import theme from "../lib/theme"

// Client-side cache, shared for the whole session of the user in the browser.
const clientSideEmotionCache = createEmotionCache()

interface MyAppProps extends AppProps {
  emotionCache?: EmotionCache
}
const queryClient = new QueryClient({
  defaultOptions: { queries: { refetchOnWindowFocus: true } },
})

export default function MyApp(props: MyAppProps) {
  const { Component, emotionCache = clientSideEmotionCache, pageProps } = props
  return (
    <CacheProvider value={emotionCache}>
      <Head>
        <title>Expendas</title>
        <meta name="viewport" content="initial-scale=1, width=device-width" />
      </Head>
      <QueryClientProvider client={queryClient}>
        <DarkModeProvider>
          <MyThemeProvider>
            {/* CssBaseline kickstart an elegant, consistent, and simple baseline to build upon. */}
            <CssBaseline />
            <Component {...pageProps} />
          </MyThemeProvider>
        </DarkModeProvider>
      </QueryClientProvider>
    </CacheProvider>
  )
}

function MyThemeProvider(props: any) {
  const { Component, pageProps } = props
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
