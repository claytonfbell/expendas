import { Box } from "@mui/system"

export function ExpendasAnimation() {
  const gif = `https://res.cloudinary.com/doqodlq85/image/upload/v1635206100/claybell-net/expendas/expendas-animated.gif`
  return (
    <Box
      sx={{
        textAlign: "center",
        backgroundColor: "#2c2d2c",
      }}
    >
      <img
        src={gif}
        alt="expendas.com"
        style={{ width: "100%", maxWidth: 320 }}
      />
    </Box>
  )
}
