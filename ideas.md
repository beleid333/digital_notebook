# Velo Notes — Design Brainstorm

## Approach 1: Tactile Realism — Brutalist Skeuomorphism
<response>
<text>
**Design Movement**: Brutalist Skeuomorphism — physical objects rendered with uncompromising fidelity.

**Core Principles**:
1. Every surface has weight — nothing floats without a reason
2. Depth is achieved through layered shadows (ambient + directional) not gradients
3. Materials are identifiable — wood looks like wood, metal looks like metal, paper looks like paper
4. Interactions have physical consequences (pressing a tab compresses it)

**Color Philosophy**: Warm amber wood (#8B5E3C → #5C3A1E), cream paper (#FFF8E7), steel ring-metal (#B0B0B0 → #707070), ink blue lines (#C8D8E8), red margin (#E8A0A0). The palette is pulled from actual office supply photography — nothing invented.

**Layout Paradigm**: Three-column asymmetric split: narrow bookshelf (180px) | wide notebook body (flex) with binding strip on left edge. Tabs protrude above the paper like physical dividers.

**Signature Elements**:
- SVG-rendered notebook rings with metallic radial gradient and cast shadow
- CSS wood-grain texture using layered linear-gradients at varying angles
- Lined paper using repeating-linear-gradient with a red margin line

**Interaction Philosophy**: Clicking a notebook "pulls it off the shelf" (slight translate + shadow increase). Tabs depress on click. Notes appear as if placed on the paper.

**Animation**: Spring-physics easing on notebook selection. Tab press: 2px downward translate + shadow reduction on mousedown. Paper content fades in with a slight upward drift.

**Typography System**: Caveat (handwriting, 400/700) for note text. Libre Baskerville (serif, 400/700) for notebook titles and UI labels. Monospace for page numbers.
</text>
<probability>0.08</probability>
</response>

## Approach 2: Retro Office — Mid-Century Modern Stationery
<response>
<text>
**Design Movement**: Mid-Century Modern Office Aesthetic — think 1960s IBM design language applied to stationery.

**Core Principles**:
1. Geometric precision with warm organic accents
2. Limited palette — 3 colors max per component
3. Flat with selective depth (only interactive elements have shadow)
4. Typography carries the visual weight

**Color Philosophy**: Olive green (#6B7C45), burnt orange (#C4622D), cream (#F5F0E8), charcoal (#2D2D2D). Inspired by vintage Penguin book covers.

**Layout Paradigm**: Centered notebook on a linen-textured desk surface. Tabs use geometric chevron shapes instead of rounded rectangles.

**Signature Elements**:
- Halftone dot pattern on sidebar
- Bold geometric tab labels with uppercase tracking
- Paper with subtle grid instead of lines

**Interaction Philosophy**: Crisp, deliberate. No spring physics — linear transitions with intentional pauses.

**Animation**: Slide transitions between sections. Tab selection: color fill animation left-to-right.

**Typography System**: Playfair Display for headings. Source Serif Pro for body. All caps with wide letter-spacing for labels.
</text>
<probability>0.07</probability>
</response>

## Approach 3: Worn Leather — Vintage Field Notes Aesthetic
<response>
<text>
**Design Movement**: Vintage Field Notes / Moleskine — worn leather and aged paper.

**Core Principles**:
1. Imperfection is beauty — slight rotations, worn edges, coffee stains
2. Everything looks used, not new
3. Warm sepia tones dominate
4. Handcrafted feel in every element

**Color Philosophy**: Dark leather brown (#3D2B1F), aged paper (#F2E8D0), rust red (#8B3A2A), faded ink (#4A4035). Inspired by antique journals.

**Layout Paradigm**: Single centered notebook on a dark leather desk. Tabs are torn paper edges.

**Signature Elements**:
- Torn paper edge CSS effect on tabs
- Coffee stain watermark on paper background
- Leather texture on sidebar using noise + gradient

**Interaction Philosophy**: Slow, deliberate animations. Everything feels heavy and physical.

**Animation**: Page turns with CSS 3D perspective. Slow ease-in-out on all transitions.

**Typography System**: IM Fell English for headings. Caveat for notes. Courier Prime for metadata.
</text>
<probability>0.06</probability>
</response>

---

## CHOSEN APPROACH: #1 — Tactile Realism Brutalist Skeuomorphism

Committed to this approach for maximum physical fidelity and visual impact.
