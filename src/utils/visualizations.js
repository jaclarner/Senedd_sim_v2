// Visualization Utilities for Senedd Election Simulator
// This file contains functions for creating interactive visualizations

/**
 * Creates an interactive seat visualization 
 * @param {Object} nationalTotals - Total seats by party
 * @param {HTMLElement} container - DOM element to render the visualization
 * @param {Object} options - Configuration options
 */
export function createSeatVisualization(nationalTotals, container, options = {}) {
  // Default options
  const {
    majorityThreshold = 49,
    partyColors = {
      'Labour': '#DC241f',
      'Conservatives': '#0087DC',
      'PlaidCymru': '#005B54',
      'LibDems': '#FDBB30',
      'Greens': '#6AB023',
      'Reform': '#12B6CF',
      'Abolish': '#590703',
      'Other': '#808080'
    },
    animation = true,
    columns = 12
  } = options;

  // Clear any existing content
  container.innerHTML = '';

  // Create elements
  const gridContainer = document.createElement('div');
  gridContainer.className = 'seat-grid';
  gridContainer.style.display = 'grid';
  gridContainer.style.gridTemplateColumns = `repeat(${columns}, 1fr)`;
  gridContainer.style.gap = '3px';
  gridContainer.style.width = '100%';

  const legendContainer = document.createElement('div');
  legendContainer.className = 'legend-container';
  
  // Get all parties with seats
  const parties = Object.keys(nationalTotals).filter(party => nationalTotals[party] > 0);
  
  // Calculate total seats
  const totalSeats = parties.reduce((sum, party) => sum + nationalTotals[party], 0);
  
  // Create legend
  parties.forEach(party => {
    const legendItem = document.createElement('div');
    legendItem.className = 'legend-item';
    
    const colorBox = document.createElement('span');
    colorBox.className = 'color-box';
    colorBox.style.backgroundColor = partyColors[party];
    
    const partyName = document.createElement('span');
    partyName.className = 'party-name';
    partyName.textContent = `${party === 'PlaidCymru' ? 'Plaid Cymru' : 
                             party === 'LibDems' ? 'Liberal Democrats' : party}: ${nationalTotals[party]}`;
    
    legendItem.appendChild(colorBox);
    legendItem.appendChild(partyName);
    legendContainer.appendChild(legendItem);
  });
  
  // Create all seats
  const seats = [];
  for (let i = 0; i < totalSeats; i++) {
    const seat = document.createElement('div');
    seat.className = 'seat';
    
    // Mark the majority threshold
    if (i + 1 === majorityThreshold) {
      seat.className += ' majority-seat';
    }
    
    gridContainer.appendChild(seat);
    seats.push(seat);
  }
  
  // Allocate seats to parties with animation
  let seatIndex = 0;
  const delay = animation ? 30 : 0; // ms between seat allocations

  parties.forEach(party => {
    const color = partyColors[party];
    const partySeats = nationalTotals[party];
    
    for (let i = 0; i < partySeats; i++) {
      if (seatIndex < seats.length) {
        const seat = seats[seatIndex];
        
        if (animation) {
          // Apply animation with delay
          setTimeout(() => {
            seat.style.backgroundColor = color;
            seat.setAttribute('data-party', party);
          }, delay * seatIndex);
        } else {
          // Apply immediately
          seat.style.backgroundColor = color;
          seat.setAttribute('data-party', party);
        }
        
        seatIndex++;
      }
    }
  });
  
  // Add components to container
  container.appendChild(gridContainer);
  container.appendChild(legendContainer);
  
  // Add majority label
  const majorityLabel = document.createElement('div');
  majorityLabel.className = 'majority-label';
  majorityLabel.textContent = `Majority: ${majorityThreshold} seats`;
  container.appendChild(majorityLabel);
  
  return {
    update: (newTotals) => createSeatVisualization(newTotals, container, options)
  };
}

/**
 * Creates a visualization of the D'Hondt allocation process
 * @param {Array} allocationHistory - History of allocation rounds
 * @param {HTMLElement} container - DOM element to render the visualization
 */
export function createAllocationVisualization(allocationHistory, container) {
  // Clear container
  container.innerHTML = '';
  
  // Create slider for rounds
  const sliderContainer = document.createElement('div');
  sliderContainer.className = 'slider-container';
  
  const sliderLabel = document.createElement('label');
  sliderLabel.htmlFor = 'round-slider';
  sliderLabel.textContent = 'Allocation Round: ';
  
  const roundNumber = document.createElement('span');
  roundNumber.id = 'round-number';
  roundNumber.textContent = '1';
  sliderLabel.appendChild(roundNumber);
  
  const slider = document.createElement('input');
  slider.type = 'range';
  slider.id = 'round-slider';
  slider.min = '1';
  slider.max = allocationHistory.length - 1;
  slider.value = '1';
  slider.className = 'round-slider';
  
  sliderContainer.appendChild(sliderLabel);
  sliderContainer.appendChild(slider);
  container.appendChild(sliderContainer);
  
  // Create table container
  const tableContainer = document.createElement('div');
  tableContainer.className = 'allocation-table-container';
  container.appendChild(tableContainer);
  
  // Function to update the visualization
  function updateVisualization(round) {
    roundNumber.textContent = round;
    
    const allocation = allocationHistory[round];
    
    // Create table
    const table = document.createElement('table');
    table.className = 'allocation-table';
    
    // Table header
    const thead = document.createElement('thead');
    const headerRow = document.createElement('tr');
    
    ['Party', 'Votes', 'Divisor', 'Quotient', 'Seats'].forEach(header => {
      const th = document.createElement('th');
      th.textContent = header;
      headerRow.appendChild(th);
    });
    
    thead.appendChild(headerRow);
    table.appendChild(thead);
    
    // Table body
    const tbody = document.createElement('tbody');
    
    // Sort quotients in descending order
    const sortedQuotients = [...allocation.quotients].sort((a, b) => b.quotient - a.quotient);
    
    sortedQuotients.forEach((q, index) => {
      const row = document.createElement('tr');
      
      // Highlight the winning party
      if (q.party === allocation.winner) {
        row.className = 'winning-row';
      }
      
      // Add cells
      const partyCell = document.createElement('td');
      partyCell.textContent = q.party === 'PlaidCymru' ? 'Plaid Cymru' : 
                             q.party === 'LibDems' ? 'Liberal Democrats' : q.party;
      row.appendChild(partyCell);
      
      const votesCell = document.createElement('td');
      votesCell.textContent = q.votes.toFixed(1);
      row.appendChild(votesCell);
      
      const divisorCell = document.createElement('td');
      divisorCell.textContent = q.seats + 1;
      row.appendChild(divisorCell);
      
      const quotientCell = document.createElement('td');
      quotientCell.textContent = q.quotient.toFixed(2);
      row.appendChild(quotientCell);
      
      const seatsCell = document.createElement('td');
      seatsCell.textContent = q.seats;
      row.appendChild(seatsCell);
      
      tbody.appendChild(row);
    });
    
    table.appendChild(tbody);
    
    // Update the table container
    tableContainer.innerHTML = '';
    tableContainer.appendChild(table);
    
    // Add explanation
    const explanation = document.createElement('div');
    explanation.className = 'allocation-explanation';
    
    if (round > 0) {
      explanation.innerHTML = `<p>In round ${round}, a seat was awarded to <strong>${allocation.winner === 'PlaidCymru' ? 'Plaid Cymru' : 
                              allocation.winner === 'LibDems' ? 'Liberal Democrats' : 
                              allocation.winner}</strong> because they had the highest quotient (${sortedQuotients[0].quotient.toFixed(2)}).</p>`;
    } else {
      explanation.innerHTML = '<p>Initial state before any seats are allocated.</p>';
    }
    
    tableContainer.appendChild(explanation);
  }
  
  // Add event listener to the slider
  slider.addEventListener('input', () => {
    updateVisualization(parseInt(slider.value));
  });
  
  // Initialize with the first round
  updateVisualization(1);
}

/**
 * Creates a comparative bar chart of vote share vs. seat share
 * @param {Object} voteShare - Vote percentages by party
 * @param {Object} seatShare - Seat percentages by party
 * @param {HTMLElement} container - DOM element to render the chart
 */
export function createComparativeChart(voteShare, seatShare, container) {
  // Clear container
  container.innerHTML = '';
  
  // Chart title
  const title = document.createElement('h3');
  title.className = 'chart-title';
  title.textContent = 'Vote Share vs. Seat Share';
  container.appendChild(title);
  
  // Get parties and sort by vote share
  const parties = Object.keys(voteShare);
  parties.sort((a, b) => voteShare[b] - voteShare[a]);
  
  // Create chart container
  const chartContainer = document.createElement('div');
  chartContainer.className = 'comparative-chart';
  
  // Add bars for each party
  parties.forEach(party => {
    // Skip parties with very low vote share
    if (voteShare[party] < 1 && !seatShare[party]) return;
    
    const partyRow = document.createElement('div');
    partyRow.className = 'party-row';
    
    // Party name
    const partyName = document.createElement('div');
    partyName.className = 'party-name';
    partyName.textContent = party === 'PlaidCymru' ? 'Plaid Cymru' : 
                           party === 'LibDems' ? 'Liberal Democrats' : party;
    
    // Vote share bar
    const voteBarContainer = document.createElement('div');
    voteBarContainer.className = 'bar-container';
    
    const voteBar = document.createElement('div');
    voteBar.className = 'vote-bar';
    voteBar.style.width = `${voteShare[party]}%`;
    
    const voteLabel = document.createElement('span');
    voteLabel.className = 'bar-label';
    voteLabel.textContent = `${voteShare[party].toFixed(1)}%`;
    
    voteBarContainer.appendChild(voteBar);
    voteBarContainer.appendChild(voteLabel);
    
    // Seat share bar
    const seatBarContainer = document.createElement('div');
    seatBarContainer.className = 'bar-container';
    
    const seatBar = document.createElement('div');
    seatBar.className = 'seat-bar';
    seatBar.style.width = `${seatShare[party] || 0}%`;
    
    const seatLabel = document.createElement('span');
    seatLabel.className = 'bar-label';
    seatLabel.textContent = `${(seatShare[party] || 0).toFixed(1)}%`;
    
    seatBarContainer.appendChild(seatBar);
    seatBarContainer.appendChild(seatLabel);
    
    // Add everything to the row
    partyRow.appendChild(partyName);
    partyRow.appendChild(voteBarContainer);
    partyRow.appendChild(seatBarContainer);
    
    chartContainer.appendChild(partyRow);
  });
  
  // Legend
  const legend = document.createElement('div');
  legend.className = 'chart-legend';
  
  const voteLegend = document.createElement('div');
  voteLegend.className = 'legend-item';
  voteLegend.innerHTML = '<span class="vote-legend-color"></span> Vote Share';
  
  const seatLegend = document.createElement('div');
  seatLegend.className = 'legend-item';
  seatLegend.innerHTML = '<span class="seat-legend-color"></span> Seat Share';
  
  legend.appendChild(voteLegend);
  legend.appendChild(seatLegend);
  
  container.appendChild(chartContainer);
  container.appendChild(legend);
  
  // Add explanation
  const explanation = document.createElement('p');
  explanation.className = 'chart-explanation';
  explanation.textContent = 'This chart shows the difference between each party\'s share of the vote and their resulting share of seats. A proportional system would show similar percentages for both.';
  
  container.appendChild(explanation);
}

/**
 * Creates a visualization of possible coalition governments
 * @param {Array} coalitions - Possible coalition configurations
 * @param {HTMLElement} container - DOM element to render the visualization
 * @param {Object} options - Configuration options
 */
export function createCoalitionVisualization(coalitions, container, options = {}) {
  // Default options
  const {
    partyColors = {
      'Labour': '#DC241f',
      'Conservatives': '#0087DC',
      'PlaidCymru': '#005B54',
      'LibDems': '#FDBB30',
      'Greens': '#6AB023',
      'Reform': '#12B6CF',
      'Abolish': '#590703',
      'Other': '#808080'
    },
    maxCoalitions = 5
  } = options;
  
  // Clear container
  container.innerHTML = '';
  
  // Title
  const title = document.createElement('h3');
  title.className = 'section-title';
  title.textContent = 'Possible Coalitions';
  container.appendChild(title);
  
  // No coalitions needed if a party has majority
  if (coalitions.length === 0) {
    const message = document.createElement('p');
    message.textContent = 'No coalitions needed - a party has an overall majority.';
    container.appendChild(message);
    return;
  }
  
  // Container for coalition cards
  const coalitionsContainer = document.createElement('div');
  coalitionsContainer.className = 'coalitions-container';
  
  // Show only top coalitions
  const topCoalitions = coalitions.slice(0, maxCoalitions);
  
  topCoalitions.forEach((coalition, index) => {
    const card = document.createElement('div');
    card.className = 'coalition-card';
    
    // Card header
    const header = document.createElement('div');
    header.className = 'coalition-header';
    
    const coalitionTitle = document.createElement('h4');
    const partyNames = coalition.parties.map(party => 
      party === 'PlaidCymru' ? 'Plaid Cymru' : 
      party === 'LibDems' ? 'Liberal Democrats' : party
    );
    coalitionTitle.textContent = `Coalition ${index + 1}: ${partyNames.join(' + ')}`;
    
    const seatCount = document.createElement('span');
    seatCount.className = 'coalition-seats';
    seatCount.textContent = `${coalition.seats} seats`;
    
    header.appendChild(coalitionTitle);
    header.appendChild(seatCount);
    
    // Coalition details
    const details = document.createElement('div');
    details.className = 'coalition-details';
    
    const majorityText = document.createElement('p');
    majorityText.textContent = `Majority of ${coalition.majority} ${coalition.majority === 1 ? 'seat' : 'seats'}`;
    details.appendChild(majorityText);
    
    // Visualization bar
    const bar = document.createElement('div');
    bar.className = 'coalition-bar';
    
    coalition.parties.forEach(party => {
      const partySeats = coalition.partySeatCounts[party];
      const partyPercentage = (partySeats / coalition.seats) * 100;
      
      const partySegment = document.createElement('div');
      partySegment.className = 'party-segment';
      partySegment.style.width = `${partyPercentage}%`;
      partySegment.style.backgroundColor = partyColors[party];
      partySegment.title = `${party}: ${partySeats} seats`;
      
      bar.appendChild(partySegment);
    });
    
    details.appendChild(bar);
    
    // Party breakdown
    const breakdown = document.createElement('div');
    breakdown.className = 'coalition-breakdown';
    
    coalition.parties.forEach(party => {
      const partyItem = document.createElement('div');
      partyItem.className = 'party-item';
      
      const partyColor = document.createElement('span');
      partyColor.className = 'party-color';
      partyColor.style.backgroundColor = partyColors[party];
      
      const partyText = document.createElement('span');
      partyText.textContent = `${party === 'PlaidCymru' ? 'Plaid Cymru' : 
                             party === 'LibDems' ? 'Liberal Democrats' : party}: ${coalition.partySeatCounts[party]} seats`;
      
      partyItem.appendChild(partyColor);
      partyItem.appendChild(partyText);
      breakdown.appendChild(partyItem);
    });
    
    details.appendChild(breakdown);
    
    // Add everything to the card
    card.appendChild(header);
    card.appendChild(details);
    coalitionsContainer.appendChild(card);
  });
  
  container.appendChild(coalitionsContainer);
  
  // Note if there are more coalitions
  if (coalitions.length > maxCoalitions) {
    const note = document.createElement('p');
    note.className = 'coalitions-note';
    note.textContent = `Showing top ${maxCoalitions} of ${coalitions.length} possible coalitions.`;
    container.appendChild(note);
  }
}

/**
 * Creates a table of results by constituency
 * @param {Array} constituencyResults - Results for each constituency
 * @param {HTMLElement} container - DOM element to render the table
 */
export function createConstituencyTable(constituencyResults, container) {
  // Clear container
  container.innerHTML = '';
  
  // Title
  const title = document.createElement('h3');
  title.className = 'section-title';
  title.textContent = 'Results by Constituency';
  container.appendChild(title);
  
  // Create table
  const tableContainer = document.createElement('div');
  tableContainer.className = 'table-responsive';
  
  const table = document.createElement('table');
  table.className = 'constituency-table';
  
  // Get all parties that won any seats
  const allParties = new Set();
  constituencyResults.forEach(constituency => {
    Object.keys(constituency.results).forEach(party => {
      if (constituency.results[party] > 0) {
        allParties.add(party);
      }
    });
  });
  
  const parties = Array.from(allParties).sort();
  
  // Create header
  const thead = document.createElement('thead');
  const headerRow = document.createElement('tr');
  
  const constituencyHeader = document.createElement('th');
  constituencyHeader.textContent = 'Constituency';
  headerRow.appendChild(constituencyHeader);
  
  parties.forEach(party => {
    const th = document.createElement('th');
    th.textContent = party === 'PlaidCymru' ? 'PC' : 
                    party === 'Conservatives' ? 'Con' :
                    party === 'Labour' ? 'Lab' :
                    party === 'LibDems' ? 'LD' :
                    party === 'Greens' ? 'Grn' :
                    party === 'Reform' ? 'Ref' :
                    party === 'Abolish' ? 'Abl' : 'Oth';
    headerRow.appendChild(th);
  });
  
  thead.appendChild(headerRow);
  table.appendChild(thead);
  
  // Create body
  const tbody = document.createElement('tbody');
  
  constituencyResults.forEach(constituency => {
    const row = document.createElement('tr');
    
    const constituencyCell = document.createElement('td');
    constituencyCell.textContent = constituency.constituency;
    row.appendChild(constituencyCell);
    
    parties.forEach(party => {
      const td = document.createElement('td');
      td.textContent = constituency.results[party] || 0;
      
      // Highlight party with most seats
      if (party === Object.entries(constituency.results)
          .sort((a, b) => b[1] - a[1])[0][0]) {
        td.className = 'winning-party';
      }
      
      row.appendChild(td);
    });
    
    tbody.appendChild(row);
  });
  
  table.appendChild(tbody);
  tableContainer.appendChild(table);
  container.appendChild(tableContainer);
}

/**
 * Creates a table of closest contests
 * @param {Array} closestContests - Array of closest contests
 * @param {HTMLElement} container - DOM element to render the table
 */
export function createClosestContestsTable(closestContests, container) {
  // Clear container
  container.innerHTML = '';
  
  // Title
  const title = document.createElement('h3');
  title.className = 'section-title';
  title.textContent = 'Closest Contests';
  container.appendChild(title);
  
  // Create table
  const table = document.createElement('table');
  table.className = 'closest-contests-table';
  
  // Create header
  const thead = document.createElement('thead');
  const headerRow = document.createElement('tr');
  
  ['Constituency', 'Margin', 'Winning Party', 'Runner-up Party'].forEach(header => {
    const th = document.createElement('th');
    th.textContent = header;
    headerRow.appendChild(th);
  });
  
  thead.appendChild(headerRow);
  table.appendChild(thead);
  
  // Create body
  const tbody = document.createElement('tbody');
  
  closestContests.forEach(contest => {
    const row = document.createElement('tr');
    
    const constituencyCell = document.createElement('td');
    constituencyCell.textContent = contest.constituency;
    row.appendChild(constituencyCell);
    
    const marginCell = document.createElement('td');
    marginCell.textContent = contest.margin.toFixed(2);
    row.appendChild(marginCell);
    
    const winningCell = document.createElement('td');
    winningCell.textContent = contest.winningParty === 'PlaidCymru' ? 'Plaid Cymru' : 
                             contest.winningParty === 'LibDems' ? 'Liberal Democrats' : 
                             contest.winningParty;
    row.appendChild(winningCell);
    
    const runnerUpCell = document.createElement('td');
    runnerUpCell.textContent = contest.runnerUpParty === 'PlaidCymru' ? 'Plaid Cymru' : 
                              contest.runnerUpParty === 'LibDems' ? 'Liberal Democrats' : 
                              contest.runnerUpParty;
    row.appendChild(runnerUpCell);
    
    tbody.appendChild(row);
  });
  
  table.appendChild(tbody);
  container.appendChild(table);
  
  // Add explanation
  const explanation = document.createElement('p');
  explanation.className = 'table-explanation';
  explanation.textContent = 'These are the constituencies where the margin between the last seat allocated and the next party was closest.';
  container.appendChild(explanation);
}
