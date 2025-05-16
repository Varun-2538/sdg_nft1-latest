import React, { useState, useEffect } from 'react';
import { Element } from 'react-scroll';
import axios from 'axios';
import "./ContentMain.css";
import Cards from "../Cards/Cards";
import SDGUploadForm from './upload/SDGUploadForm';

const ContentMain = () => {
  const [submissions, setSubmissions] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [userInfo, setUserInfo] = useState(null);
 
  // Function to check user authentication and get user info
  const checkUserAuth = async () => {
    try {
      const response = await axios.get('https://sdg-nft1.onrender.com/auth/check', {
        withCredentials: true
      });
      
      if (response.data.isAuthenticated) {
        setUserInfo(response.data.user);
        return true;
      } else {
        setError('Please log in to view your submissions');
        return false;
      }
    } catch (err) {
      console.error('Error checking authentication:', err);
      setError('Authentication error. Please log in again.');
      return false;
    }
  };

  // Function to fetch submissions from the server
  const fetchSubmissions = async () => {
    try {
      setLoading(true);
      setError(null); // Clear any previous errors
      
      // First check if user is authenticated
      const isAuthenticated = await checkUserAuth();
      if (!isAuthenticated) {
        setLoading(false);
        return;
      }
      
      const response = await axios.get('https://sdg-nft1.onrender.com/upload/submissions', {
        withCredentials: true // Send session cookie for authentication
      });
     
      if (response.data.success) {
        setSubmissions(response.data.submissions);
        console.log(`Loaded ${response.data.submissions.length} submissions for user: ${userInfo?.name || 'current user'}`);
      } else {
        setError('Failed to fetch submissions');
      }
    } catch (err) {
      console.error('Error fetching submissions:', err);
      if (err.response?.status === 401) {
        setError('Please log in to view your submissions');
      } else {
        setError('Error loading submissions. Please try again later.');
      }
    } finally {
      setLoading(false);
    }
  };
 
  // Fetch submissions on component mount
  useEffect(() => {
    fetchSubmissions();
   
    // Set up an interval to refresh submissions every 30 seconds
    const intervalId = setInterval(() => {
      fetchSubmissions();
    }, 30000);
   
    // Clean up the interval when the component unmounts
    return () => clearInterval(intervalId);
  }, []);
 
  // Handler for when a new submission is added
  const handleSubmissionComplete = () => {
    fetchSubmissions(); // Refresh the submissions list
  };

  return (
    <div className="main-content-holder">
      <Element name="home-section" className="content-section">
        <div className="dashboard-header">
          <h1 className="dashboard-title">Dashboard</h1>
          <p className="dashboard-subtitle">
            {userInfo ? `Your SDG contributions, ${userInfo.name}` : 'Your SDG contributions and submissions'}
          </p>
          {userInfo && (
            <div className="user-info">
              <span className="user-detail">Logged in as: {userInfo.email}</span>
              <span className="user-role">Role: {userInfo.role}</span>
            </div>
          )}
        </div>
       
        {loading ? (
          <div className="loading-container">
            <div className="loading-spinner"></div>
            <p>Loading your submissions...</p>
          </div>
        ) : error ? (
          <div className="error-message">
            <p>{error}</p>
            {error.includes('log in') && (
              <a href="/auth/google" className="login-link">
                Click here to log in
              </a>
            )}
          </div>
        ) : (
          <div className="dashboard-grid">
            {submissions.length > 0 ? (
              submissions.map((submission) => (
                <div key={submission._id} className="dashboard-grid-item">
                  <Cards submission={submission} />
                </div>
              ))
            ) : (
              // Display placeholder message if no submissions
              <div className="empty-state">
                <p>You haven't made any submissions yet.</p>
                <p>Use the Upload form below to create your first submission.</p>
              </div>
            )}
          </div>
        )}
        
        {/* Show submission count if user has submissions */}
        {submissions.length > 0 && (
          <div className="submission-summary">
            <p>Total submissions: {submissions.length}</p>
          </div>
        )}
      </Element>
      
      <Element name="upload-section" className="content-section">
        <div className="section-header">
          <h2 className="section-title">Upload</h2>
          <div className="section-divider"></div>
        </div>
        <SDGUploadForm onSubmissionComplete={handleSubmissionComplete} />
      </Element>
    </div>
  );
};

export default ContentMain;