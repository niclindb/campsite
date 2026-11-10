import type { IconName } from '../components/Icon'

// All of the site's facts, prices and text live here, so they can be
// updated in one place without touching the page components.

export const site = {
  name: 'Northern Oasis Camping',
  hosts: 'Joy and Brian L.',
  tagline: 'Quiet forest campsites 7 miles from Marquette',
  season: 'April to November',
  pricePerSiteNight: 28,
  siteCount: 5,
  checkIn: '1:00 PM to 10:00 PM',
  checkOut: 'Before 12:00 PM',
  minNights: 1,
  bookingWindow: 'Up to 15 months ahead',
  cancellation: 'Moderate',
  hipcampUrl:
    'https://www.hipcamp.com/en-US/land/michigan-northern-oasis-camping-nelh0koe',
  rating: {
    recommendPercent: 97,
    ratings: '200+',
    reviews: 157,
    // Shown on the site; round it down so it stays true as reviews grow.
    reviewsLabel: '150+',
    badges: ['Star Hosts', 'Best in Michigan finalist, 2024'],
  },
  // Contact details are still to be decided. Leave blank to hide them.
  contactEmail: '',
  contactPhone: '',
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
}

// The About section on the home page, written in the hosts' voice.
export const about = {
  heading: 'Our home in the maple woods',
  paragraphs: [
    'Northern Oasis is our home: 10 acres of tall, mature forest between Marquette and Negaunee. We built our house here in 2019 and keep making improvements to the land every year.',
    'In spring we tap the maples for syrup, and you will drive past our sugar shack on the way in. Our chickens live in a very nice coop, and there are no roosters to wake you up.',
  ],
  highlights: [
    { title: 'Quiet and shady', detail: '7 miles from Marquette, 8 from Lake Superior', icon: 'tree' },
    { title: 'Pets welcome', detail: 'Dogs can roam off leash', icon: 'paw' },
    { title: 'Fresh eggs', detail: `A dozen from our coop for $5`, icon: 'egg' },
    { title: 'Hosts on site', detail: 'We live here and meet you when you arrive', icon: 'home' },
  ] as { title: string; detail: string; icon: IconName }[],
}

// The raised card under the hero on the home page.
export const quickFacts: { icon: IconName; value: string; label: string }[] = [
  { icon: 'tag', value: `$${site.pricePerSiteNight}`, label: 'per site, per night' },
]

// The distances line along the bottom of that card.
export const quickDistances = [
  { miles: 7, place: 'Marquette' },
  { miles: 8, place: 'Lake Superior' },
  { miles: 53, place: 'Pictured Rocks' },
]

export const siteDetails = [
  'Dispersed RV and tent sites on 10 acres of mature maple forest',
  'No numbered sites: pick your own spot, open or more private and wooded',
  'Rigs under 20 ft: travel trailers, pop-ups, class B, campervans, cars, truck campers and rooftop tents',
  'Pull-in, flat, loose gravel; slideouts fit',
  '1 vehicle per site (more parking near the house if arranged); 2WD accessible',
]

// Where guests camp: one open dispersed area with no designated sites.
// Photos live in src/assets/sites, listed by file name in display order.
// TEMPORARY: every photo is a stand-in cut from the tent and lake photos
// until real photos of the area are added. Set `temporaryPhotos` to false
// once they are real, which removes the "Temporary photo" tags.
export const campArea = {
  name: 'The dispersed area',
  summary: 'There are no numbered sites. Pick your own spot in the maples, from open clearings to a couple of more private wooded corners.',
  photos: ['area-1.webp', 'area-2.webp', 'area-3.webp', 'area-4.webp', 'area-5.webp'],
  temporaryPhotos: true,
  tags: ['RV or tent', 'Pick your own spot', `$${site.pricePerSiteNight} per site per night`],
}

export type Amenity = { name: string; detail: string; icon: IconName }

// What's on site.
export const amenities: Amenity[] = [
  { name: 'Campfires', detail: '2 communal pits; 2 sites have private pits', icon: 'fire' },
  { name: 'Toilets', detail: 'Pit toilet by the sites, composting toilet near the house', icon: 'toilet' },
  { name: 'Picnic tables', detail: 'At the sites and by the large fire pit', icon: 'table' },
  { name: 'Wifi', detail: 'Near the large fire pit and chicken coop', icon: 'wifi' },
  { name: 'Pets welcome', detail: 'Off leash; please clean up after them', icon: 'paw' },
  { name: 'Grills', detail: 'Shared charcoal grill; gas grill to rent', icon: 'grill' },
  { name: 'Red shed', detail: 'Yard games, chairs, a table; storm shelter', icon: 'shed' },
]

// What isn't, so guests can plan for it.
export const planFor: Amenity[] = [
  { name: 'No drinking water', detail: 'Bring your own. Well water by hose near the coop for pets and bikes.', icon: 'water' },
  { name: 'No showers', detail: 'Nearby lakes are under a mile away for a swim.', icon: 'shower' },
  { name: 'No hookups', detail: '30 amp electric can be added on 2 sites for $25.', icon: 'plug' },
]

export type AddOn = { name: string; price: number; note: string }

export const addOns: AddOn[] = [
  { name: 'Tentsile tree tent', price: 80, note: '3 to 4 people, set up before you arrive' },
  { name: 'Electric hookup', price: 25, note: '30 amp, 2 sites only' },
  { name: 'Hammock', price: 25, note: 'Large sleeping hammock with net' },
  { name: 'Canoe', price: 20, note: 'Traditional canoe with paddles' },
  { name: 'Kayak', price: 20, note: 'Recreational single; not for Lake Superior or rapids' },
  { name: 'Gas grill', price: 20, note: 'Portable, tank included' },
  { name: '4-person tent', price: 20, note: 'Older style, easy to set up' },
  { name: 'Firewood bundle', price: 8, note: 'Waiting at your site when you arrive' },
  { name: 'Dozen eggs', price: 5, note: 'Fresh from our coop' },
]

export const nearby = [
  { name: 'McClure and Dead River basins', detail: 'Under a mile: fishing, swimming, paddling and a small beach by the boat launch' },
  { name: 'Mountain biking', detail: 'On the Ore to Shore route, about 15 minutes from the Marji trailhead' },
  { name: 'Iron Ore Heritage Trail', detail: 'About 4 miles away; the North Country Trail is close too' },
  { name: 'Marquette and Lake Superior', detail: '7 miles to downtown, 8 miles to the shore' },
  { name: 'Pictured Rocks National Lakeshore', detail: 'About an hour’s drive' },
]

export const reviews = [
  { quote: 'Quiet and secluded but minutes to everything.', name: 'Brent C.' },
  { quote: 'Such a wonderful big property with plenty of gorgeous shade trees.', name: 'Brian G.' },
  { quote: 'Amazing forest setting.', name: 'Kyle H.' },
]

export const faq = [
  { q: 'What time is check-in and check-out?', a: `Check in ${site.checkIn}; we meet you on arrival. Check out ${site.checkOut}. Early or late check-in may be possible, just ask.` },
  { q: 'Is there drinking water?', a: 'No potable water, so bring your own. Well water is available by hose near the chicken coop for pets, washing and bikes; purify it before drinking.' },
  { q: 'Are there showers?', a: 'No. There is a pit toilet by the sites and a composting toilet a short walk away near the house.' },
  { q: 'Can I bring my dog?', a: 'Yes, dogs are welcome off leash. Please pick up after them so everyone can enjoy the land.' },
  { q: 'Can I have a campfire?', a: 'Yes. There are two communal fire pits and two sites with private pits. Firewood bundles are $8 and can be waiting at your site.' },
  { q: 'What about trash?', a: 'Please pack it out, or hand us a tied bag when you leave.' },
  { q: 'How big a rig fits?', a: 'Vehicles under 20 ft. Sites are pull-in, flat and gravel, and slideouts fit. One vehicle per site unless arranged ahead.' },
  { q: 'Will I hear anything?', a: 'It is a quiet forest, but there is a shooting range nearby and you may hear gunfire during the day.' },
  { q: 'Where exactly are you?', a: 'Between Marquette and Negaunee, about 4 miles off US 41. We send exact directions once your booking is confirmed.' },
  { q: 'What is the cancellation policy?', a: `${site.cancellation}. The full terms are shown before you pay.` },
]

// Captions for the photos in src/assets/gallery, keyed by file name.
// They are written under each photo and read by screen readers.
// Photos without a caption get a generic description.
export const galleryCaptions: Record<string, string> = {
  '01-tent.webp': 'Misty morning in the maples',
  '02-lake.webp': 'A calm lake a short walk from camp',
}
