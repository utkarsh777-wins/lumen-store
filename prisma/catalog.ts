export type SeedVariant = {
  sku: string;
  size?: string;
  color?: string;
  hex?: string;
  priceCents?: number;
  stock: number;
};

export type SeedProduct = {
  slug: string;
  name: string;
  description: string;
  details: string;
  priceCents: number;
  compareAtCents?: number;
  category: string;
  featured?: boolean;
  bestSeller?: boolean;
  images: { file: string; alt: string }[];
  variants: SeedVariant[];
};

export const categories = [
  {
    slug: "ceramics",
    name: "Ceramics",
    description: "Vessels, bowls, and cups thrown for everyday tables.",
    image: "/media/categories/ceramics.jpg",
  },
  {
    slug: "textiles",
    name: "Textiles",
    description: "Linen, wool, and cotton with a washed, lived-in hand.",
    image: "/media/categories/textiles.jpg",
  },
  {
    slug: "lighting",
    name: "Lighting",
    description: "Lamps and holders that keep the evening low and warm.",
    image: "/media/categories/lighting.jpg",
  },
  {
    slug: "fragrance",
    name: "Fragrance",
    description: "Room scent, incense, and oils with a quiet signature.",
    image: "/media/categories/fragrance.jpg",
  },
  {
    slug: "bath",
    name: "Bath",
    description: "Washes, oils, and tools for an unhurried daily ritual.",
    image: "/media/categories/bath.jpg",
  },
] as const;

const care = {
  clay: "Materials\nStoneware, satin glaze.\n\nCare\nDishwasher safe on a gentle cycle. Avoid sudden temperature changes.\n\nOrigin\nFinished in small batches for Lumen.",
  linen: "Materials\nEuropean flax linen, garment washed.\n\nCare\nMachine wash cold and line dry. It softens and creases with use.\n\nOrigin\nCut and sewn in limited runs.",
  light: "Materials\nSpun metal, linen shade, or hand-blown glass as noted.\n\nCare\nDust with a dry cloth. Bulb not included unless stated. Use an LED of 6 watts or less.\n\nOrigin\nAssembled for Lumen.",
  scent: "Materials\nFragrance oils and natural wax or denatured alcohol, as noted.\n\nCare\nBurn candles within sight and trim the wick to 5 mm. Keep sprays away from finished wood.\n\nOrigin\nBlended in small batches.",
  bath: "Materials\nPlant oils, clays, and essential oils. Full ingredients are printed on the vessel.\n\nCare\nPatch test before first use. Store away from direct sun.\n\nOrigin\nPoured and packed for Lumen.",
};

export const products: SeedProduct[] = [
  {
    slug: "arc-pourer",
    name: "Arc Pourer",
    description: "A generous stoneware pitcher with a pulled spout and a foot that sits flat on a crowded table.",
    details: care.clay,
    priceCents: 6800,
    category: "ceramics",
    featured: true,
    images: [
      { file: "/media/products/cer-1.jpg", alt: "Matte stoneware pitcher on a linen cloth" },
      { file: "/media/products/cer-2.jpg", alt: "Hands shaping clay in the studio" },
    ],
    variants: [
      { sku: "ARC-SAND", color: "Sand", hex: "#d9c7a6", stock: 14 },
      { sku: "ARC-CLAY", color: "Clay", hex: "#c4785a", stock: 8 },
      { sku: "ARC-INK", color: "Ink", hex: "#1c1915", stock: 5 },
    ],
  },
  {
    slug: "daybreak-bowl",
    name: "Daybreak Bowl",
    description: "A wide serving bowl with a pale interior and a rim thick enough to feel intentional.",
    details: care.clay,
    priceCents: 5400,
    category: "ceramics",
    images: [
      { file: "/media/products/cer-2.jpg", alt: "Stacked ceramic bowls in warm light" },
      { file: "/media/products/cer-8.jpg", alt: "A low ceramic bowl on a wood table" },
    ],
    variants: [
      { sku: "DAY-BONE", color: "Bone", hex: "#f3efe6", stock: 18 },
      { sku: "DAY-MOSS", color: "Moss", hex: "#4e5d4a", stock: 7 },
    ],
  },
  {
    slug: "hearth-mug",
    name: "Hearth Mug",
    description: "A pair of straight-sided mugs. The handle is slightly oversized so it works with cold hands.",
    details: `${care.clay}\n\nSold as a set of two.`,
    priceCents: 4200,
    compareAtCents: 4800,
    category: "ceramics",
    bestSeller: true,
    images: [
      { file: "/media/products/cer-4.jpg", alt: "Two ceramic mugs beside a window" },
      { file: "/media/products/cer-5.jpg", alt: "Coffee poured into a ceramic cup" },
    ],
    variants: [
      { sku: "MUG-SAND", color: "Sand", hex: "#d9c7a6", stock: 22 },
      { sku: "MUG-CLAY", color: "Clay", hex: "#c4785a", stock: 11 },
      { sku: "MUG-INK", color: "Ink", hex: "#1c1915", stock: 0 },
    ],
  },
  {
    slug: "low-platter",
    name: "Low Platter",
    description: "An oval platter for fruit, cheese, or a stack of mail you are not ready to sort.",
    details: care.clay,
    priceCents: 7800,
    category: "ceramics",
    images: [
      { file: "/media/products/cer-8.jpg", alt: "A long ceramic platter" },
      { file: "/media/products/cer-1.jpg", alt: "Ceramic tableware arranged together" },
    ],
    variants: [
      { sku: "PLT-BONE", color: "Bone", hex: "#f3efe6", stock: 9 },
      { sku: "PLT-INK", color: "Ink", hex: "#1c1915", stock: 4 },
    ],
  },
  {
    slug: "incense-dish",
    name: "Incense Dish",
    description: "A shallow dish with a notch for a stick and a well deep enough to catch the ash.",
    details: care.clay,
    priceCents: 2800,
    category: "ceramics",
    images: [
      { file: "/media/products/cer-3.jpg", alt: "Small handmade ceramic dish" },
      { file: "/media/products/cer-7.jpg", alt: "Pottery drying on a studio shelf" },
    ],
    variants: [{ sku: "INC-SAND", color: "Sand", hex: "#d9c7a6", stock: 0 }],
  },
  {
    slug: "stacking-canister",
    name: "Stacking Canister",
    description: "A lidded canister for tea, salt, or cotton pads. The lid sits with a soft click.",
    details: care.clay,
    priceCents: 4800,
    category: "ceramics",
    images: [
      { file: "/media/products/cer-7.jpg", alt: "Lidded ceramic canisters" },
      { file: "/media/products/cer-3.jpg", alt: "Close view of a ceramic lid" },
    ],
    variants: [
      { sku: "CAN-S", size: "Small", color: "Bone", hex: "#f3efe6", stock: 16, priceCents: 3600 },
      { sku: "CAN-M", size: "Medium", color: "Bone", hex: "#f3efe6", stock: 12 },
      { sku: "CAN-L", size: "Large", color: "Bone", hex: "#f3efe6", stock: 6, priceCents: 6200 },
    ],
  },
  {
    slug: "rimmed-cup",
    name: "Rimmed Cup",
    description: "Four short cups for water, wine, or a late orange. The rim is left slightly uneven.",
    details: `${care.clay}\n\nSold as a set of four.`,
    priceCents: 6400,
    category: "ceramics",
    featured: true,
    images: [
      { file: "/media/products/cer-5.jpg", alt: "Short ceramic cups on a tray" },
      { file: "/media/products/cer-6.jpg", alt: "Overhead view of cups and coffee" },
    ],
    variants: [
      { sku: "CUP-BONE", color: "Bone", hex: "#f3efe6", stock: 15 },
      { sku: "CUP-MOSS", color: "Moss", hex: "#4e5d4a", stock: 6 },
    ],
  },
  {
    slug: "oat-linen-throw",
    name: "Oat Linen Throw",
    description: "A weighty throw with a loose weave and fringe that looks better the more it is folded.",
    details: care.linen,
    priceCents: 12800,
    category: "textiles",
    featured: true,
    bestSeller: true,
    images: [
      { file: "/media/products/tex-1.jpg", alt: "Linen throw draped over a bed" },
      { file: "/media/products/tex-2.jpg", alt: "Sunlit bedroom with layered textiles" },
    ],
    variants: [
      { sku: "THR-OAT", color: "Oat", hex: "#e6d7c3", stock: 10 },
      { sku: "THR-INK", color: "Ink", hex: "#1c1915", stock: 7 },
      { sku: "THR-MOSS", color: "Moss", hex: "#4e5d4a", stock: 4 },
    ],
  },
  {
    slug: "dune-coverlet",
    name: "Dune Coverlet",
    description: "A stonewashed coverlet that replaces a duvet in warmer months and layers under one in winter.",
    details: care.linen,
    priceCents: 24000,
    category: "textiles",
    featured: true,
    images: [
      { file: "/media/products/tex-2.jpg", alt: "A made bed in oat linen" },
      { file: "/media/products/tex-1.jpg", alt: "Folded bedding at the foot of a bed" },
    ],
    variants: [
      { sku: "DUN-Q", size: "Queen", color: "Oat", hex: "#e6d7c3", stock: 5 },
      { sku: "DUN-K", size: "King", color: "Oat", hex: "#e6d7c3", stock: 3, priceCents: 26800 },
      { sku: "DUN-Q-INK", size: "Queen", color: "Ink", hex: "#1c1915", stock: 2 },
    ],
  },
  {
    slug: "windowpane-sham",
    name: "Windowpane Sham",
    description: "A linen sham with a narrow flange. Pair it with the Dune Coverlet or let it stand alone.",
    details: care.linen,
    priceCents: 5800,
    category: "textiles",
    images: [
      { file: "/media/products/tex-7.jpg", alt: "Linen cushion on a sofa" },
      { file: "/media/products/tex-8.jpg", alt: "Soft textile texture in daylight" },
    ],
    variants: [
      { sku: "SHM-OAT", color: "Oat", hex: "#e6d7c3", stock: 14 },
      { sku: "SHM-BLUSH", color: "Blush", hex: "#e7cfc6", stock: 8 },
    ],
  },
  {
    slug: "market-tote",
    name: "Market Tote",
    description: "An unstructured canvas tote with a flat base and straps long enough to sit on the shoulder.",
    details: "Materials\nHeavy washed canvas, vegetable-tanned leather patch.\n\nCare\nSpot clean. The canvas will fade honestly.\n\nOrigin\nCut and sewn in limited runs.",
    priceCents: 7200,
    category: "textiles",
    bestSeller: true,
    images: [
      { file: "/media/products/tex-3.jpg", alt: "A structured tote in a living room" },
      { file: "/media/products/tex-4.jpg", alt: "Neutral upholstery and canvas tones" },
    ],
    variants: [
      { sku: "TOT-SAND", color: "Sand", hex: "#d9c7a6", stock: 20 },
      { sku: "TOT-INK", color: "Ink", hex: "#1c1915", stock: 9 },
    ],
  },
  {
    slug: "stonewashed-napkins",
    name: "Stonewashed Napkins",
    description: "A set of four napkins that do not need pressing. The hem is narrow and the color is uneven on purpose.",
    details: `${care.linen}\n\nSold as a set of four.`,
    priceCents: 3600,
    category: "textiles",
    images: [
      { file: "/media/products/tex-5.jpg", alt: "Folded linen napkins" },
      { file: "/media/products/tex-8.jpg", alt: "Close texture of washed linen" },
    ],
    variants: [
      { sku: "NAP-OAT", color: "Oat", hex: "#e6d7c3", stock: 24 },
      { sku: "NAP-MOSS", color: "Moss", hex: "#4e5d4a", stock: 11 },
    ],
  },
  {
    slug: "wool-seat-pad",
    name: "Wool Seat Pad",
    description: "A dense wool pad for a hard chair. Ties are cotton and can be tucked if you would rather not use them.",
    details: "Materials\nFelted wool, cotton ties.\n\nCare\nShake out and air. Spot clean only.\n\nOrigin\nFinished for Lumen.",
    priceCents: 6400,
    category: "textiles",
    images: [
      { file: "/media/products/tex-4.jpg", alt: "A chair with a textured seat" },
      { file: "/media/products/tex-3.jpg", alt: "Living room seating in muted green" },
    ],
    variants: [
      { sku: "PAD-MOSS", color: "Moss", hex: "#4e5d4a", stock: 8 },
      { sku: "PAD-INK", color: "Ink", hex: "#1c1915", stock: 6 },
    ],
  },
  {
    slug: "bath-sheet",
    name: "Bath Sheet",
    description: "An oversized cotton sheet with a low loop and a band of linen at the hem.",
    details: "Materials\nLong-staple cotton, linen hem.\n\nCare\nWash warm with like colors. Skip the fabric softener.\n\nOrigin\nWoven for Lumen.",
    priceCents: 8800,
    category: "textiles",
    bestSeller: true,
    images: [
      { file: "/media/products/tex-8.jpg", alt: "Folded bath linens" },
      { file: "/media/products/tex-5.jpg", alt: "Soft neutral textile stack" },
    ],
    variants: [
      { sku: "BTH-BONE", color: "Bone", hex: "#f3efe6", stock: 13 },
      { sku: "BTH-SAGE", color: "Sage", hex: "#8a9278", stock: 3 },
    ],
  },
  {
    slug: "column-lamp",
    name: "Column Lamp",
    description: "A plaster-white column with a paper shade. It throws a pool of light rather than a glare.",
    details: care.light,
    priceCents: 22000,
    category: "lighting",
    featured: true,
    bestSeller: true,
    images: [
      { file: "/media/products/lit-2.jpg", alt: "A table lamp glowing in a dim room" },
      { file: "/media/products/lit-1.jpg", alt: "Warm pendant light overhead" },
    ],
    variants: [
      { sku: "COL-BONE", color: "Bone", hex: "#f3efe6", stock: 6 },
      { sku: "COL-INK", color: "Ink", hex: "#1c1915", stock: 4 },
    ],
  },
  {
    slug: "paper-disc-pendant",
    name: "Paper Disc Pendant",
    description: "A flat disc of washi paper on a short brass canopy. Best over a table, not a hallway.",
    details: care.light,
    priceCents: 18000,
    category: "lighting",
    images: [
      { file: "/media/products/lit-1.jpg", alt: "A paper pendant above a table" },
      { file: "/media/products/lit-3.jpg", alt: "Several warm lights in a room" },
    ],
    variants: [
      { sku: "DSC-40", size: "40 cm", color: "Bone", hex: "#f3efe6", stock: 5 },
      { sku: "DSC-60", size: "60 cm", color: "Bone", hex: "#f3efe6", stock: 3, priceCents: 24000 },
    ],
  },
  {
    slug: "bedside-cone",
    name: "Bedside Cone",
    description: "A small cone shade on a weighted base, scaled for a narrow nightstand.",
    details: care.light,
    priceCents: 9600,
    category: "lighting",
    images: [
      { file: "/media/products/lit-4.jpg", alt: "A small lamp on a bedside table" },
      { file: "/media/products/lit-2.jpg", alt: "Lamp light against a plaster wall" },
    ],
    variants: [
      { sku: "CON-BRASS", color: "Brass", hex: "#b08d57", stock: 10 },
      { sku: "CON-BLACK", color: "Black", hex: "#1a1a1a", stock: 7 },
    ],
  },
  {
    slug: "taper-holders",
    name: "Taper Holders",
    description: "A pair of low holders for standard tapers. The base is wide enough that they do not tip when the table is bumped.",
    details: "Materials\nSolid brass or blackened steel.\n\nCare\nWipe with a dry cloth. Brass will patina.\n\nOrigin\nCast for Lumen.\n\nSold as a pair. Tapers not included.",
    priceCents: 3400,
    category: "lighting",
    images: [
      { file: "/media/products/lit-6.jpg", alt: "Candlelight on a dining table" },
      { file: "/media/products/lit-5.jpg", alt: "A row of small lamps in a shop" },
    ],
    variants: [
      { sku: "TAP-BRASS", color: "Brass", hex: "#b08d57", stock: 3 },
      { sku: "TAP-BLACK", color: "Black", hex: "#1a1a1a", stock: 12 },
    ],
  },
  {
    slug: "glass-hurricane",
    name: "Glass Hurricane",
    description: "A hand-blown cylinder for a pillar candle. The glass has a faint seed so the flame looks softer.",
    details: "Materials\nHand-blown glass.\n\nCare\nHand wash. Do not move while the candle is lit.\n\nOrigin\nBlown in small runs.",
    priceCents: 6200,
    category: "lighting",
    images: [
      { file: "/media/products/lit-5.jpg", alt: "Glass and light on a shelf" },
      { file: "/media/products/lit-6.jpg", alt: "Evening table with candles" },
    ],
    variants: [
      { sku: "HUR-S", size: "Small", stock: 9, priceCents: 4800 },
      { sku: "HUR-L", size: "Large", stock: 6 },
    ],
  },
  {
    slug: "wall-sconce",
    name: "Wall Sconce",
    description: "A shallow arm and a linen shade. It is hardwired, and a template is included for the junction box.",
    details: care.light,
    priceCents: 14000,
    category: "lighting",
    images: [
      { file: "/media/products/lit-3.jpg", alt: "Wall-mounted light in a hallway" },
      { file: "/media/products/lit-4.jpg", alt: "A linen shade catching warm light" },
    ],
    variants: [
      { sku: "SNC-BRASS", color: "Brass", hex: "#b08d57", stock: 4 },
      { sku: "SNC-BLACK", color: "Black", hex: "#1a1a1a", stock: 5 },
    ],
  },
  {
    slug: "cedar-room-spray",
    name: "Cedar Room Spray",
    description: "Cedar, a little orange peel, and clean musk. One pass is enough for a bedroom.",
    details: `${care.scent}\n\n100 ml. Alcohol base.`,
    priceCents: 3200,
    category: "fragrance",
    bestSeller: true,
    images: [
      { file: "/media/products/fr-2.jpg", alt: "A glass spray bottle in soft light" },
      { file: "/media/products/fr-1.jpg", alt: "A lit candle beside a pale wall" },
    ],
    variants: [{ sku: "CDR-100", size: "100 ml", stock: 30 }],
  },
  {
    slug: "fig-leaf-candle",
    name: "Fig Leaf Candle",
    description: "Green fig leaf, a milky note, and cedar at the base. The wax is a coconut blend in a reusable glass.",
    details: care.scent,
    priceCents: 3800,
    category: "fragrance",
    featured: true,
    bestSeller: true,
    images: [
      { file: "/media/products/fr-1.jpg", alt: "A cream candle with a single wick" },
      { file: "/media/categories/fragrance.jpg", alt: "Candlelight on a wooden surface" },
    ],
    variants: [
      { sku: "FIG-8", size: "8 oz", stock: 18 },
      { sku: "FIG-16", size: "16 oz", stock: 9, priceCents: 5800 },
    ],
  },
  {
    slug: "vetiver-incense",
    name: "Vetiver Incense",
    description: "Short sticks of vetiver and a trace of smoke. Thirty minutes, then the room goes quiet again.",
    details: `${care.scent}\n\nBox of 30 sticks. Dish sold separately.`,
    priceCents: 2200,
    category: "fragrance",
    images: [
      { file: "/media/products/fr-6.jpg", alt: "Amber glass bottles arranged in a row" },
      { file: "/media/products/fr-2.jpg", alt: "Fragrance bottles on stone" },
    ],
    variants: [{ sku: "VET-30", size: "30 sticks", stock: 40 }],
  },
  {
    slug: "linen-water",
    name: "Linen Water",
    description: "Neroli and clean cotton for pressing day, or for a shirt that has lived on a chair.",
    details: `${care.scent}\n\n200 ml.`,
    priceCents: 2800,
    category: "fragrance",
    images: [
      { file: "/media/products/fr-3.jpg", alt: "A clear bottle of linen spray" },
      { file: "/media/products/fr-4.jpg", alt: "Perfume bottles on a tray" },
    ],
    variants: [{ sku: "LIN-200", size: "200 ml", stock: 22 }],
  },
  {
    slug: "night-oil",
    name: "Night Oil",
    description: "A skin scent of orris, sandalwood, and a drop of black tea. It stays close.",
    details: `${care.scent}\n\n15 ml roll-on. For pulse points.`,
    priceCents: 7800,
    category: "fragrance",
    bestSeller: true,
    images: [
      { file: "/media/products/fr-4.jpg", alt: "A small perfume bottle with a gold cap" },
      { file: "/media/products/fr-3.jpg", alt: "Fragrance still life" },
    ],
    variants: [{ sku: "NGT-15", size: "15 ml", stock: 14 }],
  },
  {
    slug: "citrus-peel-candle",
    name: "Citrus Peel Candle",
    description: "Bitter orange peel and a green stem note. Brighter than the fig, and just as quiet at the end.",
    details: care.scent,
    priceCents: 3600,
    compareAtCents: 4200,
    category: "fragrance",
    images: [
      { file: "/media/categories/fragrance.jpg", alt: "Several candles burning low" },
      { file: "/media/products/fr-6.jpg", alt: "Glass vessels on a shelf" },
    ],
    variants: [
      { sku: "CIT-8", size: "8 oz", stock: 16 },
      { sku: "CIT-16", size: "16 oz", stock: 5, priceCents: 5400 },
    ],
  },
  {
    slug: "smoke-salt-diffuser",
    name: "Smoke & Salt Diffuser",
    description: "Driftwood, salt, and a cold smoke note. Reeds are included and the vessel is meant to stay out.",
    details: `${care.scent}\n\n150 ml. Lasts about ten weeks.`,
    priceCents: 4400,
    category: "fragrance",
    images: [
      { file: "/media/products/fr-2.jpg", alt: "A reed diffuser in clear glass" },
      { file: "/media/products/fr-4.jpg", alt: "Bottles grouped on a stone surface" },
    ],
    variants: [{ sku: "SMK-150", size: "150 ml", stock: 11 }],
  },
  {
    slug: "mineral-bath-soak",
    name: "Mineral Bath Soak",
    description: "Magnesium salts with a little lavender and cedar. The water goes cloudy and the shoulders drop.",
    details: care.bath,
    priceCents: 2600,
    category: "bath",
    featured: true,
    images: [
      { file: "/media/products/bath-1.jpg", alt: "Bath salts in a glass jar" },
      { file: "/media/products/bath-2.jpg", alt: "Bottles arranged for a bath ritual" },
    ],
    variants: [
      { sku: "SOK-8", size: "8 oz", stock: 20 },
      { sku: "SOK-16", size: "16 oz", stock: 12, priceCents: 4200 },
    ],
  },
  {
    slug: "clay-cleansing-bar",
    name: "Clay Cleansing Bar",
    description: "A kaolin bar for face and hands. It lathers quietly and rinses without a film.",
    details: care.bath,
    priceCents: 1400,
    category: "bath",
    images: [
      { file: "/media/products/bath-4.jpg", alt: "A pale cleansing bar on ceramic" },
      { file: "/media/products/bath-6.jpg", alt: "Skincare bottles in morning light" },
    ],
    variants: [
      { sku: "BAR-1", size: "Single", stock: 40 },
      { sku: "BAR-3", size: "Set of 3", stock: 15, priceCents: 3800 },
    ],
  },
  {
    slug: "hand-balm",
    name: "Hand Balm",
    description: "Shea and camellia with a faint cedar. A small tin that lives by the sink.",
    details: care.bath,
    priceCents: 1800,
    category: "bath",
    bestSeller: true,
    images: [
      { file: "/media/products/bath-2.jpg", alt: "An open tin of hand balm" },
      { file: "/media/products/bath-3.jpg", alt: "Oil and balm on a wood shelf" },
    ],
    variants: [{ sku: "BALM-50", size: "50 ml", stock: 28 }],
  },
  {
    slug: "body-oil",
    name: "Body Oil",
    description: "A dry oil of jojoba, squalane, and crushed green herbs. It sinks in before you get dressed.",
    details: care.bath,
    priceCents: 4200,
    category: "bath",
    images: [
      { file: "/media/products/bath-3.jpg", alt: "A glass bottle of body oil" },
      { file: "/media/products/bath-5.jpg", alt: "Amber bottles on linen" },
    ],
    variants: [
      { sku: "OIL-50", size: "50 ml", stock: 17 },
      { sku: "OIL-100", size: "100 ml", stock: 8, priceCents: 6800 },
    ],
  },
  {
    slug: "scalp-brush",
    name: "Scalp Brush",
    description: "Beechwood and soft rubber nodules. Use it in the shower, then let it dry bristles-up.",
    details: "Materials\nBeechwood, natural rubber.\n\nCare\nRinse and air dry.\n\nOrigin\nFinished for Lumen.",
    priceCents: 2400,
    category: "bath",
    images: [
      { file: "/media/products/bath-8.jpg", alt: "A wooden brush on a stone ledge" },
      { file: "/media/products/bath-1.jpg", alt: "Bath tools beside a ceramic cup" },
    ],
    variants: [{ sku: "BRSH-1", color: "Beech", hex: "#c9a27a", stock: 19 }],
  },
  {
    slug: "cotton-washcloths",
    name: "Cotton Washcloths",
    description: "A stack of six cloths in unbleached cotton. They replace sponges and last for years.",
    details: "Materials\nUnbleached cotton gauze.\n\nCare\nWash hot. They tighten after the first dry.\n\nSold as a set of six.",
    priceCents: 2000,
    category: "bath",
    images: [
      { file: "/media/products/bath-6.jpg", alt: "Stacked cotton cloths" },
      { file: "/media/products/bath-8.jpg", alt: "Natural fiber textiles in a bath" },
    ],
    variants: [{ sku: "CLTH-6", size: "Set of 6", stock: 25 }],
  },
  {
    slug: "after-sun-mist",
    name: "After Sun Mist",
    description: "Aloe, cucumber water, and a little panthenol in a fine mist. Cool, and not sticky.",
    details: care.bath,
    priceCents: 3000,
    category: "bath",
    images: [
      { file: "/media/products/bath-5.jpg", alt: "A mist bottle lying on linen" },
      { file: "/media/products/bath-2.jpg", alt: "Bath bottles in soft daylight" },
    ],
    variants: [{ sku: "SUN-100", size: "100 ml", stock: 2 }],
  },
];

export const reviewPool = [
  { rating: 5, title: "Quietly beautiful", body: "The weight and finish feel considered. It looks even better in the room than it did online." },
  { rating: 5, title: "Already part of the day", body: "I reach for this without thinking, which is the compliment. Nothing fussy about it." },
  { rating: 4, title: "Exactly as described", body: "Color is true and the materials feel honest. Shipping was careful, packed in paper rather than a cloud of plastic." },
  { rating: 5, title: "Worth the wait", body: "I bought this after walking past something similar for a year. Glad I stopped negotiating with myself." },
  { rating: 4, title: "Lives on the table", body: "Slight variation in the finish, which I wanted. It has a place now and I notice when it is in the sink." },
  { rating: 3, title: "Lovely, a touch delicate", body: "Beautiful object. I am a little more careful with it than the description implied, but I would still order it again." },
  { rating: 5, title: "The scent stays close", body: "Not a room-filler in the loud way. It is there when you walk in and gone before it tires you." },
  { rating: 4, title: "Gifted one, kept one", body: "Ordered two. The second never left the house. The box and the note made it easy to give." },
];

export const reviewAuthors = [
  "Mara Ellison",
  "Chris Adelayo",
  "Helen Cho",
  "Jonah Hale",
  "Priya Raman",
  "Evan Brooks",
  "Sofia Marin",
  "Nate Okonkwo",
  "Leah Ortiz",
  "Samir Shah",
  "Greta Holm",
  "Imani Brooks",
];
