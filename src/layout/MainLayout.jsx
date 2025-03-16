// src/layout/MainLayout.jsx
import { Outlet } from "react-router-dom";
import Header from "../components/Header";

export default function MainLayout() {
  return (
    <div className="min-h-screen bg-gray-50">
      <Header />
      <main className="pb-8 pt-4">
        <div className="px-4 max-w-7xl mx-auto">
          <Outlet />
        </div>
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
