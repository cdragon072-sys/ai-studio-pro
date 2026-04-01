interface Props {
  from: { x: number; y: number };
  to: { x: number; y: number };
  dashed?: boolean;
  dataType?: 'text' | 'image' | 'video' | 'mixed';
}

const COLORS: Record<string, string> = {
  text: 'rgba(96, 165, 250, 0.6)',     // Blue for text
  image: 'rgba(168, 85, 247, 0.6)',    // Purple for image
  video: 'rgba(249, 115, 22, 0.6)',    // Orange for video
  mixed: 'rgba(255, 255, 255, 0.25)',  // White for generic
  default: 'rgba(255, 255, 255, 0.2)',
};

export default function ConnectionLine({ from, to, dashed, dataType }: Props) {
  const dx = to.x - from.x;
  const cpOffset = Math.max(Math.abs(dx) * 0.5, 60);

  const d = `M ${from.x} ${from.y} C ${from.x + cpOffset} ${from.y}, ${to.x - cpOffset} ${to.y}, ${to.x} ${to.y}`;

  const color = dashed 
    ? 'rgba(139, 92, 246, 0.5)'
    : COLORS[dataType || 'default'];

  return (
    <>
      {/* Glow effect for established connections */}
      {!dashed && (
        <path
          d={d}
          fill="none"
          stroke={color}
          strokeWidth={6}
          strokeOpacity={0.15}
        />
      )}
      {/* Main line */}
      <path
        d={d}
        fill="none"
        stroke={color}
        strokeWidth={dashed ? 1.5 : 2}
        strokeDasharray={dashed ? '6 4' : undefined}
        strokeLinecap="round"
      />
      {/* Animated flow dots for active connections */}
      {!dashed && (
        <circle r="3" fill={color}>
          <animateMotion dur="3s" repeatCount="indefinite" path={d} />
        </circle>
      )}
    </>
  );
}
