import Head from "next/head"
import { Inside } from "../lib/Inside"
import { RetirementPlans } from "../lib/RetirementPlans"

export default function Retirement() {
  return (
    <>
      <Head>
        <title>Expendas</title>
        <meta name="description" content="Expendas" />
      </Head>

      <Inside title="Retirement" breadcrumbs={[{ label: "Retirement" }]}>
        <RetirementPlans />
      </Inside>
    </>
  )
}
