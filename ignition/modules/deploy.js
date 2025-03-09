const hre = require("hardhat");
const { buildModule } = require("@nomicfoundation/hardhat-ignition/modules");

async function main() {
  const [deployer] = await hre.ethers.getSigners();
  console.log(`Deploying contracts with account: ${deployer.address}`);

  // Get Contract Factories
  const [UserRegistry, PrescriptionRegistry, PharmacyVerification, MedicalRecords] = await Promise.all([
    hre.ethers.getContractFactory("UserRegistry"),
    hre.ethers.getContractFactory("PrescriptionRegistry"),
    hre.ethers.getContractFactory("PharmacyVerification"),
    hre.ethers.getContractFactory("MedicalRecords"),
  ]);

  // Deploy UserRegistry
  const userRegistry = await UserRegistry.deploy();
  await userRegistry.deployed();
  console.log(`✅ UserRegistry deployed at: ${userRegistry.address}`);

  // Deploy other contracts in parallel
  const [prescriptionRegistry, pharmacyVerification, medicalRecords] = await Promise.all([
    PrescriptionRegistry.deploy(userRegistry.address),
    PharmacyVerification.deploy(userRegistry.address), 
    MedicalRecords.deploy(userRegistry.address),
  ]);

  // Ensure contracts are deployed
  await Promise.all([
    prescriptionRegistry.deployed(),
    pharmacyVerification.deployed(),
    medicalRecords.deployed(),
  ]);

  console.log(`✅ PrescriptionRegistry deployed at: ${prescriptionRegistry.address}`);
  console.log(`✅ PharmacyVerification deployed at: ${pharmacyVerification.address}`);
  console.log(`✅ MedicalRecords deployed at: ${medicalRecords.address}`);

  console.log("🎉 All contracts deployed successfully!");
}

// Run the script and handle errors
main().catch((error) => {
  console.error("❌ Error deploying contracts:", error.message || error);
  process.exitCode = 1;
});
