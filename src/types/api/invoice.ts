import type { InvoicesResponse as InvoiceResponseType } from '@model/api/invoice'
import type { z } from 'zod'

export type InvoicesResponse = z.infer<typeof InvoiceResponseType>
