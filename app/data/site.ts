import type { NavLink, SocialLink } from '#shared/types/content'

export const site = {
  name: 'Cross-Love Movement',
  shortName: 'CLM',
  legalName: 'Cross-Love Movement Limited By Guarantee',
  tagline: 'Faith. Creativity. Inclusion.',
  description:
    'Cross-Love Movement is a Christian, non-denominational nonprofit network of young creatives and youthful advocates in Ghana, using faith, creativity, and inclusion to empower young people to build sustainable societies.',
  email: 'info@crosslovemovement.org',
  website: 'https://cross-lovemovement.my.canva.site/',
  phone: '+233 53 050 2774',
  phoneHref: '+233530502774',
  address: {
    line1: '64 Thirdes',
    line2: 'GT-197-1816',
    city: 'Tema Community 12',
    region: 'Greater Accra',
    country: 'Ghana',
  },
  hours: 'Monday – Friday, 9:00 – 17:00 GMT',
  founded: '2018',
  registration: {
    authority: 'Registrar General’s Department',
    number: 'CG041650523',
    tin: 'C0062926586',
    date: '18 May 2023',
  },
} as const

export const primaryNav: NavLink[] = [
  { label: 'About', to: '/about' },
  { label: 'Our Projects', to: '/projects' },
  { label: 'Events', to: '/events' },
  { label: 'News', to: '/news' },
  { label: 'Portfolio', to: '/portfolio' },
  { label: 'Volunteer', to: '/volunteer' },
  { label: 'Partnership', to: '/partnership' },
  { label: 'Contact', to: '/contact' },
]

export const footerNav: { heading: string; links: NavLink[] }[] = [
  {
    heading: 'Organisation',
    links: [
      { label: 'About us', to: '/about' },
      { label: 'Our projects', to: '/projects' },
      { label: 'Events', to: '/events' },
      { label: 'News', to: '/news' },
      { label: 'Portfolio', to: '/portfolio' },
      { label: 'Contact', to: '/contact' },
    ],
  },
  {
    heading: 'Get involved',
    links: [
      { label: 'Volunteer', to: '/volunteer' },
      { label: 'Partner with us', to: '/partnership' },
      { label: 'Donate', to: '/donate' },
    ],
  },
]

export const socials: SocialLink[] = [
  { label: 'Instagram', href: 'https://www.instagram.com/clm_native/', icon: 'instagram' },
  { label: 'X', href: 'https://x.com/clm_native', icon: 'x' },
  {
    label: 'YouTube',
    href: 'https://www.youtube.com/channel/UCbAS2leNz-vWamXQgxmPr0A',
    icon: 'youtube',
  },
  {
    label: 'LinkedIn',
    href: 'https://www.linkedin.com/company/cross-love-movement',
    icon: 'linkedin',
  },
  { label: 'WhatsApp', href: 'https://wa.me/233530502774', icon: 'whatsapp' },
]
