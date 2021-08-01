import Head from "next/head"
import { Inside } from "../lib/Inside"
import { OrganizationList } from "../lib/OrganizationList"

export default function Home() {
  return (
    <>
      <Head>
        <title>Status Monitor App</title>
        <meta name="description" content="Status Monitor App" />
      </Head>

      <Inside title="">
        <OrganizationList />
      </Inside>

      {/* <ReactQueryDevtools /> */}
    </>
  )
}
