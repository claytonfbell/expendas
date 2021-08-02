import {
  AppBar,
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
import { Login } from "./Login"
import { LogoComponent } from "./LogoComponent"
import { Outside } from "./Outside"
import { Title } from "./Title"
import { UserMenu } from "./UserMenu"

interface Props {
  title: string
  children: React.ReactNode
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
        <>
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
            <main>{props.children}</main>
            <footer
              style={
                fixedFooter
                  ? {
                      position: "fixed",
                      bottom: 20,
                    }
                  : {
                      marginTop: 48,
                      marginBottom: 48,
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
        </>
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
