import ExpandLessIcon from "@mui/icons-material/ExpandLess"
import ExpandMoreIcon from "@mui/icons-material/ExpandMore"
import { Collapse, IconButton, Stack, Typography } from "@mui/material"
import React, { useState } from "react"

interface Props {
  title: React.ReactNode
  summary: React.ReactNode
  children: React.ReactNode
  collapsible?: boolean
  defaultExpanded?: boolean
}

export function RetirementPlanSection({
  title,
  summary,
  children,
  collapsible = false,
  defaultExpanded = false,
}: Props) {
  const [collapsed, setCollapsed] = useState(
    collapsible ? !defaultExpanded : false
  )

  return (
    <Stack spacing={3} alignItems={"stretch"}>
      <Stack
        direction="row"
        alignItems={{ xs: "start", sm: "baseline" }}
        justifyContent={"space-between"}
      >
        <Stack
          direction={{ xs: "column", sm: "row" }}
          alignItems={"baseline"}
          spacing={{ xs: 0, sm: 3 }}
        >
          <Typography variant="h1">{title}</Typography>
          {summary}
        </Stack>
        {collapsible && (
          <Stack>
            <IconButton size="small" onClick={() => setCollapsed(!collapsed)}>
              {collapsed ? <ExpandMoreIcon /> : <ExpandLessIcon />}
            </IconButton>
          </Stack>
        )}
      </Stack>

      <Collapse in={!collapsed} unmountOnExit>
        {children}
      </Collapse>
    </Stack>
  )
}
