import React, { useState, useEffect } from 'react';
import PartyInputForm from './PartyInputForm';
import ResultsDisplay from './ResultsDisplay';
import ConstituencyPairingModal from './ConstituencyPairingModal';
import AboutSection from './AboutSection';
import { calculateElectionResults } from '../utils/simulationEngine';
import '../styles/main.css';

function App() {
  // State to store vote percentages for each party
  const [partyVotes, setPartyVotes] = useState({
    Labour: 38.4,
    Conservatives: 25.1,
    PlaidCymru: 22.4,
    LibDems: 4.2,
    Greens: 3.6,
    Reform: 1.1,
    Abolish: 3.0,
    Other: 2.2
  });
  
  // State to store constituency pairings
  const [constituencyPairings, setConstituencyPairings] = useState([]);
  
  // State to store calculated results
  const [results, setResults] = useState(null);
  
  // State to control modal visibility
  const [showPairingModal, setShowPairingModal] = useState(false);
  
  // Load initial constituency pairings from data file
  useEffect(() => {
    // Importing this way allows for dynamic loading
    import('../data/constituencyPairings').then(data => {
      setConstituencyPairings(data.default);
    });
  }, []);
  
  // Calculate results when party votes or constituency pairings change
  useEffect(() => {
    if (constituencyPairings.length > 0) {
      const newResults = calculateElectionResults(partyVotes, constituencyPairings);
      setResults(newResults);
    }
  }, [partyVotes, constituencyPairings]);
  
  // Handle form submission with new vote percentages
  const handleVoteSubmit = (newVotes) => {
    setPartyVotes(newVotes);
  };
  
  // Handle saving of new constituency pairings
  const handlePairingSave = (newPairings) => {
    setConstituencyPairings(newPairings);
    setShowPairingModal(false);
  };
  
  return (
    <div className="app-container">
      <header className="app-header">
        <div className="logo-title">
          <img src="/logo.png" alt="Senedd Election Simulator Logo" className="logo" />
          <div>
            <h1>Senedd Election Simulator</h1>
            <p>Created by Jac Larner</p>
          </div>
        </div>
      </header>
      
      <main className="app-main">
        <div className="grid">
          {/* Left column with form inputs */}
          <div className="card input-section">
            <h2>Enter National Vote Percentages</h2>
            <PartyInputForm 
              initialVotes={partyVotes} 
              onSubmit={handleVoteSubmit} 
            />
            <button 
              className="btn btn-secondary" 
              onClick={() => setShowPairingModal(true)}
            >
              Edit Constituency Pairings
            </button>
          </div>
          
          {/* Right column with results */}
          <div className="results-section">
            {results ? (
              <ResultsDisplay results={results} />
            ) : (
              <div className="loading-message">Calculating results...</div>
            )}
          </div>
        </div>
      </main>
      
      {/* About section */}
      <AboutSection />
      
      {/* Footer */}
      <footer className="app-footer">
        <p>Created by Jac M. Larner</p>
      </footer>
      
      {/* Constituency pairing modal */}
      {showPairingModal && (
        <ConstituencyPairingModal 
          pairings={constituencyPairings} 
          onSave={handlePairingSave} 
          onClose={() => setShowPairingModal(false)} 
        />
      )}
    </div>
  );
}

export default App;
