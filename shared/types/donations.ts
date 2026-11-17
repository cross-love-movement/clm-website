export const DONATION_STATUSES = [
  'pending',
  'succeeded',
  'failed',
  'abandoned',
  'refunded',
] as const

export type DonationStatus = (typeof DONATION_STATUSES)[number]

export const DONATION_FREQUENCIES = ['one_time', 'monthly'] as const

export type DonationFrequency = (typeof DONATION_FREQUENCIES)[number]

export interface DonationSummary {
  id: string
  reference: string
  status: DonationStatus
  /** Minor units: GH₵50 is 5000. */
  amountPesewas: number
  currency: string
  frequency: DonationFrequency
  donorName: string
  donorEmail: string
  note: string
  channel: string | null
  paidAt: string | null
  /** Set when the donor stopped a monthly gift. */
  cancelledAt: string | null
  createdAt: string
}

export interface DonationTotals {
  succeededPesewas: number
  succeededCount: number
  pendingCount: number
}
