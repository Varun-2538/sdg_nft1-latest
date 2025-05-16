import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { v4 as uuidv4 } from 'uuid';
import './SDGUploadForm.css';

const SDGUploadForm = ({ onSubmissionComplete }) => {
  const [formData, setFormData] = useState({
    organizationName: '',
    sdgCategory: '',
    description: '',
    imageLinks: '',
    videoLinks: '',
    walletAddress: '',
    contactEmail: '',
  });
  const [ipfsHash, setIpfsHash] = useState(null);
  const [ipfsTimestamp, setIpfsTimestamp] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [isAuthenticated, setIsAuthenticated] = useState(false);

  // Pinata API keys (move to environment variables in production)
  const PINATA_API_KEY = 'dd6c225a79c3d1ec0ec3';
  const PINATA_SECRET_API_KEY = '39d58d06d58ddff274d01e7d5c847160c9a78ca36892018ec686aae9671fec35';

  // Check authentication status on mount
  useEffect(() => {
    const checkAuth = async () => {
      try {
        const response = await axios.get('https://sdg-nft1.onrender.com/auth/check', { withCredentials: true });
        setIsAuthenticated(response.data.isAuthenticated);
      } catch (err) {
        console.error('Auth check failed:', err);
        setIsAuthenticated(false);
      }
    };
    checkAuth();
  }, []);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData({
      ...formData,
      [name]: value,
    });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!isAuthenticated) {
      setError('Please log in to submit your SDG contribution.');
      return;
    }

    setLoading(true);
    setError(null);

    try {
      // Generate a unique ID for this submission
      const submissionId = uuidv4();
      
      // Calculate expiration date (1 year from now)
      const expirationDate = new Date(new Date().setFullYear(new Date().getFullYear() + 1))
        .toLocaleDateString('en-US', {
          month: '2-digit',
          year: '2-digit'
        });
      
      // Format data for IPFS
      const submissionData = {
        id: submissionId,
        organizationName: formData.organizationName,
        sdgCategory: formData.sdgCategory,
        description: formData.description,
        imageLinks: formData.imageLinks.split(',').map(link => link.trim()).filter(link => link),
        videoLinks: formData.videoLinks.split(',').map(link => link.trim()).filter(link => link),
        walletAddress: formData.walletAddress,
        contactEmail: formData.contactEmail,
        timestamp: new Date().toISOString(),
        expirationDate: expirationDate,
        status: 'pending'
      };

      // Pin to IPFS
      const pinataResponse = await axios.post(
        'https://api.pinata.cloud/pinning/pinJSONToIPFS',
        submissionData,
        {
          headers: {
            pinata_api_key: PINATA_API_KEY,
            pinata_secret_api_key: PINATA_SECRET_API_KEY,
          },
        }
      );

      const hash = pinataResponse.data.IpfsHash;
      setIpfsHash(hash);
      setIpfsTimestamp(new Date().toLocaleString());
      console.log('Data pinned to IPFS:', pinataResponse.data);

      // Store complete submission data in MongoDB via backend
      const backendResponse = await axios.post(
        'https://sdg-nft1.onrender.com/upload',
        { 
          ipfsHash: hash,
          submissionData: submissionData // Send the complete submission data
        },
        { withCredentials: true } // Send session cookie for authentication
      );

      console.log('Backend response:', backendResponse.data);
      
      // Notify parent component that a new submission was added
      if (onSubmissionComplete) {
        onSubmissionComplete();
      }
      
    } catch (err) {
      setError('Failed to upload or save IPFS hash: ' + (err.response?.data?.error || err.message));
      console.error('Error:', err);
    } finally {
      setLoading(false);
    }
  };

  const handleLoginRedirect = () => {
    window.location.href = 'https://sdg-nft1.onrender.com/auth/google'; // Redirect to Google OAuth
  };

  const copyToClipboard = (text) => {
    navigator.clipboard.writeText(text)
      .then(() => {
        alert('IPFS hash copied to clipboard!');
      })
      .catch(err => {
        console.error('Failed to copy: ', err);
      });
  };

  const resetForm = () => {
    setFormData({
      organizationName: '',
      sdgCategory: '',
      description: '',
      imageLinks: '',
      videoLinks: '',
      walletAddress: '',
      contactEmail: '',
    });
    setIpfsHash(null);
    setIpfsTimestamp(null);
  };

  return (
    <div className="form-container">
      {!isAuthenticated ? (
        <div className="auth-card">
          <h2>Authentication Required</h2>
          <p>Please log in to submit your SDG contribution.</p>
          <button className="login-btn" onClick={handleLoginRedirect}>
            <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <path d="M12 22C6.5 22 2 17.5 2 12S6.5 2 12 2s10 4.5 10 10-4.5 10-10 10z"></path>
              <path d="M12 8v8"></path>
              <path d="M8 12h8"></path>
            </svg>
            Login with Google
          </button>
        </div>
      ) : (
        <>
          <form className="sdg-upload-form" onSubmit={handleSubmit}>
            <h2>Submit Your SDG Contribution</h2>

            <div className="form-group">
              <label htmlFor="organizationName">Organization/Individual Name</label>
              <input
                type="text"
                id="organizationName"
                name="organizationName"
                value={formData.organizationName}
                onChange={handleChange}
                required
              />
            </div>

            <div className="form-group">
              <label htmlFor="sdgCategory">SDG Category</label>
              <select
                id="sdgCategory"
                name="sdgCategory"
                value={formData.sdgCategory}
                onChange={handleChange}
                required
              >
                <option value="" disabled>Select SDG Category</option>
                <option value="No Poverty">No Poverty</option>
                <option value="Zero Hunger">Zero Hunger</option>
                <option value="Good Health and Well-being">Good Health and Well-being</option>
                <option value="Quality Education">Quality Education</option>
                <option value="Gender Equality">Gender Equality</option>
                <option value="Clean Water and Sanitation">Clean Water and Sanitation</option>
                <option value="Affordable and Clean Energy">Affordable and Clean Energy</option>
                <option value="Decent Work and Economic Growth">Decent Work and Economic Growth</option>
              </select>
            </div>

            <div className="form-group">
              <label htmlFor="description">Description of SDG Work</label>
              <textarea
                id="description"
                name="description"
                value={formData.description}
                onChange={handleChange}
                required
              ></textarea>
            </div>

            <div className="form-group">
              <label htmlFor="imageLinks">Image Proof Links (Comma-separated)</label>
              <input
                type="text"
                id="imageLinks"
                name="imageLinks"
                value={formData.imageLinks}
                onChange={handleChange}
              />
            </div>

            <div className="form-group">
              <label htmlFor="videoLinks">Video Proof Links (Comma-separated)</label>
              <input
                type="text"
                id="videoLinks"
                name="videoLinks"
                value={formData.videoLinks}
                onChange={handleChange}
              />
            </div>

            <div className="form-group">
              <label htmlFor="walletAddress">Wallet Address (for CSR Token & SDG NFT)</label>
              <input
                type="text"
                id="walletAddress"
                name="walletAddress"
                value={formData.walletAddress}
                onChange={handleChange}
                required
              />
            </div>

            <div className="form-group">
              <label htmlFor="contactEmail">Contact Email</label>
              <input
                type="email"
                id="contactEmail"
                name="contactEmail"
                value={formData.contactEmail}
                onChange={handleChange}
                required
              />
            </div>

            <button type="submit" className="submit-btn" disabled={loading}>
              {loading ? (
                <span className="loading-spinner">
                  <svg className="spinner" viewBox="0 0 50 50">
                    <circle className="path" cx="25" cy="25" r="20" fill="none" strokeWidth="5"></circle>
                  </svg>
                  Submitting...
                </span>
              ) : (
                'Submit for Verification'
              )}
            </button>
          </form>

          {ipfsHash && (
            <div className="ipfs-result">
              <div className="ipfs-success-header">
                <div className="success-icon-container">
                  <svg className="success-icon" xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                    <path d="M22 11.08V12a10 10 0 1 1-5.93-9.14"></path>
                    <polyline points="22 4 12 14.01 9 11.01"></polyline>
                  </svg>
                </div>
                <h3>Successfully Uploaded!</h3>
              </div>
              
              <div className="ipfs-details">
                <div className="ipfs-info-row">
                  <span className="ipfs-label">Status:</span>
                  <span className="ipfs-status">
                    <span className="status-dot"></span>
                    Pinned to IPFS
                  </span>
                </div>
                
                {ipfsTimestamp && (
                  <div className="ipfs-info-row">
                    <span className="ipfs-label">Timestamp:</span>
                    <span className="ipfs-value">{ipfsTimestamp}</span>
                  </div>
                )}
                
                <div className="ipfs-hash-row">
                  <span className="ipfs-label">IPFS Hash:</span>
                  <div className="ipfs-hash-container">
                    <span className="ipfs-hash">{ipfsHash}</span>
                    <button 
                      className="copy-btn" 
                      onClick={() => copyToClipboard(ipfsHash)}
                      title="Copy to clipboard"
                    >
                      <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                        <rect x="9" y="9" width="13" height="13" rx="2" ry="2"></rect>
                        <path d="M5 15H4a2 2 0 0 1-2-2V4a2 2 0 0 1 2-2h9a2 2 0 0 1 2 2v1"></path>
                      </svg>
                    </button>
                  </div>
                </div>
                
                <div className="ipfs-actions">
                  <a 
                    href={`https://ipfs.io/ipfs/${ipfsHash}`} 
                    target="_blank" 
                    rel="noopener noreferrer"
                    className="ipfs-action-btn view-btn"
                  >
                    <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                      <path d="M18 13v6a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V8a2 2 0 0 1 2-2h6"></path>
                      <polyline points="15 3 21 3 21 9"></polyline>
                      <line x1="10" y1="14" x2="21" y2="3"></line>
                    </svg>
                    View on IPFS Gateway
                  </a>
                  
                  <a 
                    href={`https://explore.ipld.io/#/explore/${ipfsHash}`} 
                    target="_blank" 
                    rel="noopener noreferrer"
                    className="ipfs-action-btn explorer-btn"
                  >
                    <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                      <circle cx="11" cy="11" r="8"></circle>
                      <line x1="21" y1="21" x2="16.65" y2="16.65"></line>
                    </svg>
                    Explore IPFS Data
                  </a>
                </div>
                
                <p className="ipfs-note">
                  Your SDG contribution has been permanently stored on IPFS and submitted for verification.
                  You'll receive an email notification once the verification process is complete.
                </p>
                
                <button className="new-submission-btn" onClick={resetForm}>
                  New Submission
                </button>
              </div>
            </div>
          )}
        </>
      )}

      {error && (
        <div className="error-container">
          <div className="error-message">
            <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <circle cx="12" cy="12" r="10"></circle>
              <line x1="12" y1="8" x2="12" y2="12"></line>
              <line x1="12" y1="16" x2="12.01" y2="16"></line>
            </svg>
            {error}
          </div>
        </div>
      )}
    </div>
  );
};

export default SDGUploadForm;