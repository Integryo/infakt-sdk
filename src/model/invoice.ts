import { z } from 'zod'

// -- Helpers -----------------------------------------------------------------

export const DateYMD = z.string().regex(/^\d{4}-\d{2}-\d{2}$/, 'Use YYYY-MM-DD')

export const Currency = z.enum([
  'PLN',
  'THB',
  'USD',
  'AUD',
  'HKD',
  'CAD',
  'NZD',
  'SGD',
  'EUR',
  'HUF',
  'CHF',
  'GBP',
  'UAH',
  'JPY',
  'CZK',
  'DKK',
  'ISK',
  'NOK',
  'SEK',
  'HRK',
  'RON',
  'BGN',
  'TRY',
  'LTL',
  'LVL',
  'PHP',
  'MXN',
  'ZAR',
  'BRL',
  'MYR',
  'RUB',
  'IDR',
  'KRW',
  'CNY',
  'INR',
])

export const InvoiceKind = z.enum(['proforma', 'vat'])

export const PaymentMethod = z.enum([
  'transfer',
  'cash',
  'card',
  'barter',
  'check',
  'bill_of_sale',
  'delivery',
  'compensation',
  'accredited',
  'paypal',
  'instalment_sale',
  'payu',
  'tpay',
  'przelewy24',
  'dotpay',
  'other',
])

// Two fields exist in docs under similar name; model them distinctly:
export const SplitPaymentType = z.enum(['required', 'optional']) // only when split payment method used
export const InvoiceStatus = z.enum(['draft', 'sent', 'printed', 'paid'])

export const ClientBusinessActivityKind = z.enum([
  'private_person',
  'self_employed',
  'other_business',
])

export const SaleType = z.enum(['service', 'merchandise', '']) // for foreign customers

export const InvoiceDateKind = z.enum([
  'sale_date',
  'service_date',
  'cargo_date',
  'continuous_date_end_on',
])

export const VatExchangeDateKind = z.enum(['vat', 'pit'])

export const VatDateValue = z.enum(['issue_date', 'sale_date', 'paid_date'])

// -- Nested types ------------------------------------------------------------

export const Service = z.object({
  // Required
  id: z.number(),
  related_id: z.number().nullable(),
  name: z.string().min(1, 'Nazwa pozycji jest wymagana'),

  // Optional (core)
  tax_symbol: z.string().optional(), // VAT rate symbol (see "Stawki VAT")
  unit: z.string().optional(), // Jednostka
  quantity: z.number().positive().optional(), // Ilość (int per docs)

  // Prices in grosze
  unit_net_price: z.number().int().nonnegative().optional(),
  net_price: z.number().int().nonnegative().optional(),
  gross_price: z.number().int().nonnegative().optional(),
  tax_price: z.number().int().nonnegative().optional(),

  // Classification (legacy + new)
  symbol: z.string().optional(), // deprecated: PKWiU / CN / PKOB
  pkwiu: z.string().optional(),
  cn: z.string().nullable().optional(),
  pkob: z.string().nullable().optional(),

  // Ryczałt
  flat_rate_tax_symbol: z.string().optional(), // e.g., "8.5"

  // Discounts
  discount: z.string().optional(), // percent 0–100
  unit_net_price_before_discount: z.number().int().nonnegative().optional(),

  // GTU
  gtu_id: z.number().int().positive().nullable().optional(),

  // VAT date source
  vat_date_value: VatDateValue.optional(),

  // Sporadic activity flag
  occasional_sale: z.boolean().optional(),
}).strict()

const Extensions = z.object({
  payments: z.object({
    link: z.string().nullable().optional(),
    available: z.boolean().optional(),
  }).partial().optional(),
  shares: z.object({
    link: z.string().nullable().optional(),
    available: z.boolean().optional(),
    valid_until: DateYMD.nullable().optional(),
  }).partial().optional(),
}).partial()

const LooseDict = z.object({}).catchall(z.any())

// -- Full Invoice (read model) -----------------------------------------------

export const Invoice = z.object({
  // Read-only
  id: z.number().int().nonnegative().nullable().optional(),
  status: InvoiceStatus.nullable().optional(),
  created_at: z.string().datetime({ offset: true }).nullable().optional(),
  local_government_seller_address: LooseDict.nullable().optional(),
  ksef_data: LooseDict.nullable().optional(),
  extensions: Extensions.nullable().optional(),

  // Editable
  number: z.string().nullable().optional(),
  currency: Currency.nullable().optional(), // default PLN in API
  paid_price: z.number().int().nonnegative().nullable().optional(),
  notes: z.string().nullable().optional(),
  kind: InvoiceKind.nullable().optional(),
  payment_method: PaymentMethod.nullable().optional(),

  // Split payment:
  split_payment_available: z.boolean().nullable().optional(), // availability flag
  split_payment_type: SplitPaymentType.nullable().optional(), // "required"/"nullable" when used

  recipient_signature: z.string().nullable().optional(),
  seller_signature: z.string().nullable().optional(),

  invoice_date: DateYMD.nullable().optional(),
  sale_date: DateYMD.nullable().optional(),
  payment_date: DateYMD.nullable().optional(),
  paid_date: DateYMD.nullable().optional(),

  net_price: z.number().int().nonnegative().nullable().optional(),
  tax_price: z.number().int().nonnegative().nullable().optional(),
  gross_price: z.number().int().nonnegative().nullable().optional(),
  left_to_pay: z.number().int().nonnegative().nullable().optional(),

  client_id: z.number().int().positive().nullable().optional(),
  client_company_name: z.string().nullable().optional(),
  client_first_name: z.string().nullable().optional(),
  client_last_name: z.string().nullable().optional(),
  client_business_activity_kind: ClientBusinessActivityKind.nullable().optional(),
  client_street: z.string().nullable().optional(),
  client_street_number: z.string().nullable().optional(),
  client_flat_number: z.string().nullable().optional(),
  client_city: z.string().nullable().optional(),
  client_post_code: z.string().nullable().optional(),
  client_tax_code: z.string().nullable().optional(),
  clean_client_nip: z.string().regex(/^\d+$/).nullable().optional(), // search helper
  client_country: z.string().length(2).nullable().optional(), // ISO alpha-2

  check_duplicate_number: z.boolean().nullable().optional(),

  bank_name: z.string().nullable().optional(),
  bank_account: z.string().nullable().optional(),
  swift: z.string().nullable().optional(),

  sale_type: SaleType.nullable().optional(),

  invoice_date_kind: InvoiceDateKind.nullable().optional(),
  continuous_service_start_on: DateYMD.nullable().optional(),
  continuous_service_end_on: DateYMD.nullable().optional(),

  services: z.array(Service).nullable().optional(), // required when creating

  vat_exemption_reason: z.number().int().positive().nullable().optional(),

  bdo_code: z.string().nullable().optional(),
  transaction_kind_id: z.number().int().positive().nullable().optional(),
  document_markings_ids: z.array(z.number().int().positive()).nullable().optional(),

  receipt_number: z.string().nullable().optional(),
  not_income: z.boolean().nullable().optional(),

  vat_exchange_date_kind: VatExchangeDateKind.nullable().optional(),

  local_government_recipient_address: LooseDict.nullable().optional(),
})

export const InvoiceField = z.enum(
  Object.keys(Invoice.shape),
)

// -- Create (write) payload (no read-only fields) ----------------------------

export const InvoiceCreate = z.object({
  number: z.string().nullable().optional(),
  currency: Currency.default('PLN'),
  paid_price: z.number().int().nonnegative().nullable().optional(),
  notes: z.string().nullable().optional(),
  kind: InvoiceKind.default('vat'),
  payment_method: PaymentMethod.nullable().optional(),

  split_payment_available: z.boolean().nullable().optional(),
  split_payment_type: SplitPaymentType.nullable().optional(),

  recipient_signature: z.string().nullable().optional(),
  seller_signature: z.string().nullable().optional(),

  invoice_date: DateYMD,
  sale_date: DateYMD.nullable().optional(),
  payment_date: DateYMD.nullable().optional(),
  paid_date: DateYMD.nullable().optional(),

  // Sums can be omitted; backend usually computes from services
  net_price: z.number().int().nonnegative().nullable().optional(),
  tax_price: z.number().int().nonnegative().nullable().optional(),
  gross_price: z.number().int().nonnegative().nullable().optional(),
  left_to_pay: z.number().int().nonnegative().nullable().optional(),

  // Client identification: either client_id OR inline client fields
  client_id: z.number().int().positive().nullable().optional(),
  client_company_name: z.string().nullable().optional(),
  client_first_name: z.string().nullable().optional(),
  client_last_name: z.string().nullable().optional(),
  client_business_activity_kind: ClientBusinessActivityKind.nullable().optional(),
  client_street: z.string().nullable().optional(),
  client_street_number: z.string().nullable().optional(),
  client_flat_number: z.string().nullable().optional(),
  client_city: z.string().nullable().optional(),
  client_post_code: z.string().nullable().optional(),
  client_tax_code: z.string().nullable().optional(),
  client_country: z.string().length(2).nullable().optional(),

  check_duplicate_number: z.boolean().nullable().optional(),

  bank_name: z.string().nullable().optional(),
  bank_account: z.string().nullable().optional(),
  swift: z.string().nullable().optional(),

  sale_type: SaleType.nullable().optional(),

  invoice_date_kind: InvoiceDateKind.nullable().optional(),
  continuous_service_start_on: DateYMD.nullable().optional(),
  continuous_service_end_on: DateYMD.nullable().optional(),

  services: z.array(Service).min(1, 'At least one service line is required'),

  vat_exemption_reason: z.number().int().positive().nullable().optional().nullable().optional(),

  bdo_code: z.string().nullable().optional(),
  transaction_kind_id: z.number().int().positive().nullable().optional(),
  document_markings_ids: z.array(z.number().int().positive()).nullable().optional(),

  receipt_number: z.string().nullable().optional(),
  not_income: z.boolean().nullable().optional(),

  vat_exchange_date_kind: VatExchangeDateKind.nullable().optional(),

  local_government_recipient_address: LooseDict.nullable().optional(),
})
