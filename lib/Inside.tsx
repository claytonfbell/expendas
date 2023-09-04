import GitHubIcon from "@mui/icons-material/GitHub"
import {
  AppBar,
  Box,
  Button,
  Container,
  CssBaseline,
  Grid,
  Hidden,
  IconButton,
  Link as MUILink,
  Toolbar,
  Tooltip,
} from "@mui/material"
import { useDarkMode } from "material-ui-pack"
import { useRouter } from "next/dist/client/router"
import NextLink from "next/link"
import React, { useEffect, useState } from "react"
import { BreadcrumbLink, ExpendasBreadcrumbs } from "./ExpendasBreadcrumbs"
import { ExpendasErrorBoundary } from "./ExpendasErrorBoundary"
import { GlobalStateProvider } from "./GlobalStateProvider"
import { Login } from "./Login"
import { LogoComponent } from "./LogoComponent"
import { Outside } from "./Outside"
import { UserMenu } from "./UserMenu"
import { useCheckLogin } from "./api/api"

interface Props {
  title: string
  children: React.ReactNode
  breadcrumbs: BreadcrumbLink[]
}

export function Inside(props: Props) {
  const { data: loginResponse, isLoading } = useCheckLogin()
  const { toggleDarkMode, darkMode } = useDarkMode()

  // timer
  const [timer, setTimer] = useState(0)
  useEffect(() => {
    const t = setInterval(() => setTimer((prev) => prev + 1), 100)
    return () => clearInterval(t)
  }, [])

  // fix the footer if short page
  const router = useRouter()
  const size = useWindowSize()
  const [bodyHeight, setBodyHeight] = useState<number>(0)
  useEffect(() => {
    setBodyHeight(document.body.clientHeight)
  }, [size, router.pathname, timer])
  const fixedFooter = (size.height || 0) > bodyHeight

  return (
    <>
      <CssBaseline />
      {isLoading ? null : loginResponse === undefined ? (
        <Outside title="Login">
          <Login />
        </Outside>
      ) : (
        <GlobalStateProvider>
          <AppBar position="static" color="default" variant="outlined">
            <Toolbar>
              <Grid
                container
                spacing={1}
                justifyContent="space-between"
                alignItems="center"
              >
                <Grid item>
                  <NextLink href="/">
                    <LogoComponent scale={0.3} />
                  </NextLink>
                </Grid>
                <Hidden lgDown>
                  <Grid item>
                    <Button LinkComponent={NextLink} href="/">
                      Main
                    </Button>

                    <Button LinkComponent={NextLink} href="/investments">
                      Investments
                    </Button>

                    <Button LinkComponent={NextLink} href="/accounts">
                      Accounts
                    </Button>

                    <Button LinkComponent={NextLink} href="/payments">
                      Payments
                    </Button>
                  </Grid>
                </Hidden>
                <Grid item>
                  <Hidden smDown>
                    <Tooltip title="github.com/claytonfbell/expendas">
                      <IconButton
                        color="primary"
                        href="https://github.com/claytonfbell/expendas"
                      >
                        <GitHubIcon />
                      </IconButton>
                    </Tooltip>
                  </Hidden>
                  <UserMenu />
                </Grid>
              </Grid>
            </Toolbar>
          </AppBar>

          <Container
            style={{
              marginTop: 24,
              paddingBottom: 120,
            }}
          >
            <Box marginBottom={2}>
              {props.breadcrumbs.length > 0 ? (
                <ExpendasBreadcrumbs links={props.breadcrumbs} />
              ) : null}
            </Box>
            <main>
              <ExpendasErrorBoundary>{props.children}</ExpendasErrorBoundary>
            </main>
            <footer
              style={
                fixedFooter
                  ? {
                      position: "fixed",
                      bottom: 120,
                    }
                  : {
                      marginTop: 148,
                      marginBottom: 148,
                    }
              }
            >
              <MUILink
                style={{ cursor: "pointer" }}
                onClick={() => toggleDarkMode(!darkMode)}
              >
                {darkMode ? `Light` : `Dark`}
              </MUILink>
            </footer>
          </Container>
        </GlobalStateProvider>
      )}
    </>
  )
}

interface Size {
  width: number | undefined
  height: number | undefined
}

function useWindowSize(): Size {
  const [windowSize, setWindowSize] = useState<Size>({
    width: undefined,
    height: undefined,
  })
  useEffect(() => {
    function handleResize() {
      setWindowSize({
        width: window.innerWidth,
        height: window.innerHeight,
      })
    }
    window.addEventListener("resize", handleResize)
    handleResize()
    return () => window.removeEventListener("resize", handleResize)
  }, [])
  return windowSize
}
