/**
 * App Component
 * Root component for the EOL Checklist Webapp
 * 
 * This component wraps the application with the ChecklistProvider
 * and sets up routing for all pages.
 * 
 * @validates Requirements 1.1-1.5, 2.4
 */

import { AppRouter } from './router';
import { ThemeProvider } from './context/ThemeProvider';

/**
 * App Component
 * The main application component that provides routing and context
 */
function App() {
  return (
    <ThemeProvider defaultTheme="system">
      <div className="min-h-screen bg-[var(--bg-primary)] text-[var(--text-primary)] transition-colors duration-300">
        <AppRouter />
      </div>
    </ThemeProvider>
  );
}

export default App;
