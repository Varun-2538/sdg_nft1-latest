SDG_NFT
SDG_NFT is a blockchain-based platform that enables organizations and individuals to tokenize their contributions to the United Nations Sustainable Development Goals (SDGs) as Non-Fungible Tokens (NFTs). By leveraging embedded Web3 wallets and identity verification through Civic Auth, the platform ensures transparency, traceability, and trust in sustainability reporting. Users can submit SDG contributions, which are reviewed by verifiers and minted as NFTs on the Polygon blockchain, creating immutable records of impact.
Features

SDG Contribution Submission: Users can submit evidence (images, videos, links) of their SDG contributions.
Verification Process: Verifiers review submissions and approve them for NFT minting.
NFT Minting: Verified contributions are minted as NFTs on Polygon, with metadata stored on IPFS.
Embedded Web3 Wallets: Automatic wallet creation via Civic Auth, requiring no prior crypto knowledge.
CSR Scores: Metrics assigned to contributions based on impact and SDG alignment.
Real-time Verification: Verifiers process submissions in real-time.
Impact Analytics: Dashboards for tracking sustainability impact (planned feature).

Tech Stack

Frontend: React, Wagmi, @civic/auth-web3, Axios, React Router, Tanstack Query
Backend: Node.js/Express.js (assumed, based on API endpoints)
Blockchain: Polygon (chain ID: 137)
Smart Contract: ERC-721 contract for NFT minting (deployed at 0xfca1de71c81c93ecf2d6826449b980be7c5e843b)
Storage: IPFS for metadata storage
Authentication: Civic Auth for verifier identity verification, Google OAuth for user login
Styling: Custom CSS (VerifierPage.css, Login.css)

Prerequisites

Node.js: v16.x or higher
npm: v8.x or higher
Polygon Wallet: A wallet with MATIC for gas fees (for verifiers)
Civic Account: Client ID for Civic Auth integration
Backend Server: Running at http://localhost:5000
