# SciValidate Component Preview Environment

This is a standalone environment for previewing and testing SciValidate React components without needing to run the full application stack.

## Getting Started

1. Clone this repository
2. Install dependencies
   ```bash
   npm install
   ```
3. Start the development server
   ```bash
   npm run dev
   ```
4. Open your browser to the local server (usually http://localhost:5173)

## Component Structure

The component preview environment contains:

1. **UI Components**:

   - Mock implementations of shadcn/ui components in `src/components/ui/`
   - These replicate the functionality needed for our SciValidate components

2. **Main Components**:

   - `ReputationBadge.jsx` - The badge displayed next to faculty names
   - `FacultyViewer.jsx` - The grid view of faculty members
   - `VerificationInterface.jsx` - Detailed faculty verification information

3. **Mock Data**:
   - The preview environment uses mock data defined in `public/mock-faculty-data.js`
   - It intercepts API calls to provide mock responses

## Updating Components

### From Main Project

If you need to update components from the main SciValidate project:

1. Copy the updated component(s) to:

   - ReputationBadge.jsx → `src/components/ReputationBadge.jsx`
   - FacultyViewer.jsx → `src/components/FacultyViewer.jsx`
   - VerificationInterface.jsx → `src/components/VerificationInterface.jsx`

2. Fix import paths:
   - Change any imports from `@/components/ui/...` to `./ui/...`
   - Make sure all dependencies are properly linked

### Creating New Components

To add a new component to the preview environment:

1. Add the component to `src/components/`
2. Update `src/DynamicJSXPreviewer.jsx`:
   - Add the component to the `availableComponents` array
   - Add a case in the `renderComponent` function

## Mock API

The preview environment intercepts API calls to provide mock data:

- `fetch('/api/faculty')` → Returns the list of faculty members
- `fetch('http://localhost:8000/api/faculty/[id]')` → Returns detailed faculty data

If you need to modify the mock data, edit `public/mock-faculty-data.js`.

## Troubleshooting

### Common Issues

1. **Import Errors**: Look for import paths using `@/` which need to be changed to relative paths

2. **Missing UI Components**: If you see errors about missing UI components:

   - Check if you're using a shadcn/ui component not yet mocked
   - Add the missing component to `src/components/ui/`

3. **API Errors**: If components try to access APIs not yet mocked:

   - Add the API endpoints to `window.mockAPI.fetch` in `mock-faculty-data.js`

4. **Styling Issues**: The preview uses Tailwind CSS. Make sure your components use class names that exist in Tailwind.

5. **Component Props**: Some components might expect props that aren't provided in the preview environment. Check the component props in `DynamicJSXPreviewer.jsx`.

## For Contributors

When contributing to the SciValidate project:

1. Use this preview environment to test component changes before committing
2. Ensure your components work in isolation without relying on external state or APIs
3. If your component requires new dependencies:
   - Add them to package.json
   - Document the dependencies in your PR

## Mock UI Components

The following UI components are mocked in this environment:

- `Card`, `CardHeader`, `CardContent` - Basic card layout components
- `Badge` - For displaying status and tag information

If your component needs additional UI components, add them to the `src/components/ui/` directory.

## Adding New Mock Data

If your component needs additional mock data:

1. Add the data to `public/mock-faculty-data.js`
2. Update the mock API to return the new data
3. Document the required data format in your component

## Deployment

This preview environment is designed for local development only and should not be deployed separately from the main application.
