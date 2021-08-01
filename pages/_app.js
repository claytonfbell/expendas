import CssBaseline from "@material-ui/core/CssBaseline"
import { ThemeProvider } from "@material-ui/core/styles"
import { DarkModeProvider, useDarkMode } from "material-ui-pack"
import Head from "next/head"
import PropTypes from "prop-types"
import React from "react"
import { QueryClient, QueryClientProvider } from "react-query"
import theme from "../lib/theme"

const queryClient = new QueryClient()

export default function MyApp(props) {
  const { Component, pageProps } = props

  React.useEffect(() => {
    // Remove the server-side injected CSS.
    const jssStyles = document.querySelector("#jss-server-side")
    if (jssStyles) {
      jssStyles.parentElement.removeChild(jssStyles)
    }
  }, [])

  return (
    <React.Fragment>
      <Head>
        <title>Status Monitor</title>
        <meta
          name="viewport"
          content="minimum-scale=1, initial-scale=1, width=device-width"
        />
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
    </React.Fragment>
  )
}

function MyThemeProvider(props) {
  const { Component, pageProps } = props
  const { createMuiThemeWithDarkMode } = useDarkMode()
  const myTheme = createMuiThemeWithDarkMode(theme)
  return <ThemeProvider theme={myTheme}>{props.children}</ThemeProvider>
}

MyApp.propTypes = {
  Component: PropTypes.elementType.isRequired,
  pageProps: PropTypes.object.isRequired,
}
