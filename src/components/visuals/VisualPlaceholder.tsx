/** Lightweight, scene-specific HTML placeholder shown only while a WebGL scene loads. */
export type VisualPlaceholderKind =
  | "abstract"
  | "planet"
  | "constellation"
  | "rings"
  | "helix"
  | "workflow"
  | "knowledge"
  | "beacon"
  | "metrics"
  | "team"
  | "faq"
  | "project";

export default function VisualPlaceholder({
  kind = "abstract",
}: {
  kind?: VisualPlaceholderKind;
}) {
  const nodes = (count: number, prefix = "node") =>
    Array.from({ length: count }, (_, index) => (
      <i key={`${prefix}-${index}`} className={`vp-node vp-node-${index + 1}`} />
    ));

  if (kind === "planet") {
    return (
      <div className={`visual-placeholder visual-placeholder--${kind}`} aria-hidden="true">
        <i className="vp-orbit vp-orbit-a" />
        <i className="vp-orbit vp-orbit-b" />
        <i className="vp-core" />
        <i className="vp-moon" />
      </div>
    );
  }

  if (kind === "project") {
    return (
      <div className={`visual-placeholder visual-placeholder--${kind}`} aria-hidden="true">
        <i className="vp-panel vp-panel-a"><b /><b /><b /></i>
        <i className="vp-panel vp-panel-b"><b /><b /><b /></i>
        <i className="vp-panel vp-panel-c"><b /><b /><b /></i>
        <i className="vp-orbit vp-orbit-a" />
      </div>
    );
  }

  if (kind === "metrics") {
    return (
      <div className={`visual-placeholder visual-placeholder--${kind}`} aria-hidden="true">
        {Array.from({ length: 7 }, (_, i) => <i key={i} className="vp-bar" />)}
        <i className="vp-baseline" />
      </div>
    );
  }

  if (kind === "beacon") {
    return (
      <div className={`visual-placeholder visual-placeholder--${kind}`} aria-hidden="true">
        <i className="vp-wave vp-wave-a" /><i className="vp-wave vp-wave-b" /><i className="vp-wave vp-wave-c" />
        <i className="vp-core" />
      </div>
    );
  }

  if (kind === "faq") {
    return (
      <div className={`visual-placeholder visual-placeholder--${kind}`} aria-hidden="true">
        <i className="vp-bubble vp-bubble-a"><b /></i>
        <i className="vp-bubble vp-bubble-b"><b /></i>
        <i className="vp-bubble vp-bubble-c"><b /></i>
      </div>
    );
  }

  if (kind === "helix") {
    return (
      <div className={`visual-placeholder visual-placeholder--${kind}`} aria-hidden="true">
        <i className="vp-helix-line vp-helix-line-a" /><i className="vp-helix-line vp-helix-line-b" />
        {nodes(8, "helix")}
      </div>
    );
  }

  if (kind === "workflow") {
    return (
      <div className={`visual-placeholder visual-placeholder--${kind}`} aria-hidden="true">
        <i className="vp-orbit vp-orbit-a" />
        <i className="vp-core" />
        {nodes(6)}
        <i className="vp-token" />
      </div>
    );
  }

  if (kind === "knowledge") {
    return (
      <div className={`visual-placeholder visual-placeholder--${kind}`} aria-hidden="true">
        <i className="vp-link vp-link-a" /><i className="vp-link vp-link-b" /><i className="vp-link vp-link-c" />
        <i className="vp-fragment vp-fragment-a" /><i className="vp-fragment vp-fragment-b" /><i className="vp-fragment vp-fragment-c" />
        {nodes(3)}
      </div>
    );
  }

  if (kind === "team") {
    return (
      <div className={`visual-placeholder visual-placeholder--${kind}`} aria-hidden="true">
        <i className="vp-orbit vp-orbit-a" /><i className="vp-orbit vp-orbit-b" /><i className="vp-core" />{nodes(5)}
      </div>
    );
  }

  if (kind === "rings") {
    return (
      <div className={`visual-placeholder visual-placeholder--${kind}`} aria-hidden="true">
        <i className="vp-orbit vp-orbit-a" /><i className="vp-orbit vp-orbit-b" /><i className="vp-orbit vp-orbit-c" />
        <i className="vp-core" />{nodes(3)}
      </div>
    );
  }

  if (kind === "constellation") {
    return (
      <div className={`visual-placeholder visual-placeholder--${kind}`} aria-hidden="true">
        <i className="vp-link vp-link-a" /><i className="vp-link vp-link-b" /><i className="vp-link vp-link-c" />
        <i className="vp-core" />{nodes(6)}
      </div>
    );
  }

  return (
    <div className={`visual-placeholder visual-placeholder--${kind}`} aria-hidden="true">
      <i className="vp-orbit vp-orbit-a" /><i className="vp-orbit vp-orbit-b" /><i className="vp-core" />
    </div>
  );
}
