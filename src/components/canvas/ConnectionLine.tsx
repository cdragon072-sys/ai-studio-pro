interface Props {
  from: { x: number; y: number };
  to: { x: number; y: number };
  dashed?: boolean;
}

export default function ConnectionLine({ from, to, dashed }: Props) {
  const dx = to.x - from.x;
  const cpOffset = Math.max(Math.abs(dx) * 0.5, 60);

  const d = `M ${from.x} ${from.y} C ${from.x + cpOffset} ${from.y}, ${to.x - cpOffset} ${to.y}, ${to.x} ${to.y}`;

  return (
    <path
      d={d}
      fill="none"
      stroke={dashed ? 'rgba(139, 92, 246, 0.5)' : 'rgba(255, 255, 255, 0.2)'}
      strokeWidth={dashed ? 1.5 : 2}
      strokeDasharray={dashed ? '6 4' : undefined}
    />
  );
}
