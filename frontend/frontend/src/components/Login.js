import React, { useState, useEffect } from "react";
import { FcGoogle } from "react-icons/fc";
import { useNavigate, useLocation } from "react-router-dom";
import axios from "axios";
import CivicAuthSection from "./CivicAuthSection";
import "./Login.css";

const Login = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const [activeQuestion, setActiveQuestion] = useState(null);

  useEffect(() => {
    const checkAuthentication = async () => {
      if (location.pathname === '/verify') {
        return;
      }
      try {
        const response = await axios.get('http://localhost:5000/auth/check', {
          withCredentials: true,
        });
        if (response.data.isAuthenticated) {
          const userRole = response.data.user.role;
          const redirectUrl = userRole === 'uploader' ? '/' : '/verify';
          navigate(redirectUrl, { replace: true });
        }
      } catch (error) {
        console.error('Error checking authentication:', error);
      }
    };

    checkAuthentication();
  }, [navigate, location.pathname]);

  const toggleQuestion = (index) => {
    setActiveQuestion(activeQuestion === index ? null : index);
  };

  const faqs = [
    {
      question: "What is SDG_NFT?",
      answer: "SDG_NFT is a platform that allows organizations and individuals to tokenize their Sustainable Development Goals (SDG) contributions as NFTs. This creates verifiable proof of impact that can be used for CSR reporting, impact tracking, and sustainability credentials."
    },
    {
      question: "How does the verification process work?",
      answer: "After submitting your SDG contribution with supporting evidence (images, videos, links), our network of verifiers reviews the submission. Once approved, your contribution is minted as an NFT on the blockchain, creating an immutable record of your impact."
    },
    {
      question: "What are CSR Scores?",
      answer: "Corporate Social Responsibility (CSR) Scores are metrics assigned to verified contributions based on their impact, scale, and alignment with SDG goals. These scores help quantify your organization's social and environmental impact and can be used in sustainability reporting."
    },
    {
      question: "Do I need cryptocurrency to use the platform?",
      answer: "While the NFTs are minted on the blockchain, we handle all the technical aspects. Your embedded wallet is created automatically when you sign up with Civic Auth."
    },
    {
      question: "Which Sustainable Development Goals are supported?",
      answer: "Our platform supports all 17 UN Sustainable Development Goals, from Zero Hunger and Quality Education to Climate Action and Life Below Water. You can categorize your contributions according to the specific SDG they address."
    }
  ];

  return (
    <div className="landing-container">
      <section className="hero-section">
        <div className="login-form-container">
          <div className="login-logo">
            <span className="logo-text">SDG_NFT</span>
          </div>
          <div className="login-form">
            <h1 className="login-heading">Log in to your account</h1>
            <p className="login-subheading">Don't have an account? <a href="#" className="signup-link">Sign Up</a></p>
            <div className="auth-buttons">
              <a href="http://localhost:5000/auth/google" className="auth-button google-button">
                <FcGoogle className="auth-icon" />
                <span>Continue with Google as user</span>
              </a>
              <CivicAuthSection />
            </div>
            <div className="login-divider">
              <span>Or with email</span>
            </div>
            <div className="login-input-group">
              <label htmlFor="email" className="login-label">Email Address</label>
              <input type="email" id="email" className="login-input" placeholder="Enter your email" />
            </div>
            <button className="login-button">
              Next
              <svg className="login-button-icon" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                <path d="M9 5L16 12L9 19" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
              </svg>
            </button>
          </div>
        </div>
        <div className="login-info-container">
          <div className="info-content">
            <h2 className="info-heading">SDG NFT Platform</h2>
            <p className="info-subheading">Tokenize your Sustainable Development Goals contributions with embedded Web3 wallets</p>
            <div className="info-features">
              <div className="info-feature">
                <div className="feature-icon">
                  <svg viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                    <path d="M9 12L11 14L15 10M21 12C21 16.9706 16.9706 21 12 21C7.02944 21 3 16.9706 3 12C3 7.02944 7.02944 3 12 3C16.9706 3 21 7.02944 21 12Z" 
                      stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                  </svg>
                </div>
                <div className="feature-text">
                  <h3>Verify SDG Contributions</h3>
                  <p>Submit and verify your sustainable development work with identity verification</p>
                </div>
              </div>
              <div className="info-feature">
                <div className="feature-icon">
                  <svg viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                    <path d="M20 7L12 3L4 7M20 7L12 11M20 7V17L12 21M12 11L4 7M12 11V21M4 7V17L12 21" 
                      stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                  </svg>
                </div>
                <div className="feature-text">
                  <h3>Mint NFT Certificates</h3>
                  <p>Convert verified contributions into blockchain certificates with your embedded wallet</p>
                </div>
              </div>
              <div className="info-feature">
                <div className="feature-icon">
                  <svg viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                    <path d="M12 8C10.8954 8 10 7.10457 10 6C10 4.89543 10.8954 4 12 4C13.1046 4 14 4.89543 14 6C14 7.10457 13.1046 8 12 8Z" 
                      stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                    <path d="M12 20C10.8954 20 10 19.1046 10 18C10 16.8954 10.8954 16 12 16C13.1046 16 14 16.8954 14 18C14 19.1046 13.1046 20 12 20Z" 
                      stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                    <path d="M18 14C16.8954 14 16 13.1046 16 12C16 10.8954 16.8954 10 18 10C19.1046 10 20 10.8954 20 12C20 13.1046 19.1046 14 18 14Z" 
                      stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                    <path d="M6 14C4.89543 14 4 13.1046 4 12C4 10.8954 4.89543 10 6 10C7.10457 10 8 10.8954 8 12C8 13.1046 7.10457 14 6 14Z" 
                      stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                    <path d="M15 6.5L17.5 9.5" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                    <path d="M17.5 14.5L15 17.5" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                    <path d="M9 17.5L6.5 14.5" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                    <path d="M6.5 9.5L9 6.5" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                  </svg>
                </div>
                <div className="feature-text">
                  <h3>Embedded Web3 Wallets</h3>
                  <p>Automatic wallet creation with Civic Auth - no crypto knowledge required</p>
                </div>
              </div>
            </div>
            <a href="#about" className="info-cta">
              Learn more about SDG NFTs
              <svg className="info-cta-icon" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                <path d="M17 8L21 12M21 12L17 16M21 12H3" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
              </svg>
            </a>
          </div>
          <div className="info-graphic">
            <div className="abstract-graphic">
              <div className="graphic-element graphic-element-1"></div>
              <div className="graphic-element graphic-element-2"></div>
              <div className="graphic-element graphic-element-3"></div>
              <div className="graphic-element graphic-element-4"></div>
            </div>
          </div>
          <div className="scroll-indicator">
            <div className="scroll-text">Scroll to learn more</div>
            <div className="scroll-arrow">
              <svg viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                <path d="M12 5V19M12 19L19 12M12 19L5 12" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
              </svg>
            </div>
          </div>
        </div>
      </section>
      <section id="about" className="about-section">
        <div className="section-container">
          <div className="section-header">
            <h2 className="section-title">About SDG_NFT</h2>
            <div className="section-divider"></div>
          </div>
          <div className="about-content">
            <div className="about-text">
              <p className="about-description">
                SDG_NFT is a revolutionary platform that bridges the gap between sustainable development work and blockchain technology. 
                We enable organizations and individuals to tokenize their contributions to the UN Sustainable Development Goals, 
                creating verifiable proof of impact through NFTs (Non-Fungible Tokens) with embedded Web3 wallets.
              </p>
              <p className="about-description">
                Our mission is to bring transparency, traceability, and trust to sustainability reporting by leveraging 
                blockchain technology to create immutable records of social and environmental impact.
              </p>
            </div>
            <div className="about-cards">
              <div className="about-card">
                <div className="about-card-icon">
                  <svg viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                    <path d="M12 22C17.5228 22 22 17.5228 22 12C22 6.47715 17.5228 2 12 2C6.47715 2 2 6.47715 2 12C2 17.5228 6.47715 22 12 22Z" 
                      stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                    <path d="M12 6V12L16 14" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                  </svg>
                </div>
                <h3 className="about-card-title">Real-time Verification</h3>
                <p className="about-card-description">
                  Our network of verifiers reviews submissions in real-time, ensuring quick validation of your sustainability efforts.
                </p>
              </div>
              <div className="about-card">
                <div className="about-card-icon">
                  <svg viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                    <path d="M12 15C15.866 15 19 11.866 19 8C19 4.13401 15.866 1 12 1C8.13401 1 5 4.13401 5 8C5 11.866 8.13401 15 12 15Z" 
                      stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                    <path d="M8.21 13.89L7 23L12 20L17 23L15.79 13.88" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                  </svg>
                </div>
                <h3 className="about-card-title">Blockchain Certification</h3>
                <p className="about-card-description">
                  Each verified contribution is minted as an NFT, creating a permanent, tamper-proof record on the blockchain.
                </p>
              </div>
              <div className="about-card">
                <div className="about-card-icon">
                  <svg viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                    <path d="M16 8V16M12 11V16M8 14V16M6 20H18C19.1046 20 20 19.1046 20 18V6C20 4.89543 19.1046 4 18 4H6C4.89543 4 4 4.89543 4 6V18C4 19.1046 4.89543 20 6 20Z" 
                      stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                  </svg>
                </div>
                <h3 className="about-card-title">Impact Analytics</h3>
                <p className="about-card-description">
                  Track and analyze your sustainability impact with comprehensive dashboards and reporting tools.
                </p>
              </div>
            </div>
          </div>
          <div className="sdg-goals">
            <h3 className="sdg-title">Supporting All 17 UN Sustainable Development Goals</h3>
            <div className="sdg-icons">
              {Array.from({ length: 17 }).map((_, index) => (
                <div key={index} className="sdg-icon">
                  <div className="sdg-icon-number">{index + 1}</div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>
      <section id="faq" className="faq-section">
        <div className="section-container">
          <div className="section-header">
            <h2 className="section-title">Frequently Asked Questions</h2>
            <div className="section-divider"></div>
          </div>
          <div className="faq-list">
            {faqs.map((faq, index) => (
              <div 
                key={index} 
                className={`faq-item ${activeQuestion === index ? 'active' : ''}`}
                onClick={() => toggleQuestion(index)}
              >
                <div className="faq-question">
                  <h3>{faq.question}</h3>
                  <div className="faq-icon">
                    <svg viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                      <path d={activeQuestion === index ? "M18 15L12 9L6 15" : "M6 9L12 15L18 9"} 
                        stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                    </svg>
                  </div>
                </div>
                <div className="faq-answer">
                  <p>{faq.answer}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>
      <footer className="footer">
        <div className="footer-container">
          <div className="footer-content">
            <div className="footer-brand">
              <div className="footer-logo">SDG_NFT</div>
              <p className="footer-tagline">Tokenizing sustainable impact</p>
            </div>
            <div className="footer-links">
              <div className="footer-links-column">
                <h4>Platform</h4>
                <ul>
                  <li><a href="#">Home</a></li>
                  <li><a href="#about">About</a></li>
                  <li><a href="#faq">FAQ</a></li>
                  <li><a href="#">Contact</a></li>
                </ul>
              </div>
              <div className="footer-links-column">
                <h4>Resources</h4>
                <ul>
                  <li><a href="#">Documentation</a></li>
                  <li><a href="#">API</a></li>
                  <li><a href="#">SDG Goals</a></li>
                  <li><a href="#">Blog</a></li>
                </ul>
              </div>
              <div className="footer-links-column">
                <h4>Legal</h4>
                <ul>
                  <li><a href="#">Terms of Service</a></li>
                  <li><a href="#">Privacy Policy</a></li>
                  <li><a href="#">Cookie Policy</a></li>
                </ul>
              </div>
            </div>
          </div>
          <div className="footer-bottom">
            <div className="footer-copyright">
              © {new Date().getFullYear()} SDG_NFT. All rights reserved.
            </div>
            <div className="footer-social">
              <a href="#" className="social-link">
                <svg viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                  <path d="M23 3.01006C23 3.01006 20.9821 4.20217 19.86 4.54006C19.2577 3.84757 18.4573 3.35675 17.567 3.13398C16.6767 2.91122 15.7395 2.96725 14.8821 3.29451C14.0247 3.62177 13.2884 4.20446 12.773 4.96377C12.2575 5.72309 11.9877 6.62239 12 7.54006V8.54006C10.2426 8.58562 8.50127 8.19587 6.93101 7.4055C5.36074 6.61513 4.01032 5.44869 3 4.01006C3 4.01006 -1 13.0101 8 17.0101C5.94053 18.408 3.48716 19.109 1 19.0101C10 24.0101 21 19.0101 21 7.51006C20.9991 7.23151 20.9723 6.95365 20.92 6.68006C21.9406 5.67355 23 3.01006 23 3.01006Z" 
                    stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                </svg>
              </a>
              <a href="#" className="social-link">
                <svg viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                  <path d="M16 8C17.5913 8 19.1174 8.63214 20.2426 9.75736C21.3679 10.8826 22 12.4087 22 14V21H18V14C18 13.4696 17.7893 12.9609 17.4142 12.5858C17.0391 12.2107 16.5304 12 16 12C15.4696 12 14.9609 12.2107 14.5858 12.5858C14.2107 12.9609 14 13.4696 14 14V21H10V14C10 12.4087 10.6321 10.8826 11.7574 9.75736C12.8826 8.63214 14.4087 8 16 8Z" 
                    stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                  <path d="M6 9H2V21H6V9Z" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                  <path d="M4 6C5.10457 6 6 5.10457 6 4C6 2.89543 5.10457 2 4 2C2.89543 2 2 2.89543 2 4C2 5.10457 2.89543 6 4 6Z" 
                    stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                </svg>
              </a>
              <a href="#" className="social-link">
                <svg viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                  <path d="M12 2C6.47715 2 2 6.47715 2 12C2 17.5228 6.47715 22 12 22C17.5228 22 22 17.5228 22 12C22 6.47715 17.5228 2 12 2Z" 
                    stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                  <path d="M2 12H22" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                  <path d="M12 2C14.5013 4.73835 15.9228 8.29203 16 12C15.9228 15.708 14.5013 19.2616 12 22C9.49872 19.2616 8.07725 15.708 8 12C8.07725 8.29203 9.49872 4.73835 12 2Z" 
                    stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                </svg>
              </a>
            </div>
          </div>
        </div>
      </footer>
    </div>
  );
};

export default Login;