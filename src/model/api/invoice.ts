import { Invoice } from '@model/invoice'
import { z } from 'zod'
import { MetaInfo } from './shared'

export const InvoicesResponse = z.object({
  metainfo: MetaInfo,
  entities: z.array(Invoice),
})
