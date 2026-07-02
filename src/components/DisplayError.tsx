import { Alert, AlertTitle, Box, Fade, useTheme } from "@mui/material"
import React from "react"
import ReactMarkdown from "react-markdown"
import { RestError } from "./api/rest"

const scrollToRef = (ref: any) =>
  window.scrollTo(0, ref.current.offsetTop - 100)

interface Props {
  error: RestError | null | undefined
  onClose?: () => void
  title?: string
}
export default function DisplayError(props: Props) {
  const theme = useTheme()
  const [show, setShow] = React.useState(false)

  const myRef = React.useRef(null)
  const executeScroll = () => scrollToRef(myRef)

  React.useEffect(() => {
    const timer = setTimeout(() => {
      setShow(props.error !== undefined && props.error !== null)
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
        <Box
          ref={myRef}
          sx={{
            marginTop: theme.spacing(1),
            marginBottom: theme.spacing(2),
            width: "100%",
          }}
        >
          <Alert color="error" onClose={handleClose}>
            {props.title && <AlertTitle>{props.title}</AlertTitle>}
            {props.error && (
              <Box
                sx={{
                  "& p": {
                    margin: 0,
                  },
                }}
              >
                <ReactMarkdown>{props.error.message}</ReactMarkdown>
              </Box>
            )}
          </Alert>
        </Box>
      </Fade>
    </>
  )
}
