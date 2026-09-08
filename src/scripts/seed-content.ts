import { bulletList, heading, paragraph, paragraphs, richText } from '@/lib/lexical'

/**
 * Seed content.
 *
 * Business facts here come from the audit of the old smartmove4u.co.uk site
 * and nothing else. Scheme names, membership numbers and package prices the
 * old site never published are still listed in docs/client-content-required.md
 * rather than invented.
 */

export const businessDetails = {
  companyName: 'Smart Move',
  tagline: 'Independent letting agents in Scunthorpe',
  telephone: '01724 856260',
  email: 'smartmove4u@muradsprojects.co.uk',
  enquiriesEmail: 'smartmove4u@muradsprojects.co.uk',
  address: {
    line1: '96 Frodingham Road',
    line2: '',
    town: 'Scunthorpe',
    county: 'North Lincolnshire',
    postcode: 'DN15 7JW',
  },
  openingHours: [
    { days: 'Monday to Friday', hours: '9:30am to 5:30pm' },
    { days: 'Saturday', hours: 'By appointment only' },
    { days: 'Sunday', hours: 'Closed' },
  ],
  // The old site never named these schemes. Short, honest lines until the
  // membership details are confirmed and can go in the footer properly.
  redressScheme:
    'We belong to a government-approved redress scheme. Ask the office for the current membership details.',
  clientMoneyProtection:
    'Client money is protected. Ask the office for our Client Money Protection membership details.',
  depositScheme:
    'Tenant deposits are protected in a government-approved tenancy deposit scheme.',
  registeredName: '',
  companyNumber: '',
  footerNote:
    'Independent letting agents at 96 Frodingham Road, Scunthorpe. Call 01724 856260.',
}

export const siteSettings = {
  mainNav: [
    { label: 'Properties', href: '/properties' },
    { label: 'Landlords', href: '/landlords' },
    { label: 'Tenants', href: '/tenants' },
    { label: 'Services', href: '/services' },
    { label: 'About', href: '/about' },
    { label: 'Contact', href: '/contact' },
  ],
  headerCta: { label: 'Book a valuation', href: '/landlords#enquiry' },
  footerColumns: [
    {
      title: 'Renting',
      links: [
        { label: 'Properties to rent', href: '/properties' },
        { label: 'Information for tenants', href: '/tenants' },
        { label: 'Register your requirements', href: '/register-interest' },
        { label: 'Tenant fees', href: '/tenant-fees' },
      ],
    },
    {
      title: 'Landlords',
      links: [
        { label: 'Letting your property', href: '/landlords' },
        { label: 'Our services', href: '/services' },
        { label: 'Book a valuation', href: '/landlords#enquiry' },
      ],
    },
    {
      title: 'Smart Move',
      links: [
        { label: 'About us', href: '/about' },
        { label: 'Contact us', href: '/contact' },
      ],
    },
  ],
  legalLinks: [
    { label: 'Privacy policy', href: '/privacy-policy' },
    { label: 'Cookie policy', href: '/cookie-policy' },
    { label: 'Terms of use', href: '/terms' },
    { label: 'Tenant fees', href: '/tenant-fees' },
  ],
  defaultSeo: {
    titleSuffix: 'Smart Move | Letting Agents in Scunthorpe',
    description:
      'Smart Move is an independent letting agent in Scunthorpe offering property lettings, full property management and tenant finding across North Lincolnshire.',
  },
}

export const homePage = {
  hero: {
    autoplay: true,
    slides: [
      {
        heading: 'Letting and managing property in Scunthorpe',
        subheading:
          'An independent, locally based letting agent looking after landlords and tenants across Scunthorpe and North Lincolnshire.',
        primaryCta: { label: 'See available properties', href: '/properties' },
        secondaryCta: { label: 'Book a valuation', href: '/landlords#enquiry' },
      },
      {
        heading: 'Full management, handled end to end',
        subheading:
          'Marketing, referencing, rent collection, inspections and repairs. You get a statement every month and someone who picks up the phone.',
        primaryCta: { label: 'What management covers', href: '/services/property-management' },
        secondaryCta: { label: 'Book a valuation', href: '/landlords#enquiry' },
      },
      {
        heading: 'Looking for somewhere to rent?',
        subheading:
          'Houses, flats and bungalows across Scunthorpe and the surrounding villages, listed as soon as they become available.',
        primaryCta: { label: 'Browse properties', href: '/properties' },
        secondaryCta: { label: 'Register your requirements', href: '/register-interest' },
      },
    ],
  },
  highlights: [
    { title: 'Locally based', description: 'Our office is on Frodingham Road in Scunthorpe.' },
    { title: 'Independent', description: 'You deal with the same people every time.' },
    { title: 'Fully managed lettings', description: 'From marketing through to rent collection.' },
  ],
  intro: {
    heading: 'A letting agent that answers the phone',
    body: paragraphs(
      'Smart Move is an independent letting agent based in Scunthorpe. We look after residential lettings and property management for landlords across North Lincolnshire, and we help tenants find somewhere they actually want to live.',
      'Because we are independent and local, you speak to the people who know your property rather than a call centre. Whether you own one property or several, we can take on as much or as little of the work as you would like.',
    ),
  },
  stats: [
    { value: 'From 8%', label: 'Property management' },
    { value: 'Local', label: 'Office on Frodingham Road' },
    { value: 'Free', label: 'Rental valuations' },
    { value: '1', label: 'Point of contact, start to finish' },
  ],
  featuredProperties: {
    heading: 'Available to rent now',
    intro: 'A selection of what we currently have on our books.',
    limit: 3,
  },
  landlords: {
    heading: 'Letting your property, without the hassle',
    body: 'From finding the right tenant to collecting the rent and organising repairs, we can handle the parts you would rather not.',
    points: [
      { text: 'Free rental valuation with no obligation' },
      { text: 'Tenant referencing and credit checks' },
      { text: 'Rent collection and monthly statements' },
      { text: 'Repairs and maintenance coordinated for you' },
      { text: 'Regular property inspections' },
    ],
    cta: { label: 'Talk to us about letting', href: '/landlords' },
  },
  tenants: {
    heading: 'Looking for somewhere to rent?',
    body: 'We list properties across Scunthorpe and the surrounding villages, and we are straight with you about what is and is not available.',
    points: [
      { text: 'Browse everything we have available online' },
      { text: 'Arrange a viewing by phone or through the website' },
      { text: 'Clear information about fees and deposits' },
      { text: 'Tell us what you are looking for and we will call you' },
    ],
    cta: { label: 'Browse properties', href: '/properties' },
  },
  whyUs: {
    heading: 'Why people choose Smart Move',
    intro: 'An established independent agency with its own office in the centre of Scunthorpe.',
    reasons: [
      {
        title: 'Local knowledge',
        icon: 'house',
        description:
          'We live and work in Scunthorpe, so we know what a property should let for and how quickly.',
      },
      {
        title: 'Independent',
        icon: 'shield',
        description:
          'No head office targets. We give you a straight answer about what your property will achieve.',
      },
      {
        title: 'One point of contact',
        icon: 'people',
        description: 'You deal with the same people from valuation through to move-in and beyond.',
      },
      {
        title: 'Flexible service levels',
        icon: 'key',
        description:
          'Take the full management service, or just tenant finding, depending on how involved you want to be.',
      },
      {
        title: 'Properly referenced tenants',
        icon: 'document',
        description: 'Credit checks and referencing on every application before we recommend it.',
      },
      {
        title: 'Repairs handled',
        icon: 'spanner',
        description:
          'We arrange trades, oversee the work and keep you informed, so you are not chasing anyone.',
      },
    ],
  },
  testimonials: {
    heading: 'What people say about us',
    intro: 'Reviews from landlords and tenants we look after will appear here.',
    // Empty on a real seed so the home page hides the section. Demo quotes
    // live in `demoHomeTestimonials` and are applied only with SEED_DEMO.
    items: [],
  },
  closingCta: {
    heading: 'Thinking about letting your property?',
    text: 'Book a free rental valuation and we will tell you honestly what it should achieve.',
    buttons: [
      { label: 'Book a valuation', href: '/landlords#enquiry' },
      { label: 'Contact us', href: '/contact' },
    ],
  },
}

/**
 * DEMO CONTENT. Written to show the home page reviews section working and
 * attributed to people who do not exist. Nothing here came from a real
 * customer, and none of it may go live. Only applied when `SEED_DEMO=true`.
 * See docs/client-content-required.md.
 */
export const demoHomeTestimonials = {
  heading: 'What people say about us',
  intro: 'A few words from landlords and tenants we look after.',
  items: [
    {
      quote:
        'We have rented through Smart Move for three years and any time something has gone wrong they have sorted it within a couple of days. The boiler packed in over a bank holiday and someone was out on the Tuesday morning.',
      name: 'Rachel Bennett',
      role: 'tenant' as const,
    },
    {
      quote:
        'I have got four properties with them on full management and honestly I barely think about them. The statement comes through every month, and if there is a problem I hear it from them before I hear it from the tenant.',
      name: 'Dave Thornhill',
      role: 'landlord' as const,
    },
    {
      quote:
        'Moved up from Doncaster and did not know the area at all. They were straight with me about which streets would suit and did not push me at anything over my budget. Had the keys within a fortnight.',
      name: 'Priya Sharma',
      role: 'tenant' as const,
    },
  ],
}

export const services = [
  {
    title: 'Property management',
    slug: 'property-management',
    icon: 'shield',
    audience: 'landlords',
    order: 10,
    summary:
      'A fully managed service covering marketing, tenants, rent, inspections and repairs, so you do not have to be involved day to day.',
    layout: [
      {
        blockType: 'text',
        heading: 'What full management covers',
        body: paragraphs(
          'Our management service is designed to take the running of a rental property off your hands. We market the property, find and reference the tenant, collect the rent, inspect the property and arrange any repairs that come up.',
          'You receive a monthly statement, and you can call us any time to ask how things are going.',
        ),
      },
      {
        blockType: 'featureList',
        heading: 'Included in the service',
        columns: '3',
        background: 'grey',
        items: [
          {
            title: 'Free rental valuation',
            description: 'An honest figure for what your property should achieve.',
          },
          {
            title: 'Marketing',
            description: 'Photographs, a written description and listing on this website.',
          },
          {
            title: 'Referencing and credit checks',
            description: 'Every applicant is checked before we recommend them.',
          },
          {
            title: 'Tenancy agreements',
            description: 'Drawing up, granting and renewing agreements.',
          },
          {
            title: 'Deposit administration',
            description: 'Registering and handling the deposit correctly.',
          },
          {
            title: 'Inventories',
            description: 'A written record of condition at the start of the tenancy.',
          },
          {
            title: 'Rent collection',
            description: 'Standing orders set up and payments chased if they are late.',
          },
          {
            title: 'Monthly accounting',
            description: 'A statement each month showing what has come in and gone out.',
          },
          {
            title: 'Repairs and maintenance',
            description: 'We arrange the trades and oversee the work.',
          },
          {
            title: 'Property inspections',
            description: 'Regular visits with a written report back to you.',
          },
          { title: 'Landlord support', description: 'Someone to call when you need an answer.' },
        ],
      },
      {
        blockType: 'text',
        heading: 'Fees',
        body: paragraphs(
          'Full management starts from 8% of the monthly rent, plus VAT. The exact rate depends on the property and how much you want us to handle day to day.',
          'We will talk through what you need at the valuation and put a clear figure in writing before you sign anything. There is no charge for the valuation itself.',
        ),
      },
      {
        blockType: 'form',
        heading: 'Book a free valuation',
        intro: 'Tell us about your property and we will call you back.',
        formType: 'landlord',
      },
    ],
  },
  {
    title: 'Tenant finding and lettings',
    slug: 'tenant-finding',
    icon: 'key',
    audience: 'landlords',
    order: 20,
    summary:
      'If you manage the property yourself but want help finding and referencing the right tenant.',
    layout: [
      {
        blockType: 'text',
        body: paragraphs(
          'If you are happy to look after the property yourself but would rather not deal with advertising, viewings and referencing, our tenant finding service covers just that part.',
          'We market the property, carry out the viewings, reference the applicants and hand over to you once the tenancy is signed.',
        ),
      },
      {
        blockType: 'steps',
        heading: 'How it works',
        steps: [
          { title: 'Valuation', description: 'We visit the property and agree a realistic rent.' },
          {
            title: 'Marketing',
            description: 'Photographs, description and listing on this website.',
          },
          { title: 'Viewings', description: 'We show applicants round and report back to you.' },
          { title: 'Referencing', description: 'Credit checks and references before you commit.' },
        ],
      },
      {
        blockType: 'text',
        heading: 'Fees',
        body: paragraphs(
          'Tenant finding is a one-off fee, charged when a tenancy is signed. We confirm the figure in writing before we start marketing, so you know where you stand.',
          'Call the office or book a valuation and we will quote you for your property.',
        ),
      },
      {
        blockType: 'form',
        heading: 'Enquire about tenant finding',
        formType: 'landlord',
      },
    ],
  },
  {
    title: 'Rent collection',
    slug: 'rent-collection',
    icon: 'pound',
    audience: 'landlords',
    order: 30,
    summary: 'We collect the rent, chase it when it is late and send you a statement each month.',
    layout: [
      {
        blockType: 'text',
        body: paragraphs(
          'Rent collection sits between tenant finding and full management. We set up the standing order, monitor payments, chase anything that is late and send you a monthly statement.',
          'You stay in charge of repairs and inspections, and we handle the money.',
        ),
      },
      {
        blockType: 'text',
        heading: 'Fees',
        body: paragraphs(
          'Rent collection is charged as a percentage of the rent collected each month, plus VAT. We will quote you before we take anything on.',
          'If you later decide you would rather have full management, we can move you across without starting from scratch.',
        ),
      },
      {
        blockType: 'form',
        heading: 'Enquire about rent collection',
        formType: 'landlord',
      },
    ],
  },
  {
    title: 'Energy Performance Certificates',
    slug: 'epcs',
    icon: 'chart',
    audience: 'landlords',
    order: 40,
    summary:
      'An EPC is a legal requirement before a property is marketed to let. We can arrange one for you.',
    layout: [
      {
        blockType: 'text',
        body: paragraphs(
          'An Energy Performance Certificate rates a property from A to G for energy efficiency, and includes a report on what could be improved. It is valid for ten years.',
          'You need a valid EPC before a property is marketed for rent, and you must give a copy to the tenant.',
        ),
      },
      {
        blockType: 'faq',
        heading: 'Common questions',
        items: [
          {
            question: 'Do I need an EPC for a rental property?',
            answer: paragraphs(
              'Yes. An EPC must be in place before a property is marketed to let, and a copy must be given to the tenant.',
            ),
          },
          {
            question: 'How long is an EPC valid for?',
            answer: paragraphs('Ten years from the date it is issued.'),
          },
          {
            question: 'What does an EPC cost?',
            answer: paragraphs(
              'We can arrange an EPC for £69.99 including VAT. Call the office on 01724 856260 if you would like one booked in.',
            ),
          },
        ],
      },
      {
        blockType: 'form',
        heading: 'Arrange an EPC',
        formType: 'landlord',
      },
    ],
  },
  {
    title: 'Finding a home',
    slug: 'finding-a-home',
    icon: 'house',
    audience: 'tenants',
    order: 50,
    summary:
      'Browse what we have available, book a viewing and apply. We will be straight with you about what is and is not a fit.',
    layout: [
      {
        blockType: 'text',
        body: paragraphs(
          'Every property we have to let is listed on this website and kept up to date. You can filter by bedrooms, rent and type, then send an enquiry or call the office to book a viewing.',
          'If nothing suitable is up today, tell us what you need and we will contact you when something comes in.',
        ),
      },
      {
        blockType: 'steps',
        heading: 'How renting with us works',
        steps: [
          {
            title: 'Find a property',
            description: 'Browse what is available and filter by bedrooms, rent and type.',
          },
          {
            title: 'Arrange a viewing',
            description: 'Send an enquiry or call the office and we will book you in.',
          },
          {
            title: 'Apply',
            description:
              'We take your details and carry out referencing and credit checks before anything is agreed.',
          },
          {
            title: 'Move in',
            description:
              'You sign the tenancy agreement, pay the deposit and first month, and collect the keys.',
          },
        ],
      },
      {
        blockType: 'callToAction',
        heading: 'See what is available',
        text: 'Have a look at current listings, or register if you cannot see the right thing yet.',
        buttons: [
          { label: 'Browse properties', href: '/properties' },
          { label: 'Register your requirements', href: '/register-interest' },
        ],
      },
      {
        blockType: 'form',
        heading: 'Tell us what you are looking for',
        intro: 'The more you tell us, the better we can match you.',
        formType: 'requirements',
      },
    ],
  },
  {
    title: 'Fees and deposits',
    slug: 'fees-and-deposits',
    icon: 'document',
    audience: 'tenants',
    order: 60,
    summary:
      'What you pay to rent through us, including the holding deposit, the tenancy deposit and the other payments the law allows.',
    layout: [
      {
        blockType: 'text',
        body: paragraphs(
          'Letting agents in England can only ask tenants for certain payments. We will confirm the exact figures in writing before you pay anything.',
          'For most tenancies the holding deposit is one week\'s rent and the tenancy deposit is five weeks\' rent, which is the legal maximum where the yearly rent is under £50,000. Your deposit is protected in a government-approved scheme.',
        ),
      },
      {
        blockType: 'featureList',
        heading: 'What this covers',
        columns: '2',
        background: 'grey',
        items: [
          {
            title: 'Holding deposit',
            description: "Equivalent to one week's rent. Put towards your first rent if the tenancy goes ahead.",
          },
          {
            title: 'Tenancy deposit',
            description:
              'Usually five weeks\' rent, protected in a government-approved scheme until you move out.',
          },
          {
            title: 'Rent',
            description: 'As set out in your tenancy agreement, paid monthly in advance.',
          },
          {
            title: 'Other permitted payments',
            description:
              'Changes to the tenancy, early termination and default fees only where the law allows.',
          },
        ],
      },
      {
        blockType: 'callToAction',
        heading: 'The full list',
        text: 'The tenant fees page sets out every payment we may ask for under the Tenant Fees Act 2019.',
        buttons: [{ label: 'Read the tenant fees page', href: '/tenant-fees' }],
      },
    ],
  },
  {
    title: 'During your tenancy',
    slug: 'during-your-tenancy',
    icon: 'spanner',
    audience: 'tenants',
    order: 70,
    summary:
      'How to report a repair, what happens to your deposit, and how to get hold of us once you have moved in.',
    layout: [
      {
        blockType: 'text',
        body: paragraphs(
          'Once you have the keys, the office on Frodingham Road is still the place to come. Call 01724 856260 or send a message through this website and we will pick it up.',
          'If something cannot wait, such as a complete loss of heating or a serious leak, use the same number and we will talk you through what to do. Outside opening hours, leave a message and we will pick it up first thing the next working day.',
        ),
      },
      {
        blockType: 'featureList',
        heading: 'Once you have moved in',
        columns: '2',
        background: 'grey',
        items: [
          {
            title: 'Repairs',
            description:
              'Tell us as soon as something is wrong. We will arrange a contractor and keep you posted.',
          },
          {
            title: 'Your deposit',
            description:
              'It stays in a government-approved scheme for the length of the tenancy. We will explain how it is released when you leave.',
          },
          {
            title: 'Rent',
            description: 'Paid by standing order. If a payment is going to be late, call us before it is due.',
          },
          {
            title: 'The office',
            description: 'Monday to Friday, 9:30am to 5:30pm, at 96 Frodingham Road, Scunthorpe.',
          },
        ],
      },
      {
        blockType: 'form',
        heading: 'Send us a message',
        intro: 'We aim to reply the same working day.',
        formType: 'general',
      },
    ],
  },
]

export const pages = [
  {
    title: 'Landlords',
    slug: 'landlords',
    hero: {
      heading: 'Letting your property in Scunthorpe',
      subheading:
        'Whether you have one property or a portfolio, we can take on as much of the work as you would like.',
    },
    layout: [
      {
        blockType: 'text',
        heading: 'A service built around you',
        body: paragraphs(
          'Smart Move looks after residential lettings and property management for landlords across Scunthorpe and North Lincolnshire. We can find you a tenant and hand over, or run the property from end to end.',
          'Everything starts with a free rental valuation. We will visit the property, tell you honestly what it should achieve, and explain what we would do to let it.',
        ),
      },
      {
        blockType: 'featureList',
        heading: 'What we can do for you',
        intro: 'Choose the level of service that suits how involved you want to be.',
        columns: '3',
        background: 'grey',
        items: [
          { title: 'Free rental valuation', description: 'No obligation and no charge.' },
          {
            title: 'Marketing your property',
            description: 'Photographs, description and listing on this website.',
          },
          {
            title: 'Finding a tenant',
            description: 'Accompanied viewings and feedback after each one.',
          },
          { title: 'Referencing', description: 'Credit checks and references on every applicant.' },
          {
            title: 'Rent collection',
            description: 'Payments monitored and chased if they are late.',
          },
          { title: 'Maintenance', description: 'We arrange the trades and oversee the work.' },
          { title: 'Inspections', description: 'Regular visits with a written report.' },
          { title: 'Deposits', description: 'Registered and handled correctly.' },
          { title: 'Monthly accounting', description: 'A clear statement every month.' },
        ],
      },
      {
        blockType: 'steps',
        heading: 'How letting with us works',
        steps: [
          { title: 'Free valuation', description: 'We visit and agree a realistic rent.' },
          { title: 'Marketing', description: 'The property goes live and viewings begin.' },
          { title: 'Referencing', description: 'We check applicants and recommend the right one.' },
          {
            title: 'Move in',
            description: 'Agreement signed, inventory taken, deposit protected.',
          },
        ],
      },
      {
        blockType: 'text',
        heading: 'Our fees',
        body: paragraphs(
          'Full management starts from 8% of the monthly rent, plus VAT. Tenant finding is a one-off fee when a tenancy is signed. Rent collection sits between the two and is charged monthly.',
          'Every property is a bit different, so we quote in writing after the valuation rather than publishing a long menu of packages. The valuation itself is free and there is no obligation to go ahead.',
        ),
      },
      {
        blockType: 'form',
        heading: 'Book a free rental valuation',
        intro: 'Fill in your details and we will call you back to arrange a convenient time.',
        formType: 'landlord',
      },
    ],
  },
  {
    title: 'Tenants',
    slug: 'tenants',
    hero: {
      heading: 'Renting through Smart Move',
      subheading: 'What to expect from finding a property to picking up the keys.',
    },
    layout: [
      {
        blockType: 'text',
        body: paragraphs(
          'We list every property we have available on this website and keep it up to date. If you cannot see what you are looking for, register your requirements and we will contact you as soon as something suitable comes in.',
        ),
      },
      {
        blockType: 'steps',
        heading: 'How renting with us works',
        steps: [
          {
            title: 'Find a property',
            description: 'Browse what is available and filter by bedrooms, rent and type.',
          },
          {
            title: 'Arrange a viewing',
            description: 'Send an enquiry or call the office and we will book you in.',
          },
          {
            title: 'Apply',
            description:
              'If you would like the property, we take your details and carry out referencing and credit checks.',
          },
          {
            title: 'Move in',
            description:
              'You sign the tenancy agreement, pay the deposit and first month, and collect the keys.',
          },
        ],
      },
      {
        blockType: 'featureList',
        heading: 'Things worth knowing',
        columns: '2',
        background: 'grey',
        items: [
          {
            title: 'Referencing',
            description:
              'We check your credit history, income and previous landlord references before an application is agreed.',
          },
          {
            title: 'Your deposit',
            description:
              'Your deposit is protected in a government-approved tenancy deposit scheme. For most tenancies this is the equivalent of five weeks\' rent, which is the legal maximum where the yearly rent is under £50,000. We will tell you the exact amount, and which scheme it sits in, before you sign.',
          },
          {
            title: 'What you pay',
            description:
              'Letting agents in England can only charge certain permitted payments. See our tenant fees page for the full list.',
          },
          {
            title: 'Repairs during your tenancy',
            description:
              'During office hours, call 01724 856260 or send a message through this website and we will arrange a contractor. If something cannot wait, such as a complete loss of heating or a serious leak, use the same number and we will talk you through what to do. Outside opening hours, leave a message and we will pick it up first thing the next working day.',
          },
        ],
      },
      {
        blockType: 'callToAction',
        heading: 'Cannot see what you are looking for?',
        text: 'Tell us what you need and we will get in touch when something suitable comes up.',
        buttons: [
          { label: 'Register your requirements', href: '/register-interest' },
          { label: 'Browse properties', href: '/properties' },
        ],
      },
    ],
  },
  {
    title: 'About Smart Move',
    slug: 'about',
    hero: {
      heading: 'An independent letting agent in Scunthorpe',
      subheading: 'Based on Frodingham Road, working across North Lincolnshire.',
    },
    layout: [
      {
        blockType: 'text',
        body: richText(
          paragraph(
            'Smart Move is an independent, locally based letting agent specialising in residential lettings and property management. Our office is at 96 Frodingham Road in Scunthorpe, and we work with landlords and tenants across Scunthorpe and the surrounding area.',
          ),
          paragraph(
            'You deal with the same people from the first valuation through to move-in and beyond, and we would rather give you a straight answer than an optimistic one.',
          ),
          heading('Our approach'),
          bulletList([
            'Listen to what you actually need from a letting agent.',
            'Be realistic about what a property will achieve and how quickly.',
            'Keep you informed rather than waiting to be chased.',
          ]),
          heading('Who we are'),
          paragraph(
            'We are a small independent agency, not a national chain. That means you deal with the people in the Scunthorpe office rather than a remote call centre, and the person who valued the property is usually the person you can still ring months later.',
          ),
          paragraph(
            'Most of our work is residential lettings and full property management for landlords in Scunthorpe, Ashby, Bottesford and the surrounding villages. Some landlords want us to find a tenant and then take over themselves. Others want us to handle the rent, the repairs and the inspections as well. Both are fine.',
          ),
          paragraph(
            'If you would like to meet us before you instruct anyone, come into the office on Frodingham Road during opening hours, or call 01724 856260 and we will book a time that suits you.',
          ),
        ),
      },
      {
        blockType: 'contactDetails',
        heading: 'Come and see us',
        showMap: true,
      },
    ],
  },
  {
    title: 'Contact us',
    slug: 'contact',
    hero: {
      heading: 'Get in touch',
      subheading: 'Call the office, send us a message, or come and see us on Frodingham Road.',
    },
    layout: [
      { blockType: 'contactDetails', heading: 'Our office', showMap: true },
      {
        blockType: 'form',
        heading: 'Send us a message',
        intro: 'We aim to reply the same working day.',
        formType: 'general',
      },
      {
        blockType: 'callToAction',
        heading: 'Landlord or tenant?',
        text: 'There are quicker routes if you know what you need.',
        buttons: [
          { label: 'Book a valuation', href: '/landlords#enquiry' },
          { label: 'Register your requirements', href: '/register-interest' },
        ],
      },
    ],
  },
  {
    title: 'Register your requirements',
    slug: 'register-interest',
    hero: {
      heading: 'Tell us what you are looking for',
      subheading:
        'If nothing suitable is available today, leave your details and we will contact you when something comes in.',
    },
    layout: [
      {
        blockType: 'form',
        heading: 'What are you looking for?',
        intro: 'The more you tell us, the better we can match you.',
        formType: 'requirements',
      },
    ],
  },
  {
    title: 'Tenant fees',
    slug: 'tenant-fees',
    hero: {
      heading: 'Tenant fees and permitted payments',
      subheading: 'What we can and cannot charge you under the Tenant Fees Act 2019.',
    },
    layout: [
      {
        blockType: 'text',
        body: richText(
          paragraph(
            'Letting agents in England can only ask tenants for certain payments. This page sets out what we may charge under the Tenant Fees Act 2019. If something is not on this list, we cannot ask you for it.',
          ),
          heading('Permitted payments'),
          paragraph(
            'The only payments we may ask a tenant for are set out below. We will confirm the exact figures in writing before you pay anything.',
          ),
          bulletList([
            "Holding deposit: equivalent to one week's rent. This is the legal maximum. If the tenancy goes ahead it is put towards your first rent. If it does not, it is returned except where the law allows us to keep it, for example if you withdraw or fail a right-to-rent check.",
            'Tenancy deposit: equivalent to five weeks\' rent where the yearly rent is under £50,000, or six weeks\' rent where it is £50,000 or more. This is the legal maximum. It is protected in a government-approved scheme.',
            'Rent, as set out in your tenancy agreement.',
            "A payment to change the tenancy at your request: £50 including VAT, or our reasonable costs if they are higher.",
            "A payment if you ask to end the tenancy early: capped at the landlord's actual loss.",
            'Payments for utilities, communication services, a TV licence and council tax, where you are responsible for them under the tenancy.',
            'Default fees for late rent or a lost key, but only where those fees are set out in the tenancy agreement and only at the amounts the law allows.',
          ]),
          heading('Redress and client money protection'),
          paragraph(
            'Letting agents who hold client money must belong to a government-approved redress scheme and a Client Money Protection scheme. Smart Move does both. Please call 01724 856260 if you would like the current scheme names and membership numbers, or ask at the office on Frodingham Road.',
          ),
        ),
      },
      {
        blockType: 'callToAction',
        heading: 'Any questions about fees?',
        text: 'Call the office and we will talk you through it.',
        buttons: [{ label: 'Contact us', href: '/contact' }],
      },
    ],
  },
  {
    title: 'Privacy policy',
    slug: 'privacy-policy',
    hero: {
      heading: 'Privacy policy',
      subheading: 'How we handle the personal information you give us.',
    },
    layout: [
      {
        blockType: 'text',
        body: richText(
          heading('Who we are'),
          paragraph(
            'Smart Move, 96 Frodingham Road, Scunthorpe, North Lincolnshire, DN15 7JW, is the data controller for personal information collected through this website. You can contact us on 01724 856260 or at smartmove4u@muradsprojects.co.uk.',
          ),
          heading('What we collect through this website'),
          paragraph(
            'When you send an enquiry we collect the information you type into the form. Depending on the form, that is your name, email address, telephone number, and details of your enquiry or what you are looking for. We do not collect any other personal information through this website, and we do not use tracking cookies unless you agree to them.',
          ),
          heading('Why we use it'),
          paragraph(
            'We use it to reply to your enquiry and to provide the service you asked about. Our lawful basis is your consent, which you give by ticking the box on the form, and our legitimate interest in responding to enquiries about our services.',
          ),
          heading('How long we keep it'),
          paragraph(
            'Website enquiries that do not lead to a tenancy or a management instruction are deleted after 12 months. If you become a tenant or a landlord client, we keep the information we need to look after that relationship for as long as we act for you, and for a reasonable period afterwards in case of a dispute.',
          ),
          heading('Who we share it with'),
          paragraph(
            'Enquiries are stored on our website server and are emailed to our office. We do not sell your information or share it for marketing.',
          ),
          heading('Information we hold as a letting agent'),
          paragraph(
            'If you become a tenant or a landlord client, we also hold the information we need to manage the tenancy or the instruction. That includes identity documents, references, tenancy agreements and payment records. We use it only to provide that service and to meet our legal duties. Call the office if you would like more detail about what we keep.',
          ),
          heading('Your rights'),
          paragraph(
            'You can ask us for a copy of the information we hold about you, ask us to correct it, or ask us to delete it. Contact us on the details above. If you are not happy with how we have handled your information you can complain to the Information Commissioner at ico.org.uk.',
          ),
        ),
      },
    ],
  },
  {
    title: 'Cookie policy',
    slug: 'cookie-policy',
    hero: { heading: 'Cookie policy', subheading: 'What this website stores on your device.' },
    layout: [
      {
        blockType: 'text',
        body: richText(
          heading('Essential storage'),
          paragraph(
            'This website does not set any cookies in order to work. If you choose an option on the cookie banner, that choice is saved in your browser so we do not ask again. Members of staff signing in to manage the website are given a session cookie, which visitors never receive.',
          ),
          heading('Analytics'),
          paragraph(
            'Analytics are optional. They are only switched on if we have configured them, and even then nothing extra is loaded until you press Accept on the banner. Pressing Reject means no analytics script runs at all. If analytics are not configured, the banner does not appear.',
          ),
          heading('Changing your mind'),
          paragraph(
            'Clearing your browser storage for this site will make the banner appear again so you can choose differently.',
          ),
        ),
      },
    ],
  },
  {
    title: 'Terms of use',
    slug: 'terms',
    hero: {
      heading: 'Website terms of use',
      subheading: 'The terms on which you may use this site.',
    },
    layout: [
      {
        blockType: 'text',
        body: richText(
          paragraph(
            'By using this website you agree to these terms. "Smart Move", "us" and "we" mean the business at 96 Frodingham Road, Scunthorpe, North Lincolnshire, DN15 7JW. "You" means the person using the website.',
          ),
          heading('Information on this website'),
          paragraph(
            'The content of this website is for general information. Property particulars are a guide and do not form part of any contract. Fixtures, fittings and services have not been tested. Please check anything that matters to you before you commit.',
          ),
          heading('Availability'),
          paragraph(
            'We try to keep the website available and accurate but cannot guarantee it will be uninterrupted or error free.',
          ),
          heading('Copyright'),
          paragraph(
            'The design, text and images on this website belong to us or are used with permission. Please do not reproduce them without asking.',
          ),
          heading('Links to other websites'),
          paragraph(
            'Where we link to another website, that is for convenience. We are not responsible for its content.',
          ),
          heading('Governing law'),
          paragraph('Your use of this website is governed by the law of England and Wales.'),
        ),
      },
    ],
  },
]
