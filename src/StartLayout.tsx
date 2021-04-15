import {
  Box,
  CssBaseline,
  Fade,
  Grid,
  Hidden,
  makeStyles,
  Typography,
  useTheme,
} from "@material-ui/core"
import React, { ReactNode } from "react"
import { SignInProvider } from "./SignInProvider"

const coverArtPhoto = "/DSC_0396.jpg"

const useStyles = makeStyles((theme) => ({
  coverArtPhotoContainer: {
    height: "100vh",
    backgroundSize: "cover",
    backgroundRepeat: "no-repeat",
    backgroundPosition: "top center",
    position: "relative",
    boxShadow: "1px 2px 4px rgba(0, 0, 0, .075)",
    textAlign: "center",
  },
  overlay: {
    position: "relative",
    background: "linear-gradient(0deg, #00000088 30%, #ffffff44 100%)",
    height: "100vh",
  },
  titleBox: {
    position: "absolute",
    bottom: `15vh`,
    width: "100%",
  },
  expendas: {
    textAlign: "center",
    color: "#ffffff",
    fontWeight: "bold",
    fontSize: 120,
    letterSpacing: 6,
    [theme.breakpoints.down("md")]: {
      fontSize: 60,
      letterSpacing: 3,
    },
    [theme.breakpoints.down("sm")]: {
      fontSize: 40,
      letterSpacing: 2,
    },
  },
  planYourPaycheck: {
    textAlign: "center",
    color: "#ffffff",
    fontWeight: "bold",
    fontSize: 42,
    letterSpacing: 12,
    [theme.breakpoints.down("md")]: {
      fontSize: 21,
      letterSpacing: 6,
    },
    [theme.breakpoints.down("sm")]: {
      fontSize: 14,
      letterSpacing: 4,
    },
  },
}))

interface Props {
  title: string
  children: ReactNode
}

export default function StartLayout(props: Props) {
  const classes = useStyles()
  const theme = useTheme()
  return (
    <SignInProvider>
      <CssBaseline />
      <Grid
        container
        justify="space-between"
        style={{ backgroundColor: "#111" }}
      >
        <Hidden xsDown>
          <Fade timeout={1000} in>
            <Grid
              item
              sm={6}
              md={8}
              lg={9}
              className={classes.coverArtPhotoContainer}
              style={{
                backgroundImage: `url(${coverArtPhoto})`,
              }}
            >
              <Box className={classes.overlay}>
                <Box className={classes.titleBox}>
                  <Box className={classes.expendas}>expendas</Box>
                  <Box className={classes.planYourPaycheck}>
                    plan your paycheck
                  </Box>
                </Box>
              </Box>
            </Grid>
          </Fade>
        </Hidden>
        <Grid
          item
          xs={12}
          sm={6}
          md={4}
          lg={3}
          style={{ backgroundColor: theme.palette.background.default }}
        >
          <Box padding={6}>
            <Typography variant="h1">{props.title}</Typography>
            {props.children}
          </Box>
        </Grid>
      </Grid>
    </SignInProvider>
  )
}
