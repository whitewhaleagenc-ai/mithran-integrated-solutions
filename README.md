# Mithran Integrated Solutions — website

Solar & land, business consulting, raw-material transport and industrial scrap — run as one chain. Madurai, Tamil Nadu.

Live: https://whitewhaleagenc-ai.github.io/mithran-integrated-solutions/ (custom domain planned: https://www.mithranintegratedsolutions.in)

## Structure

| Path | What it is |
|---|---|
| `index.html` | Home page (with intro video) |
| `solar-land/`, `business-consulting/`, `transport/`, `scrap/` | Service pages — each a real HTML page with its own title, description and schema |
| `404.html` | Not-found page (noindex) |
| `assets/app.js`, `assets/site.css`, `assets/fonts/` | The site's code, styles and fonts (shared, cached by browsers) |
| `assets/media/` | Background photos, logo mark and intro video |
| `assets/logo/`, `assets/icons/` | Logo artwork, favicons and app icons |
| `og-image.jpg` | Preview image used when the link is shared on WhatsApp, Facebook, LinkedIn, X |
| `robots.txt`, `sitemap.xml` | For search engines (allows Google, Bing and AI crawlers) |
| `llms.txt` | Plain-text business summary for AI assistants (ChatGPT, Claude, Perplexity, Gemini) |
| `manifest.webmanifest` | App name and icons for "Add to home screen" |

## SEO / AEO / GEO built in

- Every page ships readable HTML content before JavaScript runs, so all crawlers (including AI crawlers that don't run JavaScript) can read it.
- Unique title, meta description, canonical URL, Open Graph and Twitter tags per page.
- Schema.org JSON-LD: Organization + ProfessionalService (Madurai), WebSite, WebPage, FAQPage, Service, BreadcrumbList.
- Local signals: geo meta tags, address locality/region, area served, phone in international format.

## Switching to the custom domain

The canonical URLs, sitemap and schema already point at `https://www.mithranintegratedsolutions.in`. To go live on it: add the domain under Settings → Pages → Custom domain, and point the domain's DNS at GitHub Pages.

Contact: thiruselvan.m@mithranintegratedsolutions.in · +91 90258 14383
