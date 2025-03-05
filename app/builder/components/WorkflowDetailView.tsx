// app/builder/components/WorkflowDetailView.tsx
// import { useState, useCallback } from 'react';
import ReactFlow, {
  Background,
  Controls,
  MiniMap,
  NodeTypes,
} from 'reactflow';
import 'reactflow/dist/style.css';

import { CustomNode, WorkflowNodeData } from '@/app/lib/types';
import AgentNode from './NodeTypes/AgentNode';
import ToolNode from './NodeTypes/ToolNode';
import WorkflowNode from './NodeTypes/WorkflowNode';
import {
  Dialog,
  DialogClose,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Button } from '@/components/ui/button';
import { Network, Eye } from 'lucide-react';

interface WorkflowDetailViewProps {
  workflowNode: CustomNode<WorkflowNodeData>;
}

// Define node types for the flow visualization
const nodeTypes: NodeTypes = {
  agent: AgentNode,
  workflow: WorkflowNode,
  tool: ToolNode,
};

export default function WorkflowDetailView({ workflowNode }: WorkflowDetailViewProps) {
  // Extract graph data from the workflow node
  const { nodes, edges } = workflowNode.data.graph;
  
  // Track if workflow is empty
  const isEmpty = nodes.length === 0;

  // Calculate stats about the workflow
  const agentCount = nodes.filter(node => node.data.type === 'agent').length;
  const toolCount = nodes.filter(node => node.data.type === 'tool').length;
  
  return (
    <Dialog>
      <DialogTrigger asChild>
        <Button 
          variant="outline" 
          size="sm" 
          className="mt-2 w-full flex items-center gap-2"
        >
          <Eye size={14} />
          View Workflow Details
        </Button>
      </DialogTrigger>
      
      <DialogContent className="sm:max-w-[80vw] sm:max-h-[80vh]">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Network size={18} className="text-blue-600" />
            {workflowNode.data.name} Workflow Details
          </DialogTitle>
          <DialogDescription>
            This workflow contains {nodes.length} node{nodes.length !== 1 ? 's' : ''} and {edges.length} connection{edges.length !== 1 ? 's' : ''}.
          </DialogDescription>
        </DialogHeader>
        
        <div className="h-[60vh] w-full border rounded-md">
          {isEmpty ? (
            <div className="h-full w-full flex items-center justify-center text-muted-foreground text-center p-4">
              <div>
                <p className="mb-2">This workflow is empty.</p>
                <p className="text-sm">Connect nodes to this workflow to see them visualized here.</p>
              </div>
            </div>
          ) : (
            <ReactFlow
              nodes={nodes}
              edges={edges}
              nodeTypes={nodeTypes}
              fitView
              attributionPosition="bottom-right"
            >
              <Background />
              <Controls />
              <MiniMap />
            </ReactFlow>
          )}
        </div>
        
        {!isEmpty && (
          <div className="grid grid-cols-2 gap-4 mt-2">
            <div className="border rounded-md p-3">
              <h3 className="text-sm font-medium mb-2">Node Types</h3>
              <div className="grid grid-cols-2 gap-2 text-sm">
                <div>Agents: <span className="font-medium">{agentCount}</span></div>
                <div>Tools: <span className="font-medium">{toolCount}</span></div>
              </div>
            </div>
            <div className="border rounded-md p-3">
              <h3 className="text-sm font-medium mb-2">Connectivity</h3>
              <div className="text-sm">
                <div>Connections: <span className="font-medium">{edges.length}</span></div>
                <div>Density: <span className="font-medium">
                  {nodes.length > 1 
                    ? `${((edges.length / (nodes.length * (nodes.length - 1) / 2)) * 100).toFixed(1)}%`
                    : 'N/A'}
                </span></div>
              </div>
            </div>
          </div>
        )}
        
        <DialogFooter>
          <DialogClose asChild>
            <Button>Close</Button>
          </DialogClose>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}