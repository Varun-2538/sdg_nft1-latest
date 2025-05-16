import express from 'express';
import User from '../models/User.js';
import Submission from '../models/Submission.js';

const router = express.Router();

// Updated auth middleware for ES modules
const auth = (req, res, next) => {
  if (req.user) {
    return next();
  }
  return res.status(401).json({ success: false, error: 'User not authenticated' });
};

// Route to store IPFS hash and submission data for a logged-in user
router.post('/', auth, async (req, res) => {
  const { ipfsHash, submissionData } = req.body;
  const userId = req.user && req.user._id;

  // Log to confirm data is being received
  console.log('Received IPFS hash:', ipfsHash);
  console.log('Received submission data:', submissionData);
  console.log('Authenticated User ID:', userId);

  if (!ipfsHash) {
    console.error('IPFS hash is missing.');
    return res.status(400).json({ success: false, error: 'IPFS hash is required' });
  }

  if (!userId) {
    console.error('User not authenticated or User ID missing.');
    return res.status(401).json({ success: false, error: 'User not authenticated' });
  }

  try {
    // Update the user's ipfsHashes array (keeping existing functionality)
    await User.findByIdAndUpdate(userId, { $push: { ipfsHashes: ipfsHash } });
    
    // If submission data is provided, create a new submission document
    if (submissionData) {
      const submission = new Submission({
        userId,
        ipfsHash,
        ...submissionData
      });
      
      await submission.save();
      console.log('Submission saved with ID:', submission._id);
    }
    
    console.log('IPFS hash successfully stored in MongoDB for User ID:', userId);
    res.json({ success: true, message: 'Submission stored successfully' });
  } catch (error) {
    console.error('Error storing submission in MongoDB:', error);
    res.status(500).json({ success: false, error: 'Failed to store submission' });
  }
});

// Route to retrieve all users and their IPFS hashes for verification (NO AUTH REQUIRED)
router.get('/all-users-hashes', async (req, res) => {
  try {
    // Fetch all users along with their IPFS hashes (no auth required)
    const usersWithHashes = await User.find({}, 'name email ipfsHashes');
    console.log('Fetched users and IPFS hashes (no auth):', usersWithHashes);
    res.json({ success: true, data: usersWithHashes });
  } catch (error) {
    console.error('Error fetching IPFS hashes:', error);
    res.status(500).json({ success: false, error: 'Failed to fetch IPFS hashes' });
  }
});

// Route to retrieve all users and their IPFS hashes for verification (ORIGINAL WITH AUTH)
router.get('/all', auth, async (req, res) => {
  try {
    // Fetch all users along with their IPFS hashes
    const usersWithHashes = await User.find({}, 'name email ipfsHashes');
    console.log('Fetched users and IPFS hashes:', usersWithHashes);
    res.json({ success: true, data: usersWithHashes });
  } catch (error) {
    console.error('Error fetching IPFS hashes:', error);
    res.status(500).json({ success: false, error: 'Failed to fetch IPFS hashes' });
  }
});

// SIMPLIFIED ROUTE: Get ALL submissions for verification (no auth required)
router.get('/all-submissions', async (req, res) => {
  try {
    console.log('Fetching all submissions for verification...');
    
    // Fetch all submissions from database with populated user info
    const submissions = await Submission.find({})
      .populate('userId', 'name email')
      .sort({ timestamp: -1 }); // Sort by newest first
    
    // Transform the data to include user info
    const transformedSubmissions = submissions.map(submission => {
      const submissionObj = submission.toObject();
      
      // Convert 'processing' status to 'pending'
      if (submissionObj.status === 'processing') {
        submissionObj.status = 'pending';
      }
      
      return {
        _id: submissionObj._id,
        ipfsHash: submissionObj.ipfsHash,
        status: submissionObj.status,
        tokenId: submissionObj.tokenId,
        createdAt: submissionObj.timestamp, // Use timestamp as createdAt
        updatedAt: submissionObj.updatedAt || submissionObj.timestamp,
        // Include user info
        userName: submission.userId?.name || submissionObj.organizationName || 'Unknown User',
        userEmail: submission.userId?.email || submissionObj.contactEmail || 'No email',
        // Include additional submission details
        organizationName: submissionObj.organizationName,
        sdgCategory: submissionObj.sdgCategory,
        description: submissionObj.description,
        contactEmail: submissionObj.contactEmail,
        walletAddress: submissionObj.walletAddress,
        imageLinks: submissionObj.imageLinks,
        videoLinks: submissionObj.videoLinks
      };
    });
    
    console.log(`Found ${transformedSubmissions.length} submissions for verification`);
    
    res.json({
      success: true,
      submissions: transformedSubmissions,
      count: transformedSubmissions.length
    });
    
  } catch (error) {
    console.error('Error fetching all submissions:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch submissions',
      error: error.message
    });
  }
});

// NEW ROUTE: Get ALL submissions for verification (no auth required)
router.get('/all-submissions', async (req, res) => {
  try {
    console.log('Fetching all submissions for verification...');
    
    // Fetch all submissions from database with populated user info
    const submissions = await Submission.find({})
      .populate('userId', 'name email')
      .sort({ timestamp: -1 }); // Sort by newest first
    
    // Transform the data to include user info
    const transformedSubmissions = submissions.map(submission => {
      const submissionObj = submission.toObject();
      
      // Convert 'processing' status to 'pending'
      if (submissionObj.status === 'processing') {
        submissionObj.status = 'pending';
      }
      
      return {
        _id: submissionObj._id,
        ipfsHash: submissionObj.ipfsHash,
        status: submissionObj.status,
        tokenId: submissionObj.tokenId,
        createdAt: submissionObj.timestamp, // Use timestamp as createdAt
        updatedAt: submissionObj.updatedAt || submissionObj.timestamp,
        // Include user info
        userName: submission.userId?.name || submissionObj.organizationName || 'Unknown User',
        userEmail: submission.userId?.email || submissionObj.contactEmail || 'No email',
        // Include additional submission details
        organizationName: submissionObj.organizationName,
        sdgCategory: submissionObj.sdgCategory,
        description: submissionObj.description,
        contactEmail: submissionObj.contactEmail,
        walletAddress: submissionObj.walletAddress,
        imageLinks: submissionObj.imageLinks,
        videoLinks: submissionObj.videoLinks
      };
    });
    
    console.log(`Found ${transformedSubmissions.length} submissions for verification`);
    
    res.json({
      success: true,
      submissions: transformedSubmissions,
      count: transformedSubmissions.length
    });
    
  } catch (error) {
    console.error('Error fetching all submissions:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch submissions',
      error: error.message
    });
  }
});

// Route to get ALL submissions (NO AUTH REQUIRED for verifiers)
router.get('/all-submissions-simple', async (req, res) => {
  try {
    // Get all submissions without auth requirement
    const submissions = await Submission.find({}).sort({ timestamp: -1 });
    console.log('Fetched all submissions (no auth):', submissions.length);
    
    // Convert any 'processing' status to 'pending'
    const updatedSubmissions = submissions.map(submission => {
      const submissionObj = submission.toObject();
      if (submissionObj.status === 'processing') {
        submissionObj.status = 'pending';
      }
      return submissionObj;
    });
    
    res.json({ success: true, submissions: updatedSubmissions });
  } catch (error) {
    console.error('Error fetching submissions:', error);
    res.status(500).json({ success: false, error: 'Failed to fetch submissions' });
  }
});

// Route to get submissions for the current user (FILTERED BY USER)
router.get('/submissions', auth, async (req, res) => {
  try {
    // Get submissions only for the authenticated user
    const userId = req.user._id;
    const submissions = await Submission.find({ userId: userId }).sort({ timestamp: -1 });
    console.log(`Fetched ${submissions.length} submissions for user ${userId}`);
    
    // Convert any 'processing' status to 'pending'
    const updatedSubmissions = submissions.map(submission => {
      const submissionObj = submission.toObject();
      if (submissionObj.status === 'processing') {
        submissionObj.status = 'pending';
      }
      return submissionObj;
    });
    
    res.json({ success: true, submissions: updatedSubmissions });
  } catch (error) {
    console.error('Error fetching submissions:', error);
    res.status(500).json({ success: false, error: 'Failed to fetch submissions' });
  }
});

// Route to update submission status by IPFS hash
router.put('/update-status/:ipfsHash', auth, async (req, res) => {
  try {
    const { status, tokenId, transactionHash, openSeaLink, contractAddress, nftMetadataURI } = req.body;
    const ipfsHash = req.params.ipfsHash;
    
    // Only allow 'pending' or 'verified' status
    const finalStatus = (status === 'processing') ? 'verified' : status;
    
    console.log(`[SERVER] Updating submission status for IPFS hash ${ipfsHash} to ${finalStatus}`);
    
    // Find the submission by IPFS hash
    const submission = await Submission.findOne({ ipfsHash });
    
    if (!submission) {
      console.error(`[SERVER] Submission not found for IPFS hash: ${ipfsHash}`);
      return res.status(404).json({ 
        success: false, 
        message: 'Submission not found' 
      });
    }
    
    console.log(`[SERVER] Found submission: ${submission._id}, current status: ${submission.status}`);
    
    // Update the status (only to 'pending' or 'verified')
    submission.status = finalStatus;
    
    // Update tokenId if provided
    if (tokenId !== undefined) {
      submission.tokenId = tokenId;
      console.log(`[SERVER] Setting tokenId to: ${tokenId}`);
    }
    
    // Update NFT details if provided (when NFT is minted)
    if (transactionHash) {
      submission.transactionHash = transactionHash;
      console.log(`[SERVER] Setting transactionHash to: ${transactionHash}`);
    }
    
    if (openSeaLink) {
      submission.openSeaLink = openSeaLink;
      console.log(`[SERVER] Setting openSeaLink to: ${openSeaLink}`);
    }
    
    if (contractAddress) {
      submission.contractAddress = contractAddress;
      console.log(`[SERVER] Setting contractAddress to: ${contractAddress}`);
    }
    
    if (nftMetadataURI) {
      submission.nftMetadataURI = nftMetadataURI;
      console.log(`[SERVER] Setting nftMetadataURI to: ${nftMetadataURI}`);
    }
    
    // Add verification timestamp if status is 'verified'
    if (finalStatus === 'verified') {
      submission.verifiedAt = new Date();
      submission.verifiedBy = req.user.email || 'Verifier'; // Store who verified it
      console.log(`[SERVER] Setting verification timestamp to: ${submission.verifiedAt}`);
    }
    
    // Save the updated submission
    const updatedSubmission = await submission.save();
    console.log(`[SERVER] Submission updated successfully. New status: ${updatedSubmission.status}`);
    
    // Double-check that the update was saved
    const checkSubmission = await Submission.findOne({ ipfsHash });
    console.log(`[SERVER] Verification check - Status after save: ${checkSubmission.status}`);
    
    res.json({
      success: true,
      message: 'Submission status updated',
      submission: updatedSubmission
    });
  } catch (err) {
    console.error('[SERVER] Error updating submission status:', err.message);
    res.status(500).json({ 
      success: false, 
      message: 'Server Error',
      error: err.message
    });
  }
});

// Debug route to check submission status by IPFS hash
router.get('/check-status/:ipfsHash', auth, async (req, res) => {
  try {
    const ipfsHash = req.params.ipfsHash;
    
    // Find the submission by IPFS hash
    const submission = await Submission.findOne({ ipfsHash });
    
    if (!submission) {
      return res.status(404).json({ 
        success: false, 
        message: 'Submission not found' 
      });
    }
    
    // Convert 'processing' to 'pending' for the response
    const submissionObj = submission.toObject();
    if (submissionObj.status === 'processing') {
      submissionObj.status = 'pending';
    }
    
    res.json({
      success: true,
      submission: submissionObj
    });
  } catch (err) {
    console.error(err.message);
    res.status(500).json({ 
      success: false, 
      message: 'Server Error' 
    });
  }
});

export default router;