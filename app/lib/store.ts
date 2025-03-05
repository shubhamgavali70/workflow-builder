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
import { getTemplateTree } from './templateTrees';

interface BuilderStore {
  nodes: CustomNode[];
  edges: Edge[];
  selectedNode: CustomNode | null;
  
  // Nodes operations
  setNodes: (nodes: CustomNode[]) => void;
  addNode: (type: 'agent' | 'workflow' | 'tool', position: { x: number, y: number }) => void;
  onNodesChange: (changes: NodeChange[]) => void;
  updateNodeData: (nodeId: string, data: Partial<AgentNodeData | WorkflowNodeData | ToolNodeData>) => void;
  
  // Edges operations
  setEdges: (edges: Edge[]) => void;
  onEdgesChange: (changes: EdgeChange[]) => void;
  onConnect: (connection: Connection) => void;
  
  // Selection
  setSelectedNode: (node: CustomNode | null) => void;
  
  // Template Tree operations
  addTemplateTree: (templateId: string, position: { x: number, y: number }) => void;
}

export const useBuilderStore = create<BuilderStore>((set, get) => ({
  nodes: [],
  edges: [],
  selectedNode: null,
  
  setNodes: (nodes) => set({ nodes }),
  
  addNode: (type, position) => {
    const newNode: CustomNode = {
      id: uuidv4(),
      position,
      type,
      data: {
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
      }
    };
    
    set({
      nodes: [...get().nodes, newNode],
      selectedNode: newNode // Auto-select the new node
    });
  },
  
  onNodesChange: (changes) => {
    // Store the current nodes before applying changes
    const currentNodes = get().nodes;
    const currentEdges = get().edges;
    
    // Check for node removals before applying changes
    changes.forEach(change => {
      if (change.type === 'remove') {
        const nodeToRemove = currentNodes.find(node => node.id === change.id);
        if (nodeToRemove) {
          // Find all workflow nodes
          const workflowNodes = currentNodes.filter(node => 
            node.data.type === 'workflow' && 
            node.id !== change.id // Don't include the node being removed if it's a workflow
          );
          
          // Update each workflow node's graph data
          workflowNodes.forEach(workflowNode => {
            const workflowData = workflowNode.data as WorkflowNodeData;
            
            // Check if the removed node is part of this workflow's graph
            const containsNode = workflowData.graph.nodes.some(n => n.id === change.id);
            
            if (containsNode) {
              // Remove the node from the workflow's graph
              const updatedNodes = workflowData.graph.nodes.filter(n => n.id !== change.id);
              
              // Also remove any edges connected to this node from the workflow's graph
              const updatedEdges = workflowData.graph.edges.filter(e => 
                e.source !== change.id && e.target !== change.id
              );
              
              // Update the workflow node data
              get().updateNodeData(workflowNode.id, {
                graph: {
                  nodes: updatedNodes,
                  edges: updatedEdges
                }
              } as Partial<WorkflowNodeData>);
            }
          });
          
          // If the node being removed is a workflow, we need to handle that specially
          if (nodeToRemove.data.type === 'workflow') {
            // Nothing special needed here, the node and its internal graph will be removed
          }
          
          // If the node being removed is a tool, clear any connected_to references
          if (nodeToRemove.data.type === 'tool') {
            // Find and remove any edges connected to this tool
            const edgesToRemove = currentEdges.filter(edge => 
              edge.source === change.id || edge.target === change.id
            );
            
            // Remove these edges
            if (edgesToRemove.length > 0) {
              const edgeChanges = edgesToRemove.map(edge => ({
                type: 'remove' as const,
                id: edge.id
              }));
              
              get().onEdgesChange(edgeChanges);
            }
          }
        }
      }
    });
    
    // Apply the node changes
    const updatedNodes = applyNodeChanges(changes, currentNodes) as CustomNode[];
    set({ nodes: updatedNodes });
    
    // Update selected node if it was changed
    const selectedId = get().selectedNode?.id;
    if (selectedId) {
      const updatedNode = updatedNodes.find(node => node.id === selectedId) || null;
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
  
  onConnect: (connection) => {
    // When connecting a tool to a node, update the tool's connected_to property
    const { source, target } = connection;
    if (source && target) {
      const sourceNode = get().nodes.find(node => node.id === source);
      const targetNode = get().nodes.find(node => node.id === target);
      
      // Update tool's connected_to property
      if (sourceNode?.data.type === 'tool') {
        get().updateNodeData(sourceNode.id, {
          connected_to: target
        } as Partial<ToolNodeData>);
      }
      
      // If connecting to a workflow node, update its graph data
      if (targetNode?.data.type === 'workflow') {
        const workflowData = targetNode.data as WorkflowNodeData;
        
        // Add the source node to the workflow's graph if it's not already there
        if (!workflowData.graph.nodes.some(n => n.id === sourceNode?.id)) {
          get().updateNodeData(targetNode.id, {
            graph: {
              ...workflowData.graph,
              nodes: [...workflowData.graph.nodes, sourceNode as CustomNode]
            }
          } as Partial<WorkflowNodeData>);
        }
      }
      
      // If connecting from a workflow node, update its graph data
      if (sourceNode?.data.type === 'workflow') {
        const workflowData = sourceNode.data as WorkflowNodeData;
        
        // Add the target node to the workflow's graph if it's not already there
        if (!workflowData.graph.nodes.some(n => n.id === targetNode?.id)) {
          get().updateNodeData(sourceNode.id, {
            graph: {
              ...workflowData.graph,
              nodes: [...workflowData.graph.nodes, targetNode as CustomNode]
            }
          } as Partial<WorkflowNodeData>);
        }
      }
    }
    
    // Create the new edge
    const newEdge = {
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
    };
    
    // Update workflow graph edges for both source and target if they are workflow nodes
    const newEdges = addEdge(newEdge, get().edges);
    
    // After adding the edge, update any workflow node's graph edges
    if (source && target) {
      const sourceNode = get().nodes.find(node => node.id === source);
      const targetNode = get().nodes.find(node => node.id === target);
      
      // Update source workflow node graph
      if (sourceNode?.data.type === 'workflow') {
        const workflowData = sourceNode.data as WorkflowNodeData;
        get().updateNodeData(sourceNode.id, {
          graph: {
            ...workflowData.graph,
            edges: [...workflowData.graph.edges, newEdge]
          }
        } as Partial<WorkflowNodeData>);
      }
      
      // Update target workflow node graph
      if (targetNode?.data.type === 'workflow') {
        const workflowData = targetNode.data as WorkflowNodeData;
        get().updateNodeData(targetNode.id, {
          graph: {
            ...workflowData.graph,
            edges: [...workflowData.graph.edges, newEdge]
          }
        } as Partial<WorkflowNodeData>);
      }
    }
    
    set({ edges: newEdges });
  },
  
  onEdgesChange: (changes) => {
    // Get the current edges before applying changes
    const currentEdges = get().edges;
    
    // Apply edge changes
    const updatedEdges = applyEdgeChanges(changes, currentEdges);
    
    // Check for edge removals and update workflow node graphs
    changes.forEach(change => {
      if (change.type === 'remove') {
        const removedEdge = currentEdges.find(edge => edge.id === change.id);
        if (removedEdge) {
          const { source, target } = removedEdge;
          
          // Update source node if it's a workflow
          const sourceNode = get().nodes.find(node => node.id === source);
          if (sourceNode?.data.type === 'workflow') {
            const workflowData = sourceNode.data as WorkflowNodeData;
            get().updateNodeData(sourceNode.id, {
              graph: {
                ...workflowData.graph,
                edges: workflowData.graph.edges.filter(edge => edge.id !== removedEdge.id)
              }
            } as Partial<WorkflowNodeData>);
          }
          
          // Update target node if it's a workflow
          const targetNode = get().nodes.find(node => node.id === target);
          if (targetNode?.data.type === 'workflow') {
            const workflowData = targetNode.data as WorkflowNodeData;
            get().updateNodeData(targetNode.id, {
              graph: {
                ...workflowData.graph,
                edges: workflowData.graph.edges.filter(edge => edge.id !== removedEdge.id),
                // Also remove the source node if there are no other connections to it
                nodes: workflowData.graph.nodes.filter(node => {
                  // Keep the node if it's not the source node or if there are other edges connecting to it
                  return node.id !== source || 
                    currentEdges.some(e => 
                      (e.id !== removedEdge.id) && 
                      ((e.source === source && e.target === targetNode.id) || 
                       (e.target === source && e.source === targetNode.id))
                    );
                })
              }
            } as Partial<WorkflowNodeData>);
          }
          
          // If this was a tool node connection, clear its connected_to property
          if (sourceNode?.data.type === 'tool') {
            get().updateNodeData(sourceNode.id, {
              connected_to: ''
            } as Partial<ToolNodeData>);
          }
        }
      }
    });
    
    set({ edges: updatedEdges });
  },
  
  setSelectedNode: (node) => set({ selectedNode: node }),
  
  // Add a template tree to the workflow
  addTemplateTree: (templateId, position) => {
    const template = getTemplateTree(templateId);
    if (!template) return;

    // Adjust positions based on provided position
    const adjustedNodes = template.nodes.map(node => ({
      ...node,
      position: {
        x: node.position.x + position.x,
        y: node.position.y + position.y,
      }
    }));

    set({
      nodes: [...get().nodes, ...adjustedNodes],
      edges: [...get().edges, ...template.edges]
    });
  }
}));