import { MerkleTree } from "merkletreejs";
import keccak256 from "keccak256";
import { Buffer } from "buffer";
import { ToastContainer, toast } from "react-toastify";
window.Buffer = Buffer;
import { useState } from "react";
import { ethers, getBytes } from "ethers";

const { solidityPackedKeccak256, JsonRpcProvider } = ethers;

import useDrugNFT from "../../hooks/useDrugNFT";
import { uploadDrugMetadataToIPFS } from "../../utils/uploadBatchMetadata";

const CreateDrug = () => {
  const { contract, account } = useDrugNFT();
  const [loading, setLoading] = useState(false);
  const [ipfsLink, setIpfsLink] = useState(null);
  const [drugData, setDrugData] = useState({
    drugName: "",
    manfCode: "",
    productCode: "",
    batchDate: "",
    stripNo: "",
    manufactureDate: "",
    expiryDate: "",
    description: "",
  });

  const handleChange = (e) => {
    const { name, value } = e.target;
    setDrugData((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  const handleUpload = async () => {
    try {
      console.log("Uploading drug data to IPFS...");
      setLoading(true);

      const stripCount = parseInt(drugData.stripNo);
      const batchId = drugData.manfCode + Date.now().toString(16).slice(-6);
      console.log("Batch ID:", batchId);

      const stripIDs = Array.from(
        { length: stripCount },
        (_, i) => `${batchId}-${i + 1}`
      );
      console.log("Strip IDs:", stripIDs);

      const leaves = stripIDs.map((id) => keccak256(id));
      console.log(
        "Leaves:",
        leaves.map((x) => x.toString("hex"))
      );

      const merkleTree = new MerkleTree(leaves, keccak256, { sortPairs: true });

      const merkleRoot = merkleTree.getHexRoot();
      console.log("Merkle Root:", merkleRoot);
      // console.log(
      //   "Leaves:",
      //   leaves.map((x) => x.toString("hex"))
      // );

      const metadata = {
        ...drugData,
        manufacturer: account,
        stripIDs,
        merkleRoot,
      };

      const ipfsUrl = await uploadDrugMetadataToIPFS(
        metadata,
        contract,
        account
      );
      setIpfsLink(ipfsUrl);

      console.log("Calling contract to mint batch...");
      
      const tx = await contract.mintBatch(batchId, merkleRoot, ipfsUrl);
      await tx.wait();
      console.log("Transaction Hash:", tx)
      

      toast.success(`${stripCount} Drug NFTs minted successfully!`);
    } catch (error) {
      console.error("Error uploading drug data:", error.message);
      toast.error("Failed to create Drug NFTs: " + error.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="max-w-2xl mx-auto bg-white p-8 rounded-2xl shadow-lg border mt-12 space-y-6 transition-all duration-300">
      <h2 className="text-3xl font-bold text-center text-gray-800 mb-6">
        Create Drug
      </h2>

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
        {[
          { label: "Drug Name", name: "drugName" },
          { label: "Manufacturer Code", name: "manfCode" },
          { label: "Product Code", name: "productCode" },
          { label: "Batch Date (e.g. 2025-04-13)", name: "batchDate" },
          { label: "Strip Number", name: "stripNo", type: "number" },
          { label: "Manufacture Date", name: "manufactureDate", type: "date" },
          { label: "Expiry Date", name: "expiryDate", type: "date" },
        ].map(({ label, name, type = "text" }) => (
          <div key={name} className="flex flex-col">
            <label className="mb-1 text-gray-700 font-medium">{label}</label>
            <input
              type={type}
              name={name}
              value={drugData[name]}
              onChange={handleChange}
              className="px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 transition"
              placeholder={`Enter ${label}`}
            />
          </div>
        ))}
      </div>

      <div>
        <label className="block text-gray-700 font-medium mb-1">
          Description
        </label>
        <textarea
          name="description"
          value={drugData.description}
          onChange={handleChange}
          rows="4"
          className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 transition"
          placeholder="Enter Drug Description"
        />
      </div>

      <button
        onClick={handleUpload}
        disabled={loading}
        className={`w-full py-3 text-white font-semibold rounded-lg transition duration-300 ${
          loading
            ? "bg-blue-400 cursor-not-allowed"
            : "bg-blue-600 hover:bg-blue-700"
        }`}
      >
        {loading ? (
          <span className="flex justify-center items-center gap-2">
            <svg
              className="w-5 h-5 animate-spin text-white"
              fill="none"
              viewBox="0 0 24 24"
            >
              <circle
                className="opacity-25"
                cx="12"
                cy="12"
                r="10"
                stroke="currentColor"
                strokeWidth="4"
              />
              <path
                className="opacity-75"
                fill="currentColor"
                d="M4 12a8 8 0 018-8v8z"
              />
            </svg>
            Uploading...
          </span>
        ) : (
          "Mint Drug NFT"
        )}
      </button>

      {ipfsLink && (
        <p className="text-center mt-4 text-green-600 text-sm">
          ✅ Uploaded!{" "}
          <a
            href={ipfsLink}
            target="_blank"
            rel="noopener noreferrer"
            className="underline hover:text-green-700 transition"
          >
            View on IPFS
          </a>
        </p>
      )}
      <ToastContainer />
    </div>
  );
};

export default CreateDrug;
