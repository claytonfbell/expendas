import Head from "next/head"
import { Inside } from "../lib/Inside"
import { InvestmentPortfolio } from "../lib/InvestmentPortfolio"

export default function Investments() {
  return (
    <>
      <Head>
        <title>Expendas</title>
        <meta name="description" content="Expendas" />
      </Head>

      <Inside title="Investments" breadcrumbs={[{ label: "Investments" }]}>
        <InvestmentPortfolio />
      </Inside>
    </>
  )
}
