import React, { useEffect, useState } from 'react';
import axios from 'axios';
import { useUser } from '@civic/auth-web3/react';
import { useAutoConnect } from '@civic/auth-web3/wagmi';
import { useAccount, useChainId, useSwitchChain, usePublicClient, useWriteContract, useBalance } from 'wagmi';
import { parseEventLogs } from 'viem';
import { polygon } from 'wagmi/chains';
import abi from './abi.json'; // Import ABI from abi.json
import "./VerifierPage.css";

const VerifierPage = () => {
  const [hashesData, setHashesData] = useState([]);
  const [error, setError] = useState(null);
  const [loading, setLoading] = useState(true);
  const [minting, setMinting] = useState({}); // Track minting state for each hash

  // Civic Auth hook to get user and wallet
  const userContext = useUser();
  
  // Automatically connect the embedded wallet
  useAutoConnect();

  // Wagmi hooks for wallet and chain management
  const { isConnected, address } = useAccount();
  const chainId = useChainId();
  const { switchChain } = useSwitchChain();
  const publicClient = usePublicClient();

  const contractAddress = "0xfca1de71c81c93ecf2d6826449b980be7c5e843b"; // Your deployed contract address
  const metadataCID = "bafkreieohqzzg7d7bebt7wviwi45r6cprgbqryswnkqe7pnmfu4l4m6d3a";
  const metadataURI = `https://ipfs.io/ipfs/${metadataCID}`;

  // Updated: Use useWriteContract instead of useContractWrite
  const { writeContractAsync } = useWriteContract();

  // Fetch Polygon balance for the connected wallet
  const { data: balance, isLoading: balanceLoading } = useBalance({
    address: address,
    chainId: polygon.id,
  });

  // Fetch IPFS Data and Extract Wallet Address
  const fetchIpfsData = async (hash) => {
    try {
      const response = await axios.get(`https://ipfs.io/ipfs/${hash}`);
      console.log(`IPFS Data for ${hash}:`, response.data);
      return {
        walletAddress: response.data.walletAddress || 'N/A',
        id: response.data.id || null
      };
    } catch (error) {
      console.error(`Error fetching IPFS data for hash ${hash}:`, error);
      return { walletAddress: 'N/A', id: null };
    }
  };

  // Fetch all submissions with their status (NO AUTH REQUIRED)
  const fetchSubmissions = async () => {
    try {
      setLoading(true);
      
      // Fetch submissions without authentication
      const submissionsResponse = await axios.get('https://sdg-nft1.onrender.com/upload/all-submissions-simple');
      
      console.log('Submissions response:', submissionsResponse.data);
      
      const submissionsMap = {};
      if (submissionsResponse.data.success) {
        submissionsResponse.data.submissions.forEach(submission => {
          const status = submission.status === 'processing' ? 'pending' : submission.status;
          submissionsMap[submission.ipfsHash] = {
            ...submission,
            status
          };
          console.log(`Mapped submission ${submission.ipfsHash} with status: ${status}`);
        });
      }
      
      // Fetch all users and their IPFS hashes without authentication
      const response = await axios.get('https://sdg-nft1.onrender.com/upload/all-users-hashes');
      console.log('Users API Response:', response.data);
      
      if (response.data.success) {
        const users = response.data.data;

        const usersWithWalletAddresses = await Promise.all(users.map(async (user) => {
          const hashesWithWallets = await Promise.all(
            user.ipfsHashes.map(async (hash) => {
              const { walletAddress, id } = await fetchIpfsData(hash);
              
              let status = 'pending';
              let tokenId = null;
              
              if (submissionsMap[hash]) {
                status = submissionsMap[hash].status === 'processing' ? 'pending' : submissionsMap[hash].status;
                tokenId = submissionsMap[hash].tokenId;
                console.log(`Found status for ${hash}: ${status}, tokenId: ${tokenId}`);
              } else {
                console.log(`No submission found for hash: ${hash}, using default status: pending`);
              }
              
              return { 
                hash, 
                walletAddress,
                id,
                status,
                tokenId
              };
            })
          );
          
          return { ...user, ipfsHashes: hashesWithWallets };
        }));

        console.log('Processed user data:', usersWithWalletAddresses);
        setHashesData(usersWithWalletAddresses);
      } else {
        setError('Failed to fetch data');
      }
    } catch (err) {
      console.error('Error fetching data:', err);
      setError('Failed to load data');
    } finally {
      setLoading(false);
    }
  };

  // Initial data fetch
  useEffect(() => {
    fetchSubmissions();
    
    const intervalId = setInterval(() => {
      fetchSubmissions();
    }, 30000);
    
    return () => clearInterval(intervalId);
  }, []);

  // Ensure Polygon network
  useEffect(() => {
    if (isConnected && chainId !== polygon.id) {
      console.log('Switching to Polygon network...');
      switchChain({ chainId: polygon.id });
    }
  }, [isConnected, chainId, switchChain]);

  // Log wallet and provider details for debugging
  useEffect(() => {
    if (userContext.user) {
      console.log('Civic user authenticated:', userContext.user);
      console.log('Wagmi connected:', isConnected);
      console.log('Wagmi address:', address);
      console.log('Current chain ID:', chainId);
      console.log('writeContractAsync available:', !!writeContractAsync);
    }
  }, [userContext.user, isConnected, address, chainId, writeContractAsync]);

  // Update submission status in the database
  const updateSubmissionStatus = async (ipfsHash, status, tokenId = null, nftDetails = {}) => {
    try {
      console.log(`Updating status for ${ipfsHash} to ${status}${tokenId ? ` with tokenId ${tokenId}` : ''}`);
      
      const updateData = { status };
      if (tokenId) {
        updateData.tokenId = tokenId;
      }
      
      // Add NFT details if provided
      if (nftDetails.transactionHash) {
        updateData.transactionHash = nftDetails.transactionHash;
      }
      if (nftDetails.raribleLink) {
        updateData.raribleLink = nftDetails.raribleLink;
      }
      if (nftDetails.contractAddress) {
        updateData.contractAddress = nftDetails.contractAddress;
      }
      if (nftDetails.nftMetadataURI) {
        updateData.nftMetadataURI = nftDetails.nftMetadataURI;
      }
      
      const timestamp = new Date().getTime();
      
      const response = await axios.put(
        `https://sdg-nft1.onrender.com/upload/update-status/${ipfsHash}?t=${timestamp}`,
        updateData,
        { 
          withCredentials: true,
          headers: {
            'Content-Type': 'application/json',
            'Cache-Control': 'no-cache'
          }
        }
      );
      
      console.log('Status update response:', response.data);
      
      if (response.data.success) {
        console.log(`Successfully updated status for ${ipfsHash} to ${status}`);
        return true;
      } else {
        console.error('Failed to update status:', response.data.message);
        return false;
      }
    } catch (error) {
      console.error('Error updating submission status:', error);
      return false;
    }
  };

  // Mint NFT using Wagmi
  const mintNFT = async (walletAddress, hash, userIndex, hashIndex) => {
    console.log('Minting Function Called with:');
    console.log('Wallet Address (Recipient):', walletAddress);
    console.log('IPFS Hash:', hash);
    console.log('Metadata URI:', metadataURI);
    console.log('Verifier Address:', address);
    console.log('Connected:', isConnected);
    console.log('Chain ID:', chainId);
    console.log('writeContractAsync available:', !!writeContractAsync);

    if (!walletAddress || walletAddress === 'N/A') {
      alert('❌ Invalid wallet address provided.');
      return;
    }

    if (!userContext.user) {
      alert('❌ Please authenticate with Civic.');
      return;
    }

    if (!isConnected || !address) {
      alert('❌ Wallet not connected. Please ensure your wallet is connected.');
      return;
    }

    if (chainId !== polygon.id) {
      alert('❌ Please switch to the Polygon network.');
      try {
        switchChain({ chainId: polygon.id });
      } catch (error) {
        console.error('Failed to switch network:', error);
        return;
      }
    }

    if (!writeContractAsync) {
      alert('❌ Contract write function not available. Please check configuration.');
      return;
    }

    try {
      // Update UI to show minting in progress
      setMinting(prev => ({ ...prev, [`${userIndex}-${hashIndex}`]: true }));

      // Validate wallet address format
      if (!walletAddress.startsWith('0x') || walletAddress.length !== 42) {
        throw new Error('Invalid wallet address format');
      }

      // Send transaction to mint NFT
      console.log(`Minting NFT to: ${walletAddress} with Metadata URI: ${metadataURI} from: ${address}`);
      let txHash;
      try {
        txHash = await writeContractAsync({
          address: contractAddress,
          abi: abi,
          functionName: 'mintNFT',
          args: [walletAddress, metadataURI],
        });
      } catch (txError) {
        console.error('Transaction error details:', txError);
        throw new Error(`Transaction failed: ${txError.message}`);
      }
      console.log('Transaction Hash:', txHash);

      if (!txHash) {
        throw new Error('Transaction hash not received');
      }

      // Wait for transaction receipt
      let receipt;
      try {
        receipt = await publicClient.waitForTransactionReceipt({ 
          hash: txHash,
          confirmations: 1
        });
      } catch (receiptError) {
        console.error('Receipt error:', receiptError);
        throw new Error(`Failed to fetch transaction receipt: ${receiptError.message}`);
      }
      console.log('Transaction Receipt:', receipt);

      // Validate receipt
      if (!receipt || !receipt.logs) {
        throw new Error('Transaction receipt or logs missing.');
      }

      // Parse NFTMinted event
      let events;
      try {
        events = parseEventLogs({
          abi,
          logs: receipt.logs,
        });
      } catch (parseError) {
        console.error('Parse error:', parseError);
        throw new Error(`Failed to parse transaction logs: ${parseError.message}`);
      }

      console.log('Parsed events:', events);

      const mintEvent = events.find(e => e.eventName === 'NFTMinted');
      if (!mintEvent) {
        console.log('Available events:', events.map(e => e.eventName));
        throw new Error('NFTMinted event not found in transaction logs.');
      }

      // Access tokenId from the event args
      const tokenId = mintEvent.args[1] || mintEvent.args.tokenId;
      console.log('Event args:', mintEvent.args);
      console.log('Extracted tokenId:', tokenId);
      console.log('Minted Token ID:', tokenId);

      // Always use token ID 31 for Rarible URL
      const raribleURL = `https://rarible.com/token/polygon/${contractAddress}:31`;

      // Update status to verified with Rarible link
      const finalUpdateResult = await updateSubmissionStatus(hash, 'verified', tokenId, {
        raribleLink: raribleURL,
        contractAddress,
        nftMetadataURI: metadataURI,
        transactionHash: txHash
      });

      if (!finalUpdateResult) {
        console.error('Failed to update status to verified');
        alert('NFT was minted but status update failed. Please check the console.');

        // Retry status update
        setTimeout(async () => {
          console.log('Retrying status update...');
          const retryResult = await updateSubmissionStatus(hash, 'verified', tokenId, {
            raribleLink: raribleURL,
            contractAddress,
            nftMetadataURI: metadataURI,
            transactionHash: txHash
          });
          console.log('Retry result:', retryResult);

          if (retryResult) {
            const retryUpdatedData = [...hashesData];
            retryUpdatedData[userIndex].ipfsHashes[hashIndex].status = 'verified';
            retryUpdatedData[userIndex].ipfsHashes[hashIndex].tokenId = tokenId;
            setHashesData(retryUpdatedData);
            fetchSubmissions();
          }
        }, 2000);
      } else {
        console.log('Successfully updated status to verified');
      }

      // Update UI
      const newUpdatedData = [...hashesData];
      newUpdatedData[userIndex].ipfsHashes[hashIndex].status = 'verified';
      newUpdatedData[userIndex].ipfsHashes[hashIndex].tokenId = tokenId;
      setHashesData(newUpdatedData);

      // Alert and open Rarible page for token ID 31
      alert(`✅ NFT successfully minted to ${walletAddress}! View token #31 on Rarible: ${raribleURL}`);
      window.open(raribleURL, '_blank');

      // Refresh data
      fetchSubmissions();

    } catch (error) {
      console.error('❌ Error minting NFT:', error);
      alert(`NFT minting failed: ${error.message || 'Check console for details.'}`);
    } finally {
      setMinting(prev => ({ ...prev, [`${userIndex}-${hashIndex}`]: false }));
    }
  };

  // Function to open Rarible page for token ID 31
  const openRariblePage = async () => {
    try {
      const raribleURL = `https://rarible.com/token/polygon/${contractAddress}:31`;
      window.open(raribleURL, '_blank');
      alert(`Opening Rarible page for Token #31.`);
    } catch (error) {
      console.error('Error opening Rarible page:', error);
      alert('Failed to open Rarible page.');
    }
  };

  const copyToClipboard = (text) => {
    navigator.clipboard.writeText(text)
      .then(() => {
        const tooltip = document.createElement('div');
        tooltip.textContent = 'Copied!';
        tooltip.className = 'copy-tooltip';
        document.body.appendChild(tooltip);
        
        tooltip.style.position = 'fixed';
        tooltip.style.top = '50%';
        tooltip.style.left = '50%';
        tooltip.style.transform = 'translate(-50%, -50%)';
        tooltip.style.padding = '5px 10px';
        tooltip.style.background = 'rgba(0,0,0,0.7)';
        tooltip.style.color = 'white';
        tooltip.style.borderRadius = '4px';
        tooltip.style.zIndex = '9999';
        
        setTimeout(() => {
          document.body.removeChild(tooltip);
        }, 1500);
      })
      .catch(err => {
        console.error('Failed to copy text: ', err);
        alert('Failed to copy to clipboard');
      });
  };

  // Profile Section Component
  const ProfileSection = () => {
    const civicUserName = userContext.user?.displayName || userContext.user?.email || 'Verifier';
    const userWalletAddress = address;
    
    const handleLogout = async () => {
      try {
        if (userContext.signOut) {
          await userContext.signOut();
        }
        window.location.href = '/';
      } catch (error) {
        console.error('Error during logout:', error);
        window.location.href = '/';
      }
    };
    
    return (
      <div className="profile-section">
        <div className="profile-dropdown">
          <div className="profile-trigger">
            <div className="profile-avatar">
              <svg width="24" height="24" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                <path d="M20 21V19C20 17.9391 19.5786 16.9217 18.8284 16.1716C18.0783 15.4214 17.0609 15 16 15H8C6.93913 15 5.92172 15.4214 5.17157 16.1716C4.42143 16.9217 4 17.9391 4 19V21" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                <path d="M12 11C14.2091 11 16 9.20914 16 7C16 4.79086 14.2091 3 12 3C9.79086 3 8 4.79086 8 7C8 9.20914 9.79086 11 12 11Z" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
              </svg>
            </div>
            <span className="profile-name">{civicUserName}</span>
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
              <path d="M6 9L12 15L18 9" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
            </svg>
          </div>
          
          <div className="profile-dropdown-content">
            <div className="profile-info">
              <div className="profile-detail">
                <span className="profile-label">Name:</span>
                <span className="profile-value">{civicUserName}</span>
              </div>
              
              <div className="profile-detail">
                <span className="profile-label">Wallet Address:</span>
                <div className="wallet-address-container">
                  <span className="profile-value wallet-address">
                    {userWalletAddress ? `${userWalletAddress.slice(0, 6)}...${userWalletAddress.slice(-4)}` : 'Not connected'}
                  </span>
                  {userWalletAddress && (
                    <button 
                      className="copy-wallet-btn" 
                      onClick={() => copyToClipboard(userWalletAddress)}
                      title="Copy wallet address"
                    >
                      <svg width="16" height="16" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                        <rect x="9" y="9" width="13" height="13" rx="2" ry="2" stroke="currentColor" strokeWidth="2" fill="none"/>
                        <path d="M5 15H4a2 2 0 0 1-2-2V4a2 2 0 0 1 2-2h9a2 2 0 0 1 2 2v1" stroke="currentColor" strokeWidth="2" fill="none"/>
                      </svg>
                    </button>
                  )}
                </div>
              </div>
              
              <div className="profile-detail">
                <span className="profile-label">Polygon Balance:</span>
                <span className="profile-value balance">
                  {balanceLoading ? (
                    <span className="balance-loading">Loading...</span>
                  ) : balance ? (
                    <span className="balance-amount">
                      {parseFloat(balance.formatted).toFixed(4)} {balance.symbol}
                    </span>
                  ) : (
                    <span className="balance-error">Error loading</span>
                  )}
                </span>
              </div>
              
              <div className="profile-detail">
                <span className="profile-label">Network:</span>
                <span className="profile-value network">
                  <div className="network-indicator">
                    <div className="network-dot polygon"></div>
                    Polygon
                  </div>
                </span>
              </div>
              
              <div className="profile-logout">
                <button 
                  className="logout-button" 
                  onClick={handleLogout}
                  title="Logout from Civic and return to home"
                >
                  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                    <path d="M9 21H5C4.46957 21 3.96086 20.7893 3.58579 20.4142C3.21071 20.0391 3 19.5304 3 19V5C3 4.46957 3.21071 3.96086 3.58579 3.58579C3.96086 3.21071 4.46957 3 5 3H9" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                    <path d="M16 17L21 12L16 7" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                    <path d="M21 12H9" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                  </svg>
                  Logout
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>
    );
  };

  // Check status directly from the database for debugging
  const checkStatusDirectly = async (hash) => {
    try {
      const response = await axios.get(`https://sdg-nft1.onrender.com/upload/check-status/${hash}`, {
        withCredentials: true
      });
      console.log(`Direct status check for ${hash}:`, response.data);
      alert(`Status for ${hash}: ${response.data.submission.status}`);
    } catch (error) {
      console.error('Error checking status:', error);
      alert('Failed to check status');
    }
  };

  if (!userContext.user) {
    return (
      <div className="verifier-page-full">
        <div className="verifier-content">
          <p>Please log in with Civic to access this page.</p>
        </div>
      </div>
    );
  }

  // Count total submissions across all users
  const totalSubmissions = hashesData.reduce((total, user) => total + (user.ipfsHashes ? user.ipfsHashes.length : 0), 0);

  return (
    <div className="verifier-page-full">
      <div className="verifier-header">
        <div className="logo-container">
          <div className="logo">SDG</div>
          <h1 className="app-title">SDG_NFT</h1>
        </div>
        <ProfileSection />
      </div>
      
      <div className="verifier-content">
        <h2 className="page-title">SDG Data Verification</h2>
        <div className="title-underline"></div>
        
        <p className="dashboard-subtitle">
          Review and verify sustainable development goal contributions submitted by users
        </p>
        
        {!loading && (
          <div className="submission-stats">
            <span>Total Users: {hashesData.length}</span>
            <span>Total Submissions: {totalSubmissions}</span>
          </div>
        )}
        
        {loading && (
          <div className="loading-container">
            <div className="loading-spinner"></div>
            <p>Loading submissions...</p>
          </div>
        )}
        
        {error && <div className="error-message">{error}</div>}
        
        {!loading && hashesData.length === 0 && (
          <div className="empty-state">
            <p>No submissions available for verification</p>
          </div>
        )}
        
        <div className="cards-container">
          {hashesData.map((user, userIndex) => (
            user.ipfsHashes && user.ipfsHashes.length > 0 ? (
              user.ipfsHashes.map(({ hash, walletAddress, status, tokenId }, hashIndex) => (
                <div key={`${userIndex}-${hashIndex}`} className="grid-one-item">
                  <div className="grid-c-title">
                    <h3 className="grid-c-title-text">{user.name}</h3>
                  </div>
                  <div className="grid-c1-content">
                    <p className="contributor-email">{user.email}</p>
                    <div className="lg-value">SDG Contribution</div>
                    
                    <div className="card-wrapper">
                      <span className="card-pin-hidden">**** **** ****</span>
                      <span>{hash.slice(-4)}</span>
                    </div>
                    
                    <div className="info-section">
                      <span className="info-label">IPFS Link</span>
                      <div className="ipfs-container">
                        <a
                          href={`https://ipfs.io/ipfs/${hash}`}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="ipfs-link"
                        >
                          {hash}
                        </a>
                        <button 
                          className="copy-btn" 
                          onClick={() => copyToClipboard(hash)}
                          title="Copy to clipboard"
                        >
                          📋
                        </button>
                      </div>
                    </div>
                    
                    <div className="info-section wallet-address">
                      <span className="info-label">Wallet Address</span>
                      <span className="info-value">{walletAddress}</span>
                    </div>
                    
                    {status && (
                      <div className={`verification-status ${status}`}>
                        <span className={`status-dot ${status}`}></span>
                        <span>
                          {status === 'pending' && 'Pending Verification'}
                          {status === 'verified' && 'Verified & NFT Minted'}
                        </span>
                        
                        <button 
                          onClick={() => checkStatusDirectly(hash)}
                          className="debug-btn"
                          title="Check status in database"
                          style={{ marginLeft: '8px', fontSize: '10px', padding: '2px 5px' }}
                        >
                          Check DB
                        </button>
                      </div>
                    )}
                    
                    {tokenId && status === 'verified' && (
                      <div className="token-id-container">
                        <span className="info-label">Token ID:</span>
                        <span className="token-id">{tokenId}</span>
                        <button 
                          onClick={() => openRariblePage()}
                          className="view-nft-btn"
                          title="View on Rarible"
                          style={{ marginLeft: '8px', fontSize: '12px', padding: '2px 6px' }}
                        >
                          View on Rarible
                        </button>
                      </div>
                    )}
                    
                    <button 
                      className={`verify-button ${status === 'verified' ? 'verified' : ''}`}
                      onClick={() => mintNFT(walletAddress, hash, userIndex, hashIndex)}
                      disabled={status === 'verified' || loading || minting[`${userIndex}-${hashIndex}`]}
                    >
                      {minting[`${userIndex}-${hashIndex}`] ? (
                        'Minting...'
                      ) : status === 'verified' ? (
                        <>✓ Verified & NFT Minted</>
                      ) : (
                        <>Verify and Mint NFT</>
                      )}
                    </button>
                  </div>
                </div>
              ))
            ) : (
              <div key={userIndex} className="empty-state">
                <p>No IPFS hashes available for {user.name}</p>
              </div>
            )
          ))}
        </div>
      </div>
    </div>
  );
};

export default VerifierPage;