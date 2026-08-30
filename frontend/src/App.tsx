/* ─── LunaX Application ─── */

import { AnimatePresence, motion } from 'framer-motion';
import { useAppStore } from './store/useAppStore';
import Landing from './views/Landing';
import Explorer from './views/Explorer';
import Acquisition from './views/Acquisition';
import Workspace from './views/Workspace';
import Result from './views/Result';
import Report from './views/Report';
import ErrorBoundary from './components/ErrorBoundary';
import './styles/global.css';

const viewComponents = {
  landing: Landing,
  explorer: Explorer,
  workspace: Workspace,
  result: Result,
  report: Report,
  acquisition: Acquisition,
  /* Placeholder views — route to existing views */
  correspondence: Workspace,
} as const;

export default function App() {
  const currentView = useAppStore((s) => s.currentView);
  const ViewComponent = viewComponents[currentView] || Landing;

  return (
    <AnimatePresence mode="wait">
      <motion.div
        key={currentView}
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        transition={{ duration: 0.4, ease: [0.16, 1, 0.3, 1] }}
        style={{ width: '100%', height: '100%' }}
      >
        <ErrorBoundary>
          <ViewComponent />
        </ErrorBoundary>
      </motion.div>
    </AnimatePresence>
  );
}
