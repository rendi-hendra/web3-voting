import React, { createContext, useContext, useState, useEffect } from "react";
import { ethers } from "ethers";
import axios from "axios";

const AuthContext = createContext();

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null); // Web2 user info
  const [wallet, setWallet] = useState(null); // Web3 wallet address
  const [loading, setLoading] = useState(true);
  const [web3Status, setWeb3Status] = useState("disconnected"); // disconnected, connected, error

  // Check for existing Web2 session or Web3 connection on mount
  useEffect(() => {
    const checkAuth = async () => {
      const savedUser = localStorage.getItem("user");
      if (savedUser) setUser(JSON.parse(savedUser));

      if (window.ethereum) {
        try {
          const accounts = await window.ethereum.request({ method: "eth_accounts" });
          if (accounts.length > 0) setWallet(accounts[0]);
          setWeb3Status("connected");
        } catch (err) {
          setWeb3Status("error");
        }
      }
      setLoading(false);
    };
    checkAuth();
  }, []);

  const login = async (email, password) => {
    try {
      const response = await axios.post("http://localhost:4000/api/auth/login", { email, password });
      if (response.data.success) {
        const { user, token } = response.data;
        setUser(user);
        localStorage.setItem("user", JSON.stringify(user));
        localStorage.setItem("token", token);
        return { success: true };
      }
    } catch (error) {
      console.error("Login error details:", error);
      const detail = error.response?.data?.message || error.message || "Unknown login error";
      return { success: false, message: `Login failed: ${detail}` };
    }
  };

  const register = async (name, email, password) => {
    try {
      const response = await axios.post("http://localhost:4000/api/auth/register", { name, email, password });
      return response.data;
    } catch (error) {
      console.error("Registration error details:", error);
      const detail = error.response?.data?.message || error.message || "Unknown error";
      return { success: false, message: `Registration failed: ${detail}` };
    }
  };

  const logout = () => {
    setUser(null);
    setWallet(null);
    setWeb3Status("disconnected");
    localStorage.removeItem("user");
    localStorage.removeItem("token");
  };

  const connectWallet = async () => {
    if (window.ethereum) {
      try {
        setWeb3Status("loading");
        const accounts = await window.ethereum.request({ method: "eth_requestAccounts" });
        setWallet(accounts[0]);
        setWeb3Status("connected");
        return accounts[0];
      } catch (error) {
        console.error("Wallet connection failed:", error);
        setWeb3Status("error");
      }
    } else {
      alert("Please install MetaMask!");
    }
  };

  return (
    <AuthContext.Provider value={{ user, wallet, login, register, logout, connectWallet, loading, web3Status }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => useContext(AuthContext);
