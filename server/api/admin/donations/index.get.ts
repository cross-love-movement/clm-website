import { requirePermission } from '../../../features/auth/guards'
import { donationTotals, listDonations } from '../../../features/donations/repository'
import { formatAmount } from '../../../features/donations/paystack'
import { DONATION_STATUSES, type DonationStatus } from '#shared/types/donations'

function csvCell(value: string) {
  return /[",\n]/.test(value) ? `"${value.replace(/"/g, '""')}"` : value
}

/** Every gift, newest first. `?format=csv` is the accountant's copy. */
export default defineEventHandler(async (event) => {
  await requirePermission(event, 'canManageDonations')

  const query = getQuery(event)
  const status =
    typeof query.status === 'string' && DONATION_STATUSES.includes(query.status as DonationStatus)
      ? (query.status as DonationStatus)
      : undefined
  const search = typeof query.search === 'string' ? query.search : undefined

  const donations = await listDonations({ status, search })

  if (query.format === 'csv') {
    const header = [
      'Reference',
      'Date',
      'Status',
      'Donor',
      'Email',
      'Amount (GHS)',
      'Frequency',
      'Method',
      'Note',
    ]

    const lines = donations.map((donation) =>
      [
        donation.reference,
        donation.paidAt ?? donation.createdAt,
        donation.status,
        donation.donorName,
        donation.donorEmail,
        formatAmount(donation.amountPesewas, donation.currency),
        donation.frequency === 'monthly' ? 'Monthly' : 'One-time',
        donation.channel ?? '',
        donation.note,
      ]
        .map((cell) => csvCell(String(cell)))
        .join(','),
    )

    setHeader(event, 'content-type', 'text/csv; charset=utf-8')
    setHeader(event, 'content-disposition', 'attachment; filename="donations.csv"')

    return [header.join(','), ...lines].join('\n')
  }

  return {
    donations,
    totals: await donationTotals(),
  }
})
