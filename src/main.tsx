
import { createRoot } from 'react-dom/client'
import App from './App.tsx'
import './index.css'

console.log('Main.tsx: Starting application initialization');

const rootElement = document.getElementById("root");
if (!rootElement) {
  console.error('Main.tsx: Root element not found!');
} else {
  console.log('Main.tsx: Root element found, creating React root');
  createRoot(rootElement).render(<App />);
  console.log('Main.tsx: App component rendered');
}
