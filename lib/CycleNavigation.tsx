import ChevronLeftIcon from "@mui/icons-material/ChevronLeft"
import ChevronRightIcon from "@mui/icons-material/ChevronRight"
import { Fade, Grid, IconButton } from "@mui/material"
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
    <Grid
      sx={{
        whiteSpace: "nowrap",
      }}
      container
      justifyContent="center"
      alignItems="center"
    >
      <Grid item>
        <div style={{ fontSize: 32 }}>
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

              {moment(props.date).format("M/D/YYYY")}

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
        </div>
      </Grid>
    </Grid>
  )
}
