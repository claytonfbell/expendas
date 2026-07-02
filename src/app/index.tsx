import { createFileRoute } from "@tanstack/react-router"
import { Inside } from "../components/Inside"
import { Main } from "../components/Main"

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
