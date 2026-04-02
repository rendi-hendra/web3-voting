import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import { toast } from "sonner";
import axios from "axios";
import { Plus, Trash2, Calendar, FileText, UserPlus, Save, ArrowLeft } from "lucide-react";

const CreateElection = () => {
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);
  const [formData, setFormData] = useState({
    title: "",
    description: "",
    startDate: "",
    endDate: "",
    candidates: [
      { name: "", vision: "", mission: "" },
      { name: "", vision: "", mission: "" }
    ],
  });

  const handleAddCandidate = () => {
    setFormData({
      ...formData,
      candidates: [...formData.candidates, { name: "", vision: "", mission: "" }]
    });
  };

  const handleRemoveCandidate = (index) => {
    if (formData.candidates.length <= 2) {
      toast.error("At least 2 candidates are required");
      return;
    }
    const newCandidates = formData.candidates.filter((_, i) => i !== index);
    setFormData({ ...formData, candidates: newCandidates });
  };

  const handleCandidateChange = (index, field, value) => {
    const newCandidates = [...formData.candidates];
    newCandidates[index][field] = value;
    setFormData({ ...formData, candidates: newCandidates });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);

    try {
      // Fix dates to ISO format
      const payload = {
        ...formData,
        startDate: new Date(formData.startDate).toISOString(),
        endDate: new Date(formData.endDate).toISOString(),
      };

      const response = await axios.post("http://localhost:4000/api/elections", payload);
      
      if (response.data.success) {
        toast.success("Election created successfully!");
        navigate("/");
      }
    } catch (error) {
      const errorMsg = error.response?.data?.message || "Failed to create election";
      toast.error(errorMsg);
      console.error(error);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="max-w-4xl mx-auto space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-500">
      <button 
        onClick={() => navigate(-1)}
        className="flex items-center gap-2 text-sm font-medium text-muted-foreground hover:text-primary transition-colors"
      >
        <ArrowLeft className="h-4 w-4" />
        Back to Dashboard
      </button>

      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-extrabold tracking-tight">Create New Election</h1>
          <p className="text-muted-foreground mt-1 text-lg">Define election details and candidates.</p>
        </div>
      </div>

      <form onSubmit={handleSubmit} className="space-y-8">
        {/* Basic Info Card */}
        <div className="rounded-2xl border bg-card p-8 shadow-sm">
          <h3 className="text-xl font-bold mb-6 flex items-center gap-2">
            <FileText className="h-5 w-5 text-primary" />
            General Information
          </h3>
          <div className="grid gap-6">
            <div className="grid gap-2">
              <label className="text-sm font-bold">Election Title</label>
              <input
                required
                value={formData.title}
                onChange={(e) => setFormData({...formData, title: e.target.value})}
                placeholder="e.g. Presidential Election 2026"
                className="flex h-12 w-full rounded-xl border border-input bg-background px-4 py-2 text-sm ring-offset-background placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2"
              />
            </div>
            <div className="grid gap-2">
              <label className="text-sm font-bold">Description</label>
              <textarea
                value={formData.description}
                onChange={(e) => setFormData({...formData, description: e.target.value})}
                placeholder="Describe the purpose and rules of this election..."
                rows={3}
                className="flex w-full rounded-xl border border-input bg-background px-4 py-3 text-sm ring-offset-background placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2"
              />
            </div>
            <div className="grid sm:grid-cols-2 gap-4">
              <div className="grid gap-2">
                <label className="text-sm font-bold flex items-center gap-2">
                  <Calendar className="h-4 w-4" /> Start Date
                </label>
                <input
                  required
                  type="datetime-local"
                  value={formData.startDate}
                  onChange={(e) => setFormData({...formData, startDate: e.target.value})}
                  className="flex h-11 w-full rounded-xl border border-input bg-background px-4 py-2 text-sm focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
                />
              </div>
              <div className="grid gap-2">
                <label className="text-sm font-bold flex items-center gap-2">
                  <Calendar className="h-4 w-4" /> End Date
                </label>
                <input
                  required
                  type="datetime-local"
                  value={formData.endDate}
                  onChange={(e) => setFormData({...formData, endDate: e.target.value})}
                  className="flex h-11 w-full rounded-xl border border-input bg-background px-4 py-2 text-sm focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
                />
              </div>
            </div>
          </div>
        </div>

        {/* Candidates Card */}
        <div className="rounded-2xl border bg-card p-8 shadow-sm">
          <div className="flex items-center justify-between mb-8">
            <h3 className="text-xl font-bold flex items-center gap-2">
              <UserPlus className="h-5 w-5 text-primary" />
              Manage Candidates
            </h3>
            <button
              type="button"
              onClick={handleAddCandidate}
              className="flex items-center gap-2 rounded-lg bg-primary/10 px-4 py-2 text-sm font-bold text-primary hover:bg-primary/20 transition-all shadow-sm"
            >
              <Plus className="h-4 w-4" /> Add Candidate
            </button>
          </div>

          <div className="grid gap-6">
            {formData.candidates.map((candidate, index) => (
              <div key={index} className="relative group rounded-xl border-dashed border-2 p-6 transition-all hover:border-primary/40 hover:bg-neutral-50/50">
                <button
                  type="button"
                  onClick={() => handleRemoveCandidate(index)}
                  className="absolute -top-3 -right-3 rounded-full bg-destructive/10 p-2 text-destructive opacity-0 group-hover:opacity-100 transition-all hover:bg-destructive hover:text-white shadow-sm"
                >
                  <Trash2 className="h-4 w-4" />
                </button>
                
                <span className="absolute -top-3 -left-3 flex h-7 w-7 items-center justify-center rounded-full bg-primary text-white text-xs font-black shadow-md border-2 border-white">
                  {index + 1}
                </span>

                <div className="grid gap-4">
                  <div className="grid gap-1.5">
                    <label className="text-xs font-black uppercase tracking-widest opacity-60">Full Name</label>
                    <input
                      required
                      placeholder="Candidate Display Name"
                      value={candidate.name}
                      onChange={(e) => handleCandidateChange(index, "name", e.target.value)}
                      className="flex h-10 w-full rounded-lg border border-input bg-background px-4 text-sm ring-offset-background focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
                    />
                  </div>
                  <div className="grid sm:grid-cols-2 gap-4">
                    <div className="grid gap-1.5">
                      <label className="text-xs font-black uppercase tracking-widest opacity-60">Vision</label>
                      <input
                        placeholder="Core Value / Vision"
                        value={candidate.vision}
                        onChange={(e) => handleCandidateChange(index, "vision", e.target.value)}
                        className="flex h-10 w-full rounded-lg border border-input bg-background px-4 text-sm ring-offset-background focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
                      />
                    </div>
                    <div className="grid gap-1.5">
                      <label className="text-xs font-black uppercase tracking-widest opacity-60">Mission Statement</label>
                      <input
                        placeholder="Tagline / Mission"
                        value={candidate.mission}
                        onChange={(e) => handleCandidateChange(index, "mission", e.target.value)}
                        className="flex h-10 w-full rounded-lg border border-input bg-background px-4 text-sm ring-offset-background focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
                      />
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>

        <div className="flex items-center justify-end pt-4">
          <button
            type="submit"
            disabled={loading}
            className="flex items-center gap-2 rounded-xl bg-primary px-10 py-5 text-lg font-black text-white transition-all hover:bg-primary/90 shadow-xl shadow-primary/20 active:scale-[0.98] disabled:opacity-50"
          >
            {loading ? "Creating..." : (
              <>
                <Save className="h-5 w-5" /> Launch Election
              </>
            )}
          </button>
        </div>
      </form>
    </div>
  );
};

export default CreateElection;
