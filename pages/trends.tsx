import Head from "next/head"
import { Inside } from "../lib/Inside"
import { TrendsReports } from "../lib/TrendsReports"

export default function Trends() {
  return (
    <>
      <Head>
        <title>Expendas</title>
        <meta name="description" content="Expendas" />
      </Head>

      <Inside title="Trends" breadcrumbs={[{ label: "Trends" }]}>
        <TrendsReports />
      </Inside>
    </>
  )
}
