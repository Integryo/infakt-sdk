import { InvoicesResponse } from '@model/api/invoice'
import { ofetch } from 'ofetch'

interface Options {
  sandbox?: boolean
  fetcher?: typeof fetch
  apiKey: string
}

let _options: Options | null = null

const PRODUCTION_BASE_URL = 'https://api.infakt.pl/api/v3'
const SANDBOX_BASE_URL = 'https://api.sandbox-infakt.pl/api/v3'

function _fetcher(path: RequestInfo | URL, requestInit?: RequestInit) {
  if (!_options) {
    throw new Error('SDK is not initialized.')
  }
  const baseUrl = _options.sandbox ? SANDBOX_BASE_URL : PRODUCTION_BASE_URL

  const headers = new Headers(requestInit?.headers)

  headers.set('X-inFakt-ApiKey', _options.apiKey)

  return ofetch(`${baseUrl}${path}`, { ...requestInit, headers })
}

export const InfaktSDK = {
  init({
    apiKey,
        sandbox = false,
        fetcher = _fetcher,
  }: Options) {
    _options = {
      apiKey,
      sandbox,
      fetcher,
    }

    return {
      get: {
        async invoices() {
          return InvoicesResponse.parse(await fetcher('/invoices.json'))
        },
      },
    }
  },
}
