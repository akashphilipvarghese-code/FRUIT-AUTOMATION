type Props = {
  onFileSelect?: (file: File) => void;
  onCameraRequest?: () => void;
  className?: string;
};

/**
 * Unified scanner (upload + camera entry).
 * Placeholder – wire to UploadZone / CameraScanner as needed.
 */
export function Scanner({ onFileSelect, onCameraRequest, className = "" }: Props) {
  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) onFileSelect?.(file);
  };

  return (
    <div className={`space-y-3 ${className}`}>
      <label className="block">
        <span className="sr-only">Choose image</span>
        <input type="file" accept="image/*" onChange={handleChange} className="block w-full text-sm text-gray-500 file:mr-4 file:py-2 file:px-4 file:rounded-lg file:border-0 file:bg-[#FF8C00] file:text-black" />
      </label>
      {onCameraRequest && (
        <button
          type="button"
          onClick={onCameraRequest}
          className="px-4 py-2 rounded-lg border border-[#FF8C00] text-[#FF8C00] font-medium"
        >
          Use camera
        </button>
      )}
    </div>
  );
}
