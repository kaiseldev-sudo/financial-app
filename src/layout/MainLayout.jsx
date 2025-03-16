// src/layout/MainLayout.jsx
import { Outlet } from "react-router-dom";
import Header from "../components/Header";

export default function MainLayout() {
  return (
    <div className="min-h-screen flex flex-col bg-gray-50 text-gray-800">
      <Header />

      {/* Main Content */}
      <main 
        className="flex-1 container mx-auto p-6 mt-4"
        role="main"
      >
        <Outlet />
      </main>

      {/* Footer */}
      <footer 
        className="bg-emerald-600 text-emerald-50 py-4 text-center text-sm"
        role="contentinfo"
      >
        <div className="container mx-auto">
          <p>&copy; {new Date().getFullYear()} FinanceTracker. All rights reserved.</p>
        </div>
      </footer>
    </div>
  );
}

MainLayout.propTypes = {};
