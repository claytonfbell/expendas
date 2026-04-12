import Head from "next/head"
import { Inside } from "../lib/Inside"
import { Tasks } from "../lib/Tasks"

export default function TasksPage() {
  return (
    <>
      <Head>
        <title>Expendas</title>
        <meta name="description" content="Expendas" />
      </Head>

      <Inside title="Tasks" breadcrumbs={[{ label: "Tasks" }]}>
        <Tasks />
      </Inside>
    </>
  )
}
