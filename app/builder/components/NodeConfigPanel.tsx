import { ChangeEvent } from 'react';
import { useBuilderStore } from '@/app/lib/store';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Switch } from '@/components/ui/switch';
import { Separator } from '@/components/ui/separator';
import { X } from 'lucide-react';
import InstructionsInput from './CustomControls/InstructionsInput';
import { AgentNodeData, ToolNodeData } from '@/app/lib/types';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';

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

  // Define available tools for the dropdown
  const availableTools = [
    { toolid: 'tool-1', toolName: 'Tool One' },
    { toolid: 'tool-2', toolName: 'Tool Two' },
    { toolid: 'tool-3', toolName: 'Tool Three' },
  ];

  // Handle the tool dropdown change event
  const handleToolChange = (value: string) => {
    const selectedTool = availableTools.find(tool => tool.toolid === value);
    if (selectedTool) {
      updateNodeData(selectedNode.id, {
        name: selectedTool.toolName,
        toolid: selectedTool.toolid,
      });
    }
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
          {selectedNode.data.type === 'tool' ? (
            <Select
              value={(selectedNode.data as ToolNodeData).toolid || availableTools[0].toolid}
              onValueChange={handleToolChange}
            >
              <SelectTrigger className="w-full">
                <SelectValue placeholder="Select a tool" />
              </SelectTrigger>
              <SelectContent>
                {availableTools.map(tool => (
                  <SelectItem key={tool.toolid} value={tool.toolid}>
                    {tool.toolName}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          ) : (
            <Input
              id="name"
              name="name"
              value={selectedNode.data.name}
              onChange={handleInputChange}
            />
          )}
        </div>

        <div className="space-y-2">
          <Label htmlFor="node_id">Node ID (Read-only)</Label>
          <Input id="node_id" value={selectedNode.data.node_id} readOnly disabled />
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

        {/* Tool-specific fields */}
        {selectedNode.data.type === 'tool' && (
          <div className="space-y-2">
            <Label>Connected To</Label>
            <div className="text-sm">
              {(selectedNode.data as ToolNodeData).connected_to ? (
                <div className="p-2 bg-muted rounded-md">
                  {
                    nodes.find(
                      (n) =>
                        n.data.node_id === (selectedNode.data as ToolNodeData).connected_to
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
