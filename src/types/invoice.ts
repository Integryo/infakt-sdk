import type { InvoiceField as InvoiceFieldModel, Invoice as InvoiceModel } from '@model/invoice'

import type { z } from 'zod'

export type Invoice = z.infer<typeof InvoiceModel>
export type InvoiceField = z.infer<typeof InvoiceFieldModel>
