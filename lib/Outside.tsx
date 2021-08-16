import { Box, Container, Grid, IconButton } from "@material-ui/core"
import GitHubIcon from "@material-ui/icons/GitHub"
import React from "react"
import ReactMarkdown from "react-markdown"
import { LogoComponent } from "./LogoComponent"

interface Props {
  title: string
  children: React.ReactNode
}

const FOOTER_CONTENT = ``

export function Outside(props: Props) {
  return (
    <Container>
      <Grid container style={{ minHeight: "100vh" }} alignItems="center">
        <Grid item xs={12}>
          <Box maxWidth={400} style={{ margin: "auto" }}>
            <Grid
              container
              alignItems="center"
              alignContent="center"
              justify="space-between"
            >
              <Grid item>
                <LogoComponent scale={0.27} />
              </Grid>
              <Grid item>
                <IconButton
                  color="primary"
                  href="https://github.com/claytonfbell/expendas"
                >
                  <GitHubIcon />
                </IconButton>
              </Grid>
            </Grid>
            {props.children}
            <ReactMarkdown>{FOOTER_CONTENT}</ReactMarkdown>
          </Box>
        </Grid>
      </Grid>
    </Container>
  )
}
