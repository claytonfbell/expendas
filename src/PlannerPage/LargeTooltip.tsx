import { Tooltip, withStyles } from "@material-ui/core"

export const LargeTooltip = withStyles({
  tooltip: {
    fontSize: 14,
    padding: 10,
  },
})(Tooltip)
