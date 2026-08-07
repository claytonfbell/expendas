import { createFileRoute } from "@tanstack/react-router"
import { Inside } from "../components/Inside"
import { Test2 } from "../components/Test2"

export const Route = createFileRoute("/test2")({
  ssr: false,
  loader: async () => true,
  component: Test2Page,
})

function Test2Page() {
  return (
    <Inside title="Test 2.0" breadcrumbs={[{ label: "Test 2.0" }]}>
      <Test2 />
    </Inside>
  )
}
