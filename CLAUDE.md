# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project Overview

This is a static portfolio website for Nicolas Lyfoung, a second-year IUT computer science student. The site is built with vanilla HTML/CSS and showcases academic projects, skills, and personal information.

## Project Structure

```
Portfolio/
├── index.html          # Main landing page with personal info, education, and project showcase
├── contact.html        # Contact form page
├── projet[1-4].html    # Individual project detail pages
├── css/
│   ├── style.css       # Main stylesheet for common elements
│   ├── styleContact.css # Contact page specific styles
│   └── styleProjet.css  # Project pages specific styles
├── img/                # Image assets for projects and UI elements
└── pdf/
    └── cv.pdf          # CV document
```

## Key Architecture Points

### Navigation Structure
- All pages share a common navbar with:
  - Home button (accueil.png icon)
  - External links: LinkedIn, GitHub, CV (PDF)
  - Internal link: Contact page
- Project pages link back to home via the accueil.png icon

### Page Templates
1. **index.html**: Contains personal description, education history, and project portfolio grid
2. **contact.html**: Simple contact form using mailto method
3. **projet[1-4].html**: Project detail pages following a consistent structure:
   - Project description and technologies
   - Screenshots
   - Skills/competencies developed
   - GitHub link when applicable

### Styling Approach
- Separate CSS files for different page types
- Common styles in style.css (navbar, general layout)
- Page-specific styles in dedicated CSS files
- Responsive design with max-width containers

## Development Guidelines

### When Modifying Content
- Maintain consistent French language throughout
- Keep the existing navbar structure on all pages
- Follow the established project page template for new projects

### When Working with Styles
- Common elements should be styled in style.css
- Page-specific styles go in their respective CSS files
- Maintain the existing visual hierarchy and spacing

### Adding New Projects
1. Create a new `projetX.html` file following the existing template
2. Add corresponding project image in img/ directory
3. Update the portfolio grid in index.html with the new project card
4. Link to the new project page from the portfolio item

### Image Management
- Project screenshots should be placed in img/ directory
- Use descriptive filenames (e.g., projet5.png for project 5)
- UI icons (accueil.png, fleche.png) are shared across pages