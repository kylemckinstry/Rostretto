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
  const padding = 60; // Extra space for labels
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
        const [x, y] = pointAt(i, radius + 28);
        const angle = angleFor(i);
        
        // Calculate alignment based on angle
        let align: 'start' | 'middle' | 'end' = 'middle';
        if (angle > -Math.PI / 4 && angle < Math.PI / 4) align = 'start'; // right
        else if (angle > 3 * Math.PI / 4 || angle < -3 * Math.PI / 4) align = 'end'; // left
        
        // Use a fixed vertical offset for all labels to ensure perfect alignment
        const dy = 0; // No vertical adjustments - all labels at same level
        
        const value = Math.round(values[i] || 0);
        return (
          <React.Fragment key={`t${i}`}>
            <SvgText
              x={x}
              y={y + dy}
              fontSize={13}
              fill={colours.text.primary}
              textAnchor={align as any}
              fontWeight="600"
              fontFamily="-apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif"
            >
              {label}
            </SvgText>
            <SvgText
              x={x}
              y={y + dy + 16}
              fontSize={11}
              fill={colours.text.secondary}
              textAnchor={align as any}
              fontWeight="400"
              fontFamily="-apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif"
            >
              {`${value}%`}
            </SvgText>
          </React.Fragment>
        );
      })}

      {/* center dot */}
      <Circle cx={cx} cy={cy} r={2} fill="#94A3B8" />
    </Svg>
  );
}
