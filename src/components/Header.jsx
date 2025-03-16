import { Link, useLocation } from 'react-router-dom';
import { useUser } from '../contexts/UserContext';
import { motion } from 'framer-motion';

export default function Header() {
  const location = useLocation();
  const { user, signOut } = useUser();
  
  const isActive = (path) => {
    return location.pathname === path ? "text-emerald-200 font-medium" : "";
  };

  return (
    <header className="bg-emerald-600 text-white py-4 px-6 shadow-lg">
      <nav className="container mx-auto flex justify-between items-center">
        <Link to="/" className="text-2xl font-bold hover:text-emerald-100 transition-all">
          <span className="text-emerald-200">$</span>FinanceTracker
        </Link>
        
        <div className="flex gap-6 items-center text-sm">
          {user ? (
            <>
              <Link to="/dashboard" className={`hover:text-emerald-200 ${isActive('/dashboard')}`}>
                Dashboard
              </Link>
              <Link to="/transactions" className={`hover:text-emerald-200 ${isActive('/transactions')}`}>
                Transactions
              </Link>
              <Link to="/profile" className={`hover:text-emerald-200 ${isActive('/profile')}`}>
                Profile
              </Link>
              <button
                onClick={signOut}
                className="bg-emerald-700 hover:bg-emerald-800 px-4 py-2 rounded-lg transition-colors"
              >
                Sign Out
              </button>
            </>
          ) : (
            <>
              <Link to="/login" className="hover:text-emerald-200">
                Sign In
              </Link>
              <Link
                to="/register"
                className="bg-emerald-700 hover:bg-emerald-800 px-4 py-2 rounded-lg transition-colors"
              >
                Get Started
              </Link>
            </>
          )}
        </div>
      </nav>
    </header>
  );
} 