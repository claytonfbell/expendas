import GitHubIcon from "@mui/icons-material/GitHub"
import {
  AppBar,
  Box,
  Button,
  ButtonBase,
  Container,
  CssBaseline,
  IconButton,
  Stack,
  Toolbar,
  Tooltip,
} from "@mui/material"
import { DarkModeToggle, useDarkMode } from "material-ui-pack"
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
  const { data: loginResponse } = useCheckLogin()
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
      {loginResponse === undefined ? (
        <Outside title="Login">
          <Login />
        </Outside>
      ) : (
        <GlobalStateProvider>
          <AppBar position="static" color="default" variant="outlined">
            <Toolbar>
              <Stack
                direction="row"
                spacing={2}
                alignItems="center"
                justifyContent="space-between"
                width="100%"
              >
                <ButtonBase focusRipple component={NextLink} href="/">
                  <LogoComponent scale={0.3} />
                </ButtonBase>

                <Stack
                  direction="row"
                  alignItems={"center"}
                  spacing={1}
                  display={{ xs: "none", lg: "flex" }}
                >
                  <Button LinkComponent={NextLink} href="/" color="inherit">
                    Main
                  </Button>

                  <Button
                    LinkComponent={NextLink}
                    href="/investments"
                    color="inherit"
                  >
                    Investments
                  </Button>

                  <Button
                    LinkComponent={NextLink}
                    href="/trends"
                    color="inherit"
                  >
                    Trends
                  </Button>

                  <Button
                    LinkComponent={NextLink}
                    href="/retirement"
                    color="inherit"
                  >
                    Retirement
                  </Button>

                  <Button
                    LinkComponent={NextLink}
                    href="/accounts"
                    color="inherit"
                  >
                    Accounts
                  </Button>

                  <Button
                    LinkComponent={NextLink}
                    href="/payments"
                    color="inherit"
                  >
                    Payments
                  </Button>
                </Stack>

                <Stack direction="row" alignItems={"center"}>
                  <DarkModeToggle variant="icon" />
                  <Stack display={{ xs: "none", sm: "block" }}>
                    <Tooltip title="github.com/claytonfbell/expendas">
                      <IconButton href="https://github.com/claytonfbell/expendas">
                        <GitHubIcon />
                      </IconButton>
                    </Tooltip>
                  </Stack>
                  <UserMenu />
                </Stack>
              </Stack>
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
            ></footer>
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
