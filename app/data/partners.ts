import type { Partner } from '#shared/types/content'

/**
 * Partner strip. Only the three named churches/ministries are documented in
 * CLM's profile; the dashed entries are open slots, not real partners.
 * Add `logo: '/images/partners/<file>.svg'` to a partner once you have an
 * authorised logo file.
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
