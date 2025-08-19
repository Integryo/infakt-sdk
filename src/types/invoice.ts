import type { Invoice as InvoiceType } from '@model/invoice'
import type { z } from 'zod'

export type Invoice = z.infer<typeof InvoiceType>
