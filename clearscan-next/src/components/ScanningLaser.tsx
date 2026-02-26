"use client";

type Props = { imageUrl: string };

export function ScanningLaser({ imageUrl }: Props) {
  return (
    <div className="relative aspect-[4/3] max-h-[70vh] rounded-xl overflow-hidden border-2 border-gray-800 bg-black">
      <img
        src={imageUrl}
        alt="Scanning"
        className="w-full h-full object-cover"
      />
      {/* Laser line animation */}
      <div className="absolute left-0 right-0 h-1 bg-[#FF8C00] shadow-[0_0_20px_4px_rgba(255,140,0,0.8)] animate-scan" />
      <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
        <span className="text-[#FF8C00] font-medium tracking-widest uppercase text-sm opacity-90">
          Scanning…
        </span>
      </div>
    </div>
  );
}
