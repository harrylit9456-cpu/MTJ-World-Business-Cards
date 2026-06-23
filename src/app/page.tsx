import Image from "next/image";
import { FaHardHat, FaCog, FaHammer } from "react-icons/fa";

export default function Home() {
  return (
    <div className="flex min-h-screen items-center justify-center bg-brand-dark p-8 relative overflow-hidden">
      {/* Subtle Background Glows */}
      <div className="fixed top-[-20%] left-[-10%] w-[60%] h-[60%] rounded-full bg-brand-blue blur-[150px] opacity-20 pointer-events-none -z-10"></div>
      <div className="fixed bottom-[-20%] right-[-10%] w-[60%] h-[60%] rounded-full bg-brand-gold blur-[150px] opacity-[0.15] pointer-events-none -z-10"></div>

      <div className="flex flex-col items-center z-10 w-full max-w-2xl text-center">
        
        {/* Logo */}
        <div className="mb-12">
          <Image 
            src="/logo.png" 
            alt="MTJ World Logo" 
            width={280} 
            height={100} 
            className="mx-auto w-auto h-auto object-contain drop-shadow-2xl"
            priority
          />
        </div>

        {/* Animated Construction Graphic */}
        <div className="flex items-center justify-center gap-6 mb-10 text-brand-gold">
          <FaCog className="text-5xl animate-[spin_4s_linear_infinite] opacity-80" />
          <FaHardHat className="text-7xl animate-bounce drop-shadow-[0_0_15px_rgba(255,215,0,0.5)]" />
          <FaCog className="text-5xl animate-[spin_3s_linear_infinite_reverse] opacity-80" />
        </div>

        {/* Text Content */}
        <div className="bg-black/40 backdrop-blur-md border border-brand-gold/20 rounded-3xl p-8 sm:p-12 w-full shadow-[0_0_50px_rgba(0,0,0,0.5)]">
          <div className="inline-block bg-brand-gold/20 text-brand-gold border border-brand-gold/30 px-4 py-1 rounded-full text-sm font-bold tracking-[0.2em] uppercase mb-6">
            Status Update
          </div>
          
          <h1 className="text-3xl sm:text-5xl font-extrabold text-white mb-6 uppercase tracking-tight">
            Under <span className="text-transparent bg-clip-text bg-gradient-to-r from-brand-gold to-yellow-300">Construction</span>
          </h1>
          
          <p className="text-gray-400 text-lg sm:text-xl leading-relaxed max-w-xl mx-auto mb-8">
            We are currently rebuilding the MTJ World platform from the ground up to bring you a truly premium digital experience. 
          </p>

          <div className="flex flex-col items-center justify-center gap-4 mt-4">
            <div className="flex items-center gap-2 text-brand-gold font-medium animate-pulse">
              <FaHammer className="text-xl" />
              <span>Working on improvements...</span>
            </div>
            
            <div className="w-16 h-px bg-white/20 my-2"></div>
            
            <a href="mailto:info@mtjworld.com" className="group flex items-center gap-2 text-gray-400 hover:text-white transition-colors">
              <span className="text-sm uppercase tracking-wider">Contact:</span>
              <span className="font-semibold group-hover:text-brand-gold transition-colors">info@mtjworld.com</span>
            </a>
          </div>
        </div>
        
      </div>
    </div>
  );
}
