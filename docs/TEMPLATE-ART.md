# Adding a design

A design is a folder of artwork and one entry in the registry. No component.

```
public/templates/<your-design-id>/
  frame.svg | frame.png      the border, 3:4, clear centre
  crest.png                  the ornament above the names
  divider.png                the rule between sections
  ground.png                 a seamless texture behind everything
```

Then copy the `thanga-kolam-01` block in `lib/templates/registry.ts`, change the
id, name, palette and the four `art` paths. That is the whole job.

Every piece is optional. A design with only a frame still works; a missing file
falls back to a plain rule or a plain ground rather than to a broken image.

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
