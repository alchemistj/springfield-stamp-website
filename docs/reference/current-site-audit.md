# Springfield Stamp: WordPress audit for Astro rebuild

Audited: 2026-11-02. Source: live GETs with curl (raw HTML in `scratchpad/ss/raw/`), parsed with stdlib python3 -I (scripts in `scratchpad/ss/scripts/`). Read-only: no forms submitted, nothing changed.

Conventions used below:
- Body copy is taken from the rendered text. Each block is printed once. The page renders most copy twice (desktop and mobile versions, plus carousel repeats), so the duplicate was dropped. Where the two copies differ, both versions are noted.
- Quotes are exact. Typos and curly apostrophes are kept as on the page.
- "not found" means I searched the raw HTML and did not find it.

---

## 0. Summary of surprises

- **Years in business conflict.** Home says "over 60 years" (and "60+ years" in meta). About says "over 50 years!" and "half a century" (and "50-year legacy" in meta). Founding year is not found anywhere.
- **Hours appear only on /contact** ("Mon- Fri 8:00am - 4:30pm"). Not in header, footer, or schema.
- **No LocalBusiness schema.** The only JSON-LD is Yoast's WebSite, Organization, WebPage and BreadcrumbList. The Organization node has no telephone, address or hours.
- **NAP is slightly inconsistent.** "1416 S. Glenstone Ave." (footer) vs "1416 S. Glenstone" (Contact body). "Springfield, MO 65804" vs "Springfield, MO. 65804". Phone shown as "(417) 881-8828", "417-881-8828" and "417.881.8828".
- **A second phone link, tel:4178818803, has no visible text.** It sits in the footer as an icon-only link, and the number is not printed on the page.
- **Notary page lists four priced products** ($22, $30, $32, $19.95). "Buy now!" links to an in-page anchor (#buy), not a cart. No cart, checkout, WooCommerce or payment scripts found. Purchase is by phone or email. The site is not e-commerce in the cart sense.
- **Copy errors to fix in the rebuild:** Magnetic page says "We offer a wide variety of custom stamps" in its name-tag product list. Custom Stamps has "Portland, Maine or Portland, Oregon!..." and "avaailable". Header heading "Spotfor MissouriNotary" is a line-break artifact (rendered as three lines).
- **Heading structure is weak.** Home has no H1 or H2 (only H3s). About has no H1. Custom Stamps has no H1. Magnetic's only H1 is "Springfield Stamp".
- **Contact page has no meta description.**
- **Site runs on WordPress with Thrive Theme/Architect, Gravity Forms, Yoast, WP Rocket.** Lighthouse (mobile, home): Performance 90, Accessibility 91, Best Practices 100, SEO 92.
- **No blog posts.** /blog/ returns 404. The feed has zero items.

---

## 1. Business facts

| Item | As shown on site |
|---|---|
| Legal/display name | "Springfield Stamp & Engraving, Inc." (footer on every page; Contact body). Brand used alone: "Springfield Stamp". Also "Springfield Stamps" (Magnetic and Custom Stamps copy and titles). Site description (schema): "SpringField Stamp and Engraving". |
| Address | Footer (all pages): "1416 S. Glenstone Ave." / "Springfield, MO 65804". Contact body: "1416 S. Glenstone" / "Springfield, MO. 65804". |
| Phone | Header (all pages): "(417) 881-8828". Footer: "417-881-8828". Contact body: "(417) 881-8828" and "417.881.8828". All link to tel:4178818828. |
| Second phone link | Footer icon link to tel:4178818803 (decodes to 417-881-8803). No visible text. Number not printed. Purpose not found. |
| Email | orders@springfieldstamp.com (footer, body and mailto links). |
| Hours | "Mon- Fri" / "8:00am - 4:30pm" (Contact page only). Not found on other pages. |
| Owner names | "Adam and Bri" (home: "Now in the hands of Adam and Bri, the founder's nephew and niece-in-law"; About: "So he approached us (Adam and Bri)"). Last names: not found. Founder: "Adam's uncle, John Arnold, started Springfield Stamp". |
| Years and claims (as written) | Home meta: "Family-owned, 60+ years experience." Home body: "family-owned and operated business for over 60 years." Home body: "our 60 years of experience". About meta: "Discover the 50-year legacy of Springfield Stamp." About body: "We've been a family-owned business for over 50 years!" and "after half a century of hard work". Founding year: not found. |
| Other claims | Header banner: "1-Day Service!" Home: "In most cases, you'll receive your products within a few short days!" About: "We're legendary for our turnaround time." Magnetic: "Our US-based customer support team is unparalleled in the world." Missouri meta: "Fast shipping and full compliance guaranteed." Missouri body: "your documents are legally valid and recognized." Custom: "Lightning-fast turnaround". |
| Service area / cities | Not found as a list. Mentions: "Springfield, MO" (address), "US-based", "support local businesses", "from the farthest reaches of the country" (About), "we'll then ship your stamp right away" (Custom), "fast shipping" (Missouri). |
| Map | Google Maps embed on Contact, centred at 37.1883738, -93.2618564, place name "Springfield Stamp & Engraving". |
| Social | Facebook: https://www.facebook.com/SpringfieldStamp (footer). Other networks: not found (footer has two more icon links with empty href, network not identified). |
| Logo | springfield-stamp-logo-black.png (header, 600x195), springfield-stamp-logo-white.png (footer, 600x195). Favicon: cropped-springfield-stamp-favicon.png (512 px). |

---

## 2. Per page

### 2.1 Home: https://www.springfieldstamp.com/

- **Title:** Springfield Stamp & Engraving in Springfield Missouri
- **Meta description:** High-quality custom stamps, name tags, awards & more. Fast turnaround, friendly service & expert advice. Family-owned, 60+ years experience.
- **Canonical:** https://www.springfieldstamp.com/
- **robots:** index, follow, max-image-preview:large, max-snippet:-1, max-video-preview:-1
- **og:image:** https://www.springfieldstamp.com/wp-content/uploads/2024/03/springfield-stamp-Logo-Stamp_2.png
- **H1:** not found
- **H2:** not found
- **H3 (unique, each appears twice in source):** Make a Lasting Impression… / Custom Stamps / Magnetic Name Tags / Self-Inking Stamps / Address Stamps / Desk Name Plates / Acrylic Awards / Notary Stamps
- **Not headings (plain p):** "How We Can Help…", "Our Workflow Process Might Be the Easiest Thing You Do All Day!", "Why Do Business with Us?", "FAST TURNAROUND", "Customer Service", "QUALITY WORK", "About Us"

**Body copy (desktop copy, duplicate removed):**

> Make a Lasting Impression…
>
> Springfield Stamp:
> Your Trusted Partner for Custom Products
> High-quality stamps, name tags & awards. Fast turnaround, friendly service.
> Give us a call Today! (417) 881-8828
> Email Springfield Stamp
>
> How We Can Help…
>
> **Custom Stamps**
> Leave a lasting impression with custom stamps crafted to your exact specifications. Choose from a variety of sizes, styles, and ink colors to create unique stamps for your business, personal use, or special occasions.
> [See Our Custom Stamp Options]
>
> **Magnetic Name Tags**
> Make introductions a breeze with professional-looking magnetic name tags. Our customizable options allow you to showcase your brand logo, personalize with employee names, and choose from various styles and materials to match your needs.
> [Explore Magnetic Name Tags Here]
>
> **Self-Inking Stamps**
> Simplify your stamping needs with our convenient self-inking stamps. These stamps offer clean, crisp impressions with every use, eliminating the need for separate ink pads. Perfect for everyday tasks like signing documents, addressing envelopes, or personalizing packaging.
>
> **Address Stamps**
> Add a touch of elegance and professionalism to your correspondence with a personalized address stamp. Choose from classic or decorative designs, and let us create a stamp that reflects your unique style.
>
> **Desk Name Plates**
> Elevate your workspace with professional and stylish desk name plates. Our high-quality materials and elegant designs ensure your name stands out, making a lasting impression on visitors and colleagues.
>
> **Acrylic Awards**
> Celebrate accomplishments and recognition with beautiful acrylic awards. We offer a variety of styles and sizes to suit any occasion, allowing you to personalize each award with text, logos, or images.
>
> **Notary Stamps**
> Notarize documents with ease and professionalism using your very own notary stamp. No more messy ink pads or missed details plus – we have all the supplies: the stamp, journal, and embosser!
> [Get Your Notary Stamp]
>
> Our Workflow Process Might Be the Easiest Thing You Do All Day!
> Ordering your custom products from Springfield Stamp is simple and hassle-free.
>
> Testimonials (carousel, repeated twice in source; dedupe, see section 7):
> "I needed custom stamps in a hurry, and Springfield Stamp came to the rescue! They had my order ready in just a few days, and the quality is fantastic.
> Sarah B. / Business Owner
> The customer service at Springfield Stamp is top-notch. They listened carefully to my needs and offered suggestions I hadn't even thought of. My desk name plates look amazing!
> John D. / Marketing Manager
> We ordered acrylic awards for our employee recognition ceremony, and they were a huge hit! The quality is exceptional, and the engraving is beautiful.
> Jane S. / HR Manager
>
> Just give us a call, tell us what you need, and our friendly team guides you through the process. We'll clarify any details, offer valuable suggestions based on our 60 years of experience, and get started on fulfilling your order right away. In most cases, you'll receive your products within a few short days!
> [Click to Call (417) 881-8828]
>
> Why Do Business with Us?
>
> FAST TURNAROUND
> Need your order quickly? No problem! We understand tight deadlines. Our lightning-fast turnaround times ensure you get your products when you need them most. Whether you need custom stamps for a last-minute marketing campaign or personalized name tags for an upcoming event, we've got you covered.
>
> Customer Service
> At Springfield Stamp, we don't just sell products, we build relationships. Our friendly and knowledgeable team is dedicated to providing exceptional customer service. We'll take the time to understand your needs, answer your questions, and offer expert suggestions to ensure you get the perfect product for your specific requirements.
>
> QUALITY WORK
> We take pride in offering superior quality products that are built to last. From the materials we use to the craftsmanship of our work, we ensure exceptional results that will exceed your expectations. Our products are not only beautiful but also durable, ensuring they make a lasting impression.
>
> About Us
> Springfield Stamp has been a family-owned and operated business for over 60 years. Now in the hands of Adam and Bri, the founder's nephew and niece-in-law, we carry on the tradition of exceptional quality, personalized service, and fast turnaround times. We're passionate about helping our customers make a lasting impression, and we're dedicated to providing the best possible experience every step of the way.
> [Read Our STORY] → /about/

**CTAs on Home**

| Label | Target |
|---|---|
| Header phone (417) 881-8828 | tel:4178818828 |
| Give us a call Today! (417) 881-8828 | tel:4178818828 |
| Email Springfield Stamp | mailto:orders@springfieldstamp.com |
| See Our Custom Stamp Options (x2) | /custom-stamps/ |
| Explore Magnetic Name Tags Here | /magnetic-name-tags/ |
| Get Your Notary Stamp | https://www.springfieldstamp.com/missouri-notary-stamp/ |
| Click to Call (417) 881-8828 | tel:4178818828 |
| Read Our STORY | /about/ |

**Home JSON-LD (verbatim)**

```json
{"@context":"https://schema.org","@graph":[{"@type":"WebPage","@id":"https://www.springfieldstamp.com/","url":"https://www.springfieldstamp.com/","name":"Springfield Stamp & Engraving in Springfield Missouri","isPartOf":{"@id":"https://www.springfieldstamp.com/#website"},"about":{"@id":"https://www.springfieldstamp.com/#organization"},"primaryImageOfPage":{"@id":"https://www.springfieldstamp.com/#primaryimage"},"image":{"@id":"https://www.springfieldstamp.com/#primaryimage"},"thumbnailUrl":"https://www.springfieldstamp.com/wp-content/uploads/2024/03/springfield-stamp-Logo-Stamp_2.png","datePublished":"2024-03-21T05:51:40+00:00","dateModified":"2025-06-30T16:34:26+00:00","description":"High-quality custom stamps, name tags, awards & more. Fast turnaround, friendly service & expert advice. Family-owned, 60+ years experience.","breadcrumb":{"@id":"https://www.springfieldstamp.com/#breadcrumb"},"inLanguage":"en-US","potentialAction":[{"@type":"ReadAction","target":["https://www.springfieldstamp.com/"]}]},{"@type":"ImageObject","inLanguage":"en-US","@id":"https://www.springfieldstamp.com/#primaryimage","url":"https://www.springfieldstamp.com/wp-content/uploads/2024/03/springfield-stamp-Logo-Stamp_2.png","contentUrl":"https://www.springfieldstamp.com/wp-content/uploads/2024/03/springfield-stamp-Logo-Stamp_2.png","width":472,"height":337,"caption":"springfield-stamp-Logo-Stamp"},{"@type":"BreadcrumbList","@id":"https://www.springfieldstamp.com/#breadcrumb","itemListElement":[{"@type":"ListItem","position":1,"name":"Home"}]},{"@type":"WebSite","@id":"https://www.springfieldstamp.com/#website","url":"https://www.springfieldstamp.com/","name":"Springfield Stamp","description":"SpringField Stamp and Engraving","publisher":{"@id":"https://www.springfieldstamp.com/#organization"},"potentialAction":[{"@type":"SearchAction","target":{"@type":"EntryPoint","urlTemplate":"https://www.springfieldstamp.com/?s={search_term_string}"},"query-input":{"@type":"PropertyValueSpecification","valueRequired":true,"valueName":"search_term_string"}}],"inLanguage":"en-US"},{"@type":"Organization","@id":"https://www.springfieldstamp.com/#organization","name":"Springfield Stamp","url":"https://www.springfieldstamp.com/","logo":{"@type":"ImageObject","inLanguage":"en-US","@id":"https://www.springfieldstamp.com/#/schema/logo/image/","url":"https://www.springfieldstamp.com/wp-content/uploads/2024/03/cropped-springfield-stamp-favicon.png","contentUrl":"https://www.springfieldstamp.com/wp-content/uploads/2024/03/cropped-springfield-stamp-favicon.png","width":512,"height":512,"caption":"Springfield Stamp"},"image":{"@id":"https://www.springfieldstamp.com/#/schema/logo/image/"}}]}
```

Other pages carry the same WebSite and Organization nodes, plus a page-specific WebPage and BreadcrumbList. Their breadcrumb names are: About "About Springfield Stamp"; Contact "Contact Us"; Custom Stamps "Springfield Stamps: Your Friendly Neighborhood Custom Stamp Experts!"; Magnetic "Springfield Stamps: Magnetic Name Tags that Make Connections Count!"; Missouri "Missouri Notary Stamp". Their dateModified values: About 2025-11-10, Contact 2026-02-19, Custom 2026-02-18, Magnetic 2024-05-08, Missouri 2026-02-18.

---

### 2.2 Magnetic Name Tags: https://www.springfieldstamp.com/magnetic-name-tags/

- **Title:** Magnetic Name Tags & Badges Springfield Stamps: Friendly, Fast Service
- **Meta description:** Find the perfect magnetic name tags for your business at Springfield Stamps! Customizable, durable, & professional. Shop now & make a lasting impression!
- **Canonical:** https://www.springfieldstamp.com/magnetic-name-tags/
- **og:image:** https://www.springfieldstamp.com/wp-content/uploads/2024/03/springfield-magnetic_tags.jpg
- **H1:** "Springfield Stamp" (the only H1; appears to be brand text)
- **H2:** "MAGNETIC NAME TAGS that Make Connections Count!" (rendered as "MAGNETIC NAME TAGS" / "that Make Connections Count!"; appears twice in source)
- **H3:** not found
- **Not headings (plain p):** "Find the Perfect Magnetic Name Tag for Your Needs", "Find the Perfect name tag for Your Unique Needs", "Design Your Own in Minutes: It's Easy!", "The Power of Name Tags", "More Than Just Name Tags: Building Connection", "Why Choose Springfield Stamp?" (span), "Ready to give your team the professional image they deserve?" (span)

**Body copy (deduped):**

> MAGNETIC NAME TAGS that Make Connections Count!
> Springfield Stamp
>
> Howdy from Springfield Stamp, your friendly neighborhood experts in making names stick — literally!
>
> We take pride in offering top-quality blurless magnetic nametags backed by friendly, small-town service. You can expect personalized attention, lightning-fast turnaround times, and the kind of genuine care that makes you feel like you're dealing with a neighbor.
>
> Give us a call today to get started!
> (417) 881-8828
>
> Whether you're a bustling restaurant needing custom magnetic name tags with logos for your waitstaff, a growing startup seeking professional name badges, or a local school fostering a sense of community with photo name tags, we've got the perfect solution.
>
> Find the Perfect Magnetic Name Tag for Your Needs
>
> We offer a wide variety of custom magnetic name tags to meet your unique needs, including:
>
> **Classic Magnetic Name Tags**: Simple and functional, perfect for everyday use. Choose from a variety of sizes, shapes, and colors.
> **Magnetic Name Tags with Logo**: Showcase your brand with a professional-looking logo. Upload your own logo or let our design team create one for you. Make a lasting impression whenever you meet someone new.
> **Engraved Magnetic Name Tags**: Add a touch of elegance with personalized engraved name tags. Perfect for executives, professionals, or special events.
> **Full-Color Magnetic Name Tags**: Make a bold statement with vibrant, full-color designs. Ideal for creative businesses, marketing campaigns, or team-building events.
> **Magnetic Photo Name Tags**: Put a face to the name with personalized photo name tags. Great for schools, healthcare facilities, or customer service teams.
>
> Find the Perfect name tag for Your Unique Needs
>
> We offer a wide variety of custom stamps to meet your specific business needs, including:
> (The four product cards repeat here: Classic, with Logo, Engraved, Full-Color, and their descriptions as above. Photo Name Tags is listed in the product list with its description.)
>
> Looking for something truly unique?
>
> We offer custom options like magnetic closures, breakaway lanyards, and more. Just let us know your vision, and we'll bring your dream name tag to life!
>
> Contact us today to discuss your customization options and get started.
> [Call (417) 881-8828 to Start Creating] / [CALL US]
>
> Design Your Own in Minutes: It's Easy!
>
> Creating your custom magnetic name tags is a breeze! Choose your style, size, and design elements, send us your logo or photo, and see your creation come to life. Once you're satisfied, place your order and we'll get started right away!
>
> The Power of Name Tags
>
> Beyond simply identifying individuals, magnetic name tags offer a surprising range of benefits for businesses and organizations. Here’s how they can positively impact your environment:
>
> **BREAK THE ICE**: Name tags instantly facilitate introductions and ease social interactions, creating a more welcoming and approachable atmosphere.
> **Boost Brand Recognition**: Custom logo name tags subtly reinforce your brand identity with every interaction, increasing brand awareness and memorability.
> **Promote Professionalism**: Name tags project a polished and put-together image, fostering trust and confidence in your team and organization.
> **Improve Communication**: By readily identifying individuals, name tags enable smoother communication and collaboration, streamlining interactions and fostering teamwork.
> **Enhance Customer Service**: Personalized name tags create a friendlier and more personalized customer experience, leaving a lasting positive impression. (Source splits "impression" across a span; rendered as "i" + "m" + "pression.")
>
> More Than Just Name Tags:
> Building Connection
>
> At Springfield Stamp, we're passionate about helping businesses connect with their customers and employees. That's why we offer a variety of other products to enhance your professional image, including:
> - Custom rubber stamps for a personalized touch on documents and packaging.
> - Promotional products to spread brand awareness and appreciation.
> - Embroidered badges for a touch of class and distinction.
>
> Why Choose Springfield Stamp?
>
> In a world of online anonymity, we value the power of personal connection and small-town service. Here's why you should choose Springfield Stamp for your custom name tag needs:
>
> **Unmatched Quality**: We use high-grade materials and expert craftsmanship to ensure your name tags look their best and last for years to come.
> **Speed is Key**: We understand the importance of time, so we offer lightning-fast turnaround times to get you the name tags you need – when you need them!
> **Personalized Touch**: Our friendly team is here to answer your questions, help you choose the perfect option, and ensure a smooth ordering experience.
> **Community focus**: We're proud to support local businesses and be an active part of the small business community.
>
> Ready to give your team the professional image they deserve?
>
> For expert advice and personalized service, call [(417) 881-8828]. Our US-based customer support team is unparalleled in the world. We can clarify any questions, ensure that we get you exactly what you need, and accelerate the turnaround time!

**CTAs on Magnetic**

| Label | Target |
|---|---|
| (417) 881-8828 (x3 in body) | tel:4178818828 |
| Call (417) 881-8828 to Start Creating | tel:4178818828 |
| CALL US | tel:4178818828 |
| Header/footer phone and email | tel / mailto (same as all pages) |

No prices and no add-to-cart on this page, despite "Shop now" in the meta description.

---

### 2.3 About: https://www.springfieldstamp.com/about/

- **Title:** Springfield Stamp - Family Tradition & Quality Service
- **Meta description:** Discover the 50-year legacy of Springfield Stamp. Family-owned, we pride ourselves on rapid service, meticulous care, and delivering the perfection you need.
- **Canonical:** https://www.springfieldstamp.com/about/
- **og:image:** not found (no og:image tag)
- **H1:** not found ("ABOUT" is a p)
- **H2:** "Why Choose Springfield Stamp?"
- **H3:** not found

**Body copy (deduped):**

> ABOUT
> Springfield Stamp
>
> We’ve been a family-owned business for over 50 years!
>
> Adam’s uncle, John Arnold, started Springfield Stamp, beginning a long tradition of customer service and attention to detail.
>
> While he loves his customers and work, after half a century of hard work, it was time for John to spend a little less time at the shop and a little more time getting work done around his house. So he approached us (Adam and Bri) about taking over the business. (Although you can still find him puttering around the shop answering all of the challenging questions!)
>
> Long time admirers of John’s conscientious and meticulous approach to Springfield Stamp, we agreed to continue the legacy.
>
> Combining John’s years of experience with new ideas and technology, we focus on premium quality products and top-notch customer service.
>
> Howdy from Springfield Stamp, your one-stop shop for custom rubber stamps, personalized stamps, and all things that help you make a lasting impression! Whether you're a bustling bakery needing custom logo stamps for your packaging or a freelance artist adding a unique touch with art stamps, we've got the perfect tool for your small business.
>
> Why Choose Springfield Stamp?
>
> We’re legendary for our turnaround time.
>
> It sounds like bragging, I know, but the fact is, it’s a bit of an obsession.
>
> We can’t even go to bed at night if there are dirty dishes in the sink…(despite a toddler dominating our evening routine!)
>
> So if there’s work to be done, we don’t rest until it’s done.
>
> So you can be assured that we process your order as efficiently as possible.
>
> Plus, as a family business, we bring mid-western family values to work every day. Our customers are an extension of our community, even though they may come from the farthest reaches of the country.
>
> We want everything to be PERFECT…so we take the time to ask the right questions and deliver exactly what our clients want and need.
> [Click Here to Get in Touch] → https://www.springfieldstamp.com/contact

**CTAs on About:** "Click Here to Get in Touch" links to https://www.springfieldstamp.com/contact (no trailing slash; it 301s to /contact/).

No product images. Only the logo images are present.

---

### 2.4 Missouri Notary Stamps: https://www.springfieldstamp.com/missouri-notary-stamp/

- **Title:** Missouri Notary Stamps and Embossers | Springfield Stamp
- **Meta description:** Shop high-quality Missouri notary stamps, seals, embossers, and journals that meet all state requirements. Fast shipping and full compliance guaranteed.
- **Canonical:** https://www.springfieldstamp.com/missouri-notary-stamp/
- **og:image:** https://www.springfieldstamp.com/wp-content/uploads/2025/05/springfield-stamps_rectangular.jpg
- **H1:** "Your One-Stop Spot for Missouri Notary Stamps" (rendered over three lines: "Your One-Stop Spot" / "for Missouri" / "Notary Stamps")
- **H2:** "Notary Stamps"; "Missouri Notary Stamp Requirements"
- **H3:** "Rectangle Stamp"; "Circular Stamp"; "Notary Embosser"; "Notary Journal" (each appears twice in source)

**Body copy (deduped):**

> Your One-Stop Spot for Missouri Notary Stamps
> Notary stamps
>
> Our high-quality notary stamps, seals, and embossers meet all Missouri notary stamp requirements, ensuring that your documents are legally valid and recognized. Whether you need a new notary stamp, a replacement, or an embosser, we have the products that will meet your professional needs.
>
> Notary Stamps
>
> **Rectangle Stamp** — $22
> Sleek and easy to use, this rectangular notary stamp provides a modern alternative to the traditional circular style. Designed for efficiency, it produces sharp, legible text and fits perfectly on standard document lines.
> [Buy now!] → #buy
>
> **Circular Stamp** — $30
> This classic round notary stamp features a clean, professional design that complies with state regulations. Ideal for official documents, it delivers crisp, clear impressions with every use.
> [Buy now!] → #buy
> (The second copy of this card adds: "Available in multiple ink colors." It appears in only one of the two copies, so confirm which copy is intended.)
>
> **Notary Embosser** — $32
> Add a layer of authenticity and elegance to your documents with this notary embosser. Compact and durable, it creates a raised seal impression and is perfect for both personal and professional use.
> [Buy now!] → #buy
>
> **Notary Journal** — $19.95
> Stay organized and compliant with this secure, professionally bound notary journal. Includes detailed entry fields to record every notarization, helping you meet legal record-keeping requirements with ease.
> [Buy now!] → #buy
>
> Missouri Notary Stamp Requirements
>
> As a notary in Missouri, your stamp must meet the following specifications:
> - The notary stamp should include your name, commission number, expiration date, and the county where you are commissioned.
> - The stamp must be legible, permanent, and inked.
> - Missouri notary seals must be in a rectangular or circular format.
>
> At Springfield Stamp & Engraving, you can shop with confidence knowing that all of our stamps are legally recognized and fully compliant. We provide high-quality products that meet the highest standards, ensuring your documents remain valid and professional.
>
> Buy Your Missouri Notary Supplies Today
>
> Ready to get your Missouri notary stamp? Contact us now and take advantage of fast shipping, high-quality products, and excellent customer service.
> [call us] (417) 881-8828 · [email us] orders@springfieldstamp.com

**Commerce notes:** Four priced products; "Buy now!" links to `#buy`, which is an in-page paragraph ("At Springfield Stamp & Engraving, you can shop with confidence..."). No cart, checkout or payment script found. The product cards also link to `#tve-jump-196d931fedb`, and no element with that id was checked. Product images are shown, but no product page exists.

---

### 2.5 Custom Stamps: https://www.springfieldstamp.com/custom-stamps/

- **Title:** Get Your Custom Rubber Stamps Fast!
- **Meta description:** Springfield Stamps: your best custom stamp source. Get self-inking, signature, logo, daters & more. Enjoy friendly service, fast turnaround, and top quality.
- **Canonical:** https://www.springfieldstamp.com/custom-stamps/
- **og:image:** https://www.springfieldstamp.com/wp-content/uploads/2024/03/springfield-stamps_premium.png
- **H1:** not found
- **H2:** "Your Friendly Neighborhood CUSTOM STAMP Experts!" (mobile copy: "CUSTOM STAMPS"); "Find the Perfect Stamp for Your Unique Needs"; "Ready to create your own custom stamp?"; "why choose springfield stamp?"; "Make your mark with Springfield Stamp"
- **H3:** not found

**Body copy (deduped):**

> springfield stamp
> Your Friendly Neighborhood CUSTOM STAMP Experts!
>
> Howdy from Springfield Stamp, your one-stop shop for custom rubber stamps, personalized stamps, and all things that help you make a lasting impression! Whether you're a bustling bakery needing custom logo stamps for your packaging or a freelance artist adding a unique touch with art stamps, we've got the perfect tool for your small business.
>
> Find the Perfect Stamp for Your Unique Needs
>
> We take pride in being your friendly neighborhood stamp experts. That means we offer premium quality stamps crafted with care, lightning-fast turnaround time, and personalized customer service that feels just like chatting over a cup of coffee!
>
> **Self-Inking Stamps**: Stay efficient with quick, clean impressions. Perfect for invoices, receipts, and adding a personalized touch to packaging. Choose from a variety of sizes, colors, and ink types to match your brand.
> **Signature Stamps**: Replicate your handwritten signature with perfect accuracy, saving you time and adding a personal touch to documents. Ideal for contracts, handwritten notes, proposals, and checks.
> **Logo Stamps**: Showcase your brand with a professional-looking logo stamp. Upload your own logo or let our design partners create one for you, ensuring a consistent and memorable brand image.
> **Daters & Inks**: Keep track of important dates with our handy daters, avaailable in various styles and ink colors. We also offer a variety of high-quality inks to keep your stamps looking their best, ensuring professionalism and accuracy on every document.
>
> NOTARY STAMPS
> Notarize documents with ease and professionalism using your very own notary stamp. No more messy ink pads or missed details plus – we have all the supplies: the stamp, journal, and embosser!
> [Get Your Notary Stamp] → /missouri-notary-stamp/
>
> Ready to create your own custom stamp?
>
> It’s easy—just give us a call! We’ll help you simplify your stamp design decisions, choose your ink color, and place your order. We'll then ship your stamp right away, so you can start making your mark in no time!
>
> Give us a call today
> [Call (417) 881-8828 to Get Started] → tel:4178818828
>
> why choose springfield stamp?
>
> In a world of faceless online retailers, we believe in the power of personal connection and small-town values….whether you are from Portland, Maine or Portland, Oregon!...
> Here's why you should choose Springfield Stamp for your custom stamp needs:
>
> **Attention to detail**: We handcraft each stamp with care, ensuring superior quality and durability.
> **Lightning-fast turnaround**: We know time is precious, so we get your stamps to you quickly and efficiently.
> **Personalized customer service**: Our friendly U.S.-based team is always happy to answer your questions and help you find the perfect stamp for your needs.
> **Community focus**: We're proud to support local businesses and be an active part of the small business community.
>
> Make your mark with Springfield Stamp
> Don't settle for ordinary when you can have extraordinary with Springfield Stamp – where quality meets creativity, and every impression counts!
> 📞 Contact Our US-Based Team: Do you have questions or need assistance with your order? Our friendly team is here to help!
> Call us at [(417) 881-8828] or email us at [orders@springfieldstamp.com].

**Product sections have images and copy but no prices, no buy links, and no order form.**

---

### 2.6 Contact: https://www.springfieldstamp.com/contact/

- **Title:** Contact Us
- **Meta description:** not found (no meta description tag)
- **Canonical:** https://www.springfieldstamp.com/contact/
- **og:image:** https://www.springfieldstamp.com/wp-content/uploads/2024/03/call-us-springfield-stamp.jpg (700x413)
- **H1:** "CONTACT US" (appears twice in source); "send us a message"
- **H2 / H3:** not found

**Body copy (deduped):**

> CONTACT US
>
> In order for us to provide the best service possible, we prefer phone calls!
> (We’re old-school like that!)
>
> You can reach us at:
> [(417) 881-8828] → tel:4178818828
>
> This allows us to ask specific questions and make sure that we provide EXACTLY what you need.
>
> We look forward to speaking with you!
>
> Other details and ways to get in touch are here:
> Springfield Stamp & Engraving, Inc.
> 1416 S. Glenstone
> Springfield, MO. 65804
> [417.881.8828] → tel:4178818828
> Mon- Fri
> 8:00am - 4:30pm
>
> send us a message
>
> Form fields (see section 4): Name (First, Last), Email, Phone, Message. Labels as shown: Comments (near the honeypot), "This field is for validation purposes and should be left unchanged.", Name, First, Last, Email, Phone, Message, [Send Message].
> Embedded map: Google Maps, no visible text.

**CTAs on Contact:** Phone links to tel:4178818828 (x2). Email: mailto:orders@springfieldstamp.com (footer). Button: "Send Message" (form submit).

---

## 3. Shared header and footer (appear on every page)

**Header (desktop and mobile copies):**
- Banner: "1-Day Service!"
- Phone: "(417) 881-8828" (tel:4178818828)
- Nav: Custom Stamps (/custom-stamps) · Magnetic Name Tags (/magnetic-name-tags) · Notary Stamps (https://www.springfieldstamp.com/missouri-notary-stamp/) · About (/about) · Contact (/contact)
- Logo: springfield-stamp-logo-black.png, alt "springfield stamp logo", link to https://www.springfieldstamp.com (no trailing slash)
- Mobile menu toggle (likely): javascript:void(0)

**Footer:**
- Logo: springfield-stamp-logo-white.png, alt "springfield-stamps logo"
- INFORMATION: Custom Stamps · Magnetic Name Tags · Notary Stamps · Contact Us
- CONTACT US: Springfield Stamp & Engraving, Inc. · 1416 S. Glenstone Ave. · Springfield, MO 65804 · 417-881-8828 · orders@springfieldstamp.com
- SOCIAL: icon links (see section 5)

---

## 4. Images

Full-resolution URLs are the upload originals. The `-WxH` thumbnails are not used, and the largest srcset candidate matches the src. The sitemap lists the same URLs. Placeholder SVG data URIs are excluded.

### Home
| Role | alt | Full-res URL |
|---|---|---|
| Logo (header) | springfield stamp logo | https://www.springfieldstamp.com/wp-content/uploads/2024/03/springfield-stamp-logo-black.png |
| Product / section (How We Can Help) | springfield-stamp-Logo-Stamp | https://www.springfieldstamp.com/wp-content/uploads/2024/03/springfield-stamp-Logo-Stamp_2.png |
| Product: Magnetic Name Tags | springfield-logo-magnetic-tags | https://www.springfieldstamp.com/wp-content/uploads/2024/03/springfield-logo-magnetic-tags-2.png |
| Product: Self-Inking | Self-Inking-Stamps | https://www.springfieldstamp.com/wp-content/uploads/2024/03/Self-Inking-Stamps.jpg |
| Product: Address | Address-Stamps | https://www.springfieldstamp.com/wp-content/uploads/2024/03/Address-Stamps.jpg |
| Product: Desk name plates | Desk Name Plate | https://www.springfieldstamp.com/wp-content/uploads/2024/04/Desk-Name-Plate.webp |
| Product: Acrylic awards | Acrylic Awards | https://www.springfieldstamp.com/wp-content/uploads/2024/04/Acrylic-Awards.webp |
| Product: Notary | springfield-stamps_rectangular | https://www.springfieldstamp.com/wp-content/uploads/2025/05/springfield-stamps_rectangular.jpg |
| Testimonial avatar (x3 shown; same file) | springfield stamp-testimonial | https://www.springfieldstamp.com/wp-content/uploads/2024/03/springfield-stamp-testimonial.png |
| Icon (no alt) | (empty) | https://www.springfieldstamp.com/wp-content/uploads/2024/03/break-the-ice.png |
| Icon (no alt) | (empty) | https://www.springfieldstamp.com/wp-content/uploads/2024/03/enhance.png |
| Icon (no alt) | (empty) | https://www.springfieldstamp.com/wp-content/uploads/2024/03/boost-brand.png |
| Logo (footer) | springfield-stamps logo | https://www.springfieldstamp.com/wp-content/uploads/2024/03/springfield-stamp-logo-white.png |

Not mapped to sections: the three icons (break-the-ice, enhance, boost-brand) are in the home markup, but I did not confirm which heading each one sits under.

### About
| Role | alt | Full-res URL |
|---|---|---|
| Logo (header) | springfield stamp logo | https://www.springfieldstamp.com/wp-content/uploads/2024/03/springfield-stamp-logo-black.png |
| Logo (footer) | springfield-stamps logo | https://www.springfieldstamp.com/wp-content/uploads/2024/03/springfield-stamp-logo-white.png |

No content images.

### Magnetic Name Tags
| Role | alt | Full-res URL |
|---|---|---|
| Logo (header) | springfield stamp logo | https://www.springfieldstamp.com/wp-content/uploads/2024/03/springfield-stamp-logo-black.png |
| Hero / product | springfield-magnetic_tags | https://www.springfieldstamp.com/wp-content/uploads/2024/03/springfield-magnetic_tags.jpg |
| Product: logo tags | (empty) | https://www.springfieldstamp.com/wp-content/uploads/2024/03/springfield-logo-magnetic-tags.jpg |
| Product: engraved | springfield-engraved-magnetic-tags | https://www.springfieldstamp.com/wp-content/uploads/2024/03/springfield-engraved-magnetic-tags.jpg |
| Product: full colour | springfield-full-color-magnetic-tags | https://www.springfieldstamp.com/wp-content/uploads/2024/03/springfield-full-color-magnetic-tags3.jpg |
| Product: photo tags | (empty) | https://www.springfieldstamp.com/wp-content/uploads/2024/03/photo-name-tags.png |
| Product: photo tags (second) | magnetic-tags | https://www.springfieldstamp.com/wp-content/uploads/2024/03/magnetic-tags-4.png |
| Product: name tags | (empty) | https://www.springfieldstamp.com/wp-content/uploads/2024/03/springfield-stamp-name-tags.jpg |
| Icon (benefits) | (empty) | https://www.springfieldstamp.com/wp-content/uploads/2024/03/break-the-ice.png |
| Icon (benefits) | (empty) | https://www.springfieldstamp.com/wp-content/uploads/2024/03/boost-brand.png |
| Icon (benefits) | (empty) | https://www.springfieldstamp.com/wp-content/uploads/2024/03/promote.png |
| Icon (benefits) | (empty) | https://www.springfieldstamp.com/wp-content/uploads/2024/03/improve.png |
| Icon (benefits) | (empty) | https://www.springfieldstamp.com/wp-content/uploads/2024/03/enhance.png |
| Icon (why choose) | springfield stamps | https://www.springfieldstamp.com/wp-content/uploads/2024/03/stamp-grey.png |
| Icon (why choose) | springfield-turnaround | https://www.springfieldstamp.com/wp-content/uploads/2024/03/springfield-turnaround.png |
| Icon (why choose) | (empty) | https://www.springfieldstamp.com/wp-content/uploads/2024/03/springfield-cs-grey.png |
| Icon (why choose) | community | https://www.springfieldstamp.com/wp-content/uploads/2024/03/community-1.png |
| Logo (footer) | springfield-stamps logo | https://www.springfieldstamp.com/wp-content/uploads/2024/03/springfield-stamp-logo-white.png |

### Missouri Notary Stamps
| Role | alt | Full-res URL |
|---|---|---|
| Logo (header) | springfield stamp logo | https://www.springfieldstamp.com/wp-content/uploads/2024/03/springfield-stamp-logo-black.png |
| Product: rectangular | springfield-stamps_rectangular | https://www.springfieldstamp.com/wp-content/uploads/2025/05/springfield-stamps_rectangular.jpg |
| Product: circular | springfield-stamps_circular | https://www.springfieldstamp.com/wp-content/uploads/2025/05/springfield-stamps_circular.jpg |
| Product: embosser | springfield-stamps_notary-embosser | https://www.springfieldstamp.com/wp-content/uploads/2025/05/springfield-stamps_notary-embosser.jpg |
| Banner (mobile, role not confirmed) | (empty) | https://www.springfieldstamp.com/wp-content/uploads/2024/10/springfield-stamps-mobile.webp |
| Logo (footer) | springfield-stamps logo | https://www.springfieldstamp.com/wp-content/uploads/2024/03/springfield-stamp-logo-white.png |

### Custom Stamps
| Role | alt | Full-res URL |
|---|---|---|
| Logo (header) | springfield stamp logo | https://www.springfieldstamp.com/wp-content/uploads/2024/03/springfield-stamp-logo-black.png |
| Hero | springfield-stamps_premium | https://www.springfieldstamp.com/wp-content/uploads/2024/03/springfield-stamps_premium.png |
| Product: self-inking | springfield-stamp-IDEAL-line | https://www.springfieldstamp.com/wp-content/uploads/2024/03/springfield-stamp-IDEAL-line.jpg |
| Product: signature | springfield-stamp-maxlight | https://www.springfieldstamp.com/wp-content/uploads/2024/03/springfield-stamp-maxlight.jpg |
| Product: logo stamps | springfield-stamp-Logo-Stamp | https://www.springfieldstamp.com/wp-content/uploads/2024/03/springfield-stamp-Logo-Stamp_2.png |
| Product: daters and inks | springfield-stamp-Daters-Inks | https://www.springfieldstamp.com/wp-content/uploads/2024/03/springfield-stamp-Daters-Inks.jpg |
| Product: notary | springfield-stamp-4913 | https://www.springfieldstamp.com/wp-content/uploads/2024/04/springfield-stamp-4913.jpg |
| Icon (why choose) | springfield stamps | https://www.springfieldstamp.com/wp-content/uploads/2024/03/stamp-grey.png |
| Icon (why choose) | springfield-turnaround | https://www.springfieldstamp.com/wp-content/uploads/2024/03/springfield-turnaround.png |
| Icon (why choose) | (empty) | https://www.springfieldstamp.com/wp-content/uploads/2024/03/springfield-cs-grey.png |
| Icon (why choose) | community | https://www.springfieldstamp.com/wp-content/uploads/2024/03/community-1.png |
| Section image (900x621) | (empty) | https://www.springfieldstamp.com/wp-content/uploads/2024/03/make-your-mark_2.jpg |
| Logo (footer) | springfield-stamps logo | https://www.springfieldstamp.com/wp-content/uploads/2024/03/springfield-stamp-logo-white.png |

### Contact
| Role | alt | Full-res URL |
|---|---|---|
| Logo (header) | springfield stamp logo | https://www.springfieldstamp.com/wp-content/uploads/2024/03/springfield-stamp-logo-black.png |
| Call arrow | call springfield stamp | https://www.springfieldstamp.com/wp-content/uploads/2024/03/springfield-stamp-arrow2.png (540x540) |
| Call arrow | call springfield stamp | https://www.springfieldstamp.com/wp-content/uploads/2024/03/springfield-stamp-arrow1.png (540x540) |
| Logo (footer) | springfield-stamps logo | https://www.springfieldstamp.com/wp-content/uploads/2024/03/springfield-stamp-logo-white.png |

No CSS background-image urls were found in inline styles. Theme or external CSS was not audited.

---

## 5. Forms

Only one form exists, on /contact/.

- **Plugin:** Gravity Forms (form id 1, theme "orbital"). Gravity Forms also loads an iframe, gform_ajax_frame_1, for submission.
- **Action:** `/contact/#gf_1`, method POST (submission_method hidden field = iframe)
- **Fields:**
  - Name, first: `input_1.3` (text)
  - Name, last: `input_1.6` (text)
  - Email: `input_3` (type=email)
  - Phone: `input_4` (type=tel)
  - Message: `input_5` (textarea)
  - Submit: `gform_submit_button_1` (button "Send Message")
- **Required:** no `required` attribute in markup. Required status not verified.
- **Honeypot:** likely. `input_6` (text) sits under the label "Comments" with the text "This field is for validation purposes and should be left unchanged." This matches the Gravity Forms honeypot pattern, but I did not confirm it from code. The WordPress Honeypot plugin (honeypot/includes/js/wpa.js, v2.4.02) is also loaded on the page.
- **reCAPTCHA:** the markup contains `recaptcha-response` fields. The site key is in the global Thrive config (see section 6). Whether a visible reCAPTCHA widget renders was not confirmed.
- **Hidden fields:** gform_ajax, gform_submission_method, gform_theme (orbital), gform_style_settings, is_submit_1, gform_submit, gform_currency, gform_unique_id, state_1, gform_target_page_number_1, gform_source_page_number_1, gform_field_values.
- Not submitted.

---

## 6. Third-party scripts and tags

- **Google tag (gtag.js):** GT-WK5CGGGZ. Loaded on all six pages (src: googletagmanager.com/gtag/js?id=GT-WK5CGGGZ, inline config with linker domains www.springfieldstamp.com). No G-xxxx GA4 measurement ID and no GTM-container found.
- **Google Site Kit** by Google 1.190.0 (generator meta).
- **Google Maps embed:** Contact page only. Two lazy iframes (460x450 desktop, 280x450 mobile) with place query "Springfield Stamp & Engraving".
- **Google Fonts:** Literata, Muli and Poppins, loaded from fonts.googleapis.com (preconnect to fonts.gstatic.com). WP Rocket also hosts copies at /wp-content/cache/fonts/. A self-hosted font is preloaded: /wp-content/uploads/fonts/Hoarse-Rough-02.ttf.
- **reCAPTCHA v3:** site key 6Ld2dOMpAAAAABTODnEIAvnQ4DqX2L7KewfJB-Bz, threshold 0.8, in the Thrive frontend config (tve_dash_front), on every page. Contact form also has recaptcha-response fields.
- **Facebook pixel / Meta SDK:** not found. `social_fb_app_id` is empty.
- **Chat widget** (Tawk, Intercom, etc.), **call tracking** (CallRail etc.), **Hotjar / Clarity / HubSpot / Sentry:** not found.
- **Plugins and theme (from asset paths and generator tags):**
  - WordPress with Thrive Theme 11.2.0.1 and Thrive Visual Editor / Thrive Dashboard
  - Gravity Forms 3.2.0 (contact form)
  - Yoast SEO (wordpress-seo sitemaps and schema)
  - WP Rocket 3.23.5.1 (lazy-load images/iframes, delayed and deferred JS, minified CSS/JS, CDN)
  - Honeypot 2.4.02
  - jQuery 3.7.1 with jQuery Migrate 3.4.1 (WordPress core)
  - Thrive social share and menu modules
- **Footer social:** Facebook link (https://www.facebook.com/SpringfieldStamp). Icon links with empty href (count varies by page; home has three), network not identified. A tel:4178818803 icon link.

---

## 7. Reviews and testimonials

Three testimonials appear on the home page. The carousel repeats them, so the page shows six copies. Each avatar is the same image file (springfield-stamp-testimonial.png). No star ratings, Google review widget, or review platform embed was found. Quotes are exact as rendered. The rendered text has no closing quotation mark after the first quote.

1. "I needed custom stamps in a hurry, and Springfield Stamp came to the rescue! They had my order ready in just a few days, and the quality is fantastic. — **Sarah B.**, Business Owner
2. The customer service at Springfield Stamp is top-notch. They listened carefully to my needs and offered suggestions I hadn't even thought of. My desk name plates look amazing! — **John D.**, Marketing Manager
3. We ordered acrylic awards for our employee recognition ceremony, and they were a huge hit! The quality is exceptional, and the engraving is beautiful. — **Jane S.**, HR Manager

No reviews appear on any other page. Names are as shown (first name and last initial only).

---

## 8. Other URLs and redirects

**Checked (read-only GETs):**

| URL | Result |
|---|---|
| https://www.springfieldstamp.com/robots.txt | 200. `User-agent: *` / `Disallow:` (empty, so all allowed). `Sitemap: https://www.springfieldstamp.com/sitemap_index.xml`. |
| https://www.springfieldstamp.com/sitemap_index.xml | 200. Yoast index with one child: page-sitemap.xml (lastmod 2026-02-19). |
| https://www.springfieldstamp.com/page-sitemap.xml | 200. Exactly the six URLs. Lists image URLs for each page. |
| https://www.springfieldstamp.com/feed/ | 200, RSS 2.0, title "Springfield Stamp", zero items. lastBuildDate Thu, 19 Feb 2026 16:28:57 +0000. |
| https://www.springfieldstamp.com/blog/ | 404 (site 404 template). No blog. |
| https://www.springfieldstamp.com/contact (no slash) | 301 to https://www.springfieldstamp.com/contact/ |
| https://www.springfieldstamp.com/custom-stamps (no slash) | 200, no redirect |
| https://www.springfieldstamp.com/missouri-notary-stamp (no slash) | 200, no redirect |
| http://springfieldstamp.com/ | 301 to https://springfieldstamp.com/ (apex), then 301 to https://www.springfieldstamp.com/ (two-hop chain) |
| https://www.springfieldstamp.com/wp-json/wp/v2/pages | 200 (public REST API, about 295 KB) |
| https://www.springfieldstamp.com/xmlrpc.php | 403 |

**Blog posts:** none. Feed is empty and no post sitemap exists.

**Internal links that are not one of the six pages:**
- https://www.springfieldstamp.com (no trailing slash): logo link in header and footer
- https://www.springfieldstamp.com/contact (no trailing slash): About page CTA. 301s to /contact/.
- `#buy` and `#tve-jump-196d931fedb`: in-page anchors on /missouri-notary-stamp/. The #buy anchor exists (section id "buy"). The other one was not checked.
- `javascript:void(0)`: header mobile menu toggle on every page
- Empty `href=""`: icon-only social links in the footer, unlabelled (count varies by page)
- `/feed/`: referenced only as `<link rel="alternate">` in the head. It is not a body link.

No other internal links were found.

---

## 9. Lighthouse (mobile, homepage)

Run with `npx lighthouse` (lighthouse 13.6.0) and `--form-factor=mobile`, categories performance, accessibility, seo, best-practices.

- **Performance: 90**
- **Accessibility: 91**
- **Best Practices: 100**
- **SEO: 92**
- LCP 2.5 s, FCP 1.3 s, Speed Index 4.4 s, TBT 250 ms, CLS 0

Note: the specified `CHROME_PATH=/opt/pw-browsers/chromium-1194/chrome-linux/chrome` does not exist. This run used `/opt/pw-browsers/chromium-1243/chrome-linux64/chrome` (the installed build), with the same flags. Full JSON: `scratchpad/ss/lighthouse-home-mobile.json`.

---

## 10. Files

- Raw HTML (six pages): `scratchpad/ss/raw/{home,about,magnetic-name-tags,missouri-notary-stamp,custom-stamps,contact}.html`
- Also in raw: `robots.txt`, `feed.xml`, `sitemap_index.xml`, `page-sitemap.xml`. The 404 body from /blog/ was moved to `scratchpad/ss/extra/blog-404-body.html`.
- Parsed output: `scratchpad/ss/out/*.json` and `*.txt`
- Summaries: `scratchpad/ss/summary.txt`, `scratchpad/ss/images.txt`
- Scripts: `scratchpad/ss/scripts/extract.py`, `summarize.py`, `images.py`, `lh_scores.py`
