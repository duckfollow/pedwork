import Image from "next/image";

export default function ProfileHero() {
  return (
    <section className="min-h-screen flex flex-col items-center justify-center px-6 py-20 relative overflow-hidden">
      {/* Animated background elements */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div className="absolute -top-40 -right-40 w-80 h-80 bg-white/10 rounded-full blur-3xl animate-pulse" />
        <div className="absolute -bottom-40 -left-40 w-96 h-96 bg-white/10 rounded-full blur-3xl animate-pulse delay-1000" />
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[600px] bg-white/5 rounded-full blur-3xl" />
      </div>

      {/* Content */}
      <div className="relative z-10 flex flex-col items-center animate-fade-in">
        {/* Avatar with glow effect */}
        <div className="relative mb-8 group">
          {/* Outer glow ring */}
          <div className="absolute inset-0 rounded-full bg-gradient-to-r from-white/40 to-white/20 dark:from-amber-300/40 dark:to-orange-400/30 blur-xl scale-110 group-hover:scale-125 transition-transform duration-700" />
          
          {/* Animated ring */}
          <div className="absolute -inset-2 rounded-full bg-gradient-to-r from-white/60 via-transparent to-white/60 dark:from-amber-300/60 dark:via-transparent dark:to-orange-400/60 animate-spin-slow opacity-50" />
          
          {/* Avatar container */}
          <div className="relative w-40 h-40 md:w-52 md:h-52 rounded-full p-1 bg-gradient-to-br from-white/80 to-white/40 dark:from-amber-200/80 dark:to-orange-300/40 shadow-2xl">
            <div className="w-full h-full rounded-full overflow-hidden bg-white dark:bg-gray-900">
              <Image
                src="/images/avatar.png"
                alt="Prasit Suphancho"
                width={208}
                height={208}
                className="w-full h-full object-cover"
                priority
              />
            </div>
          </div>
        </div>

        {/* Name / Handle */}
        <h1 className="text-4xl md:text-6xl font-bold text-white dark:text-white mb-3 tracking-tight animate-slide-up">
          @tankps
        </h1>
        
        <p className="text-lg md:text-xl text-white/80 dark:text-white/70 font-medium animate-slide-up delay-100">
          Prasit Suphancho
        </p>
      </div>
    </section>
  );
}

