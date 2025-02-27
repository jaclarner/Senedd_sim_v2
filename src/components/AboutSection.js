// src/components/AboutSection.js
import React from 'react';

function AboutSection() {
  return (
    <section className="card about-section">
      <h2 className="section-title">About the Senedd Election Simulator</h2>
      
      <div className="about-content">
        <p>
          This is an informational tool that visualises seat distributions in a future Senedd 
          election under the new voting system and an expanded Senedd. This is a work-in-progress 
          and will be updated and improved over the coming months.
        </p>
        
        <h3>How it works</h3>
        <p>
          The simulator uses the D'Hondt method of proportional representation to allocate seats 
          within each constituency pairing. This is the system that will be used in future Senedd 
          elections following electoral reforms.
        </p>
        
        <h3>Assumptions and limitations</h3>
        <p>
          When allocating seats, the tool makes several assumptions that should be noted:
        </p>
        <ul>
          <li>
            It uses estimates of 2021 vote share under the new constituency boundaries using 
            Welsh Election Study data. This is not a definitive description of what the 2021 
            results would have looked like under the new electoral system and boundaries.
          </li>
          <li>
            It assumes a uniform swing across all constituencies, which may not be the case 
            in a real election.
          </li>
          <li>
            The tool does not account for tactical voting or local factors that might influence 
            results in specific areas.
          </li>
        </ul>
        
        <h3>Contact</h3>
        <p>
          If users have feedback or suggested improvements, or spot errors, please contact: 
          larnerJM[at]cardiff.ac.uk
        </p>
      </div>
    </section>
  );
}

export default AboutSection;
