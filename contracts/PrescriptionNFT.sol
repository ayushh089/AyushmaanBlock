// SPDX-License-Identifier: MIT
pragma solidity ^0.8.19;

import "@openzeppelin/contracts/token/ERC721/extensions/ERC721URIStorage.sol";
import "@openzeppelin/contracts/access/Ownable.sol";

contract PrescriptionNFT is ERC721URIStorage, Ownable {
    uint256 private _tokenIdCounter;

    constructor() ERC721("PrescriptionNFT", "PRESC") Ownable(msg.sender) {}

    function mintPrescription(
        address to,
        string memory tokenURI
    ) public onlyOwner returns (uint256) {
        _tokenIdCounter++; // Increment first to avoid zero-indexed issue
        uint256 newTokenId = _tokenIdCounter;
        _safeMint(to, newTokenId);
        _setTokenURI(newTokenId, tokenURI);
        return newTokenId;
    }
}
