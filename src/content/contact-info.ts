// Every way to reach the camp, in one place. Change a value here and it
// updates across the whole site (Contact section, Info page, booking page,
// footer and Hipcamp links).
//
// This repository is public, so everything here is public too. Private
// addresses used only behind the scenes (who booking emails come from and
// who gets new-booking alerts) are set as Vercel environment variables
// instead: BOOKING_EMAIL_FROM and BOOKING_ALERTS_TO.

export const contactInfo = {
  // Shown on the site. Leave blank to show a "to come" placeholder.
  email: 'lindberg30@yahoo.com',
  phone: '(906) 235-8177',

  // The website's own address, e.g. 'https://northernoasiscamping.com' (no
  // slash at the end). Once set, every page gets a canonical link and a
  // full-address share image, and the build writes sitemap.xml. Leave blank
  // until the domain is live. For now this is Vercel's public address;
  // change it when the camp's own domain is set up.
  websiteUrl: 'https://northernoasis-sigma.vercel.app',

  // The camp's Hipcamp listing.
  hipcampUrl: 'https://www.hipcamp.com/en-US/land/michigan-northern-oasis-camping-nelh0koe',

  // Formspree forms that email messages to the hosts. The ids are public by
  // design (they sit in the form's address). VITE_FORMSPREE_ID and
  // VITE_BOOKING_FORMSPREE_ID override them for testing.
  contactFormId: 'xppdwdoy',
  bookingFormId: 'xppdwdoy',
}
