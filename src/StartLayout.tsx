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
            ></Grid>
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
