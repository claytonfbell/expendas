import { Grid, IconButton } from "@material-ui/core"
import ChevronLeftIcon from "@material-ui/icons/ChevronLeft"
import ChevronRightIcon from "@material-ui/icons/ChevronRight"
import moment from "moment"

type Props = {
  date: string
  onChange: (value: string) => void
  cycleDates: string[]
}

export default function CycleNavigation(props: Props) {
  const { cycleDates } = props
  let prev: string = null

  let x = cycleDates.indexOf(props.date) - 1
  if (typeof cycleDates[x] !== "undefined") {
    prev = cycleDates[x]
  }

  let next: string = null
  x = cycleDates.indexOf(props.date) + 1
  if (typeof cycleDates[x] !== "undefined") {
    next = cycleDates[x]
  }

  return (
    <Grid container justify="center" alignItems="center">
      <Grid item>
        <div style={{ fontSize: 32 }}>
          {cycleDates.length > 0 ? (
            <>
              {prev !== null ? (
                <IconButton onClick={() => props.onChange(prev)}>
                  <ChevronLeftIcon />
                </IconButton>
              ) : null}

              {moment(props.date).format("M/D/YYYY")}

              {next !== null ? (
                <IconButton onClick={() => props.onChange(next)}>
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
