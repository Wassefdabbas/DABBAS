/**
 * Soft loading state — a porcelain field with a slowly pulsing gold hairline.
 * Reduced-motion users see a still hairline (CSS keyframe is killed globally).
 */
export default function Loading() {
  return (
    <div
      className="flex min-h-screen items-center justify-center bg-porcelain"
      role="status"
      aria-live="polite"
      aria-label="Loading"
    >
      <div className="flex flex-col items-center gap-4">
        <span className="small-caps">DABBAS</span>
        <span className="block h-px w-24 origin-center animate-[pulse_2s_ease-in-out_infinite] bg-gold" />
      </div>
    </div>
  );
}
