import { addOns, site } from './site.js'

// The Privacy Policy (/privacy) and Terms & Booking Policy (/terms) pages.
//
// DRAFT: written as a plain-English starting point, not legal advice. Have a
// lawyer licensed in Michigan review both pages before relying on them.
//
// Contact details come from contact-info.ts. Check-in, check-out, guests per
// site, quiet hours and the 10-minute hold come from site.ts, so they stay in
// step with the rest of the site.

// Change `updated` whenever the wording changes. Each paid booking records the
// version the guest agreed to (in the Stripe payment's details).
export const legal = {
  updated: '2026-11-12',
  updatedLabel: 'November 12, 2026',
  // The cancellation policy below is a proposal until the hosts approve it.
  // While this is false, the page marks it "Proposed" with a dashed note.
  cancellationApproved: true,
  cancellationDraftNote: 'Proposed policy, to be confirmed by the hosts.',
  // Shown in place of quiet hours until site.quietHours is filled in.
  quietHoursPlaceholder: 'Quiet hours to come',
}

// A paragraph, or a bulleted list.
export type LegalBlock = string | { list: string[] }
export type LegalSection = {
  id: string
  title: string
  body: LegalBlock[]
  // Show a dashed "to come" placeholder in this section.
  pending?: string
  // Mark this section as a proposal that still needs the hosts' approval.
  proposed?: string
  // A link shown at the end of the section.
  link?: { to: string; label: string }
}

const contactLines = [
  site.contactEmail ? `Email: ${site.contactEmail}` : '',
  site.contactPhone ? `Phone: ${site.contactPhone}` : '',
].filter(Boolean)

const contactSection = (title: string): LegalSection => ({
  id: 'contact',
  title,
  body: [
    `${site.name} is run by ${site.hosts}, who live on the property near Marquette, Michigan. Reach us at:`,
    ...(contactLines.length ? [{ list: contactLines }] : []),
  ],
})

export const privacyPage = {
  title: 'Privacy Policy',
  intro: 'What we collect when you book or message us, why, and who helps us handle it.',
  lead: `${site.name} is a small family campground. We only collect what we need to take your booking and answer your questions, and we never sell your information.`,
  sections: [
    {
      id: 'collect',
      title: 'What we collect',
      body: [
        'When you book on this website:',
        {
          list: [
            'Your name, email address and, if you give it, your phone number.',
            'Your stay: dates, number of sites and guests, gear rentals, extras, and any note you add.',
            'What you paid and when. Your card is entered on Stripe’s secure payment page. We never see or store your full card number.',
            'That you agreed to these policies, and which version you agreed to.',
          ],
        },
        'When you use our contact form or email us: your name, email address, the dates you mention and your message.',
        'When you visit the site: like most websites, our hosting provider automatically logs basic technical details such as your IP address, browser type and the pages you visit. We don’t use advertising trackers, analytics cookies or social media pixels.',
      ],
    },
    {
      id: 'use',
      title: 'How we use it',
      body: [
        {
          list: [
            'To check availability, hold your sites and take your payment.',
            'To send your confirmation, arrival directions and messages about your stay.',
            'To answer your questions and booking requests.',
            'To keep business, tax and accounting records.',
            'To keep the camp safe and to meet our legal obligations.',
          ],
        },
        'We don’t send marketing emails, and we don’t sell, rent or trade your information.',
      ],
    },
    {
      id: 'share',
      title: 'Who helps us handle it',
      body: [
        'We use a few trusted services to run the website and take bookings. Each one only gets what it needs to do its job:',
        {
          list: [
            'Stripe: takes your card payment and handles refunds.',
            'Neon: the secure database that stores your booking.',
            'Formspree: delivers messages and booking requests from this website to our inbox.',
            'Vercel: hosts this website and the code that takes bookings, and keeps short-lived technical logs.',
            'Google: our booking emails are sent through Gmail, and the website’s fonts load from Google Fonts, which sees your IP address.',
          ],
        },
        'If you book through Hipcamp instead, Hipcamp’s own privacy policy covers what you give them. We also share information if the law requires it, or to protect the safety of our guests, our family or our property.',
      ],
    },
    {
      id: 'keep',
      title: 'How long we keep it',
      body: [
        'We keep booking and payment records for as long as we need them for our business and tax records, generally up to seven years. Unpaid bookings that were never completed and old messages are deleted when we no longer need them.',
      ],
    },
    {
      id: 'choices',
      title: 'Your choices',
      body: [
        'You can ask us what information we have about you, ask us to correct it, or ask us to delete it. We’ll do so unless we need to keep it for tax or legal reasons. Contact us using the details below.',
      ],
    },
    {
      id: 'security',
      title: 'Keeping it safe',
      body: [
        'The website uses a secure (HTTPS) connection, payments are handled by Stripe, and our booking database can only be reached by our own booking system. No system is perfect, but we take reasonable care to protect your information.',
      ],
    },
    {
      id: 'children',
      title: 'Children',
      body: [
        'Bookings must be made by an adult aged 18 or over. This website isn’t meant for children under 13, and we don’t knowingly collect their information.',
      ],
    },
    {
      id: 'changes',
      title: 'Changes to this policy',
      body: [
        'If we change this policy, we’ll update it here and change the date at the top. The version shown when you book is the one that applies to your stay.',
      ],
    },
    contactSection('Contact us'),
  ] as LegalSection[],
}

const rentals = addOns.filter((a) => a.kind === 'rental').map((a) => a.name.toLowerCase())

export const termsPage = {
  title: 'Terms & Booking Policy',
  intro: 'How booking, payment, cancellations and camp life work, and the risks that come with camping in the woods.',
  lead: `These terms are an agreement between you and ${site.name}. By booking you agree to them for yourself and everyone in your group. Please read them, especially the cancellation policy and the liability acknowledgement.`,
  sections: [
    {
      id: 'booking',
      title: 'Booking and payment',
      body: [
        {
          list: [
            'Choose your dates, sites and extras, then pay on Stripe’s secure payment page.',
            'Your sites are held for 10 minutes while you pay. If payment isn’t finished in time, the hold ends and the sites may go to someone else.',
            'You pay in full when you book, including any rentals, extras and sales tax. Prices are in US dollars.',
            'Your booking is confirmed once your payment goes through and we email your confirmation.',
            'The person who books must be 18 or older and is responsible for everyone in their group following these terms.',
            'Bookings made through Hipcamp follow Hipcamp’s terms and cancellation policy instead.',
          ],
        },
      ],
    },
    {
      id: 'sites',
      title: 'Sites and guests',
      body: [
        {
          list: [
            `A site is one camp setup: one tent or rig and one vehicle, with up to ${site.maxGuestsPerSite} guests. Book another site for a bigger group.`,
            'There are no numbered sites. You pick your own spot in the dispersed area when you arrive.',
            'Vehicles must be under 20 feet. Extra vehicles need to be arranged with us ahead of time.',
            'Visitors who aren’t on your booking need our OK before they come.',
          ],
        },
      ],
    },
    {
      id: 'check-in',
      title: 'Check-in and check-out',
      body: [
        {
          list: [
            `Check-in: ${site.checkIn}. We like to meet you when you arrive.`,
            `Check-out: ${site.checkOut.replace('Before', 'before')} on your departure day.`,
            'Early or late times may be possible if you ask first. Staying past check-out without arranging it may be charged as an extra night.',
          ],
        },
      ],
    },
    {
      id: 'cancellation',
      title: 'Cancellations and refunds',
      proposed: legal.cancellationApproved ? undefined : legal.cancellationDraftNote,
      body: [
        {
          list: [
            `Cancel more than 48 hours before check-in time (${site.checkIn.split(' to ')[0]} on your arrival day): full refund.`,
            'Cancel within 48 hours of check-in time: 50% refund.',
            'After check-in time, including if you don’t show up or leave early: no refund.',
            'Changing dates: ask us. We’ll move your booking if the new dates are free; otherwise the cancellation rules above apply.',
            'If we have to cancel (for example a storm, fire ban, emergency or closure), you get a full refund.',
          ],
        },
        'To cancel, email or call us. Refunds go back to the card you paid with and usually show up within 5 to 10 business days.',
      ],
    },
    {
      id: 'rules',
      title: 'Camp rules',
      pending: site.quietHours ? undefined : legal.quietHoursPlaceholder,
      body: [
        {
          list: [
            site.quietHours
              ? `Quiet hours: ${site.quietHours}. Please keep voices, music and generators down so everyone can enjoy the woods.`
              : 'Please keep voices, music and generators down during quiet hours so everyone can enjoy the woods.',
            'Fires only in the fire pits provided. Never leave a fire unattended, and put it out completely with water before bed or leaving. Follow any burn ban in effect.',
            'Please buy firewood from us or locally rather than bringing it from far away, to keep tree pests out of the forest.',
            'Dogs are welcome off leash if they stay under your control and are friendly with people and other dogs. Clean up after them. You’re responsible for anything your pet does.',
            'Pack out your trash, or hand us a tied bag when you leave. Leave your spot as you found it.',
            'No fireworks, no firing guns on the property, and no cutting live trees or branches.',
            'Our home, sugar shack and chicken coop are private. Please stay out unless we invite you.',
          ],
        },
      ],
    },
    {
      id: 'rentals',
      title: 'Rental gear',
      body: [
        `Our rental gear (${rentals.join(', ')}) is lent to you for your whole stay and stays at camp.`,
        {
          list: [
            'Check the gear before you use it and tell us right away if anything looks damaged or unsafe.',
            'Use it sensibly and within your own abilities, and supervise any children using it.',
            'On the water, everyone wears a properly fitted life jacket at all times. Our canoes and kayaks are for calm inland lakes and rivers, not Lake Superior or rapids.',
            'The tree tent is set up by us. Please don’t move or re-hang it, and stay within its stated weight limit.',
            'Use the gas grill outdoors only, well away from tents and trees.',
            'Leave the gear where you found it. If it’s lost or damaged beyond normal wear, you agree to pay the reasonable cost to repair or replace it.',
          ],
        },
      ],
    },
    {
      id: 'conduct',
      title: 'Damage and behavior',
      body: [
        'You’re responsible for any damage you, your group or your pets cause to the property. We may ask anyone who puts others at risk, damages property or ignores these rules to leave, without a refund.',
        'We aren’t responsible for lost, stolen or damaged belongings, so please keep valuables locked away.',
      ],
    },
    {
      id: 'liability',
      title: 'Liability acknowledgement',
      body: [
        'Camping in the woods is a lot of fun, and it also comes with risks we can’t remove. By booking, you understand and accept them, including:',
        {
          list: [
            'Campfires and grills: burns, sparks, smoke and the risk of fire spreading.',
            'Water: swimming and paddling carry a risk of drowning. Lakes and rivers in the Upper Peninsula are cold even in summer, and there are no lifeguards.',
            'Wildlife: black bears, coyotes, ticks, mosquitoes and other animals live here. Store food and trash securely, keep a clean camp, and check for ticks.',
            'The forest itself: uneven ground, roots, rocks, and falling branches or trees, especially in wind.',
            'Weather: storms, lightning, heat and winter cold. We’re open year round, so come prepared for the season.',
            'Remoteness: there’s no drinking water on site, and emergency help may take time to arrive. There is also a shooting range nearby.',
            'Rental gear: using our tents, hammock, canoes, kayaks and grill.',
          ],
        },
        `You take part in camping and all activities at ${site.name} at your own risk. To the fullest extent the law allows, you agree, for yourself and everyone in your group (including any children you bring), not to hold ${site.name} or its owners and hosts responsible for injury, illness, loss or damage that comes from these risks, except where it is caused by our gross negligence or willful misconduct.`,
        'Adults in your group are responsible for watching and keeping children safe at all times.',
      ],
    },
    {
      id: 'privacy',
      title: 'Your privacy',
      body: ['Our Privacy Policy explains what information we collect when you book and how we use it.'],
      link: { to: '/privacy', label: 'Read the Privacy Policy' },
    },
    {
      id: 'law',
      title: 'Changes and governing law',
      body: [
        'We may update these terms from time to time. The version shown when you book is the one that applies to your stay. These terms are governed by the laws of the State of Michigan.',
      ],
    },
    contactSection('Questions'),
  ] as LegalSection[],
}

// The checkbox guests tick before they pay.
export const termsCheckbox = {
  before: 'I agree to the ',
  termsLabel: 'Terms & Booking Policy',
  middle: ', including the cancellation policy and liability acknowledgement, and the ',
  privacyLabel: 'Privacy Policy',
  after: '.',
  error: 'Please tick this box to agree to the terms before you book.',
  // Under the pay button until the box is ticked.
  hint: 'Tick the terms box above to book.',
  serverError: 'Please agree to the Terms & Booking Policy and Privacy Policy to book.',
}
