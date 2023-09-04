const withTM = require("next-transpile-modules")([
  "@mui/material",
  "@mui/icons-material",
  "@mui/lab",
  "material-ui-pack",
])

module.exports = withTM({
  reactStrictMode: false,
  swcMinify: true,
})
