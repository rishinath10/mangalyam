# Mangalyam.my social media plan

Six weeks, 16 November to 27 December 2026. No ad spend. Instagram, TikTok, Facebook and WhatsApp. English with a touch of Tamil.

## 1. The one thing to say

**Make your invitation free, before 31 December 2026.**

The free offer has a deadline, so every post ends on it. After 1 January 2027 the message changes to "one price, no subscription" (see section 8).

## 2. Who we are talking to

| Who | What they care about | Where they are |
|---|---|---|
| Couples planning a wedding (22–35) | It looks beautiful, it is easy, friends will be impressed | Instagram, TikTok |
| Parents and elders hosting (40–65) | It is respectful, relatives can open it, no fuss | Facebook, WhatsApp |
| Families with a housewarming, naming ceremony or 60th birthday | Quick, free, not "only for weddings" | Facebook, WhatsApp |
| Temple and association committees | One link to reach the whole community, headcount for food | WhatsApp groups, Facebook groups |
| Wedding vendors (photographers, decorators, caterers, mehendi artists) | Something useful to offer their clients | Instagram, WhatsApp |

## 3. What each platform is for

- **Instagram:** the shop window. Two image posts a week and one reel. Put the same image on Stories the same day.
- **TikTok:** the reel, reposted. Screen recordings of an invitation opening do the work.
- **Facebook:** the same two posts a week, plus sharing into community groups (where group rules allow it).
- **WhatsApp:** where it actually spreads. Status three times a week, and the forwardable messages in `WHATSAPP-KIT.md`.

## 4. Weekly rhythm

About 30 minutes a day is enough.

| Day | Task |
|---|---|
| Monday | Feed post on Instagram and Facebook. Same image on WhatsApp Status. |
| Wednesday | Reel on Instagram and TikTok (ideas in section 6). |
| Friday | Feed post on Instagram and Facebook. Status image. |
| Sunday | WhatsApp Status, and send one message from the kit to one new group or vendor. |
| Daily | Reply to every comment and message the same day. |

Post between 8 and 10 pm, when families are on their phones. Adjust once you see your own numbers.

## 5. Six-week calendar

Image files are in `marketing/posts/` and `marketing/status/`. Captions are in `CAPTIONS.md` under the same numbers.

| Week | Monday post | Friday post | Status | Theme |
|---|---|---|---|---|
| 1 (16–22 Nov) | `01-launch` | `02-free` | `s1-launch`, `s2-free` | We are here, and it is free |
| 2 (23–29 Nov) | `03-designs` | `04-how` | `s3-how` | What it looks like, how it works |
| 3 (30 Nov–6 Dec) | `05-occasions` | Carousel `c1-paper-1` to `5` | `s2-free` | Not only weddings |
| 4 (7–13 Dec) | `06-rsvp` | `07-jewels` | `s4-cta` | The useful part, the beautiful part |
| 5 (14–20 Dec) | `08-star` | `09-aiyer` | `s1-launch` | Things to play with and share |
| 6 (21–27 Dec) | `10-edit`, `11-noapp` | `12-cta` | `s2-free` daily from 26 Dec | Last days of free |

In the last week, post the "free until 31 December" status every day.

## 6. Reel ideas you can film on your phone

Each is a screen recording of the real site, 10 to 20 seconds, with a trending audio track and one line of text on screen.

1. Tap the seal, watch the invitation open. Text: "This is how your guests will open it."
2. Scroll one finished invitation top to bottom.
3. Swipe through all ten designs on the home page.
4. The star finder: enter a birth date, watch the constellation draw.
5. Make an invitation from start to finish, sped up. Text: "Six questions. Done."
6. Paper card next to a phone showing the same invitation. Text: "Same love. Easier to send."

## 7. Growing without ads

- **Your own invitation is the advert.** Make three sample invitations (wedding, housewarming, naming ceremony) and share those links. A working example persuades better than a picture.
- **Vendors.** Message ten wedding vendors a week with the vendor note in the kit. Offer to make a sample for one of their couples.
- **Temples and associations.** Offer to make the invitation for their next event yourself. The whole committee and every guest then sees it.
- **First families.** Ask the first ten hosts for a one-line comment and permission to show their invitation with surnames hidden. Post these from week 3.
- **Community groups.** Share in Malaysian Indian wedding and community Facebook groups, once per group, following each group's rules on promotion.
- **Hashtags.** Use the set in `CAPTIONS.md`. Keep to eight or fewer per post.

## 8. After 31 December

- From 1 January 2027 the invitation is paid. Before that date, Stripe keys must be live on the site, or nobody can pay.
- Change the closing line of every post from "free until 31 December 2026" to "one price, no subscription". The images that mention the free date (`02`, `12`, `c1-paper-5`, `s2`, `s4`) need new wording: edit the text in `marketing/src/build.js` and run `node marketing/src/build.js`.
- Pongal in mid-January and the wedding season after it are the next natural pushes.

## 9. What to measure

Check once a week, on Sunday.

| Number | Where to find it | What it tells you |
|---|---|---|
| Invitations created | Admin page | Whether posts lead to action |
| Invitations published | Admin page | Whether people finish |
| Profile visits and link taps | Instagram and TikTok insights | Which posts pull people in |
| Saves and shares | Per post | What to make more of |
| Messages received | WhatsApp, Instagram | Questions to turn into posts |

Repeat whatever gets shared most. Drop whatever gets no saves after two tries.

## 10. Before the first post

- [ ] Create the Instagram, TikTok and Facebook pages with the same name and the mascot as profile picture.
- [ ] Put `mangalyam.my` as the link in every bio.
- [ ] Make three sample invitations to share.
- [ ] Save the status images to your phone.
- [ ] Set WhatsApp Business with a greeting message and the catalogue link.

## Notes

- Every image is made from the site's real designs, so nothing shows a feature the product lacks.
- The Tamil words used are Vanakkam (hello), Nandri (thank you) and Vaanga (come). Please have a native speaker glance over the captions before posting.
- The audience notes and posting times above are starting assumptions, not measured data. Let your first two weeks of insights correct them.
