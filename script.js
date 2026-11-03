/* ==========================================================================
   Vortex Menswear — Application Script
   Handles: product rendering · filters · product modal · cart · checkout · reviews
   ========================================================================== */

(function () {
  "use strict";

  /* ------------------------------------------------------------------
     1. Store configuration
     ------------------------------------------------------------------ */
  const STORE = {
    name: "Vortex Menswear",
    phone: "01065101692",
    email: "hishamalbadri582@gmail.com",
    deposit: 90,
    currency: "EGP",
  };

  /* ------------------------------------------------------------------
     2. Constants & helpers
     ------------------------------------------------------------------ */
  const APPAREL_SIZES = ["M", "L", "XL", "2XL", "3XL", "4XL", "5XL"];
  const SHOE_SIZES = ["40", "41", "42", "43", "44", "45", "46"];

  const CART_KEY = "vortex_cart_v1";
  const REVIEW_KEY = "vortex_reviews_v1";

  /** Builds a hosted product image URL from a text prompt. */
  const IMG = (prompt, size = "portrait_4_3") =>
    "https://coresg-normal.trae.ai/api/ide/v1/text_to_image?prompt=" +
    encodeURIComponent(prompt) +
    "&image_size=" +
    size;

  const money = (value) =>
    new Intl.NumberFormat("en-EG", { maximumFractionDigits: 0 }).format(value) +
    " " +
    STORE.currency;

  const $ = (selector, scope = document) => scope.querySelector(selector);
  const $$ = (selector, scope = document) => Array.from(scope.querySelectorAll(selector));

  const stars = (rating) => {
    const full = Math.round(rating);
    let html = "";
    for (let i = 1; i <= 5; i += 1) {
      html += `<span class="${i <= full ? "" : "stars__empty"}">&#9733;</span>`;
    }
    return html;
  };

  /* ------------------------------------------------------------------
     3. Product catalogue
     50 winter apparel pieces + 20 pairs of winter footwear.
     To change a price, edit the `price` (and `oldPrice`) field below.
     ------------------------------------------------------------------ */

  /* Four consistent images are generated per product from three prompt fragments:
     [0] the item on a studio backdrop, [1] a material macro detail, [2] the item worn. */
  const studioShot = (subject) =>
    IMG(
      `Professional e-commerce studio product photograph of ${subject}, front view, floating on a dark charcoal seamless backdrop, soft directional studio lighting, ultra sharp material texture, premium fashion catalogue quality`
    );

  const detailShot = (detail) =>
    IMG(
      `Macro detail photograph of ${detail}, dark moody studio lighting, ultra sharp texture, luxury product photography`
    );

  const modelShot = (subject, styling) =>
    IMG(
      `Editorial fashion photograph of a male model ${
        styling || `wearing ${subject}`
      }, three quarter view, muted slate grey studio background, soft cinematic winter light, premium menswear campaign`
    );

  const backShot = (subject) =>
    IMG(
      `Studio photograph of ${subject}, three-quarter back view, dark seamless background, clean e-commerce product shot, soft even lighting`
    );

  const images = (subject, detail, styling) => [
    studioShot(subject),
    detailShot(detail),
    modelShot(subject, styling),
    backShot(subject),
  ];

  /* Spec table template per product type. */
  const SPECS_BY_TYPE = {
    Outerwear: [
      ["Fit", "Regular to oversized"],
      ["Closure", "Full zip / button front"],
      ["Pockets", "Multiple, fleece-lined"],
      ["Care", "Dry clean recommended"],
    ],
    Knitwear: [
      ["Knit", "Mid to heavy gauge"],
      ["Neckline", "As described"],
      ["Fit", "Regular, layer-friendly"],
      ["Care", "Hand wash cold, dry flat"],
    ],
    Bottoms: [
      ["Cut", "As described"],
      ["Waist", "Button / elasticated"],
      ["Fabric", "Winter weight"],
      ["Care", "Machine wash cold"],
    ],
    Shirts: [
      ["Collar", "Point collar"],
      ["Closure", "Button front"],
      ["Fabric", "Winter weight"],
      ["Fit", "Regular"],
    ],
    Hoodies: [
      ["Weight", "Heavyweight cotton"],
      ["Hood", "Fixed, double layer"],
      ["Fit", "Boxy / relaxed"],
      ["Care", "Machine wash cold"],
    ],
    Boots: [
      ["Lining", "Thermal / wool blend"],
      ["Sole", "Lugged rubber"],
      ["Closure", "As described"],
      ["Water resistance", "Treated upper"],
    ],
    Sneakers: [
      ["Lining", "Textile / brushed fleece"],
      ["Sole", "Cushioned rubber"],
      ["Closure", "Lace-up"],
      ["Water resistance", "Treated upper"],
    ],
  };

  /* Raw catalogue. `img` holds [studio subject, detail, worn-on-model] prompts. */
  const CATALOGUE = [
    /* ================= 1. Outerwear — 10 pieces ================= */
    {
      id: "ap-01", category: "apparel", type: "Outerwear",
      name: "Oversized Leather Bomber Jacket", nameAr: "جاكيت بومبر جلد ضخم",
      price: 4200, oldPrice: 4900, rating: 4.9, reviewCount: 128, badge: "Bestseller",
      colour: "Black / Deep Brown", material: "Supple sheep leather",
      desc: "A wide, boxy leather bomber cut from supple sheep leather with ribbed knit trims. An eighties streetwear silhouette that layers easily over a hoodie.",
      img: ["an oversized black leather bomber jacket with ribbed knit cuffs", "the grain of black sheep leather next to ribbed knit trim", "wearing an oversized black leather bomber jacket over a grey hoodie"],
    },
    {
      id: "ap-02", category: "apparel", type: "Outerwear",
      name: "Nip-Tuck Tailored Wool Overcoat", nameAr: "معطف صوف بقصة محددة الخصر",
      price: 4650, oldPrice: 5400, rating: 4.8, reviewCount: 96, badge: "Tailored",
      colour: "Charcoal Grey", material: "Virgin wool blend",
      desc: "A long wool overcoat sharply cinched at the waist for a defined, tailored line. Wears as well over a suit as it does over knitwear.",
      img: ["a long charcoal grey tailored wool overcoat with a cinched waist", "charcoal wool fabric and a defined overcoat waist seam", "wearing a tailored charcoal wool overcoat over a turtleneck sweater"],
    },
    {
      id: "ap-03", category: "apparel", type: "Outerwear",
      name: "Stormshell Waterproof Parka", nameAr: "باركا مقاومة للماء والرياح",
      price: 5200, oldPrice: 6100, rating: 4.9, reviewCount: 143, badge: "Waterproof",
      colour: "Deep Olive", material: "Seam-sealed technical shell",
      desc: "A heavy-duty parka built for wet, grey weather with a fully seam-sealed shell and an adjustable storm hood. Utility detailing, clean enough for the city.",
      img: ["a deep olive seam-sealed waterproof parka with a storm hood", "water beading on waterproof ripstop shell fabric", "wearing a waterproof olive parka with the hood up in light rain"],
    },
    {
      id: "ap-04", category: "apparel", type: "Outerwear",
      name: "Capelet Trench Coat", nameAr: "ترينش طويل بطبقة كاب",
      price: 3850, oldPrice: 4500, rating: 4.7, reviewCount: 74, badge: "",
      colour: "Stone Beige", material: "Cotton gabardine",
      desc: "A classic trench reworked with a short capelet layer across the shoulders. Traditional double-breasted styling with a modern silhouette.",
      img: ["a stone beige capelet trench coat with a short shoulder cape", "belted trench coat cotton gabardine and buckle detail", "wearing a capelet trench coat over a charcoal knit"],
    },
    {
      id: "ap-05", category: "apparel", type: "Outerwear",
      name: "Faux Fur Statement Coat", nameAr: "معطف فرو صناعي واسع",
      price: 4400, oldPrice: 5100, rating: 4.6, reviewCount: 58, badge: "",
      colour: "Cream / Camel", material: "Dense faux fur pile",
      desc: "A bold faux fur coat in neutral tones that anchors a winter outfit without trying. Soft, dense pile with a full lining.",
      img: ["an oversized cream faux fur statement coat", "dense cream faux fur pile texture", "wearing a cream faux fur coat over dark denim"],
    },
    {
      id: "ap-06", category: "apparel", type: "Outerwear",
      name: "Velvet-Finish Puffer Jacket", nameAr: "جاكيت منفوخ بقماش مخملي",
      price: 3150, oldPrice: 3700, rating: 4.7, reviewCount: 81, badge: "New",
      colour: "Slate Blue", material: "Velvet-finish shell, synthetic fill",
      desc: "A padded puffer finished in velvet rather than the usual nylon. Warmth and volume with a texture you rarely see on outerwear.",
      img: ["a slate blue velvet finish puffer jacket with panels", "slate blue velvet jacket fabric with quilt stitching", "wearing a slate blue velvet puffer jacket over a knit"],
    },
    {
      id: "ap-07", category: "apparel", type: "Outerwear",
      name: "Shearling-Lined Biker Jacket", nameAr: "جاكيت جلد ببطانة شيرلينغ",
      price: 4900, oldPrice: 5700, rating: 4.9, reviewCount: 112, badge: "",
      colour: "Dark Brown", material: "Full-grain cowhide, shearling lining",
      desc: "A biker jacket in full-grain cowhide with a deep shearling lining and a prominent wool collar. Classic, warm and built to age well.",
      img: ["a dark brown leather biker jacket with a shearling collar", "shearling wool collar and hide leather detail", "wearing a shearling-lined brown leather biker jacket"],
    },
    {
      id: "ap-08", category: "apparel", type: "Outerwear",
      name: "Tartan Check Wool Coat", nameAr: "معطف صوف بنقشة تارتان",
      price: 4050, oldPrice: 4700, rating: 4.7, reviewCount: 66, badge: "",
      colour: "Charcoal Tartan", material: "Brushed wool blend",
      desc: "A wool coat in a broad Scottish tartan check. Traditional pattern, modern cut — sharp over tailoring and easy over a sweater.",
      img: ["a charcoal tartan check wool coat", "broad tartan check wool weave in charcoal and grey", "wearing a tartan check wool coat over a black sweater"],
    },
    {
      id: "ap-09", category: "apparel", type: "Outerwear",
      name: "Fireman-Buckle Military Jacket", nameAr: "جاكيت عسكري بأقفال معدنية",
      price: 3450, oldPrice: 4000, rating: 4.8, reviewCount: 89, badge: "",
      colour: "Dark Olive", material: "Heavy cotton canvas",
      desc: "A heavyweight military-inspired jacket with metal fireman buckles and a stand collar. Workwear toughness with a considered, structured fit.",
      img: ["a dark olive military jacket with metal fireman buckle closures", "metal fireman buckle and heavy canvas stitching detail", "wearing an olive military jacket with buckle fastenings"],
    },
    {
      id: "ap-10", category: "apparel", type: "Outerwear",
      name: "Double-Breasted Camel Coat", nameAr: "معطف جملي بصفين أزرار",
      price: 4300, oldPrice: 5000, rating: 4.8, reviewCount: 104, badge: "Tailored",
      colour: "Camel", material: "Wool-cashmere blend",
      desc: "A camel wool coat with two rows of buttons and a soft shoulder. The most formal piece in the collection and the easiest to dress up.",
      img: ["a double-breasted camel wool coat with two button rows", "camel wool coat fabric and horn buttons", "wearing a double-breasted camel coat over a suit"],
    },

    /* ================= 2. Knitwear — 10 pieces ================= */
    {
      id: "ap-11", category: "apparel", type: "Knitwear",
      name: "Cable-Knit Wool Sweater", nameAr: "سويتر حياكة سميكة كابل",
      price: 1450, oldPrice: 1750, rating: 4.8, reviewCount: 214, badge: "Bestseller",
      colour: "Oatmeal Cream", material: "Wool-rich cable yarn",
      desc: "A traditional cable-knit in a heavier wool gauge. Raised cables and hand-finished ribbing give it real weight and drape.",
      img: ["an oatmeal cream chunky cable knit wool sweater", "thick raised cable knit wool texture", "wearing an oatmeal cable knit sweater with dark trousers"],
    },
    {
      id: "ap-12", category: "apparel", type: "Knitwear",
      name: "Scoop Neck Knit Sweater", nameAr: "سويتر برقبة واسعة",
      price: 1250, oldPrice: 1500, rating: 4.6, reviewCount: 97, badge: "Trend",
      colour: "Slate Grey", material: "Soft mid-gauge wool blend",
      desc: "A modern knit with a wide, open neckline made for layering — over a tee, under a coat. Soft mid-gauge yarn with a relaxed drape.",
      img: ["a slate grey scoop neck knit sweater with a wide open neckline", "slate grey mid gauge knit yarn and ribbed hem", "wearing a scoop neck grey knit sweater over a white tee"],
    },
    {
      id: "ap-13", category: "apparel", type: "Knitwear",
      name: "Retro Striped Cardigan", nameAr: "كارديغان مقلم بطابع السبعينيات",
      price: 1650, oldPrice: 1950, rating: 4.7, reviewCount: 88, badge: "",
      colour: "Camel / Rust / Cream", material: "Lambswool blend",
      desc: "A buttoned cardigan in bold retro stripes inspired by the seventies. Warm, characterful and easy to wear open over a shirt.",
      img: ["a retro striped lambswool cardigan in camel rust and cream", "retro striped knit cardigan yarn and button placket", "wearing a retro striped cardigan open over a white shirt"],
    },
    {
      id: "ap-14", category: "apparel", type: "Knitwear",
      name: "Fair Isle Heritage Jumper", nameAr: "كنزة بنقوش فير آيل التراثية",
      price: 1850, oldPrice: 2200, rating: 4.8, reviewCount: 73, badge: "",
      colour: "Ecru / Moss", material: "Shetland-style wool",
      desc: "A heritage Fair Isle knit with geometric patterns across the neck and shoulders. A genuine winter classic in muted, wearable colours.",
      img: ["an ecru and moss green fair isle patterned knit jumper", "fair isle geometric pattern knitting across the yoke", "wearing a fair isle patterned heritage jumper"],
    },
    {
      id: "ap-15", category: "apparel", type: "Knitwear",
      name: "Oversized Roll-Neck Jumper", nameAr: "سويتر بياقة عالية وقصة واسعة",
      price: 1550, oldPrice: 1850, rating: 4.8, reviewCount: 156, badge: "",
      colour: "Charcoal", material: "Chunky wool blend",
      desc: "A very generously cut roll-neck in a dark neutral. Big, soft and warm — the piece you reach for on the coldest mornings.",
      img: ["an oversized charcoal grey roll neck jumper", "chunky charcoal knit roll neck collar detail", "wearing an oversized charcoal roll neck jumper"],
    },
    {
      id: "ap-16", category: "apparel", type: "Knitwear",
      name: "Patterned Knit Vest", nameAr: "جيليه صوفي محبوك بنقوش",
      price: 1100, oldPrice: 1350, rating: 4.6, reviewCount: 61, badge: "New",
      colour: "Moss Green", material: "Jacquard knit wool",
      desc: "A sleeveless knit vest with graphic patterning, made to be worn over a shirt or under a blazer. Adds texture without bulk.",
      img: ["a moss green patterned jacquard knit vest", "jacquard knit pattern and ribbed vest hem", "wearing a patterned knit vest over a white shirt"],
    },
    {
      id: "ap-17", category: "apparel", type: "Knitwear",
      name: "Quarter-Zip Fleece Pullover", nameAr: "سويتر بسحاب ربعي",
      price: 1050, oldPrice: 1300, rating: 4.7, reviewCount: 132, badge: "",
      colour: "Navy", material: "Brushed fleece",
      desc: "A lightweight fleece pullover with a quarter zip at the neck. An everyday mid-layer that works indoors and out.",
      img: ["a navy quarter zip fleece pullover sweater", "navy brushed fleece pile and metal quarter zip", "wearing a navy quarter zip fleece pullover"],
    },
    {
      id: "ap-18", category: "apparel", type: "Knitwear",
      name: "Deep Burgundy Cashmere Crewneck", nameAr: "سويتر كشمير أحمر برجندي",
      price: 2450, oldPrice: 2900, rating: 4.9, reviewCount: 91, badge: "Limited",
      colour: "Deep Burgundy", material: "100% cashmere",
      desc: "A simple, luxurious crewneck in deep burgundy cashmere. The colour of the season, cut clean with nothing to distract from it.",
      img: ["a deep burgundy cashmere crewneck sweater", "soft burgundy cashmere knit texture", "wearing a deep burgundy cashmere crewneck sweater"],
    },
    {
      id: "ap-19", category: "apparel", type: "Knitwear",
      name: "Mock Neck Heavy Sweater", nameAr: "كنزة ثقيلة بياقة موك",
      price: 1350, oldPrice: 1650, rating: 4.7, reviewCount: 118, badge: "Essential",
      colour: "Dark Grey", material: "Cold-resistant heavy wool",
      desc: "A heavyweight sweater with a mid-height mock neck that seals out draughts. Dense, cold-resistant wool with a clean, unfussy finish.",
      img: ["a dark grey mock neck heavy wool sweater", "dark grey dense wool knit and mock neck collar", "wearing a dark grey mock neck heavy sweater"],
    },
    {
      id: "ap-20", category: "apparel", type: "Knitwear",
      name: "Poet-Core Graphic Knit", nameAr: "سويتر مطرز بنقوش فنية",
      price: 1750, oldPrice: 2050, rating: 4.6, reviewCount: 44, badge: "",
      colour: "Ecru / Ink", material: "Fine-gauge merino blend",
      desc: "A fine-gauge knit carrying delicate graphic and poetic motifs. Quietly artistic — best worn with plain trousers.",
      img: ["an ecru fine knit sweater with delicate graphic motifs", "fine merino knit with delicate graphic embroidery", "wearing a graphic poet style knit sweater"],
    },

    /* ================= 3. Bottoms — 10 pieces ================= */
    {
      id: "ap-21", category: "apparel", type: "Bottoms",
      name: "Extra-Wide Leg Denim Jeans", nameAr: "بنطال جينز واسع فضفاض",
      price: 1290, oldPrice: 1550, rating: 4.7, reviewCount: 143, badge: "Trend",
      colour: "Mid Blue / Black", material: "Heavyweight cotton denim",
      desc: "Denim cut very wide through the leg for a relaxed streetwear line. Heavyweight cotton with a comfortable, roomy seat.",
      img: ["extra wide leg denim jeans in mid blue", "heavyweight denim fabric and wide leg trouser seam", "wearing extra wide leg denim jeans with a boxy hoodie"],
    },
    {
      id: "ap-22", category: "apparel", type: "Bottoms",
      name: "Corduroy Trousers", nameAr: "بنطال مخمل مضلع",
      price: 1180, oldPrice: 1420, rating: 4.8, reviewCount: 167, badge: "",
      colour: "Olive / Dark Brown", material: "Dense cotton corduroy",
      desc: "Straight corduroy trousers in olive or dark brown with a soft, dense wale. Warm, textured and endlessly wearable.",
      img: ["olive green corduroy straight leg trousers", "dense olive corduroy wale fabric texture", "wearing olive corduroy trousers with a knit sweater"],
    },
    {
      id: "ap-23", category: "apparel", type: "Bottoms",
      name: "Pleated Tailored Wool Trousers", nameAr: "بنطال صوف بكسرات",
      price: 1650, oldPrice: 1950, rating: 4.7, reviewCount: 79, badge: "Tailored",
      colour: "Charcoal Grey", material: "Wool blend suiting",
      desc: "Tailored wool trousers with front pleats that add room through the thigh without losing the line. Smart enough for the office.",
      img: ["charcoal grey pleated tailored wool trousers", "charcoal wool suiting fabric and trouser pleat detail", "wearing pleated charcoal wool trousers with a blazer"],
    },
    {
      id: "ap-24", category: "apparel", type: "Bottoms",
      name: "Insulated Technical Cargo Pants", nameAr: "بنطال كارجو تقني محشو",
      price: 1850, oldPrice: 2200, rating: 4.8, reviewCount: 108, badge: "New",
      colour: "Black / Olive", material: "Ripstop shell, brushed lining",
      desc: "Technical cargo pants with multiple pockets and a warm brushed lining. Weather-resistant shell built for genuinely cold days.",
      img: ["black insulated technical cargo pants with multiple pockets", "ripstop cargo pant fabric with zip pocket and warm lining", "wearing insulated black technical cargo pants"],
    },
    {
      id: "ap-25", category: "apparel", type: "Bottoms",
      name: "Patchwork Denim Jeans", nameAr: "بنطال جينز برقع",
      price: 1490, oldPrice: 1790, rating: 4.6, reviewCount: 62, badge: "Trend",
      colour: "Mixed Blue Washes", material: "Panel-stitched cotton denim",
      desc: "Jeans assembled from denim panels in contrasting washes. Every pair reads slightly differently.",
      img: ["patchwork denim jeans made from contrasting blue denim panels", "patchwork denim panel stitching in mixed blue washes", "wearing patchwork denim jeans with a black jacket"],
    },
    {
      id: "ap-26", category: "apparel", type: "Bottoms",
      name: "Velvet Straight-Leg Pants", nameAr: "بنطال مخملي بقصة مستقيمة",
      price: 1590, oldPrice: 1890, rating: 4.6, reviewCount: 51, badge: "",
      colour: "Deep Green", material: "Smooth cotton velvet",
      desc: "Smooth velvet trousers in a straight cut, made for evenings and occasions. Deep pile with a soft, light-catching finish.",
      img: ["deep green velvet straight leg trousers", "deep green velvet trouser pile catching soft light", "wearing deep green velvet trousers with a dark shirt"],
    },
    {
      id: "ap-27", category: "apparel", type: "Bottoms",
      name: "Heavyweight Fleece Joggers", nameAr: "بنطال رياضي صوفي ثقيل",
      price: 950, oldPrice: 1150, rating: 4.7, reviewCount: 189, badge: "",
      colour: "Charcoal / Heather Grey", material: "Heavy cotton fleece",
      desc: "Heavy cotton fleece joggers with a relaxed cut and elasticated cuffs. Built for long days indoors and short trips out.",
      img: ["charcoal grey heavyweight fleece joggers", "heavy cotton fleece fabric and elasticated cuff detail", "wearing heavyweight grey fleece joggers with a hoodie"],
    },
    {
      id: "ap-28", category: "apparel", type: "Bottoms",
      name: "Checkered Tailored Pants", nameAr: "بنطال رسمي بنقشة كاروهات",
      price: 1450, oldPrice: 1720, rating: 4.6, reviewCount: 57, badge: "",
      colour: "Grey Check", material: "Wool-blend check cloth",
      desc: "Tailored trousers in a soft check pattern. Formal enough for work, patterned enough to carry a plain knit.",
      img: ["grey checkered tailored wool trousers", "grey check suiting fabric texture", "wearing grey check tailored trousers with a plain knit"],
    },
    {
      id: "ap-29", category: "apparel", type: "Bottoms",
      name: "Washed Black Denim Jeans", nameAr: "جينز أسود معالج باهت",
      price: 1190, oldPrice: 1420, rating: 4.7, reviewCount: 174, badge: "",
      colour: "Washed Black", material: "Distressed cotton denim",
      desc: "Washed and lightly distressed black denim for a vintage look. Fades naturally with wear.",
      img: ["washed black distressed denim jeans", "washed black denim with fading and distressing detail", "wearing washed black denim jeans with a leather jacket"],
    },
    {
      id: "ap-30", category: "apparel", type: "Bottoms",
      name: "Straight-Leg Tweed Trousers", nameAr: "بنطال جوخ بقصة مستقيمة",
      price: 1750, oldPrice: 2050, rating: 4.7, reviewCount: 48, badge: "",
      colour: "Brown Herringbone", material: "Winter tweed",
      desc: "Winter tweed trousers in a clean straight leg. Heritage cloth with a contemporary cut.",
      img: ["brown herringbone tweed straight leg trousers", "brown herringbone tweed cloth texture", "wearing brown tweed trousers with a wool overshirt"],
    },

    /* ================= 4. Shirts & Overshirts — 10 pieces ================= */
    {
      id: "ap-31", category: "apparel", type: "Shirts",
      name: "Heavy Wool Overshirt (Cacket)", nameAr: "جاكيت قميص صوفي ثقيل",
      price: 1650, oldPrice: 1950, rating: 4.8, reviewCount: 121, badge: "",
      colour: "Charcoal / Olive", material: "Heavy brushed wool",
      desc: "A thick wool overshirt that works as a light jacket. Layer it over a tee or under a coat — one of the most useful pieces in a winter wardrobe.",
      img: ["a heavy charcoal wool overshirt jacket with chest pockets", "heavy brushed wool overshirt fabric and pocket stitching", "wearing a heavy wool overshirt open over a white tee"],
    },
    {
      id: "ap-32", category: "apparel", type: "Shirts",
      name: "Shearling-Lined Denim Shirt Jacket", nameAr: "قميص جينز ثقيل ببطانة شيرلينغ",
      price: 1890, oldPrice: 2250, rating: 4.7, reviewCount: 84, badge: "",
      colour: "Mid Blue Denim", material: "Denim shell, shearling lining",
      desc: "A heavy denim shirt jacket with a warm shearling lining. Rugged on the outside, soft where it counts.",
      img: ["a mid blue denim shirt jacket with a shearling collar", "denim shirt jacket shell with warm shearling lining", "wearing a shearling lined denim shirt jacket"],
    },
    {
      id: "ap-33", category: "apparel", type: "Shirts",
      name: "Flannel Checkered Shirt", nameAr: "قميص فلانيلي بمربعات",
      price: 890, oldPrice: 1090, rating: 4.8, reviewCount: 203, badge: "Essential",
      colour: "Red / Black Check", material: "Brushed cotton flannel",
      desc: "A warm brushed cotton flannel in bold checks. Soft from the first wear and warm enough for a mid-layer.",
      img: ["a red and black checked cotton flannel shirt", "brushed cotton flannel check fabric texture", "wearing a red check flannel shirt over a plain tee"],
    },
    {
      id: "ap-34", category: "apparel", type: "Shirts",
      name: "Leather Shirt Jacket", nameAr: "جاكيت قميص جلد طبيعي",
      price: 2350, oldPrice: 2800, rating: 4.7, reviewCount: 63, badge: "",
      colour: "Black", material: "Soft lambskin",
      desc: "A clean leather shirt jacket with large chest pockets. Simple, structured and softened by wear.",
      img: ["a black leather shirt jacket with large chest pockets", "soft black lambskin leather and shirt pocket stitching", "wearing a black leather shirt jacket over a knit"],
    },
    {
      id: "ap-35", category: "apparel", type: "Shirts",
      name: "Corduroy Button-Down Shirt", nameAr: "قميص مخمل مضلع كاجوال",
      price: 990, oldPrice: 1190, rating: 4.7, reviewCount: 147, badge: "",
      colour: "Mustard / Brown", material: "Soft cotton corduroy",
      desc: "A casual corduroy button-down that works best as a middle layer under a coat or gilet.",
      img: ["a mustard brown corduroy button down shirt", "cotton corduroy wale fabric and button placket", "wearing a brown corduroy button down shirt under a coat"],
    },
    {
      id: "ap-36", category: "apparel", type: "Shirts",
      name: "Street Art Graphic Shirt", nameAr: "قميص بطبعات غرافيكية",
      price: 850, oldPrice: 1050, rating: 4.5, reviewCount: 92, badge: "",
      colour: "Cream / Multi", material: "Mid-weight cotton poplin",
      desc: "A cotton shirt printed with street-art graphics. Youthful, modern and made to be seen.",
      img: ["a cream cotton shirt printed with street art graphics", "printed street art graphic detail on cotton shirt fabric", "wearing a street art graphic print shirt"],
    },
    {
      id: "ap-37", category: "apparel", type: "Shirts",
      name: "Padded Tweed Shirt Jacket", nameAr: "جاكيت قميص تويد مبطن",
      price: 1980, oldPrice: 2350, rating: 4.7, reviewCount: 58, badge: "",
      colour: "Olive Herringbone", material: "Quilted tweed",
      desc: "A classic padded tweed shirt jacket with a distinctly British feel. Lightly quilted for warmth without weight.",
      img: ["an olive herringbone tweed padded shirt jacket", "olive tweed cloth with quilted padding detail", "wearing a padded olive tweed shirt jacket"],
    },
    {
      id: "ap-38", category: "apparel", type: "Shirts",
      name: "Wide-Collar Satin Shirt", nameAr: "قميص ساتان بياقة واسعة",
      price: 1150, oldPrice: 1380, rating: 4.5, reviewCount: 47, badge: "",
      colour: "Black / Ivory", material: "Smooth satin",
      desc: "A satin shirt with a wide collar, cut for evening and for layering beneath a blazer.",
      img: ["a black satin shirt with a wide collar", "black satin fabric with a wide collar detail", "wearing a black wide collar satin shirt under a blazer"],
    },
    {
      id: "ap-39", category: "apparel", type: "Shirts",
      name: "Patchwork Denim Shirt", nameAr: "قميص دينيم باتشورك",
      price: 1290, oldPrice: 1550, rating: 4.6, reviewCount: 55, badge: "",
      colour: "Two-Tone Denim", material: "Panel-stitched denim",
      desc: "Two different denims, one shirt. A patchwork construction that adds character to a simple layer.",
      img: ["a two tone patchwork denim shirt", "contrasting denim panels and stitching on a shirt", "wearing a two tone patchwork denim shirt"],
    },
    {
      id: "ap-40", category: "apparel", type: "Shirts",
      name: "Heritage Check Shirt", nameAr: "قميص كاروهات كلاسيكي",
      price: 950, oldPrice: 1150, rating: 4.7, reviewCount: 138, badge: "",
      colour: "Green / Navy Check", material: "Heavyweight cotton",
      desc: "A heavyweight cotton shirt in a classic heritage check. Durable cloth, traditional pattern, everyday wear.",
      img: ["a green and navy heritage check cotton shirt", "heavyweight cotton heritage check fabric", "wearing a green heritage check shirt with jeans"],
    },

    /* ================= 5. Hoodies & Blazers — 10 pieces ================= */
    {
      id: "ap-41", category: "apparel", type: "Hoodies",
      name: "350 GSM Heavyweight Boxy Hoodie", nameAr: "هودي قطني ثقيل بقصة واسعة",
      price: 1250, oldPrice: 1490, rating: 4.9, reviewCount: 231, badge: "Bestseller",
      colour: "Charcoal / Ecru", material: "350+ GSM loopback cotton",
      desc: "A 350+ GSM cotton hoodie in a boxy cut with no drawcords. Dense, structured and warm.",
      img: ["a charcoal grey 350 gsm heavyweight boxy hoodie", "heavyweight loopback cotton fabric and boxy hoodie hem", "wearing a heavyweight charcoal boxy hoodie"],
    },
    {
      id: "ap-42", category: "apparel", type: "Hoodies",
      name: "Burgundy Velvet Blazer", nameAr: "بليزر مخمل أحمر نبيذي",
      price: 2950, oldPrice: 3450, rating: 4.7, reviewCount: 52, badge: "",
      colour: "Burgundy", material: "Cotton velvet",
      desc: "A velvet blazer in rich burgundy. Made for winter occasions when a plain suit will not do.",
      img: ["a burgundy velvet blazer with wide lapels", "burgundy cotton velvet fabric and lapel detail", "wearing a burgundy velvet blazer over a black shirt"],
    },
    {
      id: "ap-43", category: "apparel", type: "Hoodies",
      name: "Minimalist Full-Zip Hoodie", nameAr: "هودي بسحاب كامل",
      price: 1490, oldPrice: 1790, rating: 4.8, reviewCount: 164, badge: "",
      colour: "Stone Grey", material: "Premium cotton blend",
      desc: "A full-zip hoodie kept deliberately plain, in a high-quality cotton blend. The quietest hoodie in the collection.",
      img: ["a stone grey minimalist full zip hoodie", "stone grey cotton blend fabric and metal zip", "wearing a plain grey full zip hoodie"],
    },
    {
      id: "ap-44", category: "apparel", type: "Hoodies",
      name: "Double-Breasted Wool Blazer", nameAr: "بليزر صوف مزدوج الصدر",
      price: 3250, oldPrice: 3800, rating: 4.8, reviewCount: 71, badge: "Tailored",
      colour: "Charcoal", material: "Wool flannel",
      desc: "A wool blazer with a double-breasted front and a broad shoulder. Formal, structured and warm enough for winter.",
      img: ["a charcoal double breasted wool flannel blazer", "charcoal wool flannel cloth and blazer button detail", "wearing a double breasted charcoal wool blazer"],
    },
    {
      id: "ap-45", category: "apparel", type: "Hoodies",
      name: "Clean Graphic Sweatshirt", nameAr: "سويت شيرت بشعار صغير",
      price: 990, oldPrice: 1190, rating: 4.6, reviewCount: 152, badge: "",
      colour: "Heather Grey", material: "Loopback cotton",
      desc: "A neutral sweatshirt with a small graphic detail. Easy to style and easy to wear.",
      img: ["a heather grey crewneck sweatshirt with a small graphic print", "heather grey loopback cotton and small print detail", "wearing a heather grey graphic sweatshirt"],
    },
    {
      id: "ap-46", category: "apparel", type: "Hoodies",
      name: "Structured Denim Blazer", nameAr: "بليزر جينز منسق",
      price: 2450, oldPrice: 2900, rating: 4.6, reviewCount: 49, badge: "",
      colour: "Indigo Denim", material: "Structured cotton denim",
      desc: "A denim blazer with real structure — somewhere between smart and casual, and useful in both.",
      img: ["a structured indigo denim blazer with lapels", "structured indigo denim fabric and blazer lapel stitching", "wearing a structured denim blazer over a white shirt"],
    },
    {
      id: "ap-47", category: "apparel", type: "Hoodies",
      name: "Back-Graphic Oversized Hoodie", nameAr: "هودي برسم فني على الظهر",
      price: 1390, oldPrice: 1650, rating: 4.7, reviewCount: 126, badge: "",
      colour: "Black", material: "Heavyweight cotton",
      desc: "An oversized hoodie with a bold graphic across the back. Streetwear proportions with heavyweight cotton.",
      img: ["an oversized black hoodie with a bold back graphic print", "large graphic print on heavyweight black hoodie cotton", "wearing an oversized black back graphic hoodie"],
    },
    {
      id: "ap-48", category: "apparel", type: "Hoodies",
      name: "Puffer Gilet (Sleeveless)", nameAr: "سترة بافر بدون أكمام",
      price: 1890, oldPrice: 2200, rating: 4.7, reviewCount: 87, badge: "",
      colour: "Olive / Black", material: "Quilted synthetic fill",
      desc: "A short padded gilet in the style of a puffer jacket, made to be worn over sweaters.",
      img: ["an olive sleeveless quilted puffer gilet", "quilted olive puffer gilet panels and zip detail", "wearing an olive puffer gilet over a knit sweater"],
    },
    {
      id: "ap-49", category: "apparel", type: "Hoodies",
      name: "Tweed Blazer with Elbow Patches", nameAr: "بليزر تويد برقع على الأكواع",
      price: 2850, oldPrice: 3300, rating: 4.8, reviewCount: 64, badge: "",
      colour: "Brown Tweed", material: "Wool tweed",
      desc: "A tweed blazer with elbow patches and a classic academic feel. Heritage cloth, modern shoulder.",
      img: ["a brown tweed blazer with suede elbow patches", "brown wool tweed cloth and suede elbow patch detail", "wearing a brown tweed blazer with elbow patches"],
    },
    {
      id: "ap-50", category: "apparel", type: "Hoodies",
      name: "Technical Hybrid Hoodie", nameAr: "هودي بأقمشة تقنية",
      price: 1690, oldPrice: 1990, rating: 4.7, reviewCount: 93, badge: "",
      colour: "Black / Grey", material: "Cotton and resistant nylon panels",
      desc: "A hybrid hoodie that mixes cotton with weather-resistant nylon panels. Comfort of a hoodie, protection of a shell.",
      img: ["a black technical hybrid hoodie with nylon panels", "cotton and ripstop nylon panel seam detail on a hoodie", "wearing a black technical hybrid hoodie"],
    },

    /* ================= 6. Boots — 10 pairs ================= */
    {
      id: "fw-01", category: "footwear", type: "Boots",
      name: "Chunky Sole Chelsea Boot", nameAr: "تشيلسي بوت بنعل سميك",
      price: 2650, oldPrice: 3100, rating: 4.8, reviewCount: 141, badge: "Bestseller",
      colour: "Black Leather", material: "Polished full-grain leather",
      desc: "A laceless leather Chelsea boot with a wide, chunky rubber sole. Clean upper, heavy base.",
      img: ["a black chunky sole leather chelsea boot in side profile", "black leather chelsea boot elastic gore and chunky rubber sole", "wearing black chunky sole chelsea boots with dark trousers"],
    },
    {
      id: "fw-02", category: "footwear", type: "Boots",
      name: "Golden Nubuck 6-Inch Premium Boot", nameAr: "بوت 6 بوصة جلد نوبوك ذهبي",
      price: 4200, oldPrice: 4900, rating: 4.9, reviewCount: 187, badge: "Bestseller",
      colour: "Golden Wheat", material: "Waterproof nubuck leather",
      desc: "The classic six-inch boot in golden nubuck with a padded collar and a waterproof membrane. Warm, grippy and built for winter.",
      img: ["a golden wheat nubuck six inch premium boot in side profile", "golden nubuck leather boot stitching and padded collar", "wearing golden nubuck six inch boots with rolled denim"],
    },
    {
      id: "fw-03", category: "footwear", type: "Boots",
      name: "8-Eyelet Smooth Leather Boot", nameAr: "بوت جلد أسود بـ 8 عيون",
      price: 3850, oldPrice: 4500, rating: 4.8, reviewCount: 129, badge: "",
      colour: "Black", material: "Smooth polished leather",
      desc: "An eight-eyelet smooth leather boot with visible welt stitching and an edge all of its own.",
      img: ["a black eight eyelet smooth leather lace up boot", "black leather boot welt stitching and eyelet hardware", "wearing black eight eyelet leather boots with jeans"],
    },
    {
      id: "fw-04", category: "footwear", type: "Boots",
      name: "Dark Brown Suede Chukka Boot", nameAr: "شوكا بوت شامواه بني داكن",
      price: 2350, oldPrice: 2800, rating: 4.7, reviewCount: 96, badge: "",
      colour: "Dark Brown", material: "Dark brown suede",
      desc: "A mid-height chukka in dark brown suede with soft lacing and a smart-casual finish.",
      img: ["a dark brown suede chukka boot in side profile", "dark brown suede texture and chukka boot stitching", "wearing dark brown suede chukka boots with wool trousers"],
    },
    {
      id: "fw-05", category: "footwear", type: "Boots",
      name: "Alpine Heritage Hiking Boot", nameAr: "بوت مشي بطابع جبال الألب",
      price: 3450, oldPrice: 4000, rating: 4.8, reviewCount: 108, badge: "",
      colour: "Brown / Olive", material: "Treated leather, metal speed hooks",
      desc: "A hiking boot with metal speed hooks and a lugged rubber outsole for stability on cold, uneven ground.",
      img: ["a brown and olive alpine heritage hiking boot in side profile", "aggressive lug outsole tread and metal speed hooks on a hiking boot", "wearing alpine hiking boots on a cold stone trail"],
    },
    {
      id: "fw-06", category: "footwear", type: "Boots",
      name: "Speed-Hook Apron Toe Boot", nameAr: "بوت جلد بخياطة أمامية وخطافات سريعة",
      price: 2950, oldPrice: 3400, rating: 4.7, reviewCount: 73, badge: "",
      colour: "Tan Leather", material: "Full-grain cowhide",
      desc: "A full-grain leather boot with a prominent apron-toe stitch and speed hooks for quick lacing.",
      img: ["a tan leather apron toe boot with speed hooks in side profile", "apron toe stitching on tan full grain leather boot", "wearing tan leather apron toe boots with dark jeans"],
    },
    {
      id: "fw-07", category: "footwear", type: "Boots",
      name: "Earth-Tone Suede Chelsea Boot", nameAr: "تشيلسي بوت شامواه بدرجات أرضية",
      price: 2450, oldPrice: 2900, rating: 4.7, reviewCount: 88, badge: "",
      colour: "Olive / Brown Suede", material: "Water-resistant suede",
      desc: "A refined suede Chelsea boot in earthy olive and brown, styled for denim and wool trousers.",
      img: ["an olive suede chelsea boot in side profile", "olive suede texture and chelsea boot elastic gore", "wearing olive suede chelsea boots with slim dark trousers"],
    },
    {
      id: "fw-08", category: "footwear", type: "Boots",
      name: "Waterproof Duck Boot", nameAr: "بوت مطاطي مقاوم للماء والثلج",
      price: 3200, oldPrice: 3700, rating: 4.8, reviewCount: 102, badge: "Waterproof",
      colour: "Brown / Tan Rubber", material: "Full rubber lower, leather upper",
      desc: "A full rubber lower with a leather upper, built to handle rain, mud and snow without complaint.",
      img: ["a brown and tan waterproof duck boot with a rubber lower", "full rubber shell and leather duck boot upper detail", "wearing duck boots standing in wet winter mud"],
    },
    {
      id: "fw-09", category: "footwear", type: "Boots",
      name: "Lug-Sole Derby Boot", nameAr: "ديربي بوت بنعل ضخم",
      price: 2750, oldPrice: 3200, rating: 4.7, reviewCount: 81, badge: "",
      colour: "Black Leather", material: "Polished leather",
      desc: "A high derby boot on a wide, slip-resistant lug sole. Formal upper, working sole.",
      img: ["a black leather derby boot with a thick lug sole in side profile", "wide lug rubber sole on a black leather derby boot", "wearing black lug sole derby boots with tailored trousers"],
    },
    {
      id: "fw-10", category: "footwear", type: "Boots",
      name: "Shearling-Lined Winter Boot", nameAr: "بوت جلد ببطانة صوف شيرلينغ",
      price: 3950, oldPrice: 4600, rating: 4.9, reviewCount: 117, badge: "Cold Rated",
      colour: "Dark Brown", material: "Full-grain leather, shearling lining",
      desc: "A full-grain leather boot lined entirely in shearling for very cold weather. The warmest pair in the collection.",
      img: ["a dark brown shearling lined leather winter boot in side profile", "thick shearling wool lining inside a brown leather boot", "wearing brown shearling lined winter boots in snow"],
    },

    /* ================= 7. Sneakers & Casual — 10 pairs ================= */
    {
      id: "fw-11", category: "footwear", type: "Sneakers",
      name: "Waterproof High-Top Winter Sneaker", nameAr: "سنيكرز رقبة عالية مقاوم للماء",
      price: 3150, oldPrice: 3650, rating: 4.8, reviewCount: 124, badge: "Waterproof",
      colour: "Black / Grey", material: "Treated textile and suede",
      desc: "A high-top sneaker with a waterproof membrane and warm lining. Athletic comfort with real winter protection.",
      img: ["a black high top waterproof winter sneaker in side profile", "waterproof membrane seam and suede panel on a high top sneaker", "wearing black high top winter sneakers with cuffed trousers"],
    },
    {
      id: "fw-12", category: "footwear", type: "Sneakers",
      name: "Chunky Retro Runner", nameAr: "حذاء رياضي بنعل سميك بطابع التسعينيات",
      price: 2350, oldPrice: 2750, rating: 4.7, reviewCount: 158, badge: "Trend",
      colour: "Off-White / Grey", material: "Suede and mesh panels",
      desc: "A chunky runner in a soft off-white, straight out of the nineties. Cushioned, comfortable and easy to style.",
      img: ["an off white chunky retro runner sneaker in side profile", "layered suede and mesh panels on a chunky retro sneaker", "wearing off white chunky retro runner sneakers"],
    },
    {
      id: "fw-13", category: "footwear", type: "Sneakers",
      name: "Technical Trail Sneaker", nameAr: "سنيكيرز تقني عالي الأداء",
      price: 3450, oldPrice: 4000, rating: 4.9, reviewCount: 139, badge: "New",
      colour: "Grey / Lime", material: "Technical mesh, quick-lace system",
      desc: "A technical trail sneaker built for performance in bad weather. Trend-led design with genuinely capable hardware.",
      img: ["a grey technical trail sneaker with quick lacing in side profile", "technical mesh upper and quick lace system detail", "wearing grey technical trail sneakers in cold conditions"],
    },
    {
      id: "fw-14", category: "footwear", type: "Sneakers",
      name: "Earthy Suede Low Sneaker", nameAr: "سنيكيرز شامواه بدرجات بنية",
      price: 1950, oldPrice: 2300, rating: 4.6, reviewCount: 87, badge: "",
      colour: "Sand / Brown Suede", material: "Warm-tone suede",
      desc: "A low suede sneaker in warm earthy tones. Comfortable from the first wear.",
      img: ["a sand and brown suede low top sneaker in side profile", "warm brown suede texture on a low top sneaker", "wearing sand suede low sneakers with dark denim"],
    },
    {
      id: "fw-15", category: "footwear", type: "Sneakers",
      name: "Quilted Puffer Slip-On", nameAr: "حذاء مبطن سهل الارتداء",
      price: 1750, oldPrice: 2050, rating: 4.6, reviewCount: 76, badge: "New",
      colour: "Black", material: "Quilted insulated textile",
      desc: "A padded slip-on shoe in the style of a puffer jacket. The easiest pair to put on and one of the warmest.",
      img: ["a black quilted puffer slip on shoe in side profile", "quilted insulated textile and elastic slip on detail", "wearing black quilted puffer slip on shoes"],
    },
    {
      id: "fw-16", category: "footwear", type: "Sneakers",
      name: "Lug-Sole Derby Shoe", nameAr: "حذاء ديربي بنعل مطاطي عريض",
      price: 2250, oldPrice: 2650, rating: 4.7, reviewCount: 69, badge: "",
      colour: "Dark Brown", material: "Polished leather",
      desc: "A formal derby rebuilt on a chunky casual sole. Smart upper, relaxed base.",
      img: ["a dark brown leather derby shoe with a chunky lug sole", "wide lug rubber sole on a brown polished leather derby shoe", "wearing brown lug sole derby shoes with chinos"],
    },
    {
      id: "fw-17", category: "footwear", type: "Sneakers",
      name: "Shearling-Lined Leather Loafer", nameAr: "لوفر جلد ببطانة صوفية",
      price: 2650, oldPrice: 3100, rating: 4.8, reviewCount: 94, badge: "",
      colour: "Brown Leather", material: "Leather shell, shearling lining",
      desc: "A leather loafer with a shearling lining. Luxury, warmth and comfort in one.",
      img: ["a brown leather loafer with a shearling lining in side profile", "shearling fur lining inside a brown leather loafer", "wearing brown shearling lined leather loafers"],
    },
    {
      id: "fw-18", category: "footwear", type: "Sneakers",
      name: "All-Black Leather Sneaker", nameAr: "سنيكرز جلد أسود بالكامل",
      price: 2150, oldPrice: 2500, rating: 4.7, reviewCount: 132, badge: "",
      colour: "All Black", material: "Cleanable smooth leather",
      desc: "An all-black leather sneaker that goes with everything and wipes clean in seconds.",
      img: ["an all black leather low top sneaker in side profile", "smooth black leather sneaker upper and stitched sole", "wearing all black leather sneakers with dark trousers"],
    },
    {
      id: "fw-19", category: "footwear", type: "Sneakers",
      name: "Max-Cushion Casual Runner", nameAr: "حذاء كاجوال بنعل ممتص للصدمات",
      price: 3250, oldPrice: 3800, rating: 4.8, reviewCount: 111, badge: "",
      colour: "Grey / Cream", material: "Cushioned foam, knit upper",
      desc: "A heavily cushioned casual runner with a thick, shock-absorbing sole. Comfort above all.",
      img: ["a grey max cushion casual runner sneaker in side profile", "thick shock absorbing foam sole and knit upper detail", "wearing grey max cushion running shoes casually"],
    },
    {
      id: "fw-20", category: "footwear", type: "Sneakers",
      name: "Weatherproof Canvas Sneaker", nameAr: "حذاء قماش مقاوم للبقع",
      price: 1550, oldPrice: 1850, rating: 4.6, reviewCount: 143, badge: "",
      colour: "Black / Off-White", material: "Treated canvas",
      desc: "A treated canvas sneaker that resists stains and light rain. The everyday casual pair.",
      img: ["a black weatherproof canvas sneaker in side profile", "treated canvas fabric and rubber toe cap on a sneaker", "wearing black canvas sneakers with rolled jeans"],
    },
  ];

  /* Adds sizes, images and the spec table to every catalogue entry. */
  const decorate = (item) => ({
    ...item,
    sizes: item.category === "footwear" ? SHOE_SIZES : APPAREL_SIZES,
    images: images(item.img[0], item.img[1], item.img[2]),
    specs: (SPECS_BY_TYPE[item.type] || []).concat([
      ["Material", item.material],
      ["Colourway", item.colour],
    ]),
  });

  const PRODUCTS = CATALOGUE.map(decorate);

  const getProduct = (id) => PRODUCTS.find((p) => p.id === id);

  /* ------------------------------------------------------------------
     4. Storage layer (safe-guarded for private browsing)
     ------------------------------------------------------------------ */
  const storage = {
    read(key, fallback) {
      try {
        const raw = window.localStorage.getItem(key);
        return raw ? JSON.parse(raw) : fallback;
      } catch (error) {
        return fallback;
      }
    },
    write(key, value) {
      try {
        window.localStorage.setItem(key, JSON.stringify(value));
      } catch (error) {
        /* storage unavailable — keep in-memory only */
      }
    },
  };

  let cart = storage.read(CART_KEY, []);
  const saveCart = () => storage.write(CART_KEY, cart);

  const cartCount = () => cart.reduce((sum, item) => sum + item.qty, 0);
  const cartSubtotal = () =>
    cart.reduce((sum, item) => {
      const product = getProduct(item.id);
      return product ? sum + product.price * item.qty : sum;
    }, 0);

  /* ------------------------------------------------------------------
     5. Toasts
     ------------------------------------------------------------------ */
  function toast(message, variant = "success") {
    let wrap = $(".toast-wrap");
    if (!wrap) {
      wrap = document.createElement("div");
      wrap.className = "toast-wrap";
      document.body.appendChild(wrap);
    }
    const el = document.createElement("div");
    el.className = "toast toast--" + variant;
    el.setAttribute("role", "status");
    el.textContent = message;
    wrap.appendChild(el);
    window.setTimeout(() => {
      el.style.transition = "opacity .3s ease, transform .3s ease";
      el.style.opacity = "0";
      el.style.transform = "translateY(10px)";
      window.setTimeout(() => el.remove(), 320);
    }, 2600);
  }

  /* ------------------------------------------------------------------
     6. Header: mobile nav + cart badge
     ------------------------------------------------------------------ */
  function initHeader() {
    const toggle = $(".nav-toggle");
    const nav = $(".nav");

    if (toggle && nav) {
      toggle.addEventListener("click", () => {
        const open = nav.classList.toggle("is-open");
        toggle.classList.toggle("is-open", open);
        toggle.setAttribute("aria-expanded", String(open));
      });

      nav.addEventListener("click", (event) => {
        if (event.target.closest(".nav__link")) {
          nav.classList.remove("is-open");
          toggle.classList.remove("is-open");
          toggle.setAttribute("aria-expanded", "false");
        }
      });
    }

    $$("[data-year]").forEach((node) => {
      node.textContent = new Date().getFullYear();
    });

    refreshCartBadge();
  }

  function refreshCartBadge() {
    const count = cartCount();
    $$("[data-cart-count]").forEach((node) => {
      node.textContent = count;
      node.hidden = count === 0;
    });
  }

  /* ------------------------------------------------------------------
     7. Product grid rendering
     ------------------------------------------------------------------ */
  function productCard(product) {
    const card = document.createElement("article");
    card.className = "card";
    card.tabIndex = 0;
    card.setAttribute("role", "button");
    card.setAttribute("aria-label", `View details for ${product.name}`);
    card.dataset.id = product.id;

    const badgeClass = ["Bestseller", "New", "Trend"].includes(product.badge)
      ? "card__badge card__badge--olive"
      : "card__badge";

    card.innerHTML = `
      <div class="card__media">
        ${product.badge ? `<span class="${badgeClass}">${product.badge}</span>` : ""}
        <img src="${product.images[0]}" alt="${product.name}" loading="lazy" decoding="async">
        <div class="card__overlay"><span class="card__quick">View Details</span></div>
      </div>
      <div class="card__body">
        <div class="card__meta">
          <span>${product.type}</span>
          <span class="card__rating">&#9733; ${product.rating.toFixed(1)}</span>
        </div>
        <h3 class="card__title">${product.name}</h3>
        <p class="card__name-ar" lang="ar" dir="rtl">${product.nameAr}</p>
        <p class="card__desc">${product.desc}</p>
        <div class="price">
          <span class="price__now">${money(product.price)}</span>
          ${product.oldPrice ? `<span class="price__was">${money(product.oldPrice)}</span>` : ""}
        </div>
        <div class="card__footer">
          <div class="card__sizes">
            <span class="size-tag">${product.sizes[0]}</span>
            <span class="size-tag">${product.sizes[product.sizes.length - 1]}</span>
            <span class="size-tag">${product.sizes.length} sizes</span>
          </div>
        </div>
      </div>
    `;

    const open = () => openProductModal(product.id);
    card.addEventListener("click", open);
    card.addEventListener("keydown", (event) => {
      if (event.key === "Enter" || event.key === " ") {
        event.preventDefault();
        open();
      }
    });

    return card;
  }

  function initShop() {
    const grid = $("[data-product-grid]");
    if (!grid) return;

    const category = grid.dataset.productGrid; // "apparel" | "footwear"
    const catalogue = PRODUCTS.filter((p) => p.category === category);
    const countNode = $("[data-result-count]");
    const sortSelect = $("[data-sort]");
    const chipRow = $("[data-filters]");

    let activeFilter = "All";

    function render() {
      const chip = chipRow ? chipRow.querySelector(".chip.is-active") : null;
      activeFilter = chip ? chip.dataset.filter : "All";

      let list = catalogue.filter(
        (p) => activeFilter === "All" || p.type === activeFilter
      );

      const sort = sortSelect ? sortSelect.value : "featured";
      if (sort === "price-asc") list = list.slice().sort((a, b) => a.price - b.price);
      if (sort === "price-desc") list = list.slice().sort((a, b) => b.price - a.price);
      if (sort === "rating") list = list.slice().sort((a, b) => b.rating - a.rating);

      grid.innerHTML = "";
      list.forEach((product) => grid.appendChild(productCard(product)));

      if (countNode) {
        countNode.innerHTML = `Showing <strong>${list.length}</strong> of ${catalogue.length} pieces`;
      }
    }

    if (chipRow) {
      chipRow.addEventListener("click", (event) => {
        const chip = event.target.closest(".chip");
        if (!chip) return;
        chipRow.querySelectorAll(".chip").forEach((c) => c.classList.remove("is-active"));
        chip.classList.add("is-active");
        render();
      });
    }

    if (sortSelect) sortSelect.addEventListener("change", render);

    render();
  }

  /* ------------------------------------------------------------------
     8. Product modal
     ------------------------------------------------------------------ */
  let modalState = { product: null, size: null, qty: 1, index: 0 };

  function openProductModal(id) {
    const product = getProduct(id);
    if (!product) return;

    modalState = { product, size: null, qty: 1, index: 0 };

    let modal = $("[data-product-modal]");
    if (!modal) {
      modal = buildModal();
      document.body.appendChild(modal);
    }

    renderModal();
    modal.classList.add("is-open");
    modal.setAttribute("aria-hidden", "false");
    document.body.classList.add("no-scroll");
    const closeBtn = $(".modal__close", modal);
    if (closeBtn) closeBtn.focus();
  }

  function buildModal() {
    const modal = document.createElement("div");
    modal.className = "modal";
    modal.dataset.productModal = "";
    modal.setAttribute("role", "dialog");
    modal.setAttribute("aria-modal", "true");
    modal.setAttribute("aria-hidden", "true");
    modal.innerHTML = `
      <div class="modal__dialog">
        <button class="modal__close" type="button" aria-label="Close product details">&times;</button>
        <div class="modal__layout">
          <div class="gallery">
            <div class="gallery__main"><img data-gallery-main src="" alt=""></div>
            <div class="gallery__thumbs" data-gallery-thumbs></div>
          </div>
          <div class="modal__info" data-modal-info></div>
        </div>
      </div>
    `;

    modal.addEventListener("click", (event) => {
      if (event.target === modal) closeProductModal();
    });
    $(".modal__close", modal).addEventListener("click", closeProductModal);

    return modal;
  }

  function renderModal() {
    const modal = $("[data-product-modal]");
    const { product, index, qty } = modalState;
    if (!modal || !product) return;

    const mainImg = $("[data-gallery-main]", modal);
    mainImg.src = product.images[index];
    mainImg.alt = product.name;

    const thumbs = $("[data-gallery-thumbs]", modal);
    thumbs.innerHTML = "";
    product.images.forEach((src, i) => {
      const btn = document.createElement("button");
      btn.type = "button";
      btn.className = "gallery__thumb" + (i === index ? " is-active" : "");
      btn.setAttribute("aria-label", `View image ${i + 1}`);
      btn.innerHTML = `<img src="${src}" alt="${product.name} view ${i + 1}" loading="lazy">`;
      btn.addEventListener("click", () => {
        modalState.index = i;
        renderModal();
      });
      thumbs.appendChild(btn);
    });

    const isApparel = product.category === "apparel";
    const sizeLabel = isApparel ? "Select Size (M – 5XL)" : "Select Size (EU)";
    const sizeHint = isApparel ? "" : '<p class="field__hint">European sizing — true to size.</p>';

    const info = $("[data-modal-info]", modal);
    info.innerHTML = `
      <div class="card__meta">
        <span>${product.type}</span>
        <span class="card__rating">&#9733; ${product.rating.toFixed(1)} · ${product.reviewCount} reviews</span>
      </div>
      <h3>${product.name}</h3>
      <p class="modal__name-ar" lang="ar" dir="rtl">${product.nameAr}</p>
      <div class="modal__price">
        <span class="price__now">${money(product.price)}</span>
        ${product.oldPrice ? `<span class="price__was">${money(product.oldPrice)}</span>` : ""}
        ${product.oldPrice ? `<span class="size-tag">Save ${money(product.oldPrice - product.price)}</span>` : ""}
      </div>
      <p class="modal__desc">${product.desc}</p>
      <ul class="spec-list">
        ${product.specs.map(([k, v]) => `<li><span>${k}</span><span>${v}</span></li>`).join("")}
      </ul>
      <div class="option-group">
        <div class="option-group__label">
          <span>${sizeLabel}</span>
          <button type="button" data-size-guide>Size guide</button>
        </div>
        <div class="size-picker" data-size-picker>
          ${product.sizes
            .map(
              (size) =>
                `<button type="button" class="size-pill${
                  modalState.size === size ? " is-active" : ""
                }" data-size="${size}">${size}</button>`
            )
            .join("")}
        </div>
        ${sizeHint}
      </div>
      <div class="option-group">
        <div class="option-group__label"><span>Quantity</span></div>
        <div class="qty">
          <button type="button" data-qty-down aria-label="Decrease quantity">&minus;</button>
          <span class="qty__value" data-qty-value>${qty}</span>
          <button type="button" data-qty-up aria-label="Increase quantity">+</button>
        </div>
      </div>
      <div class="modal__actions">
        <button type="button" class="btn" data-add-to-order>Add to Order</button>
        <a class="btn btn--ghost" href="checkout.html">Go to Checkout</a>
      </div>
      <p class="modal__note">Deposit of ${money(STORE.deposit)} via Instapay / Vodafone Cash confirms every order.</p>
    `;

    info.querySelectorAll("[data-size]").forEach((btn) => {
      btn.addEventListener("click", () => {
        modalState.size = btn.dataset.size;
        renderModal();
      });
    });

    $("[data-qty-up]", info).addEventListener("click", () => {
      modalState.qty = Math.min(modalState.qty + 1, 20);
      renderModal();
    });

    $("[data-qty-down]", info).addEventListener("click", () => {
      modalState.qty = Math.max(modalState.qty - 1, 1);
      renderModal();
    });

    $("[data-add-to-order]", info).addEventListener("click", () => {
      if (!modalState.size) {
        toast("Please select a size before adding to your order.", "error");
        return;
      }
      addToCart(product.id, modalState.size, modalState.qty);
    });

    $("[data-size-guide]", info).addEventListener("click", () => {
      toast(
        isApparel
          ? "Apparel runs true to size — size up for a relaxed fit."
          : "Footwear follows standard EU sizing — half sizes should size up."
      );
    });
  }

  function closeProductModal() {
    const modal = $("[data-product-modal]");
    if (!modal) return;
    modal.classList.remove("is-open");
    modal.setAttribute("aria-hidden", "true");
    document.body.classList.remove("no-scroll");
  }

  function initModalKeys() {
    document.addEventListener("keydown", (event) => {
      if (event.key === "Escape") {
        closeProductModal();
        closeDrawer();
      }
    });
  }

  /* ------------------------------------------------------------------
     9. Cart operations
     ------------------------------------------------------------------ */
  function addToCart(id, size, qty) {
    const existing = cart.find((item) => item.id === id && item.size === size);
    if (existing) {
      existing.qty += qty;
    } else {
      cart.push({ id, size, qty });
    }
    saveCart();
    refreshCartBadge();
    renderDrawer();
    renderCheckoutSummary();
    toast("Added to your order — review it at checkout.");
  }

  function removeFromCart(index) {
    cart.splice(index, 1);
    saveCart();
    refreshCartBadge();
    renderDrawer();
    renderCheckoutSummary();
    toast("Item removed from your order.");
  }

  /* ------------------------------------------------------------------
     10. Cart drawer
     ------------------------------------------------------------------ */
  function buildDrawer() {
    const overlay = document.createElement("div");
    overlay.className = "overlay";
    overlay.dataset.overlay = "";
    overlay.addEventListener("click", closeDrawer);

    const drawer = document.createElement("aside");
    drawer.className = "drawer";
    drawer.dataset.drawer = "";
    drawer.setAttribute("aria-hidden", "true");
    drawer.setAttribute("aria-label", "Your order");
    drawer.innerHTML = `
      <div class="drawer__head">
        <h3>Your Order</h3>
        <button class="icon-btn" type="button" data-drawer-close aria-label="Close order panel">&times;</button>
      </div>
      <div class="drawer__body" data-drawer-body></div>
      <div class="drawer__foot" data-drawer-foot></div>
    `;

    document.body.appendChild(overlay);
    document.body.appendChild(drawer);
    $("[data-drawer-close]", drawer).addEventListener("click", closeDrawer);
    return drawer;
  }

  function openDrawer() {
    let drawer = $("[data-drawer]");
    if (!drawer) drawer = buildDrawer();
    renderDrawer();
    drawer.classList.add("is-open");
    drawer.setAttribute("aria-hidden", "false");
    $("[data-overlay]").classList.add("is-open");
  }

  function closeDrawer() {
    const drawer = $("[data-drawer]");
    const overlay = $("[data-overlay]");
    if (drawer) {
      drawer.classList.remove("is-open");
      drawer.setAttribute("aria-hidden", "true");
    }
    if (overlay) overlay.classList.remove("is-open");
  }

  function renderDrawer() {
    const drawer = $("[data-drawer]");
    if (!drawer) return;

    const body = $("[data-drawer-body]", drawer);
    const foot = $("[data-drawer-foot]", drawer);

    if (!cart.length) {
      body.innerHTML = `
        <div class="empty-state">
          <strong>Your order is empty</strong>
          Browse the winter collection and add the pieces you like.
        </div>`;
      foot.innerHTML = `
        <a class="btn btn--block" href="index.html">Shop Winter Apparel</a>
        <p class="modal__note" style="margin-top:12px;text-align:center">Or explore the <a href="footwear.html" style="color:var(--accent-soft)">winter footwear</a> range.</p>
      `;
      return;
    }

    body.innerHTML = cart
      .map((item, index) => {
        const product = getProduct(item.id);
        if (!product) return "";
        return `
          <article class="line-item">
            <div class="line-item__img"><img src="${product.images[0]}" alt="${product.name}" loading="lazy"></div>
            <div>
              <h4 class="line-item__title">${product.name}</h4>
              <p class="line-item__meta">Size ${item.size} · Qty ${item.qty}</p>
            </div>
            <div>
              <p class="line-item__price">${money(product.price * item.qty)}</p>
              <button class="line-item__remove" type="button" data-remove="${index}">Remove</button>
            </div>
          </article>`;
      })
      .join("");

    const subtotal = cartSubtotal();
    const balance = Math.max(subtotal - STORE.deposit, 0);

    foot.innerHTML = `
      <div class="totals">
        <div class="totals__row"><span>Items</span><span>${cartCount()}</span></div>
        <div class="totals__row"><span>Subtotal</span><span>${money(subtotal)}</span></div>
        <div class="totals__row totals__row--accent"><span>Deposit (Instapay / Vodafone Cash)</span><span>${money(STORE.deposit)}</span></div>
        <div class="totals__row totals__row--grand"><span>Balance on delivery</span><span>${money(balance)}</span></div>
      </div>
      <a class="btn btn--block" href="checkout.html">Proceed to Checkout</a>
    `;

    body.querySelectorAll("[data-remove]").forEach((btn) => {
      btn.addEventListener("click", () => removeFromCart(Number(btn.dataset.remove)));
    });
  }

  function initDrawerTriggers() {
    $$("[data-open-cart]").forEach((btn) => {
      btn.addEventListener("click", openDrawer);
    });
  }

  /* ------------------------------------------------------------------
     11. Checkout page
     ------------------------------------------------------------------ */
  function renderCheckoutSummary() {
    const mount = $("[data-checkout-summary]");
    if (!mount) return;

    if (!cart.length) {
      mount.innerHTML = `
        <div class="empty-state">
          <strong>No pieces selected yet</strong>
          Add items from the <a href="index.html" style="color:var(--accent-soft)">apparel</a> or
          <a href="footwear.html" style="color:var(--accent-soft)">footwear</a> collection to continue.
        </div>`;
      setSummaryTotals(0, 0);
      return;
    }

    mount.innerHTML = cart
      .map((item, index) => {
        const product = getProduct(item.id);
        if (!product) return "";
        return `
          <article class="line-item" style="border-bottom:1px solid var(--border)">
            <div class="line-item__img"><img src="${product.images[0]}" alt="${product.name}" loading="lazy"></div>
            <div>
              <h4 class="line-item__title">${product.name}</h4>
              <p class="line-item__meta">Size ${item.size} · Qty ${item.qty}</p>
            </div>
            <div>
              <p class="line-item__price">${money(product.price * item.qty)}</p>
              <button class="line-item__remove" type="button" data-remove="${index}">Remove</button>
            </div>
          </article>`;
      })
      .join("");

    mount.querySelectorAll("[data-remove]").forEach((btn) => {
      btn.addEventListener("click", () => removeFromCart(Number(btn.dataset.remove)));
    });

    setSummaryTotals(cartSubtotal(), cartCount());
  }

  function setSummaryTotals(subtotal, count) {
    const set = (selector, value) => {
      const node = $(selector);
      if (node) node.textContent = value;
    };
    set("[data-sum-items]", count);
    set("[data-sum-subtotal]", money(subtotal));
    set("[data-sum-deposit]", money(STORE.deposit));
    set("[data-sum-balance]", money(Math.max(subtotal - STORE.deposit, 0)));
  }

  function validateField(input) {
    const field = input.closest(".field");
    if (!field) return true;

    const value = input.value.trim();
    let valid = value.length > 0;

    if (valid && input.type === "tel") {
      valid = /^[0-9+\s-]{8,}$/.test(value);
    }
    if (valid && input.dataset.tripleName !== undefined) {
      // Require three separate name parts (الاسم الثلاثي)
      valid = value.split(/\s+/).filter(Boolean).length >= 3;
    }
    if (valid && input.type === "email") {
      valid = /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(value);
    }
    if (valid && input.dataset.address !== undefined) {
      valid = value.length >= 12;
    }

    field.classList.toggle("has-error", !valid);
    return valid;
  }

  function initCheckoutForm() {
    const form = $("[data-checkout-form]");
    if (!form) return;

    const inputs = $$("[data-required]", form);
    inputs.forEach((input) => {
      input.addEventListener("blur", () => validateField(input));
      input.addEventListener("input", () => {
        if (input.closest(".field").classList.contains("has-error")) validateField(input);
      });
    });

    form.addEventListener("submit", (event) => {
      event.preventDefault();

      const results = inputs.map((input) => validateField(input));
      const terms = $("[data-terms]", form);

      if (terms && !terms.checked) {
        toast("Please confirm the 90 EGP deposit rule to continue.", "error");
        terms.focus();
        return;
      }

      if (results.includes(false) || !cart.length) {
        if (!cart.length) {
          toast("Your order is empty — add a piece before checking out.", "error");
        } else {
          toast("Please complete the highlighted fields.", "error");
          const firstInvalid = form.querySelector(".field.has-error input, .field.has-error textarea");
          if (firstInvalid) firstInvalid.focus();
        }
        return;
      }

      const data = Object.fromEntries(new FormData(form).entries());
      const subtotal = cartSubtotal();
      const reference = "VX-" + Math.random().toString(36).slice(2, 8).toUpperCase();

      const box = $("[data-success]");
      if (box) {
        box.innerHTML = `
          <h3>Order received — reference ${reference}</h3>
          <p>Thank you, <strong>${data.fullName}</strong>. Your order for
          <strong>${cartCount()} item(s)</strong> totalling <strong>${money(subtotal)}</strong>
          has been recorded.</p>
          <p>Final step: send the <strong>${money(STORE.deposit)} deposit</strong> via
          <strong>${data.paymentMethod || "Instapay / Vodafone Cash"}</strong> to
          <strong>${STORE.phone}</strong>, then message us on
          <a href="mailto:${STORE.email}" style="color:var(--accent-soft)">${STORE.email}</a>
          quoting reference <strong>${reference}</strong>. Balance of
          <strong>${money(Math.max(subtotal - STORE.deposit, 0))}</strong> is due on delivery.</p>
        `;
        box.classList.add("is-visible");
        box.scrollIntoView({ behavior: "smooth", block: "center" });
      }

      toast("Order submitted — complete the deposit to confirm.", "success");

      cart = [];
      saveCart();
      refreshCartBadge();
      renderCheckoutSummary();
      form.reset();
    });
  }

  /* ------------------------------------------------------------------
     12. Reviews
     ------------------------------------------------------------------ */
  const SEED_REVIEWS = [
    {
      name: "Ahmed S.",
      rating: 5,
      text: "The parka arrived in three days and the quality is well above the price. Ordering with the deposit was simple and everything was confirmed on WhatsApp straight away.",
      date: "2026-02-14",
    },
    {
      name: "Karim M.",
      rating: 5,
      text: "Bought the Tundra boots for a trip up north. Completely waterproof and genuinely warm. Sizing guide was accurate.",
      date: "2026-01-28",
    },
    {
      name: "Youssef A.",
      rating: 4,
      text: "Great selection and the checkout page explained the deposit rule clearly. Delivery took a day longer than expected but the coat is excellent.",
      date: "2026-01-09",
    },
  ];

  let reviews = storage.read(REVIEW_KEY, null) || SEED_REVIEWS.slice();
  const saveReviews = () => storage.write(REVIEW_KEY, reviews);

  function reviewAverage() {
    if (!reviews.length) return 0;
    return reviews.reduce((sum, r) => sum + r.rating, 0) / reviews.length;
  }

  function formatDate(value) {
    const date = new Date(value);
    if (Number.isNaN(date.getTime())) return "";
    return date.toLocaleDateString("en-GB", { day: "numeric", month: "short", year: "numeric" });
  }

  function renderReviews() {
    const list = $("[data-review-list]");
    if (!list) return;

    const score = reviewAverage();
    const scoreNode = $("[data-rating-score]");
    const starsNode = $("[data-rating-stars]");
    const countNode = $("[data-rating-count]");

    if (scoreNode) scoreNode.textContent = score.toFixed(1);
    if (starsNode) starsNode.innerHTML = stars(score);
    if (countNode) {
      countNode.textContent = `${reviews.length} customer ${reviews.length === 1 ? "review" : "reviews"}`;
    }

    if (!reviews.length) {
      list.innerHTML = `<div class="empty-state"><strong>No reviews yet</strong>Be the first to share your experience.</div>`;
      return;
    }

    list.innerHTML = reviews
      .slice()
      .reverse()
      .map(
        (review) => `
        <article class="review-item">
          <div class="review-item__top">
            <div>
              <div class="review-item__name">${escapeHtml(review.name)}</div>
              <div class="stars" aria-label="${review.rating} out of 5">${stars(review.rating)}</div>
            </div>
            <span class="review-item__date">${formatDate(review.date)}</span>
          </div>
          <p>${escapeHtml(review.text)}</p>
        </article>`
      )
      .join("");
  }

  function escapeHtml(value) {
    return String(value).replace(/[&<>"']/g, (char) => {
      return {
        "&": "&amp;",
        "<": "&lt;",
        ">": "&gt;",
        '"': "&quot;",
        "'": "&#39;",
      }[char];
    });
  }

  function initReviewForm() {
    const form = $("[data-review-form]");
    if (!form) return;

    let selectedRating = 0;
    const starButtons = $$(".star-input button", form);
    const ratingLabel = $("[data-rating-label]", form);

    starButtons.forEach((btn) => {
      btn.addEventListener("click", () => {
        selectedRating = Number(btn.dataset.value);
        starButtons.forEach((b) =>
          b.classList.toggle("is-on", Number(b.dataset.value) <= selectedRating)
        );
        if (ratingLabel) ratingLabel.textContent = `${selectedRating} / 5 selected`;
      });
    });

    form.addEventListener("submit", (event) => {
      event.preventDefault();

      const nameInput = $("[data-review-name]", form);
      const textInput = $("[data-review-text]", form);
      const name = nameInput.value.trim();
      const text = textInput.value.trim();

      if (!selectedRating) {
        toast("Please choose a star rating.", "error");
        return;
      }
      if (name.length < 2) {
        toast("Please enter your name.", "error");
        nameInput.focus();
        return;
      }
      if (text.length < 10) {
        toast("Please write at least a short sentence about your experience.", "error");
        textInput.focus();
        return;
      }

      reviews.push({
        name,
        rating: selectedRating,
        text,
        date: new Date().toISOString().slice(0, 10),
      });
      saveReviews();
      renderReviews();

      selectedRating = 0;
      starButtons.forEach((b) => b.classList.remove("is-on"));
      if (ratingLabel) ratingLabel.textContent = "Tap a star to rate";
      form.reset();
      toast("Thank you — your review has been published.");
    });

    renderReviews();
  }

  /* ------------------------------------------------------------------
     13. Footer year + boot
     ------------------------------------------------------------------ */
  function boot() {
    initHeader();
    initShop();
    initDrawerTriggers();
    initModalKeys();
    renderDrawer();
    renderCheckoutSummary();
    initCheckoutForm();
    initReviewForm();

    // Expose contact details for any inline usage.
    $$("[data-contact-phone]").forEach((node) => (node.textContent = STORE.phone));
    $$("[data-contact-email]").forEach((node) => (node.textContent = STORE.email));
  }

  if (document.readyState === "loading") {
    document.addEventListener("DOMContentLoaded", boot);
  } else {
    boot();
  }
})();
