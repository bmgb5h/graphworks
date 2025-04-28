import { BrowserRouter as Router, Route, Routes, Navigate, Link } from "react-router-dom";
import { useEffect, useState } from "react";

import GraphBuilder from "./components/GraphBuilder/index.jsx";
import Login from "./components/Login/index.jsx";
import Register from "./components/Register/index.jsx";
import MyGraphs from "./components/MyGraphs/index.jsx";
import GraphViewer from "./components/GraphViewer/index.jsx";
import GraphEditor from "./components/GraphEditor/index.jsx";

const App = () => {
  const [isLoggedIn, setIsLoggedIn] = useState(false);

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
              <h1 className="text-2xl font-bold">GraphWorks</h1>
              <div className="flex gap-4">
                <Link to="/builder" className="hover:underline py-1 px-2 rounded hover:bg-blue-700">
                  Graph Builder
                </Link>
                <Link to="/my-graphs" className="hover:underline py-1 px-2 rounded hover:bg-blue-700">
                  My Graphs
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
            <Route
              path="/"
              element={
                isLoggedIn ? (
                  <Navigate to="/builder" />
                ) : (
                  <Login setIsLoggedIn={setIsLoggedIn} />
                )
              }
            />
            <Route path="/register" element={<Register />} />
            <Route path="/builder" element={isLoggedIn ? <GraphBuilder /> : <Navigate to="/" />} />
            <Route path="/my-graphs" element={isLoggedIn ? <MyGraphs /> : <Navigate to="/" />} />
            <Route
              path="/graphs/:graphId"
              element={isLoggedIn ? <GraphViewer /> : <Navigate to="/" />}
            />
            <Route
              path='/graphs/:id/edit'
              element={isLoggedIn ? <GraphEditor /> : <Navigate to="/" />}
            />
            <Route path="*" element={<Navigate to="/" />} />
          </Routes>
        </div>
      </div>
    </Router>
  );
};

export default App;
