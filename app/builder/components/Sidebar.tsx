// app/builder/components/Sidebar.tsx
import { ReactNode } from 'react';
import { useBuilderStore } from '@/app/lib/store';
import { Button } from '@/components/ui/button';
import { Separator } from '@/components/ui/separator';
import { Bot as Robot, Network, Wrench } from 'lucide-react';
import WorkflowCreationDialog from './WorkflowCreationDialog';

interface NodeTypeButtonProps {
  label: string;
  type: 'agent' | 'workflow' | 'tool';
  icon: ReactNode;
  className?: string;
}

function NodeTypeButton({ label, type, icon, className }: NodeTypeButtonProps) {
  const { addNode } = useBuilderStore();

  const onDragStart = (event: React.DragEvent<HTMLButtonElement>) => {
    event.dataTransfer.setData('application/reactflow', type);
    event.dataTransfer.effectAllowed = 'move';
  };

  const onClick = () => {
    // Add node at a random position near the center
    const position = {
      x: Math.random() * 300 + 100,
      y: Math.random() * 300 + 100,
    };
    addNode(type, position);
  };

  return (
    <Button
      variant="outline"
      className={`w-full text-left flex items-center gap-2 ${className}`}
      draggable
      onDragStart={onDragStart}
      onClick={onClick}
    >
      {icon}
      {label}
    </Button>
  );
}

export default function Sidebar() {
  const handleWorkflowCreated = (nodeId: string) => {
    // Trigger workflow editor to open
    window.dispatchEvent(new CustomEvent('open-workflow-editor', {
      detail: { nodeId }
    }));
  };

  return (
    <div className="w-60 border-r p-4 flex flex-col space-y-4 bg-muted/20">
      <h2 className="font-semibold text-lg">Node Types</h2>
      <div className="space-y-2">
        <NodeTypeButton
          label="Agent"
          type="agent"
          icon={<Robot size={16} />}
          className="hover:border-violet-500 hover:text-violet-600"
        />
        <NodeTypeButton
          label="Simple Workflow"
          type="workflow"
          icon={<Network size={16} />}
          className="hover:border-blue-500 hover:text-blue-600"
        />
        <NodeTypeButton
          label="Tool"
          type="tool"
          icon={<Wrench size={16} />}
          className="hover:border-orange-500 hover:text-orange-600"
        />
      </div>
      
      <Separator />
      
      <div>
        <h3 className="text-sm font-medium mb-2">Workflow Templates</h3>
        <WorkflowCreationDialog onCreated={handleWorkflowCreated} />
      </div>
      
      <div className="mt-auto">
        <div className="text-xs text-muted-foreground">
          <p className="mb-2">Drag and drop nodes onto the canvas or click to add.</p>
          <p>Connect nodes by dragging from one handle to another.</p>
          <p className="mt-2">Use templates to create pre-configured workflows with agent nodes and tools.</p>
        </div>
      </div>
    </div>
  );
}