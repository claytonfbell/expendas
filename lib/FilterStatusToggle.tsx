import { Button, ButtonGroup, fade } from "@material-ui/core"
import { makeStyles } from "@material-ui/core/styles"
import SearchIcon from "@material-ui/icons/Search"
import clsx from "clsx"
import React from "react"

const useStyles = makeStyles((theme) => ({
  button: {
    textTransform: "none",
  },
  selected: {
    backgroundColor: theme.palette.primary.main,
    color: theme.palette.primary.contrastText,
    "&:hover": {
      backgroundColor: fade(theme.palette.primary.main, 0.8),
    },
  },
}))

interface Props {
  selected: boolean
  onSelect: (selected: boolean) => void
}

export function FilterStatusToggle(props: Props) {
  const classes = useStyles()
  const { onSelect, selected } = props

  return (
    <ButtonGroup>
      <Button
        onClick={() => onSelect(!selected)}
        className={clsx(
          classes.button,
          selected ? classes.selected : undefined
        )}
        variant={selected ? "outlined" : "text"}
        color={selected ? "primary" : "default"}
        startIcon={<SearchIcon />}
      >
        Only Display Failures
      </Button>
    </ButtonGroup>
  )
}
