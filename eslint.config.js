const nextConfig = require("eslint-config-next/core-web-vitals")

module.exports = [
  ...nextConfig,
  {
    rules: {
      "@next/next/no-img-element": "off",
    },
  },
]
