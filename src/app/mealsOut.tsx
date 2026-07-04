import { createFileRoute } from "@tanstack/react-router"
import { Inside } from "../components/Inside"
import { MealsOut } from "../components/MealsOut"

export const Route = createFileRoute("/mealsOut")({
  ssr: false,
  loader: async () => true,
  component: MealsOutPage,
})

function MealsOutPage() {
  return (
    <Inside title="Meals Out" breadcrumbs={[{ label: "Meals Out" }]}>
      <MealsOut />
    </Inside>
  )
}
