import { Link, useLocation } from 'react-router-dom';
import { useUser } from '../contexts/UserContext';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  User, 
  LogOut, 
  LayoutDashboard, 
  ArrowUpDown, 
  Settings,
  Wallet,
  TrendingUp 
} from 'lucide-react';
import { useState, useRef, useEffect } from 'react';
import Avatar from './Avatar';

export default function Header() {
  const location = useLocation();
  const { user, signOut } = useUser();
  const [isDropdownOpen, setIsDropdownOpen] = useState(false);
  const dropdownRef = useRef(null);
  
  const isActive = (path) => {
    return location.pathname === path ? "bg-emerald-700" : "";
  };

  // Close dropdown when location changes
  useEffect(() => {
    setIsDropdownOpen(false);
  }, [location.pathname]);

  // Close dropdown when clicking outside
  useEffect(() => {
    function handleClickOutside(event) {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
        setIsDropdownOpen(false);
      }
    }

    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const toggleDropdown = () => {
    setIsDropdownOpen(prev => !prev);
  };

  return (
    <header className="bg-emerald-600 text-white py-4 px-6 shadow-lg">
      <nav className="container mx-auto flex justify-between items-center">
        <Link to="/" className="text-2xl font-bold transition-all flex items-center gap-2">
          <img src="./images/logo.png" alt="FinQuility" className="w-12 h-12" />  
          FinQuility
        </Link>
        
        <div className="flex items-center gap-4">
          {user ? (
            <div className="relative" ref={dropdownRef}>
              <button
                onClick={toggleDropdown}
                className="flex items-center gap-2 p-2 rounded-lg transition-colors"
                aria-label="Open user menu"
                aria-expanded={isDropdownOpen}
              >
                <Avatar 
                  url={user.user_metadata?.avatar_url} 
                  name={user.user_metadata?.full_name || user.email} 
                  size="md"
                />
              </button>

              <AnimatePresence>
                {isDropdownOpen && (
                  <motion.div
                    initial={{ opacity: 0, y: -10 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: -10 }}
                    className="absolute right-0 mt-2 w-48 bg-white rounded-lg shadow-lg py-2 
                             text-gray-700 z-50"
                  >
                    <div className="px-4 py-2 border-b border-gray-200">
                      <p className="font-medium">{user.user_metadata?.full_name || user.email}</p>
                      <p className="text-sm text-gray-500">{user.email}</p>
                    </div>

                    <Link 
                      to="/" 
                      className={`flex items-center gap-2 px-4 py-2 hover:bg-gray-100 
                                ${isActive('/')}`}
                      onClick={() => setIsDropdownOpen(false)}
                    >
                      <LayoutDashboard className="h-4 w-4" />
                      Dashboard
                    </Link>

                    <Link 
                      to="/transactions" 
                      className={`flex items-center gap-2 px-4 py-2 hover:bg-gray-100 
                                ${isActive('/transactions')}`}
                      onClick={() => setIsDropdownOpen(false)}
                    >
                      <ArrowUpDown className="h-4 w-4" />
                      Transactions
                    </Link>

                    <Link 
                      to="/budgets" 
                      className={`flex items-center gap-2 px-4 py-2 hover:bg-gray-100 
                                ${isActive('/budgets')}`}
                      onClick={() => setIsDropdownOpen(false)}
                    >
                      <Wallet className="h-4 w-4" />
                      Budgets
                    </Link>

                    <Link 
                      to="/investments" 
                      className={`flex items-center gap-2 px-4 py-2 hover:bg-gray-100 
                                ${isActive('/investments')}`}
                      onClick={() => setIsDropdownOpen(false)}
                    >
                      <TrendingUp className="h-4 w-4" />
                      Investments
                    </Link>

                    <Link 
                      to="/profile" 
                      className={`flex items-center gap-2 px-4 py-2 hover:bg-gray-100 
                                ${isActive('/profile')}`}
                      onClick={() => setIsDropdownOpen(false)}
                    >
                      <Settings className="h-4 w-4" />
                      Profile
                    </Link>

                    <hr className="my-2 border-gray-200" />

                    <button
                      onClick={() => {
                        signOut();
                        setIsDropdownOpen(false);
                      }}
                      className="flex items-center gap-2 px-4 py-2 hover:bg-gray-100 w-full text-left"
                    >
                      <LogOut className="h-4 w-4" />
                      Sign Out
                    </button>
                  </motion.div>
                )}
              </AnimatePresence>
            </div>
          ) : (
            <>
              <Link to="/login" className="hover:text-emerald-200">
                Sign In
              </Link>
              <Link
                to="/register"
                className="bg-emerald-700 hover:bg-emerald-800 px-4 py-2 rounded-lg 
                         transition-colors ml-4"
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