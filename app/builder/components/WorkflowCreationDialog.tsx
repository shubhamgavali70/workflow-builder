// app/builder/components/WorkflowCreationDialog.tsx
'use client';

import { useState } from 'react';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
  DialogTrigger,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { 
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue 
} from '@/components/ui/select';
import { useBuilderStore } from '@/app/lib/store';
import { CustomNode, WorkflowNodeData } from '@/app/lib/types';
import { v4 as uuidv4 } from 'uuid';

// Template definitions are imported from the WorkflowEditor
import { WORKFLOW_TEMPLATES } from './workflowTemplates';

interface WorkflowCreationDialogProps {
  onCreated?: (nodeId: string) => void;
}

export default function WorkflowCreationDialog({ onCreated }: WorkflowCreationDialogProps) {
  const { addNode } = useBuilderStore();
  const [open, setOpen] = useState(false);
  const [name, setName] = useState('New Workflow');
  const [template, setTemplate] = useState('empty');

  const handleCreate = () => {
    // Generate a node ID now so we can return it
    const nodeId = uuidv4();
    
    // Create position slightly randomized
    const position = {
      x: Math.random() * 200 + 200,
      y: Math.random() * 200 + 100,
    };

    // Get the selected template data
    const templateData = WORKFLOW_TEMPLATES[template as keyof typeof WORKFLOW_TEMPLATES];
    
    // Create the workflow node with the template data
    const workflowData: Partial<WorkflowNodeData> = {
      name: name.trim() || 'New Workflow',
      node_id: nodeId,
      type: 'workflow',
      graph: {
        nodes: templateData.nodes.map(node => ({
          ...node,
          id: `${node.id}-${uuidv4().substring(0, 8)}`,
          data: {
            ...node.data,
            node_id: uuidv4()
          }
        })),
        edges: templateData.edges.map(edge => ({
          ...edge,
          id: `e-${uuidv4()}`
        }))
      }
    };

    // Add a custom workflow node with pre-populated template
    addNode('workflow', position, workflowData);
    
    // Close the dialog
    setOpen(false);
    
    // Callback with the node ID
    if (onCreated) {
      onCreated(nodeId);
    }
    
    // Reset the form
    setName('New Workflow');
    setTemplate('empty');
  };

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button variant="outline">Create Workflow</Button>
      </DialogTrigger>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Create a New Workflow</DialogTitle>
        </DialogHeader>
        
        <div className="space-y-4 py-4">
          <div className="space-y-2">
            <Label htmlFor="name">Workflow Name</Label>
            <Input 
              id="name" 
              value={name} 
              onChange={(e) => setName(e.target.value)} 
              placeholder="Enter workflow name"
            />
          </div>
          
          <div className="space-y-2">
            <Label htmlFor="template">Select a Template</Label>
            <Select 
              value={template}
              onValueChange={setTemplate}
            >
              <SelectTrigger id="template">
                <SelectValue placeholder="Select a template" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="empty">Empty Workflow</SelectItem>
                <SelectItem value="basic">Basic Agent + Tool</SelectItem>
                <SelectItem value="complex">Multi-Agent Workflow</SelectItem>
              </SelectContent>
            </Select>
          </div>
          
          <div className="border rounded-md p-4">
            <h3 className="text-sm font-medium mb-2">
              {WORKFLOW_TEMPLATES[template as keyof typeof WORKFLOW_TEMPLATES].name}
            </h3>
            <div className="text-xs text-muted-foreground">
              {template === 'empty' && (
                <p>Start with a blank canvas and build your workflow from scratch.</p>
              )}
              {template === 'basic' && (
                <div>
                  <p className="mb-1">A simple workflow with:</p>
                  <ul className="list-disc list-inside">
                    <li>One primary agent</li>
                    <li>One tool for handling specific tasks</li>
                  </ul>
                </div>
              )}
              {template === 'complex' && (
                <div>
                  <p className="mb-1">A comprehensive workflow with:</p>
                  <ul className="list-disc list-inside">
                    <li>One coordinator agent (top level)</li>
                    <li>Two specialized agents (research and writing)</li>
                    <li>Two tools for specific functions</li>
                  </ul>
                </div>
              )}
            </div>
          </div>
        </div>
        
        <DialogFooter>
          <Button onClick={handleCreate}>Create Workflow</Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}