import type { Partner } from '#shared/types/content'

/**
 * Partner strip. Every entry is a relationship the organisation can name —
 * there are no "your church here" slots, because a placeholder is still a
 * claim about a partner we do not have.
 *
 * Add `logo: '/images/partners/<file>.svg'` once that partner has given
 * written permission for the mark.
 */
export const partners: Partner[] = [
  {
    slug: 'cop-community-12',
    name: 'The Church of Pentecost',
    detail: 'Community 12 District · Tema',
    mark: 'COP',
    type: 'church',
  },
  {
    slug: 'cop-bawku',
    name: 'The Church of Pentecost',
    detail: 'Bawku District · Upper East',
    mark: 'COP',
    type: 'church',
  },
  {
    slug: 'alone-with-god',
    name: 'Alone With God',
    detail: 'Devotion · Accra',
    mark: 'AWG',
    type: 'ministry',
  },
]
