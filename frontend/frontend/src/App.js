import React, { useState, useEffect, useCallback } from 'react';
import { BrowserRouter as Router, Route, Routes } from 'react-router-dom';
import axios from 'axios';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { WagmiProvider, createConfig, http } from 'wagmi';
import { CivicAuthProvider } from '@civic/auth-web3/react';
import { polygon } from 'wagmi/chains';
import { embeddedWallet } from '@civic/auth-web3/wagmi';
import Sidebar from './layout/Sidebar/Sidebar';
import Content from './layout/Content/Content';
import Login from './components/Login';
import VerifierPage from './components/ContentMain/upload/VerifierPage';
import './App.css';
import { SidebarProvider } from './context/sidebarContext';

// Wagmi configuration
const wagmiConfig = createConfig({
  chains: [polygon],
  transports: {
    [polygon.id]: http(),
  },
  connectors: [embeddedWallet()],
});

// React Query client
const queryClient = new QueryClient();

function App() {
  const [userData, setUserData] = useState(null);
  const [loading, setLoading] = useState(true);

  const fetchUserData = useCallback(async () => {
    try {
      const response = await axios.get('https://sdg-nft1.onrender.com/auth/check', { withCredentials: true });
      if (response.data.isAuthenticated) {
        setUserData(response.data.user);
      }
    } catch (error) {
      console.error('Error fetching user data:', error);
    }
  }, []);

  useEffect(() => {
    fetchUserData().finally(() => setLoading(false));
  }, [fetchUserData]);

  // Debounce onSignIn to prevent repeated triggers
  const handleSignIn = useCallback((error) => {
    if (error) {
      console.error('Civic sign-in error:', error);
      return;
    }
    console.log('Civic sign-in successful');
    fetchUserData();
  }, [fetchUserData]);

  return (
    <QueryClientProvider client={queryClient}>
      <WagmiProvider config={wagmiConfig}>
        <CivicAuthProvider
          clientId={process.env.REACT_APP_CIVIC_CLIENT_ID || '6701d267-d756-4124-a6bd-c740bc8259fb'}
          initialChain={polygon}
          redirectUri={window.location.origin}
          onSignIn={handleSignIn}
        >
          <Router>
            <div className="app">
              <Routes>
                <Route path="/" element={<Login />} />
                <Route
                  path="/dashboard"
                  element={
                    <SidebarProvider>
                      <div className="app-layout">
                        <Sidebar userData={userData} loading={loading} />
                        <div className="content-wrapper">
                          <Content />
                        </div>
                      </div>
                    </SidebarProvider>
                  }
                />
                <Route
                  path="/verify"
                  element={
                    <div className="content-wrapper">
                      <VerifierPage />
                    </div>
                  }
                />
                <Route
                  path="/checker-dashboard"
                  element={
                    <SidebarProvider>
                      <div className="app-layout">
                        <Sidebar userData={userData} loading={loading} />
                        <div className="content-wrapper">
                          <Content />
                        </div>
                      </div>
                    </SidebarProvider>
                  }
                />
              </Routes>
            </div>
          </Router>
        </CivicAuthProvider>
      </WagmiProvider>
    </QueryClientProvider>
  );
}

export default App;