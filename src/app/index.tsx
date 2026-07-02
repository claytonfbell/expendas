import { createFileRoute } from "@tanstack/react-router"
import { Inside } from "../../lib/Inside"
import { Main } from "../../lib/Main"

export const Route = createFileRoute("/")({
  ssr: false,
  loader: async () => true,
  component: Home,
})

function Home() {
  return (
    <Inside title="Expendas" breadcrumbs={[]}>
      <Main />
    </Inside>
  )
}
