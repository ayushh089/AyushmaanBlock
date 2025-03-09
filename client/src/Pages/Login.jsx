import { useState } from "react";
import { ethers } from "ethers";
import axios from "axios";
import { useAuth } from "../context/AuthContext";
import { useNavigate } from "react-router-dom";


const Login = () => {
  const { setUser, user } = useAuth();
  // const setUserAtom = useSetRecoilState(userAtom);
  const [walletAddress, setWalletAddress] = useState("");
  const [privateKey, setPrivateKey] = useState("");
  const [challengeMessage, setChallengeMessage] = useState("");
  const [signature, setSignature] = useState("");
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();
  console.log("user-", user);

  const getChallengeMessage = async () => {
    if (!walletAddress) {
      alert("Please enter your wallet address.");
      return;
    }

    try {
      setLoading(true);

      // Step 1: Get a challenge message from the backend
      const challengeResponse = await axios.get(
        `${import.meta.env.VITE_BACKENDLINK}/challenge`,
        { params: { walletAddress } }
      );
      setChallengeMessage(challengeResponse.data.challenge);
      console.log("Challenge message:", challengeResponse.data.challenge);
    } catch (error) {
      console.error("Error fetching challenge message:", error);
      alert("Failed to fetch challenge message. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  const signChallengeMessage = async () => {
    if (!walletAddress || !privateKey || !challengeMessage) {
      alert(
        "Please enter your wallet address, private key, and fetch a challenge message."
      );
      return;
    }

    try {
      setLoading(true);

      // Step 2: Sign the challenge message using the private key
      const wallet = new ethers.Wallet(privateKey);
      const signature = await wallet.signMessage(challengeMessage);
      setSignature(signature);
      console.log("Signature:", signature);
    } catch (error) {
      console.error("Error signing challenge message:", error);
      alert("Failed to sign challenge message. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  const handleLogin = async () => {
    if (!walletAddress || !challengeMessage || !signature) {
      alert(
        "Please complete all steps: enter wallet address, private key, fetch challenge, and sign it."
      );
      return;
    }

    try {
      setLoading(true);

      // Step 3: Send the wallet address, challenge message, and signature to the backend
      console.log("Logging in with:", {
        walletAddress,
        challengeMessage,
        signature,
      });

      const loginResponse = await axios.post(
        `${import.meta.env.VITE_BACKENDLINK}/login`,
        { walletAddress, challengeMessage, signature }
      );

      console.log("Login Response:", loginResponse.data);
      console.log("Profile Data:", loginResponse.data.profile.rows[0]);

      const userData = loginResponse.data.profile.rows[0];

      setUser(userData);
      // setUserAtom({ ...loginResponse.data, isAuthenticated: true });
      localStorage.setItem("user", JSON.stringify(userData)); // Persist user
      console.log("User State Updated!");

      navigate("/homepage"); // Navigate AFTER updating user
    } catch (error) {
      console.error("Login failed:", error);
      alert("Login failed! Please try again.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="flex flex-col items-center justify-center min-h-screen bg-gray-100">
      <div className="bg-white p-6 rounded-lg shadow-md w-96">
        <h2 className="text-2xl font-semibold text-center mb-4">Login</h2>

        <label className="block mb-2 font-medium">Wallet Address:</label>
        <input
          type="text"
          placeholder="Enter wallet address"
          value={walletAddress}
          onChange={(e) => setWalletAddress(e.target.value)}
          className="w-full p-2 border rounded mb-4"
        />

        <label className="block mb-2 font-medium">Private Key:</label>
        <input
          type="password"
          placeholder="Enter private key"
          value={privateKey}
          onChange={(e) => setPrivateKey(e.target.value)}
          className="w-full p-2 border rounded mb-4"
        />

        {!challengeMessage && (
          <button
            onClick={getChallengeMessage}
            className="w-full bg-yellow-500 text-white p-2 rounded hover:bg-yellow-600 mb-4"
            disabled={loading}
          >
            {loading ? "Fetching challenge..." : "Get Challenge Message"}
          </button>
        )}

        {challengeMessage && !signature && (
          <button
            onClick={signChallengeMessage}
            className="w-full bg-purple-500 text-white p-2 rounded hover:bg-purple-600 mb-4"
            disabled={loading}
          >
            {loading ? "Signing..." : "Sign Challenge Message"}
          </button>
        )}

        {signature && (
          <button
            onClick={handleLogin}
            className="w-full bg-green-500 text-white p-2 rounded hover:bg-green-600"
            disabled={loading}
          >
            {loading ? "Logging in..." : "Login"}
          </button>
        )}
      </div>
    </div>
  );
};

export default Login;
