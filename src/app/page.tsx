export default function Home() {
  return (
    <main className="flex min-h-screen flex-col items-center justify-center p-24 bg-brand-dark relative overflow-hidden">
      <div className="absolute top-[-10%] left-[-10%] w-[50%] h-[50%] rounded-full bg-brand-blue blur-[120px] opacity-40"></div>
      <div className="absolute bottom-[-10%] right-[-10%] w-[50%] h-[50%] rounded-full bg-brand-gold blur-[120px] opacity-20"></div>

      <div className="z-10 text-center">
        <h1 className="text-5xl font-bold text-brand-gold mb-4 tracking-tight">MTJ World</h1>
        <p className="text-gray-400 max-w-md mx-auto text-lg">
          Premium Digital Business Cards
        </p>
      </div>
    </main>
  );
}
