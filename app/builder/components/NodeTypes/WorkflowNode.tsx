// app/builder/components/NodeTypes/WorkflowNode.tsx
import { memo } from 'react';
import { Handle, Position, NodeProps } from 'reactflow';
import { WorkflowNodeData } from '@/app/lib/types';
import { Network, Edit } from 'lucide-react';
import { Button } from '@/components/ui/button';

function WorkflowNode({ data, selected }: NodeProps<WorkflowNodeData>) {
  const nodesCount = data.graph.nodes.length;
  const edgesCount = data.graph.edges.length;

  return (
    <div
      className={`rounded-md border-2 p-3 w-56 shadow-md bg-background ${
        selected ? 'border-primary ring-2 ring-primary ring-opacity-50' : 'border-muted'
      }`}
    >
      <div className="flex items-center gap-2">
        <Network size={18} className="text-blue-600" />
        <div className="font-semibold truncate">{data.name}</div>
      </div>
      
      <div className="mt-2 grid grid-cols-2 gap-2 text-xs text-muted-foreground">
        <div className="flex items-center gap-1">
          <span>Nodes:</span>
          <span className="font-semibold">{nodesCount}</span>
        </div>
        <div className="flex items-center gap-1">
          <span>Edges:</span>
          <span className="font-semibold">{edgesCount}</span>
        </div>
      </div>

      {/* Edit button to open workflow editor */}
      <div className="mt-2">
        <Button 
          variant="outline" 
          size="sm" 
          className="w-full text-xs flex items-center gap-1"
          onClick={(e) => {
            e.stopPropagation();
            // Here we would trigger the workflow editor
            window.dispatchEvent(new CustomEvent('open-workflow-editor', {
              detail: { nodeId: data.node_id }
            }));
          }}
        >
          <Edit size={12} />
          Edit Workflow
        </Button>
      </div>

      {/* Connection points */}
      <Handle 
        type="target" 
        position={Position.Top} 
        className="!bg-muted-foreground !w-3 !h-3" 
        isConnectable={true}
      />
      <Handle 
        type="source" 
        position={Position.Bottom} 
        className="!bg-muted-foreground !w-3 !h-3" 
        isConnectable={true}
      />
    </div>
  );
}

export default memo(WorkflowNode);