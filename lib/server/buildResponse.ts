import { getIronSession } from "iron-session"
import { SessionData, sessionOptions } from "./session"

export async function buildResponse(
  request: Request,
  handler: (session: SessionData) => Promise<any>
): Promise<Response> {
  const tempRes = new Response()
  const session = await getIronSession<SessionData>(
    request,
    tempRes,
    sessionOptions
  )

  try {
    const result = await handler(session)
    await session.save()
    return bake(result, tempRes)
  } catch (e: any) {
    console.log(e)
    await session.save()
    const status = e.status || 500
    return bake(
      Response.json({ status, message: e.message }, { status }),
      tempRes
    )
  }
}

function bake(result: any, sessionRes: Response): Response {
  if (result instanceof Response) {
    const cookie = sessionRes.headers.get("set-cookie")
    if (cookie) result.headers.set("set-cookie", cookie)
    return result
  }

  const response =
    result === undefined || result === false
      ? new Response(null, { status: 204 })
      : Response.json(result)

  const cookie = sessionRes.headers.get("set-cookie")
  if (cookie) response.headers.set("set-cookie", cookie)

  return response
}
