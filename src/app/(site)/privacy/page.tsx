import type { Metadata } from "next";
import { Prose } from "@/components/mdx/Prose";
import { PageHero } from "@/components/sections/PageHero";
import { pageMeta } from "@/lib/metadata";
import { site } from "@/lib/site";

export const metadata: Metadata = pageMeta({
  title: "Privacy policy",
  description: "What information TechieBreed collects on this website, why, who we share it with, how cookies are used, and your rights.",
  path: "/privacy",
});

/** Change this date whenever the policy below changes. */
const UPDATED = "20 November 2026";

function policy(): string {
  const email = site.contact.email;
  return `
## Who we are

This website, ${site.url.replace(/^https?:\/\//, "")}, is run by TechieBreed. When this policy says "we", "us" or "our", it means TechieBreed. We decide how the information described here is used.

Questions about this policy or your information: email [${email}](mailto:${email}).

This policy covers this website only. The TechieBreed Academy learning hub at [academy.techiebreed.org](${site.academyHubUrl}) is a separate service with its own terms.

## What we collect, and why

### When you send us a form

The **discovery form** asks for your name, email address, company, role, company size, country, what is taking up your team's time, the tools you use, and what you are interested in.

The **Academy interest form** asks for your name, email address, phone number (optional), the programme you are interested in, who the training is for, and an optional message.

We use these answers only to reply to you, to understand your needs, to prepare for a call, and to keep a record of our conversation. We do this because you asked us to get in touch (steps before a possible contract) and because we have a legitimate interest in answering enquiries about our services.

We do not sell your information, and we do not add you to a mailing list unless you ask us to.

### When you book a call

The booking calendar is provided by [Cal.com](https://cal.com/privacy). When you book, Cal.com collects the details you enter (such as your name, email and the time you choose) and shares them with us so we can hold the call.

### When you visit the website

- **Google Analytics** tells us which pages people visit, how they arrive (for example from Google or LinkedIn), roughly which country and device they use, and how long they stay. It uses cookies and gives us totals, not names. We use it to improve the website.
- **Google AdSense** shows adverts on some public pages. Google and its partners use cookies to show ads, measure them, and, where allowed, personalise them based on your visits to this and other websites. See [how Google uses information from sites that use its services](https://policies.google.com/technologies/partner-sites).
- **Our hosting provider** ([Vercel](https://vercel.com/legal/privacy-policy)) keeps short-lived technical logs, such as IP address, browser type and the page requested, to keep the website secure and working. We also use your IP address briefly to stop a single source from sending too many forms.

## Cookies

- **Analytics cookies** (names starting with "\\_ga"), set by Google Analytics: count visits and tell new and returning visitors apart.
- **Advertising cookies** (such as "\\_\\_gads", "\\_\\_gpi" and "IDE"), set by Google AdSense and its partners: show, measure and, where allowed, personalise adverts.
- **Sign-in cookies**, set by TechieBreed: used only in the staff admin area to keep team members signed in. They are not set for visitors.

You can block or delete cookies in your browser settings. The website still works without them. You can also:

- turn off personalised Google ads at [Google's My Ad Center](https://myadcenter.google.com/);
- opt out of personalised ads from many companies at [aboutads.info](https://optout.aboutads.info/);
- stop Google Analytics in your browser with the [Google Analytics opt-out add-on](https://tools.google.com/dlpage/gaoptout).

## Who we share information with

We share information only with the services that help us run the website and answer you:

- **Supabase**: stores the enquiries sent through our forms.
- **Resend**: delivers the form notification emails to our inbox.
- **Zoho Mail**: our email inbox, where we receive and answer messages.
- **Cal.com**: booking calendar.
- **Google**: Analytics and AdSense, as described above.
- **Vercel**: hosts the website.

These providers handle information on our behalf or under their own privacy policies. Some of them store data outside Nigeria, for example in the European Union or the United States. Where that happens, we rely on their security measures and data protection terms.

We may also share information if the law requires it, or to protect our rights or someone's safety.

## How long we keep it

We keep enquiries for as long as we need them to reply to you and to continue any work we do together. When an enquiry is no longer needed, we delete it. You can ask us to delete your enquiry at any time.

Google Analytics data is kept according to the retention setting in our Google Analytics account, and advertising cookies according to Google's policies.

## How we protect it

Enquiries are stored in a database that only signed-in TechieBreed staff can reach. Staff accounts use passwords and can use an authenticator app, and each person sees only what their role needs. Information is sent over encrypted connections (HTTPS).

## Your rights

Under the Nigeria Data Protection Act 2023, and similar laws where you live, you can ask us to:

- tell you what information we hold about you and give you a copy;
- correct information that is wrong or incomplete;
- delete your information;
- stop or limit how we use it, or object to a particular use;
- send your information to you or to another organisation in a common format.

Where we rely on your consent, you can withdraw it at any time.

To use any of these rights, email [${email}](mailto:${email}). We will reply within 30 days. If you are not satisfied with our answer, you can complain to the [Nigeria Data Protection Commission](https://ndpc.gov.ng/).

## Children

This website is meant for businesses and adults. We do not knowingly collect information from children under 13. If you are a parent or guardian enquiring about training for a young person, please contact us directly.

## Changes to this policy

We will update this page if the way we handle information changes. The date at the top shows when it last changed.
`;
}

export default function PrivacyPage() {
  return (
    <>
      <PageHero eyebrow="Privacy" title="Privacy policy" intro={`How TechieBreed handles your information on this website. Last updated ${UPDATED}.`} />
      <article className="container-x max-w-[860px] py-14 md:py-20" aria-label="Privacy policy">
        <Prose source={policy()} />
      </article>
    </>
  );
}
