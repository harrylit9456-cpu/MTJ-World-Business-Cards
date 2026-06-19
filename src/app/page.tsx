import Image from "next/image";

export default function Home() {
  return (
    <div className="flex min-h-screen items-center justify-center bg-brand-dark p-8 relative overflow-hidden">
      <div className="fixed top-[-20%] left-[-10%] w-[60%] h-[60%] rounded-full bg-brand-blue blur-[150px] opacity-20 pointer-events-none -z-10"></div>
      <div className="fixed bottom-[-20%] right-[-10%] w-[60%] h-[60%] rounded-full bg-brand-gold blur-[150px] opacity-[0.15] pointer-events-none -z-10"></div>

      <div className="text-center z-10">
        <Image 
          src="/logo.png" 
          alt="MTJ World Logo" 
          width={300} 
          height={100} 
          className="mx-auto object-contain drop-shadow-2xl"
          priority
        />
      </div>
    </div>
  );
}
