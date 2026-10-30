import "./arrow-icon.css";

const rotations = { right: 0, left: 180, down: 90, "down-right": 45, "up-right": -45 };

/** Decorative SVG: unlike Unicode arrows, this never switches to an emoji font. */
export function ArrowIcon({ direction = "right" }: { direction?: keyof typeof rotations }) {
  return (
    <svg className="ui-arrow" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true" focusable="false">
      <path d="M5 12h14m-6-6 6 6-6 6" transform={`rotate(${rotations[direction]} 12 12)`} />
    </svg>
  );
}
