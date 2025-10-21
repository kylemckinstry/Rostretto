import * as React from 'react';
import Svg, { Polygon, Line, Text as SvgText, Circle } from 'react-native-svg';
import { colours } from '../../theme/colours';

type Props = {
  size?: number;              // canvas size
  labels: string[];           // axis labels
  values: number[];           // 0–100 per axis
  gridSteps?: number;         // concentric rings
};

export default function Radar({
  size = 240,
  labels,
  values,
  gridSteps = 4,
}: Props) {
  const count = labels.length;
  const padding = 50; // Extra space for labels
  const svgSize = size + (padding * 2);
  const cx = svgSize / 2;
  const cy = svgSize / 2;
  const radius = (size * 0.35); // Radar chart radius

  const angleFor = (i: number) => (-Math.PI / 2) + (i * 2 * Math.PI) / count;

  const pointAt = (i: number, r: number) => {
    const a = angleFor(i);
    return [cx + r * Math.cos(a), cy + r * Math.sin(a)];
  };

  const gridPolys = Array.from({ length: gridSteps }, (_, k) => {
    const r = radius * ((k + 1) / gridSteps);
    return Array.from({ length: count }, (_, i) => pointAt(i, r)).map(p => p.join(',')).join(' ');
  });

  const dataPoly = values
    .map((v, i) => pointAt(i, radius * (Math.max(0, Math.min(100, v)) / 100)))
    .map(p => p.join(','))
    .join(' ');

  return (
    <Svg width={svgSize} height={svgSize}>
      {/* grid rings */}
      {gridPolys.map((pts, idx) => (
        <Polygon
          key={`g${idx}`}
          points={pts}
          stroke="#CBD5D1"
          strokeWidth={1}
          fill="none"
        />
      ))}
      {/* axes */}
      {labels.map((_, i) => {
        const [x, y] = pointAt(i, radius);
        return (
          <Line
            key={`a${i}`}
            x1={cx}
            y1={cy}
            x2={x}
            y2={y}
            stroke="#CBD5D1"
            strokeWidth={1}
          />
        );
      })}
      {/* filled area */}
      <Polygon points={dataPoly} fill="#EF4444" opacity={0.25} />
      <Polygon points={dataPoly} fill="none" stroke="#EF4444" strokeWidth={2} />

      {/* axis labels */}
      {labels.map((label, i) => {
        const [x, y] = pointAt(i, radius + 18);
        const align = x < cx - 10 ? 'end' : x > cx + 10 ? 'start' : 'middle';
        const dy = y < cy - 10 ? -6 : y > cy + 10 ? 16 : 5;
        return (
          <SvgText
            key={`t${i}`}
            x={x}
            y={y + dy}
            fontSize={12}
            fill={colours.text.primary}
            textAnchor={align as any}
            fontWeight="600"
            fontFamily="-apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif"
          >
            {label}
          </SvgText>
        );
      })}

      {/* center dot */}
      <Circle cx={cx} cy={cy} r={2} fill="#94A3B8" />
    </Svg>
  );
}
