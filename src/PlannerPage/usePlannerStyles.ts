import { darken, fade, makeStyles, Theme } from "@material-ui/core"

export const usePlannerStyles = makeStyles((theme: Theme) => ({
  isPaid: {
    textDecoration: "line-through",
    opacity: 0.5,
  },
  accountBox: {
    padding: 0,
  },
  accountHeader: {
    fontWeight: "bold",
    paddingTop: 6,
    paddingBottom: 6,
    borderTopLeftRadius: 10,
    backgroundColor: fade(theme.palette.primary.main, 0.15),
  },
  row: {
    borderLeft: "1px solid " + theme.palette.divider,
    borderRight: "1px solid " + theme.palette.divider,
    "&:nth-of-type(even)": {
      backgroundColor: darken(theme.palette.background.default, 0.03),
    },
    "&:nth-of-type(odd)": {
      backgroundColor: theme.palette.background.paper,
    },
  },
  bottom: {
    borderBottomRightRadius: 10,
    borderBottom: "1px solid " + theme.palette.divider,
  },
  leftCell: {
    padding: "4px 4px 4px 12px",
  },
  rightCell: {
    padding: "4px 12px 4px 4px",
    whiteSpace: "nowrap",
    hyphens: "none",
  },
  itemLink: {
    color: theme.palette.text.primary,
  },
}))
