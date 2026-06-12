# Charlton Tech Guy

Local technology support for homes and small businesses in Charlton, MA and surrounding communities. A static, single-page website designed to convert visitors into leads through clear, accessible, locally-focused content.

**Live site:** https://eelledge1.github.io/charlton-tech-guy/

---

## Site Structure

```
CTG/
├── index.html          # Single-page website (all sections)
├── styles.css          # All styles (design tokens, layout, responsive)
├── scripts.js          # Mobile nav, smooth scroll, form validation
├── README.md           # This file
└── .gitignore
```

### Page Sections (top to bottom)

1. **Hero** — Tagline, value prop, CTA buttons
2. **How I Can Help** — 6 service cards (Home, Wi-Fi, Business, Smart Home, AI, Computer)
3. **For Your Home** — Homeowner-focused tech problems
4. **For Small Businesses** — Business tech services, audience fit, positioning
5. **AI Help Without the Hype** — Practical AI guidance, risk awareness
6. **Why Choose** — 6 trust-building cards
7. **How It Works** — 4-step process
8. **Service Area** — Town list with visual card
9. **About** — Founder bio (Eldon Elledge), Peak Agile Solutions connection
10. **Contact** — Full form with dropdown, radio buttons, mailto fallback

---

## How to Run Locally

Any static file server works. Examples:

```bash
# Python
python -m http.server 8080

# Node.js (npx)
npx serve .

# VS Code
# Install "Live Server" extension, right-click index.html → Open with Live Server
```

Then open http://localhost:8080 in your browser.

---

## Where to Update Contact Info

All contact details are in `index.html`. Search for these values:

| What | Current Value | Where |
|------|--------------|-------|
| Phone | `(303) 596-0262` | Contact section, footer, JSON-LD schema |
| Email | `eelledge@outlook.com` | Contact section, mailto link, footer, JSON-LD schema |
| Location | Charlton, MA | Contact section, footer, JSON-LD schema |

---

## Where to Update Service Area

Two places:

1. **HTML content** — Search for `Serving Charlton, Oxford` in `index.html` and update the town list
2. **JSON-LD schema** — Search for `"areaServed"` in `index.html` and add/remove city entries

---

## How to Connect the Contact Form

The form currently simulates submission (shows a success message after 1.5 seconds). To make it actually send:

**Option A: Formspree (simplest)**
1. Sign up at https://formspree.io
2. Create a new form, get your form ID
3. In `scripts.js`, replace the simulated submission (around line 94) with:

```javascript
// Show sending state
formStatus.textContent = 'Sending your message...';
formStatus.className = 'form-status text-accent';

fetch('https://formspree.io/f/yourFormID', {
    method: 'POST',
    body: new FormData(contactForm),
    headers: { 'Accept': 'application/json' }
})
.then(response => {
    if (response.ok) {
        formStatus.textContent = 'Thank you! Your message has been sent. I will respond as soon as possible.';
        formStatus.className = 'form-status text-success';
        contactForm.reset();
        // Clear success message after 8 seconds
        setTimeout(() => { formStatus.textContent = ''; }, 8000);
    } else {
        throw new Error('Form submission failed');
    }
})
.catch(() => {
    formStatus.textContent = 'Something went wrong. Please try again or email directly.';
    formStatus.className = 'form-status text-error';
});
```

**Option B: Netlify Forms** (deploy on Netlify, add `netlify` attribute to the form tag)

**Option C: Mailto fallback** — Already present at the bottom of the contact section

---

## Accessibility Notes

- Semantic HTML5 (`<header>`, `<main>`, `<section>`, `<footer>`)
- Skip link for keyboard users
- Proper heading hierarchy (h1 → h2 → h3, no skips)
- All form inputs have associated `<label>` elements
- `aria-label` on navigation, image placeholders
- `aria-expanded` / `aria-controls` on mobile menu toggle
- `aria-hidden="true"` on decorative icons
- `aria-live="polite"` on form status messages
- `autocomplete` attributes on form fields
- Keyboard-visible focus indicators (`:focus-visible`)
- Mobile menu closes on outside click and Escape key
- `prefers-reduced-motion` respected
- High-contrast color palette (WCAG AA compliant)

---

## SEO Notes

- Descriptive `<title>` and `<meta name="description">`
- Open Graph tags (`og:title`, `og:description`, `og:image`, `og:url`, `og:type`)
- `<meta name="theme-color">` for browser chrome
- JSON-LD LocalBusiness schema (8 towns in `areaServed`)
- Semantic heading structure
- Local keywords: Charlton tech help, Charlton computer help, local tech support Charlton MA, small business tech support Charlton MA, Wi-Fi help Charlton MA, printer setup Charlton, AI help for small business, technology help for seniors, computer help near me

---

## Deployment Options

This site is currently deployed on **GitHub Pages** (free):

```bash
git push origin master   # Auto-deploys
```

Other free options:

| Platform | How To |
|----------|--------|
| **Netlify** | Drag `index.html` + assets onto https://app.netlify.com/drop |
| **Cloudflare Pages** | Connect Git repo, auto-deploys |
| **Azure Static Web Apps** | Connect Git repo, auto-deploys |
| **Vercel** | Connect Git repo, auto-deploys |

---

## Built With

- HTML5, CSS3, Vanilla JavaScript
- Google Fonts (Inter + Lexend)
- No frameworks, no build tools, no backend
