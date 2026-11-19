import {createRoot} from 'react-dom/client';
import App from './App.tsx';
import './index.css';
import { preloadDesktop3DIfEligible } from './components/world/ImmersiveWorldBackground';

preloadDesktop3DIfEligible();

createRoot(document.getElementById('root')!).render(<App />);
