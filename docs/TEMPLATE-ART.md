# Adding a design

## The usual way: /admin/designs

**Designs → Add a design.** Name it, upload the artwork, let it read the
colours out of your art, look at the preview, publish. No deploy, no code.

A design added this way is four images and a palette. It has no component of
its own — `ArtTemplate` lays the pieces out and prints the names over them,
which is exactly what makes it addable from a form.

The order that works:

1. **Add a design** — name and tagline only. Everything else can wait.
2. **Upload the artwork.** If you have a whole card you made in Canva or had
   designed, it goes in as the **frame**: 3:4, with the middle empty. See the
   rule below, which is the part that trips everyone up.
3. **Read the colours from the artwork.** This samples what you uploaded and
   fills in the palette. It is a starting point — it cannot know which of your
   three golds the design is actually about, so correct it.
4. **Look at the preview.** Sample names, your artwork, the real renderer.
5. **Publish it.** Until you do, no customer can see it. Publishing is refused
   while there is no artwork, because that would be a blank card in the picker.

Deleting is refused once any invitation uses the design — unpublish instead. It
keeps working for the people already on it and disappears from the picker.

## Turning a finished card into a template

If what you have is a finished invitation — names, date and venue already on it
— it cannot go in as-is, and no amount of cropping fixes that. What you need is
the same file **exported with the text layers hidden**. In Canva that is a
minute's work: hide the text, export as PNG with a transparent background if
the design allows it, upload that as the frame.

If it came from a designer as a flat JPEG with no layers, ask them for the
source file. Painting text out of a finished card by hand almost never survives
contact with a real name of a different length.

## The other way: in code

A family that ships with the product lives in `lib/templates/registry.ts` with
its artwork in `public/templates/<design-id>/`. Copy the `thanga-kolam-01`
block, change the id, name, palette and the four `art` paths.

Use this for the designs you want reviewed and versioned alongside the code.
Use the admin screen for everything else.

Every piece is optional either way. A design with only a frame still works; a
missing file falls back to a plain rule or a plain ground rather than to a
broken image.

## The one rule that matters

**No text in the artwork. Ever.**

The names, the date and the venue are printed as live text over the middle. Bake
them into the image and you lose personalisation, the font pairings stop meaning
anything, a screen reader gets nothing, and the venue can never be corrected
after the invitation is sent — which is most of what people are paying for.

So every piece needs an empty middle. When you generate art, the centre being
bare is the point, not a mistake to fix.

## Specifications

| Piece | Size | Format | Notes |
|---|---|---|---|
| `frame` | 1200 × 1600 (3:4) | PNG, transparent | Ornament in the outer ~18%. Centre fully clear. |
| `crest` | 800 × 500 | PNG, transparent | Sits above the names at about 38% of the card width. |
| `divider` | 1200 × 110 | PNG, transparent | Symmetric left to right. |
| `ground` | 600 × 600 | PNG or JPG | Must tile seamlessly. Laid back to ~8% opacity, so make it stronger than looks right. |

Keep every file under about 300 KB. These load before the invitation is
readable.

## Prompts

Run these in ChatGPT (image), Midjourney, or any image model. Generate each
piece separately — asking for a whole card in one go gets you baked-in text
every time.

Replace the words in **bold** to make a different family.

### 1. The frame

> An ornamental **South Indian wedding** border frame, portrait 3:4, drawn in
> **antique gold foil** on a pure transparent background. Symmetrical left to
> right. Fine **temple gopuram arches, mango-leaf toran and small paisley**
> motifs along the four edges, with a decorative crown at the top centre and a
> matching flourish at the bottom centre. The entire middle of the image is
> completely empty — no text, no letters, no names, no monogram, nothing in the
> centre at all. Flat vector illustration, crisp clean linework with subtle
> metallic shading, no drop shadow, no background colour, no paper texture.

Variations worth trying: **kolam lattice and lotus** · **Chettinad tile and
peacock** · **jasmine garland and brass bells** · **banana leaf and kalasam**

### 2. The crest

> A single ornamental **kalasam with mango leaves and a coconut**, centred,
> drawn in **antique gold foil** on a pure transparent background. Symmetrical,
> flat vector illustration, fine linework with subtle metallic shading. No text,
> no background, no shadow. Wider than it is tall.

Variations: **a lotus rosette** · **two facing peacocks** · **a lit oil lamp
with a flame** · **a temple bell with hanging tassels**

### 3. The divider

> A slim symmetrical ornamental divider rule, very wide and short, drawn in
> **antique gold foil** on a pure transparent background. A small **lotus bud**
> at the centre with tapering decorative lines running left and right to fine
> points. Flat vector, no text, no background, no shadow.

### 4. The ground

> A seamless tileable background texture of **fine cream handmade paper with
> faint gold kolam dot lattice**. Very subtle, low contrast, no focal point, no
> text. The pattern must repeat perfectly on all four edges.

Other grounds: **raw silk weave** · **soft marble veining** · **banana-leaf
vein** · **aged parchment**

## Traps

**Transparency.** Image models say "transparent background" and hand you white.
Check by dropping the file on a dark surface. If it has a white box, run it
through a background remover (remove.bg, Photoroom, or Photoshop's Remove
Background) before saving.

**Text sneaks in.** Models love adding "Wedding Invitation" or fake names in a
script face. Regenerate — do not try to paint it out, the ornament around it
never quite recovers.

**The centre fills up.** If the middle has a flourish in it, the couple's names
will land on top of it. Regenerate asking for an empty centre again, more
firmly.

**Consistency across the four pieces.** Generate all four in one session from
the same base description, or the crest and the frame end up looking like they
came from different cards.

**Colour.** Generate the artwork in gold. The family's palette recolours the
*text*, not the ornament — a gold border works under every accent, which is why
one art set serves six colourways.

## Buying instead

Stock is usually faster and more consistent than generating. Search Creative
Market, Envato Elements or Freepik for "Indian wedding border vector",
"mandala frame gold", "kolam ornament set".

Buy the **extended or commercial licence** — these are being resold inside a
paid product, and the standard personal licence does not cover that.
