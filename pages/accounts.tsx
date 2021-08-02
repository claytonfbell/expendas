import Head from "next/head"
import React from "react"
import { AccountManage } from "../lib/AccountManage"
import { Inside } from "../lib/Inside"

export default function Home() {
  return (
    <>
      <Head>
        <title>Expendas</title>
        <meta name="description" content="Expendas" />
      </Head>

      <Inside title="Accounts" breadcrumbs={[{ label: "Accounts" }]}>
        <AccountManage />
      </Inside>

      {/* <ReactQueryDevtools /> */}
    </>
  )
}
