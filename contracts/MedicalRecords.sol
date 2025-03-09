// SPDX-License-Identifier: MIT
pragma solidity ^0.8.19;

import "./UserRegistry.sol";

contract MedicalRecords {
    UserRegistry private userRegistry;

    struct Record {
        string fileName;
        string fileType;
        string ipfsHash;
        bytes32 sha256Hash;
        address uploadedBy;
        bool isShared;
    }

    mapping(address => Record[]) public patientRecords;
    mapping(address => mapping(address => bool)) public accessPermissions;

    event RecordUploaded(
        address indexed patient,
        string fileName,
        string fileType,
        string ipfsHash,
        bytes32 sha256Hash
    );

    event AccessGranted(address indexed patient, address indexed doctor);
    event AccessRevoked(address indexed patient, address indexed doctor);

    bytes32 private constant PATIENT = keccak256("patient");

    modifier onlyRegistered() {
        require(userRegistry.isRegistered(msg.sender), "User not registered");
        _;
    }

    constructor(address _userRegistry) {
        userRegistry = UserRegistry(_userRegistry);
    }

    function uploadRecord(
        string memory _fileName,
        string memory _fileType,
        string memory _ipfsHash,
        bytes32 _sha256Hash
    ) public onlyRegistered {
        require(
            keccak256(abi.encodePacked(userRegistry.getUserType(msg.sender))) ==
                PATIENT,
            "Only patients can upload records"
        );

        patientRecords[msg.sender].push(
            Record(
                _fileName,
                _fileType,
                _ipfsHash,
                _sha256Hash,
                msg.sender,
                false
            )
        );

        emit RecordUploaded(
            msg.sender,
            _fileName,
            _fileType,
            _ipfsHash,
            _sha256Hash
        );
    }

    function grantAccess(address _doctor) public onlyRegistered {
        require(
            keccak256(abi.encodePacked(userRegistry.getUserType(msg.sender))) ==
                PATIENT,
            "Only patients can grant access"
        );
        require(userRegistry.isDoctor(_doctor), "Not a valid doctor");
        accessPermissions[msg.sender][_doctor] = true;
        emit AccessGranted(msg.sender, _doctor);
    }

    function revokeAccess(address _doctor) public onlyRegistered {
        require(accessPermissions[msg.sender][_doctor], "Access not granted");
        accessPermissions[msg.sender][_doctor] = false;
        emit AccessRevoked(msg.sender, _doctor);
    }

    function getRecords(
        address _patient
    ) public view onlyRegistered returns (Record[] memory) {
        require(
            msg.sender == _patient || accessPermissions[_patient][msg.sender],
            "Access denied"
        );

        return patientRecords[_patient];
    }
}
