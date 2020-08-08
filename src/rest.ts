import axios, { AxiosRequestConfig } from "axios"
import _ from "lodash"
import md5 from "md5"

const CancelToken = axios.CancelToken
export const CANCEL_MESSAGE = "Canceling previous requests..."

const axiosInstance = axios.create({
  timeout: 20000,
  headers: {
    "Content-Type": "application/json",
    Accept: "application/json",
  },
  withCredentials: true,
})

type CancelFuncs = {
  [key: string]: (message: string) => void
}

class Rest {
  setBaseURL = (baseURL: string) => {
    axiosInstance.defaults.baseURL = baseURL
  }

  _cancelFunc: CancelFuncs = {}
  _cancelPreviousRequest = (route: string) => {
    const key = md5(route) as string
    console.log("key=" + key)
    if (this._cancelFunc[key] !== undefined) {
      console.log("canceling...")
      this._cancelFunc[key](CANCEL_MESSAGE)
    }
  }

  get = (url: string, query = {}, bust = true, opt = {}) => {
    return this._request({
      url,
      method: "get",
      params: {
        bustCache: bust ? Math.random() : null,
        ...query,
      },
      ...opt,
    })
  }

  put = (url: string, data: object) => {
    return this._request({
      url,
      method: "put",
      data,
    })
  }

  post = (url: string, data = {}, opt = {}) => {
    return this._request({
      url,
      method: "post",
      data,
      ...opt,
    })
  }

  delete = (url: string) => {
    return this._request({
      url,
      method: "delete",
    })
  }

  uploadFileMultiPart = (url: string, file: File) => {
    const formData = new FormData()
    formData.append("uploadedFile", file)

    return this._request({
      url,
      method: "post",
      headers: { "content-type": "multipart/form-data" },
      data: formData,
    })
  }

  _request = (config: AxiosRequestConfig) => {
    this._cancelPreviousRequest(config.url as string)
    config = {
      ...config,
      cancelToken: new CancelToken((c) => {
        this._cancelFunc[md5(config.url as string) as string] = c
      }),
    }
    return axiosInstance
      .request(config)
      .then((res) => res.data)
      .catch(this._throwErrors)
  }

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  _throwErrors = (error: any) => {
    // initial fallback message and status
    const err: RestError = { status: 0, message: "Connection Failure" }

    // fallback message if it can't be read from response
    let message = _.get(error, "message", null)
    if (message !== null) {
      err.message = message
    }

    // read error from JSON
    const status = _.get(error, "response.data.status", null)
    if (status !== null) {
      err.status = status
    }
    message = _.get(error, "response.data.message", null)
    if (message !== null) {
      err.message = message
    } else {
      const rawMessage = _.get(error, "response.data", null)
      if (rawMessage !== null) {
        err.message += " - " + rawMessage
      }
    }

    console.log(err)
    console.log(error)

    throw err
  }
}

const rest = new Rest()
rest.setBaseURL("/api")
export default rest

export interface RestError {
  status: number
  message: string
}
