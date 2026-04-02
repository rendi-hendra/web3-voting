import React, { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import axios from "axios";
import { io } from "socket.io-client";
import { toast } from "sonner";
import { Calendar, Users, ChevronRight, Activity, Clock, PlusCircle } from "lucide-react";

const Home = () => {
  const [elections, setElections] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchElections = async () => {
      try {
        const response = await axios.get("http://localhost:4000/api/elections");
        setElections(response.data.data);
      } catch (error) {
        toast.error("Failed to fetch elections");
      } finally {
        setLoading(false);
      }
    };

    fetchElections();

    // Socket.io integration for new elections
    const socket = io("http://localhost:4000");
    socket.on("electionCreated", (newElection) => {
      setElections((prev) => [newElection, ...prev]);
      toast.success(`New Election Launched: ${newElection.title}`, {
        icon: <PlusCircle className="h-4 w-4 text-green-500" />,
      });
    });

    return () => socket.disconnect();
  }, []);

  if (loading) {
    return (
      <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
        {[1, 2, 3].map((i) => (
          <div key={i} className="h-64 rounded-xl border bg-card animate-pulse shadow-sm" />
        ))}
      </div>
    );
  }

  return (
    <div className="space-y-8 animate-in fade-in duration-500">
      <header className="flex flex-col md:flex-row md:items-end justify-between gap-4">
        <div className="space-y-2">
          <h1 className="text-4xl font-black tracking-tight sm:text-5xl bg-gradient-to-r from-primary to-blue-600 bg-clip-text text-transparent italic">
            Live Elections
          </h1>
          <p className="text-muted-foreground text-lg font-medium">Verify. Vote. Secure the future.</p>
        </div>
        <Link 
          to="/elections/create" 
          className="inline-flex items-center gap-2 rounded-xl bg-neutral-900 px-6 py-3 text-sm font-bold text-white transition-all hover:bg-neutral-800 shadow-lg shadow-neutral-200"
        >
          <PlusCircle className="h-4 w-4" />
          Create Election
        </Link>
      </header>

      {elections.length === 0 ? (
        <div className="flex flex-col items-center justify-center py-20 border-2 border-dashed rounded-3xl bg-neutral-50">
          <Activity className="h-12 w-12 text-muted-foreground opacity-20 mb-4" />
          <p className="text-xl font-bold text-muted-foreground">No elections found yet.</p>
        </div>
      ) : (
        <div className="grid gap-8 sm:grid-cols-2 lg:grid-cols-3">
          {elections.map((election) => {
            const isClosed = new Date() > new Date(election.endDate);
            return (
              <Link
                key={election.id}
                to={`/election/${election.id}`}
                className="group relative flex flex-col rounded-3xl border bg-card p-8 shadow-sm transition-all hover:shadow-xl hover:border-primary/40 hover:-translate-y-1"
              >
                <div className="mb-6 flex items-center justify-between">
                  <div className={`flex items-center gap-1.5 rounded-full px-3 py-1 text-[10px] font-black uppercase tracking-widest ${!isClosed && election.isActive ? 'bg-green-100 text-green-700' : 'bg-red-100 text-red-600'}`}>
                    {!isClosed && election.isActive ? <Activity className="h-3 w-3 animate-pulse" /> : <Clock className="h-3 w-3" />}
                    {!isClosed && election.isActive ? 'Live' : 'Closed'}
                  </div>
                  <div className="rounded-full bg-neutral-100 p-2 text-muted-foreground group-hover:bg-primary/10 group-hover:text-primary transition-all">
                    <ChevronRight className="h-5 w-5" />
                  </div>
                </div>

                <div className="flex-1 space-y-3">
                  <h3 className="text-2xl font-black leading-tight tracking-tight group-hover:text-primary transition-colors">
                    {election.title}
                  </h3>
                  <p className="line-clamp-2 text-sm text-muted-foreground leading-relaxed">
                    {election.description}
                  </p>
                </div>

                <div className="mt-8 pt-6 border-t flex items-center justify-between text-[11px] font-bold text-muted-foreground">
                  <div className="flex items-center gap-2">
                    <Calendar className="h-4 w-4 text-primary" />
                    <span>{new Date(election.startDate).toLocaleDateString()}</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <Users className="h-4 w-4 text-primary" />
                    <span>{election.candidates?.length || 0} Candidates</span>
                  </div>
                </div>
              </Link>
            );
          })}
        </div>
      )}
    </div>
  );
};

export default Home;
