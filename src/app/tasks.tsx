import { createFileRoute } from "@tanstack/react-router"
import { Inside } from "../../lib/Inside"
import { Tasks } from "../../lib/Tasks"

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
