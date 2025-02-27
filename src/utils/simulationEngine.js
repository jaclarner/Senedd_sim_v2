// Simulation Engine for Senedd Election Simulator
// This file contains all the electoral calculation functions

// Import constituency data
import baselineVotes from '../data/baselineVotes';
import constituencyVoters from '../data/constituencyVoters';
import { baselineNationalVotes } from '../data/baselineVotes';

/**
 * Main function to calculate election results
 * @param {Object} nationalVotes - Object with party names as keys and vote percentages as values
 * @param {Array} constituencyPairings - Array of constituency pairs
 * @param {Object} options - Optional configuration
 * @returns {Object} Complete election results
 */
export function calculateElectionResults(nationalVotes, constituencyPairings, options = {}) {
  // Calculate results for all constituencies
  const constituencyResults = calculateAllConstituencies(nationalVotes, constituencyPairings, options);
  
  // Calculate national totals
  const nationalTotals = calculateNationalTotals(constituencyResults);
  
  // Calculate metrics for the election
  const metrics = calculateElectionMetrics(nationalTotals, nationalVotes);
  
  // Find the closest contests
  const closestContests = findClosestContests(constituencyResults);
  
  // Return complete results
  return {
    constituencyResults,
    nationalTotals,
    metrics,
    closestContests
  };
}

/**
 * Calculate results for all constituencies
 * @param {Object} nationalVotes - National vote percentages
 * @param {Array} constituencyPairings - Constituency pairings
 * @param {Object} options - Calculation options
 * @returns {Array} Results for each constituency
 */
function calculateAllConstituencies(nationalVotes, constituencyPairings, options = {}) {
  return constituencyPairings.map(pair => {
    const constituencyName = pair.join(' + ');
    
    // Combine the baseline votes from the paired constituencies
    const combinedBaseline = combineConstituencyVotes(
      baselineVotes[pair[0]], 
      baselineVotes[pair[1]], 
      pair[0], 
      pair[1]
    );
    
    // Apply swing to the combined votes
    const constituencyVotes = applySwing(
      combinedBaseline, 
      nationalVotes, 
      options.swingType || 'uniform'
    );
    
    // Calculate seats using D'Hondt method
    const { results, allocationHistory } = dHondt(constituencyVotes, 6);
    
    // Calculate margin of the last seat
    const lastAllocation = allocationHistory[allocationHistory.length - 1];
    const sortedQuotients = [...lastAllocation.quotients].sort((a, b) => b.quotient - a.quotient);
    const closestMargin = {
      value: sortedQuotients[5].quotient - sortedQuotients[6].quotient,
      winningParty: sortedQuotients[5].party,
      runnerUpParty: sortedQuotients[6].party
    };
    
    return {
      constituency: constituencyName,
      results,
      closestMargin,
      allocationHistory,
      votePercentages: constituencyVotes
    };
  });
}

/**
 * Calculate national totals from constituency results
 * @param {Array} constituencyResults - Results for each constituency
 * @returns {Object} Total seats by party
 */
function calculateNationalTotals(constituencyResults) {
  const totals = {};
  
  constituencyResults.forEach(({ results }) => {
    for (const party in results) {
      totals[party] = (totals[party] || 0) + results[party];
    }
  });
  
  return totals;
}

/**
 * D'Hondt method for allocating seats
 * @param {Object} votes - Vote percentages by party
 * @param {Number} seats - Number of seats to allocate
 * @returns {Object} Results and allocation history
 */
function dHondt(votes, seats) {
  const parties = Object.keys(votes);
  const results = {};
  const allocationHistory = [];
  
  // Initialize results
  parties.forEach(party => results[party] = 0);
  
  // Record initial state
  allocationHistory.push({
    round: 0,
    winner: null,
    quotients: parties.map(party => ({
      party,
      quotient: votes[party],
      seats: results[party],
      votes: votes[party]
    }))
  });
  
  // Allocate seats
  for (let i = 0; i < seats; i++) {
    const quotients = parties.map(party => ({
      party,
      quotient: votes[party] / (results[party] + 1),
      votes: votes[party],
      seats: results[party]
    }));
    
    // Sort quotients in descending order
    quotients.sort((a, b) => b.quotient - a.quotient);
    
    // Allocate seat to the party with the highest quotient
    const winner = quotients[0].party;
    results[winner]++;
    
    // Record this round's allocation
    allocationHistory.push({
      round: i + 1,
      winner,
      quotients
    });
  }
  
  return { results, allocationHistory };
}

/**
 * Combine votes from two constituencies
 * @param {Object} votes1 - Votes from first constituency
 * @param {Object} votes2 - Votes from second constituency
 * @param {String} constituency1 - Name of first constituency
 * @param {String} constituency2 - Name of second constituency
 * @returns {Object} Combined votes
 */
function combineConstituencyVotes(votes1, votes2, constituency1, constituency2) {
  const combined = {};
  
  // Calculate the weight of each constituency based on electorate size
  const totalVoters = constituencyVoters[constituency1] + constituencyVoters[constituency2];
  const weight1 = constituencyVoters[constituency1] / totalVoters;
  const weight2 = constituencyVoters[constituency2] / totalVoters;
  
  // Combine votes with appropriate weighting
  for (const party in votes1) {
    combined[party] = (votes1[party] * weight1) + (votes2[party] * weight2);
  }
  
  return combined;
}

/**
 * Apply swing to constituency votes
 * @param {Object} baselineVotes - Baseline vote percentages
 * @param {Object} nationalVotes - Target national vote percentages
 * @param {String} swingType - Type of swing calculation ('uniform', 'proportional')
 * @returns {Object} Adjusted vote percentages
 */
function applySwing(baselineVotes, nationalVotes, swingType = 'uniform') {
  const swingVotes = {};
  
  if (swingType === 'uniform') {
    // Uniform swing: add/subtract the same percentage points in every constituency
    for (const party in baselineVotes) {
      const nationalSwing = nationalVotes[party] - baselineNationalVotes[party];
      swingVotes[party] = Math.max(0, baselineVotes[party] + nationalSwing);
    }
  } else if (swingType === 'proportional') {
    // Proportional swing: change by the same ratio as the national swing
    for (const party in baselineVotes) {
      const ratio = nationalVotes[party] / baselineNationalVotes[party];
      swingVotes[party] = baselineVotes[party] * ratio;
    }
  }
  
  // Normalize to ensure the total equals 100%
  const totalVotes = Object.values(swingVotes).reduce((sum, value) => sum + value, 0);
  for (const party in swingVotes) {
    swingVotes[party] = (swingVotes[party] / totalVotes) * 100;
  }
  
  return swingVotes;
}

/**
 * Calculate additional metrics for the election
 * @param {Object} seatTotals - Total seats by party
 * @param {Object} votePercentages - Vote percentages by party
 * @returns {Object} Election metrics
 */
function calculateElectionMetrics(seatTotals, votePercentages) {
  const totalSeats = Object.values(seatTotals).reduce((sum, seats) => sum + seats, 0);
  const metrics = {
    seatShare: {},
    voteShare: { ...votePercentages },
    disproportionalityIndex: 0,
    majorityThreshold: Math.ceil(totalSeats / 2),
    hasOverallMajority: false,
    largestParty: null,
    possibleCoalitions: []
  };
  
  // Calculate seat shares and find largest party
  let maxSeats = 0;
  for (const party in seatTotals) {
    metrics.seatShare[party] = (seatTotals[party] / totalSeats) * 100;
    
    if (seatTotals[party] > maxSeats) {
      maxSeats = seatTotals[party];
      metrics.largestParty = party;
    }
    
    if (seatTotals[party] >= metrics.majorityThreshold) {
      metrics.hasOverallMajority = true;
    }
  }
  
  // Calculate Gallagher disproportionality index
  // This measures how proportional the results are
  let sumSquaredDifferences = 0;
  for (const party in votePercentages) {
    const votePct = votePercentages[party];
    const seatPct = metrics.seatShare[party] || 0;
    sumSquaredDifferences += Math.pow(votePct - seatPct, 2);
  }
  metrics.disproportionalityIndex = Math.sqrt(sumSquaredDifferences / 2);
  
  // Find possible coalitions that could form a majority
  if (!metrics.hasOverallMajority) {
    const parties = Object.keys(seatTotals).filter(party => seatTotals[party] > 0);
    
    // Check all 2-party coalitions
    for (let i = 0; i < parties.length; i++) {
      for (let j = i + 1; j < parties.length; j++) {
        const coalition = [parties[i], parties[j]];
        const totalCoalitionSeats = seatTotals[parties[i]] + seatTotals[parties[j]];
        
        if (totalCoalitionSeats >= metrics.majorityThreshold) {
          metrics.possibleCoalitions.push({
            parties: coalition,
            seats: totalCoalitionSeats,
            majority: totalCoalitionSeats - metrics.majorityThreshold + 1,
            partySeatCounts: {
              [parties[i]]: seatTotals[parties[i]],
              [parties[j]]: seatTotals[parties[j]]
            }
          });
        }
      }
    }
    
    // Check all 3-party coalitions if needed
    if (metrics.possibleCoalitions.length === 0) {
      for (let i = 0; i < parties.length; i++) {
        for (let j = i + 1; j < parties.length; j++) {
          for (let k = j + 1; k < parties.length; k++) {
            const coalition = [parties[i], parties[j], parties[k]];
            const totalCoalitionSeats = seatTotals[parties[i]] + seatTotals[parties[j]] + seatTotals[parties[k]];
            
            if (totalCoalitionSeats >= metrics.majorityThreshold) {
              metrics.possibleCoalitions.push({
                parties: coalition,
                seats: totalCoalitionSeats,
                majority: totalCoalitionSeats - metrics.majorityThreshold + 1,
                partySeatCounts: {
                  [parties[i]]: seatTotals[parties[i]],
                  [parties[j]]: seatTotals[parties[j]],
                  [parties[k]]: seatTotals[parties[k]]
                }
              });
            }
          }
        }
      }
    }
    
    // Sort coalitions by number of seats (descending)
    metrics.possibleCoalitions.sort((a, b) => b.seats - a.seats);
  }
  
  return metrics;
}

/**
 * Find the closest contests across all constituencies
 * @param {Array} constituencyResults - Results for each constituency
 * @param {Number} limit - Maximum number of contests to return
 * @returns {Array} Closest contests
 */
function findClosestContests(constituencyResults, limit = 5) {
  // Sort by the margin of the closest contest
  const sortedContests = [...constituencyResults]
    .sort((a, b) => a.closestMargin.value - b.closestMargin.value)
    .slice(0, limit);
  
  return sortedContests.map(contest => ({
    constituency: contest.constituency,
    margin: contest.closestMargin.value,
    winningParty: contest.closestMargin.winningParty,
    runnerUpParty: contest.closestMargin.runnerUpParty
  }));
}

// Export additional utility functions that might be useful elsewhere
export {
  dHondt,
  applySwing,
  calculateElectionMetrics
};
