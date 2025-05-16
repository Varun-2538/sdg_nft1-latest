import dotenv from 'dotenv';
dotenv.config();

import express from 'express';
import mongoose from 'mongoose';
import session from 'express-session';
import passport from 'passport';
import cors from 'cors';
import cookieParser from 'cookie-parser';
import GoogleStrategy from 'passport-google-oauth20';
import User from './models/User.js';
import authRoutes from './routes/auth.js';
import uploadRoutes from './routes/upload.js';

const app = express();

// Load environment variables directly
const googleClientID = process.env.GOOGLE_CLIENT_ID;
const googleClientSecret = process.env.GOOGLE_CLIENT_SECRET;

// Debug environment variables
console.log('Environment check:');
console.log('GOOGLE_CLIENT_ID:', googleClientID ? 'Set' : 'Not set');
console.log('GOOGLE_CLIENT_SECRET:', googleClientSecret ? 'Set' : 'Not set');
console.log('MONGO_URI:', process.env.MONGO_URI ? 'Set' : 'Not set');

// Exit if essential environment variables are missing
if (!googleClientID || !googleClientSecret) {
  console.error('Missing Google OAuth credentials. Please check your .env file.');
  console.error('Required: GOOGLE_CLIENT_ID, GOOGLE_CLIENT_SECRET');
  process.exit(1);
}

// Connect to MongoDB
mongoose.connect(process.env.MONGO_URI, {
  useNewUrlParser: true,
  useUnifiedTopology: true,
})
  .then(() => console.log('MongoDB connected'))
  .catch((err) => console.log('MongoDB connection error:', err));

// CORS configuration
app.use(cors({
  origin: 'http://localhost:3000',
  credentials: true,
}));

// Middleware
app.use(express.json());
app.use(cookieParser());

app.use(session({
  secret: process.env.SESSION_SECRET || 'your_secret_key',
  resave: false,
  saveUninitialized: false,
  cookie: { secure: false, httpOnly: true },
}));

app.use(passport.initialize());
app.use(passport.session());

// Passport configuration
passport.serializeUser((user, done) => done(null, user.id));
passport.deserializeUser((id, done) => {
  User.findById(id)
    .then(user => done(null, user))
    .catch(done);
});

// Google Strategy
passport.use(new GoogleStrategy.Strategy(
  {
    clientID: googleClientID,
    clientSecret: googleClientSecret,
    callbackURL: 'http://localhost:5000/auth/google/callback',
  },
  async (accessToken, refreshToken, profile, done) => {
    try {
      let user = await User.findOne({ googleId: profile.id });
      if (!user) {
        user = await new User({
          googleId: profile.id,
          name: profile.displayName,
          email: profile.emails[0].value,
          role: 'uploader',
          authProvider: 'google'
        }).save();
      }
      done(null, user);
    } catch (error) {
      console.error('Error in Google Strategy:', error);
      done(error, null);
    }
  }
));

// Routes (civic routes will be handled differently)
app.use('/auth', authRoutes);
app.use('/upload', uploadRoutes);

// Root route for testing
app.get('/', (req, res) => {
  res.send('Server is running');
});

// Start server
const PORT = process.env.PORT || 5000;
app.listen(PORT, () => console.log(`Server running on http://localhost:${PORT}`));