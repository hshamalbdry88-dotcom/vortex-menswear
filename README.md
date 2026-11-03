# Vortex Menswear

A modern, fully responsive e-commerce website for a men's winter apparel and footwear store.
Built with clean HTML5, CSS3 and modern vanilla JavaScript — no build step, no dependencies.

**Designed and Developed by Hisham Al-Badri.**

---

## Pages

| File | Purpose |
| --- | --- |
| `index.html` | **Winter Apparel** — 50 pieces in five categories: Outerwear, Knitwear, Bottoms, Shirts & Overshirts, Hoodies & Blazers. |
| `footwear.html` | **Winter Footwear** — 20 styles in two families: Boots (10) and Sneakers & Casual (10). |
| `checkout.html` | **Checkout & Ordering** — order form, deposit rule, official contact details and the customer reviews section. |

## Files

```
vortex-menswear/
├── index.html      # Winter Apparel
├── footwear.html   # Winter Footwear
├── checkout.html   # Checkout, ordering form & reviews
├── styles.css      # Full design system (tokens, layout, components, responsive)
├── script.js       # Product catalogue, modal, cart, checkout validation, reviews
└── README.md
```

---

## Features

**Navigation & architecture**
- Three-page structure with a shared sticky, translucent header and a mobile hamburger menu.
- Cart badge in the header plus a slide-in order drawer available on every page.

**Products & UX**
- 70 products in total, rendered from a single `CATALOGUE` array in `script.js`.
- **To change a price, edit the `price` / `oldPrice` values in that array** — nothing else needs touching.
- Each product carries an English name plus its Arabic name, shown underneath on the card and in the modal.
- Filter chips per category and sorting (featured, price ascending/descending, top rated).
- Clicking any product opens a smooth modal with **four images** (main view + thumbnail gallery), a full description, spec table and a **size selector from M to 5XL** for apparel (EU 40–46 for footwear), plus quantity controls.

**Checkout & payment rule**
- The mandatory rule is displayed as a prominent banner:

  > To complete your order, a **90 EGP deposit** must be sent via **Instapay** or **Vodafone Cash** to: **01065101692**.

- Order form fields: **Full Name (Triple Name / الاسم الثلاثي)** validated to require three name parts, **Exact Delivery Address**, **City / Governorate**, **Phone Number**, optional second phone, email, payment-method choice, order notes and a mandatory deposit acknowledgement checkbox.
- Live order summary with subtotal, deposit and balance-on-delivery, calculated from the cart.
- Submitting generates an order reference and confirms the next steps on screen.

**Customer reviews**
- Star-rating input (1–5), name and feedback fields, with a live average score and review count.
- Reviews are saved in `localStorage` and rendered newest-first.

**Design**
- Dark charcoal base with slate greys, muted olive and a warm winter accent.
- Fully responsive from 320 px phones up to wide desktop, with reduced-motion support.

---

## Contact

- **Phone / Instapay / Vodafone Cash:** 01065101692
- **Email:** hishamalbadri582@gmail.com

---

## Run locally

Just open `index.html` in a browser, or serve the folder:

```bash
python -m http.server 5500
```

Then visit `http://localhost:5500`.

---

## Deploy to GitHub Pages

1. Create a new repository on GitHub (e.g. `vortex-menswear`).
2. Upload the contents of this folder to the repository root.
3. Commit and push:

   ```bash
   git init
   git add index.html footwear.html checkout.html styles.css script.js README.md
   git commit -m "Add Vortex Menswear storefront"
   git branch -M main
   git remote add origin https://github.com/<your-username>/vortex-menswear.git
   git push -u origin main
   ```

4. In the repository go to **Settings → Pages**.
5. Under **Build and deployment**, set **Source** to `Deploy from a branch`,
   choose branch **main** and folder **/ (root)**, then click **Save**.
6. Your store goes live at `https://<your-username>.github.io/vortex-menswear/`.

> Note: the cart and customer reviews are stored in the browser's `localStorage`, which is ideal
> for a static GitHub Pages deployment. For shared, server-side reviews and real order storage,
> connect a backend or a form service such as Formspree.
