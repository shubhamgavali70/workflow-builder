// app/builder/components/CustomControls/NodeTypeSelect.tsx
import { Button } from "@/components/ui/button";
import {
  Command,
  CommandEmpty,
  CommandGroup,
  CommandInput,
  CommandItem,
} from "@/components/ui/command";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { Check, ChevronsUpDown, Bot as Robot, Network, Wrench } from "lucide-react";
import { useState } from "react";
import { cn } from "@/app/lib/utils";
import { NodeType } from "@/app/lib/types";

const nodeTypes = [
  {
    value: "agent",
    label: "Agent",
    icon: <Robot size={16} className="mr-2 text-violet-600" />,
  },
  {
    value: "workflow",
    label: "Workflow",
    icon: <Network size={16} className="mr-2 text-blue-600" />,
  },
  {
    value: "tool",
    label: "Tool",
    icon: <Wrench size={16} className="mr-2 text-orange-500" />,
  },
] as const;

interface NodeTypeSelectProps {
  value: NodeType;
  onChange: (value: NodeType) => void;
}

export default function NodeTypeSelect({ value, onChange }: NodeTypeSelectProps) {
  const [open, setOpen] = useState(false);

  const selectedType = nodeTypes.find((type) => type.value === value);

  return (
    <Popover open={open} onOpenChange={setOpen}>
      <PopoverTrigger asChild>
        <Button
          variant="outline"
          role="combobox"
          aria-expanded={open}
          className="w-full justify-between"
        >
          <div className="flex items-center">
            {selectedType?.icon}
            {selectedType?.label || "Select node type..."}
          </div>
          <ChevronsUpDown className="ml-2 h-4 w-4 shrink-0 opacity-50" />
        </Button>
      </PopoverTrigger>
      <PopoverContent className="w-[200px] p-0">
        <Command>
          <CommandInput placeholder="Search node type..." />
          <CommandEmpty>No node type found.</CommandEmpty>
          <CommandGroup>
            {nodeTypes.map((type) => (
              <CommandItem
                key={type.value}
                value={type.value}
                onSelect={() => {
                  onChange(type.value as NodeType);
                  setOpen(false);
                }}
              >
                <Check
                  className={cn(
                    "mr-2 h-4 w-4",
                    value === type.value ? "opacity-100" : "opacity-0"
                  )}
                />
                {type.icon}
                {type.label}
              </CommandItem>
            ))}
          </CommandGroup>
        </Command>
      </PopoverContent>
    </Popover>
  );
}