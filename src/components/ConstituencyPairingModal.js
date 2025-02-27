// src/components/ConstituencyPairingModal.js
import React, { useState, useEffect } from 'react';

function ConstituencyPairingModal({ pairings, onSave, onClose }) {
  // State to track edited pairings
  const [editedPairings, setEditedPairings] = useState([]);
  // State to track all available constituencies
  const [allConstituencies, setAllConstituencies] = useState([]);

  // Load all constituencies from data file
  useEffect(() => {
    import('../data/baselineVotes').then(data => {
      setAllConstituencies(Object.keys(data.default));
    });
  }, []);

  // Initialize edited pairings when the modal opens
  useEffect(() => {
    if (pairings.length > 0) {
      setEditedPairings([...pairings]);
    }
  }, [pairings]);

  // Update a specific pairing
  const updatePairing = (index, position, value) => {
    const newPairings = [...editedPairings];
    newPairings[index][position] = value;
    setEditedPairings(newPairings);
  };

  // Handle save button click
  const handleSave = () => {
    // Validation: Check for duplicates
    const allConstituenciesInPairings = editedPairings.flat();
    const uniqueConstituencies = new Set(allConstituenciesInPairings);
    
    if (uniqueConstituencies.size !== allConstituenciesInPairings.length) {
      alert('Each constituency must be used exactly once. Please check for duplicates.');
      return;
    }
    
    onSave(editedPairings);
  };

  return (
    <div className="modal-overlay">
      <div className="modal-container">
        <div className="modal-header">
          <h2 className="modal-title">Edit Constituency Pairings</h2>
          <button 
            className="close-button" 
            onClick={onClose}
            aria-label="Close"
          >
            ×
          </button>
        </div>
        
        <div className="modal-body">
          <p className="modal-description">
            Each constituency must be paired with another to form a Senedd electoral region.
            Select which constituencies should be paired together.
          </p>
          
          <div className="pairings-list">
            {editedPairings.map((pair, index) => (
              <div key={index} className="pairing-row">
                <select
                  value={pair[0]}
                  onChange={(e) => updatePairing(index, 0, e.target.value)}
                  className="constituency-select"
                >
                  {allConstituencies.map(constituency => (
                    <option key={`${index}-0-${constituency}`} value={constituency}>
                      {constituency}
                    </option>
                  ))}
                </select>
                
                <span className="plus-sign">+</span>
                
                <select
                  value={pair[1]}
                  onChange={(e) => updatePairing(index, 1, e.target.value)}
                  className="constituency-select"
                >
                  {allConstituencies.map(constituency => (
                    <option key={`${index}-1-${constituency}`} value={constituency}>
                      {constituency}
                    </option>
                  ))}
                </select>
              </div>
            ))}
          </div>
        </div>
        
        <div className="modal-footer">
          <button 
            className="btn btn-secondary" 
            onClick={onClose}
          >
            Cancel
          </button>
          <button 
            className="btn btn-primary" 
            onClick={handleSave}
          >
            Save Pairings
          </button>
        </div>
      </div>
    </div>
  );
}

export default ConstituencyPairingModal;
