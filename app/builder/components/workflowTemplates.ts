// app/builder/components/workflowTemplates.ts
import { v4 as uuidv4 } from 'uuid';
import { AgentNodeData, ToolNodeData } from '@/app/lib/types';

export const WORKFLOW_TEMPLATES = {
  empty: {
    name: 'Empty Workflow',
    nodes: [],
    edges: []
  },
  basic: {
    name: 'Basic Agent + Tool',
    nodes: [
      {
        id: 'template-agent-1',
        type: 'agent',
        position: { x: 250, y: 100 },
        data: {
          name: 'Primary Agent',
          node_id: uuidv4(),
          type: 'agent',
          instructions: ['Handle user requests', 'Delegate to tools when needed'],
          top_level_node: true
        } as AgentNodeData
      },
      {
        id: 'template-tool-1',
        type: 'tool',
        position: { x: 250, y: 250 },
        data: {
          name: 'Helper Tool',
          node_id: uuidv4(),
          type: 'tool',
          connected_to: ''
        } as ToolNodeData
      }
    ],
    edges: [
      {
        id: `e-${uuidv4()}`,
        source: 'template-agent-1',
        target: 'template-tool-1',
        type: 'smoothstep',
        animated: true
      }
    ]
  },
  complex: {
    name: 'Multi-Agent Workflow',
    nodes: [
      {
        id: 'template-agent-1',
        type: 'agent',
        position: { x: 250, y: 50 },
        data: {
          name: 'Coordinator Agent',
          node_id: uuidv4(),
          type: 'agent',
          instructions: ['Coordinate between specialized agents', 'Provide final responses'],
          top_level_node: true
        } as AgentNodeData
      },
      {
        id: 'template-agent-2',
        type: 'agent',
        position: { x: 100, y: 200 },
        data: {
          name: 'Research Agent',
          node_id: uuidv4(),
          type: 'agent',
          instructions: ['Perform in-depth research', 'Extract key information'],
          top_level_node: false
        } as AgentNodeData
      },
      {
        id: 'template-agent-3',
        type: 'agent',
        position: { x: 400, y: 200 },
        data: {
          name: 'Writing Agent',
          node_id: uuidv4(),
          type: 'agent',
          instructions: ['Format information clearly', 'Create coherent responses'],
          top_level_node: false
        } as AgentNodeData
      },
      {
        id: 'template-tool-1',
        type: 'tool',
        position: { x: 100, y: 350 },
        data: {
          name: 'Search Tool',
          node_id: uuidv4(),
          type: 'tool',
          connected_to: ''
        } as ToolNodeData
      },
      {
        id: 'template-tool-2',
        type: 'tool',
        position: { x: 400, y: 350 },
        data: {
          name: 'Formatting Tool',
          node_id: uuidv4(),
          type: 'tool',
          connected_to: ''
        } as ToolNodeData
      }
    ],
    edges: [
      {
        id: `e-${uuidv4()}`,
        source: 'template-agent-1',
        target: 'template-agent-2',
        type: 'smoothstep',
        animated: true
      },
      {
        id: `e-${uuidv4()}`,
        source: 'template-agent-1',
        target: 'template-agent-3',
        type: 'smoothstep',
        animated: true
      },
      {
        id: `e-${uuidv4()}`,
        source: 'template-agent-2',
        target: 'template-tool-1',
        type: 'smoothstep',
        animated: true
      },
      {
        id: `e-${uuidv4()}`,
        source: 'template-agent-3',
        target: 'template-tool-2',
        type: 'smoothstep',
        animated: true
      }
    ]
  }
};