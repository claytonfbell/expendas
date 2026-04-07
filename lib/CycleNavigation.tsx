import ChevronLeftIcon from "@mui/icons-material/ChevronLeft"
import ChevronRightIcon from "@mui/icons-material/ChevronRight"
import { Fade, IconButton, Stack, Typography } from "@mui/material"
import moment from "moment"

type Props = {
  date: string
  onChange: (value: string) => void
  dates: string[]
}

export function CycleNavigation(props: Props) {
  const { dates } = props
  let prev: string | null = null

  let x = dates.indexOf(props.date) - 1
  if (typeof dates[x] !== "undefined") {
    prev = dates[x]
  }

  let next: string | null = null
  x = dates.indexOf(props.date) + 1
  if (typeof dates[x] !== "undefined") {
    next = dates[x]
  }

  return (
    <Stack
      direction="row"
      spacing={2}
      alignItems="center"
      justifyContent="center"
    >
      {dates.length > 0 ? (
        <>
          <Fade in={prev !== null}>
            <IconButton
              onClick={() => {
                if (prev !== null) {
                  props.onChange(prev)
                }
              }}
            >
              <ChevronLeftIcon />
            </IconButton>
          </Fade>

          <Typography variant="h1" component={"span"}>
            {moment(props.date).format("M/D/YYYY")}
          </Typography>

          {next !== null ? (
            <IconButton
              onClick={() => {
                if (next !== null) {
                  props.onChange(next)
                }
              }}
            >
              <ChevronRightIcon />
            </IconButton>
          ) : null}
        </>
      ) : null}
    </Stack>
  )
}
