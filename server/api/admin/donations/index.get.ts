import { requirePermission } from '../../../features/auth/guards'
import {
  countDonations,
  donationTotals,
  listDonations,
} from '../../../features/donations/repository'
import { formatAmount } from '../../../features/donations/paystack'
import { csvLine } from '../../../utils/csv'
import { parsePage, resolvePage } from '../../../utils/pagination'
import { DONATION_STATUSES, type DonationStatus } from '#shared/types/donations'

/**
 * GET /api/admin/donations
 *   ?status=  ?search=  ?page=  ?pageSize=
 *   ?format=csv  every matching gift, ignoring the page
 */
export default defineEventHandler(async (event) => {
  await requirePermission(event, 'canManageDonations')

  const query = getQuery(event)
  const status =
    typeof query.status === 'string' && DONATION_STATUSES.includes(query.status as DonationStatus)
      ? (query.status as DonationStatus)
      : undefined
  const search = typeof query.search === 'string' ? query.search : undefined
  const filter = { status, search }

  if (query.format === 'csv') {
    const donations = await listDonations(filter)
    const header = [
      'Reference',
      'Date',
      'Status',
      'Donor',
      'Email',
      'Amount (GHS)',
      'Frequency',
      'Stopped on',
      'Refunded on',
      'Method',
      'Note',
    ]

    const lines = donations.map((donation) =>
      csvLine([
        donation.reference,
        donation.paidAt ?? donation.createdAt,
        donation.status,
        donation.donorName,
        donation.donorEmail,
        formatAmount(donation.amountPesewas, donation.currency),
        donation.frequency === 'monthly' ? 'Monthly' : 'One-time',
        donation.cancelledAt ?? '',
        donation.refundedAt ?? '',
        donation.channel ?? '',
        donation.note,
      ]),
    )

    setHeader(event, 'content-type', 'text/csv; charset=utf-8')
    setHeader(event, 'content-disposition', 'attachment; filename="donations.csv"')

    return [header.join(','), ...lines].join('\n')
  }

  const requested = parsePage(event)
  const total = await countDonations(filter)
  const pagination = resolvePage(total, requested)
  const donations = await listDonations({
    ...filter,
    limit: pagination.pageSize,
    offset: pagination.offset,
  })

  return {
    donations,
    totals: await donationTotals(),
    page: pagination.page,
    pageSize: pagination.pageSize,
    total: pagination.total,
    pageCount: pagination.pageCount,
  }
})
