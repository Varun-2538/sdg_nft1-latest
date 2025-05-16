import React, { useState, useEffect } from 'react';
import { useUser, UserButton } from '@civic/auth-web3/react';
import { userHasWallet } from '@civic/auth-web3';
import { useNavigate } from 'react-router-dom';

const CivicAuthSection = () => {
  const navigate = useNavigate();
  const [isLoading, setIsLoading] = useState(false);
  const [hasNavigated, setHasNavigated] = useState(false);
  const userContext = useUser();

  useEffect(() => {
    console.log('CivicAuthSection userContext:', userContext);
    if (userContext.error) {
      console.error('Civic auth error:', userContext.error);
    }
  }, [userContext]);

  useEffect(() => {
    if (userContext.user && userHasWallet(userContext) && !hasNavigated) {
      console.log('Civic user authenticated with wallet:', userContext.user, userContext.ethereum?.address);
      setHasNavigated(true);
      navigate('/verify', { replace: true });
    }
  }, [userContext, navigate, hasNavigated]);

  const createWallet = async () => {
    if (userContext.user && !userHasWallet(userContext)) {
      setIsLoading(true);
      try {
        await userContext.createWallet();
        setHasNavigated(true);
        navigate('/verify', { replace: true });
      } catch (error) {
        console.error('Error creating wallet:', error);
      } finally {
        setIsLoading(false);
      }
    }
  };

  const handleCivicLogin = async () => {
    if (userContext.signIn) {
      setIsLoading(true);
      try {
        await userContext.signIn();
      } catch (error) {
        console.error('Error during Civic login:', error);
        setIsLoading(false);
      }
    }
  };

  const handleVerifierLogin = () => {
    setHasNavigated(true);
    navigate('/verify', { replace: true });
  };

  return (
    <>
      {!userContext.user ? (
        <button
          className="auth-button civic-button"
          onClick={handleCivicLogin}
          disabled={isLoading}
        >
          <svg className="auth-icon" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
            <path
              d="M12 2L13.09 8.26L20 9L13.09 9.74L12 16L10.91 9.74L4 9L10.91 8.26L12 2Z"
              stroke="currentColor"
              strokeWidth="2"
              strokeLinecap="round"
              strokeLinejoin="round"
            />
          </svg>
          <span>{isLoading ? 'Connecting...' : 'Continue with Civic as Verifier'}</span>
        </button>
      ) : (
        <div className="civic-wallet-status">
          <UserButton />
          {!userHasWallet(userContext) ? (
            <button
              className="auth-button civic-button"
              onClick={createWallet}
              disabled={isLoading || userContext.walletCreationInProgress}
            >
              {isLoading || userContext.walletCreationInProgress ? 'Creating Wallet...' : 'Create Web3 Wallet'}
            </button>
          ) : (
            <div className="wallet-info">
              <p>Wallet: {userContext.ethereum?.address?.slice(0, 6)}...{userContext.ethereum?.address?.slice(-4)}</p>
              <p>Wallet created successfully! Access verifier portal.</p>
            </div>
          )}
          <button
            className="auth-button verifier-button"
            onClick={handleVerifierLogin}
          >
            <svg className="auth-icon" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
              <path
                d="M9 12L11 14L15 10M21 12C21 16.9706 16.9706 21 12 21C7.02944 21 3 16.9706 3 12C3 7.02944 7.02944 3 12 3C16.9706 3 21 7.02944 21 12Z"
                stroke="currentColor"
                strokeWidth="2"
                strokeLinecap="round"
                strokeLinejoin="round"
              />
            </svg>
            <span>Access Verifier Portal</span>
          </button>
        </div>
      )}
    </>
  );
};

export default CivicAuthSection;