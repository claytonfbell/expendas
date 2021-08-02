import Head from "next/head"
import { Inside } from "../lib/Inside"
import { PaymentManage } from "../lib/PaymentManage"

export default function Home() {
  return (
    <>
      <Head>
        <title>Expendas</title>
        <meta name="description" content="Expendas" />
      </Head>

      <Inside title="Payments" breadcrumbs={[{ label: "Payments" }]}>
        <PaymentManage />
      </Inside>
    </>
  )
}
