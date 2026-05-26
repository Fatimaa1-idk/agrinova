import { AuthProvider } from './context/AuthContext';
import { ToastProvider } from './context/ToastContext';
import { RouterProvider } from './router/RouterContext';
import { Router } from './router/Router';

export default function App() {
  return (
    <AuthProvider>
      <ToastProvider>
        <RouterProvider>
          <Router />
        </RouterProvider>
      </ToastProvider>
    </AuthProvider>
  );
}
