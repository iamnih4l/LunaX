import { useAppStore } from './store/useAppStore';
import LandingView from './ui/views/LandingView';
import ExplorerView from './ui/views/ExplorerView';
import CorrespondenceView from './ui/views/CorrespondenceView';
import ResultView from './ui/views/ResultView';
import HUDOverlay from './ui/components/HUDOverlay';

export default function App() {
  const currentView = useAppStore((state) => state.currentView);

  return (
    <HUDOverlay>
      <div className="app-container">
        {currentView === 'landing' && <LandingView />}
        {currentView === 'explorer' && <ExplorerView />}
        {currentView === 'correspondence' && <CorrespondenceView />}
        {currentView === 'result' && <ResultView />}
      </div>
    </HUDOverlay>
  );
}
