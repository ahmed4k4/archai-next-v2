import LazyVisual from "../visuals/LazyVisual";
import type { VisualName } from "../visuals/DynamicVisual";

/**
 * Small reusable 3D block that can be inserted anywhere on any page
 * to add a distinct animated visual mid-page.
 */
export default function Hero3DDisplay({
  name,
  caption,
  className,
}: {
  name: VisualName;
  caption?: string;
  className?: string;
}) {
  return (
    <div className={`marketing-visual-card relative aspect-video rounded-3xl overflow-hidden glass scanlines ${className ?? ""}`}>

      <LazyVisual name={name} className="absolute inset-0" rootMargin="280px 0px" />
      {caption && (
        <div className="absolute bottom-4 left-4 right-4 text-xs font-mono text-ink-3 tracking-widest">
          {caption}
        </div>
      )}
    </div>
  );
}