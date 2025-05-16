import mongoose from 'mongoose';

const UserSchema = new mongoose.Schema({
  // Google Auth fields
  googleId: { type: String },
  
  // Civic Auth fields
  civicId: { type: String },
  
  // Common fields
  name: { type: String, required: true },
  email: { type: String, required: true },
  role: { type: String, enum: ['uploader', 'checker'], required: true },
  ipfsHashes: [{ type: String }],
  
  // Additional fields for Civic Auth Web3
  picture: { type: String },
  authProvider: { type: String, enum: ['google', 'civic', 'civic-web3'], required: true },
  
  // Web3 wallet fields for Civic Auth Web3
  walletAddress: { type: String },
  walletChain: { type: String },
  
  // Timestamps
  createdAt: { type: Date, default: Date.now },
  updatedAt: { type: Date, default: Date.now }
});

// Update the updatedAt field before saving
UserSchema.pre('save', function(next) {
  this.updatedAt = Date.now();
  next();
});

export default mongoose.model('User', UserSchema);