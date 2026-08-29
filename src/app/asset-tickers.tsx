import { createFileRoute } from "@tanstack/react-router"
import { AssetTickers } from "../components/AssetTickers"
import { Inside } from "../components/Inside"

export const Route = createFileRoute("/asset-tickers")({
  ssr: false,
  loader: async () => true,
  component: AssetTickersPage,
})

function AssetTickersPage() {
  return (
    <Inside title="Asset Tickers" breadcrumbs={[{ label: "Asset Tickers" }]}>
      <AssetTickers />
    </Inside>
  )
}
