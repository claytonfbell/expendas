import GitHubIcon from "@mui/icons-material/GitHub"
import { IconButton, Stack } from "@mui/material"
import { Tabs } from "material-ui-bootstrap"
import React, { useState } from "react"
import { ExpendasAnimation } from "./ExpendasAnimation"
import { LogoComponent } from "./LogoComponent"

interface Props {
  title: string
  children: React.ReactNode
}

export function Outside(props: Props) {
  const [selected, setSelected] = useState(0)
  return (
    <Stack
      sx={{
        height: "100vh",
        justifyContent: { xs: "start", md: "center" },
        padding: 2,
        alignItems: "center",
      }}
    >
      <Stack
        spacing={2}
        sx={{
          maxWidth: 400,
        }}
      >
        <Stack
          direction="row"
          sx={{
            justifyContent: "space-between",
            alignItems: "center",
          }}
        >
          <LogoComponent height={32} />
          <IconButton
            color="primary"
            href="https://github.com/claytonfbell/expendas"
          >
            <GitHubIcon />
          </IconButton>
        </Stack>
        <Stack>
          <Tabs
            tabs={["Login / Create Account", "Demo"]}
            selectedIndex={selected}
            onSelect={(x) => setSelected(x)}
          >
            {selected === 0 ? props.children : null}
            {selected === 1 ? <ExpendasAnimation /> : null}
          </Tabs>
        </Stack>
      </Stack>
    </Stack>
  )
}
