import { createFileRoute } from "@tanstack/react-router"
import { Inside } from "../components/Inside"
import { Tasks } from "../components/Tasks"

export const Route = createFileRoute("/tasks")({
  ssr: false,
  loader: async () => true,
  component: TasksPage,
})

function TasksPage() {
  return (
    <Inside title="Tasks" breadcrumbs={[{ label: "Tasks" }]}>
      <Tasks />
    </Inside>
  )
}
