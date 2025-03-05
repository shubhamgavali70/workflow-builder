// app/builder/components/NodeTypes/WorkflowNode.tsx
import { memo } from 'react';
import { Handle, Position, NodeProps } from 'reactflow';
import { WorkflowNodeData } from '@/app/lib/types';
import { Network, Boxes, GitBranch } from 'lucide-react';

function WorkflowNode({ data, selected }: NodeProps<WorkflowNodeData>) {
  const nodesCount = data.graph.nodes.length;
  const edgesCount = data.graph.edges.length;
  
  // Count different node types for more detailed information
  const agentCount = data.graph.nodes.filter(node => node.data.type === 'agent').length;
  const toolCount = data.graph.nodes.filter(node => node.data.type === 'tool').length;

  return (
    <div
      className={`rounded-md border-2 p-3 w-64 shadow-md bg-background ${
        selected ? 'border-primary ring-2 ring-primary ring-opacity-50' : 'border-muted'
      }`}
    >
      <div className="flex items-center gap-2">
        <Network size={18} className="text-blue-600" />
        <div className="font-semibold truncate">{data.name}</div>
      </div>
      
      <div className="mt-3 grid grid-cols-2 gap-3">
        <div className="flex items-center gap-1 text-xs text-muted-foreground">
          <Boxes size={14} className="text-blue-500" />
          <div className="flex flex-col">
            <span className="font-medium">Nodes: {nodesCount}</span>
            {nodesCount > 0 && (
              <span className="text-[10px]">
                {agentCount} agent{agentCount !== 1 ? 's' : ''}, {toolCount} tool{toolCount !== 1 ? 's' : ''}
              </span>
            )}
          </div>
        </div>
        <div className="flex items-center gap-1 text-xs text-muted-foreground">
          <GitBranch size={14} className="text-blue-500" />
          <div className="flex flex-col">
            <span className="font-medium">Connections: {edgesCount}</span>
          </div>
        </div>
      </div>

      {/* Connection points */}
      <Handle 
        type="target" 
        position={Position.Top} 
        className="!bg-blue-500 !w-3 !h-3" 
        isConnectable={true}
      />
      <Handle 
        type="source" 
        position={Position.Bottom} 
        className="!bg-blue-500 !w-3 !h-3" 
        isConnectable={true}
      />
    </div>
  );
}

export default memo(WorkflowNode);