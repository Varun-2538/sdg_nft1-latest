import { iconsImgs } from "../../utils/images";
import "./ContentTop.css";
import { useContext, useState, useEffect, useRef } from "react";
import { SidebarContext } from "../../context/sidebarContext";
import axios from "axios";

const ContentTop = () => {
  const { toggleSidebar } = useContext(SidebarContext);
  const [userInfo, setUserInfo] = useState(null);
  const [submissionCount, setSubmissionCount] = useState(0);
  const [showProfileDropdown, setShowProfileDropdown] = useState(false);
  const profileRef = useRef(null);

  // Fetch user info and submission count
  useEffect(() => {
    fetchUserData();
  }, []);

  // Close dropdown when clicking outside
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (profileRef.current && !profileRef.current.contains(event.target)) {
        setShowProfileDropdown(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, []);

  const fetchUserData = async () => {
    try {
      // Get user authentication info
      const authResponse = await axios.get('http://localhost:5000/auth/check', {
        withCredentials: true
      });

      if (authResponse.data.isAuthenticated) {
        setUserInfo(authResponse.data.user);

        // Get user's submission count
        const submissionsResponse = await axios.get('http://localhost:5000/upload/submissions', {
          withCredentials: true
        });

        if (submissionsResponse.data.success) {
          setSubmissionCount(submissionsResponse.data.submissions.length);
        }
      }
    } catch (error) {
      console.error('Error fetching user data:', error);
    }
  };

  const handleLogout = async () => {
    try {
      await axios.get('http://localhost:5000/auth/logout', {
        withCredentials: true
      });
      // Redirect to home page
      window.location.href = '/';
    } catch (error) {
      console.error('Error during logout:', error);
      // Even if there's an error, redirect to home
      window.location.href = '/';
    }
  };

  const ProfileSection = () => {
    if (!userInfo) return null;

    return (
      <div className="profile-section-dashboard" ref={profileRef}>
        <div 
          className="profile-trigger-dashboard"
          onClick={() => setShowProfileDropdown(!showProfileDropdown)}
        >
          <div className="profile-avatar-dashboard">
            {userInfo.picture ? (
              <img src={userInfo.picture} alt="Profile" className="profile-image" />
            ) : (
              <div className="profile-initials">
                {userInfo.name ? userInfo.name.charAt(0).toUpperCase() : '?'}
              </div>
            )}
          </div>
          <div className="profile-info-dashboard">
            <span className="profile-name-dashboard">{userInfo.name}</span>
            <span className="profile-role-dashboard">{userInfo.role || 'User'}</span>
          </div>
          <svg 
            className={`profile-chevron ${showProfileDropdown ? 'open' : ''}`}
            width="16" 
            height="16" 
            viewBox="0 0 24 24" 
            fill="none" 
            xmlns="http://www.w3.org/2000/svg"
          >
            <path d="M6 9L12 15L18 9" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
          </svg>
        </div>

        {showProfileDropdown && (
          <div className="profile-dropdown-dashboard">
            <div className="profile-dropdown-content-dashboard">
              <div className="profile-header-dashboard">
                <div className="profile-avatar-large-dashboard">
                  {userInfo.picture ? (
                    <img src={userInfo.picture} alt="Profile" className="profile-image-large" />
                  ) : (
                    <div className="profile-initials-large">
                      {userInfo.name ? userInfo.name.charAt(0).toUpperCase() : '?'}
                    </div>
                  )}
                </div>
                <div className="profile-details-dashboard">
                  <h3 className="profile-name-large">{userInfo.name}</h3>
                  <p className="profile-email-dashboard">{userInfo.email}</p>
                </div>
              </div>

              <div className="profile-stats-dashboard">
                <div className="stat-item-dashboard">
                  <span className="stat-number">{submissionCount}</span>
                  <span className="stat-label">Submissions</span>
                </div>
                <div className="stat-item-dashboard">
                  <span className="stat-number">{userInfo.role || 'User'}</span>
                  <span className="stat-label">Role</span>
                </div>
              </div>

              <div className="profile-actions-dashboard">
                <button className="logout-button-dashboard" onClick={handleLogout}>
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
        )}
      </div>
    );
  };

  return (
    <div className="content-top">
      <div className="content-top-left">
        <button type="button" className="sidebar-toggle" onClick={() => toggleSidebar()}>
          <img src={iconsImgs.menu || "/placeholder.svg"} alt="Menu" />
        </button>
        <h3 className="content-top-title">Dashboard</h3>
      </div>
      <div className="content-top-actions">
        <div className="search-container">
          <input type="text" className="search-input" placeholder="Search..." />
          <button type="button" className="search-btn">
            <img src={iconsImgs.search || "/placeholder.svg"} alt="Search" />
          </button>
        </div>
        <button className="notification-btn">
          <img src={iconsImgs.bell || "/placeholder.svg"} alt="Notifications" />
          <span className="notification-indicator"></span>
        </button>
        <ProfileSection />
      </div>
    </div>
  );
};

export default ContentTop;