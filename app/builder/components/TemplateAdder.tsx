// app/builder/components/TemplateAdder.tsx
'use client';

import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { 
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue 
} from '@/components/ui/select';
import { Label } from '@/components/ui/label';
import { useBuilderStore } from '@/app/lib/store';
import { v4 as uuidv4 } from 'uuid';
import { AgentNodeData, ToolNodeData } from '@/app/lib/types';
import { 
  Popover,
  PopoverContent,
  PopoverTrigger,
} from '@/components/ui/popover';
import { PlusCircle } from 'lucide-react';

// Template definitions
const TEMPLATES = {
  basic: {
    name: 'Basic Agent + Tool',
    nodes: [
      {
        type: 'agent',
        position: { x: 250, y: 100 },
        data: {
          name: 'Primary Agent',
          type: 'agent',
          instructions: ['Handle user requests', 'Delegate to tools when needed'],
          top_level_node: false
        } as Partial<AgentNodeData>
      },
      {
        type: 'tool',
        position: { x: 250, y: 250 },
        data: {
          name: 'Helper Tool',
          type: 'tool',
          connected_to: ''
        } as Partial<ToolNodeData>
      }
    ],
    connections: [
      { source: 0, target: 1 } // Index-based connections (will be replaced with actual IDs)
    ]
  },
  multiAgent: {
    name: 'Multi-Agent System',
    nodes: [
      {
        type: 'agent',
        position: { x: 250, y: 50 },
        data: {
          name: 'Coordinator Agent',
          type: 'agent',
          instructions: ['Coordinate between specialized agents', 'Provide final responses'],
          top_level_node: false
        } as Partial<AgentNodeData>
      },
      {
        type: 'agent',
        position: { x: 100, y: 200 },
        data: {
          name: 'Research Agent',
          type: 'agent',
          instructions: ['Perform in-depth research', 'Extract key information'],
          top_level_node: false
        } as Partial<AgentNodeData>
      },
      {
        type: 'agent',
        position: { x: 400, y: 200 },
        data: {
          name: 'Writing Agent',
          type: 'agent',
          instructions: ['Format information clearly', 'Create coherent responses'],
          top_level_node: false
        } as Partial<AgentNodeData>
      },
      {
        type: 'tool',
        position: { x: 100, y: 350 },
        data: {
          name: 'Search Tool',
          type: 'tool',
          connected_to: ''
        } as Partial<ToolNodeData>
      },
      {
        type: 'tool',
        position: { x: 400, y: 350 },
        data: {
          name: 'Formatting Tool',
          type: 'tool',
          connected_to: ''
        } as Partial<ToolNodeData>
      }
    ],
    connections: [
      { source: 0, target: 1 },
      { source: 0, target: 2 },
      { source: 1, target: 3 },
      { source: 2, target: 4 }
    ]
  }
};

export default function TemplateAdder() {
  const { addNode, onConnect } = useBuilderStore();
  const [selectedTemplate, setSelectedTemplate] = useState('basic');
  const [open, setOpen] = useState(false);

  const addTemplate = () => {
    const template = TEMPLATES[selectedTemplate as keyof typeof TEMPLATES];
    if (!template) return;

    // Calculate base position (center of the current view)
    // In a real app, you'd get this from the reactFlowInstance.getViewport()
    const basePosition = { x: 300, y: 200 };
    
    // Add nodes and store their IDs for connections
    const nodeIds: string[] = [];
    
    template.nodes.forEach((nodeConfig, index) => {
      // Calculate position relative to base position
      const position = {
        x: basePosition.x + nodeConfig.position.x - 250, // Adjust to center template
        y: basePosition.y + nodeConfig.position.y - 150  // Adjust to center template
      };
      
      // Create the node
      const newNode = addNode(
        nodeConfig.type as 'agent' | 'tool',
        position,
        { ...nodeConfig.data, node_id: uuidv4() }
      );
      
      // Store the node ID for connections
      nodeIds.push(newNode.id);
    });
    
    // Create connections between nodes
    template.connections.forEach(conn => {
      if (nodeIds[conn.source] && nodeIds[conn.target]) {
        onConnect({
          source: nodeIds[conn.source],
          target: nodeIds[conn.target]
        });
      }
    });
    
    setOpen(false);
  };

  return (
    <Popover open={open} onOpenChange={setOpen}>
      <PopoverTrigger asChild>
        <Button 
          variant="outline" 
          className="flex items-center gap-1"
        >
          <PlusCircle size={16} />
          Add Template
        </Button>
      </PopoverTrigger>
      <PopoverContent className="w-64 p-4">
        <div className="space-y-4">
          <h3 className="font-medium">Add Node Template</h3>
          <div className="space-y-2">
            <Label htmlFor="template">Select Template:</Label>
            <Select 
              value={selectedTemplate}
              onValueChange={setSelectedTemplate}
            >
              <SelectTrigger id="template">
                <SelectValue placeholder="Select a template" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="basic">Basic Agent + Tool</SelectItem>
                <SelectItem value="multiAgent">Multi-Agent System</SelectItem>
              </SelectContent>
            </Select>
          </div>
          
          <div className="border rounded-md p-2 text-xs text-muted-foreground">
            {selectedTemplate === 'basic' && (
              <div>
                <p className="font-medium mb-1">Basic Agent + Tool:</p>
                <ul className="list-disc list-inside">
                  <li>1 agent node</li>
                  <li>1 tool node</li>
                  <li>Pre-configured connection</li>
                </ul>
              </div>
            )}
            {selectedTemplate === 'multiAgent' && (
              <div>
                <p className="font-medium mb-1">Multi-Agent System:</p>
                <ul className="list-disc list-inside">
                  <li>3 agent nodes (coordinator, research, writing)</li>
                  <li>2 tool nodes</li>
                  <li>Pre-configured connections</li>
                </ul>
              </div>
            )}
          </div>
          
          <Button onClick={addTemplate} className="w-full">
            Add to Workflow
          </Button>
        </div>
      </PopoverContent>
    </Popover>
  );
}