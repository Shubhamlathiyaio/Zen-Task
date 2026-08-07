---
version: alpha
name: Habitica Quest Dark
description: A playful gamified dark-theme system with bright violet accents and rounded, friendly typography.
colors:
  primary: "#925CF3"
  primary-60: "#BDA8FF"
  primary-80: "#A77AF7"
  secondary: "#5B2DAE"
  tertiary: "#1F1630"
  neutral: "#121212"
  surface: "#3D255E"
  surface-2: "#4B2D73"
  on-surface: "#FFFFFF"
  muted-text: "#C9B8FF"
  border: "#374151"
  shadow: "#1A181D"
  error: "#E35D6A"
typography:
  headline-display:
    fontFamily: "Varela Round"
    fontSize: "56px"
    fontWeight: 400
    lineHeight: 1.14
    letterSpacing: "0px"
  headline-lg:
    fontFamily: "Varela Round"
    fontSize: "48px"
    fontWeight: 400
    lineHeight: 1.33
    letterSpacing: "0px"
  headline-md:
    fontFamily: "Varela Round"
    fontSize: "32px"
    fontWeight: 400
    lineHeight: 1.71
    letterSpacing: "0px"
  headline-sm:
    fontFamily: "Varela Round"
    fontSize: "24px"
    fontWeight: 400
    lineHeight: 1.33
    letterSpacing: "0px"
  body-lg:
    fontFamily: "Roboto"
    fontSize: "18px"
    fontWeight: 400
    lineHeight: 1.45
    letterSpacing: "0px"
  body-md:
    fontFamily: "Roboto"
    fontSize: "16px"
    fontWeight: 400
    lineHeight: 1.50
    letterSpacing: "0px"
  body-sm:
    fontFamily: "Roboto"
    fontSize: "14px"
    fontWeight: 400
    lineHeight: 1.43
    letterSpacing: "0px"
  label-lg:
    fontFamily: "Roboto"
    fontSize: "16px"
    fontWeight: 700
    lineHeight: 1.25
    letterSpacing: "0px"
  label-md:
    fontFamily: "Roboto"
    fontSize: "16px"
    fontWeight: 700
    lineHeight: 1.25
    letterSpacing: "0px"
  label-sm:
    fontFamily: "Roboto"
    fontSize: "14px"
    fontWeight: 400
    lineHeight: 1.2
    letterSpacing: "0px"
  caption:
    fontFamily: "Roboto"
    fontSize: "12px"
    fontWeight: 400
    lineHeight: 1.2
    letterSpacing: "0px"
rounded:
  none: 0px
  sm: 2px
  md: 4px
  lg: 8px
  xl: 12px
  full: 9999px
spacing:
  xs: 8px
  sm: 16px
  md: 28px
  lg: 70px
  xl: 180px
components:
  button-primary:
    backgroundColor: "{colors.primary}"
    textColor: "{colors.on-surface}"
    typography: "{typography.label-lg}"
    rounded: "{rounded.md}"
    padding: "16px 17px"
    height: "48px"
  button-primary-hover:
    backgroundColor: "{colors.primary-80}"
    textColor: "{colors.on-surface}"
    typography: "{typography.label-lg}"
    rounded: "{rounded.md}"
    padding: "16px 17px"
    height: "48px"
  button-secondary:
    backgroundColor: "transparent"
    textColor: "{colors.primary-60}"
    typography: "{typography.label-lg}"
    rounded: "{rounded.sm}"
    padding: "16px 17px"
    height: "48px"
  button-link:
    backgroundColor: "transparent"
    textColor: "{colors.on-surface}"
    typography: "{typography.body-sm}"
    rounded: "{rounded.none}"
    padding: "0px"
  card:
    backgroundColor: "{colors.neutral}"
    textColor: "{colors.on-surface}"
    rounded: "{rounded.lg}"
    padding: "16px"
  input:
    backgroundColor: "{colors.surface}"
    textColor: "{colors.on-surface}"
    typography: "{typography.body-md}"
    rounded: "{rounded.sm}"
    padding: "16px"
    height: "48px"
  chip:
    backgroundColor: "{colors.surface-2}"
    textColor: "{colors.on-surface}"
    typography: "{typography.body-sm}"
    rounded: "{rounded.full}"
    padding: "8px 12px"
  divider:
    backgroundColor: "{colors.primary-60}"
    height: "1px"
  icon-button:
    backgroundColor: "transparent"
    textColor: "{colors.on-surface}"
    rounded: "{rounded.full}"
    size: "32px"
---
# Habitica Quest Dark

## Overview
Habitica feels playful, game-like, and welcoming, with a strong “motivate through fun” personality rather than a corporate or minimalist one. The dark purple backdrop, friendly rounded type, and pixel-art illustrations create a lighthearted fantasy tone aimed at productivity-focused users who respond well to rewards and character-driven motivation. The interface is relatively spacious and uncluttered, but it still packs in many calls to action, so hierarchy must stay clear and energetic.

## Colors
- **Primary (#925CF3):** The signature bright violet used for the main brand surface and primary actions; it carries the fantasy/game identity of the product.
- **Primary-60 (#BDA8FF):** A lighter lavender used for bordered secondary actions and supportive text, especially where the UI needs contrast without full emphasis.
- **Secondary (#5B2DAE):** A deeper purple that can support depth, hover states, or quieter brand moments beneath the main accent.
- **Tertiary (#1F1630):** A near-indigo support tone for deep layering and visual contrast against the brighter purple field.
- **Neutral (#121212):** The dark base/background tone that anchors the page and keeps the site in a moody, immersive dark mode.
- **Surface (#3D255E):** A panel and input surface tone that lifts form controls slightly above the background while staying on-brand.
- **Surface-2 (#4B2D73):** A slightly lighter elevated purple for chips, secondary panels, and subtle layering.
- **On-surface (#FFFFFF):** Pure white used for major text, icons, and high-emphasis UI on the saturated background.
- **Muted-text (#C9B8FF):** A softened lavender for less prominent labels, helper text, and secondary navigation.
- **Border (#374151):** A restrained border tone for structural separation in dark contexts.
- **Shadow (#1A181D):** A very dark shadow color that keeps depth subtle and grounded.
- **Error (#E35D6A):** A warm alert tone to reserve for validation and destructive states when needed.

## Typography
The system mixes a whimsical display face, Varela Round, with Roboto for utility and readable interface text. Varela Round is used for large headlines and section titles, giving the UI a rounded, friendly, game-like voice, while Roboto handles body copy, labels, form fields, and buttons for clarity and density. The source does not rely on uppercase display conventions; instead, it keeps text in title case or sentence case with minimal letter spacing, reinforcing the approachable tone.

## Layout & Spacing
The page uses a wide, hero-first layout with clear left/right separation: marketing messaging on one side and the sign-up form on the other. Spacing is generous at the section level, with the provided rhythm of 8px, 16px, 28px, 70px, and 180px supporting both tight control spacing and very large atmospheric gaps. Forms and buttons are wide and stable rather than compact, with a minimum button width around 411px and a consistent 48px control height, which suits the desktop-focused onboarding experience.

## Elevation & Depth
Depth is handled mostly through color layering rather than heavy shadows. The design stays visually flat overall, with only subtle shadowing on primary buttons and slight tonal shifts between background, surface, and elevated surface colors. Borders are used sparingly to define interactive edges, especially on secondary buttons and form containers, keeping the interface crisp without becoming visually heavy.

## Shapes
The shape language is friendly and modestly rounded. Primary buttons use a small 4px radius, secondary buttons are even tighter at 2px, and cards and panels can move up to 8px for a slightly softer container feel. Overall, the geometry remains rectangular and stable, avoiding pill-heavy styling except where an icon or chip benefits from a full radius.

## Components
Buttons are the most defined component family in the system. `button-primary` is a filled violet action with white text, a 48px height, and strong Roboto label weight for the main CTA; it should feel decisive and prominent. `button-secondary` is transparent with a lavender outline and text, used for alternate sign-in paths or lower-priority actions; it should remain visually lighter while still matching the same height and padding as the primary button. `button-link` is reserved for simple text actions like navigation or legal links and should stay underline-based with no border or surface. Hover states should mostly adjust brightness or saturation rather than introducing new shapes.

Inputs are dark, restrained, and form-first. They should use `input` with a mid-purple surface, white text, and a 48px height; placeholder and helper text should remain muted to avoid competing with user-entered content. Cards use `card` styling: dark background, subtle border, rounded corners, and modest padding, suitable for panels, modal bodies, or content blocks.

Chips and pill-like labels can use `chip` for small status or category tags, with a full radius and compact padding. Dividers are simple and thin, often in a soft lavender or border tone, and should help separate sign-up options or grouped content without adding clutter. Icon buttons should remain circular via `icon-button` and keep their footprint compact so they feel playful rather than dominant.

## Do's and Don'ts
- Do keep primary actions in bright violet with strong contrast against the dark background.
- Do use Varela Round for large, expressive headings and Roboto for all utility and form text.
- Do preserve generous spacing around hero content and major form groups.
- Do use subtle borders and tonal layering instead of large shadows or glossy effects.
- Don't introduce sharp, angular corners on major UI surfaces.
- Don't switch the interface to a light theme or neutral gray palette; the purple identity is core to the brand.
- Don't over-style buttons with gradients, heavy shadows, or oversized radii.
- Don't make labels or helper text too low-contrast, especially inside form fields.