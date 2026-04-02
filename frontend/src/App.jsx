import React from "react";
import { BrowserRouter as Router, Routes, Route } from "react-router-dom";
import { AuthProvider } from "./context/AuthContext";
import Layout from "./components/Layout";
import Home from "./pages/Home";
import Login from "./pages/Login";
import { Toaster } from "sonner";
import ElectionDetail from "./pages/ElectionDetail";
import CreateElection from "./pages/CreateElection";

function App() {
  return (
    <Router>
      <AuthProvider>
        <Toaster richColors position="top-right" />
        <Layout>
          <Routes>
            <Route path="/" element={<Home />} />
            <Route path="/login" element={<Login />} />
            <Route path="/elections/create" element={<CreateElection />} />
            <Route path="/election/:id" element={<ElectionDetail />} />
          </Routes>
        </Layout>
      </AuthProvider>
    </Router>
  );
}

export default App;
