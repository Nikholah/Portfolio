# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project Overview

This is a modern static portfolio website for Nicolas Lyfoung, a second-year IUT computer science student. The site features a professional design with animations, dark mode support, and interactive elements, built entirely with vanilla HTML/CSS/JavaScript.

## Project Structure

```
Portfolio/
├── index.html                      # Main landing page with hero, projects, and skills
├── contact.html                    # Contact form page
├── portfolio-dapprentissage.html   # Learning portfolio/reflection page
├── projet[1-4].html               # Individual project detail pages
├── css/
│   ├── modern.css                 # Main modern stylesheet with all components
│   ├── variables.css              # CSS custom properties (design tokens)
│   ├── contact.css                # Contact page specific styles
│   ├── project.css                # Project pages specific styles
│   ├── portfolio-dapprentissage.css # Learning portfolio styles
│   └── style.css                  # Legacy styles (older version)
├── js/
│   └── main.js                    # All JavaScript functionality
├── img/                           # Project screenshots and UI assets
└── pdf/
    └── cv.pdf                     # Resume document
```

## Common Development Commands

### Local Development
```bash
# Python HTTP server
python3 -m http.server 8000

# PHP built-in server
php -S localhost:8000

# Or simply open index.html in a browser
```

No build process is required - this is a static site that can be served directly.

## High-Level Architecture

### Design System (variables.css)
The site uses CSS custom properties for consistent theming:
- **Colors**: Primary/secondary palettes, text colors, backgrounds
- **Spacing**: Scale from xs (0.25rem) to 2xl (3rem)
- **Typography**: Font sizes and line heights
- **Effects**: Shadows, transitions, border-radius values
- **Z-index**: Layering scale for modals, navbar, etc.

### Component Architecture (modern.css)
Key reusable components:
- **Buttons**: `.btn`, `.btn-primary`, `.btn-secondary`
- **Cards**: `.card`, `.project-card` with hover effects
- **Sections**: `.hero`, `.section`, `.navbar`
- **Animations**: `.fade-in-up`, `.fade-in` with Intersection Observer
- **Forms**: Styled inputs with validation states

### JavaScript Features (main.js)
- **Dark Mode**: Theme switching with localStorage persistence
- **Mobile Navigation**: Hamburger menu with smooth animations
- **Scroll Effects**: 
  - Navbar hide/show on scroll
  - Fade-in animations using Intersection Observer
  - Smooth scroll for anchor links
- **Typed Effect**: Animated typing in hero section
- **Form Validation**: Client-side validation for contact form
- **Loading Animation**: Displays while page loads
- **Toast Notifications**: For user feedback

### Page-Specific Notes
- **index.html**: Features hero section with typed animation, project grid, skills section
- **contact.html**: Contact form using mailto: method with client-side validation
- **projet[1-4].html**: Project detail pages with consistent layout
- **portfolio-dapprentissage.html**: Academic reflection page with timeline layout

### Responsive Design
- Mobile-first approach with breakpoint at 768px
- CSS Grid for project layouts
- Flexbox for component layouts
- Fluid typography using `clamp()`

### Performance Considerations
- No external dependencies (except Font Awesome CDN)
- Lazy loading animations with Intersection Observer
- Debounced scroll events
- CSS transforms for smooth animations