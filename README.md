SDG_NFT
SDG_NFT is a blockchain-based platform that enables organizations and individuals to tokenize their contributions to the United Nations Sustainable Development Goals (SDGs) as Non-Fungible Tokens (NFTs). By integrating Civic Auth for identity verification and embedded Web3 wallets, the platform ensures transparency, traceability, and trust in sustainability reporting. Users submit SDG contributions, which are reviewed by verifiers and minted as NFTs on the Polygon blockchain, creating immutable records of impact.
Features

SDG Contribution Submission: Users can upload evidence (images, videos, links) of their SDG contributions.
Verification Process: Verifiers review and approve submissions for NFT minting.
NFT Minting: Approved contributions are minted as NFTs on Polygon, with metadata stored on IPFS.
Embedded Web3 Wallets: Automatic wallet creation via Civic Auth, no crypto knowledge required.
CSR Scores: Metrics for contributions based on impact and SDG alignment (planned feature).
Real-time Verification: Verifiers process submissions in real-time.
Impact Analytics: Dashboards for tracking sustainability impact (planned feature).

Tech Stack

Frontend: React, Wagmi, @civic/auth-web3, Axios, React Router, Tanstack Query
Backend: Node.js, Express.js
Blockchain: Polygon (chain ID: 137)
Smart Contract: ERC-721 contract (deployed at 0xfca1de71c81c93ecf2d6826449b980be7c5e843b)
Storage: IPFS for metadata
Authentication: Civic Auth for verifiers, Google OAuth for users
Styling: Custom CSS (VerifierPage.css, Login.css)

Prerequisites

Node.js: v16.x or higher
npm: v8.x or higher
MongoDB: Running locally or via a cloud provider (for backend database)
Polygon Wallet: A wallet with MATIC for gas fees (for verifiers)
Civic Account: Client ID for Civic Auth integration
Git: For cloning the repository

Project Structure
sdg_nft/
├── backend/
│   └── backend/
│       ├── server.js
│       ├── routes/
│       ├── models/
│       └── ...
├── frontend/
│   └── frontend/
│       ├── src/
│       ├── public/
│       ├── package.json
│       └── ...
└── README.md

Installation
Follow these steps to set up and run the SDG_NFT project locally.
1. Clone the Repository
git clone https://github.com/your-repo/sdg_nft.git
cd sdg_nft

2. Set Up the Backend

Navigate to the Backend Directory:cd backend/backend


Install Backend Dependencies:npm install


Configure Environment Variables:Create a .env file in backend/backend with the following:MONGO_URI=mongodb://localhost:27017/sdg_nft
GOOGLE_CLIENT_ID=your-google-client-id
GOOGLE_CLIENT_SECRET=your-google-client-secret
SESSION_SECRET=your-session-secret
CIVIC_PUBLIC_KEY=your-civic-public-key


Replace MONGO_URI with your MongoDB connection string.
Obtain GOOGLE_CLIENT_ID and GOOGLE_CLIENT_SECRET from the Google Cloud Console.
Generate a random SESSION_SECRET for session management.
Get CIVIC_PUBLIC_KEY from the Civic Dashboard.


Run the Backend:node server.js

The backend will run at http://localhost:5000.

3. Set Up the Frontend

Navigate to the Frontend Directory:cd ../../frontend/frontend


Install Frontend Dependencies:npm install


Configure Environment Variables:Create a .env file in frontend/frontend with the following:REACT_APP_CIVIC_CLIENT_ID=6701d267-d756-4124-a6bd-c740bc8259fb


Replace with your actual Civic Client ID from the Civic Dashboard.


Run the Frontend:npm start

The frontend will run at http://localhost:3000.

4. Verify Setup

Ensure MongoDB is running locally or accessible via your MONGO_URI.
Open http://localhost:3000 in a browser to access the login page.
The backend should respond to API requests at http://localhost:5000 (e.g., GET /auth/check).

Usage
User Flow

Login:
Users: Log in via Google OAuth at http://localhost:3000.
Verifiers: Use Civic Auth to log in, redirecting to /verify.


Submit Contributions:
Users upload SDG contributions via the dashboard (handled by backend API).
Contributions are stored on IPFS, with hashes linked to user wallets.


Verify Contributions:
Verifiers access /verify to review submissions (name, email, IPFS hash, wallet address, status).
Approve submissions by clicking "Verify and Mint NFT".


NFT Minting:
NFTs are minted on Polygon using the contract at 0xfca1de71c81c93ecf2d6826449b980be7c5e843b.
Metadata is stored on IPFS (bafkreieohqzzg7d7bebt7wviwi45r6cprgbqryswnkqe7pnmfu4l4m6d3a).
View NFTs on Rarible (https://rarible.com/token/polygon/:contractAddress:31).


Logout:
Verifiers can log out from the profile section, clearing the Civic session.



Key Components

App.js: Configures Wagmi, Civic, and React Query providers; handles routing.
Login.js: Manages user and verifier login with Google OAuth and Civic Auth.
CivicAuthSection.js: Implements Civic Auth login and wallet creation.
VerifierPage.js: Provides the verification dashboard for reviewing and minting NFTs.

Smart Contract

Address: 0xfca1de71c81c93ecf2d6826449b980be7c5e843b
Network: Polygon (chain ID: 137)
ABI: frontend/frontend/src/components/ContentMain/upload/abi.json
Key Function: mintNFT(address to, string memory tokenURI)
Note: Ensure the verifier’s wallet has MATIC for gas fees.

Development Notes

Authentication:
Civic Auth requires a valid clientId and redirectUri (http://localhost:3000).
Google OAuth is handled by the backend.


Blockchain:
Uses Polygon; verifiers must switch networks via Wagmi’s switchChain.
Embedded wallets are created via Civic Auth.


IPFS:
Metadata is stored on IPFS, accessible via https://ipfs.io/ipfs/:hash.


Debugging:
Console logs in App.js, CivicAuthSection.js, and VerifierPage.js provide authentication and blockchain details.
Monitor network requests (/auth/check, Civic APIs) in Developer Tools (F12).



Troubleshooting

Refresh Loop:
Check hasNavigated in CivicAuthSection.js to prevent redirect loops.
Verify backend session handling (/auth/check) maintains cookies.
Ensure CORS allows http://localhost:3000.


Authentication Errors:
Confirm REACT_APP_CIVIC_CLIENT_ID matches the Civic Dashboard.
Check userContext.error in console logs.


NFT Minting Fails:
Ensure the wallet has MATIC.
Verify contract address and ABI.


Backend Issues:
Confirm MongoDB is running and MONGO_URI is correct.
Check backend logs for errors.



Contributing

Fork the repository.
Create a feature branch (git checkout -b feature/your-feature).
Commit changes (git commit -m "Add your feature").
Push to the branch (git push origin feature/your-feature).
Open a Pull Request.

License
This project is licensed under the MIT License. See the LICENSE file for details.
Contact
For questions or support, contact the maintainers at:

Email: [your-email@example.com]
GitHub Issues: your-repo/sdg_nft/issues


Empowering sustainable impact through blockchain technology with SDG_NFT! 🌱
