import { Link } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import { useState } from "react";
import { Copy, Check } from "lucide-react";

const Navbar = () => {
  const { user, setUser } = useAuth();
  const [copied, setCopied] = useState(false);

  const handleLogout = () => {
    localStorage.removeItem("user");
    setUser(null);
  };

  const handleCopy = () => {
    if (user?.wallet_address) {
      navigator.clipboard.writeText(user.wallet_address);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    }
  };

  const handleAvatarClick = () => {
    // Handle avatar click actions (profile menu, settings, etc.)
  };

  return (
    <nav className="bg-green-600 text-white p-4 shadow-lg">
      <div className="container mx-auto flex justify-between items-center">
        <h1 className="text-2xl font-bold">AyushmaanBlock</h1>
        <div className="flex items-center space-x-6">
          {user ? (
            <>
              <div className="flex items-center space-x-3">
                <span className="font-semibold">Hey {user.name}!</span>
                <div className="flex items-center bg-gray-800 px-2 py-1 rounded-lg">
                  <span className="text-sm">{user.wallet_address}</span>
                  <button onClick={handleCopy} className="ml-2 text-gray-400 hover:text-white">
                    {copied ? <Check size={16} /> : <Copy size={16} />}
                  </button>
                </div>
              </div>
              <button
                onClick={handleLogout}
                className="bg-red-500 px-4 py-2 rounded-lg hover:bg-red-600"
              >
                Logout
              </button>
              <div className="cursor-pointer" onClick={handleAvatarClick}>
                <img
                  src={`https://ui-avatars.com/api/?name=${user.name}&background=random&length=1&unique=${user.wallet_address}`}
                  alt="Avatar"
                  className="rounded-full w-10 h-10 border-2 border-white"
                  title="Account"
                />
              </div>
            </>
          ) : (
            <>
              <Link to="/login" className="hover:underline">Login</Link>
              <Link to="/signup" className="hover:underline">Signup</Link>
            </>
          )}
        </div>
      </div>
    </nav>
  );
};

export default Navbar;