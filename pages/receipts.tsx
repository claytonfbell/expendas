import Head from "next/head"
import { Inside } from "../lib/Inside"
import { Receipts } from "../lib/Receipts"

export default function ReceiptsPage() {
  return (
    <>
      <Head>
        <title>Expendas</title>
        <meta name="description" content="Expendas" />
      </Head>

      <Inside title="Receipts" breadcrumbs={[{ label: "Receipts" }]}>
        <Receipts />
      </Inside>
    </>
  )
}
