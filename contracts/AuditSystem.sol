// SPDX-License-Identifier: MIT
pragma solidity ^0.8.19;

import "./PrescriptionRegistry.sol";

contract AuditSystem {
    PrescriptionRegistry private prescriptionRegistry;
    address public regulatoryAuthority;

    struct FlaggedPrescription {
        uint256 prescriptionId;
        address doctor;
        address patient;
        string reason;
    }

    mapping(uint256 => FlaggedPrescription) public flaggedPrescriptions;
    uint256 public flaggedCount;

    event PrescriptionFlagged(uint256 indexed prescriptionId, address indexed doctor, string reason);

    modifier onlyRegulator() {
        require(msg.sender == regulatoryAuthority, "Only regulatory authority can flag prescriptions");
        _;
    }

    constructor(address _prescriptionRegistry) {
        prescriptionRegistry = PrescriptionRegistry(_prescriptionRegistry);
        regulatoryAuthority = msg.sender;
    }

    function flagPrescription(uint256 _prescriptionId, string memory _reason) public onlyRegulator {
        PrescriptionRegistry.Prescription memory prescription = prescriptionRegistry.getPrescription(_prescriptionId);

        flaggedCount++;
        flaggedPrescriptions[flaggedCount] = FlaggedPrescription(_prescriptionId, prescription.doctor, prescription.patient, _reason);

        emit PrescriptionFlagged(_prescriptionId, prescription.doctor, _reason);
    }
}
