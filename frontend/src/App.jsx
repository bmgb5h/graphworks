import { BrowserRouter as Router, Route, Routes, Navigate, Link } from "react-router-dom";
import { useEffect, useState } from "react";

import GraphBuilder from "./components/GraphBuilder/index.jsx";
import TSPResult from "./components/TSPResult/index.jsx";
import Login from "./components/Login/index.jsx";

const App = () => {
  const [isLoggedIn, setIsLoggedIn] = useState(false);

  // Check for token in localStorage
  useEffect(() => {
    const token = localStorage.getItem("token");
    setIsLoggedIn(!!token);
  }, []);

  const handleLogout = () => {
    localStorage.removeItem("token");
    setIsLoggedIn(false);
  };

  return (
    <Router>
      <div className="min-h-screen bg-gray-100">
        {isLoggedIn && (
          <nav className="bg-blue-600 text-white p-4 shadow-md">
            <div className="max-w-7xl mx-auto flex justify-between items-center">
              <h1 className="text-2xl font-bold">Graph Solver</h1>
              <div className="flex gap-4">
                <Link to="/builder" className="hover:underline py-1 px-2 rounded hover:bg-blue-700">
                  Graph Builder
                </Link>
                <Link to="/tsp" className="hover:underline py-1 px-2 rounded hover:bg-blue-700">
                  TSP Solver
                </Link>
                <button
                  onClick={handleLogout}
                  className="bg-red-500 hover:bg-red-600 py-1 px-3 rounded text-sm"
                >
                  Logout
                </button>
              </div>
            </div>
          </nav>
        )}

        <div className="max-w-7xl mx-auto my-4 px-4">
          <Routes>
            {/* Login route */}
            <Route
              path="/"
              element={
                isLoggedIn ? <Navigate to="/builder" /> : <Login setIsLoggedIn={setIsLoggedIn} />
              }
            />

            {/* Protected routes */}
            <Route
              path="/builder"
              element={isLoggedIn ? <GraphBuilder /> : <Navigate to="/" />}
            />
            <Route
              path="/tsp"
              element={isLoggedIn ? <TSPResult /> : <Navigate to="/" />}
            />

            {/* Catch-all: redirect to login */}
            <Route path="*" element={<Navigate to="/" />} />
          </Routes>
        </div>
      </div>
    </Router>
  );
};

export default App;
