import Head from "next/head"
import { Inside } from "../lib/Inside"
import { MonitorList } from "../lib/MonitorList"

export default function Home() {
  return (
    <>
      <Head>
        <title>Status Monitor App</title>
        <meta name="description" content="Status Monitor App" />
      </Head>

      <Inside title="">
        <MonitorList />
      </Inside>

      {/* <ReactQueryDevtools /> */}
    </>
  )
}
