'use client';

import React from 'react';
import { ComposableMap, Geographies, Geography, Marker, ZoomableGroup } from 'react-simple-maps';
import { scaleLinear } from 'd3-scale';

const geoUrl = "https://cdn.jsdelivr.net/npm/world-atlas@2/countries-110m.json";

interface MapPoint {
  lat: number;
  lon: number;
  label?: string;
  nodes?: any[]; // ClusterNode[]
}

interface WorldMapProps {
  points: MapPoint[];
  onPointClick?: (point: MapPoint) => void;
}

export default function WorldMap({ points, onPointClick }: WorldMapProps) {
  return (
    <div className="w-full h-[300px] bg-card rounded-lg border overflow-hidden relative cursor-grab active:cursor-grabbing">
      <ComposableMap
        projection="geoMercator"
        projectionConfig={{
          scale: 100,
          center: [0, 20]
        }}
        style={{
          width: "100%",
          height: "100%",
        }}
      >

        <ZoomableGroup center={[10, 20]} zoom={2.5} minZoom={1} maxZoom={50}>
          <Geographies geography={geoUrl}>
            {({ geographies }) =>
              geographies.map((geo) => (
                <Geography
                  key={geo.rsmKey}
                  geography={geo}
                  fill="var(--muted)"
                  stroke="var(--border)"
                  strokeWidth={0.5}
                  style={{
                    default: { outline: "none" },
                    hover: { outline: "none", fill: "var(--muted-foreground)" },
                    pressed: { outline: "none" },
                  }}
                />
              ))
            }
          </Geographies>
          {points.map((point, index) => (
            <Marker 
              key={index} 
              coordinates={[point.lon, point.lat]}
              onClick={() => onPointClick?.(point)}
              style={{
                default: { cursor: "pointer" },
                hover: { cursor: "pointer" },
                pressed: { cursor: "pointer" },
              }}
            >
              <circle r={4} fill="var(--primary)" className="animate-blink" />
              <circle r={2} fill="var(--primary)" />
            </Marker>
          ))}
        </ZoomableGroup>
      </ComposableMap>
      <div className="absolute bottom-2 right-2 text-xs text-muted-foreground bg-background/80 px-2 py-1 rounded">
        {points.length} Active Nodes
      </div>
    </div>
  );
}
