// SPDX-License-Identifier: MIT
pragma solidity ^0.8.19;

import "@openzeppelin/contracts/token/ERC721/extensions/ERC721URIStorage.sol";
import "@openzeppelin/contracts/access/Ownable.sol";
import "@openzeppelin/contracts/utils/Counters.sol";

contract SDGNFT is ERC721URIStorage, Ownable {
    using Counters for Counters.Counter;
    Counters.Counter private _tokenIds;

    uint256 public maxSupply = 10000; // Set a maximum supply if needed

    event NFTMinted(address indexed recipient, uint256 tokenId, string tokenURI);

    // ✅ Pass msg.sender to Ownable constructor
    constructor() ERC721("SDGNFT", "SDG") Ownable(msg.sender) {}

    /**
     * @dev Mints an NFT to a specified address with a given metadata URI.
     * @param recipient The address that will receive the NFT.
     * @param tokenURI The metadata URI of the NFT.
     */
    function mintNFT(address recipient, string memory tokenURI) public returns (uint256) {
        require(recipient != address(0), "Invalid recipient address");
        require(_tokenIds.current() < maxSupply, "Max NFT supply reached");

        _tokenIds.increment();
        uint256 newTokenId = _tokenIds.current();
        _mint(recipient, newTokenId);
        _setTokenURI(newTokenId, tokenURI);
        
        emit NFTMinted(recipient, newTokenId, tokenURI);
        
        return newTokenId;
    }

    /**
     * @dev Returns the current number of NFTs minted.
     */
    function totalMinted() public view returns (uint256) {
        return _tokenIds.current();
    }
}