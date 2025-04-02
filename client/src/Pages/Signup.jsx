import { useState, useEffect, useRef } from "react";
import axios from "axios";
import { ethers } from "ethers";
import { debounce } from "lodash"; 
import useUserRegistry from "../hooks/useUserRegistry";
import { useNavigate } from "react-router-dom";

export default function Signup() {
  const { contract, account } = useUserRegistry();
  // console.log("Contract-:", contract);
  // console.log("Account:", account);
  const [userType, setUserType] = useState("patient");
  const navigate = useNavigate();
  const formRef = useRef({
    name: "",
    // dob: "",
    // email: "",
    // phone: "",
    // gender: "Male",
    // password: "",
    userType: "patient",
  });

  // Debounced handleChange
  const handleChange = debounce((e) => {
    const { name, value } = e.target;

    if (name === "userType") {
      setUserType(value);
    }

    formRef.current = {
      ...formRef.current,
      [name]: value,
    };
    console.log("Form data updated:", formRef.current);
  }, 300); // 300ms delay

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!account) return alert("Please connect your wallet first!");

    try {

      const offChainData = {
        name: formRef.current.name,
        // date_of_birth: formRef.current.dob,
        // email: formRef.current.email,
        // phone: formRef.current.phone,
        // gender: formRef.current.gender,

        role: formRef.current.userType, 
        wallet_address: account,
      };

      console.log("Sending data:", offChainData); 

      const response = await axios.post(
        `${import.meta.env.VITE_BACKENDLINK}/register`,
        { offChainData },
        {
          withCredentials: true,
        }
      );

      console.log("Registration successful:", response.data);
      // register();
      console.log("Response ok status:", response.ok);

      if (response.data.user_id && register()) {
        alert("User registered successfully(Data stored)!");
        navigate("/login");
      } else {
        throw new Error("Failed to store off-chain data");
      }
    } catch (error) {
      console.error("Registration failed:", error);
      alert("Registration failed! Please try again=>" + error.response.data);
    }
  };

  const register = async () => {
    console.log("Registering user...");
    try {
      const tx = await contract.registerUser(formRef.current.userType);
      await tx.wait();
      alert("User successfully gets a Block!");
      return 1;
      // navigate("/login");
    } catch (error) {
      console.error("Registration failed:", error);
      alert(error.reason || "Registration failed! Please try again.");
    }
  };

  return (
    <div className="flex flex-col items-center justify-center min-h-screen bg-gray-100">
      <h1 className="text-2xl font-bold mb-4">Signup</h1>
      {account && <p>Connected as: {account}</p>}

      <form onSubmit={handleSubmit} className="flex flex-col items-center">
      
        <input
          type="text"
          name="name"
          placeholder="Full Name"
          onChange={handleChange}
          className="border px-4 py-2 mt-2 rounded w-80"
          required
        />

        {/* <input
          type="date"
          name="dob"
          onChange={handleChange}
          className="border px-4 py-2 mt-2 rounded w-80"
          required
        />

        <input
          type="email"
          name="email"
          placeholder="Email"
          onChange={handleChange}
          className="border px-4 py-2 mt-2 rounded w-80"
          required
        />

        <input
          type="tel"
          name="phone"
          placeholder="Phone Number"
          onChange={handleChange}
          className="border px-4 py-2 mt-2 rounded w-80"
          required
        />

        <select
          name="gender"
          onChange={handleChange}
          className="border px-4 py-2 mt-2 rounded w-80"
          required
        >
          <option value="Male">Male</option>
          <option value="Female">Female</option>
          <option value="Other">Other</option>
        </select>

        <input
          type="password"
          name="password"
          placeholder="Password"
          onChange={handleChange}
          className="border px-4 py-2 mt-2 rounded w-80"
          required
        /> */}

        <select
          name="userType"
          onChange={handleChange}
          className="border px-4 py-2 mt-2 rounded w-80"
          required
        >
          <option value="patient">Patient</option>
          <option value="doctor">Doctor</option>
          <option value="pharmacist">Pharmacy</option>
        </select>

        <button
          type="submit"
          className="px-4 py-2 bg-green-500 text-white rounded mt-4"
        >
          Register
        </button>
      </form>
    </div>
  );
}
