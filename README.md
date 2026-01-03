# Napat Pamornsut - Portfolio

Personal portfolio website showcasing my projects, skills, and professional experience as a Fullstack Developer and Automation Tester.

## Live Demo

**Production URL:** [https://napatdev.com](https://napatdev.com)

---

## Table of Contents

- [Features](#features)
- [Tech Stack](#tech-stack)
- [Project Structure](#project-structure)
- [Getting Started](#getting-started)
- [Pages](#pages)
- [Components](#components)
- [Customization](#customization)
- [Deployment](#deployment)
- [License](#license)

---

## Features

### Design
- **Responsive Design** - Works on desktop, tablet, and mobile
- **Modern UI** - Clean, minimalist aesthetic
- **Animations** - Smooth hover effects and transitions
- **SEO Optimized** - Custom meta tags for each page

### Functionality
- **Project Showcase** - Detailed project pages with image galleries
- **Skills Section** - Organized by category (Frontend, Backend, Testing)
- **Contact Information** - Links to GitHub, LinkedIn, Email
- **Dynamic Routing** - Project detail pages with URL slugs

### Performance
- **Fast Loading** - Built with Vite for optimal performance
- **Lazy Loading** - Images loaded on demand
- **Code Splitting** - Route-based chunking

---

## Tech Stack

| Category | Technology |
|----------|------------|
| Framework | React 18 |
| Build Tool | Vite |
| Routing | React Router v6 |
| Styling | CSS (custom) |
| Deployment | Vercel / GitHub Pages |

---

## Project Structure

```
src/
├── components/             # Reusable UI components
│   ├── layout/
│   │   └── Footer.jsx      # Site footer
│   ├── nav/
│   │   └── Navbar.jsx      # Navigation bar
│   └── ui/
│       ├── Card.jsx        # Card component
│       └── Section.jsx     # Section wrapper
│
├── data/                   # Static data
│   ├── profile.js          # Personal info, skills
│   └── projects.js         # Project details
│
├── hooks/                  # Custom React hooks
│   └── usePageMeta.js      # SEO meta management
│
├── pages/                  # Page components
│   ├── Home.jsx            # Landing page
│   ├── About.jsx           # About me page
│   ├── ProjectList.jsx     # Project listing
│   ├── ProjectDetail.jsx   # Individual project
│   └── NotFound.jsx        # 404 page
│
├── styles/                 # CSS files
│   ├── globals.css         # Main stylesheet
│   ├── theme.css           # CSS variables
│   └── grid-bg.css         # Background styles
│
├── App.jsx                 # Root component with routes
└── main.jsx                # Entry point
```

---

## Getting Started

### Prerequisites

- Node.js >= 16.0.0
- npm or yarn

### Installation

```bash
# Clone the repository
git clone https://github.com/xArmeriumx/Portfolio-Napat.git

# Navigate to project directory
cd Portfolio-Napat

# Install dependencies
npm install

# Start development server
npm run dev
```

### Available Scripts

```bash
# Development server (port 5173)
npm run dev

# Build for production
npm run build

# Preview production build
npm run preview
```

---

## Pages

| Route | Page | Description |
|-------|------|-------------|
| `/` | Home | Hero section with introduction |
| `/about` | About | Skills, education, contact info |
| `/projects` | Projects | List of all projects |
| `/projects/:slug` | Project Detail | Individual project details |
| `*` | 404 | Not found page |

---

## Components

### Navbar
Fixed navigation bar with links to all pages.

```jsx
<Navbar />
```

### Section
Reusable section wrapper with title and line decoration.

```jsx
<Section title="About Me">
  {/* Content */}
</Section>
```

### Card
White card container with hover effects.

```jsx
<Card>
  <p>Card content</p>
</Card>
```

### ProjectCard
Project preview card with image, roles, and highlights.

```jsx
<ProjectCard project={projectData} />
```

### ImageGallery
Image gallery with thumbnail navigation.

```jsx
<ImageGallery 
  images={imageArray}
  title="Project Title"
/>
```

---

## Customization

### Update Personal Info

Edit `src/data/profile.js`:

```javascript
export const profile = {
  name: "Your Name",
  headline: "Your Title",
  tagline: "Your description...",
  links: {
    github: "https://github.com/username",
    linkedin: "https://linkedin.com/in/username",
    email: "email@example.com",
  },
  skills: [
    // Your skills
  ],
};
```

### Add Projects

Edit `src/data/projects.js`:

```javascript
{
  slug: "project-url-slug",
  title: "Project Title",
  images: ["path/to/image.png"],
  role: ["Developer"],
  description: "Project description...",
  technologies: ["React", "Node.js"],
  keyFeatures: ["Feature 1", "Feature 2"],
  highlights: ["Highlight 1", "Highlight 2"],
  responsibilities: ["Task 1", "Task 2"],
  links: {
    demo: "https://demo-url.com",
    repo: "https://github.com/...",
  },
}
```

### Update Styling

Edit CSS variables in `src/styles/theme.css`:

```css
:root {
  --maxw: 880px;
  --accent: #d14d4d;
  --text: #1d1d1f;
  --muted: #86868b;
  --bg: #f5f5f7;
}
```

---

## Deployment

### Vercel (Recommended)

1. Connect your GitHub repository to Vercel
2. Auto-deploys on push to main branch

### GitHub Pages

1. Update `vite.config.js`:
   ```javascript
   base: "/Portfolio-Napat/"
   ```

2. Build and deploy:
   ```bash
   npm run build
   # Deploy dist/ folder to gh-pages branch
   ```

### Configuration

**vite.config.js**
```javascript
export default defineConfig({
  plugins: [react()],
  base: process.env.GITHUB_PAGES ? "/Portfolio-Napat/" : "/",
  build: {
    sourcemap: false,
    minify: 'esbuild',
  },
  esbuild: {
    drop: ['console', 'debugger'],
  },
});
```

---

## SEO

Each page uses the `usePageMeta` hook for dynamic meta tags:

```jsx
usePageMeta({
  title: "Page Title | Napat Pamornsut",
  description: "Page description for SEO",
  ogTitle: "Open Graph title",
});
```

---

## Browser Support

- Chrome (latest)
- Firefox (latest)
- Safari (latest)
- Edge (latest)

---

## License

MIT License

---

## Author

**Napat Pamornsut**
- GitHub: [@NapatPamornsuT](https://github.com/NapatPamornsuT)
- Email: armnapat.a.03@gmail.com
