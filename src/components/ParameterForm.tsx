import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Label } from '@/components/ui/label';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Checkbox } from '@/components/ui/checkbox';

interface XGParameters {
  minute: number;
  playerRole: string;
  shotHeight: string;
  shotType: string;
  technique: string;
  bodyPart: string;
  firstTime: boolean;
  underPressure: boolean;
}

interface ParameterFormProps {
  parameters: XGParameters;
  onParameterChange: (key: keyof XGParameters, value: any) => void;
  calculatedMetrics: {
    distance: number;
    angle: number;
    defendersInFront: number;
    nearestDefenderDist: number;
    goalkeeperDist: number;
  };
}

export const ParameterForm: React.FC<ParameterFormProps> = ({
  parameters,
  onParameterChange,
  calculatedMetrics,
}) => {
  return (
    <div className="space-y-6">
      {/* Match Information */}
      <Card>
        <CardHeader>
          <CardTitle>Match Information</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div>
            <Label htmlFor="minute">Minute</Label>
            <Input
              id="minute"
              type="number"
              min="0"
              max="120"
              value={parameters.minute}
              onChange={(e) => onParameterChange('minute', parseInt(e.target.value) || 0)}
            />
          </div>
          <div>
            <Label htmlFor="playerRole">Player Role</Label>
            <Select onValueChange={(value) => onParameterChange('playerRole', value)}>
              <SelectTrigger>
                <SelectValue placeholder="Select player role" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="striker">Striker</SelectItem>
                <SelectItem value="midfielder">Midfielder</SelectItem>
                <SelectItem value="defender">Defender</SelectItem>
                <SelectItem value="winger">Winger</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </CardContent>
      </Card>

      {/* Shot Characteristics */}
      <Card>
        <CardHeader>
          <CardTitle>Shot Characteristics</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div>
            <Label htmlFor="shotHeight">Shot Height</Label>
            <Select onValueChange={(value) => onParameterChange('shotHeight', value)}>
              <SelectTrigger>
                <SelectValue placeholder="Select shot height" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="ground">Ground</SelectItem>
                <SelectItem value="low">Low</SelectItem>
                <SelectItem value="high">High</SelectItem>
              </SelectContent>
            </Select>
          </div>
          <div>
            <Label htmlFor="shotType">Shot Type</Label>
            <Select onValueChange={(value) => onParameterChange('shotType', value)}>
              <SelectTrigger>
                <SelectValue placeholder="Select shot type" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="open_play">Open Play</SelectItem>
                <SelectItem value="free_kick">Free Kick</SelectItem>
                <SelectItem value="penalty">Penalty</SelectItem>
                <SelectItem value="corner">Corner</SelectItem>
                <SelectItem value="throw_in">Throw In</SelectItem>
              </SelectContent>
            </Select>
          </div>
          <div>
            <Label htmlFor="technique">Technique</Label>
            <Select onValueChange={(value) => onParameterChange('technique', value)}>
              <SelectTrigger>
                <SelectValue placeholder="Select technique" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="normal">Normal</SelectItem>
                <SelectItem value="volley">Volley</SelectItem>
                <SelectItem value="half_volley">Half Volley</SelectItem>
                <SelectItem value="diving_header">Diving Header</SelectItem>
                <SelectItem value="overhead_kick">Overhead Kick</SelectItem>
              </SelectContent>
            </Select>
          </div>
          <div>
            <Label htmlFor="bodyPart">Body Part</Label>
            <Select onValueChange={(value) => onParameterChange('bodyPart', value)}>
              <SelectTrigger>
                <SelectValue placeholder="Select body part" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="left_foot">Left Foot</SelectItem>
                <SelectItem value="right_foot">Right Foot</SelectItem>
                <SelectItem value="head">Head</SelectItem>
                <SelectItem value="other">Other</SelectItem>
              </SelectContent>
            </Select>
          </div>
          <div className="space-y-3">
            <div className="flex items-center space-x-2">
              <Checkbox
                id="firstTime"
                checked={parameters.firstTime}
                onCheckedChange={(checked) => onParameterChange('firstTime', checked)}
              />
              <Label htmlFor="firstTime">First Time Shot</Label>
            </div>
            <div className="flex items-center space-x-2">
              <Checkbox
                id="underPressure"
                checked={parameters.underPressure}
                onCheckedChange={(checked) => onParameterChange('underPressure', checked)}
              />
              <Label htmlFor="underPressure">Under Pressure</Label>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Calculated Metrics */}
      <Card>
        <CardHeader>
          <CardTitle>Calculated Metrics</CardTitle>
        </CardHeader>
        <CardContent className="space-y-3">
          <div className="grid grid-cols-2 gap-4 text-sm">
            <div className="flex justify-between">
              <span className="text-muted-foreground">Distance to Goal:</span>
              <span className="font-medium">{calculatedMetrics.distance.toFixed(1)}m</span>
            </div>
            <div className="flex justify-between">
              <span className="text-muted-foreground">Shooting Angle:</span>
              <span className="font-medium">{calculatedMetrics.angle.toFixed(1)}°</span>
            </div>
            <div className="flex justify-between">
              <span className="text-muted-foreground">Defenders in Front:</span>
              <span className="font-medium">{calculatedMetrics.defendersInFront}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-muted-foreground">Nearest Defender:</span>
              <span className="font-medium">{calculatedMetrics.nearestDefenderDist.toFixed(1)}m</span>
            </div>
            <div className="flex justify-between">
              <span className="text-muted-foreground">Goalkeeper Distance:</span>
              <span className="font-medium">{calculatedMetrics.goalkeeperDist.toFixed(1)}m</span>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};