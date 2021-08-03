import { Fade, Grid, IconButton, makeStyles } from "@material-ui/core"
import ChevronLeftIcon from "@material-ui/icons/ChevronLeft"
import ChevronRightIcon from "@material-ui/icons/ChevronRight"
import moment from "moment"

const useStyles = makeStyles({
  root: {
    whiteSpace: "nowrap",
  },
})

type Props = {
  date: string
  onChange: (value: string) => void
  dates: string[]
}

export function CycleNavigation(props: Props) {
  const classes = useStyles()
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
      className={classes.root}
      container
      justify="center"
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
