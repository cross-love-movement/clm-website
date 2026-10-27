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
    slug: 'awake-with-god',
    name: 'Awake With God',
    detail: 'Devotion · Accra',
    mark: 'AWG',
    type: 'ministry',
  },
  {
    slug: 'your-church',
    name: 'Your church',
    detail: 'Host a Cross Session',
    mark: '+',
    type: 'church',
    placeholder: true,
  },
  {
    slug: 'your-company',
    name: 'Your company',
    detail: 'CSR and employee giving',
    mark: '+',
    type: 'corporate',
    placeholder: true,
  },
  {
    slug: 'your-school',
    name: 'Your school',
    detail: 'Creation care sessions',
    mark: '+',
    type: 'school',
    placeholder: true,
  },
]
