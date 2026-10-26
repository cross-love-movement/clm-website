import type { Post, PostCategory } from '#shared/types/content'

/**
 * Placeholder newsroom. Posts are written to match the organisation's voice
 * and programmes, but names, dates, and details are illustrative —
 * replace them with real reporting before launch.
 */
export const posts: Post[] = [
  {
    slug: 'cross-sessions-returns-november',
    title: 'Cross Sessions returns to Tema this November',
    category: 'update',
    excerpt:
      'Our next worship night is at Paradise Assembly on 14 November. Here is what to expect and how to register.',
    publishedAt: '2026-10-18T09:00:00+00:00',
    author: 'CLM Team',
    readingMinutes: 3,
    image: '/images/project-gospel.svg',
    imageAlt: 'Abstract artwork of sound waves rising inside a church arch',
    featured: true,
    sections: [
      {
        paragraphs: [
          'The next Cross Sessions evening will be held at The Church of Pentecost, Community 12 District, Paradise Assembly in Tema on Saturday, 14 November 2026.',
          'It has been a full year of smaller gatherings, artiste clinics, and quiet planning. This one is a homecoming.',
        ],
      },
      {
        heading: 'What to expect',
        paragraphs: [
          'An evening of worship led by CLM musicians, short testimonies from the community, and sets from emerging gospel artistes we have been working with. The host church closes the night in prayer.',
          'Doors open at 17:30. The programme starts at 18:00 and ends by 20:30.',
        ],
      },
      {
        heading: 'How to register',
        paragraphs: [
          'The evening is free. Registering helps the host church plan seating, and it means we can send you a reminder two days before.',
          'Places are open until 12 November, or until the room is full.',
        ],
      },
      {
        heading: 'Bring someone',
        paragraphs: [
          'If there is someone in your life who has been carrying a heavy season quietly, bring them. That is the point of the evening.',
        ],
      },
    ],
  },
  {
    slug: 'what-our-first-recycling-volunteers-taught-us',
    title: 'What our first recycling volunteers taught us',
    category: 'story',
    excerpt:
      'We ran our first creation care training for volunteers. Most of what we learned had nothing to do with bins.',
    publishedAt: '2026-10-05T10:00:00+00:00',
    author: 'CLM Team',
    readingMinutes: 4,
    image: '/images/project-environment.svg',
    imageAlt: 'Abstract artwork of a recycling loop around a growing leaf',
    featured: false,
    quote: {
      text: 'The bin is not the hard part. The conversation at the bin is the hard part.',
      attribution: 'A volunteer at the training',
    },
    sections: [
      {
        heading: 'Start where people already are',
        paragraphs: [
          'Our instinct was to begin with the science of plastic: the types, the timelines, the harm. Our volunteers began somewhere else — with what they see in their own streets, drains, and markets every day.',
          'That turned out to be the better starting point. People already have a diagnosis. What they often lack is a practical next step that does not make them feel foolish.',
        ],
      },
      {
        heading: 'The bin is not the hard part',
        paragraphs: [
          'Every participant could name someone who would resist separating waste. A neighbour who says it does not matter. A landlord who will not pay for a second bin. A market that has nowhere to put anything sorted.',
          'So the training shifted from “why recycle” to “how do you answer the person who says it does not matter, without lecturing them?” That is a harder skill, and it is the one our volunteers will actually use.',
        ],
      },
      {
        heading: 'What happens next',
        paragraphs: [
          'The first volunteers will run short sessions in two churches and a school before the end of the year. We will report what worked — including what did not — rather than waiting for a tidy success story.',
        ],
      },
    ],
  },
  {
    slug: 'three-voices-from-the-artiste-clinic',
    title: 'Three voices from the artiste clinic',
    category: 'story',
    excerpt:
      'A songwriter, a worship leader, and someone who almost quit. Notes from the first Gospel Artiste Clinic.',
    publishedAt: '2026-09-21T09:30:00+00:00',
    author: 'CLM Team',
    readingMinutes: 5,
    image: '/images/project-artistes.svg',
    imageAlt: 'Abstract artwork of a microphone under a warm spotlight',
    featured: false,
    quote: {
      text: 'I came to learn how to sing better. I left wanting to keep singing at all.',
      attribution: 'A clinic participant',
    },
    sections: [
      {
        paragraphs: [
          'This piece is a composite of conversations from the clinic. Names and small details have been changed, and each person agreed to us sharing the shape of their story.',
        ],
      },
      {
        heading: 'The songwriter',
        paragraphs: [
          'She has written more than forty songs and recorded none of them. The reasons are ordinary: studio time costs money, and asking for money feels like asking for permission.',
          'The clinic did not solve that. What it gave her was a room of people who took the songs seriously enough to critique them. She left with one song rewritten and two producers’ phone numbers.',
        ],
      },
      {
        heading: 'The worship leader',
        paragraphs: [
          'He leads a small congregation and has been singing in churches since he was a teenager. His struggle is subtler: he has learned to perform for a room and forgotten how to sing without watching it.',
          'Most of his clinic time was spent on breathing, restraint, and the difference between leading people and impressing them.',
        ],
      },
      {
        heading: 'The one who almost quit',
        paragraphs: [
          'The most useful hour of the day was not about music at all. It was a conversation about money, family expectations, and the quiet shame of still being unknown at thirty.',
          'He came in planning to stop. He left with a plan for the next six months instead. We will take that as a win, and we will keep checking in.',
        ],
      },
    ],
  },
  {
    slug: 'why-we-sing-about-plastic',
    title: 'Why we sing about plastic',
    category: 'reflection',
    excerpt: 'Creation care is not a side project for us. It is part of what it means to worship.',
    publishedAt: '2026-09-02T08:00:00+00:00',
    author: 'Edward Opoku-Agyemang',
    readingMinutes: 4,
    image: '/images/project-community.svg',
    imageAlt: 'Abstract artwork of overlapping circles and a small group of people',
    featured: false,
    quote: {
      text: 'The earth is the Lord’s, and everything in it.',
      attribution: 'Psalm 24:1',
    },
    sections: [
      {
        paragraphs: [
          'In Ghana, plastic waste is not an abstraction. It is in the drains that flood the market, in the waterways behind the church, in the smoke when someone burns a pile behind the house.',
          'You cannot sing about the God who made the world and then treat the world as someone else’s problem. At least, we cannot.',
        ],
      },
      {
        heading: 'The earth is not a backdrop',
        paragraphs: [
          'Worship is not only what happens with our voices. It is also what we do with what we have been given — including the land, water, and air our neighbours depend on.',
          'That is why creation care sits alongside Gospel outreach and artiste development in our constitution, rather than at the end of a list of nice things to do when funding allows.',
        ],
      },
      {
        heading: 'Music travels further than a leaflet',
        paragraphs: [
          'A workshop can teach a household to separate waste. A song can make the habit stick, and can reach the neighbour who would never attend a workshop.',
          'We are not naive about this. A song does not collect the plastic. But it changes what people think is normal, and normal is where habits live.',
        ],
      },
      {
        heading: 'What this looks like in practice',
        paragraphs: [
          'Trained volunteers teaching in churches and schools. Sorting bins where people actually gather. Music and content that name the problem without turning it into a slogan.',
          'It is slow, unglamorous work. It is also the kind that lasts.',
        ],
      },
    ],
  },
  {
    slug: 'what-a-church-in-bawku-asked-us-for',
    title: 'What a church in Bawku asked us for',
    category: 'story',
    excerpt:
      'When we visited Bakanga Assembly, we expected to talk about music. Their list was more practical.',
    publishedAt: '2026-08-15T11:00:00+00:00',
    author: 'CLM Team',
    readingMinutes: 3,
    image: '/images/project-gospel.svg',
    imageAlt: 'Abstract artwork of sound waves rising inside a church arch',
    featured: false,
    sections: [
      {
        paragraphs: [
          'We arrived with questions about repertoire, rehearsal, and what kind of session the assembly wanted. The leadership listened politely and then gave us a different list.',
        ],
      },
      {
        heading: 'The list',
        paragraphs: [
          'Chairs. A keyboard that works every week, not only when someone lends one. Transport for visiting preachers. A roof repair that has been postponed for two rainy seasons.',
          'None of it is romantic. All of it shapes whether a congregation can worship without fighting the room.',
        ],
      },
      {
        heading: 'Why instruments are not a small thing',
        paragraphs: [
          'A church without a reliable instrument still sings. It just works much harder, and the young people who could lead often drift to places with better equipment.',
          'Supporting a missionary church with instruments and seating is one of the twelve objectives in our constitution. It is also one of the clearest ways to honour a community that is already doing the work.',
        ],
      },
      {
        heading: 'Where this goes next',
        paragraphs: [
          'We are still sourcing what Bakanga Assembly needs. We will not pretend the list is finished. When it is, we will say what was supplied, what it cost, and what is still outstanding.',
        ],
      },
    ],
  },
  {
    slug: 'a-morning-at-tudu-market',
    title: 'A morning at Tudu Market',
    category: 'story',
    excerpt: 'What street feeding looks like when you stop moving long enough to talk.',
    publishedAt: '2026-07-28T12:00:00+00:00',
    author: 'CLM Team',
    readingMinutes: 4,
    image: '/images/project-community.svg',
    imageAlt: 'Abstract artwork of overlapping circles and a small group of people',
    featured: false,
    sections: [
      {
        paragraphs: [
          'We arrived before the market was fully awake, with pots, serving spoons, and the particular nervousness of people who are not sure they have brought enough.',
          'By seven, the queue had formed. By nine, it was gone. The morning was less about the food than about how quickly a queue becomes a conversation.',
        ],
      },
      {
        heading: 'More than food',
        paragraphs: [
          'Someone asked whether we were coming back next month. Someone else asked for a phone number because a relative needed help with a hospital bill we could not cover.',
          'We do not have an answer for every request. Pretending otherwise would be dishonest. What we can do is write it down, follow up where we can, and come back.',
        ],
      },
      {
        heading: 'What we got wrong',
        paragraphs: [
          'We brought too much rice and not enough water. We ran out of cups before we ran out of food. Two volunteers spent most of the morning managing a queue instead of talking to anyone.',
          'Next time we will bring less of what we assumed and more of what people asked for.',
        ],
      },
      {
        heading: 'Come next time',
        paragraphs: [
          'Outreach days are volunteer-led and open to anyone willing to work. Register on our events page and we will send the meeting point and what to bring.',
        ],
      },
    ],
  },
]

export const postCategoryLabels: Record<PostCategory, string> = {
  story: 'Story',
  update: 'Update',
  reflection: 'Reflection',
  event: 'Event',
}

export const postCategories: { value: 'all' | PostCategory; label: string }[] = [
  { value: 'all', label: 'All posts' },
  { value: 'story', label: 'Stories' },
  { value: 'update', label: 'Updates' },
  { value: 'reflection', label: 'Reflections' },
]
