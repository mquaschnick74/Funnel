# iVASA Inner Landscape Assessment - Design Guidelines

## Design Philosophy

**Visual Identity:**
- Clean, minimal aesthetic with a calming, therapeutic feel
- Dark theme foundation (#0f0f1a or similar deep navy/charcoal)
- Emerald green as primary accent (#10b981)
- Explicitly NOT clinical or medical-looking - should feel modern, approachable, and introspective
- Soft, contemplative atmosphere that builds trust

**Key Principle:** Balance professional credibility with emotional accessibility - users should feel safe exploring their inner landscape.

---

## Page-by-Page Design Specifications

### Page 1: Landing Page

**Hero Section:**
- Large, prominent headline: "Discover Your Inner Landscape"
- Subheadline: "A 2-minute assessment based on Pure Contextual Perception therapy - developed by a licensed therapist"
- Prominent CTA button in emerald green, substantial size, clear hierarchy
- Background: Subtle abstract landscape illustration or calming gradient (deep purples to dark blues)
- Use a high-quality hero image showing abstract landscapes, peaceful natural scenes, or gradient artwork

**Trust Signals Section:**
Grid or row layout displaying:
- "✓ Takes 90 seconds"
- "✓ 1,000+ therapeutic sessions conducted"
- "✓ Based on 20+ years of clinical research"
- "✓ Completely confidential"

Typography: Light text on dark background, checkmarks in emerald, concise and scannable

### Page 2: Assessment Quiz (5 Questions)

**Header:**
- Minimal logo/text: "iVASA Assessment"
- Progress indicator: "Question X of 5" with visual progress bar (emerald on dark)
- Optional: Subtle background scene that shifts per question (low opacity abstract landscapes)

**Question Layout:**
- Question number small but visible
- Question text large, readable, centered or left-aligned with generous spacing
- 4-6 choice buttons arranged vertically, substantial clickable areas
- Each button uses card-style design with:
  - Generous padding (minimum 16px vertical, 24px horizontal)
  - Border or subtle shadow for definition
  - Clear hover state (emerald glow or border)
  - Selected state visible before auto-advance
- "Skip this question" link small and subtle at bottom

**Transitions:**
- Smooth fade between questions (300-400ms)
- Auto-advance on selection (no separate "Next" button)

### Page 3: Loading Screen

**Visual Treatment:**
- Centered animated indicator (spinning ring, pulsing circle, or smooth progress bar in emerald)
- Cycling text messages displayed prominently:
  - "Analyzing your responses..."
  - "Mapping your inner landscape..."
  - "Identifying your pattern..."
  - "Generating your therapeutic profile..."
- Dark background with subtle radial gradient
- Professional, anticipatory feeling - builds perceived value

### Page 4: Partial Results (Conversion Page)

**Pattern Title:**
Large, bold headline displaying their generated pattern (e.g., "Your Pattern: The Storm Watcher")

**Visible Profile Section:**
- 2-3 paragraphs of personalized insights
- Readable typography with generous line-height
- Clear visual hierarchy between paragraphs

**Locked Sections:**
- 3-4 additional section headers visible but content blurred
- Glassmorphic overlay effect (frosted glass blur)
- Lock icons or "Unlock with free account" indicators
- Section titles: "Your Therapeutic Approach", "What This Means for Your Journey", "Personalized Path Forward", "How iVASA Can Help"

**Primary CTA:**
- Large, prominent button: "Create Free Account to See Your Complete Profile"
- Subtext: "Takes 30 seconds • Start your first session today"
- Emerald green, high contrast against dark background

**Social Proof:**
- "Join 1,000+ people discovering their inner landscape"
- Optional small testimonial carousel if available

**Secondary CTA:**
- Smaller, subtle text link: "Maybe Later - Just Email Me My Results"
- Opens simple email capture form

---

## Typography System

**Headings:**
- H1: 36-48px, bold weight, emerald or white
- H2: 28-32px, medium-bold weight
- H3: 20-24px, medium weight

**Body Text:**
- Primary: 16-18px, regular weight, light gray (#a1a1aa or similar)
- Line height: 1.6-1.8 for readability

**Accents:**
- Trust signals, progress indicators: 14px, medium weight
- Small disclaimers: 12-13px

**Font Stack:**
- Use Google Fonts: Inter, Outfit, or similar modern sans-serif

---

## Spacing & Layout

**Container Widths:**
- Landing page: max-width 1200px
- Quiz pages: max-width 800px (focused, less distraction)
- Results page: max-width 900px

**Spacing Units:**
- Use Tailwind units: 2, 4, 6, 8, 12, 16, 20, 24
- Generous whitespace between sections (py-16 to py-24)
- Quiz question cards: p-8 minimum

---

## Component Library

**Buttons:**
- Primary (CTA): Emerald background, white text, rounded corners, subtle shadow, hover glow effect
- Secondary: Transparent with emerald border, emerald text
- Answer choices: Card-style with border, hover state with emerald accent

**Cards:**
- Dark background with subtle border or shadow
- Rounded corners (8-12px radius)
- Internal padding: p-6 to p-8

**Progress Bar:**
- Thin horizontal bar (4-6px height)
- Dark gray background, emerald fill
- Smooth transitions as progress updates

---

## Images

**Hero Image:**
- Yes, use a large hero image
- Abstract landscape, peaceful natural scene (mountains, flowing water, sky gradients), or artistic gradient
- Low saturation, calming tones
- Position: Full-width background or prominent placement in hero section
- Should evoke introspection and calm

**Optional Question Backgrounds:**
- Very subtle, low-opacity landscape scenes that shift per question
- Should not distract from readability

---

## Animation Guidelines

**Use Sparingly:**
- Fade transitions between quiz questions (300-400ms)
- Loading screen: Smooth spinning/pulsing animation
- Button hover states: Subtle glow or scale (keep minimal)
- No distracting parallax or excessive motion

**Purpose:** Create smooth, professional flow without overwhelming users in a therapeutic context.