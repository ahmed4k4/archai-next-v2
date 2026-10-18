/**
 * Render analytics and hero metrics with their real value in server HTML.
 * Avoid a client-only zero placeholder that search engines and early screenshots
 * can capture before hydration; static numbers also remove per-counter motion work.
 */
export default function AnimatedNumber({
  value,
  className,
}: {
  value: number;
  className?: string;
  duration?: number;
}) {
  const safeValue = Number.isFinite(value) ? Math.round(value) : 0;
  return <span className={className} aria-label={String(safeValue)}>{safeValue.toLocaleString()}</span>;
}
