import express from 'express';
import passport from 'passport';
import User from '../models/User.js';

const router = express.Router();

// Google Auth routes (existing)
router.get('/google', passport.authenticate('google', { scope: ['profile', 'email'] }));

router.get(
  '/google/callback',
  passport.authenticate('google', { failureRedirect: 'http://localhost:3000/' }),
  (req, res) => {
    console.log('User logged in via Google successfully, redirecting...');
    const redirectUrl = req.user.role === 'uploader' ? '/dashboard' : '/checker-dashboard';
    res.redirect(`http://localhost:3000${redirectUrl}`);
  }
);

// Civic Auth routes
router.get('/civic', async (req, res) => {
  try {
    const url = await req.civicAuth.buildLoginUrl();
    res.redirect(url.toString());
  } catch (error) {
    console.error('Error building Civic login URL:', error);
    res.redirect('http://localhost:3000/');
  }
});

router.get('/civic/callback', async (req, res) => {
  try {
    const { code, state } = req.query;
    await req.civicAuth.resolveOAuthAccessCode(code, state);
    
    // Get user info from Civic
    const civicUser = await req.civicAuth.getUser();
    
    if (civicUser) {
      // Check if user exists in our database
      let user = await User.findOne({ civicId: civicUser.id });
      
      if (!user) {
        // Create new user
        user = await new User({
          civicId: civicUser.id,
          name: civicUser.name || civicUser.email,
          email: civicUser.email,
          role: 'uploader', // Default role
          picture: civicUser.picture,
          authProvider: 'civic'
        }).save();
      }
      
      // Log the user in using Passport
      req.logIn(user, (err) => {
        if (err) {
          console.error('Error logging in user:', err);
          return res.redirect('http://localhost:3000/');
        }
        
        console.log('User logged in via Civic successfully, redirecting...');
        const redirectUrl = user.role === 'uploader' ? '/dashboard' : '/checker-dashboard';
        res.redirect(`http://localhost:3000${redirectUrl}`);
      });
    } else {
      res.redirect('http://localhost:3000/');
    }
  } catch (error) {
    console.error('Error in Civic callback:', error);
    res.redirect('http://localhost:3000/');
  }
});

router.get('/civic/logout', async (req, res) => {
  try {
    const url = await req.civicAuth.buildLogoutRedirectUrl();
    res.redirect(url.toString());
  } catch (error) {
    console.error('Error building Civic logout URL:', error);
    res.redirect('http://localhost:3000/');
  }
});

// Logout route (updated to handle both auth methods)
router.get('/logout', async (req, res) => {
  try {
    // Check if user is logged in via Civic
    const isCivicUser = await req.civicAuth.isLoggedIn();
    
    req.logout((err) => {
      if (err) {
        console.error('Error logging out:', err);
        return res.status(500).json({ error: 'Logout failed' });
      }
      
      // If Civic user, redirect to Civic logout
      if (isCivicUser) {
        return res.redirect('/auth/civic/logout');
      }
      
      res.redirect('http://localhost:3000/');
    });
  } catch (error) {
    console.error('Error in logout:', error);
    res.redirect('http://localhost:3000/');
  }
});

// Check authentication status
router.get('/check', async (req, res) => {
  if (req.user) {
    res.json({ 
      isAuthenticated: true, 
      user: { 
        name: req.user.name, 
        role: req.user.role,
        email: req.user.email,
        picture: req.user.picture,
        authProvider: req.user.authProvider
      } 
    });
  } else {
    res.json({ isAuthenticated: false });
  }
});

export default router;