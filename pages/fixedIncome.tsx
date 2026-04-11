import Head from "next/head"
import { FixedIncomeAssets } from "../lib/FixedIncomeAssets"
import { Inside } from "../lib/Inside"

export default function FixedIncome() {
  return (
    <>
      <Head>
        <title>Expendas</title>
        <meta name="description" content="Expendas" />
      </Head>

      <Inside title="Fixed Income" breadcrumbs={[{ label: "Fixed Income" }]}>
        <FixedIncomeAssets />
      </Inside>
    </>
  )
}
