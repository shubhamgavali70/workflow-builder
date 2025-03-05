// app/lib/types.ts
import { Edge, Node } from 'reactflow';

export type NodeType = 'agent' | 'workflow' | 'tool';

export interface BaseNodeData {
  name: string;
  node_id: string;
  type: NodeType;
}

export interface AgentNodeData extends BaseNodeData {
  type: 'agent';
  instructions: string[];
  top_level_node: boolean;
}

export interface WorkflowNodeData extends BaseNodeData {
  type: 'workflow';
  graph: {
    nodes: CustomNode[];
    edges: Edge[];
  };
}

export interface ToolNodeData extends BaseNodeData {
  type: 'tool';
  connected_to: string; // node_id of the node this tool is connected to
}

export type CustomNodeData = AgentNodeData | WorkflowNodeData | ToolNodeData;

export interface CustomNode extends Node {
  data: CustomNodeData;
}