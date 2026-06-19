"use client";

import { useState, useEffect } from "react";
import { db, storage } from "@/lib/firebase";
import { doc, getDoc, setDoc, collection, getDocs, deleteDoc } from "firebase/firestore";
import { ref, uploadBytes, getDownloadURL } from "firebase/storage";
import { FaEdit, FaTrash } from "react-icons/fa";

export default function AdminDashboard() {
  const [passcode, setPasscode] = useState("");
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [loading, setLoading] = useState(false);
  const [savingLogo, setSavingLogo] = useState(false);
  const [message, setMessage] = useState({ type: "", text: "" });
  const [profilesList, setProfilesList] = useState<any[]>([]);

  // Global Logo State
  const [globalLogoFile, setGlobalLogoFile] = useState<File | null>(null);
  const [globalLogoUrl, setGlobalLogoUrl] = useState<string | null>(null);

  const initialFormState = {
    profileId: "",
    name: "",
    role: "",
    phone: "",
    email: "",
    whatsapp: "",
    website: "https://avique.co/",
    facebook: "https://www.facebook.com/avique.co",
    linkedin: "https://www.linkedin.com/company/avique",
    instagram: "https://www.instagram.com/avique.co",
  };

  const [formData, setFormData] = useState(initialFormState);

  const fetchGlobalSettings = async () => {
    try {
      if (db.app.options.projectId !== "demo-project") {
        const docSnap = await getDoc(doc(db, "settings", "global"));
        if (docSnap.exists() && docSnap.data().logoUrl) {
          setGlobalLogoUrl(docSnap.data().logoUrl);
        }
      }
    } catch (e: any) {
      if (e.name !== 'AbortError' && e.code !== 'cancelled') {
        console.error("Error fetching global settings:", e);
      }
    }
  };

  const fetchProfiles = async () => {
    try {
      if (db.app.options.projectId !== "demo-project") {
        const querySnapshot = await getDocs(collection(db, "profiles"));
        const fetchedProfiles: any[] = [];
        querySnapshot.forEach((document) => {
          fetchedProfiles.push({ id: document.id, ...document.data() });
        });
        setProfilesList(fetchedProfiles);
      }
    } catch (error: any) {
      if (error.name !== 'AbortError' && error.code !== 'cancelled') {
        console.error("Error fetching profiles: ", error);
      }
    }
  };

  useEffect(() => {
    let isMounted = true;

    if (isAuthenticated) {
      // Defer the Firebase fetches to the next event loop.
      // This prevents React 19/Next 15 from auto-aborting the internal fetch 
      // requests if the component re-renders or strict-mode unmounts.
      setTimeout(() => {
        if (!isMounted) return;
        fetchProfiles();
        fetchGlobalSettings();
      }, 100);
    }

    return () => {
      isMounted = false;
    };
  }, [isAuthenticated]);

  const handleLogin = (e: React.FormEvent) => {
    e.preventDefault();
    if (passcode === "MTJ2026") {
      setIsAuthenticated(true);
      setMessage({ type: "", text: "" });
    } else {
      setMessage({ type: "error", text: "Incorrect passcode." });
    }
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleEdit = (profile: any) => {
    setFormData({
      profileId: profile.id,
      name: profile.name || "",
      role: profile.role || "",
      phone: profile.phone || "",
      email: profile.email || "",
      whatsapp: profile.whatsapp || "",
      website: profile.website || "",
      facebook: profile.facebook || "",
      linkedin: profile.linkedin || "",
      instagram: profile.instagram || "",
    });
    window.scrollTo({ top: 0, behavior: 'smooth' });
    setMessage({ type: "", text: "" });
  };

  const handleDelete = async (id: string) => {
    const confirmed = window.confirm(`Are you sure you want to permanently delete profile: ${id}?`);
    if (confirmed) {
      try {
        await deleteDoc(doc(db, "profiles", id));
        setMessage({ type: "success", text: `Profile "${id}" was deleted successfully.` });
        fetchProfiles();
      } catch (error: any) {
        setMessage({ type: "error", text: `Error deleting profile: ${error.message}` });
      }
    }
  };

  const handleGlobalLogoSave = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!globalLogoFile) return;
    setSavingLogo(true);
    setMessage({ type: "", text: "" });

    try {
      if (storage.app.options.projectId === "demo-project") {
        throw new Error("Cannot upload in demo mode.");
      }
      
      const storageRef = ref(storage, `logos/global-logo-${Date.now()}`);
      await uploadBytes(storageRef, globalLogoFile);
      const url = await getDownloadURL(storageRef);
      
      await setDoc(doc(db, "settings", "global"), { logoUrl: url }, { merge: true });
      
      setGlobalLogoUrl(url);
      setGlobalLogoFile(null);
      setMessage({ type: "success", text: "Global Brand Logo updated successfully!" });
    } catch (error: any) {
      console.error(error);
      setMessage({ type: "error", text: error.message || "Error saving logo." });
    } finally {
      setSavingLogo(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setMessage({ type: "", text: "" });

    try {
      if (!formData.profileId || !formData.name) {
        throw new Error("Profile ID and Name are required.");
      }

      // Save Data to Firestore
      const profileData = {
        name: formData.name,
        role: formData.role,
        phone: formData.phone,
        email: formData.email,
        whatsapp: formData.whatsapp,
        website: formData.website,
        facebook: formData.facebook,
        linkedin: formData.linkedin,
        instagram: formData.instagram,
      };

      await setDoc(doc(db, "profiles", formData.profileId.toLowerCase()), profileData, { merge: true });

      setMessage({ type: "success", text: `Profile for ${formData.name} saved successfully at /${formData.profileId.toLowerCase()} !` });
      
      // Reset form but keep the authentication
      setFormData(initialFormState);
      
      // Refresh the list below
      fetchProfiles();
    } catch (error: any) {
      console.error(error);
      setMessage({ type: "error", text: error.message || "An error occurred while saving." });
    } finally {
      setLoading(false);
    }
  };

  return (
    <main className="flex min-h-screen items-center justify-center p-4 bg-brand-dark text-white relative overflow-hidden flex-col pt-12 pb-24">
      <div className="fixed top-[-10%] left-[-10%] w-[50%] h-[50%] rounded-full bg-brand-gold blur-[150px] opacity-10 pointer-events-none -z-10"></div>
      <div className="fixed bottom-[-10%] right-[-10%] w-[50%] h-[50%] rounded-full bg-brand-gold blur-[150px] opacity-[0.05] pointer-events-none -z-10"></div>

      <div className="w-full max-w-2xl bg-white/5 backdrop-blur-3xl rounded-3xl p-8 shadow-2xl border border-white/10 my-4 z-10">
        <h1 className="text-3xl font-bold text-brand-gold mb-6 text-center">Admin Dashboard</h1>

        {message.text && (
          <div className={`p-4 mb-6 rounded-lg text-sm font-semibold ${message.type === 'error' ? 'bg-red-500/20 text-red-200 border border-red-500/50' : 'bg-green-500/20 text-green-200 border border-green-500/50'}`}>
            {message.text}
          </div>
        )}

        {!isAuthenticated ? (
          <div className="space-y-4 max-w-sm mx-auto">
            <div>
              <label className="block text-sm font-medium text-text-secondary mb-1">Admin Passcode</label>
              <input 
                type="password" 
                value={passcode}
                onChange={(e) => setPasscode(e.target.value)}
                onKeyDown={(e) => {
                  if (e.key === 'Enter') {
                    e.preventDefault();
                    handleLogin(e as any);
                  }
                }}
                className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-3 text-white focus:outline-none focus:border-brand-gold transition-colors"
                placeholder="Enter passcode..."
              />
            </div>
            <button 
              type="button"
              onClick={handleLogin}
              className="w-full bg-brand-gold hover:bg-brand-gold/80 text-brand-dark font-bold py-3 rounded-xl transition-colors"
            >
              Enter Dashboard
            </button>
          </div>
        ) : (
          <div className="space-y-8">
            
            {/* Global Settings Section */}
            <div className="bg-brand-gold/10 p-6 rounded-2xl border border-brand-gold/20">
              <h2 className="text-xl font-semibold text-brand-gold mb-4">Universal Brand Logo</h2>
              <form onSubmit={handleGlobalLogoSave} className="flex flex-col sm:flex-row gap-4 items-start sm:items-center">
                <div className="flex-1 w-full">
                  <input 
                    type="file" 
                    accept="image/*"
                    onChange={(e) => setGlobalLogoFile(e.target.files?.[0] || null)}
                    className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-2 text-sm text-gray-300 file:mr-4 file:py-2 file:px-4 file:rounded-full file:border-0 file:text-sm file:font-semibold file:bg-brand-gold file:text-brand-dark hover:file:bg-brand-gold/80 transition-colors" 
                  />
                  {globalLogoUrl && !globalLogoFile && (
                    <p className="text-xs text-green-400 mt-2">Universal logo is active across all profiles.</p>
                  )}
                </div>
                <button 
                  type="submit"
                  disabled={!globalLogoFile || savingLogo}
                  className="w-full sm:w-auto bg-brand-gold hover:bg-brand-gold/80 disabled:opacity-50 text-brand-dark font-bold py-2 px-6 rounded-xl transition-colors whitespace-nowrap"
                >
                  {savingLogo ? "Uploading..." : "Save Global Logo"}
                </button>
              </form>
            </div>

            <hr className="border-white/10" />

            {/* Employee Profile Form */}
            <form onSubmit={handleSubmit} className="space-y-6">
              
              <div className="bg-white/5 p-6 rounded-2xl border border-white/5">
                <h2 className="text-xl font-semibold text-white mb-4">Employee Details</h2>
                <div className="grid grid-cols-2 gap-4">
                  <div className="col-span-2">
                    <label className="block text-sm font-medium text-gray-400 mb-1">Profile ID (URL Tag) *</label>
                    <input required type="text" name="profileId" value={formData.profileId} onChange={handleInputChange} className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-3 focus:outline-none focus:border-brand-gold transition-colors" placeholder="e.g., hl or alex" />
                  </div>

                  <div className="col-span-2 sm:col-span-1">
                    <label className="block text-sm font-medium text-gray-400 mb-1">Full Name *</label>
                    <input required type="text" name="name" value={formData.name} onChange={handleInputChange} className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-3 focus:outline-none focus:border-brand-gold transition-colors" />
                  </div>
                  
                  <div className="col-span-2 sm:col-span-1">
                    <label className="block text-sm font-medium text-gray-400 mb-1">Role / Job Title</label>
                    <input type="text" name="role" value={formData.role} onChange={handleInputChange} className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-3 focus:outline-none focus:border-brand-gold transition-colors" />
                  </div>

                  <div className="col-span-2 sm:col-span-1">
                    <label className="block text-sm font-medium text-gray-400 mb-1">Phone Number</label>
                    <input type="text" name="phone" value={formData.phone} onChange={handleInputChange} className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-3 focus:outline-none focus:border-brand-gold transition-colors" placeholder="+1234567890" />
                  </div>

                  <div className="col-span-2 sm:col-span-1">
                    <label className="block text-sm font-medium text-gray-400 mb-1">WhatsApp Number</label>
                    <input type="text" name="whatsapp" value={formData.whatsapp} onChange={handleInputChange} className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-3 focus:outline-none focus:border-brand-gold transition-colors" placeholder="+1234567890" />
                  </div>

                  <div className="col-span-2">
                    <label className="block text-sm font-medium text-gray-400 mb-1">Email Address</label>
                    <input type="email" name="email" value={formData.email} onChange={handleInputChange} className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-3 focus:outline-none focus:border-brand-gold transition-colors" />
                  </div>
                </div>
              </div>

              <div className="bg-white/5 p-6 rounded-2xl border border-white/5">
                <h2 className="text-xl font-semibold text-white mb-4">Brand Links</h2>
                <div className="grid grid-cols-2 gap-4">
                  <div className="col-span-2">
                    <label className="block text-sm font-medium text-gray-400 mb-1">Website URL</label>
                    <input type="url" name="website" value={formData.website} onChange={handleInputChange} className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-3 focus:outline-none focus:border-brand-gold transition-colors" placeholder="https://mtjworld.com" />
                  </div>
                  <div className="col-span-2">
                    <label className="block text-sm font-medium text-gray-400 mb-1">Facebook URL</label>
                    <input type="url" name="facebook" value={formData.facebook} onChange={handleInputChange} className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-3 focus:outline-none focus:border-brand-gold transition-colors" placeholder="https://facebook.com/..." />
                  </div>
                  <div className="col-span-2">
                    <label className="block text-sm font-medium text-gray-400 mb-1">Instagram URL</label>
                    <input type="url" name="instagram" value={formData.instagram} onChange={handleInputChange} className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-3 focus:outline-none focus:border-brand-gold transition-colors" placeholder="https://instagram.com/..." />
                  </div>
                  <div className="col-span-2">
                    <label className="block text-sm font-medium text-gray-400 mb-1">LinkedIn URL</label>
                    <input type="url" name="linkedin" value={formData.linkedin} onChange={handleInputChange} className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-3 focus:outline-none focus:border-brand-gold transition-colors" placeholder="https://linkedin.com/company/..." />
                  </div>
                </div>
              </div>

              <button 
                type="submit"
                disabled={loading}
                className="w-full bg-brand-gold hover:bg-brand-gold/80 disabled:opacity-50 text-brand-dark font-bold py-4 rounded-xl mt-6 transition-colors shadow-lg shadow-brand-gold/20"
              >
                {loading ? "Saving..." : "Save Profile"}
              </button>
            </form>
          </div>
        )}
      </div>

      {isAuthenticated && (
        <div className="w-full max-w-2xl bg-white/5 backdrop-blur-3xl rounded-3xl p-8 shadow-2xl border border-white/10 my-4 z-10">
          <h2 className="text-2xl font-bold text-white mb-6">Manage Profiles</h2>
          
          {profilesList.length === 0 ? (
            <p className="text-gray-400">No profiles found yet. Create one above!</p>
          ) : (
            <div className="space-y-4">
              {profilesList.map((profile) => (
                <div key={profile.id} className="bg-white/5 rounded-xl p-4 flex flex-col sm:flex-row sm:items-center justify-between gap-4 border border-white/5 hover:border-brand-blue/50 transition-colors">
                  <div>
                    <h3 className="font-bold text-lg text-white">{profile.name}</h3>
                    <p className="text-sm text-brand-gold">{profile.role}</p>
                    <p className="text-xs text-gray-400 mt-1">ID: /{profile.id}</p>
                  </div>
                  <div className="flex items-center gap-3">
                    <a href={`/${profile.id}`} target="_blank" rel="noreferrer" className="text-sm px-4 py-2 rounded-lg bg-white/10 hover:bg-white/20 transition-colors">
                      View
                    </a>
                    <button 
                      onClick={() => handleEdit(profile)}
                      className="p-2 rounded-lg bg-blue-500/20 text-blue-400 hover:bg-blue-500/40 transition-colors"
                      title="Edit"
                    >
                      <FaEdit size={18} />
                    </button>
                    <button 
                      onClick={() => handleDelete(profile.id)}
                      className="p-2 rounded-lg bg-red-500/20 text-red-400 hover:bg-red-500/40 transition-colors"
                      title="Delete"
                    >
                      <FaTrash size={18} />
                    </button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      )}
    </main>
  );
}
