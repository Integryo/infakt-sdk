import type { InvoicesResponse as InvoiceResponseModel, InvoicesParams as InvoicesParamsModel } from '@model/api/invoice'
import type { z } from 'zod'

export type InvoicesResponse = z.infer<typeof InvoiceResponseModel>
export type InvoicesParams = z.infer<typeof InvoicesParamsModel>
