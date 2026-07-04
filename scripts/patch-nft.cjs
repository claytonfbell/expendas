const fs = require("fs")
const path = require("path")

const nftPkgPath = path.join(
  __dirname,
  "..",
  "node_modules",
  "nf3",
  "dist",
  "node_modules",
  "@vercel",
  "nft",
  "package.json"
)

if (!fs.existsSync(nftPkgPath)) {
  console.log("[expendas] nf3 not installed, skipping @vercel/nft patch")
  process.exit(0)
}

const pkg = JSON.parse(fs.readFileSync(nftPkgPath, "utf8"))

if (!pkg.exports || !pkg.exports["."]) {
  pkg.exports = {
    ".": {
      import: "./out/index.mjs",
      require: "./out/index.js",
    },
  }
  fs.writeFileSync(nftPkgPath, JSON.stringify(pkg, null, 2))
  console.log("[expendas] added ESM exports to bundled @vercel/nft")
}

const esmWrapperPath = path.join(
  __dirname,
  "..",
  "node_modules",
  "nf3",
  "dist",
  "node_modules",
  "@vercel",
  "nft",
  "out",
  "index.mjs"
)

const esmWrapper = `import { createRequire } from 'node:module';
const require = createRequire(import.meta.url);
const nft = require('./index.js');
export const { nodeFileTrace, resolve } = nft;
export default nft;
`

fs.writeFileSync(esmWrapperPath, esmWrapper)
console.log("[expendas] created @vercel/nft ESM wrapper (index.mjs)")