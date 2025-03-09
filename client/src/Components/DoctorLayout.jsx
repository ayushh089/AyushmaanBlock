import { Link, Outlet } from "react-router-dom";
import { useAuth } from "../context/AuthContext";

const DoctorLayout = () => {
  const { user } = useAuth();

  return (
    <div className="bg-gray-100">
      {/* Top Navbar */}
      <nav className="bg-green-200 shadow-md py-3">
        <div className="flex justify-center space-x-0">
          <Link
            to="/dashboard"
            className="text-gray-700 hover:font-extrabold font-medium px-4 border-r border-white"
          >
            🏠 Dashboard
          </Link>
          <Link
            to="/patient-manager"
            className="text-gray-700 hover:font-extrabold font-medium px-4 border-r border-white"
          >
            🙍Patient
          </Link>

        </div>
      </nav>

      {/* Main Content Area */}
      <main className="p-2 mt-3">
        {" "}
        {/* Added padding and margin-top */}
        <Outlet />
      </main>
    </div>
  );
};

export default DoctorLayout;
