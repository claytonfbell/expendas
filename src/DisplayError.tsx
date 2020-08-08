import { Fade } from "@material-ui/core"
import makeStyles from "@material-ui/core/styles/makeStyles"
import Alert from "material-ui-bootstrap/dist/Alert"
import React from "react"
import ReactMarkdown from "react-markdown"
import { RestError } from "./rest"

const scrollToRef = (ref: any) =>
  window.scrollTo(0, ref.current.offsetTop - 100)

const useStyles = makeStyles((theme) => ({
  root: {
    marginTop: theme.spacing(1),
    marginBottom: theme.spacing(2),
    width: "100%",
  },
  md: {
    "& p": {
      margin: 0,
    },
  },
}))

interface Props {
  error?: RestError
  title?: string
  onClose?: () => void
}
export default function DisplayError(props: Props) {
  const classes = useStyles()
  const [show, setShow] = React.useState(false)

  const myRef = React.useRef(null)
  const executeScroll = () => scrollToRef(myRef)

  React.useEffect(() => {
    const timer = setTimeout(() => {
      setShow(props.error !== undefined)
    }, 1)
    return () => clearTimeout(timer)
  }, [props.error])

  React.useEffect(() => {
    if (show) {
      executeScroll()
    }
  }, [show, props.error])

  function handleClose() {
    setShow(false)
    if (props.onClose !== undefined) {
      props.onClose()
    }
  }

  return (
    <>
      <Fade in={show} unmountOnExit>
        <div ref={myRef} className={classes.root}>
          <Alert dismissible show={show} onClose={handleClose}>
            {props.title && <Alert.Heading>{props.title}</Alert.Heading>}
            {props.error && (
              <ReactMarkdown
                className={classes.md}
                source={props.error.message}
              />
            )}
          </Alert>
        </div>
      </Fade>
    </>
  )
}
