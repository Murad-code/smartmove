import { bulletList, heading, paragraph, paragraphs, richText } from '@/lib/lexical'

/**
 * Seed content.
 *
 * Business facts here come from the audit of the old smartmove4u.co.uk site
 * and nothing else. Where the audit could not confirm something, the text is
 * marked `TODO: CLIENT CONTENT REQUIRED` rather than invented. Everything
 * marked that way is listed in docs/client-content-required.md.
 */

export const TODO = 'TODO: CLIENT CONTENT REQUIRED'

export const businessDetails = {
  companyName: 'Smart Move',
  tagline: 'Independent letting agents in Scunthorpe',
  telephone: '01724 856260',
  email: 'sales@smartmove4u.co.uk',
  enquiriesEmail: 'sales@smartmove4u.co.uk',
  address: {
    line1: '96 Frodingham Road',
    line2: '',
    town: 'Scunthorpe',
    county: 'North Lincolnshire',
    postcode: 'DN15 7JW',
  },
  openingHours: [
    { days: 'Monday to Friday', hours: '9:30am – 5:30pm' },
    { days: 'Saturday', hours: 'By appointment only' },
    { days: 'Sunday', hours: 'Closed' },
  ],
  // Legally required disclosures for a letting agent in England. Left as
  // placeholders because the old site never stated them.
  redressScheme: `${TODO}: property redress scheme and membership number`,
  clientMoneyProtection: `${TODO}: Client Money Protection scheme and membership number`,
  depositScheme: `${TODO}: deposit protection scheme`,
  registeredName: '',
  companyNumber: '',
  footerNote: '',
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
    titleSuffix: 'Smart Move — Letting Agents in Scunthorpe',
    description:
      'Smart Move is an independent letting agent in Scunthorpe offering property lettings, full property management and tenant finding across North Lincolnshire.',
  },
}

export const homePage = {
  hero: {
    heading: 'Letting and managing property in Scunthorpe',
    subheading:
      'An independent, locally based letting agent looking after landlords and tenants across Scunthorpe and North Lincolnshire.',
    primaryCta: { label: 'See available properties', href: '/properties' },
    secondaryCta: { label: 'Book a valuation', href: '/landlords#enquiry' },
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
    intro: 'A small, established local agency rather than a national chain.',
    reasons: [
      {
        title: 'Local knowledge',
        description:
          'We live and work in Scunthorpe, so we know what a property should let for and how quickly.',
      },
      {
        title: 'Independent',
        description:
          'No head office targets. We give you a straight answer about what your property will achieve.',
      },
      {
        title: 'One point of contact',
        description: 'You deal with the same people from valuation through to move-in and beyond.',
      },
      {
        title: 'Flexible service levels',
        description:
          'Take the full management service, or just tenant finding, depending on how involved you want to be.',
      },
      {
        title: 'Properly referenced tenants',
        description: 'Credit checks and referencing on every application before we recommend it.',
      },
      {
        title: 'Repairs handled',
        description:
          'We arrange trades, oversee the work and keep you informed, so you are not chasing anyone.',
      },
    ],
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
          `${TODO}: confirm the management fee. The previous website advertised "from 8%" on some pages and "from 10%" on others, and referred to Silver, Gold and Platinum packages. This section should set out each package and what it costs.`,
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
      'For landlords who manage their own property but want help finding and referencing the right tenant.',
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
        body: paragraphs(`${TODO}: confirm the tenant finding fee.`),
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
        body: paragraphs(`${TODO}: confirm the rent collection fee.`),
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
              `${TODO}: confirm the current EPC price. The previous website advertised £69.99 including VAT.`,
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
          `${TODO}: confirm management and tenant finding fees, and the contents of the Silver, Gold and Platinum packages referred to on the previous website.`,
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
            description: `${TODO}: confirm the deposit amount charged and which government-approved scheme it is protected in.`,
          },
          {
            title: 'What you pay',
            description:
              'Letting agents in England can only charge certain permitted payments. See our tenant fees page for the full list.',
          },
          {
            title: 'Repairs during your tenancy',
            description: `${TODO}: confirm how tenants should report a repair and what the out-of-hours arrangement is.`,
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
            'We are small enough that you deal with the same people every time, and we would rather give you a straight answer than an optimistic one.',
          ),
          heading('Our approach'),
          bulletList([
            'Listen to what you actually need from a letting agent.',
            'Be realistic about what a property will achieve and how quickly.',
            'Keep you informed rather than waiting to be chased.',
          ]),
          paragraph(
            `${TODO}: this page needs the company's own words. Useful additions would be how long Smart Move has been trading, who is on the team, any professional memberships, and whether the partnerships with branches in Grimsby, Bedford and London mentioned on the previous website still stand.`,
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
            `${TODO}: this page must be completed and checked before the website goes live. Letting agents in England are legally required to publish their permitted payments, their redress scheme membership and their Client Money Protection membership. The previous website linked to a tenant fee guide that no longer existed.`,
          ),
          heading('Permitted payments'),
          paragraph(
            'Under the Tenant Fees Act 2019, the only payments we may ask a tenant for are set out below. The amounts must be confirmed by Smart Move.',
          ),
          bulletList([
            `Holding deposit — ${TODO}: confirm amount, capped at one week's rent.`,
            `Tenancy deposit — ${TODO}: confirm amount, capped at five weeks' rent where the annual rent is under £50,000.`,
            'Rent.',
            `Payments to change the tenancy at the tenant's request — ${TODO}: confirm amount, capped at £50 unless costs are higher.`,
            `Payments on early termination at the tenant's request — capped at the landlord's loss.`,
            'Payments for utilities, communication services, TV licence and council tax.',
            'Default fees for a late rent payment or a replacement key, where set out in the tenancy agreement.',
          ]),
          heading('Redress and client money protection'),
          paragraph(
            `${TODO}: state which redress scheme Smart Move belongs to, with the membership number, and which Client Money Protection scheme, with evidence of membership.`,
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
          paragraph(
            `${TODO}: this policy is a starting point drafted from what the website actually does. It must be reviewed and completed by Smart Move, and checked by a solicitor, before the site goes live. It does not currently cover the personal data Smart Move handles offline as a letting agent, which is the larger part of its obligations.`,
          ),
          heading('Who we are'),
          paragraph(
            'Smart Move, 96 Frodingham Road, Scunthorpe, North Lincolnshire, DN15 7JW, is the data controller for personal information collected through this website. You can contact us on 01724 856260 or at sales@smartmove4u.co.uk.',
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
            `${TODO}: confirm how long website enquiries are kept before they are deleted. A common approach is to delete enquiries that did not lead to a tenancy after 12 months.`,
          ),
          heading('Who we share it with'),
          paragraph(
            'Enquiries are stored on our website server and are emailed to our office. We do not sell your information or share it for marketing.',
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
          paragraph(
            `${TODO}: review this page once it is decided whether analytics will be switched on.`,
          ),
          heading('Essential storage'),
          paragraph(
            'This website does not set any cookies in order to work. If you choose an option on the cookie banner, that choice is saved in your browser so we do not ask again. Members of staff signing in to manage the website are given a session cookie, which visitors never receive.',
          ),
          heading('Analytics'),
          paragraph(
            'If analytics are enabled, we use them only to count visits and see which pages are useful. Nothing is loaded until you press Accept on the banner, and pressing Reject means no analytics script runs at all.',
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
            `${TODO}: these terms are adapted from the previous website and must be reviewed by Smart Move's solicitor. The previous version contained an unfilled template placeholder.`,
          ),
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
