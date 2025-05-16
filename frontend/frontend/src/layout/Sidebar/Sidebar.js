import { useEffect, useState } from 'react';
import { Link as ScrollLink } from 'react-scroll';
import { navigationLinks } from '../../data/data';
import "./Sidebar.css";
import { useContext } from 'react';
import { SidebarContext } from '../../context/sidebarContext';

const Sidebar = ({ userData, loading }) => {
  const [activeLinkIdx] = useState(1);
  const [sidebarClass, setSidebarClass] = useState("");
  const { isSidebarOpen } = useContext(SidebarContext);

  useEffect(() => {
    if(isSidebarOpen){
      setSidebarClass('sidebar-change');
    } else {
      setSidebarClass('');
    }
  }, [isSidebarOpen]);

  // Get user initials for avatar
  const getUserInitials = () => {
    if (!userData || !userData.name) return "UN";
    
    const nameParts = userData.name.split(' ');
    if (nameParts.length === 1) return nameParts[0].charAt(0).toUpperCase();
    
    return (nameParts[0].charAt(0) + nameParts[nameParts.length - 1].charAt(0)).toUpperCase();
  };

  return (
    <div className={`sidebar ${sidebarClass}`}>
      <div className="sidebar-header">
        <div className="logo-container">
          <div className="logo-icon">SDG</div>
          <span className="logo-text">SDG_NFT</span>
        </div>
      </div>

      <nav className="navigation">
        <ul className="nav-list">
          {
            navigationLinks.map((navigationLink) => (
              <li className="nav-item" key={navigationLink.id}>
                {navigationLink.title === "Upload" ? (
                  <ScrollLink 
                    to="upload-section" 
                    spy={true} 
                    smooth={true} 
                    offset={-20} 
                    duration={800}
                    className={`nav-link ${navigationLink.id === activeLinkIdx ? 'active' : ''}`}
                  >
                    <div className="nav-link-icon-wrapper">
                      <img src={navigationLink.image || "/placeholder.svg"} className="nav-link-icon" alt={navigationLink.title} />
                    </div>
                    <span className="nav-link-text">{navigationLink.title}</span>
                    {navigationLink.id === activeLinkIdx && <span className="active-indicator"></span>}
                  </ScrollLink>
                ) : (
                  <a href="#" className={`nav-link ${navigationLink.id === activeLinkIdx ? 'active' : ''}`}>
                    <div className="nav-link-icon-wrapper">
                      <img src={navigationLink.image || "/placeholder.svg"} className="nav-link-icon" alt={navigationLink.title} />
                    </div>
                    <span className="nav-link-text">{navigationLink.title}</span>
                    {navigationLink.id === activeLinkIdx && <span className="active-indicator"></span>}
                  </a>
                )}
              </li>
            ))
          }
        </ul>
      </nav>

      <div className="sidebar-footer">
        <div className="user-profile">
          <div className="user-avatar">
            <span>{loading ? "UN" : getUserInitials()}</span>
          </div>
          <div className="user-details">
            <h4 className="user-name">{loading ? "Loading..." : (userData ? userData.name : "User Name")}</h4>
            <p className="user-role">{userData && userData.role ? userData.role.charAt(0).toUpperCase() + userData.role.slice(1) : "Organization"}</p>
          </div>
        </div>
      </div>
    </div>
  )
}

export default Sidebar