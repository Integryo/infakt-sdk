import { Invoice, InvoiceField } from '@model/invoice'
import { z } from 'zod'
import { MetaInfo } from './shared'

export const InvoicesResponse = z.object({
  metainfo: MetaInfo,
  entities: z.array(Invoice),
})

export const InvoicesParams = z.object({
  fields: z.array(InvoiceField).nullable().optional(),
}).nullable().optional()

export const InvoiceResponse = Invoice
