import { BrowserRouter as Router, Routes, Route } from "react-router-dom";
import Signup from "./Pages/Signup";
import Login from "./Pages/Login";
import HomePage from "./Pages/HomePage";
import { AuthProvider, useAuth } from "./context/AuthContext";
import Layout from "./Components/Layout";
import DoctorLayout from "./Components/DoctorLayout";
import Navbar from "./Components/Navbar";
import MedicalRecords from "./Pages/Patient/MedicalRecords";
import PatientDashboard from "./Pages/Patient/PatientDashboard";
import GrantAccess from "./Pages/Patient/GrantAccess";
import PatientManager from "./Pages/Doctor/PatientManager";
import RevokeAccess from "./Pages/Patient/RevokeAccess";
import MyDoctors from "./Pages/Patient/MyDoctors";
import Prescription from "./Pages/Patient/Prescription";
import Verification from "./Pages/Verification";
import Dispensed from "./Pages/Pharmacy/Dispensed";
import PharmacistLayout from "./Components/PharmacistLayout";

function App() {
  return (
    <AuthProvider>
      <Router>
        <Navbar />
        <MainContent />
      </Router>
    </AuthProvider>
  );
}

function MainContent() {
  const { user } = useAuth();

  return (
    <div className="min-h-screen bg-gray-100">
      {user ? (
        user.role === "patient" ? (
          <Layout />
        ) : user.role === "doctor" ? (
          <DoctorLayout />
        ) : user.role === "pharmacist" ? (
          <PharmacistLayout />
        ) : null
      ) : null}

      <div className="flex justify-center items-center">
        <Routes>
          {!user ? (
            <>
              <Route path="/signup" element={<Signup />} />
              <Route path="/login" element={<Login />} />
              <Route path="/" element={<Login />} />
            </>
          ) : (
            <>
              <Route path="/homepage" element={<HomePage />} />
              <Route path="/dashboard" element={<PatientDashboard />} />
              <Route
                path="/upload-medical-records"
                element={<MedicalRecords />}
              />
              <Route path="/grant-access" element={<GrantAccess />} />
              <Route path="/revoke-access" element={<RevokeAccess />} />
              <Route path="/patient-manager" element={<PatientManager />} />
              <Route path="/my-doctors" element={<MyDoctors />} />
              <Route path="/prescription" element={<Prescription />} />
              <Route path="/verify" element={<Verification />} />
              <Route path="/dispensed" element={<Dispensed />} />
            </>
          )}
        </Routes>
      </div>
    </div>
  );
}

export default App;
