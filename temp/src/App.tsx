import { useState } from 'react';
import LandingView from './views/LandingView';
import SelectionView from './views/SelectionView';
import ProcessingView from './views/ProcessingView';
import ResultsView from './views/ResultsView';

export type AppView = 'landing' | 'selection' | 'processing' | 'results';

function App() {
  const [currentView, setCurrentView] = useState<AppView>('landing');
  
  // Mock State
  const [selectedReference, setSelectedReference] = useState<string | null>(null);
  const [selectedSource, setSelectedSource] = useState<string | null>(null);

  return (
    <div className="app-container">
      {currentView === 'landing' && (
        <LandingView onStart={() => setCurrentView('selection')} />
      )}
      
      {currentView === 'selection' && (
        <SelectionView 
          onBack={() => setCurrentView('landing')}
          onProceed={(ref, src) => {
            setSelectedReference(ref);
            setSelectedSource(src);
            setCurrentView('processing');
          }}
        />
      )}
      
      {currentView === 'processing' && (
        <ProcessingView 
          reference={selectedReference}
          source={selectedSource}
          onComplete={() => setCurrentView('results')}
        />
      )}
      
      {currentView === 'results' && (
        <ResultsView 
          onBack={() => setCurrentView('selection')}
        />
      )}
    </div>
  );
}

export default App;
