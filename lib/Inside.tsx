import {
  AppBar,
  Box,
  Container,
  Grid,
  Hidden,
  IconButton,
  Link,
  Toolbar,
} from "@material-ui/core"
import GitHubIcon from "@material-ui/icons/GitHub"
import { Tooltip } from "material-ui-bootstrap"
import { useDarkMode } from "material-ui-pack"
import { useRouter } from "next/dist/client/router"
import NextLink from "next/link"
import React, { useEffect, useState } from "react"
import { useCheckLogin } from "./api/api"
import { BreadcrumbLink, ExpendasBreadcrumbs } from "./ExpendasBreadcrumbs"
import { ExpendasErrorBoundary } from "./ExpendasErrorBoundary"
import { GlobalStateProvider } from "./GlobalStateProvider"
import { Login } from "./Login"
import { LogoComponent } from "./LogoComponent"
import { Outside } from "./Outside"
import { Title } from "./Title"
import { UserMenu } from "./UserMenu"

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
                justify="space-between"
                alignItems="center"
              >
                <Grid item>
                  <NextLink href="/">
                    <a>
                      <LogoComponent scale={0.3} />
                    </a>
                  </NextLink>
                </Grid>
                <Hidden mdDown>
                  <Grid item>
                    <Title label={props.title} />
                  </Grid>
                </Hidden>
                <Grid item>
                  <Hidden xsDown>
                    <Tooltip title="github.com/claytonfbell/expendas3">
                      <IconButton
                        color="primary"
                        href="https://github.com/claytonfbell/expendas3"
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

          <Container style={{ marginTop: 24 }}>
            <Box marginBottom={2}>
              <ExpendasBreadcrumbs links={props.breadcrumbs} />
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
              <Link
                style={{ cursor: "pointer" }}
                onClick={() => toggleDarkMode(!darkMode)}
              >
                {darkMode ? `Light` : `Dark`}
              </Link>
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
