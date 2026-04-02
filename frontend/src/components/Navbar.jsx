import React from "react";
import { Link } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import { Vote, LogOut, Wallet, Globe, Shield, UserCircle } from "lucide-react";

const Navbar = () => {
  const { user, wallet, logout, connectWallet, web3Status } = useAuth();

  return (
    <nav className="border-b bg-white/70 sticky top-0 z-50 backdrop-blur-xl supports-[backdrop-filter]:bg-white/60">
      <div className="container mx-auto flex h-20 items-center justify-between px-6">
        <div className="flex items-center gap-10">
          <Link to="/" className="flex items-center gap-3 group">
            <div className="bg-primary p-2.5 rounded-2xl shadow-lg shadow-primary/20 group-hover:scale-105 transition-transform duration-300">
              <Vote className="h-6 w-6 text-white" />
            </div>
            <div className="flex flex-col">
              <span className="font-black text-xl tracking-tight leading-none">VOTR</span>
              <span className="text-[10px] font-black uppercase tracking-[0.2em] text-primary">Decentralized</span>
            </div>
          </Link>
          
          <div className="hidden lg:flex items-center gap-4">
            <div className={`flex items-center gap-2 rounded-full border px-4 py-1.5 text-[10px] font-black uppercase tracking-widest transition-all ${
              web3Status === 'connected' ? 'bg-green-500/10 border-green-500/20 text-green-600' : 
              web3Status === 'loading' ? 'bg-amber-500/10 border-amber-500/20 text-amber-600' : 
              'bg-red-500/10 border-red-500/20 text-red-600'
            }`}>
              <div className={`h-2 w-2 rounded-full ${
                web3Status === 'connected' ? 'bg-green-500 animate-pulse' : 
                web3Status === 'loading' ? 'bg-amber-500 animate-spin' : 
                'bg-red-500'
              }`} />
              <Globe className="h-3 w-3" />
              <span>{web3Status === 'connected' ? 'Mainnet Live' : web3Status === 'loading' ? 'Syncing...' : 'Node Offline'}</span>
            </div>
            
            <div className="flex items-center gap-2 rounded-full border bg-neutral-50 px-4 py-1.5 text-[10px] font-black uppercase tracking-widest text-neutral-400">
              <Shield className="h-3 w-3" />
              <span>Consensus: POS</span>
            </div>
          </div>
        </div>

        <div className="flex items-center gap-6">
          <nav className="hidden md:flex items-center gap-8 mr-4">
            <Link to="/" className="text-sm font-bold text-neutral-600 hover:text-primary transition-colors">Dashboard</Link>
            <Link to="/elections/create" className="text-sm font-bold text-neutral-600 hover:text-primary transition-colors">Create</Link>
          </nav>

          <div className="h-8 w-px bg-neutral-100 hidden sm:block" />

          <div className="flex items-center gap-4">
            {user ? (
              <div className="flex items-center gap-4 bg-neutral-50 p-1.5 pr-4 rounded-2xl border">
                <div className="h-9 w-9 rounded-xl bg-white border flex items-center justify-center text-primary shadow-sm">
                  <UserCircle className="h-5 w-5" />
                </div>
                <div className="flex flex-col">
                  <span className="text-xs font-black leading-none">{user.name}</span>
                  <button 
                    onClick={logout}
                    className="text-[9px] text-destructive font-black uppercase tracking-widest hover:underline text-left mt-1"
                  >
                    Disconnect
                  </button>
                </div>
              </div>
            ) : (
              <Link 
                to="/login" 
                className="text-sm font-black text-neutral-900 bg-neutral-100 px-6 py-2.5 rounded-xl hover:bg-neutral-200 transition-all active:scale-95"
              >
                Sign In
              </Link>
            )}

            {wallet ? (
              <div className="flex items-center gap-3 rounded-2xl border-2 border-primary/20 bg-primary/5 pl-4 pr-1.5 py-1.5 transition-all hover:bg-primary/10">
                <div className="flex flex-col items-end">
                  <span className="text-[9px] font-black uppercase tracking-[0.15em] text-primary opacity-60 leading-none mb-1">Wallet Bound</span>
                  <span className="text-xs font-black tracking-tight">{`${wallet.slice(0, 6)}...${wallet.slice(-4)}`}</span>
                </div>
                <div className="h-8 w-8 rounded-xl bg-primary flex items-center justify-center text-white shadow-lg shadow-primary/30">
                  <Wallet className="h-4 w-4" />
                </div>
              </div>
            ) : (
              <button
                onClick={connectWallet}
                className="group relative flex items-center gap-2 rounded-2xl bg-neutral-900 px-6 py-3 text-sm font-black text-white transition-all hover:bg-neutral-800 active:scale-95 shadow-xl shadow-neutral-200 overflow-hidden"
              >
                <div className="absolute inset-0 bg-gradient-to-r from-primary/20 to-transparent opacity-0 group-hover:opacity-100 transition-opacity" />
                <Wallet className="h-4 w-4 relative z-10" />
                <span className="relative z-10">Connect Web3</span>
              </button>
            )}
          </div>
        </div>
      </div>
    </nav>
  );
};

export default Navbar;
