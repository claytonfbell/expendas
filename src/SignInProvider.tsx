import moment from "moment-timezone"
import { useRouter } from "next/router"
import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState,
} from "react"
import { IUser } from "./db/User"
import { SignInRequest } from "./model/SignInRequest"
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

const Context = createContext<ContextType | undefined>(undefined)
export function useSignIn() {
  const context = useContext(Context)
  if (!context) {
    throw new Error(`useSignIn must be used within a SignInProvider`)
  }
  return context
}

export function SignInProvider(props: any) {
  const [busy, setBusy] = useState(false)
  const [status, setStatus] = useState<Status>("unknown")
  const [user, setUser] = useState<IUser>()

  const router = useRouter()

  const fetchSignIn = useCallback(() => {
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

  useEffect(() => {
    fetchSignIn()
  }, [fetchSignIn])

  const requireAuthentication = useCallback(() => {
    if (status === "signedOut") {
      router.push("/")
    }
  }, [router, status])

  const signOut = useCallback(() => {
    return rest.delete("/signIn").then(() => {
      setUser(undefined)
      setStatus("signedOut")
    })
  }, [])

  const signIn = useCallback((params: SignInRequest) => {
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

  useEffect(() => {
    if (user !== undefined) {
      moment.tz.setDefault(user.timeZone)
    }
  }, [user])

  const value = useMemo(
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
