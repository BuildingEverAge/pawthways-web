Use this as the one source of truth for Pawthways.

🐾 PAWTHWAYS — SACRED BOOK (FINAL v1.0)
Engineering & Product Master Document
 Owner: Gabriel Augusto de Lima Alcântara (“Izan”)

0. What This Document Is
This is the master specification for Pawthways.
Any AI (GLM, ChatGPT, etc.) that edits the project must:
follow this document,
respect the architecture,
not break existing flows,
and focus on what is marked as “Missing / TODO”.
This is not marketing copy.
 This is how the system works and what must be built.

1. Purpose & Vision
Pawthways is a cinematic, emotional rescue platform that connects:
Storytelling → emotional videos and narratives (e.g. “The Bottle That Carried Us”)
Donations → people who are moved can help real animals
Transparency → everyone can see how money is used
Automation → system keeps itself in sync (payments → database → public site)
Core principles:
Trust first (no fake rescues, no fake numbers)
Radical transparency by default
Emotional but clear UX
Minimal tech stack, easy to maintain
Designed to scale with short-form content (TikTok / YouTube Shorts)

2. High-Level Architecture
Pawthways has 4 main layers:
Public Site → pawthways-web on Vercel
Backend / Data → Supabase (DB + Storage + Views)
Admin Panel → Appsmith (internal)
Automations → Make (Integromat) connecting Stripe/Pix to Supabase
There is also old Streamlit code used only as a “lab” (optional) and not part of the public product.

2.1 Public Site (Vercel)
Project: pawthways-web
 Host: Vercel
 Tech: Static HTML + CSS + vanilla JavaScript
 Template: HTML5UP-like, customized to Pawthways style.
Core public pages (current + planned):
index.html → Home / Story entry
story.html → Full emotional story page
watch-and-help.html → Active rescues (Supabase-powered)
transparency.html → Transparency hub (Supabase-powered)
donate.html → Donation entry / how to support (to be created)
404.html → Not found page
Static assets:
/assets/css → main.css, theme styles
/assets/js → template scripts, custom fetch logic
/assets/images → hero images, background visuals, logos
Frontend uses:
Supabase JS Client (anon key) to read from public views
No frameworks (React, Vue, etc.), just plain HTML + JS.

2.2 Backend / Data (Supabase)
Backend: Supabase project
 Supabase is the single source of truth for:
rescues
donations
transparency logs
public views for the frontend
Main tables (already exist or planned as final structure):
rescues
donations
transparency_logs
Main public views (read-only for frontend, to be fully defined):
public_rescue_view
public_transparency_view
public_stats_view
Storage (buckets):
rescue-images/ → pictures used on rescue cards
transparency-proofs/ → receipts, invoices, proof media
Frontend must read only from views, not directly from tables, wherever possible.

2.3 Admin Layer (Appsmith)
Admin panel: Appsmith
 Purpose: internal control center for Pawthways.
Confirmed pages:
Rescues Admin
Add / edit / delete rescues
Set status (active / funded / completed / draft)
Control goals, stories, images
Donations Viewer
Read-only list of donations coming from payments
Filter, sort, inspect
Transparency Logs Admin
Create / edit / delete transparency_logs
Upload proof URLs (files stored in Supabase or external)
Link logs to specific rescues (via rescue_id)
Admin connects to Supabase using service_role key (private).
 That key is never used in frontend code.

2.4 Automation Layer (Make)
Automation tool: Make (Integromat)
Goal: reduce manual work and keep the system always synchronized.
Planned flows:
New Donation → Supabase + Notification


Trigger: Stripe (or other payment system) webhook for successful payment.
Actions:
Create a row in donations.
Send a notification (email / Discord / etc.) with donation summary.
Rescue Auto-Funded


Trigger: scheduled (e.g. every 15 minutes).
Logic:
For each rescue with status = 'active', compute sum(donations.amount) for that rescue_id.
If total ≥ target_amount → set rescues.status = 'funded'.
New Transparency Log → Ping


Trigger: new transparency_logs row (polled or via webhook).
Action: send internal notification:
rescue name
type
description
link to proof.
These flows are Phase 6 in the project plan.

2.5 Streamlit (Old)
There is an older Streamlit project with:
custom navbar + footer
complex transparency dashboard
experimental analytics
New rule:
Streamlit is not public product.
It is allowed only as internal lab / analytics, if kept.
Official public surface = pawthways-web on Vercel.

3. Database Schema (Canonical)
3.1 Table: rescues
Purpose: store each rescue campaign.
Fields (final intention):
id → uuid, primary key
title → text, rescue title
animal_name → text, name of the animal (e.g. “Storm Pup”)
location → text, city / region / country
story → text, short story description
target_amount → numeric, total goal in main currency
currency → text, e.g. "BRL" / "USD" / "EUR"
status → text, e.g. "active" | "funded" | "completed" | "draft"
image_url → text, public URL to a rescue image
created_at → timestamp
updated_at → timestamp

3.2 Table: donations
Purpose: store every donation event.
Fields (final intention):
id → uuid, primary key
rescue_id → uuid, nullable, references rescues.id
amount → numeric, amount in given currency (could be cents or base units)
currency → text, currency code (e.g. BRL, USD)
source → text, e.g. "stripe", "pix", "shop", "test"
external_id → text, payment provider id (Stripe payment_intent, Pix code, etc.)
created_at → timestamp

3.3 Table: transparency_logs
Purpose: store logs for transparency (proofs, updates, etc.).
Fields (final intention):
id → uuid, primary key
rescue_id → uuid, nullable, references rescues.id
type → text, e.g. "vet_receipt", "food", "transport", "update", "report"
description → text, short explanation
amount → numeric, nullable, amount spent (if applicable)
currency → text, nullable
file_url → text, URL to proof (image/pdf hosted in Supabase or external)
created_at → timestamp

3.4 Public Views
These are read-only surfaces for the frontend.
public_rescue_view
 Contains safe columns for rescues + aggregated donations.

 Example fields:


id
title
animal_name
location
story
image_url
status
target_amount
currency
total_donated (sum of donations.amount for that rescue)
progress_pct (0–100, computed)
created_at
public_transparency_view
 Recent logs, optionally joined with rescue title.

 Example fields:


log_id
rescue_id
rescue_title
type
description
amount
currency
file_url
created_at
public_stats_view
 Global counters & quick stats.

 Example fields:


total_donated
total_rescues
funded_rescues
last_update_at
Frontend pages should prefer these views, not raw tables.

4. Public Pages — Behaviour & Requirements
4.1 index.html (Home)
Purpose:
Cinematic first impression.
Explain very quickly what Pawthways is.
Drive users to Watch & Help and Transparency.
Must include:
Hero section:
strong headline (e.g. “Turn Every View Into a Second Chance.”)
short subtext linking watching → real rescues
primary CTA: → /watch-and-help.html
secondary CTA: → /transparency.html
“How Pawthways Works” (3 steps):
Watch & Feel
Give & Share Smart
See the Proof
Optional impact numbers (from public_stats_view or static for now).
Link to /story.html (origin story).
Visual rules:
Minimal, cinematic, soft gradient backgrounds.
Buttons using Pawthways brand color (no default blue).
On mobile, everything must be readable and tappable.

4.2 story.html
Purpose:
Tell the emotional origin story (rabbit, turtle, bottle, etc.).
Prepare emotionally for helping.
Requirements:
Clean layout focused on text + maybe a few images.


At the end, very clear CTA:


main button: “Support the next rescue” → /watch-and-help.html
optional secondary link: “See how we use donations” → /transparency.html
Keep typography readable and not cluttered.


Optionally link to the main video.



4.3 watch-and-help.html
Purpose:
List only active rescues that people can help now.
Connect directly to data from Supabase (real rescues).
Data source:
Supabase → public_rescue_view
 OR direct table rescues with filter: status = 'active'.
Each rescue card must show:
Rescue image (if image_url present)
Title
Animal name
Location
Short story snippet (truncate text if long)
Goal info:
at minimum: Goal: target_amount currency
ideally: Donated: X / target_amount currency
Progress bar:
uses progress_pct from view if available,
otherwise computed in JS from total_donated / target_amount.
CTA button:
“Help this rescue”
For now, can go to generic /donate.html
Later can deep-link with a query param (e.g. /donate.html?rescue_id=...).
Page structure:
Hero banner (title, explanation, link back to story).
(Optional) embedded YouTube video (“Watch the Story & Help”).
Section “Active Rescues You Can Help Now” with grid / list of cards.
Footer with link to transparency.

4.4 transparency.html
Purpose:
Make trust obvious.
Show logs, funds, and funded rescues.
Data sources:
public_transparency_view → logs
public_rescue_view → funded rescues (status = 'funded')
public_stats_view → global stats
Sections:
Intro
One short paragraph: “How we handle donations and proof.”
KPIs
total_donated
number of rescues
funded rescues
latest update date
Recent logs
cards or table with:
date
type
description
amount (if any)
link to file_url (open in new tab)
small badge:
“verified” vs “pending” (you can use simple logic, e.g. everything with file_url is “proof attached”).
Funded rescues
list of cards with status = 'funded'
Link to a deeper transparency page
e.g. /how-donations-work.html (future).
Visual tone:
Clean, clear, not “financial corporate”
Still emotional and empathetic.

4.5 donate.html (to be created)
Purpose:
Be the hub page to actually donate.
For v1 (MVP):
Simple explanation of how donations are currently handled:
Stripe link OR Pix details OR external checkout
Possibly a small list of active rescues on the side.
Clear statement of:
how much goes to rescues,
how much is kept to fund production / operations,
link to transparency.
This page can be relatively simple at the beginning.

5. Design System & UX Rules
Visual identity:
“Cinematic × Soft × Clean”
Emphasis on storytelling, not UI clutter.
Typography:
Base font size approx 16px.
Headings strong but not aggressive.
Enough line-height for comfortable reading.
Colors:
Brand primary: Pawthways red (e.g. #E2574C).
Avoid pure black for large areas; use near-black or dark grey for text.
Respect dark/light mode if implemented.
Components to consider (from previous work):
Navbar:


Minimal links on desktop: logo + key links.
Mobile drawer with:
Home
Story
Watch & Help
(future) Shop for Good
CTA button as core emphasis (e.g. “Watch & Help” or “Shop for Good”).
Smooth scroll and subtle progress bar allowed.
Footer:


Cinematic, rounded block.
Emotional tagline.
Minimal nav links: Home, Story, Watch & Help, maybe Shop.
Trust line: “40% of net proceeds go to verified rescues — see Transparency.”
Social icons row (Instagram, TikTok, YouTube).
Motion:
Use subtle fade-in and small hover effects.
Respect system prefers-reduced-motion when possible.
No aggressive animations or flashing.
Mobile:
Everything must be usable on small screens.
Buttons large enough to tap.
Avoid horizontal scroll.

6. Coding Rules for Any AI (GLM, ChatGPT, etc.)
These rules are MANDATORY:
Do NOT hardcode secrets:
Never place Supabase service_role or Stripe secret keys in code.
Frontend may only use Supabase anon key.
Preserve structure:
Keep the repo layout and main page filenames:
index.html, story.html, watch-and-help.html, transparency.html, donate.html, 404.html.
Respect working code:
Do not remove or rewrite major blocks that already work unless explicitly asked.
Comment complex JS:
Any non-trivial logic must have a short comment.
Prefer views over tables:
When reading from Supabase, use public views instead of raw tables whenever they exist.
No new frameworks:
Do not introduce React/Vue/etc. into pawthways-web.
Continue using HTML + CSS + vanilla JS.
Accessibility:
Keep text readable contrast.
Don’t hide essential content behind hover-only actions.
URLs:
Don’t change public routes without a very strong reason.
If you must change, add clear redirects or notes.
Deploy targets:
Public site stays on Vercel.
Data stays in Supabase.
Admin stays in Appsmith.
Errors:
If calling Supabase from JS, handle errors gracefully and log to console.

7. Automation Logic Rules (for Make)
Outline of behaviour (implementation details can vary):
7.1 Flow 1 – New Donation → Supabase + Notification
Trigger:
Stripe webhook event payment_intent.succeeded (or equivalent for other providers).
Data mapping:
Stripe amount_received (or similar) → donations.amount
Stripe currency → donations.currency
Stripe payment intent id → donations.external_id
Optional: rescue_id from metadata.rescue_id → donations.rescue_id
Actions:
Insert row into donations table.
Send notification:
Example content:
 “New donation: 25 BRL via Stripe for Rescue X (id …)”.
The flow must ignore failed / pending payments.

7.2 Flow 2 – Auto-Funded Rescues
Trigger:
Schedule (e.g. every 15 minutes).
Logic:
Fetch all rescues with status = 'active'.
For each:
Calculate total = sum(donations.amount) for that rescue_id.
If total >= target_amount:
Update rescues.status to 'funded'.
Optional: send internal notification when a rescue becomes funded.

7.3 Flow 3 – New Transparency Log → Notification
Trigger:
Poll Supabase (e.g. every 10 minutes) for new rows in transparency_logs
 or use some webhook if available.
Logic:
For each new log:
compose message:
rescue title (if linked)
type
amount (if present)
description
link to file_url
send it to internal channel (email / Discord / etc.).

8. Current Status Snapshot
High-level view of where Pawthways stands:
Already done (high-level):
Supabase project exists.
Tables rescues, donations, transparency_logs created.
Appsmith admin pages:
Rescues Admin
Donations Viewer
Transparency Logs Admin
pawthways-web created and deployed on Vercel.
/story.html, /watch-and-help.html, /transparency.html exist and can talk to Supabase (at least at basic level).
Still missing / incomplete:
Final UI / UX for watch-and-help.html (cards, progress bar, proper copy).
Final UI / UX for transparency.html (logs cards, KPIs, funded rescues).
Creation of donate.html.
Automations in Make (Flows 1–3).
Legal pages and “How donations work” explanation.
Optional: PIX system explanation and structure.

9. Work Priority for Any AI
When an AI is asked to “work on Pawthways”, default priority order:
Finish Public Product


Improve /watch-and-help.html (cards, progress, CTAs).
Improve /transparency.html (logs, funded rescues, stats).
Create /donate.html (MVP donation hub).
Stabilize Supabase Views


Make sure public_rescue_view, public_transparency_view, public_stats_view provide required fields.
Help with Automation


Prepare JSON shapes, endpoints, and pseudo-code for Make flows.
Polish/UI


Once core behaviour works, then refine animations, microcopy, and small layout fixes.

10. Golden Rule
Official Pawthways now lives in:
Vercel (public site)
Supabase (data)
Appsmith (admin)
Anything else is experimental.
No new “main” surface should be introduced without updating this Sacred Book.

