import { Container, CssBaseline } from "@material-ui/core"
import Button from "material-ui-bootstrap/dist/Button"
import rest from "../src/rest"

export default function Planner() {
  function handleSignOut() {
    rest.delete("/signIn")
  }

  return (
    <>
      <CssBaseline />
      <br />
      <br />
      <br />
      <Container>
        <Button onClick={handleSignOut} color="danger">
          Logout
        </Button>
      </Container>
    </>
  )
}
