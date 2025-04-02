// SPDX-License-Identifier: MIT
pragma solidity ^0.8.19;

import "./UserRegistry.sol";

contract PrescriptionRegistry {
    UserRegistry private userRegistry;

    struct Prescription {
        string ipfsHash;
        address doctor;
        address patient;
        uint256 timestamp;
        bool fulfilled;
    }

    mapping(uint256 => Prescription) public prescriptions;
    uint256 public prescriptionCount;

    event PrescriptionIssued(
        uint256 indexed prescriptionId,
        address indexed doctor,
        address indexed patient,
        string ipfsHash
    );
    event PrescriptionFulfilled(uint256 indexed prescriptionId);

    modifier onlyDoctor() {
        require(
            userRegistry.isDoctor(msg.sender),
            "Only doctors can issue prescriptions"
        );
        _;
    }

    constructor(address _userRegistry) {
        userRegistry = UserRegistry(_userRegistry);
    }

    function issuePrescription(
        address _patient,
        string memory _ipfsHash
    ) public onlyDoctor {
        require(userRegistry.isRegistered(_patient), "Patient not registered");
        prescriptionCount++;
        prescriptions[prescriptionCount] = Prescription(
            _ipfsHash,
            msg.sender,
            _patient,
            block.timestamp,
            false
        );
        emit PrescriptionIssued(
            prescriptionCount,
            msg.sender,
            _patient,
            _ipfsHash
        );
    }

    function markPrescriptionFulfilled(uint256 _prescriptionId) public {
        require(
            !prescriptions[_prescriptionId].fulfilled,
            "Prescription already fulfilled"
        );
        prescriptions[_prescriptionId].fulfilled = true;
        emit PrescriptionFulfilled(_prescriptionId);
    }

    function getPrescription(
        uint256 _prescriptionId
    ) public view returns (Prescription memory) {
        return prescriptions[_prescriptionId];
    }

    function getPatientPrescriptions(
        address _patient
    ) public view returns (Prescription[] memory) {
        require(userRegistry.isRegistered(_patient), "Patient not registered");

        uint256 count = 0;

        for (uint256 i = 1; i <= prescriptionCount; i++) {
            if (prescriptions[i].patient == _patient) {
                count++;
            }
        }

        Prescription[] memory patientPrescriptions = new Prescription[](count);
        uint256 index = 0;

        for (uint256 i = 1; i <= prescriptionCount; i++) {
            if (prescriptions[i].patient == _patient) {
                patientPrescriptions[index] = prescriptions[i];
                index++;
            }
        }

        return patientPrescriptions;
    }
}
