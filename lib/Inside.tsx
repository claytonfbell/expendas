import GitHubIcon from "@mui/icons-material/GitHub"
import {
  AppBar,
  Box,
  ButtonBase,
  Container,
  CssBaseline,
  IconButton,
  Stack,
  Toolbar,
  Tooltip,
} from "@mui/material"
import { DarkModeToggle } from "material-ui-pack"
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
import { TopNavigation } from "./TopNavigation"
import { UserMenu } from "./UserMenu"

interface Props {
  title: string
  children: React.ReactNode
  breadcrumbs: BreadcrumbLink[]
}

export function Inside(props: Props) {
  const { data: loginResponse } = useCheckLogin()

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
                  <LogoComponent height={28} />
                </ButtonBase>

                <TopNavigation />

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
