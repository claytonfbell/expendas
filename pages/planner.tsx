import InsideLayout from "../src/InsideLayout"
import { useSignIn } from "../src/SignInProvider"

function Planner() {
  const { signOut, requireAuthentication } = useSignIn()
  requireAuthentication()

  return <>todo</>
}

export default () => (
  <InsideLayout title="Planner">
    <Planner />
  </InsideLayout>
)
