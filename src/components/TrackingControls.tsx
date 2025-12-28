import { Play, Pause, Square, Save } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { cn } from '@/lib/utils';

interface TrackingControlsProps {
  isTracking: boolean;
  isPaused: boolean;
  hasPath: boolean;
  onStart: () => void;
  onPause: () => void;
  onResume: () => void;
  onStop: () => void;
  onSave: () => void;
}

const TrackingControls = ({
  isTracking,
  isPaused,
  hasPath,
  onStart,
  onPause,
  onResume,
  onStop,
  onSave,
}: TrackingControlsProps) => {
  return (
    <div className="flex items-center justify-center gap-3 p-4">
      {!isTracking && !hasPath && (
        <Button
          size="lg"
          onClick={onStart}
          className={cn(
            "btn-tracking h-16 w-16 rounded-full p-0",
            "bg-primary hover:bg-primary/90 text-primary-foreground"
          )}
        >
          <Play className="h-7 w-7 ml-1" />
        </Button>
      )}

      {isTracking && !isPaused && (
        <>
          <Button
            size="lg"
            onClick={onPause}
            className="h-14 w-14 rounded-full bg-secondary hover:bg-secondary/80 text-secondary-foreground"
          >
            <Pause className="h-6 w-6" />
          </Button>
          <Button
            size="lg"
            onClick={onStop}
            className="h-14 w-14 rounded-full bg-destructive hover:bg-destructive/90 text-destructive-foreground"
          >
            <Square className="h-5 w-5" />
          </Button>
        </>
      )}

      {isTracking && isPaused && (
        <>
          <Button
            size="lg"
            onClick={onResume}
            className={cn(
              "btn-tracking h-16 w-16 rounded-full p-0",
              "bg-primary hover:bg-primary/90 text-primary-foreground"
            )}
          >
            <Play className="h-7 w-7 ml-1" />
          </Button>
          <Button
            size="lg"
            onClick={onStop}
            className="h-14 w-14 rounded-full bg-destructive hover:bg-destructive/90 text-destructive-foreground"
          >
            <Square className="h-5 w-5" />
          </Button>
        </>
      )}

      {!isTracking && hasPath && (
        <>
          <Button
            size="lg"
            onClick={onSave}
            className={cn(
              "btn-accent h-14 px-6 rounded-full",
              "tracking-active"
            )}
          >
            <Save className="h-5 w-5 mr-2" />
            Save Route
          </Button>
          <Button
            size="lg"
            onClick={onStart}
            className="h-14 px-6 rounded-full bg-secondary hover:bg-secondary/80 text-secondary-foreground"
          >
            <Play className="h-5 w-5 mr-2" />
            New
          </Button>
        </>
      )}
    </div>
  );
};

export default TrackingControls;
