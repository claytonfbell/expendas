import Box, { BoxProps } from "@mui/material/Box"
import { alpha, darken, styled } from "@mui/material/styles"

export const DropZoneStyleBox: React.ComponentType<BoxProps> = styled(Box)(({ theme }) => ({
  cursor: "pointer",
  border: `3px dashed ${theme.palette.text.disabled}`,
  color: "#666666",
  borderRadius: 6,
  textAlign: "center",
  "& span": {
    color: theme.palette.text.disabled,
  },
  "&:hover,&:active,&:focus": {
    border: `3px dashed ${theme.palette.primary.light}`,
    backgroundColor: alpha(
      theme.palette.mode === "light" ? theme.palette.primary.light : darken(theme.palette.primary.dark, 0.7),
      0.35
    ),
    color: theme.palette.primary.light,
    ...theme.applyStyles("light", {
      border: `3px dashed ${theme.palette.primary.dark}`,
      color: theme.palette.primary.dark,
    }),
  },
}))

export default DropZoneStyleBox
