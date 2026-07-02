import { ErrorBoundary, FallbackProps } from "react-error-boundary"

function ErrorFallback(props: FallbackProps) {
  return (
    <div role="alert">
      <p>Something went wrong:</p>
      <pre>{props.error.message}</pre>
      <button onClick={props.resetErrorBoundary}>Try again</button>
    </div>
  )
}

interface Props {
  children: React.ReactNode
}

export function ExpendasErrorBoundary(props: Props) {
  return (
    <ErrorBoundary
      FallbackComponent={ErrorFallback}
      onReset={() => {
        // reset the state of your app so the error doesn't happen again
      }}
    >
      {props.children}
    </ErrorBoundary>
  )
}
