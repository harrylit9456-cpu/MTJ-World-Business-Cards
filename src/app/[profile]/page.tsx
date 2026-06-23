import type { Metadata } from "next";
import Image from "next/image";
import { db } from "@/lib/firebase";
import { doc, getDoc } from "firebase/firestore";
import { Phone, Mail, UserPlus, Gem } from "lucide-react";
import { FaLinkedin, FaInstagram, FaWhatsapp, FaFacebook, FaGlobe } from "react-icons/fa";
import { notFound } from "next/navigation";
import { ThemeToggle } from "@/components/ThemeToggle";
import { cache } from "react";

export const dynamic = 'force-dynamic';

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

const getProfileData = cache(async (profile: string) => {
  let data = mockProfiles[profile.toLowerCase()];
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
  return { data, globalLogoUrl };
});

export async function generateMetadata(props: { params: Params }): Promise<Metadata> {
  const params = await props.params;
  const { data, globalLogoUrl } = await getProfileData(params.profile);
  
  if (!data) {
    return { title: "Profile Not Found" };
  }

  return {
    title: data.name,
    icons: (data.faviconUrl || data.logoUrl || globalLogoUrl) ? { icon: data.faviconUrl || data.logoUrl || globalLogoUrl } : undefined,
  };
}

export default async function ProfilePage(props: { params: Params }) {
  const params = await props.params;
  const { profile } = params;
  
  const { data, globalLogoUrl } = await getProfileData(profile);

  if (!data) {
    notFound();
  }

  return (
    <main className="flex min-h-screen items-center justify-center p-4 bg-bg-primary transition-colors duration-300">
      <ThemeToggle />
      {/* Background gradients for premium feel */}
      <div className="absolute top-0 left-0 w-full h-full overflow-hidden pointer-events-none -z-10">
        <div className="absolute top-[-10%] left-[-10%] w-[50%] h-[50%] rounded-full bg-accent blur-[150px] opacity-10"></div>
        <div className="absolute bottom-[-10%] right-[-10%] w-[50%] h-[50%] rounded-full bg-accent blur-[150px] opacity-[0.05]"></div>
      </div>

      <div className="w-full max-w-sm glass rounded-3xl p-8 flex flex-col items-center text-center shadow-2xl relative overflow-hidden transition-all duration-500 hover:shadow-accent/10 hover:border-accent/30 group">
        
        {/* Brand Logo Placeholder */}
        <div className="w-40 h-40 rounded-full overflow-hidden border-4 border-accent/50 mb-6 shadow-xl shadow-accent/20 flex items-center justify-center bg-bg-primary transform transition duration-500 group-hover:scale-105 relative">
          {data.logoUrl || globalLogoUrl ? (
            <Image src={data.logoUrl || globalLogoUrl} alt="Brand Logo" fill className="object-contain p-4" unoptimized={true} />
          ) : (
            <Gem size={48} className="text-accent" />
          )}
        </div>

        {/* Employee Info */}
        <h1 className="text-3xl font-bold text-text-primary mb-2 tracking-tight">{data.name}</h1>
        <p className="text-accent font-bold mb-8 text-sm uppercase tracking-widest">{data.role}</p>

        {/* Core Actions (Minimalist List Layout) */}
        <div className="flex flex-col gap-3 w-full mb-8">
          <a 
            href={`/api/vcard/${profile.toLowerCase()}`}
            download={`${data.name?.replace(/\s+/g, '_')}_Contact.vcf`}
            className="flex items-center justify-center gap-3 w-full py-4 px-6 rounded-2xl bg-accent hover:bg-accent-hover transition-all shadow-lg shadow-accent/20 group hover:-translate-y-1"
          >
            <UserPlus size={20} className="text-bg-primary group-hover:scale-110 transition-transform" />
            <span className="font-bold text-bg-primary tracking-wide">Save Contact</span>
          </a>
          
          {data.phone && (
            <a href={`tel:${data.phone}`} className="flex items-center justify-between w-full py-4 px-6 rounded-2xl border border-border bg-black/5 dark:bg-white/5 hover:bg-black/10 dark:hover:bg-white/10 transition-all group">
              <span className="font-medium text-text-primary tracking-wide">Call Mobile</span>
              <Phone size={20} className="text-text-secondary group-hover:text-accent group-hover:scale-110 transition-all" />
            </a>
          )}
          
          {data.email && (
            <a href={`mailto:${data.email}`} className="flex items-center justify-between w-full py-4 px-6 rounded-2xl border border-border bg-black/5 dark:bg-white/5 hover:bg-black/10 dark:hover:bg-white/10 transition-all group">
              <span className="font-medium text-text-primary tracking-wide">Send Email</span>
              <Mail size={20} className="text-text-secondary group-hover:text-accent group-hover:scale-110 transition-all" />
            </a>
          )}
        </div>

        {/* Brand Links Divider */}
        <div className="w-full relative py-2 mb-1">
          <div className="absolute inset-0 flex items-center">
            <div className="w-full border-t border-border"></div>
          </div>
          <div className="relative flex justify-center text-xs">
            <span className="bg-bg-primary px-4 text-accent font-bold tracking-widest uppercase rounded-full border border-border py-1 transition-colors duration-300">Connect</span>
          </div>
        </div>

        {/* Brand Social Tray */}
        <div className="w-full pt-1">
          <div className="flex justify-around items-center w-full py-4 px-6 rounded-full glass border border-border shadow-lg transition-all hover:shadow-accent/10">
            {data.website && (
              <a href={data.website} target="_blank" rel="noreferrer" className="text-text-secondary hover:text-accent hover:scale-110 transition-all transform">
                <FaGlobe size={24} />
              </a>
            )}
            {data.whatsapp && (
              <a href={`https://wa.me/${data.whatsapp.replace(/[^0-9]/g, "")}`} target="_blank" rel="noreferrer" className="text-text-secondary hover:text-[#25D366] hover:scale-110 transition-all transform">
                <FaWhatsapp size={24} />
              </a>
            )}
            {data.facebook && (
              <a href={data.facebook} target="_blank" rel="noreferrer" className="text-text-secondary hover:text-[#1877F2] hover:scale-110 transition-all transform">
                <FaFacebook size={24} />
              </a>
            )}
            {data.instagram && (
              <a href={data.instagram} target="_blank" rel="noreferrer" className="text-text-secondary hover:text-[#E1306C] hover:scale-110 transition-all transform">
                <FaInstagram size={24} />
              </a>
            )}
            {data.linkedin && (
              <a href={data.linkedin} target="_blank" rel="noreferrer" className="text-text-secondary hover:text-[#0077b5] hover:scale-110 transition-all transform">
                <FaLinkedin size={24} />
              </a>
            )}
          </div>
        </div>
      </div>
    </main>
  );
}
