import React, { useState, useRef } from 'react';
import { cn } from '@/lib/utils';

interface Player {
  id: string;
  type: 'goalkeeper' | 'shooter' | 'defender';
  x: number;
  y: number;
}

interface FootballPitchProps {
  players: Player[];
  onPlayerAdd: (player: Omit<Player, 'id'>) => void;
  currentMode: 'goalkeeper' | 'shooter' | 'defender' | 'none';
  shooterPosition?: { x: number; y: number };
}

export const FootballPitch: React.FC<FootballPitchProps> = ({
  players,
  onPlayerAdd,
  currentMode,
  shooterPosition,
}) => {
  const pitchRef = useRef<SVGSVGElement>(null);

  const handlePitchClick = (event: React.MouseEvent<SVGSVGElement>) => {
    if (currentMode === 'none') return;

    const rect = pitchRef.current?.getBoundingClientRect();
    if (!rect) return;

    const x = ((event.clientX - rect.left) / rect.width) * 100;
    const y = ((event.clientY - rect.top) / rect.height) * 100;

    // For defenders, only allow placement in front of shooter (closer to goal)
    if (currentMode === 'defender' && shooterPosition) {
      if (x <= shooterPosition.x) {
        return; // Don't allow defenders behind shooter
      }
    }

    onPlayerAdd({ type: currentMode, x, y });
  };

  const getPlayerColor = (type: Player['type']) => {
    switch (type) {
      case 'goalkeeper':
        return 'fill-goalkeeper';
      case 'shooter':
        return 'fill-shooter';
      case 'defender':
        return 'fill-defender';
      default:
        return 'fill-primary';
    }
  };

  return (
    <div className="relative bg-gradient-to-br from-pitch to-pitch-penalty rounded-lg shadow-[--shadow-pitch] overflow-hidden">
      <svg
        ref={pitchRef}
        viewBox="0 0 100 65"
        className="w-full h-full cursor-crosshair"
        onClick={handlePitchClick}
      >
        {/* Pitch background */}
        <rect width="100" height="65" className="fill-pitch" />
        
        {/* Pitch markings */}
        <g className="stroke-pitch-lines stroke-[0.2] fill-none">
          {/* Outer boundary */}
          <rect x="1" y="1" width="98" height="63" />
          
          {/* Center line */}
          <line x1="50" y1="1" x2="50" y2="64" />
          
          {/* Center circle */}
          <circle cx="50" cy="32.5" r="8" />
          <circle cx="50" cy="32.5" r="0.5" className="fill-pitch-lines" />
          
          {/* Left penalty area */}
          <rect x="1" y="19.5" width="16" height="26" />
          <rect x="1" y="25" width="5.5" height="15" />
          
          {/* Right penalty area */}
          <rect x="83" y="19.5" width="16" height="26" />
          <rect x="94.5" y="25" width="5.5" height="15" />
          
          {/* Left goal */}
          <rect x="0" y="28.5" width="1" height="8" className="stroke-[0.3]" />
          
          {/* Right goal */}
          <rect x="99" y="28.5" width="1" height="8" className="stroke-[0.3]" />
          
          {/* Penalty spots */}
          <circle cx="11" cy="32.5" r="0.3" className="fill-pitch-lines" />
          <circle cx="89" cy="32.5" r="0.3" className="fill-pitch-lines" />
          
          {/* Penalty arcs */}
          <path d="M 17 22.5 A 8 8 0 0 1 17 42.5" />
          <path d="M 83 22.5 A 8 8 0 0 0 83 42.5" />
        </g>
        
        {/* Players */}
        {players.map((player) => (
          <g key={player.id}>
            <circle
              cx={player.x}
              cy={player.y}
              r="1.5"
              className={cn(
                getPlayerColor(player.type),
                'stroke-white stroke-[0.3] drop-shadow-sm'
              )}
            />
            <text
              x={player.x}
              y={player.y + 0.5}
              textAnchor="middle"
              className="fill-white text-[1.5px] font-bold pointer-events-none select-none"
            >
              {player.type === 'goalkeeper' ? 'GK' : player.type === 'shooter' ? 'S' : 'D'}
            </text>
          </g>
        ))}
        
        {/* Shot line from shooter to goal */}
        {shooterPosition && (
          <line
            x1={shooterPosition.x}
            y1={shooterPosition.y}
            x2="99.5"
            y2="32.5"
            className="stroke-shooter stroke-[0.3] opacity-50 stroke-dasharray-2"
          />
        )}
      </svg>
      
      {/* Instructions overlay */}
      {currentMode !== 'none' && (
        <div className="absolute top-4 left-4 bg-black/80 text-white px-3 py-2 rounded-md text-sm">
          {currentMode === 'goalkeeper' && 'Click to place goalkeeper'}
          {currentMode === 'shooter' && 'Click to place shooter'}
          {currentMode === 'defender' && 'Click to place defenders (only in front of shooter)'}
        </div>
      )}
    </div>
  );
};