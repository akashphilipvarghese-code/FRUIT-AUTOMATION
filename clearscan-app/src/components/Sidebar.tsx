import { ReactNode } from "react";

type Props = {
  children?: ReactNode;
  open?: boolean;
  onClose?: () => void;
  className?: string;
};

/**
 * App sidebar (e.g. history, settings).
 * Placeholder – add nav items and overlay as needed.
 */
export function Sidebar({ children, open = false, onClose, className = "" }: Props) {
  if (!open) return null;
  return (
    <>
      <div
        className="fixed inset-0 bg-black/50 z-40 sm:hidden"
        onClick={onClose}
        aria-hidden
      />
      <aside
        className={`fixed top-0 right-0 h-full w-64 max-w-[85vw] bg-[#111] border-l border-gray-800 z-50 p-4 ${className}`}
      >
        {children}
      </aside>
    </>
  );
}
