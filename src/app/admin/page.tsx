"use client";

import { useState, useEffect } from "react";
import { db, storage, auth } from "@/lib/firebase";
import { doc, getDoc, setDoc, collection, getDocs, deleteDoc } from "firebase/firestore";
import { ref, uploadBytes, getDownloadURL, listAll, deleteObject } from "firebase/storage";
import { signInAnonymously } from "firebase/auth";
import { FaEdit, FaTrash, FaLinkedin, FaInstagram, FaWhatsapp, FaFacebook, FaGlobe } from "react-icons/fa";
import { Phone, Mail, UserPlus, Gem } from "lucide-react";
import Image from "next/image";

export default function AdminDashboard() {
  const [passcode, setPasscode] = useState("");
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [loading, setLoading] = useState(false);
  const [savingLogo, setSavingLogo] = useState(false);
  const [message, setMessage] = useState({ type: "", text: "" });
  const [profilesList, setProfilesList] = useState<any[]>([]);

  // Gallery State
  const [globalLogoFile, setGlobalLogoFile] = useState<File | null>(null);
  const [logoCount, setLogoCount] = useState<number>(0);
  const [uploadedLogos, setUploadedLogos] = useState<{ url: string, path: string }[]>([]);

  const [globalFaviconFile, setGlobalFaviconFile] = useState<File | null>(null);
  const [faviconCount, setFaviconCount] = useState<number>(0);
  const [uploadedFavicons, setUploadedFavicons] = useState<{ url: string, path: string }[]>([]);

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
    logoUrl: "",
    faviconUrl: "",
  };

  const [formData, setFormData] = useState(initialFormState);
  const [profileLogoFile, setProfileLogoFile] = useState<File | null>(null);
  const [profileFaviconFile, setProfileFaviconFile] = useState<File | null>(null);



  const fetchLogoCount = async () => {
    try {
      if (storage.app.options.projectId !== "demo-project") {
        const listRef = ref(storage, 'logos');
        const res = await listAll(listRef);
        setLogoCount(res.items.length);
        
        const urls = await Promise.all(
          res.items.map(async (item) => {
            const url = await getDownloadURL(item);
            return { url, path: item.fullPath };
          })
        );
        setUploadedLogos(urls);

        const favRef = ref(storage, 'favicons');
        const favRes = await listAll(favRef);
        setFaviconCount(favRes.items.length);
        const favUrls = await Promise.all(
          favRes.items.map(async (item) => {
            const url = await getDownloadURL(item);
            return { url, path: item.fullPath };
          })
        );
        setUploadedFavicons(favUrls);
      }
    } catch (e: any) {
      if (e.name !== 'AbortError' && e.code !== 'cancelled') {
        console.error("Error fetching logos:", e);
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
        fetchLogoCount();
      }, 100);
    }

    return () => {
      isMounted = false;
    };
  }, [isAuthenticated]);

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    if (passcode === "MTJ2026") {
      try {
        await signInAnonymously(auth);
        setIsAuthenticated(true);
        setMessage({ type: "", text: "" });
      } catch (error: any) {
        setMessage({ type: "error", text: `Authentication failed: ${error.message}` });
      }
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
      logoUrl: profile.logoUrl || "",
      faviconUrl: profile.faviconUrl || "",
    });
    setProfileLogoFile(null);
    setProfileFaviconFile(null);
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

  const handleUploadLogoToGallery = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!globalLogoFile) return;
    setSavingLogo(true);
    setMessage({ type: "", text: "" });

    try {
      if (storage.app.options.projectId === "demo-project") {
        throw new Error("Cannot upload in demo mode.");
      }
      
      const storageRef = ref(storage, `logos/gallery-logo-${Date.now()}`);
      await uploadBytes(storageRef, globalLogoFile);
      
      setGlobalLogoFile(null);
      setMessage({ type: "success", text: "Logo added to gallery successfully!" });
      fetchLogoCount();
    } catch (error: any) {
      console.error(error);
      setMessage({ type: "error", text: error.message || "Error saving logo." });
    } finally {
      setSavingLogo(false);
    }
  };

  const handleUploadFaviconToGallery = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!globalFaviconFile) return;
    setSavingLogo(true);
    setMessage({ type: "", text: "" });

    try {
      if (storage.app.options.projectId === "demo-project") {
        throw new Error("Cannot upload in demo mode.");
      }
      
      const storageRef = ref(storage, `favicons/gallery-favicon-${Date.now()}`);
      await uploadBytes(storageRef, globalFaviconFile);
      
      setGlobalFaviconFile(null);
      setMessage({ type: "success", text: "Favicon added to gallery successfully!" });
      fetchLogoCount();
    } catch (error: any) {
      console.error(error);
      setMessage({ type: "error", text: error.message || "Error saving favicon." });
    } finally {
      setSavingLogo(false);
    }
  };

  const handleDeleteImage = async (path: string, type: 'logo' | 'favicon', e: React.MouseEvent) => {
    e.stopPropagation(); // prevent selecting the image
    const confirmed = window.confirm("Are you sure you want to delete this image permanently?");
    if (!confirmed) return;
    try {
      if (storage.app.options.projectId === "demo-project") {
        throw new Error("Cannot delete in demo mode.");
      }
      await deleteObject(ref(storage, path));
      setMessage({ type: "success", text: "Image deleted successfully." });
      fetchLogoCount();
    } catch (error: any) {
      console.error("Error deleting image:", error);
      setMessage({ type: "error", text: error.message || "Error deleting image." });
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

      let finalLogoUrl = formData.logoUrl;
      if (profileLogoFile) {
        if (storage.app.options.projectId === "demo-project") {
          throw new Error("Cannot upload in demo mode.");
        }
        const storageRef = ref(storage, `logos/${formData.profileId.toLowerCase()}-${Date.now()}`);
        await uploadBytes(storageRef, profileLogoFile);
        finalLogoUrl = await getDownloadURL(storageRef);
      }

      let finalFaviconUrl = formData.faviconUrl;
      if (profileFaviconFile) {
        if (storage.app.options.projectId === "demo-project") {
          throw new Error("Cannot upload in demo mode.");
        }
        const storageRef = ref(storage, `favicons/${formData.profileId.toLowerCase()}-${Date.now()}`);
        await uploadBytes(storageRef, profileFaviconFile);
        finalFaviconUrl = await getDownloadURL(storageRef);
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
        logoUrl: finalLogoUrl,
        faviconUrl: finalFaviconUrl,
      };

      await setDoc(doc(db, "profiles", formData.profileId.toLowerCase()), profileData, { merge: true });

      setMessage({ type: "success", text: `Profile for ${formData.name} saved successfully at /${formData.profileId.toLowerCase()} !` });
      
      // Reset form but keep the authentication
      setFormData(initialFormState);
      setProfileLogoFile(null);
      setProfileFaviconFile(null);
      
      // Refresh the list below
      fetchProfiles();
      fetchLogoCount();
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

      {!isAuthenticated ? (
        <div className="w-full max-w-2xl bg-white/5 backdrop-blur-3xl rounded-3xl p-8 shadow-2xl border border-white/10 my-4 z-10">
          <h1 className="text-3xl font-bold text-brand-gold mb-6 text-center">Admin Dashboard</h1>

          {message.text && (
            <div className={`p-4 mb-6 rounded-lg text-sm font-semibold ${message.type === 'error' ? 'bg-red-500/20 text-red-200 border border-red-500/50' : 'bg-green-500/20 text-green-200 border border-green-500/50'}`}>
              {message.text}
            </div>
          )}
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
        </div>
      ) : (
        <div className="w-full max-w-6xl z-10 flex flex-col lg:flex-row gap-8 items-start my-4">
          <div className="w-full lg:w-2/3 flex flex-col gap-8">
            <div className="bg-white/5 backdrop-blur-3xl rounded-3xl p-8 shadow-2xl border border-white/10">
              <h1 className="text-3xl font-bold text-brand-gold mb-6 text-center">Admin Dashboard</h1>

              {message.text && (
                <div className={`p-4 mb-6 rounded-lg text-sm font-semibold ${message.type === 'error' ? 'bg-red-500/20 text-red-200 border border-red-500/50' : 'bg-green-500/20 text-green-200 border border-green-500/50'}`}>
                  {message.text}
                </div>
              )}
              
              <div className="space-y-8">
                
                {/* Logo Gallery Section */}
            <div className="bg-brand-gold/10 p-6 rounded-2xl border border-brand-gold/20 relative">
              <div className="flex items-center justify-between mb-4">
                <h2 className="text-xl font-semibold text-brand-gold">Logo Gallery Manager</h2>
                <span className="text-xs font-bold bg-brand-gold/20 text-brand-gold py-1 px-3 rounded-full border border-brand-gold/30">
                  {logoCount} Logo{logoCount !== 1 ? 's' : ''} Uploaded
                </span>
              </div>
              <form onSubmit={handleUploadLogoToGallery} className="flex flex-col sm:flex-row gap-4 items-start sm:items-center">
                <div className="flex-1 w-full">
                  <input 
                    type="file" 
                    accept="image/*"
                    onChange={(e) => setGlobalLogoFile(e.target.files?.[0] || null)}
                    className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-2 text-sm text-gray-300 file:mr-4 file:py-2 file:px-4 file:rounded-full file:border-0 file:text-sm file:font-semibold file:bg-brand-gold file:text-brand-dark hover:file:bg-brand-gold/80 transition-colors" 
                  />
                  <p className="text-xs text-gray-400 mt-2">Upload logos here so they are available to select when creating profiles.</p>
                </div>
                <button 
                  type="submit"
                  disabled={!globalLogoFile || savingLogo}
                  className="w-full sm:w-auto bg-brand-gold hover:bg-brand-gold/80 disabled:opacity-50 text-brand-dark font-bold py-2 px-6 rounded-xl transition-colors whitespace-nowrap"
                >
                  {savingLogo ? "Uploading..." : "Upload Logo"}
                </button>
              </form>
              
              {uploadedLogos.length > 0 && (
                <div className="mt-6 border-t border-brand-gold/10 pt-4">
                  <h3 className="text-sm font-medium text-gray-400 mb-3">Uploaded Logos</h3>
                  <div className="flex gap-4 overflow-x-auto pb-2 scrollbar-thin scrollbar-thumb-brand-gold/20 scrollbar-track-transparent">
                    {uploadedLogos.map((logo, idx) => (
                      <div key={idx} className="relative w-16 h-16 flex-shrink-0 rounded-xl overflow-hidden border border-brand-gold/20 bg-black/20 hover:border-brand-gold/50 transition-colors group">
                        <Image src={logo.url} alt={`Uploaded Logo ${idx}`} fill className="object-contain p-2" unoptimized={true} />
                        <button
                          type="button"
                          onClick={(e) => handleDeleteImage(logo.path, 'logo', e)}
                          className="absolute top-0 right-0 bg-red-500 text-white w-5 h-5 flex items-center justify-center rounded-bl-lg opacity-0 group-hover:opacity-100 transition-opacity text-xs font-bold"
                          title="Delete Image"
                        >
                          ×
                        </button>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>

            {/* Favicon Gallery Section */}
            <div className="bg-brand-gold/10 p-6 rounded-2xl border border-brand-gold/20 relative mt-8">
              <div className="flex items-center justify-between mb-4">
                <h2 className="text-xl font-semibold text-brand-gold">Favicon Gallery Manager</h2>
                <span className="text-xs font-bold bg-brand-gold/20 text-brand-gold py-1 px-3 rounded-full border border-brand-gold/30">
                  {faviconCount} Favicon{faviconCount !== 1 ? 's' : ''} Uploaded
                </span>
              </div>
              <form onSubmit={handleUploadFaviconToGallery} className="flex flex-col sm:flex-row gap-4 items-start sm:items-center">
                <div className="flex-1 w-full">
                  <input 
                    type="file" 
                    accept="image/*"
                    onChange={(e) => setGlobalFaviconFile(e.target.files?.[0] || null)}
                    className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-2 text-sm text-gray-300 file:mr-4 file:py-2 file:px-4 file:rounded-full file:border-0 file:text-sm file:font-semibold file:bg-brand-gold file:text-brand-dark hover:file:bg-brand-gold/80 transition-colors" 
                  />
                  <p className="text-xs text-gray-400 mt-2">Upload favicons here so they are available to select when creating profiles.</p>
                </div>
                <button 
                  type="submit"
                  disabled={!globalFaviconFile || savingLogo}
                  className="w-full sm:w-auto bg-brand-gold hover:bg-brand-gold/80 disabled:opacity-50 text-brand-dark font-bold py-2 px-6 rounded-xl transition-colors whitespace-nowrap"
                >
                  {savingLogo ? "Uploading..." : "Upload Favicon"}
                </button>
              </form>
              
              {uploadedFavicons.length > 0 && (
                <div className="mt-6 border-t border-brand-gold/10 pt-4">
                  <h3 className="text-sm font-medium text-gray-400 mb-3">Uploaded Favicons</h3>
                  <div className="flex gap-4 overflow-x-auto pb-2 scrollbar-thin scrollbar-thumb-brand-gold/20 scrollbar-track-transparent">
                    {uploadedFavicons.map((logo, idx) => (
                      <div key={idx} className="relative w-16 h-16 flex-shrink-0 rounded-xl overflow-hidden border border-brand-gold/20 bg-black/20 hover:border-brand-gold/50 transition-colors group">
                        <Image src={logo.url} alt={`Uploaded Favicon ${idx}`} fill className="object-contain p-2" unoptimized={true} />
                        <button
                          type="button"
                          onClick={(e) => handleDeleteImage(logo.path, 'favicon', e)}
                          className="absolute top-0 right-0 bg-red-500 text-white w-5 h-5 flex items-center justify-center rounded-bl-lg opacity-0 group-hover:opacity-100 transition-opacity text-xs font-bold"
                          title="Delete Image"
                        >
                          ×
                        </button>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>

            <hr className="border-white/10" />

            {/* Employee Profile Form */}
            <form onSubmit={handleSubmit} className="space-y-6">
              
              <div className="bg-white/5 p-6 rounded-2xl border border-white/5">
                <h2 className="text-xl font-semibold text-white mb-4">Employee Details</h2>
                <div className="grid grid-cols-2 gap-4">
                  
                  <div className="col-span-2 flex flex-col sm:flex-row gap-6 items-center bg-black/20 p-4 rounded-xl border border-white/5">
                    <div className="w-20 h-20 rounded-full overflow-hidden border-2 border-brand-gold/50 flex items-center justify-center bg-[#111] relative shrink-0">
                      {(profileLogoFile || formData.logoUrl) ? (
                        <Image 
                          src={profileLogoFile ? URL.createObjectURL(profileLogoFile) : formData.logoUrl} 
                          alt="Profile Logo" fill className="object-contain p-2" unoptimized={true} 
                        />
                      ) : (
                        <Gem size={24} className="text-brand-gold" />
                      )}
                    </div>
                    <div className="flex-1 w-full flex flex-col gap-3">
                      <div>
                        <label className="block text-sm font-medium text-gray-400 mb-1">Profile Custom Logo</label>
                        <input 
                          type="file" 
                          accept="image/*"
                          onChange={(e) => setProfileLogoFile(e.target.files?.[0] || null)}
                          className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-2 text-sm text-gray-300 file:mr-4 file:py-2 file:px-4 file:rounded-full file:border-0 file:text-sm file:font-semibold file:bg-brand-gold file:text-brand-dark hover:file:bg-brand-gold/80 transition-colors" 
                        />
                      </div>
                      
                      {uploadedLogos.length > 0 && (
                        <div className="pt-2">
                          <label className="block text-xs font-medium text-gray-500 mb-2">Or select from existing gallery:</label>
                          <div className="flex gap-3 overflow-x-auto pb-2 scrollbar-thin scrollbar-thumb-brand-gold/20 scrollbar-track-transparent">
                            {uploadedLogos.map((logo, idx) => (
                              <button
                                key={idx}
                                type="button"
                                onClick={() => {
                                  setFormData(prev => ({ ...prev, logoUrl: logo.url }));
                                  setProfileLogoFile(null);
                                }}
                                className={`relative w-12 h-12 flex-shrink-0 rounded-lg overflow-hidden border-2 bg-black/20 transition-all ${formData.logoUrl === logo.url && !profileLogoFile ? 'border-brand-gold scale-105 shadow-md shadow-brand-gold/20' : 'border-white/10 hover:border-brand-gold/50'}`}
                              >
                                <Image src={logo.url} alt={`Gallery Logo ${idx}`} fill className="object-contain p-1" unoptimized={true} />
                              </button>
                            ))}
                          </div>
                        </div>
                      )}
                    </div>
                  </div>

                  <div className="col-span-2 flex flex-col sm:flex-row gap-6 items-center bg-black/20 p-4 rounded-xl border border-white/5">
                    <div className="w-16 h-16 rounded-xl overflow-hidden border-2 border-brand-gold/50 flex items-center justify-center bg-[#111] relative shrink-0">
                      {(profileFaviconFile || formData.faviconUrl || formData.logoUrl) ? (
                        <Image 
                          src={profileFaviconFile ? URL.createObjectURL(profileFaviconFile) : (formData.faviconUrl || formData.logoUrl)} 
                          alt="Profile Favicon" fill className="object-contain p-2" unoptimized={true} 
                        />
                      ) : (
                        <Gem size={20} className="text-brand-gold" />
                      )}
                    </div>
                    <div className="flex-1 w-full flex flex-col gap-3">
                      <div>
                        <label className="block text-sm font-medium text-gray-400 mb-1">Profile Favicon (Browser Tab Icon)</label>
                        <input 
                          type="file" 
                          accept="image/*"
                          onChange={(e) => setProfileFaviconFile(e.target.files?.[0] || null)}
                          className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-2 text-sm text-gray-300 file:mr-4 file:py-2 file:px-4 file:rounded-full file:border-0 file:text-sm file:font-semibold file:bg-brand-gold file:text-brand-dark hover:file:bg-brand-gold/80 transition-colors" 
                        />
                      </div>
                      
                      {uploadedFavicons.length > 0 && (
                        <div className="pt-2">
                          <label className="block text-xs font-medium text-gray-500 mb-2">Or select from existing gallery:</label>
                          <div className="flex gap-3 overflow-x-auto pb-2 scrollbar-thin scrollbar-thumb-brand-gold/20 scrollbar-track-transparent">
                            {uploadedFavicons.map((logo, idx) => (
                              <button
                                key={idx}
                                type="button"
                                onClick={() => {
                                  setFormData(prev => ({ ...prev, faviconUrl: logo.url }));
                                  setProfileFaviconFile(null);
                                }}
                                className={`relative w-12 h-12 flex-shrink-0 rounded-lg overflow-hidden border-2 bg-black/20 transition-all ${formData.faviconUrl === logo.url && !profileFaviconFile ? 'border-brand-gold scale-105 shadow-md shadow-brand-gold/20' : 'border-white/10 hover:border-brand-gold/50'}`}
                              >
                                <Image src={logo.url} alt={`Gallery Favicon ${idx}`} fill className="object-contain p-1" unoptimized={true} />
                              </button>
                            ))}
                          </div>
                        </div>
                      )}
                    </div>
                  </div>

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
            </div>

            <div className="bg-white/5 backdrop-blur-3xl rounded-3xl p-8 shadow-2xl border border-white/10">
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
          </div>

          {/* Preview Card */}
          <div className="w-full lg:w-1/3 sticky top-8">
            <div className="bg-white/5 backdrop-blur-3xl rounded-3xl p-6 shadow-2xl border border-white/10 flex flex-col items-center">
              <h2 className="text-xl font-bold text-brand-gold mb-6 w-full text-center">Live Preview</h2>
              
              <div className="w-full max-w-sm bg-[#111] text-white rounded-3xl p-8 flex flex-col items-center text-center shadow-xl relative overflow-hidden border border-white/10">
                <div className="w-32 h-32 rounded-full overflow-hidden border-4 border-brand-gold/50 mb-6 shadow-xl flex items-center justify-center bg-[#111] relative">
                  {(profileLogoFile || formData.logoUrl) ? (
                    <Image src={profileLogoFile ? URL.createObjectURL(profileLogoFile) : formData.logoUrl} alt="Brand Logo" fill className="object-contain p-4" unoptimized={true} />
                  ) : (
                    <Gem size={40} className="text-brand-gold" />
                  )}
                </div>
                
                <h3 className="text-2xl font-bold mb-1 tracking-tight">{formData.name || "Full Name"}</h3>
                <p className="text-brand-gold font-bold mb-8 text-xs uppercase tracking-widest">{formData.role || "Job Title"}</p>

                <div className="flex flex-col gap-3 w-full mb-8">
                  <div className="flex items-center justify-center gap-3 w-full py-3 px-4 rounded-2xl bg-brand-gold opacity-50">
                    <UserPlus size={18} className="text-brand-dark" />
                    <span className="font-bold text-brand-dark tracking-wide text-sm">Save Contact</span>
                  </div>
                  
                  {formData.phone && (
                    <div className="flex items-center justify-between w-full py-3 px-4 rounded-2xl border border-white/10 bg-white/5">
                      <span className="font-medium text-sm">Call Mobile</span>
                      <Phone size={18} className="text-gray-400" />
                    </div>
                  )}
                  
                  {formData.email && (
                    <div className="flex items-center justify-between w-full py-3 px-4 rounded-2xl border border-white/10 bg-white/5">
                      <span className="font-medium text-sm">Send Email</span>
                      <Mail size={18} className="text-gray-400" />
                    </div>
                  )}
                </div>

                <div className="w-full relative py-2 mb-2">
                  <div className="absolute inset-0 flex items-center">
                    <div className="w-full border-t border-white/10"></div>
                  </div>
                  <div className="relative flex justify-center text-xs">
                    <span className="bg-[#111] px-4 text-brand-gold font-bold tracking-widest uppercase rounded-full border border-white/10 py-1">Connect</span>
                  </div>
                </div>

                <div className="flex justify-around items-center w-full py-4 px-6 rounded-full border border-white/10 bg-white/5 mt-2">
                  {formData.website && <FaGlobe size={20} className="text-gray-400" />}
                  {formData.whatsapp && <FaWhatsapp size={20} className="text-gray-400" />}
                  {formData.facebook && <FaFacebook size={20} className="text-gray-400" />}
                  {formData.instagram && <FaInstagram size={20} className="text-gray-400" />}
                  {formData.linkedin && <FaLinkedin size={20} className="text-gray-400" />}
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
    </main>
  );
}
