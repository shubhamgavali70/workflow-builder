import { memo } from 'react';
import { Handle, Position, NodeProps } from 'reactflow';
import { AgentNodeData } from '@/app/lib/types';
import { Bot as Robot } from 'lucide-react';

function AgentNode({ data, selected }: NodeProps<AgentNodeData>) {
  return (
    <div
      className={`rounded-md border-2 p-3 w-56 shadow-md bg-background ${
        selected ? 'border-primary ring-2 ring-primary ring-opacity-50' : 'border-muted'
      } ${data.top_level_node ? 'border-violet-500 border-dashed' : ''}`}
    >
      <div className="flex items-center gap-2">
        <Robot 
          size={18} 
          className={data.top_level_node ? 'text-violet-600' : 'text-muted-foreground'} 
        />
        <div className="font-semibold truncate">{data.name}</div>
      </div>
      
      {data.top_level_node && (
        <div className="mt-1 text-xs text-violet-600 font-medium">Top Level Node</div>
      )}
      
      {data.instructions.length > 0 && (
        <div className="mt-2 text-xs text-muted-foreground">
          {data.instructions.length} instruction{data.instructions.length !== 1 ? 's' : ''}
        </div>
      )}

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

export default memo(AgentNode);