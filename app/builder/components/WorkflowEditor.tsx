// app/builder/components/WorkflowEditor.tsx
'use client';

import { useEffect, useState, useCallback } from 'react';
import ReactFlow, {
  Background,
  Controls,
  MiniMap,
  NodeTypes,
  ReactFlowProvider,
  Edge,
} from 'reactflow';
import 'reactflow/dist/style.css';
import { useBuilderStore } from '@/app/lib/store';
import AgentNode from './NodeTypes/AgentNode';
import ToolNode from './NodeTypes/ToolNode';
import { v4 as uuidv4 } from 'uuid';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Label } from '@/components/ui/label';
import { 
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue 
} from '@/components/ui/select';
import { WorkflowNodeData, CustomNode, AgentNodeData, ToolNodeData } from '@/app/lib/types';

// Predefined workflow templates
const WORKFLOW_TEMPLATES = {
  empty: {
    name: 'Empty Workflow',
    nodes: [],
    edges: []
  },
  basic: {
    name: 'Basic Agent + Tool',
    nodes: [
      {
        id: 'template-agent-1',
        type: 'agent',
        position: { x: 250, y: 100 },
        data: {
          name: 'Primary Agent',
          node_id: uuidv4(),
          type: 'agent',
          instructions: ['Handle user requests', 'Delegate to tools when needed'],
          top_level_node: true
        } as AgentNodeData
      },
      {
        id: 'template-tool-1',
        type: 'tool',
        position: { x: 250, y: 250 },
        data: {
          name: 'Helper Tool',
          node_id: uuidv4(),
          type: 'tool',
          connected_to: ''
        } as ToolNodeData
      }
    ],
    edges: [
      {
        id: `e-${uuidv4()}`,
        source: 'template-agent-1',
        target: 'template-tool-1',
        type: 'smoothstep',
        animated: true
      }
    ]
  },
  complex: {
    name: 'Multi-Agent Workflow',
    nodes: [
      {
        id: 'template-agent-1',
        type: 'agent',
        position: { x: 250, y: 50 },
        data: {
          name: 'Coordinator Agent',
          node_id: uuidv4(),
          type: 'agent',
          instructions: ['Coordinate between specialized agents', 'Provide final responses'],
          top_level_node: true
        } as AgentNodeData
      },
      {
        id: 'template-agent-2',
        type: 'agent',
        position: { x: 100, y: 200 },
        data: {
          name: 'Research Agent',
          node_id: uuidv4(),
          type: 'agent',
          instructions: ['Perform in-depth research', 'Extract key information'],
          top_level_node: false
        } as AgentNodeData
      },
      {
        id: 'template-agent-3',
        type: 'agent',
        position: { x: 400, y: 200 },
        data: {
          name: 'Writing Agent',
          node_id: uuidv4(),
          type: 'agent',
          instructions: ['Format information clearly', 'Create coherent responses'],
          top_level_node: false
        } as AgentNodeData
      },
      {
        id: 'template-tool-1',
        type: 'tool',
        position: { x: 100, y: 350 },
        data: {
          name: 'Search Tool',
          node_id: uuidv4(),
          type: 'tool',
          connected_to: ''
        } as ToolNodeData
      },
      {
        id: 'template-tool-2',
        type: 'tool',
        position: { x: 400, y: 350 },
        data: {
          name: 'Formatting Tool',
          node_id: uuidv4(),
          type: 'tool',
          connected_to: ''
        } as ToolNodeData
      }
    ],
    edges: [
      {
        id: `e-${uuidv4()}`,
        source: 'template-agent-1',
        target: 'template-agent-2',
        type: 'smoothstep',
        animated: true
      },
      {
        id: `e-${uuidv4()}`,
        source: 'template-agent-1',
        target: 'template-agent-3',
        type: 'smoothstep',
        animated: true
      },
      {
        id: `e-${uuidv4()}`,
        source: 'template-agent-2',
        target: 'template-tool-1',
        type: 'smoothstep',
        animated: true
      },
      {
        id: `e-${uuidv4()}`,
        source: 'template-agent-3',
        target: 'template-tool-2',
        type: 'smoothstep',
        animated: true
      }
    ]
  }
};

const nodeTypes = {
  agent: AgentNode,
  tool: ToolNode,
};

interface WorkflowEditorProps {
  isOpen: boolean;
  onClose: () => void;
  workflowNodeId: string | null;
}

export default function WorkflowEditor({ isOpen, onClose, workflowNodeId }: WorkflowEditorProps) {
  const { nodes: mainNodes, updateNodeData } = useBuilderStore();
  const [nodes, setNodes] = useState<CustomNode[]>([]);
  const [edges, setEdges] = useState<Edge[]>([]);
  const [selectedTemplate, setSelectedTemplate] = useState('empty');
  const [showTemplateSelector, setShowTemplateSelector] = useState(true);
  
  const workflowNode = mainNodes.find(node => node.data.node_id === workflowNodeId) as CustomNode<WorkflowNodeData> | undefined;

  useEffect(() => {
    if (workflowNode && workflowNode.data.graph) {
      // If the workflow already has nodes, load them
      if (workflowNode.data.graph.nodes.length > 0) {
        setNodes(workflowNode.data.graph.nodes);
        setEdges(workflowNode.data.graph.edges);
        setShowTemplateSelector(false);
      } else {
        // Otherwise show the template selector
        setShowTemplateSelector(true);
      }
    }
  }, [workflowNode]);

  const applyTemplate = useCallback(() => {
    const template = WORKFLOW_TEMPLATES[selectedTemplate as keyof typeof WORKFLOW_TEMPLATES];
    
    // Generate new IDs for nodes to ensure uniqueness
    const updatedNodes = template.nodes.map(node => ({
      ...node,
      id: `${node.id}-${uuidv4().substring(0, 8)}`,
      data: {
        ...node.data,
        node_id: uuidv4()
      }
    }));
    
    // Update edge references with new node IDs
    const nodeIdMap = template.nodes.reduce((acc, node, index) => {
      acc[node.id] = updatedNodes[index].id;
      return acc;
    }, {} as Record<string, string>);
    
    const updatedEdges = template.edges.map(edge => ({
      ...edge,
      id: `e-${uuidv4()}`,
      source: nodeIdMap[edge.source],
      target: nodeIdMap[edge.target]
    }));
    
    setNodes(updatedNodes);
    setEdges(updatedEdges);
    setShowTemplateSelector(false);
  }, [selectedTemplate]);

  const handleSave = useCallback(() => {
    if (workflowNodeId) {
      updateNodeData(workflowNode?.id || '', {
        graph: {
          nodes,
          edges
        }
      });
      onClose();
    }
  }, [workflowNodeId, nodes, edges, updateNodeData, workflowNode, onClose]);

  if (!workflowNodeId) {
    return null;
  }

  return (
    <Dialog open={isOpen} onOpenChange={(open) => !open && onClose()}>
      <DialogContent className="max-w-5xl h-[80vh] flex flex-col">
        <DialogHeader>
          <DialogTitle>
            {showTemplateSelector 
              ? "Select a Workflow Template" 
              : `Edit Workflow: ${workflowNode?.data?.name || 'Untitled'}`}
          </DialogTitle>
        </DialogHeader>
        
        {showTemplateSelector ? (
          <div className="flex flex-col h-full space-y-6 py-4">
            <div className="space-y-2">
              <Label htmlFor="template">Select a starting template:</Label>
              <Select 
                value={selectedTemplate}
                onValueChange={setSelectedTemplate}
              >
                <SelectTrigger id="template" className="w-full">
                  <SelectValue placeholder="Select a template" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="empty">Empty Workflow</SelectItem>
                  <SelectItem value="basic">Basic Agent + Tool</SelectItem>
                  <SelectItem value="complex">Multi-Agent Workflow</SelectItem>
                </SelectContent>
              </Select>
            </div>
            
            <div className="border rounded-md p-4 flex-1">
              <h3 className="text-lg font-medium mb-2">
                {WORKFLOW_TEMPLATES[selectedTemplate as keyof typeof WORKFLOW_TEMPLATES].name}
              </h3>
              <div className="text-sm text-muted-foreground">
                {selectedTemplate === 'empty' && (
                  <p>Start with a blank canvas and build your workflow from scratch.</p>
                )}
                {selectedTemplate === 'basic' && (
                  <div>
                    <p className="mb-2">A simple workflow with:</p>
                    <ul className="list-disc list-inside">
                      <li>One primary agent</li>
                      <li>One tool for handling specific tasks</li>
                    </ul>
                  </div>
                )}
                {selectedTemplate === 'complex' && (
                  <div>
                    <p className="mb-2">A comprehensive workflow with:</p>
                    <ul className="list-disc list-inside">
                      <li>One coordinator agent (top level)</li>
                      <li>Two specialized agents (research and writing)</li>
                      <li>Two tools for specific functions</li>
                    </ul>
                  </div>
                )}
              </div>
            </div>
            
            <DialogFooter>
              <Button onClick={onClose} variant="outline">Cancel</Button>
              <Button onClick={applyTemplate}>Use Template</Button>
            </DialogFooter>
          </div>
        ) : (
          <div className="flex flex-col h-full">
            <div className="flex-1 bg-muted/10 rounded-md overflow-hidden">
              <ReactFlowProvider>
                <ReactFlow
                  nodes={nodes}
                  edges={edges}
                  nodeTypes={nodeTypes}
                  fitView
                  proOptions={{ hideAttribution: true }}
                >
                  <Background />
                  <Controls />
                  <MiniMap />
                </ReactFlow>
              </ReactFlowProvider>
            </div>
            
            <DialogFooter className="mt-4">
              <Button onClick={onClose} variant="outline">Cancel</Button>
              <Button onClick={handleSave}>Save Workflow</Button>
            </DialogFooter>
          </div>
        )}
      </DialogContent>
    </Dialog>
  );
}