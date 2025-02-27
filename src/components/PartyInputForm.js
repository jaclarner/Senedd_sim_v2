// src/components/PartyInputForm.js
import React, { useState, useEffect } from 'react';

function PartyInputForm({ initialVotes, onSubmit }) {
  // State to hold current vote percentages
  const [votes, setVotes] = useState(initialVotes);
  // State to track total percentage
  const [totalPercentage, setTotalPercentage] = useState(100);
  // State to track if form is valid
  const [isValid, setIsValid] = useState(true);

  // Calculate total percentage whenever votes change
  useEffect(() => {
    const total = Object.values(votes).reduce((sum, value) => sum + value, 0);
    setTotalPercentage(Number(total.toFixed(1)));
    setIsValid(Math.abs(total - 100) <= 0.1);
  }, [votes]);

  // Handle input change for a party
  const handleInputChange = (party, value) => {
    // Convert to number and limit to 1 decimal place
    const numValue = parseFloat(Number(value).toFixed(1));
    
    setVotes({
      ...votes,
      [party]: isNaN(numValue) ? 0 : numValue
    });
  };

  // Handle form submission
  const handleSubmit = (e) => {
    e.preventDefault();
    
    if (isValid) {
      onSubmit(votes);
    } else {
      alert('Total percentage must equal 100%');
    }
  };

  // Party colors for visual indicators
  const partyColors = {
    'Labour': '#DC241f',
    'Conservatives': '#0087DC',
    'PlaidCymru': '#005B54',
    'LibDems': '#FDBB30',
    'Greens': '#6AB023',
    'Reform': '#12B6CF',
    'Abolish': '#590703',
    'Other': '#808080'
  };

  return (
    <form onSubmit={handleSubmit} className="party-input-form">
      <div className="party-inputs">
        {Object.keys(votes).map(party => (
          <div key={party} className="input-group">
            <label htmlFor={`input-${party}`} className="party-label">
              {party === "PlaidCymru" ? "Plaid Cymru" : 
               party === "LibDems" ? "Liberal Democrats" : party}:
            </label>
            <div className="input-container">
              <input
                id={`input-${party}`}
                type="number"
                min="0"
                max="100"
                step="0.1"
                value={votes[party]}
                onChange={(e) => handleInputChange(party, e.target.value)}
                className="party-input"
              />
              <div 
                className="vote-indicator"
                style={{
                  width: `${votes[party]}%`,
                  backgroundColor: partyColors[party],
                  maxWidth: '100%'
                }}
              />
            </div>
          </div>
        ))}
      </div>

      <div className={`total-percentage ${!isValid ? 'invalid' : ''}`}>
        Total: {totalPercentage.toFixed(1)}%
        {!isValid && <span className="error-message"> (Must equal 100%)</span>}
      </div>

      <button 
        type="submit" 
        className="btn btn-primary submit-button"
        disabled={!isValid}
      >
        Calculate Results
      </button>
    </form>
  );
}

export default PartyInputForm;
