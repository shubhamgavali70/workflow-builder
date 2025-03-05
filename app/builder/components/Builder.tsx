// app/builder/components/Builder.tsx
'use client';

import { useCallback, useRef, useState, useEffect } from 'react';
import ReactFlow, {
  Background,
  Controls,
  MiniMap,
  NodeTypes,
  Panel,
  SelectionMode,
  OnDrop,
  OnDragOver,
} from 'reactflow';
import 'reactflow/dist/style.css';

import { useBuilderStore } from '@/app/lib/store';
import Sidebar from './Sidebar';
import NodeConfigPanel from './NodeConfigPanel';
import AgentNode from './NodeTypes/AgentNode';
import WorkflowNode from './NodeTypes/WorkflowNode';
import ToolNode from './NodeTypes/ToolNode';
import WorkflowEditor from './WorkflowEditor';
import WorkflowCreationDialog from './WorkflowCreationDialog';

import { Button } from '@/components/ui/button';
import { 
  Download, 
  Save, 
  Trash2
} from 'lucide-react';

const nodeTypes: NodeTypes = {
  agent: AgentNode,
  workflow: WorkflowNode,
  tool: ToolNode,
};

export default function Builder() {
  const reactFlowWrapper = useRef<HTMLDivElement>(null);
  const [reactFlowInstance, setReactFlowInstance] = useState<any>(null);
  const [isWorkflowEditorOpen, setIsWorkflowEditorOpen] = useState(false);
  const [selectedWorkflowNodeId, setSelectedWorkflowNodeId] = useState<string | null>(null);
  
  const {
    nodes,
    edges,
    selectedNode,
    onNodesChange,
    onEdgesChange,
    onConnect,
    setSelectedNode,
    addNode
  } = useBuilderStore();

  useEffect(() => {
    // Listen for workflow editor open events
    const handleOpenWorkflowEditor = (event: CustomEvent) => {
      const { nodeId } = event.detail;
      setSelectedWorkflowNodeId(nodeId);
      setIsWorkflowEditorOpen(true);
    };

    window.addEventListener('open-workflow-editor' as any, handleOpenWorkflowEditor as EventListener);

    return () => {
      window.removeEventListener('open-workflow-editor' as any, handleOpenWorkflowEditor as EventListener);
    };
  }, []);

  const onDragOver: OnDragOver = useCallback((event) => {
    event.preventDefault();
    event.dataTransfer.dropEffect = 'move';
  }, []);

  const onDrop: OnDrop = useCallback(
    (event) => {
      event.preventDefault();

      const reactFlowBounds = reactFlowWrapper.current?.getBoundingClientRect();
      const type = event.dataTransfer.getData('application/reactflow') as 'agent' | 'workflow' | 'tool';

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
    // Save workflow to backend or localStorage
    const flow = { nodes, edges };
    localStorage.setItem('saved-flow', JSON.stringify(flow));
    alert('Flow saved successfully!');
  }, [nodes, edges]);

  const onExport = useCallback(() => {
    // Export workflow as JSON
    const flow = { nodes, edges };
    const jsonString = JSON.stringify(flow, null, 2);
    const blob = new Blob([jsonString], { type: 'application/json' });
    const url = URL.createObjectURL(blob);

    const a = document.createElement('a');
    a.href = url;
    a.download = 'workflow.json';
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  }, [nodes, edges]);

  const onClear = useCallback(() => {
    if (window.confirm('Are you sure you want to clear the canvas? This action cannot be undone.')) {
      useBuilderStore.setState({ nodes: [], edges: [], selectedNode: null });
    }
  }, []);

  const handleWorkflowCreated = (nodeId: string) => {
    // Optionally open the workflow editor immediately after creation
    setSelectedWorkflowNodeId(nodeId);
    setIsWorkflowEditorOpen(true);
  };

  const closeWorkflowEditor = () => {
    setIsWorkflowEditorOpen(false);
    setSelectedWorkflowNodeId(null);
  };

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
            <Button 
              size="sm" 
              variant="outline" 
              onClick={onSave}
              className="flex items-center gap-1"
            >
              <Save size={16} />
              Save
            </Button>
            <Button 
              size="sm" 
              variant="outline" 
              onClick={onExport}
              className="flex items-center gap-1"
            >
              <Download size={16} />
              Export
            </Button>
            <Button 
              size="sm" 
              variant="destructive" 
              onClick={onClear}
              className="flex items-center gap-1"
            >
              <Trash2 size={16} />
              Clear
            </Button>
          </Panel>
          
          <Panel position="bottom-center" className="mb-4">
            <WorkflowCreationDialog onCreated={handleWorkflowCreated} />
          </Panel>
        </ReactFlow>
      </div>

      {/* Node configuration panel */}
      {selectedNode && <NodeConfigPanel />}
      
      {/* Workflow Editor Dialog */}
      <WorkflowEditor 
        isOpen={isWorkflowEditorOpen}
        onClose={closeWorkflowEditor}
        workflowNodeId={selectedWorkflowNodeId}
      />
    </div>
  );
}