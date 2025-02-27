// src/components/ResultsDisplay.js
import React, { useEffect, useRef } from 'react';
import { 
  createSeatVisualization, 
  createComparativeChart,
  createAllocationVisualization,
  createCoalitionVisualization,
  createConstituencyTable,
  createClosestContestsTable
} from '../utils/visualizations';

function ResultsDisplay({ results }) {
  // References to DOM elements for visualizations
  const seatVisRef = useRef(null);
  const compareChartRef = useRef(null);
  const coalitionVisRef = useRef(null);
  const constituencyTableRef = useRef(null);
  const closestContestsRef = useRef(null);
  const allocationVisRef = useRef(null);
  
  // Extract data from results
  const { nationalTotals, metrics, constituencyResults, closestContests } = results;

  // Create visualizations when results change
  useEffect(() => {
    if (results) {
      // Create seat visualization
      if (seatVisRef.current) {
        createSeatVisualization(nationalTotals, seatVisRef.current);
      }
      
      // Create comparative chart
      if (compareChartRef.current) {
        createComparativeChart(
          metrics.voteShare, 
          metrics.seatShare, 
          compareChartRef.current
        );
      }
      
      // Create coalition visualization if needed
      if (coalitionVisRef.current) {
        createCoalitionVisualization(
          metrics.possibleCoalitions, 
          coalitionVisRef.current
        );
      }
      
      // Create constituency results table
      if (constituencyTableRef.current) {
        createConstituencyTable(constituencyResults, constituencyTableRef.current);
      }
      
      // Create closest contests table
      if (closestContestsRef.current) {
        createClosestContestsTable(closestContests, closestContestsRef.current);
      }
      
      // Initialize with first constituency for allocation visualization
      if (allocationVisRef.current && constituencyResults.length > 0) {
        // Start with a default selection
        updateAllocationVis(constituencyResults[0]);
      }
    }
  }, [results]);
  
  // Update allocation visualization when constituency changes
  const updateAllocationVis = (constituencyResult) => {
    if (allocationVisRef.current) {
      createAllocationVisualization(
        constituencyResult.allocationHistory, 
        allocationVisRef.current
      );
    }
  };
  
  // Handle constituency selection for allocation visualization
  const handleConstituencySelect = (e) => {
    const constituencyName = e.target.value;
    const selectedConstituency = constituencyResults.find(
      c => c.constituency === constituencyName
    );
    
    if (selectedConstituency) {
      updateAllocationVis(selectedConstituency);
    }
  };
  
  return (
    <div className="results-display">
      <section className="card result-section">
        <h2 className="section-title">National Results</h2>
        <div className="national-summary">
          <div className="summary-item">
            <span className="label">Largest Party:</span>
            <span className="value">{metrics.largestParty}</span>
          </div>
          <div className="summary-item">
            <span className="label">Overall Majority:</span>
            <span className="value">
              {metrics.hasOverallMajority ? 'Yes' : 'No'}
            </span>
          </div>
          <div className="summary-item">
            <span className="label">Majority Threshold:</span>
            <span className="value">{metrics.majorityThreshold} seats</span>
          </div>
          <div className="summary-item">
            <span className="label">Disproportionality Index:</span>
            <span className="value">{metrics.disproportionalityIndex.toFixed(2)}</span>
          </div>
        </div>
        
        <div ref={seatVisRef} className="visualization-container"></div>
      </section>
      
      <section className="card result-section">
        <h2 className="section-title">Vote Share vs. Seat Share</h2>
        <div ref={compareChartRef} className="visualization-container"></div>
      </section>
      
      <section className="card result-section">
        <h2 className="section-title">Constituency Results</h2>
        <div ref={constituencyTableRef} className="visualization-container"></div>
      </section>
      
      <section className="card result-section">
        <h2 className="section-title">Closest Contests</h2>
        <div ref={closestContestsRef} className="visualization-container"></div>
      </section>
      
      <section className="card result-section">
        <h2 className="section-title">Seat Allocation Process</h2>
        <div className="constituency-selector">
          <label htmlFor="constituency-select">Select Constituency:</label>
          <select 
            id="constituency-select" 
            onChange={handleConstituencySelect}
            className="select-input"
          >
            {constituencyResults.map(constituency => (
              <option 
                key={constituency.constituency} 
                value={constituency.constituency}
              >
                {constituency.constituency}
              </option>
            ))}
          </select>
        </div>
        <div ref={allocationVisRef} className="visualization-container"></div>
      </section>
      
      {!metrics.hasOverallMajority && (
        <section className="card result-section">
          <h2 className="section-title">Possible Coalitions</h2>
          <div ref={coalitionVisRef} className="visualization-container"></div>
        </section>
      )}
    </div>
  );
}

export default ResultsDisplay;
