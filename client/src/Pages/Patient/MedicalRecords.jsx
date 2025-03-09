import React, { useState } from "react";
import { zeroPadBytes } from "ethers";
import { pinata } from "../../config";
import useMedicalRecord from "../../hooks/useMedicalRecord";
import { ToastContainer, toast } from "react-toastify";

const MedicalRecords = () => {
  const { contract, account } = useMedicalRecord();
  const [selectedFile, setSelectedFile] = useState(null);
  const [fileName, setFileName] = useState(""); // File name state
  const [fileType, setFileType] = useState(""); // File type state
  const [ipfsHash, setIpfsHash] = useState(null);
  const [shaHash, setShaHash] = useState(null);
  const [loading, setLoading] = useState(false);
  const [url, setUrl] = useState(null);

  const fileTypes = [
    "Blood Test Report",
    "X-Ray Report",
    "MRI Scan Report",
    "CT Scan Report",
    "ECG Report",
    "Doctor's Prescription",
    "Surgery Report",
    "Vaccination Record",
    "Allergy Report",
    "Dental Report",
    "Eye Examination Report",
    "Medical History Report",
  ];

  const changeFileHandler = (e) => {
    setSelectedFile(e.target.files[0]);
  };

  const changeNameHandler = (e) => {
    setFileName(e.target.value);
  };

  async function computeSHA256(file) {
    const buffer = await file.arrayBuffer();
    const hashBuffer = await crypto.subtle.digest("SHA-256", buffer);
    return [...new Uint8Array(hashBuffer)]
      .map((b) => b.toString(16).padStart(2, "0"))
      .join("");
  }

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!selectedFile || !fileType || !fileName) {
      alert("Please select a file, enter a file name, and choose a file type.");
      return;
    }

    setLoading(true);
    try {
      const hash = await computeSHA256(selectedFile);
      const shaHashBytes32 = zeroPadBytes(`0x${hash}`, 32);
      setShaHash(shaHashBytes32);

      const formData = new FormData();
      formData.append("file", selectedFile);
      formData.append("fileName", fileName);

      const response = await fetch(
        `${import.meta.env.VITE_BACKENDLINK}/upload`,
        {
          method: "POST",
          body: formData,
        }
      );

      if (!response.ok) {
        throw new Error("Failed to upload file");
      }

      const data = await response.json();
      setIpfsHash(data.IpfsHash);

      if (!data.IpfsHash || !shaHashBytes32) {
        throw new Error("Missing IPFS hash or SHA256 hash.");
      }

      const tx = await contract.uploadRecord(
        fileName,
        fileType,
        data.IpfsHash,
        shaHashBytes32
      );
      await tx.wait();
      showSuccessToast("Medical record uploaded successfully");

      console.log("Medical record uploaded successfully");
    } catch (error) {
      console.error("Failed to upload medical record:", error);
      showErrorToast("Failed to upload medical record");
    } finally {
      setLoading(false);
    }
  };

  const getFile = async () => {
    const url = "https://gateway.pinata.cloud/ipfs/" + ipfsHash;
    setUrl(url);
  };

  const showSuccessToast = (msg) => {
    toast.success(msg, {
      position: "top-right",
      autoClose: 1000,
      hideProgressBar: false,
      closeOnClick: true,
      pauseOnHover: true,
      draggable: true,
      progress: undefined,
    });
  };

  const showErrorToast = (msg) => {
    toast.error(msg, {
      position: "top-right",
      autoClose: 1000,
      hideProgressBar: false,
      closeOnClick: true,
      pauseOnHover: true,
      draggable: true,
      progress: undefined,
    });
  };

  return (
    <div className="bg-gray-100 flex flex-col items-center justify-center p-4">
      <h1 className="text-3xl font-bold text-gray-800 mb-6">Medical Records</h1>
      <form
        onSubmit={handleSubmit}
        className="bg-white shadow-md rounded-lg p-6 w-full max-w-md"
      >
        <div className="mb-4">
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Upload File
          </label>
          <input
            type="file"
            onChange={changeFileHandler}
            className="w-full p-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500"
            required
          />
        </div>
        <div className="mb-4">
          <label className="block text-sm font-medium text-gray-700 mb-2">
            File Name
          </label>
          <input
            type="text"
            value={fileName}
            placeholder="Enter file name"
            onChange={changeNameHandler}
            className="w-full p-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500"
            required
          />
        </div>
        <div className="mb-4">
          <label className="block text-sm font-medium text-gray-700 mb-2">
            File Type
          </label>
          <select
            value={fileType}
            onChange={(e) => setFileType(e.target.value)}
            className="w-full p-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500"
            required
          >
            <option value="" disabled>
              Select file type
            </option>
            {fileTypes.map((type, index) => (
              <option key={index} value={type}>
                {type}
              </option>
            ))}
          </select>
        </div>
        <button
          type="submit"
          disabled={loading}
          className={`w-full py-2 px-4 rounded-lg transition duration-200 ${
            loading
              ? "bg-gray-400 cursor-not-allowed"
              : "bg-green-500 hover:bg-green-600 text-white"
          }`}
        >
          {loading ? (
            <div className="flex items-center justify-center">
              <svg
                className="animate-spin h-5 w-5 mr-2 border-t-2 border-white rounded-full"
                viewBox="0 0 24 24"
              ></svg>
              Uploading...
            </div>
          ) : (
            "Upload"
          )}
        </button>
      </form>

      <div>
        <button
          className="mt-4 bg-green-500 hover:bg-green-600 text-white py-2 px-4 rounded-lg"
          onClick={getFile}
        >
          Get link
        </button>

        {url && <div>{url}</div>}
      </div>
      <ToastContainer />
    </div>
  );
};

export default MedicalRecords;
