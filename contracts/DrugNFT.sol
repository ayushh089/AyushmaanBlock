// SPDX-License-Identifier: MIT
pragma solidity ^0.8.19;

import "@openzeppelin/contracts/token/ERC721/extensions/ERC721URIStorage.sol";
import "@openzeppelin/contracts/access/Ownable.sol";

import "./UserAccessControl.sol";

contract DrugNFT is ERC721URIStorage {
    UserAccessControl public userAccessControl;

    constructor(address _userAccessControl) ERC721("DrugNFT", "DRUG") {
        userAccessControl = UserAccessControl(_userAccessControl);
    }

    modifier onlyManufacturer() {
        require(
            userAccessControl.isManufacturer(msg.sender),
            "Only manufacturers can mint drugs"
        );
        _;
    }

    modifier onlyDistributor() {
        require(
            userAccessControl.isDistributor(msg.sender),
            "Only distributors can mint drugs"
        );
        _;
    }

    modifier onlyPharmacy() {
        require(
            userAccessControl.isPharmacy(msg.sender),
            "Only pharmacies can mint drugs"
        );
        _;
    }

    struct DrugInfo {
        string drugName;
        string batchId;
        uint256 manufactureDate;
        uint256 expiryDate;
        address currentOwner;
        string status;
    }

    struct DrugHistory {
        address owner;
        string status;
        uint256 timestamp;
    }

    mapping(uint256 => DrugInfo) public drugInfo;
    mapping(uint256 => DrugHistory[]) public drugHistory;
    mapping(uint256 => bool) public drugExists;

    modifier isDrug(uint256 tokenId) {
        require(drugExists[tokenId], "Drug does not exist");
        _;
    }

    event DrugMinted(
        address indexed manufacturer,
        string drugName,
        uint256 indexed tokenId
    );
    event DrugTransferred(
        address indexed from,
        address indexed to,
        uint256 indexed tokenId
    );
    event DrugStatusUpdated(
        uint256 indexed tokenId,
        address indexed to,
        string status,
        uint256 timestamp
    );
    event DrugHistoryUpdated(
        uint256 indexed tokenId,
        address indexed owner,
        string status,
        uint256 timestamp
    );

    function mintDRUG(
        string memory drugName,
        string memory manfCode,
        string memory productCode,
        string memory batchDate,
        uint256 stripNo,
        uint256 manufactureDate,
        uint256 expiryDate,
        string memory tokenURI
    ) public onlyManufacturer returns (uint256) {
        uint256 tokenId = uint256(
            keccak256(
                abi.encodePacked(
                    manfCode,
                    "-",
                    productCode,
                    "-",
                    batchDate,
                    "-",
                    stripNo
                )
            )
        );
        _safeMint(msg.sender, tokenId);
        _setTokenURI(tokenId, tokenURI);

        drugInfo[tokenId] = DrugInfo(
            drugName,
            batchDate,
            manufactureDate,
            expiryDate,
            msg.sender,
            "Manufactured"
        );
        drugHistory[tokenId].push(
            DrugHistory(msg.sender, "Manufactured", block.timestamp)
        );

        emit DrugMinted(msg.sender, drugName, tokenId);
        emit DrugHistoryUpdated(
            tokenId,
            msg.sender,
            "Manufactured",
            block.timestamp
        );
        emit DrugStatusUpdated(tokenId, msg.sender, "Manufactured", block.timestamp);
        drugExists[tokenId] = true;

        return tokenId;
    }

    function getDrugInfo(
        uint256 tokenId
    ) public view isDrug(tokenId) returns (DrugInfo memory) {
        return drugInfo[tokenId];
    }

    function getHistory(
        uint256 tokenId
    ) public view isDrug(tokenId) returns (DrugHistory[] memory) {
        return drugHistory[tokenId];
    }

    function isApprovedOrOwner(
        address spender,
        uint256 tokenId
    ) internal view returns (bool) {
        address owner = ownerOf(tokenId);
        return (spender == owner ||
            getApproved(tokenId) == spender ||
            isApprovedForAll(owner, spender));
    }

    function transferStrip(
        uint256 tokenId,
        address to,
        string memory newStatus
    ) public {
        require(isApprovedOrOwner(msg.sender, tokenId), "Not authorized");
        _transfer(msg.sender, to, tokenId);

        drugHistory[tokenId].push(
            DrugHistory({
                owner: to,
                status: newStatus,
                timestamp: block.timestamp
            })
        );
        drugInfo[tokenId].currentOwner = to;
        drugInfo[tokenId].status = newStatus;
        emit DrugTransferred(msg.sender, to, tokenId);

        emit DrugStatusUpdated(tokenId, to, newStatus, block.timestamp);
        emit DrugHistoryUpdated(tokenId, to, newStatus, block.timestamp);
    }
}
