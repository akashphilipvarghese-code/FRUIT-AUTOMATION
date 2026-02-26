"use client";

import { useState } from "react";

type Props = {
  onLogin: () => void;
};

/**
 * High-fidelity Login Page for ClearScan AI
 * Figma specs: matte black, 20px grid, Safety Orange (#FF8C00), charcoal card, orange glow
 */
export function LoginPage({ onLogin }: Props) {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    const isDemoUser = email.toLowerCase() === "demo@clearscan.ai";
    if (isDemoUser || (email.length > 0 && password.length > 0)) {
      onLogin();
      return;
    }
    setError("Use Demo Mode or enter your credentials.");
  };

  const fillDemoMode = () => {
    setEmail("demo@clearscan.ai");
    setPassword("demo123");
    setError("");
  };

  return (
    <div
      className="min-h-screen w-full flex flex-col items-center justify-center px-4 py-8"
      style={{
        backgroundColor: "#000000",
        backgroundImage: `
          linear-gradient(to right, rgba(255, 140, 0, 0.05) 1px, transparent 1px),
          linear-gradient(to bottom, rgba(255, 140, 0, 0.05) 1px, transparent 1px)
        `,
        backgroundSize: "20px 20px",
      }}
    >
      {/* Header: geometric logo + CLEARSCAN AI + tagline */}
      <header className="flex flex-col items-center text-center mb-8 sm:mb-10">
        {/* Geometric gold/tan logo */}
        <div
          className="w-16 h-16 sm:w-20 sm:h-20 rounded-2xl mb-4 flex items-center justify-center border-2 border-[#FF8C00]/60 bg-[#1a1a1a] shadow-orange-glow"
          aria-hidden
        >
          <svg
            width="32"
            height="32"
            viewBox="0 0 24 24"
            fill="none"
            xmlns="http://www.w3.org/2000/svg"
            className="text-[#FF8C00]"
          >
            <path
              d="M12 2L4 6v6l8 4 8-4V6l-8-4z"
              stroke="currentColor"
              strokeWidth="2"
              strokeLinecap="round"
              strokeLinejoin="round"
            />
            <path
              d="M4 12l8 4 8-4"
              stroke="currentColor"
              strokeWidth="2"
              strokeLinecap="round"
            />
          </svg>
        </div>
        <h1 className="text-2xl sm:text-3xl font-bold text-[#FF8C00] tracking-tight uppercase mb-1">
          ClearScan AI
        </h1>
        <p className="text-gray-500 text-xs sm:text-sm font-medium tracking-wide">
          KNOW YOUR FRUIT BEFORE THE FIRST BITE
        </p>
      </header>

      {/* Login Card: charcoal #111111, thin orange border */}
      <div
        className="w-full max-w-sm rounded-xl p-6 sm:p-8 border border-[#FF8C00]/40 shadow-orange-glow"
        style={{ backgroundColor: "#111111" }}
      >
        <h2 className="text-lg font-semibold text-white mb-1">Sign in</h2>
        <p className="text-gray-500 text-sm mb-6">Fruit Quality Grading System</p>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label htmlFor="email" className="block text-sm font-medium text-gray-400 mb-2">
              Email
            </label>
            <input
              id="email"
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="demo@clearscan.ai"
              className="w-full px-4 py-3 rounded-lg bg-black border border-gray-600 text-white placeholder-gray-500
                focus:outline-none focus:border-[#FF8C00] focus:ring-2 focus:ring-[#FF8C00]/30 focus:shadow-[0_0_15px_rgba(255,140,0,0.3)]
                transition-all duration-200"
              autoComplete="email"
            />
          </div>
          <div>
            <label htmlFor="password" className="block text-sm font-medium text-gray-400 mb-2">
              Password
            </label>
            <input
              id="password"
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="••••••••"
              className="w-full px-4 py-3 rounded-lg bg-black border border-gray-600 text-white placeholder-gray-500
                focus:outline-none focus:border-[#FF8C00] focus:ring-2 focus:ring-[#FF8C00]/30 focus:shadow-[0_0_15px_rgba(255,140,0,0.3)]
                transition-all duration-200"
              autoComplete="current-password"
            />
          </div>
          {error && (
            <p className="text-sm text-amber-400" role="alert">
              {error}
            </p>
          )}
          {/* LOGIN button: full-width, Safety Orange, bold black text, orange neon glow */}
          <button
            type="submit"
            className="w-full py-3.5 rounded-lg font-bold text-black bg-[#FF8C00]
              hover:bg-[#FF8C00]/95 hover:shadow-orange-neon
              focus:outline-none focus:ring-2 focus:ring-[#FF8C00] focus:ring-offset-2 focus:ring-offset-[#111111]
              shadow-[0_0_20px_rgba(255,140,0,0.4)] transition-all duration-200 uppercase tracking-wide"
          >
            Login
          </button>
        </form>

        {/* Demo Mode link */}
        <p className="text-center mt-5">
          <button
            type="button"
            onClick={fillDemoMode}
            className="text-sm text-[#FF8C00] hover:text-[#FF8C00]/90 underline underline-offset-2 focus:outline-none focus:ring-2 focus:ring-[#FF8C00]/50 rounded"
          >
            Demo Mode
          </button>
          <span className="text-gray-500 text-xs ml-1"> — demo@clearscan.ai / demo123</span>
        </p>
      </div>
    </div>
  );
}
