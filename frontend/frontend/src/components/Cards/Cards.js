import React from 'react';
import './Cards.css';

const Cards = ({ submission }) => {
  // If no submission is provided, show a placeholder card
  if (!submission) {
    return (
      <div className="grid-one-item">
        <div className="grid-c-title">
          <h3 className="grid-c-title-text">Project_Name</h3>
        </div>
        <div className="grid-c1-content">
          <h3 className="lg-value">SDG_Name</h3>
          <div className="card-wrapper">
            <span className="card-pin-hidden">•••• •••• ••••</span>
            <span>1234</span>
          </div>
          <div className="text text-silver-v1 expiry-text">
            CSR Score Expires
          </div>
          <div className="text text-silver-v1 expiry-value">
            12/26
          </div>
        </div>
      </div>
    );
  }

  // Display actual submission data
  const { organizationName, sdgCategory, ipfsHash, expirationDate, status, tokenId } = submission;
  
  // Get last 4 characters of the IPFS hash for display
  const hashEnd = ipfsHash ? ipfsHash.slice(-4) : '1234';

  // Determine the status text and class
  const getStatusText = (status) => {
    switch(status) {
      case 'verified': return 'Verified & NFT Minted';
      case 'rejected': return 'Rejected';
      case 'processing': return 'Processing...';
      default: return 'Pending Verification';
    }
  };

  const getStatusClass = (status) => {
    switch(status) {
      case 'verified': return 'status-verified';
      case 'rejected': return 'status-rejected';
      case 'processing': return 'status-processing';
      default: return 'status-pending';
    }
  };

  return (
    <div className="grid-one-item">
      <div className="grid-c-title">
        <h3 className="grid-c-title-text">{organizationName || 'Project_Name'}</h3>
      </div>
      <div className="grid-c1-content">
        <h3 className="lg-value">{sdgCategory || 'SDG_Name'}</h3>
        <div className="card-wrapper">
          <span className="card-pin-hidden">•••• •••• ••••</span>
          <span>{hashEnd}</span>
        </div>
        
        {tokenId && (
          <div className="text text-silver-v1 token-info">
            <span>Token ID: </span>
            <span className="token-id-value">{tokenId}</span>
          </div>
        )}
        
        <div className="text text-silver-v1 expiry-text">
          CSR Score Expires
        </div>
        <div className="text text-silver-v1 expiry-value">
          {expirationDate || '12/26'}
        </div>
        
        {status && (
          <div className={`status-indicator ${getStatusClass(status)}`}>
            <span className="status-dot"></span>
            <span className="status-text">{getStatusText(status)}</span>
          </div>
        )}
      </div>
    </div>
  );
};

export default Cards;