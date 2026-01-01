import Link from "next/link";
import { Stamp, Gamepad2 } from "lucide-react";
import ThemeToggle from "@/components/ThemeToggle";
import ProfileHero from "@/components/ProfileHero";
import SocialGrid from "@/components/SocialGrid";
import ScrollIndicator from "@/components/ScrollIndicator";

// Binary patterns (DUCK-FOLLOW encoded + variations)
const binaryPatterns = [
  "01000100 01010101 01000011 01001011",
  "01000110 01001111 01001100 01001100",
  "01001111 01010111 00101110 01000011",
  "01001111 00100000 01010000 01000101",
  "01000100 01010111 01001111 01010010",
  "01001011 00100000 01000011 01001111",
  "01000100 01000101 01010010 00100000",
  "01010100 01000001 01001110 01001011",
];

// Generate watermark rows with binary code
const BinaryWatermark = () => {
  const rows = Array.from({ length: 40 }, (_, i) => i);
  const cols = Array.from({ length: 6 }, (_, i) => i);

  return (
    <div className="fixed inset-0 z-0 overflow-hidden pointer-events-none select-none">
      <div className="absolute inset-0 flex flex-col justify-between">
        {rows.map((row) => (
          <div
            key={row}
            className={`flex whitespace-nowrap ${
              row % 2 === 0 ? "justify-start" : "justify-end"
            }`}
          >
            <div
              className={`flex gap-8 md:gap-12 ${
                row % 2 === 0 ? "animate-marquee-left" : "animate-marquee-right"
              }`}
            >
              {cols.map((col) => (
                <span
                  key={col}
                  className="text-xl md:text-3xl lg:text-4xl font-mono font-bold tracking-wider text-white/[0.025] dark:text-white/[0.045]"
                >
                  {binaryPatterns[(row + col) % binaryPatterns.length]}
                </span>
              ))}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

export default function Home() {
  return (
    <main className="relative min-h-screen bg-gradient-to-br from-yellow-300 via-orange-400 to-orange-500 dark:from-amber-500 dark:via-orange-600 dark:to-orange-700 transition-colors duration-500 overflow-hidden">
      {/* Binary watermark background */}
      <BinaryWatermark />

      {/* Main content */}
      <div className="relative z-10">
        <ThemeToggle />
        <ProfileHero />
        
        {/* Features Section */}
        <section className="py-12 px-6">
          <div className="max-w-4xl mx-auto">
            <h2 className="text-center text-2xl md:text-3xl font-bold text-white/90 dark:text-white mb-8 animate-fade-in">
              Activity
            </h2>
            <div className="flex flex-col sm:flex-row justify-center gap-4">
              <Link
                href="/features/stamp"
                className="group flex items-center gap-4 bg-white/90 dark:bg-zinc-800/90 backdrop-blur-xl rounded-2xl p-6 shadow-xl hover:shadow-2xl transition-all duration-300 hover:scale-105 animate-fade-in-up w-full sm:w-72"
              >
                <div className="p-3 bg-gradient-to-br from-amber-400 to-orange-500 rounded-xl shadow-lg shadow-amber-500/30 group-hover:shadow-amber-500/50 transition-shadow">
                  <Stamp className="w-8 h-8 text-white" />
                </div>
                <div className="text-left">
                  <h3 className="text-lg font-bold text-zinc-800 dark:text-zinc-100">
                    Photo Stamp
                  </h3>
                  <p className="text-sm text-zinc-600 dark:text-zinc-400">
                    Create vintage postage stamps from your photos
                  </p>
                </div>
              </Link>
              <Link
                href="/nad"
                className="group flex items-center gap-4 bg-white/90 dark:bg-zinc-800/90 backdrop-blur-xl rounded-2xl p-6 shadow-xl hover:shadow-2xl transition-all duration-300 hover:scale-105 animate-fade-in-up w-full sm:w-72"
              >
                <div className="p-3 bg-gradient-to-br from-zinc-700 to-zinc-900 rounded-xl shadow-lg shadow-zinc-700/30 group-hover:shadow-amber-500/50 transition-shadow">
                  <Gamepad2 className="w-8 h-8 text-amber-400" />
                </div>
                <div className="text-left">
                  <h3 className="text-lg font-bold text-zinc-800 dark:text-zinc-100">
                    Night At Detective
                  </h3>
                  <p className="text-sm text-zinc-600 dark:text-zinc-400">
                    Mystery game in development
                  </p>
                </div>
              </Link>
            </div>
          </div>
        </section>

        <SocialGrid />
        <ScrollIndicator />
      </div>
    </main>
  );
}
