import React, { useEffect, useRef } from 'react';
import Phaser from 'phaser';
import { MainScene } from '../game/scenes/MainScene';
import { TitleScene } from '../game/scenes/TitleScene';
import { HUD } from './HUD';
import { cn } from '@/lib/utils';

type GameCanvasProps = {
  className?: string;
  characterId?: string;
};

export const GameCanvas: React.FC<GameCanvasProps> = ({ className, characterId = 'designer' }) => {
  const gameContainerRef = useRef<HTMLDivElement>(null);
  const gameInstanceRef = useRef<Phaser.Game | null>(null);
  const [health, setHealth] = React.useState(100);
  const [inspiration, setInspiration] = React.useState(100);
  const [feedbackState, setFeedbackState] = React.useState<'neutral' | 'positive' | 'negative'>('neutral');
  const [level, setLevel] = React.useState({
    name: 'Blank Canvas',
    description: 'The intimidating beginning of any creative project',
    number: 1
  });

  // Initialize game
  useEffect(() => {
    if (gameContainerRef.current && !gameInstanceRef.current) {
      const mainScene = new MainScene({
        onHealthChange: setHealth,
        onInspirationChange: setInspiration,
        onFeedbackChange: setFeedbackState,
        onLevelChange: setLevel,
        characterId
      });

      const config: Phaser.Types.Core.GameConfig = {
        type: Phaser.AUTO,
        width: 800,
        height: 600,
        parent: gameContainerRef.current,
        physics: {
          default: 'arcade',
          arcade: {
            gravity: { y: 300 },
            debug: true
          }
        },
        scene: [TitleScene, mainScene],
        render: {
          pixelArt: true, // Enable pixel art mode for sharper retro graphics
          antialias: false, // Disable antialiasing for pixel art
          roundPixels: true // Better for pixel art rendering
        },
        backgroundColor: '#111111',
        scale: {
          mode: Phaser.Scale.RESIZE,
          autoCenter: Phaser.Scale.CENTER_BOTH
        }
      };

      gameInstanceRef.current = new Phaser.Game(config);

      // Setup window resizing
      const handleResize = () => {
        if (gameInstanceRef.current) {
          const parent = gameContainerRef.current;
          if (parent) {
            const width = parent.clientWidth;
            const height = parent.clientHeight;
            gameInstanceRef.current.scale.resize(width, height);
          }
        }
      };

      window.addEventListener('resize', handleResize);
      handleResize();

      return () => {
        window.removeEventListener('resize', handleResize);
        gameInstanceRef.current?.destroy(true);
        gameInstanceRef.current = null;
      };
    }
  }, [characterId]);

  return (
    <div className={cn("relative w-full h-full overflow-hidden", className)}>
      <div 
        ref={gameContainerRef} 
        className="w-full h-full"
      />
      <HUD
        health={health}
        inspiration={inspiration}
        characterName={characterId}
        feedbackState={feedbackState}
        level={level}
      />
    </div>
  );
};
