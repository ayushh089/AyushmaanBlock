// SPDX-License-Identifier: MIT
pragma solidity ^0.8.19;

import "./PrescriptionRegistry.sol";

contract PharmacyVerification {
    PrescriptionRegistry private prescriptionRegistry;

    mapping(uint256 => bool) public verifiedPrescriptions;

    event PrescriptionVerified(uint256 indexed prescriptionId, address indexed pharmacist);

    constructor(address _prescriptionRegistry) {
        prescriptionRegistry = PrescriptionRegistry(_prescriptionRegistry);
    }

    function verifyPrescription(uint256 _prescriptionId) public {
        require(!verifiedPrescriptions[_prescriptionId], "Prescription already verified");
        
        PrescriptionRegistry.Prescription memory prescription = prescriptionRegistry.getPrescription(_prescriptionId);
        require(!prescription.fulfilled, "Prescription already fulfilled");

        verifiedPrescriptions[_prescriptionId] = true;
        prescriptionRegistry.markPrescriptionFulfilled(_prescriptionId);

        emit PrescriptionVerified(_prescriptionId, msg.sender);
    }
}
