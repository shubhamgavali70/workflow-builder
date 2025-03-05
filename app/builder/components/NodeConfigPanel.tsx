// app/builder/components/NodeConfigPanel.tsx (updated)
import { ChangeEvent } from 'react';
import { useBuilderStore } from '@/app/lib/store';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Switch } from '@/components/ui/switch';
import { Separator } from '@/components/ui/separator';
import { X } from 'lucide-react';
import InstructionsInput from './CustomControls/InstructionsInput';
import { AgentNodeData, ToolNodeData, WorkflowNodeData } from '@/app/lib/types';
import WorkflowDetailView from './WorkflowDetailView';

export default function NodeConfigPanel() {
  const { selectedNode, updateNodeData, nodes } = useBuilderStore();

  if (!selectedNode) return null;

  const handleChange = (field: string, value: any) => {
    updateNodeData(selectedNode.id, { [field]: value });
  };

  const handleInputChange = (e: ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    handleChange(name, value);
  };

  // Close panel handler
  const closePanel = () => {
    useBuilderStore.setState({ selectedNode: null });
  };

  return (
    <div className="w-80 border-l h-full overflow-auto p-4 bg-background">
      <div className="flex items-center justify-between mb-4">
        <h3 className="text-lg font-semibold">Node Configuration</h3>
        <Button size="icon" variant="ghost" onClick={closePanel}>
          <X size={18} />
        </Button>
      </div>

      <div className="space-y-4">
        {/* Common fields for all node types */}
        <div className="space-y-2">
          <Label htmlFor="name">Name</Label>
          <Input
            id="name"
            name="name"
            value={selectedNode.data.name}
            onChange={handleInputChange}
          />
        </div>

        <div className="space-y-2">
          <Label htmlFor="node_id">Node ID (Read-only)</Label>
          <Input
            id="node_id"
            value={selectedNode.data.node_id}
            readOnly
            disabled
          />
        </div>

        <Separator />

        {/* Agent-specific fields */}
        {selectedNode.data.type === 'agent' && (
          <>
            <div className="flex items-center space-x-2">
              <Switch
                id="top_level_node"
                checked={(selectedNode.data as AgentNodeData).top_level_node}
                onCheckedChange={(checked) => {
                  // If setting this node as top level, unset any other top level nodes
                  if (checked) {
                    nodes.forEach((node) => {
                      if (
                        node.id !== selectedNode.id &&
                        node.data.type === 'agent' &&
                        (node.data as AgentNodeData).top_level_node
                      ) {
                        updateNodeData(node.id, { top_level_node: false });
                      }
                    });
                  }
                  handleChange('top_level_node', checked);
                }}
              />
              <Label htmlFor="top_level_node">Top Level Node</Label>
            </div>

            <InstructionsInput
              instructions={(selectedNode.data as AgentNodeData).instructions}
              onChange={(instructions) => handleChange('instructions', instructions)}
            />
          </>
        )}

        {/* Workflow-specific fields */}
        {selectedNode.data.type === 'workflow' && (
          <div className="space-y-2">
            <Label>Workflow Graph</Label>
            <div className="text-sm text-muted-foreground">
              <p>This workflow contains:</p>
              <ul className="list-disc pl-5 mt-1">
                <li>
                  {(selectedNode.data as WorkflowNodeData).graph.nodes.length} nodes
                  {(selectedNode.data as WorkflowNodeData).graph.nodes.length > 0 && (
                    <span className="text-xs ml-1">
                      (
                      {(selectedNode.data as WorkflowNodeData).graph.nodes.filter(n => n.data.type === 'agent').length} agents, 
                      {(selectedNode.data as WorkflowNodeData).graph.nodes.filter(n => n.data.type === 'tool').length} tools
                      )
                    </span>
                  )}
                </li>
                <li>
                  {(selectedNode.data as WorkflowNodeData).graph.edges.length} connections
                </li>
              </ul>
            </div>
            
            <WorkflowDetailView workflowNode={selectedNode} />
            
            <div className="text-xs text-muted-foreground mt-4">
              <p>Workflow nodes automatically update when you connect other nodes to them.</p>
            </div>
          </div>
        )}

        {/* Tool-specific fields */}
        {selectedNode.data.type === 'tool' && (
          <div className="space-y-2">
            <Label>Connected To</Label>
            <div className="text-sm">
              {(selectedNode.data as ToolNodeData).connected_to ? (
                <div className="p-2 bg-muted rounded-md">
                  {
                    nodes.find(
                      (n) => n.data.node_id === (selectedNode.data as ToolNodeData).connected_to
                    )?.data.name || 'Unknown Node'
                  }
                </div>
              ) : (
                <div className="text-muted-foreground">
                  Not connected to any node yet. Draw a connection from this tool to a node.
                </div>
              )}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}