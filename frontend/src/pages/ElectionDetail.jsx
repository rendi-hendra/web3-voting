import React, { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { io } from "socket.io-client";
import axios from "axios";
import { toast } from "sonner";
import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, Cell } from "recharts";
import { useAuth } from "../context/AuthContext";
import { ethers } from "ethers";
import { CONTRACT_ADDRESS, VOTING_ABI, RPC_URL } from "../lib/constants";
import { 
  CheckCircle2, AlertCircle, Info, Vote as VoteIcon, 
  ArrowLeft, Loader2, Link as LinkIcon, ShieldCheck, 
  History, TrendingUp, User
} from "lucide-react";

const ElectionDetail = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const { user, wallet } = useAuth();
  const [election, setElection] = useState(null);
  const [loading, setLoading] = useState(true);
  const [selectedCandidate, setSelectedCandidate] = useState(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [voted, setVoted] = useState(false);
  const [hasUserVoted, setHasUserVoted] = useState(false);

  const fetchElection = async () => {
    try {
      const response = await axios.get(`http://localhost:4000/api/elections/${id}`);
      setElection(response.data.data);
      
      // If user is logged in, check if they are in the votes list
      if (user && response.data.data.votes) {
        const alreadyVoted = response.data.data.votes.some(v => v.voterId === user.id);
        if (alreadyVoted) setHasUserVoted(true);
      }
    } catch (error) {
      toast.error("Failed to load election details");
    } finally {
      setLoading(false);
    }
  };

  const checkWeb3Voted = async () => {
    if (wallet && window.ethereum) {
      try {
        const provider = new ethers.BrowserProvider(window.ethereum);
        const contract = new ethers.Contract(CONTRACT_ADDRESS, VOTING_ABI, provider);
        const voted = await contract.hasVoted(id, wallet);
        if (voted) setHasUserVoted(true);
      } catch (err) {
        console.error("Error checking Web3 vote status:", err);
      }
    }
  };

  useEffect(() => {
    fetchElection();

    const socket = io("http://localhost:4000");
    socket.on("voteCast", (data) => {
      if (Number(data.electionId) === Number(id)) {
        // Refresh data or update local state
        setElection(prev => {
          if (!prev) return prev;
          return {
            ...prev,
            candidates: prev.candidates.map(c => 
              c.id === data.candidateId ? { ...c, _count: { votes: (c._count?.votes || 0) + 1 } } : c
            )
          };
        });
        toast.info("A new vote has been cast!", {
          icon: <ShieldCheck className="h-4 w-4 text-primary" />,
        });
      }
    });

    return () => socket.disconnect();
  }, [id]);

  useEffect(() => {
    if (wallet) {
      checkWeb3Voted();
    }
    
    // Check Web2 Vote Status
    if (user && election && election.votes) {
      const alreadyVoted = election.votes.some(v => v.voterId === user.id);
      if (alreadyVoted) setHasUserVoted(true);
    }
  }, [wallet, id, user, election]);

  if (loading) return <div className="flex flex-col items-center justify-center py-20"><Loader2 className="h-10 w-10 animate-spin text-primary" /></div>;
  if (!election) return <div className="text-center py-20 font-bold text-xl">Election not found</div>;

  const isClosed = new Date() > new Date(election.endDate);
  
  // Format data for Recharts
  const chartData = election.candidates.map(c => ({
    name: c.name,
    votes: c._count?.votes || 0,
  }));

  const handleVote = async () => {
    if (!selectedCandidate) return;
    if (!user && !wallet) {
      toast.error("Please login or connect wallet to vote");
      navigate("/login");
      return;
    }

    setIsSubmitting(true);
    try {
      if (wallet) {
        // Path Web3: Direct MetaMask Transaction
        if (!window.ethereum) throw new Error("MetaMask not found");
        
        const provider = new ethers.BrowserProvider(window.ethereum);
        const signer = await provider.getSigner();
        const contract = new ethers.Contract(CONTRACT_ADDRESS, VOTING_ABI, signer);
        
        const tx = await contract.castVote(id, selectedCandidate.id);
        toast.promise(tx.wait(), {
          loading: "Mining your vote on blockchain...",
          success: "Vote mined successfully!",
          error: "Mining failed."
        });
        await tx.wait();
      } else {
        // Path Web2: API call to Backend (Delegated)
        const response = await axios.post(`http://localhost:4000/api/elections/${id}/vote`, {
          candidateId: selectedCandidate.id,
          voterId: user.id
        });
        
        if (response.data.success) {
          toast.success("Vote cast successfully (Delegated to Blockchain)!");
        }
      }
      setVoted(true);
      setHasUserVoted(true);
    } catch (error) {
      console.error("Full Vote Error:", error);
      
      let msg = error.reason || error.response?.data?.message || error.message;
      
      // Handle the notoriously ugly Ethers v6 ganache missing revert data error
      if (error.code === 'CALL_EXCEPTION' && error.message.includes('missing revert data')) {
         msg = "Trx Reverted: Akun MetaMask ini sudah terdaftar memberikan suara untuk Election ID di jaringan blockchain (Ganache), walaupun di database terlihat baru. Harap buat akun/address baru di MetaMask.";
      }
      
      toast.error(`Voting failed: ${msg}`);
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="space-y-10 animate-in fade-in slide-in-from-bottom-4 duration-700 pb-20">
      <button 
        onClick={() => navigate("/")}
        className="flex items-center gap-2 text-sm font-bold text-muted-foreground hover:text-primary transition-all group"
      >
        <ArrowLeft className="h-4 w-4 group-hover:-translate-x-1 transition-transform" />
        Back to Dashboard
      </button>

      <div className="grid lg:grid-cols-12 gap-10">
        {/* Main Content */}
        <div className="lg:col-span-8 space-y-10">
          <header className="space-y-6">
            <div className="flex flex-wrap items-center gap-3">
              <div className="flex items-center gap-2 rounded-full bg-primary/10 px-3 py-1 text-[10px] font-black uppercase tracking-widest text-primary">
                <ShieldCheck className="h-3.5 w-3.5" />
                Secured by Blockchain
              </div>
              <div className={`flex items-center gap-2 rounded-full px-3 py-1 text-[10px] font-black uppercase tracking-widest ${isClosed ? 'bg-red-100 text-red-600' : 'bg-green-100 text-green-600'}`}>
                {isClosed ? 'Closed' : 'Live Now'}
              </div>
            </div>
            <h1 className="text-5xl font-black tracking-tighter leading-tight">{election.title}</h1>
            <p className="text-muted-foreground text-xl leading-relaxed max-w-3xl">{election.description}</p>
          </header>

          {/* Analytics Section */}
          <div className="rounded-3xl border bg-white p-8 shadow-sm">
            <div className="flex items-center justify-between mb-8">
              <div className="flex items-center gap-3 text-xl font-black tracking-tight">
                <TrendingUp className="h-6 w-6 text-primary" />
                Real-time Statistics
              </div>
            </div>
            <div className="h-[300px] w-full">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={chartData}>
                  <XAxis dataKey="name" fontSize={12} fontWeight={700} axisLine={false} tickLine={false} />
                  <Tooltip 
                    cursor={{fill: '#f8fafc'}}
                    contentStyle={{borderRadius: '12px', border: 'none', boxShadow: '0 10px 15px -3px rgb(0 0 0 / 0.1)'}}
                  />
                  <Bar dataKey="votes" radius={[10, 10, 0, 0]}>
                    {chartData.map((entry, index) => (
                      <Cell key={index} fill={index === 0 ? '#3b82f6' : '#6366f1'} />
                    ))}
                  </Bar>
                </BarChart>
              </ResponsiveContainer>
            </div>
          </div>

          {/* Candidates Grid */}
          <div className="space-y-6">
            <h2 className="text-2xl font-black tracking-tight flex items-center gap-3">
              <User className="h-6 w-6 text-primary" />
              Meet the Candidates
            </h2>
            <div className="grid gap-4">
              {election.candidates.map((candidate) => (
                <div
                  key={candidate.id}
                  onClick={() => !hasUserVoted && !isClosed && setSelectedCandidate(candidate)}
                  className={`group relative flex cursor-pointer items-start justify-between rounded-3xl border-2 p-6 transition-all ${
                    selectedCandidate?.id === candidate.id
                      ? "border-primary bg-primary/5 shadow-md shadow-primary/5"
                      : "border-border bg-card hover:border-primary/40 hover:bg-neutral-50"
                  } ${hasUserVoted || isClosed ? "opacity-75 cursor-not-allowed" : ""}`}
                >
                  <div className="space-y-2">
                    <div className="flex items-center gap-3">
                      <h4 className="text-2xl font-black tracking-tight">{candidate.name}</h4>
                      {selectedCandidate?.id === candidate.id && <CheckCircle2 className="h-5 w-5 text-primary animate-in zoom-in" />}
                    </div>
                    <p className="text-sm font-bold italic text-primary/80">"{candidate.vision}"</p>
                    <p className="text-sm text-muted-foreground max-w-md">{candidate.mission}</p>
                  </div>
                  <div className="flex flex-col items-end gap-1">
                    <div className="text-3xl font-black text-neutral-900 group-hover:text-primary transition-colors">
                      {candidate._count?.votes || 0}
                    </div>
                    <div className="text-[10px] uppercase font-black tracking-tighter text-muted-foreground">Votes Registered</div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Sidebar / Voting Panel */}
        <div className="lg:col-span-4">
          <div className="sticky top-24 space-y-6">
            <div className="rounded-3xl border bg-neutral-900 p-8 shadow-2xl shadow-neutral-200 text-white border-t-8 border-t-primary">
              <h3 className="mb-6 text-2xl font-black italic tracking-tighter">Cast Your Vote</h3>
              
              {!selectedCandidate ? (
                <div className="flex flex-col items-center justify-center py-10 text-center text-neutral-400">
                  <VoteIcon className="mb-4 h-16 w-16 opacity-10" />
                  <p className="text-sm font-medium">Please select a candidate to unlock your ballot.</p>
                </div>
              ) : (
                <div className="space-y-8 animate-in slide-in-from-right-4 duration-500">
                  <div className="rounded-2xl bg-white/5 border border-white/10 p-5 space-y-2">
                    <span className="text-[10px] uppercase font-black text-primary tracking-widest">Candidate Selected</span>
                    <p className="text-2xl font-black leading-none">{selectedCandidate.name}</p>
                  </div>

                  <div className="text-xs text-neutral-400 font-medium leading-relaxed bg-neutral-800/50 p-4 rounded-xl">
                    <Info className="h-4 w-4 mb-2 text-primary" />
                    By voting, your wallet/account ID will be permanently recorded on the immutable blockchain ledger.
                  </div>

                  <button
                    onClick={handleVote}
                    disabled={isSubmitting || hasUserVoted || isClosed}
                    className="group relative flex w-full items-center justify-center gap-3 rounded-2xl bg-primary py-5 font-black text-white transition-all hover:bg-primary/90 disabled:opacity-30 active:scale-[0.98] shadow-lg shadow-primary/20"
                  >
                    {isSubmitting ? (
                      <Loader2 className="h-6 w-6 animate-spin" />
                    ) : hasUserVoted ? (
                      <>
                        <CheckCircle2 className="h-6 w-6" />
                        Already Voted
                      </>
                    ) : isClosed ? (
                      "Election Ended"
                    ) : (
                      <>
                        <VoteIcon className="h-6 w-6" />
                        Confirm & Secure Vote
                      </>
                    )}
                  </button>
                  
                  {hasUserVoted && (
                    <div className="flex items-center gap-3 rounded-2xl bg-green-500/10 border border-green-500/20 p-4 text-sm font-bold text-green-400">
                      <ShieldCheck className="h-5 w-5" />
                      Your vote is secured on ledger.
                    </div>
                  )}
                </div>
              )}
            </div>

            {/* Transparency Log Section */}
            <div className="rounded-3xl border bg-white p-6 shadow-sm">
              <h4 className="flex items-center gap-2 text-sm font-black uppercase tracking-widest mb-6">
                <History className="h-4 w-4 text-primary" />
                Transparency Log
              </h4>
              <div className="space-y-4">
                <div className="text-[10px] font-bold text-muted-foreground flex items-center justify-between opacity-50 pb-2 border-b uppercase tracking-tighter">
                  <span>VOTER</span>
                  <span>BLOCKCHAIN HASH</span>
                </div>
                {election.votes && election.votes.length > 0 ? (
                  election.votes.map((vote, i) => (
                    <div key={i} className="flex flex-col gap-1 group py-2 border-b border-neutral-50 last:border-0 hover:bg-neutral-50/50 rounded-lg px-1 transition-colors">
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-2">
                          <div className="h-5 w-5 rounded-full bg-primary/10 flex items-center justify-center text-[10px] font-black text-primary">
                            {i + 1}
                          </div>
                          <span className="text-[11px] font-black tracking-tight truncate w-24">
                            {vote.voter.name || "Anonymous"}
                          </span>
                        </div>
                        <a 
                          href={RPC_URL.includes("127.0.0.1") ? "#" : `https://etherscan.io/tx/${vote.txHash}`} 
                          target="_blank" 
                          rel="noreferrer"
                          className="text-[10px] font-medium text-primary hover:underline flex items-center gap-1"
                        >
                          {vote.txHash.slice(0, 10)}...
                          <LinkIcon className="h-2 w-2" />
                        </a>
                      </div>
                      <div className="pl-7 flex justify-between items-center text-[9px] font-bold text-muted-foreground italic">
                        <span>Voted for: {vote.candidate?.name || "Unkown"}</span>
                        <span>{new Date(vote.createdAt).toLocaleTimeString()}</span>
                      </div>
                    </div>
                  ))
                ) : (
                  <div className="flex flex-col items-center py-6 text-center">
                    <p className="text-xs font-bold text-muted-foreground opacity-30 italic">No blockchain transactions yet.</p>
                  </div>
                )}
              </div>
              <div className="mt-6 pt-6 border-t flex items-center gap-2 text-[10px] font-bold text-muted-foreground">
                <LinkIcon className="h-3 w-3" />
                <span className="truncate">Contract: {CONTRACT_ADDRESS.slice(0, 10)}...{CONTRACT_ADDRESS.slice(-4)}</span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ElectionDetail;
