// app/builder/components/Builder.tsx
'use client';

import { useCallback, useEffect, useRef, useState } from 'react';
import ReactFlow, {
  Background,
  Controls,
  MiniMap,
  NodeTypes,
  Panel,
  SelectionMode,
  OnDrop,
  OnDragOver,
  useKeyPress,
} from 'reactflow';
import 'reactflow/dist/style.css';

import { useBuilderStore } from '@/app/lib/store';
import Sidebar from './Sidebar';
import NodeConfigPanel from './NodeConfigPanel';
import TemplateTreePanel from './TemplateTreePanel';
import AgentNode from './NodeTypes/AgentNode';
import ToolNode from './NodeTypes/ToolNode';
import { Button } from '@/components/ui/button';
import { Download, Save, Trash2, Copy } from 'lucide-react';
import { Dialog, DialogContent, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Textarea } from '@/components/ui/textarea';

const nodeTypes: NodeTypes = {
  agent: AgentNode,
  tool: ToolNode,
};

export default function Builder() {
  const reactFlowWrapper = useRef<HTMLDivElement>(null);
  const [reactFlowInstance, setReactFlowInstance] = useState<any>(null);
  const [exportedJson, setExportedJson] = useState<string | null>(null);

  const {
    nodes,
    edges,
    selectedNode,
    onNodesChange,
    onEdgesChange,
    onConnect,
    setSelectedNode,
    addNode,
  } = useBuilderStore();

  const handleNodeDeletion = useCallback(() => {
    // Clear selected node if it has been deleted
    const { selectedNode, nodes } = useBuilderStore.getState();
    if (selectedNode && !nodes.some(node => node.id === selectedNode.id)) {
      useBuilderStore.setState({ selectedNode: null });
    }
  }, []);

  const deletePressed = useKeyPress(['Delete', 'Backspace']);

  useEffect(() => {
    if (deletePressed) {
      handleNodeDeletion();
    }
  }, [deletePressed, handleNodeDeletion]);

  const onDragOver: OnDragOver = useCallback((event) => {
    event.preventDefault();
    event.dataTransfer.dropEffect = 'move';
  }, []);

  const onDrop: OnDrop = useCallback(
    (event) => {
      event.preventDefault();

      const reactFlowBounds = reactFlowWrapper.current?.getBoundingClientRect();
      // Allow only agent and tool types
      const type = event.dataTransfer.getData('application/reactflow') as 'agent' | 'tool';

      if (!type || !reactFlowBounds || !reactFlowInstance) {
        return;
      }

      const position = reactFlowInstance.screenToFlowPosition({
        x: event.clientX - reactFlowBounds.left,
        y: event.clientY - reactFlowBounds.top,
      });

      addNode(type, position);
    },
    [reactFlowInstance, addNode]
  );

  const onSave = useCallback(() => {
    const flow = { nodes, edges };
    localStorage.setItem('saved-flow', JSON.stringify(flow));
    alert('Flow saved successfully!');
  }, [nodes, edges]);

  const onExport = useCallback(() => {
    const flow = { nodes, edges };
    setExportedJson(JSON.stringify(flow, null, 2));
  }, [nodes, edges]);

  const copyToClipboard = () => {
    if (exportedJson) {
      navigator.clipboard.writeText(exportedJson);
      alert('Copied to clipboard!');
    }
  };

  const onClear = useCallback(() => {
    if (window.confirm('Are you sure you want to clear the canvas? This action cannot be undone.')) {
      useBuilderStore.setState({ nodes: [], edges: [], selectedNode: null });
    }
  }, []);

  return (
    <div className="h-screen w-full flex">
      {/* Sidebar - Node palette */}
      <Sidebar />

      {/* Main flow area */}
      <div className="flex-1 h-full relative" ref={reactFlowWrapper}>
        <ReactFlow
          nodes={nodes}
          edges={edges}
          onNodesChange={onNodesChange}
          onEdgesChange={onEdgesChange}
          onConnect={onConnect}
          nodeTypes={nodeTypes}
          onPaneClick={() => setSelectedNode(null)}
          onNodeClick={(_, node) => setSelectedNode(node as any)}
          onInit={setReactFlowInstance}
          onDrop={onDrop}
          onDragOver={onDragOver}
          fitView
          selectionMode={SelectionMode.Partial}
          proOptions={{ hideAttribution: true }}
          deleteKeyCode={['Backspace', 'Delete']}
          multiSelectionKeyCode={['Control', 'Meta']}
          connectionMode="strict"
        >
          <Background />
          <Controls />
          <MiniMap />

          <Panel position="top-right" className="flex gap-2">
            <TemplateTreePanel />
            <Button size="sm" variant="outline" onClick={onSave} className="flex items-center gap-1">
              <Save size={16} />
              Save
            </Button>
            <Dialog>
              <DialogTrigger asChild>
                <Button
                  size="sm"
                  variant="outline"
                  onClick={onExport}
                  className="flex items-center gap-1"
                >
                  <Download size={16} />
                  Export
                </Button>
              </DialogTrigger>
              <DialogContent>
                <DialogTitle>Exported JSON</DialogTitle>
                <Textarea readOnly value={exportedJson || ''} className="h-40 font-mono" />
                <Button
                  onClick={copyToClipboard}
                  variant="outline"
                  className="flex items-center gap-1 mt-2"
                >
                  <Copy size={16} />
                  Copy
                </Button>
              </DialogContent>
            </Dialog>
            <Button size="sm" variant="destructive" onClick={onClear} className="flex items-center gap-1">
              <Trash2 size={16} />
              Clear
            </Button>
          </Panel>
        </ReactFlow>
      </div>

      {/* Node configuration panel */}
      {selectedNode && <NodeConfigPanel />}
    </div>
  );
}
