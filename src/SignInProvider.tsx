import moment from "moment-timezone"
import { useRouter } from "next/router"
import React from "react"
import { SignInRequest } from "./model/SignInRequest"
import { IUser } from "./model/User"
import rest, { RestError } from "./rest"

type Status = "signedIn" | "signedOut" | "unknown"

interface ContextType {
  busy: boolean
  status: Status
  user: IUser | undefined
  requireAuthentication: () => void
  signIn: (params: SignInRequest) => Promise<void>
  signOut: () => Promise<void>
}

const Context = React.createContext<ContextType | undefined>(undefined)
export function useSignIn() {
  const context = React.useContext(Context)
  if (!context) {
    throw new Error(`useSignIn must be used within a SignInProvider`)
  }
  return context
}

export function SignInProvider(props: any) {
  const [busy, setBusy] = React.useState(false)
  const [status, setStatus] = React.useState<Status>("unknown")
  const [user, setUser] = React.useState<IUser>()

  const router = useRouter()

  const fetchSignIn = React.useCallback(() => {
    return rest
      .get("/signIn")
      .then((x) => {
        setUser(x)
        setStatus("signedIn")
      })
      .catch((e: RestError) => {
        // user needs to login
        if (e.status === 401) {
          setStatus("signedOut")
        } else {
          setStatus("unknown")
        }
      })
  }, [])

  React.useEffect(() => {
    fetchSignIn()
  }, [fetchSignIn])

  const requireAuthentication = React.useCallback(() => {
    if (status === "signedOut") {
      router.push("/")
    }
  }, [router, status])

  const signOut = React.useCallback(() => {
    return rest.delete("/signIn").then(() => {
      setUser(undefined)
      setStatus("signedOut")
    })
  }, [])

  const signIn = React.useCallback((params: SignInRequest) => {
    setBusy(true)
    return rest
      .post("/signIn", params)
      .then((x) => {
        setUser(x)
        setStatus("signedIn")
      })
      .finally(() => {
        setBusy(false)
      })
  }, [])

  React.useEffect(() => {
    if (user !== undefined) {
      moment.tz.setDefault(user.timeZone)
    }
  }, [user])

  const value = React.useMemo(
    (): ContextType => ({
      busy,
      status,
      user,
      requireAuthentication,
      signIn,
      signOut,
    }),
    [busy, status, user, requireAuthentication, signIn, signOut]
  )

  return <Context.Provider value={value} {...props} />
}
