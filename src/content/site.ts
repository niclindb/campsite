import type { IconName } from '../components/Icon.js'
import { contactInfo } from './contact-info.js'

// All of the site's facts, prices and text live here, so they can be
// updated in one place without touching the page components.

export const site = {
  name: 'Northern Oasis Camping',
  hosts: 'Joy and Brian L.',
  tagline: 'Quiet forest campsites 7 miles from Marquette',
  season: 'Open year round',
  pricePerSiteNight: 28,
  // Sales tax added to every booking, in percent. 6 is a placeholder until
  // the camp registers for Michigan sales/use tax; change it here only.
  // Add-ons marked `taxFree` (like the eggs) are left out of it.
  salesTaxPercent: 6,
  siteCount: 5,
  checkIn: '1:00 PM to 10:00 PM',
  checkOut: 'Before 12:00 PM',
  // e.g. '10:00 PM to 8:00 AM'. Blank shows a "to come" placeholder on the
  // Info and Terms pages until the hosts decide.
  quietHours: '',
  minNights: 1,
  bookingWindow: 'Up to 15 months ahead',
  bookingWindowMonths: 15,
  maxGuestsPerSite: 3,
  // Electric hookups sold per night, across all bookings.
  hookupsPerNight: 2,
  timeZone: 'America/Detroit',
  cancellation: 'Moderate',
  // Contact details live in contact-info.ts.
  hipcampUrl: contactInfo.hipcampUrl,
  rating: {
    recommendPercent: 97,
    ratings: '200+',
    reviews: 157,
    // Shown on the site; round it down so it stays true as reviews grow.
    reviewsLabel: '150+',
    badges: ['Star Hosts', 'Best in Michigan finalist, 2024'],
  },
  contactEmail: contactInfo.email,
  contactPhone: contactInfo.phone,
  formspreeId: contactInfo.contactFormId,
}

// The Contact us section at the bottom of the home page.
// The email and phone come from site.contactEmail / site.contactPhone; while
// those are blank, a dashed placeholder with the text below is shown instead.
export const contact = {
  eyebrow: 'Get in touch',
  heading: 'Contact us',
  lead: 'Questions about dates, rigs or add-ons? Joy and Brian live right here on the land and usually reply within a day.',
  emailPlaceholder: 'Email address to come',
  phonePlaceholder: 'Phone number to come',
  hipcampLabel: 'Message us on Hipcamp',
  formTitle: 'Send us a message',
  noFormNote: 'Our message form is coming soon. Until then, Hipcamp is the quickest way to reach us.',
  // The contact form (shown once VITE_FORMSPREE_ID is set).
  formIntro: 'Tell us a little about your trip and we\u2019ll write back by email.',
  emailSubject: 'New message from the Northern Oasis website',
  sendLabel: 'Send message',
  sendingLabel: 'Sending\u2026',
  successTitle: 'Message sent. Thank you!',
  successText: 'Joy and Brian usually reply within a day. Keep an eye on your inbox (and your spam folder, just in case).',
  sendAnotherLabel: 'Send another message',
  errorText: 'Sorry, your message didn\u2019t go through. Please check your connection and try again, or reach us on Hipcamp.',
}

// The About section on the home page, written in the hosts' voice.
export const about = {
  heading: 'Our home in the maple woods',
  paragraphs: [
    'Stay on our quiet property near woods, river and trails. Our home is on the property with shared driveway but privacy, peace and quiet is to be had! Adventure awaits!',
    'We built our home here in 2019 and are continually making improvements to the land. We tap our trees for maple syrup in the spring-you will drive by our "sugar shack" and raise chickens in our very nice coop -no roosters to awaken you!',
    'Come and enjoy some peace and quiet at our Northern Oasis!',
  ],
  highlights: [
    { title: 'Quiet and shady', detail: '7 miles from Marquette, 8 from Lake Superior', icon: 'tree' },
    { title: 'Pets welcome', detail: 'Dogs can roam off leash', icon: 'paw' },
    { title: 'Fresh eggs', detail: `A dozen from our coop for $5`, icon: 'egg' },
    { title: 'Hosts on site', detail: 'We live here and meet you when you arrive', icon: 'home' },
  ] as { title: string; detail: string; icon: IconName }[],
}

// The "Where we are" section on the home page.
export const location = {
  eyebrow: 'Location & things to do',
  heading: 'Where we are',
  intro: 'A quiet forest between Marquette and Negaunee, close to town but far from the noise. About 4 miles off US 41 in Michigan\u2019s Upper Peninsula.',
  thingsToDoHeading: 'Things to do nearby',
}

export const siteDetails = [
  'Dispersed RV and tent sites on 10 acres of mature maple forest',
  'No numbered sites: pick your own spot, open or more private and wooded',
  'Vehicles under 20 ft: travel trailers, pop-ups, class B, campervans, cars, truck campers and rooftop tents',
  'Pull-in, flat, loose gravel; slideouts fit',
  '1 vehicle per site (more parking near the house if arranged); 2WD accessible',
]

// Where guests camp: one open dispersed area with no designated sites.
// Photos live in src/assets/sites, listed by file name in display order.
// Set `temporaryPhotos` to true to tag the photos as stand-ins.
export const campArea = {
  name: 'The dispersed area',
  summary: 'There are no numbered sites. Pick your own spot in the maples, from open clearings to a couple of more private wooded corners.',
  photos: ['area-1.webp', 'area-2.webp', 'area-3.webp', 'area-4.webp', 'area-5.webp'],
  temporaryPhotos: false,
  tags: ['RV or tent', 'Pick your own spot', `$${site.pricePerSiteNight} per site per night`],
}

export type Amenity = { name: string; detail: string; icon: IconName }

// What's on site.
export const amenities: Amenity[] = [
  { name: 'Campfires', detail: '2 communal pits, 2 sites have private pits; fire wood available for purchase', icon: 'fire' },
  { name: 'Toilets', detail: 'Pit toilet by the sites, composting toilet near the house', icon: 'toilet' },
  { name: 'Picnic tables', detail: 'At the sites and by the large fire pit', icon: 'table' },
  { name: 'Wifi', detail: 'Near the large fire pit and chicken coop', icon: 'wifi' },
  { name: 'Pets welcome', detail: 'Off leash; please clean up after them', icon: 'paw' },
  { name: 'Grills', detail: 'Shared charcoal grill; gas grill to rent', icon: 'grill' },
  { name: 'Red shed', detail: 'Yard games, chairs, a table; storm shelter if needed', icon: 'shed' },
]

// What isn't, so guests can plan for it.
export const planFor: Amenity[] = [
  { name: 'No drinking water', detail: 'Bring your own. Well water by hose near the coop for pets and bikes.', icon: 'water' },
  { name: 'No showers', detail: 'Nearby lakes are under a mile away for a swim.', icon: 'shower' },
  { name: 'No hookups', detail: '30 amp electric can be added on for $25.', icon: 'plug' },
]

// Extras a guest can add to a stay. Prices are one-time fees for the stay.
// `kind`: 'rental' is gear we lend out and get back; 'extra' is everything else.
// `max`: how many one booking can take. `perSite`: priced per site, so a
// booking can't take more than it has sites. `perNight`: how many we have, so
// how many can be out on any one night across all bookings (checked on the
// server). `hookup` marks the electric hookup, limited to site.hookupsPerNight.
// `taxFree`: no sales tax on it (Michigan doesn't tax groceries like eggs).
export type AddOn = {
  name: string
  price: number
  note: string
  kind: 'rental' | 'extra'
  max: number
  perNight?: number
  perSite?: boolean
  hookup?: boolean
  taxFree?: boolean
}

export const addOns: AddOn[] = [
  { name: 'Tentsile tree tent', price: 80, note: '3 to 4 people, set up before you arrive', kind: 'rental', max: 1, perNight: 1 },
  { name: 'Hammock', price: 25, note: 'Large sleeping hammock with net', kind: 'rental', max: 1, perNight: 1 },
  { name: '4-person tent', price: 20, note: 'Older style, easy to set up', kind: 'rental', max: 1, perNight: 1 },
  { name: 'Canoe', price: 20, note: 'Traditional canoe with paddles', kind: 'rental', max: 3, perNight: 3 },
  { name: 'Kayak', price: 20, note: 'Recreational single; not for Lake Superior or rapids', kind: 'rental', max: 3, perNight: 3 },
  { name: 'Gas grill', price: 20, note: 'Portable, tank included', kind: 'rental', max: 1, perNight: 1 },
  { name: 'Electric hookup', price: 25, note: '30 amp, per site, up to 2 sites', kind: 'extra', max: site.hookupsPerNight, perSite: true, perNight: site.hookupsPerNight, hookup: true },
  { name: 'Firewood bundle', price: 8, note: 'Waiting at your site when you arrive', kind: 'extra', max: 5 },
  { name: 'Dozen eggs', price: 5, note: 'Fresh from our coop', kind: 'extra', max: 5, taxFree: true },
]

// The booking page (/book). Guests send a booking request from the site;
// the hosts check the calendar, confirm by email and send payment details.
// Requests arrive by email through Formspree (contactInfo.bookingFormId).
export const bookPage = {
  formspreeId: contactInfo.bookingFormId,
  eyebrow: 'Book your stay',
  title: 'Book direct with us',
  intro: 'Pick your nights, how many sites you need and any extras. We\u2019ll confirm by email, usually within a day.',
  stayTitle: 'Your stay',
  sitesHelp: `A site is one camp setup: one tent or rig and one vehicle, up to ${site.maxGuestsPerSite} guests.`,
  rentalsTitle: 'Gear to rent',
  rentalsNote: 'We lend these out for your whole stay and you leave them at camp. One-time fee per stay.',
  rentalLabel: 'Rental',
  addOnsTitle: 'Extras',
  addOnsNote: 'One-time fees for your stay.',
  datesLabel: 'Your dates',
  datesPlaceholder: 'Add dates',
  pickArrive: 'Pick your arrival day',
  pickDepart: 'Now pick your departure day',
  clearDates: 'Clear dates',
  doneDates: 'Done',
  detailsTitle: 'Your details',
  notePlaceholder: 'Your rig and its length, arrival time, anything we should know',
  summaryTitle: 'Summary',
  payNote: 'Nothing is charged now. We\u2019ll confirm your dates by email and send payment details.',
  submitLabel: 'Request to book',
  sendingLabel: 'Sending\u2026',
  errorText: 'Your request didn\u2019t go through. Please try again, or book on Hipcamp instead.',
  successTitle: 'Request sent. Thank you!',
  successText: 'Joy and Brian will check the calendar and email you to confirm, usually within a day. Exact directions come with your confirmation.',
  anotherLabel: 'Start another request',
  hipcampLabel: 'Prefer Hipcamp? Book there',
  emailSubject: 'Booking request',
  stepsTitle: 'How booking works',
  steps: [
    { title: 'Send a request', detail: 'Choose your dates, sites and extras. It takes a minute.' },
    { title: 'We confirm', detail: 'We check the calendar and email you back, usually within a day.' },
    { title: 'Pay and pack', detail: 'Pay with the link we send, and get exact directions to camp.' },
  ],
  beforeTitle: 'Before you book',
  // Used instead of the request wording above once instant booking is on.
  instant: {
    title: 'Book direct with us',
    intro: 'Pick your nights, how many sites you need and any extras, then pay securely. You\u2019re confirmed right away.',
    submitLabel: 'Book and pay',
    sendingLabel: 'Opening secure payment\u2026',
    payNote: 'You\u2019ll pay in full on Stripe\u2019s secure page. We hold your sites for 10 minutes while you pay.',
    errorText: 'We couldn\u2019t start your payment. Please try again, or book on Hipcamp instead.',
    checking: 'Checking availability\u2026',
    checkFailed: 'We couldn\u2019t check availability just now. You can still try to book.',
    fullOn: 'We\u2019re full on',
    tryOther: 'Please try other dates.',
    fewerSites: 'Try fewer sites or other dates.',
    hookupsGone: 'Both hookups are taken on one of these nights.',
    rentalGone: 'Already rented on one of these nights.',
    itemsGone: 'Some of your extras are already rented on one of these nights.',
    cancelledNote: 'Your payment was cancelled, so nothing was charged and your sites were released.',
    steps: [
      { title: 'Pick your stay', detail: 'Choose your dates, sites and extras, and see what\u2019s free.' },
      { title: 'Pay securely', detail: 'Pay in full by card on Stripe. It takes a minute.' },
      { title: 'You\u2019re booked', detail: 'Your confirmation email has the exact directions to camp.' },
    ],
  },
}

// "Things to do": stops along a trail from camp, shown in this order
// (nearest first). `distance` is the label shown on the trail.
export type Activity = { name: string; detail: string; distance: string; icon: IconName }

export const thingsToDo: Activity[] = [
  { name: 'Swim, fish and paddle', detail: 'McClure and Dead River basins, with a small beach by the boat launch. Rent a canoe or kayak from us.', distance: 'Under 1 mi', icon: 'fish' },
  { name: 'Mountain biking', detail: 'Camp sits on the Ore to Shore route, about 15 minutes from the "Marji."', distance: '15 min', icon: 'bike' },
  { name: 'Hiking trails', detail: 'The Iron Ore Heritage Trail, with the North Country Trail close by.', distance: '4 mi', icon: 'boot' },
  { name: 'Marquette', detail: 'Downtown shops, food, breweries and the harbor.', distance: '7 mi', icon: 'city' },
  { name: 'Lake Superior', detail: 'Sandy beaches and big-lake sunsets along the shore.', distance: '8 mi', icon: 'wave' },
  { name: 'Pictured Rocks', detail: 'Painted cliffs, waterfalls and boat tours on the National Lakeshore.', distance: '53 mi', icon: 'cliff' },
]

export const reviews = [
  { quote: 'Quiet and secluded but minutes to everything.', name: 'Brent C.' },
  { quote: 'Such a wonderful big property with plenty of gorgeous shade trees.', name: 'Brian G.' },
  { quote: 'Amazing forest setting.', name: 'Kyle H.' },
]

// The Guest info & FAQ page (/info).
// Questions are grouped by topic. An answer set to `pending: true` is still to
// be decided by the hosts: the page shows a dashed "to come" placeholder
// instead of the answer until the real text is filled in.
export type FaqItem = { q: string; a: string; pending?: boolean }
export type FaqGroup = { id: string; title: string; icon: IconName; items: FaqItem[] }

export const infoPage = {
  eyebrow: 'Plan your stay',
  title: 'Guest info & FAQ',
  intro: 'Everything to know before you arrive.',
  glanceTitle: 'At a glance',
  askTitle: 'Still have a question?',
  askText: 'Joy and Brian live right here on the land and usually reply within a day.',
}

// The quick facts across the top of the page. `pending` facts show a placeholder.
export const infoGlance: { icon: IconName; label: string; value: string; pending?: boolean }[] = [
  { icon: 'clock', label: 'Check-in', value: site.checkIn },
  { icon: 'clock', label: 'Check-out', value: site.checkOut },
  { icon: 'moon', label: 'Quiet hours', value: site.quietHours || 'Quiet hours to come', pending: !site.quietHours },
  { icon: 'users', label: 'Guests per site', value: `Up to ${site.maxGuestsPerSite}` },
  { icon: 'paw', label: 'Pets', value: 'Welcome, off leash' },
  { icon: 'shield', label: 'Cancellation', value: site.cancellation },
]

export const faqGroups: FaqGroup[] = [
  {
    id: 'arrival',
    title: 'Booking & arrival',
    icon: 'calendar',
    items: [
      { q: 'What time is check-in and check-out?', a: `Check in ${site.checkIn}; we meet you on arrival. Check out ${site.checkOut.replace("Before", "before")}. Early or late check-in may be possible, just ask.` },
      { q: 'Where exactly are you?', a: 'Between Marquette and Negaunee, about 4 miles off US 41. We send exact directions once your booking is confirmed.' },
      { q: 'How big a rig fits?', a: 'Vehicles under 20 ft. Sites are pull-in, flat and gravel, and slideouts fit. One vehicle per site unless arranged ahead.' },
      { q: 'What is the cancellation policy?', a: `${site.cancellation}. The full policy is on our Terms & Booking Policy page, linked at the bottom of every page.` },
    ],
  },
  {
    id: 'camp',
    title: 'Around camp',
    icon: 'tent',
    items: [
      { q: 'Is there drinking water?', a: 'No potable water, so bring your own. Well water is available by hose near the chicken coop for pets, washing and bikes; purify it before drinking.' },
      { q: 'Are there showers?', a: 'No. There is a pit toilet by the sites and a composting toilet a short walk away near the house.' },
      { q: 'Can I have a campfire?', a: 'Yes. There are two communal fire pits and two sites with private pits. Firewood bundles are $8 and can be waiting at your site.' },
      { q: 'What about trash?', a: 'Please pack it out, or hand us a tied bag when you leave.' },
    ],
  },
  {
    id: 'guests',
    title: 'Guests, pets & quiet',
    icon: 'users',
    items: [
      { q: 'How many people can stay on a site?', a: `Up to ${site.maxGuestsPerSite} guests per site. Book another site for a bigger group.` },
      { q: 'Can I bring my dog?', a: 'Yes, dogs are welcome off leash. Please pick up after them so everyone can enjoy the land.' },
      { q: 'Are there quiet hours?', a: site.quietHours ? `Yes, ${site.quietHours}.` : 'Quiet hours to come.', pending: !site.quietHours },
      { q: 'Will I hear anything?', a: 'It is a quiet forest, but there is a shooting range nearby and you may hear gunfire during the day.' },
    ],
  },
]

// Captions for the photos in src/assets/gallery, keyed by file name.
// They are written under each photo and read by screen readers.
// Photos without a caption get a generic description.
export const galleryCaptions: Record<string, string> = {
  '01-evening-fire.webp': 'Evening fire at camp',
  '02-misty-morning.webp': 'Misty morning at the campsite',
  '03-fall-coffee.webp': 'Coffee under the fall colors',
  '04-hammock.webp': 'Hammock time',
  '05-communal-fire-pit.webp': 'The big communal fire pit',
  '06-fire-pit-and-grill.webp': 'Picnic tables, fire pit and grill',
  '07-bell-tent.webp': 'Tent glowing in the trees',
  '08-canoes.webp': 'Canoes and kayaks to rent',
  '09-mcclure-basin.webp': 'McClure Basin, under a mile away',
  '10-pup.webp': 'Dogs love the beach too',
  '11-falls.webp': 'Waterfalls a short drive away',
  '12-swing.webp': 'A shady swing to sit a while',
  '13-car-camping.webp': 'Room for your car and canopy',
  '14-red-shed.webp': 'The red shed: games, chairs and storm shelter',
  '15-sunburst.webp': 'Sun through the canopy',
  '16-fog.webp': 'Fog in the maples',
  '17-tall-maples.webp': 'Tall trees all around',
  '18-stars.webp': 'Stars over camp',
  '19-dusk.webp': 'Dusk in the woods',
  '20-winter.webp': 'Camp in winter',
  '21-tire-swing.webp': 'Tire swing',
}

// The "page not found" page, shown for any web address that doesn't exist.
export const notFoundPage = {
  eyebrow: 'Error 404',
  title: 'This trail doesn’t go anywhere',
  text: 'Looks like you wandered off the map. The page you were looking for has moved or never existed. Let’s get you back to camp.',
  homeLabel: 'Back to camp',
  bookLabel: 'Check availability',
  moreTitle: 'Or head to',
  moreLinks: [
    { label: 'Guest info & FAQ', to: '/info' },
    { label: 'Photo gallery', to: '/#gallery' },
  ],
}
