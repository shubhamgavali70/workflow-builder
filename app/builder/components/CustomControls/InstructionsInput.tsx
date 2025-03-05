// app/builder/components/CustomControls/InstructionsInput.tsx
import { useState } from 'react';
import { Label } from '@/components/ui/label';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { 
  Plus, 
  Trash2, 
  ChevronUp, 
  ChevronDown, 
  Edit 
} from 'lucide-react';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
  DialogFooter,
  DialogClose,
} from '@/components/ui/dialog';
import { Textarea } from '@/components/ui/textarea';

interface InstructionsInputProps {
  instructions: string[];
  onChange: (instructions: string[]) => void;
}

export default function InstructionsInput({ instructions, onChange }: InstructionsInputProps) {
  const [newInstruction, setNewInstruction] = useState('');
  const [editIndex, setEditIndex] = useState<number | null>(null);
  const [editValue, setEditValue] = useState('');

  const addInstruction = () => {
    if (newInstruction.trim()) {
      onChange([...instructions, newInstruction.trim()]);
      setNewInstruction('');
    }
  };

  const removeInstruction = (index: number) => {
    const updated = [...instructions];
    updated.splice(index, 1);
    onChange(updated);
  };

  const moveInstruction = (index: number, direction: 'up' | 'down') => {
    if (
      (direction === 'up' && index === 0) ||
      (direction === 'down' && index === instructions.length - 1)
    ) {
      return;
    }

    const updated = [...instructions];
    const newIndex = direction === 'up' ? index - 1 : index + 1;
    [updated[index], updated[newIndex]] = [updated[newIndex], updated[index]];
    onChange(updated);
  };

  const startEdit = (index: number) => {
    setEditIndex(index);
    setEditValue(instructions[index]);
  };

  const saveEdit = () => {
    if (editIndex !== null && editValue.trim()) {
      const updated = [...instructions];
      updated[editIndex] = editValue.trim();
      onChange(updated);
      setEditIndex(null);
      setEditValue('');
    }
  };

  return (
    <div className="space-y-2">
      <Label>Instructions</Label>

      <div className="space-y-2">
        {instructions.length > 0 ? (
          <div className="space-y-2 max-h-60 overflow-y-auto border rounded-md p-2">
            {instructions.map((instruction, index) => (
              <div
                key={index}
                className="flex items-start space-x-2 text-sm p-2 border rounded bg-muted/30 hover:bg-muted/50"
              >
                <div className="flex-1 break-words">{instruction}</div>
                <div className="flex items-center space-x-1">
                  <Button
                    size="icon"
                    variant="ghost"
                    onClick={() => moveInstruction(index, 'up')}
                    disabled={index === 0}
                    className="h-6 w-6"
                  >
                    <ChevronUp size={14} />
                  </Button>
                  <Button
                    size="icon"
                    variant="ghost"
                    onClick={() => moveInstruction(index, 'down')}
                    disabled={index === instructions.length - 1}
                    className="h-6 w-6"
                  >
                    <ChevronDown size={14} />
                  </Button>
                  <Dialog>
                    <DialogTrigger asChild>
                      <Button
                        size="icon"
                        variant="ghost"
                        onClick={() => startEdit(index)}
                        className="h-6 w-6"
                      >
                        <Edit size={14} />
                      </Button>
                    </DialogTrigger>
                    <DialogContent>
                      <DialogHeader>
                        <DialogTitle>Edit Instruction</DialogTitle>
                      </DialogHeader>
                      <Textarea
                        value={editValue}
                        onChange={(e) => setEditValue(e.target.value)}
                        className="min-h-[100px]"
                      />
                      <DialogFooter className="mt-4">
                        <DialogClose asChild>
                          <Button variant="secondary">Cancel</Button>
                        </DialogClose>
                        <DialogClose asChild>
                          <Button onClick={saveEdit}>Save</Button>
                        </DialogClose>
                      </DialogFooter>
                    </DialogContent>
                  </Dialog>
                  <Button
                    size="icon"
                    variant="ghost"
                    onClick={() => removeInstruction(index)}
                    className="h-6 w-6 text-destructive"
                  >
                    <Trash2 size={14} />
                  </Button>
                </div>
              </div>
            ))}
          </div>
        ) : (
          <div className="text-sm text-muted-foreground p-2 border rounded-md">
            No instructions added yet.
          </div>
        )}
      </div>

      <div className="flex items-center space-x-2">
        <Input
          placeholder="Add a new instruction..."
          value={newInstruction}
          onChange={(e) => setNewInstruction(e.target.value)}
          onKeyDown={(e) => {
            if (e.key === 'Enter') {
              e.preventDefault();
              addInstruction();
            }
          }}
        />
        <Button
          size="sm"
          onClick={addInstruction}
          disabled={!newInstruction.trim()}
          className="flex items-center"
        >
          <Plus size={16} className="mr-1" />
          Add
        </Button>
      </div>
    </div>
  );
}