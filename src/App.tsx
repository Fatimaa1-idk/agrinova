import { AuthProvider } from './context/AuthContext';
import { ToastProvider } from './context/ToastContext';
import { RouterProvider } from './router/RouterContext';
import { Router } from './router/Router';
import { ErrorBoundary } from './components/ErrorBoundary';

export default function App() {
  return (
    <ErrorBoundary>
      <AuthProvider>
        <ToastProvider>
          <RouterProvider>
            <ErrorBoundary>
              <Router />
            </ErrorBoundary>
          </RouterProvider>
        </ToastProvider>
      </AuthProvider>
    </ErrorBoundary>
  );
}
