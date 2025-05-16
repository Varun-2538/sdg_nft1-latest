import mongoose from 'mongoose';

const SubmissionSchema = new mongoose.Schema({
  userId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  ipfsHash: {
    type: String,
    required: true
  },
  id: {
    type: String,
    required: true
  },
  organizationName: {
    type: String,
    required: true
  },
  sdgCategory: {
    type: String,
    required: true
  },
  description: {
    type: String,
    required: true
  },
  imageLinks: [{
    type: String
  }],
  videoLinks: [{
    type: String
  }],
  walletAddress: {
    type: String,
    required: true
  },
  contactEmail: {
    type: String,
    required: true
  },
  timestamp: {
    type: Date,
    default: Date.now
  },
  expirationDate: {
    type: String
  },
  status: {
    type: String,
    enum: ['pending', 'verified', 'rejected'],
    default: 'pending'
  },
  tokenId: {
    type: String,
    default: null
  },
  verifiedAt: {
    type: Date,
    default: null
  },
  verifiedBy: {
    type: String,
    default: null
  },
  // NEW FIELDS FOR NFT DETAILS
  transactionHash: {
    type: String,
    default: null
  },
  openSeaLink: {
    type: String,
    default: null
  },
  contractAddress: {
    type: String,
    default: null
  },
  nftMetadataURI: {
    type: String,
    default: null
  }
});

// Add a virtual property for createdAt to maintain compatibility
SubmissionSchema.virtual('createdAt').get(function() {
  return this.timestamp;
});

// Ensure virtuals are included when converting to JSON
SubmissionSchema.set('toJSON', { virtuals: true });
SubmissionSchema.set('toObject', { virtuals: true });

export default mongoose.model('Submission', SubmissionSchema);