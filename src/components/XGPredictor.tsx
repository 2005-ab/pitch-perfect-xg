import React, { useState, useMemo } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { FootballPitch } from './FootballPitch';
import { ParameterForm } from './ParameterForm';
import { toast } from 'sonner';

interface Player {
  id: string;
  type: 'goalkeeper' | 'shooter' | 'defender';
  x: number;
  y: number;
}

interface XGParameters {
  minute: number;
  second: number;
  team: string;
  player: string;
  playerRole: string;
  shotHeight: string;
  shotType: string;
  technique: string;
  bodyPart: string;
  firstTime: boolean;
  underPressure: boolean;
}

type SetupStep = 'goalkeeper' | 'shooter' | 'defender' | 'parameters' | 'complete';

export const XGPredictor: React.FC = () => {
  const [players, setPlayers] = useState<Player[]>([]);
  const [currentStep, setCurrentStep] = useState<SetupStep>('goalkeeper');
  const [parameters, setParameters] = useState<XGParameters>({
    minute: 45,
    second: 30,
    team: '',
    player: '',
    playerRole: '',
    shotHeight: '',
    shotType: '',
    technique: '',
    bodyPart: '',
    firstTime: false,
    underPressure: false,
  });
  const [predictedXG, setPredictedXG] = useState<number | null>(null);

  const goalkeeper = players.find(p => p.type === 'goalkeeper');
  const shooter = players.find(p => p.type === 'shooter');
  const defenders = players.filter(p => p.type === 'defender');

  // Calculate pitch metrics (pitch is 100x65 units, representing ~105x68m)
  const calculatedMetrics = useMemo(() => {
    if (!shooter) {
      return {
        distance: 0,
        angle: 0,
        defendersInFront: 0,
        nearestDefenderDist: 0,
        goalkeeperDist: 0,
      };
    }

    // Convert pitch coordinates to meters (approximate)
    const pitchWidth = 105; // meters
    const pitchHeight = 68; // meters
    
    const shooterX = (shooter.x / 100) * pitchWidth;
    const shooterY = (shooter.y / 65) * pitchHeight;
    const goalX = pitchWidth;
    const goalY = pitchHeight / 2;

    // Distance to goal center
    const distance = Math.sqrt(
      Math.pow(goalX - shooterX, 2) + Math.pow(goalY - shooterY, 2)
    );

    // Shooting angle (angle between shooter and goal posts)
    const goalPostTop = pitchHeight / 2 - 3.66; // 7.32m goal width
    const goalPostBottom = pitchHeight / 2 + 3.66;
    
    const angleTop = Math.atan2(goalPostTop - shooterY, goalX - shooterX);
    const angleBottom = Math.atan2(goalPostBottom - shooterY, goalX - shooterX);
    const angle = Math.abs(angleTop - angleBottom) * (180 / Math.PI);

    // Defenders in front (x coordinate greater than shooter's)
    const defendersInFront = defenders.filter(d => d.x > shooter.x).length;

    // Nearest defender distance
    let nearestDefenderDist = Infinity;
    defenders.forEach(defender => {
      const defX = (defender.x / 100) * pitchWidth;
      const defY = (defender.y / 65) * pitchHeight;
      const dist = Math.sqrt(
        Math.pow(defX - shooterX, 2) + Math.pow(defY - shooterY, 2)
      );
      if (dist < nearestDefenderDist) {
        nearestDefenderDist = dist;
      }
    });

    // Goalkeeper distance
    let goalkeeperDist = 0;
    if (goalkeeper) {
      const gkX = (goalkeeper.x / 100) * pitchWidth;
      const gkY = (goalkeeper.y / 65) * pitchHeight;
      goalkeeperDist = Math.sqrt(
        Math.pow(gkX - shooterX, 2) + Math.pow(gkY - shooterY, 2)
      );
    }

    return {
      distance: distance,
      angle: angle,
      defendersInFront: defendersInFront,
      nearestDefenderDist: nearestDefenderDist === Infinity ? 0 : nearestDefenderDist,
      goalkeeperDist: goalkeeperDist,
    };
  }, [shooter, defenders, goalkeeper]);

  const handlePlayerAdd = (player: Omit<Player, 'id'>) => {
    const newPlayer: Player = {
      ...player,
      id: `${player.type}-${Date.now()}`,
    };

    if (player.type === 'goalkeeper' && goalkeeper) {
      // Replace existing goalkeeper
      setPlayers(prev => prev.filter(p => p.type !== 'goalkeeper').concat(newPlayer));
    } else if (player.type === 'shooter' && shooter) {
      // Replace existing shooter
      setPlayers(prev => prev.filter(p => p.type !== 'shooter').concat(newPlayer));
    } else {
      setPlayers(prev => [...prev, newPlayer]);
    }

    // Auto-advance to next step
    if (player.type === 'goalkeeper' && currentStep === 'goalkeeper') {
      setCurrentStep('shooter');
      toast('Goalkeeper placed! Now place the shooter.');
    } else if (player.type === 'shooter' && currentStep === 'shooter') {
      setCurrentStep('defender');
      toast('Shooter placed! Add defenders or continue to parameters.');
    }
  };

  const handleParameterChange = (key: keyof XGParameters, value: any) => {
    setParameters(prev => ({ ...prev, [key]: value }));
  };

  const calculateXG = () => {
    // Simple xG calculation (in reality, you'd use your trained XGBoost model)
    const baseXG = Math.max(0.01, Math.min(0.95, 
      0.5 * (1 / (1 + calculatedMetrics.distance / 10)) * 
      (calculatedMetrics.angle / 30) * 
      (1 - calculatedMetrics.defendersInFront * 0.1) *
      (parameters.shotType === 'penalty' ? 2 : 1) *
      (parameters.underPressure ? 0.7 : 1) *
      (parameters.firstTime ? 0.8 : 1)
    ));

    setPredictedXG(baseXG);
    setCurrentStep('complete');
    toast(`xG calculated: ${(baseXG * 100).toFixed(1)}%`);
  };

  const reset = () => {
    setPlayers([]);
    setCurrentStep('goalkeeper');
    setPredictedXG(null);
    setParameters({
      minute: 45,
      second: 30,
      team: '',
      player: '',
      playerRole: '',
      shotHeight: '',
      shotType: '',
      technique: '',
      bodyPart: '',
      firstTime: false,
      underPressure: false,
    });
    toast('Scenario reset');
  };

  const getCurrentMode = (): 'goalkeeper' | 'shooter' | 'defender' | 'none' => {
    if (currentStep === 'goalkeeper') return 'goalkeeper';
    if (currentStep === 'shooter') return 'shooter';
    if (currentStep === 'defender') return 'defender';
    return 'none';
  };

  return (
    <div className="min-h-screen bg-background p-4">
      <div className="max-w-7xl mx-auto">
        <div className="mb-8 text-center">
          <h1 className="text-4xl font-bold text-foreground mb-2">
            Football xG Predictor
          </h1>
          <p className="text-muted-foreground">
            Machine Learning Expected Goals Calculator
          </p>
        </div>

        {/* Progress Steps */}
        <div className="flex justify-center mb-8">
          <div className="flex items-center space-x-4">
            {(['goalkeeper', 'shooter', 'defender', 'parameters', 'complete'] as SetupStep[]).map((step, index) => (
              <div key={step} className="flex items-center">
                <Badge 
                  variant={currentStep === step ? 'default' : 
                           index < (['goalkeeper', 'shooter', 'defender', 'parameters', 'complete'] as SetupStep[]).indexOf(currentStep) ? 'secondary' : 'outline'}
                  className="capitalize"
                >
                  {step === 'complete' ? 'Results' : step}
                </Badge>
                {index < 4 && <div className="w-8 h-px bg-border mx-2" />}
              </div>
            ))}
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Football Pitch */}
          <div className="lg:col-span-2">
            <Card>
              <CardHeader>
                <CardTitle>Football Pitch</CardTitle>
                <div className="flex justify-between items-center">
                  <div className="text-sm text-muted-foreground">
                    Players: {goalkeeper ? '1 GK' : '0 GK'}, {shooter ? '1 Shooter' : '0 Shooter'}, {defenders.length} Defenders
                  </div>
                  <Button variant="outline" size="sm" onClick={reset}>
                    Reset
                  </Button>
                </div>
              </CardHeader>
              <CardContent>
                <div className="aspect-[3/2] w-full">
                  <FootballPitch
                    players={players}
                    onPlayerAdd={handlePlayerAdd}
                    currentMode={getCurrentMode()}
                    shooterPosition={shooter ? { x: shooter.x, y: shooter.y } : undefined}
                  />
                </div>
                <div className="mt-4 flex justify-center space-x-4">
                  {currentStep === 'defender' && (
                    <Button 
                      onClick={() => setCurrentStep('parameters')}
                      disabled={!goalkeeper || !shooter}
                    >
                      Continue to Parameters
                    </Button>
                  )}
                  {currentStep === 'parameters' && (
                    <Button 
                      onClick={calculateXG}
                      disabled={!parameters.shotType || !parameters.bodyPart}
                      className="bg-gradient-to-r from-primary to-primary-glow"
                    >
                      Calculate xG
                    </Button>
                  )}
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Parameters and Results */}
          <div className="space-y-6">
            {currentStep === 'parameters' || currentStep === 'complete' ? (
              <ParameterForm
                parameters={parameters}
                onParameterChange={handleParameterChange}
                calculatedMetrics={calculatedMetrics}
              />
            ) : (
              <Card>
                <CardHeader>
                  <CardTitle>Setup Instructions</CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="space-y-3 text-sm">
                    <div className="flex items-center space-x-2">
                      <div className="w-3 h-3 rounded-full bg-goalkeeper"></div>
                      <span>1. Place goalkeeper first</span>
                    </div>
                    <div className="flex items-center space-x-2">
                      <div className="w-3 h-3 rounded-full bg-shooter"></div>
                      <span>2. Place shooter position</span>
                    </div>
                    <div className="flex items-center space-x-2">
                      <div className="w-3 h-3 rounded-full bg-defender"></div>
                      <span>3. Add defenders (optional)</span>
                    </div>
                    <div className="text-muted-foreground text-xs">
                      Defenders can only be placed in front of the shooter (closer to goal)
                    </div>
                  </div>
                </CardContent>
              </Card>
            )}

            {/* xG Result */}
            {predictedXG !== null && (
              <Card className="border-primary">
                <CardHeader>
                  <CardTitle className="text-center">Expected Goals (xG)</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="text-center">
                    <div className="text-6xl font-bold text-primary mb-2">
                      {(predictedXG * 100).toFixed(1)}%
                    </div>
                    <div className="text-muted-foreground">
                      Goal Probability
                    </div>
                  </div>
                </CardContent>
              </Card>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};
