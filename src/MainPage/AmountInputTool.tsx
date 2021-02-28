import { Link, makeStyles } from "@material-ui/core"
import React from "react"
import { AmountInput } from "./AmountInput"
import { Currency } from "./Currency"

const useStyles = makeStyles({
  link: {
    cursor: "pointer",
  },
})

type Props = {
  value: number
  onChange: (newValue: number) => void
  enabled?: boolean
  green?: boolean
}
export function AmountInputTool(props: Props) {
  const classes = useStyles()
  const { enabled, value, onChange } = props
  const [open, setOpen] = React.useState(false)

  function handleChange(newValue: number) {
    setOpen(false)
    onChange(newValue)
  }

  return (
    <>
      {enabled ? (
        open ? (
          <AmountInput value={value} onChange={handleChange} />
        ) : (
          <Link
            color="inherit"
            className={classes.link}
            onClick={() => setOpen(true)}
          >
            <Currency green={props.green} value={value} />
          </Link>
        )
      ) : (
        <Currency green={props.green} value={value} />
      )}
    </>
  )
}
