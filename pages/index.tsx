import Head from "next/head"
import { Inside } from "../lib/Inside"
import { OrganizationList } from "../lib/OrganizationList"

export default function Home() {
  return (
    <>
      <Head>
        <title>Expendas</title>
        <meta name="description" content="Expendas" />
      </Head>

      <Inside title="">
        <OrganizationList />
      </Inside>

      {/* <ReactQueryDevtools /> */}
    </>
  )
}
