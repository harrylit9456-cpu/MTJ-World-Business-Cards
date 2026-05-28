import Image from "next/image";
import { db } from "@/lib/firebase";
import { doc, getDoc } from "firebase/firestore";
import { Phone, Mail, UserPlus, Gem } from "lucide-react";
import { FaLinkedin, FaInstagram, FaWhatsapp, FaFacebook, FaGlobe } from "react-icons/fa";
import { notFound } from "next/navigation";

// Placeholder mock data to be used when not connected to Firebase or if the document is missing.
const mockProfiles: Record<string, any> = {
  av: {
    name: "Alex Vance",
    role: "CEO, MTJ World",
    phone: "+1234567890",
    email: "alex@mtjworld.com",
    whatsapp: "+1234567890",
    website: "https://mtjworld.com",
    facebook: "https://facebook.com",
    linkedin: "https://linkedin.com",
    instagram: "https://instagram.com",
  },
};

type Params = Promise<{ profile: string }>;

export default async function ProfilePage(props: { params: Params }) {
  const params = await props.params;
  const { profile } = params;
  let data = mockProfiles[profile.toLowerCase()];

  // Attempt to fetch from Firestore if demo project config is updated
  let globalLogoUrl = null;
  try {
    // Only fetch if a real Firebase project ID is configured
    if (db.app.options.projectId !== "demo-project") {
      const docRef = doc(db, "profiles", profile.toLowerCase());
      const docSnap = await getDoc(docRef);
      if (docSnap.exists()) {
        data = docSnap.data();
      }

      // Fetch global settings for the universal logo
      const globalDocSnap = await getDoc(doc(db, "settings", "global"));
      if (globalDocSnap.exists() && globalDocSnap.data().logoUrl) {
        globalLogoUrl = globalDocSnap.data().logoUrl;
      }
    }
  } catch (error) {
    console.warn("Firestore warning: Falling back to mock data.");
  }

  if (!data) {
    notFound();
  }

  return (
    <main className="flex min-h-screen items-center justify-center p-4 bg-brand-dark">
      {/* Background gradients for premium feel */}
      <div className="absolute top-0 left-0 w-full h-full overflow-hidden pointer-events-none -z-10">
        <div className="absolute top-[-10%] left-[-10%] w-[50%] h-[50%] rounded-full bg-brand-gold blur-[150px] opacity-10"></div>
        <div className="absolute bottom-[-10%] right-[-10%] w-[50%] h-[50%] rounded-full bg-brand-gold blur-[150px] opacity-[0.05]"></div>
      </div>

      <div className="w-full max-w-sm glass rounded-3xl p-8 flex flex-col items-center text-center shadow-2xl relative overflow-hidden transition-all duration-500 hover:shadow-brand-gold/10 hover:border-brand-gold/30 group">
        
        {/* Brand Logo Placeholder */}
        <div className="w-40 h-40 rounded-full overflow-hidden border-4 border-brand-gold/50 mb-6 shadow-xl shadow-brand-gold/20 flex items-center justify-center bg-brand-dark transform transition duration-500 group-hover:scale-105 relative">
          {globalLogoUrl ? (
            <Image src={globalLogoUrl} alt="Brand Logo" fill className="object-contain p-4" />
          ) : (
            <Gem size={48} className="text-brand-gold" />
          )}
        </div>

        {/* Employee Info */}
        <h1 className="text-3xl font-bold text-white mb-2 tracking-tight">{data.name}</h1>
        <p className="text-brand-gold font-medium mb-8 text-sm uppercase tracking-widest">{data.role}</p>

        {/* Core Actions */}
        <div className="w-full space-y-4 mb-8">
          <a 
            href={`/api/vcard/${profile.toLowerCase()}`}
            download={`${data.name?.replace(/\s+/g, '_')}_Contact.vcf`}
            className="flex items-center justify-center gap-3 w-full py-4 rounded-xl bg-brand-gold hover:bg-brand-gold/90 transition-colors font-bold shadow-lg shadow-brand-gold/20 text-brand-dark"
          >
            <UserPlus size={20} className="text-brand-dark" />
            Save Contact
          </a>
          
          <div className="grid grid-cols-2 gap-4">
            {data.phone && (
              <a href={`tel:${data.phone}`} className="flex items-center justify-center gap-3 w-full py-3 rounded-xl bg-white/5 hover:bg-white/10 border border-white/10 transition-colors font-semibold text-white text-sm">
                <Phone size={18} className="text-brand-gold" />
                Call
              </a>
            )}
            {data.email && (
              <a href={`mailto:${data.email}`} className="flex items-center justify-center gap-3 w-full py-3 rounded-xl bg-white/5 hover:bg-white/10 border border-white/10 transition-colors font-semibold text-white text-sm">
                <Mail size={18} className="text-brand-gold" />
                Email
              </a>
            )}
          </div>
          
          {data.whatsapp && (
            <a href={`https://wa.me/${data.whatsapp.replace(/[^0-9]/g, "")}`} target="_blank" rel="noreferrer" className="flex items-center justify-center gap-3 w-full py-4 rounded-xl bg-[#25D366]/10 hover:bg-[#25D366]/20 border border-[#25D366]/30 transition-colors font-semibold text-white">
              <FaWhatsapp size={20} className="text-[#25D366]" />
              WhatsApp Me
            </a>
          )}
        </div>

        {/* Brand Links Divider */}
        <div className="w-full relative py-4 mb-2">
          <div className="absolute inset-0 flex items-center">
            <div className="w-full border-t border-white/10"></div>
          </div>
          <div className="relative flex justify-center text-xs">
            <span className="bg-brand-dark px-4 text-brand-gold font-semibold tracking-widest uppercase rounded-full border border-white/10 py-1">MTJ World Links</span>
          </div>
        </div>

        {/* Brand Social Tray */}
        <div className="flex justify-center gap-4 w-full pt-2 flex-wrap">
          {data.website && (
            <a href={data.website} target="_blank" rel="noreferrer" className="p-3 rounded-full bg-white/5 hover:bg-white/10 hover:text-white transition-all transform hover:scale-110 text-gray-400">
              <FaGlobe size={20} />
            </a>
          )}
          {data.facebook && (
            <a href={data.facebook} target="_blank" rel="noreferrer" className="p-3 rounded-full bg-white/5 hover:bg-white/10 hover:text-[#1877F2] transition-all transform hover:scale-110 text-gray-400">
              <FaFacebook size={20} />
            </a>
          )}
          {data.instagram && (
            <a href={data.instagram} target="_blank" rel="noreferrer" className="p-3 rounded-full bg-white/5 hover:bg-white/10 hover:text-[#E1306C] transition-all transform hover:scale-110 text-gray-400">
              <FaInstagram size={20} />
            </a>
          )}
          {data.linkedin && (
            <a href={data.linkedin} target="_blank" rel="noreferrer" className="p-3 rounded-full bg-white/5 hover:bg-white/10 hover:text-[#0077b5] transition-all transform hover:scale-110 text-gray-400">
              <FaLinkedin size={20} />
            </a>
          )}
        </div>
      </div>
    </main>
  );
}
