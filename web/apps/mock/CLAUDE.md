# SciValidate Mock App Development Guide

## Commands
- `npm run dev` - Start development server (port 3006)
- `npm run build` - Build for production to ../../dist/mock
- `npm run lint` - Run ESLint on js/jsx files
- `npm run preview` - Preview production build

## Code Style Guidelines
- **Components**: Use functional components with hooks
- **Imports**: Use alias paths (@/, @shared/, @scivalidate/*)
- **Naming**: PascalCase for components, camelCase for variables/functions
- **CSS**: Use Tailwind, combine classes with `cn()` utility from src/lib/utils.js
- **Documentation**: Use JSDoc for functions and components
- **Error Handling**: Use try/catch with meaningful fallbacks
- **Structure**:
  - UI components in src/components/
  - Utilities in src/lib/
  - Services in src/services/
- **Props**: Destructure in component parameters
- **State**: Use React hooks (useState, useEffect, etc.)
- **Exports**: Prefer default exports for components

## API Pattern
- Centralize API calls in service modules
- Use fetch with async/await
- Handle errors gracefully