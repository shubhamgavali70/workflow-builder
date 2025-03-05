// app/lib/store.ts
import { create } from 'zustand';
import { 
  Edge,
  addEdge, 
  Connection, 
  EdgeChange, 
  NodeChange, 
  applyNodeChanges, 
  applyEdgeChanges,
  MarkerType
} from 'reactflow';
import { v4 as uuidv4 } from 'uuid';
import { AgentNodeData, CustomNode, ToolNodeData, WorkflowNodeData } from './types';

interface BuilderStore {
  nodes: CustomNode[];
  edges: Edge[];
  selectedNode: CustomNode | null;
  
  // Nodes operations
  setNodes: (nodes: CustomNode[]) => void;
  addNode: (
    type: 'agent' | 'workflow' | 'tool', 
    position: { x: number, y: number }, 
    initialData?: Partial<AgentNodeData | WorkflowNodeData | ToolNodeData>
  ) => void;
  onNodesChange: (changes: NodeChange[]) => void;
  updateNodeData: (nodeId: string, data: Partial<AgentNodeData | WorkflowNodeData | ToolNodeData>) => void;
  
  // Edges operations
  setEdges: (edges: Edge[]) => void;
  onEdgesChange: (changes: EdgeChange[]) => void;
  onConnect: (connection: Connection) => void;
  
  // Selection
  setSelectedNode: (node: CustomNode | null) => void;
}

export const useBuilderStore = create<BuilderStore>((set, get) => ({
  nodes: [],
  edges: [],
  selectedNode: null,
  
  setNodes: (nodes) => set({ nodes }),
  
  addNode: (type, position, initialData = {}) => {
    // Create base data depending on node type
    const baseData = {
      name: `New ${type}`,
      node_id: uuidv4(),
      type,
      ...(type === 'agent' ? {
        instructions: [],
        top_level_node: get().nodes.length === 0 // First node is top level
      } : {}),
      ...(type === 'workflow' ? {
        graph: {
          nodes: [],
          edges: []
        }
      } : {}),
      ...(type === 'tool' ? {
        connected_to: ''
      } : {})
    };

    // Merge with any initial data provided
    const newNode: CustomNode = {
      id: uuidv4(),
      position,
      type,
      data: {
        ...baseData,
        ...initialData
      }
    };
    
    set({
      nodes: [...get().nodes, newNode],
      selectedNode: newNode // Auto-select the new node
    });

    return newNode;
  },
  
  onNodesChange: (changes) => {
    set({
      nodes: applyNodeChanges(changes, get().nodes) as CustomNode[],
    });
    
    // Update selected node if it was changed
    const selectedId = get().selectedNode?.id;
    if (selectedId) {
      const updatedNode = get().nodes.find(node => node.id === selectedId) || null;
      set({ selectedNode: updatedNode });
    }
  },
  
  updateNodeData: (nodeId, newData) => {
    // Create a new array with the updated node
    const updatedNodes = get().nodes.map(node => {
      if (node.id === nodeId) {
        // Create a new node object with the updated data
        const updatedNode = {
          ...node,
          data: {
            ...node.data,
            ...newData
          }
        };
        
        // If this is the currently selected node, update the selectedNode reference too
        if (get().selectedNode && get().selectedNode.id === nodeId) {
          set({ selectedNode: updatedNode });
        }
        
        return updatedNode;
      }
      return node;
    });
    
    // Update the nodes state
    set({ nodes: updatedNodes });
  },
  
  setEdges: (edges) => set({ edges }),
  
  onEdgesChange: (changes) => {
    set({
      edges: applyEdgeChanges(changes, get().edges),
    });
  },
  
  onConnect: (connection) => {
    // When connecting a tool to a node, update the tool's connected_to property
    const { source, target } = connection;
    if (source && target) {
      const sourceNode = get().nodes.find(node => node.id === source);
      if (sourceNode?.data.type === 'tool') {
        get().updateNodeData(sourceNode.id, {
          connected_to: target
        } as Partial<ToolNodeData>);
      }
    }
    
    set({
      edges: addEdge(
        { 
          ...connection, 
          id: `e-${uuidv4()}`,
          type: 'smoothstep',
          animated: true,
          markerEnd: {
            type: MarkerType.ArrowClosed,
            width: 20,
            height: 20,
          },
          style: { 
            strokeWidth: 2 
          },
        }, 
        get().edges
      ),
    });
  },
  
  setSelectedNode: (node) => set({ selectedNode: node }),
}));