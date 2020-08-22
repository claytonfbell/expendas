import { Grid, IconButton } from "@material-ui/core"
import ChevronLeftIcon from "@material-ui/icons/ChevronLeft"
import ChevronRightIcon from "@material-ui/icons/ChevronRight"
import moment from "moment"
import React from "react"

type Props = {
  date: string
  cycleDates: string[]
  onChange: (value: string) => void
}

export default function CycleNavigation(props: Props) {
  let prev: string = null
  let x = props.cycleDates.indexOf(props.date) - 1
  if (typeof props.cycleDates[x] !== "undefined") {
    prev = props.cycleDates[x]
  }

  let next: string = null
  x = props.cycleDates.indexOf(props.date) + 1
  if (typeof props.cycleDates[x] !== "undefined") {
    next = props.cycleDates[x]
  }

  return (
    <Grid container justify="center" alignItems="center">
      <Grid item>
        <div style={{ fontSize: 32 }}>
          {props.cycleDates.length > 0 ? (
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
