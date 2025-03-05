import { memo } from 'react';
import { Handle, Position, NodeProps } from 'reactflow';
import { ToolNodeData } from '@/app/lib/types';
import { Wrench } from 'lucide-react';

function ToolNode({ data, selected }: NodeProps<ToolNodeData>) {
  return (
    <div
      className={`rounded-md border-2 p-3 w-44 shadow-md bg-background ${
        selected ? 'border-primary ring-2 ring-primary ring-opacity-50' : 'border-muted'
      }`}
    >
      <div className="flex items-center gap-2">
        <Wrench size={18} className="text-orange-500" />
        <div className="font-semibold truncate">{data.name}</div>
      </div>
      
      {data.connected_to && (
        <div className="mt-1 text-xs text-muted-foreground truncate">
          Connected to a node
        </div>
      )}

      {/* Connection points - tools can only connect to nodes */}
      <Handle 
        type="target" 
        position={Position.Top} 
        className="!bg-orange-500 !w-3 !h-3" 
        isConnectable={true}
      />
      <Handle 
        type="source" 
        position={Position.Bottom} 
        className="!bg-orange-500 !w-3 !h-3" 
        isConnectable={true}
      />
    </div>
  );
}

export default memo(ToolNode);