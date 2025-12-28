import { useState } from 'react';
import { Bell, Plus, MapPin, Check, Trash2, X } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { toast } from 'sonner';
import BottomNav from '@/components/BottomNav';
import { useReminders } from '@/hooks/useReminders';
import { useGeolocation } from '@/hooks/useGeolocation';
import { Reminder } from '@/types/reminder';

const categoryColors: Record<string, string> = {
  visit: 'hsl(175, 85%, 50%)',
  avoid: 'hsl(0, 75%, 55%)',
  note: 'hsl(45, 85%, 55%)',
  custom: 'hsl(280, 85%, 60%)',
};

const categoryLabels: Record<string, string> = {
  visit: '📍 Visit',
  avoid: '⚠️ Avoid',
  note: '📝 Note',
  custom: '✨ Custom',
};

const Reminders = () => {
  const { currentPosition } = useGeolocation();
  const { reminders, addReminder, deleteReminder, toggleComplete } = useReminders();
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [newReminder, setNewReminder] = useState({
    title: '',
    description: '',
    category: 'visit' as Reminder['category'],
    triggerRadius: 100,
    useCurrentLocation: true,
    manualLat: '',
    manualLng: '',
  });

  const handleAddReminder = () => {
    if (!newReminder.title.trim()) {
      toast.error('Please enter a title');
      return;
    }

    let location = { lat: 0, lng: 0 };
    
    if (newReminder.useCurrentLocation) {
      if (!currentPosition) {
        toast.error('Location not available');
        return;
      }
      location = { lat: currentPosition.lat, lng: currentPosition.lng };
    } else {
      const lat = parseFloat(newReminder.manualLat);
      const lng = parseFloat(newReminder.manualLng);
      if (isNaN(lat) || isNaN(lng)) {
        toast.error('Invalid coordinates');
        return;
      }
      location = { lat, lng };
    }

    addReminder({
      title: newReminder.title,
      description: newReminder.description,
      location: { ...location, name: newReminder.title },
      category: newReminder.category,
      triggerRadius: newReminder.triggerRadius,
    });

    toast.success('Reminder added!');
    setIsDialogOpen(false);
    setNewReminder({
      title: '',
      description: '',
      category: 'visit',
      triggerRadius: 100,
      useCurrentLocation: true,
      manualLat: '',
      manualLng: '',
    });
  };

  const activeReminders = reminders.filter(r => !r.isCompleted);
  const completedReminders = reminders.filter(r => r.isCompleted);

  return (
    <div className="h-screen w-screen flex flex-col overflow-hidden bg-background pb-20">
      {/* Header */}
      <header className="flex items-center justify-between px-4 py-4 bg-card/90 backdrop-blur-sm border-b border-border">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-accent to-primary flex items-center justify-center">
            <Bell className="w-5 h-5 text-accent-foreground" />
          </div>
          <div>
            <h1 className="font-display font-bold text-lg neon-text">Reminders</h1>
            <p className="text-xs text-muted-foreground">
              {activeReminders.length} active reminder{activeReminders.length !== 1 ? 's' : ''}
            </p>
          </div>
        </div>

        <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
          <DialogTrigger asChild>
            <Button size="sm" className="gap-2 btn-tracking">
              <Plus className="w-4 h-4" />
              Add
            </Button>
          </DialogTrigger>
          <DialogContent className="bg-card border-border">
            <DialogHeader>
              <DialogTitle className="font-display">New Reminder</DialogTitle>
            </DialogHeader>
            
            <div className="space-y-4 mt-4">
              <div>
                <label className="text-sm font-medium text-muted-foreground">Title</label>
                <Input
                  placeholder="e.g., Pick up groceries"
                  value={newReminder.title}
                  onChange={(e) => setNewReminder(prev => ({ ...prev, title: e.target.value }))}
                  className="mt-1 bg-muted border-border"
                />
              </div>

              <div>
                <label className="text-sm font-medium text-muted-foreground">Description (optional)</label>
                <Textarea
                  placeholder="Add notes..."
                  value={newReminder.description}
                  onChange={(e) => setNewReminder(prev => ({ ...prev, description: e.target.value }))}
                  className="mt-1 bg-muted border-border"
                  rows={2}
                />
              </div>

              <div>
                <label className="text-sm font-medium text-muted-foreground">Category</label>
                <Select
                  value={newReminder.category}
                  onValueChange={(value) => setNewReminder(prev => ({ ...prev, category: value as Reminder['category'] }))}
                >
                  <SelectTrigger className="mt-1 bg-muted border-border">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    {Object.entries(categoryLabels).map(([key, label]) => (
                      <SelectItem key={key} value={key}>{label}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              <div>
                <label className="text-sm font-medium text-muted-foreground">Trigger Radius (meters)</label>
                <Input
                  type="number"
                  value={newReminder.triggerRadius}
                  onChange={(e) => setNewReminder(prev => ({ ...prev, triggerRadius: parseInt(e.target.value) || 100 }))}
                  className="mt-1 bg-muted border-border"
                  min={10}
                  max={5000}
                />
              </div>

              <div className="space-y-2">
                <label className="text-sm font-medium text-muted-foreground">Location</label>
                <div className="flex gap-2">
                  <Button
                    type="button"
                    variant={newReminder.useCurrentLocation ? 'default' : 'outline'}
                    size="sm"
                    onClick={() => setNewReminder(prev => ({ ...prev, useCurrentLocation: true }))}
                    className="flex-1"
                  >
                    <MapPin className="w-4 h-4 mr-1" />
                    Current
                  </Button>
                  <Button
                    type="button"
                    variant={!newReminder.useCurrentLocation ? 'default' : 'outline'}
                    size="sm"
                    onClick={() => setNewReminder(prev => ({ ...prev, useCurrentLocation: false }))}
                    className="flex-1"
                  >
                    Manual
                  </Button>
                </div>

                {!newReminder.useCurrentLocation && (
                  <div className="grid grid-cols-2 gap-2 mt-2">
                    <Input
                      placeholder="Latitude"
                      value={newReminder.manualLat}
                      onChange={(e) => setNewReminder(prev => ({ ...prev, manualLat: e.target.value }))}
                      className="bg-muted border-border"
                    />
                    <Input
                      placeholder="Longitude"
                      value={newReminder.manualLng}
                      onChange={(e) => setNewReminder(prev => ({ ...prev, manualLng: e.target.value }))}
                      className="bg-muted border-border"
                    />
                  </div>
                )}
              </div>

              <Button onClick={handleAddReminder} className="w-full btn-tracking">
                Create Reminder
              </Button>
            </div>
          </DialogContent>
        </Dialog>
      </header>

      <ScrollArea className="flex-1">
        <div className="p-4 space-y-6">
          {/* Active Reminders */}
          <section>
            <h2 className="font-display font-semibold text-sm text-muted-foreground mb-3">Active</h2>
            {activeReminders.length === 0 ? (
              <div className="text-center py-8 text-muted-foreground card-glass rounded-xl">
                <Bell className="w-10 h-10 mx-auto mb-3 opacity-50" />
                <p className="text-sm">No active reminders</p>
                <p className="text-xs mt-1">Tap + to add one</p>
              </div>
            ) : (
              <div className="space-y-3">
                {activeReminders.map((reminder) => (
                  <ReminderCard
                    key={reminder.id}
                    reminder={reminder}
                    onToggle={() => toggleComplete(reminder.id)}
                    onDelete={() => deleteReminder(reminder.id)}
                  />
                ))}
              </div>
            )}
          </section>

          {/* Completed Reminders */}
          {completedReminders.length > 0 && (
            <section>
              <h2 className="font-display font-semibold text-sm text-muted-foreground mb-3">Completed</h2>
              <div className="space-y-3 opacity-60">
                {completedReminders.map((reminder) => (
                  <ReminderCard
                    key={reminder.id}
                    reminder={reminder}
                    onToggle={() => toggleComplete(reminder.id)}
                    onDelete={() => deleteReminder(reminder.id)}
                  />
                ))}
              </div>
            </section>
          )}
        </div>
      </ScrollArea>

      <BottomNav />
    </div>
  );
};

interface ReminderCardProps {
  reminder: Reminder;
  onToggle: () => void;
  onDelete: () => void;
}

const ReminderCard = ({ reminder, onToggle, onDelete }: ReminderCardProps) => {
  const color = categoryColors[reminder.category] || categoryColors.custom;
  
  return (
    <div className="card-glass rounded-xl p-4">
      <div className="flex items-start gap-3">
        <button
          onClick={onToggle}
          className={`w-6 h-6 rounded-full border-2 flex items-center justify-center flex-shrink-0 transition-all ${
            reminder.isCompleted
              ? 'bg-primary border-primary'
              : 'border-muted-foreground hover:border-primary'
          }`}
        >
          {reminder.isCompleted && <Check className="w-4 h-4 text-primary-foreground" />}
        </button>
        
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2">
            <h3 className={`font-semibold ${reminder.isCompleted ? 'line-through text-muted-foreground' : ''}`}>
              {reminder.title}
            </h3>
            <span
              className="text-xs px-2 py-0.5 rounded-full"
              style={{ backgroundColor: color + '22', color }}
            >
              {categoryLabels[reminder.category]}
            </span>
          </div>
          
          {reminder.description && (
            <p className="text-sm text-muted-foreground mt-1">{reminder.description}</p>
          )}
          
          <div className="flex items-center gap-2 mt-2 text-xs text-muted-foreground">
            <MapPin className="w-3 h-3" />
            <span>
              {reminder.location.lat.toFixed(4)}, {reminder.location.lng.toFixed(4)}
            </span>
            <span>•</span>
            <span>{reminder.triggerRadius}m radius</span>
          </div>
        </div>
        
        <Button
          size="sm"
          variant="ghost"
          className="h-8 w-8 p-0 text-muted-foreground hover:text-destructive"
          onClick={(e) => {
            e.stopPropagation();
            onDelete();
          }}
        >
          <Trash2 className="h-4 w-4" />
        </Button>
      </div>
    </div>
  );
};

export default Reminders;
