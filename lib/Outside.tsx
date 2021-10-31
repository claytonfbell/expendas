import GitHubIcon from "@mui/icons-material/GitHub"
import { Box, Container, Grid, IconButton } from "@mui/material"
import { Tabs } from "material-ui-bootstrap"
import React, { useState } from "react"
import ReactMarkdown from "react-markdown"
import { ExpendasAnimation } from "./ExpendasAnimation"
import { LogoComponent } from "./LogoComponent"

interface Props {
  title: string
  children: React.ReactNode
}

const FOOTER_CONTENT = ``

export function Outside(props: Props) {
  const [selected, setSelected] = useState(0)

  return (
    <Container>
      <Grid container style={{ minHeight: "100vh" }} alignItems="center">
        <Grid item xs={12}>
          <Box maxWidth={400} minHeight={800} style={{ margin: "auto" }}>
            <Grid
              container
              alignItems="center"
              alignContent="center"
              justifyContent="space-between"
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
            <Tabs
              tabs={["Login / Create Account", "Demo"]}
              selectedIndex={selected}
              onSelect={(x) => setSelected(x)}
            >
              {selected === 0 ? props.children : null}
              {selected === 1 ? <ExpendasAnimation /> : null}
            </Tabs>
            <ReactMarkdown>{FOOTER_CONTENT}</ReactMarkdown>
          </Box>
        </Grid>
      </Grid>
    </Container>
  )
}
