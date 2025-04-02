const hre = require("hardhat");

async function main() {
  const [deployer] = await hre.ethers.getSigners();
  console.log(`Deploying contracts with account: ${deployer.address}`);


  const UserRegistry = await hre.ethers.getContractFactory("UserRegistry");
  const userRegistry = await UserRegistry.deploy();
  await userRegistry.waitForDeployment();
  const userRegistryAddress = await userRegistry.getAddress();
  console.log(`✅ UserRegistry deployed at: ${userRegistryAddress}`);


  const PrescriptionRegistry = await hre.ethers.getContractFactory("PrescriptionRegistry");
  const PharmacyVerification = await hre.ethers.getContractFactory("PharmacyVerification");
  const MedicalRecords = await hre.ethers.getContractFactory("MedicalRecords");
  const PrescriptionNFT = await hre.ethers.getContractFactory("PrescriptionNFT");

  const prescriptionRegistry = await PrescriptionRegistry.deploy(userRegistryAddress);
  const pharmacyVerification = await PharmacyVerification.deploy(userRegistryAddress);
  const medicalRecords = await MedicalRecords.deploy(userRegistryAddress);
  const prescriptionNFT = await PrescriptionNFT.deploy(userRegistryAddress,deployer.address);

  await Promise.all([
    prescriptionRegistry.waitForDeployment(),
    pharmacyVerification.waitForDeployment(),
    medicalRecords.waitForDeployment(),
    prescriptionNFT.waitForDeployment(),
  ]);

  console.log(`✅ PrescriptionRegistry deployed at: ${await prescriptionRegistry.getAddress()}`);
  console.log(`✅ PharmacyVerification deployed at: ${await pharmacyVerification.getAddress()}`);
  console.log(`✅ MedicalRecords deployed at: ${await medicalRecords.getAddress()}`);
  console.log(`✅ PrescriptionNFT deployed at: ${await prescriptionNFT.getAddress()}`);

  console.log("🎉 All contracts deployed successfully!");
}

main().catch((error) => {
  console.error("❌ Error deploying contracts:", error);
  process.exitCode = 1;
});
