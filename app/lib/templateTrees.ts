// app/lib/templateTrees.ts
import { v4 as uuidv4 } from 'uuid';
import { CustomNode } from './types';
import { Edge } from 'reactflow';

export interface TemplateTree {
  id: string;
  name: string;
  description: string;
  nodes: CustomNode[];
  edges: Edge[];
}

// Helper to create unique IDs for template trees
// This ensures that when we add a template tree to the main workflow,
// it doesn't have conflicting IDs with existing nodes
const createUniqueIds = (nodes: CustomNode[], edges: Edge[]): { nodes: CustomNode[], edges: Edge[] } => {
  // Create a mapping of old IDs to new IDs
  const idMap: Record<string, string> = {};
  
  // Create new nodes with unique IDs
  const newNodes = nodes.map(node => {
    const newId = uuidv4();
    idMap[node.id] = newId;
    
    return {
      ...node,
      id: newId,
      data: {
        ...node.data,
        node_id: uuidv4(), // Also create a new node_id
      }
    };
  });
  
  // Update edges with the new IDs
  const newEdges = edges.map(edge => ({
    ...edge,
    id: `e-${uuidv4()}`,
    source: idMap[edge.source],
    target: idMap[edge.target],
  }));
  
  return { nodes: newNodes, edges: newEdges };
};

// A collection of predefined template trees
export const templateTrees: TemplateTree[] = [
  {
    id: 'content-moderation',
    name: 'Content Moderation Flow',
    description: 'A template for moderating user-generated content with agents and tools',
    nodes: [
      {
        id: 'agent-1',
        type: 'agent',
        position: { x: 250, y: 100 },
        data: {
          name: 'Content Filter',
          node_id: 'cf-1',
          type: 'agent',
          instructions: [
            'Filter incoming content for inappropriate material',
            'Flag content that violates community guidelines',
            'Route approved content to the publishing agent'
          ],
          top_level_node: false // Not a top level node
        }
      },
      {
        id: 'agent-2',
        type: 'agent',
        position: { x: 250, y: 300 },
        data: {
          name: 'Publishing Agent',
          node_id: 'pa-1',
          type: 'agent',
          instructions: [
            'Publish approved content to the appropriate channels',
            'Add metadata and categorization'
          ],
          top_level_node: false
        }
      },
      {
        id: 'tool-1',
        type: 'tool',
        position: { x: 50, y: 150 },
        data: {
          name: 'Text Analyzer',
          node_id: 'ta-1',
          type: 'tool',
          connected_to: 'agent-1'
        }
      },
      {
        id: 'tool-2',
        type: 'tool',
        position: { x: 450, y: 150 },
        data: {
          name: 'Image Scanner',
          node_id: 'is-1',
          type: 'tool',
          connected_to: 'agent-1'
        }
      },
      {
        id: 'tool-3',
        type: 'tool',
        position: { x: 450, y: 350 },
        data: {
          name: 'Publishing API',
          node_id: 'api-1',
          type: 'tool',
          connected_to: 'agent-2'
        }
      }
    ],
    edges: [
      {
        id: 'e1',
        source: 'tool-1',
        target: 'agent-1',
        type: 'smoothstep',
        animated: true
      },
      {
        id: 'e2',
        source: 'tool-2',
        target: 'agent-1',
        type: 'smoothstep',
        animated: true
      },
      {
        id: 'e3',
        source: 'agent-1',
        target: 'agent-2',
        type: 'smoothstep',
        animated: true
      },
      {
        id: 'e4',
        source: 'tool-3',
        target: 'agent-2',
        type: 'smoothstep',
        animated: true
      }
    ]
  },
  {
    id: 'customer-support',
    name: 'Customer Support Pipeline',
    description: 'A template for handling customer inquiries and routing them to the right departments',
    nodes: [
      {
        id: 'agent-1',
        type: 'agent',
        position: { x: 250, y: 100 },
        data: {
          name: 'Inquiry Classifier',
          node_id: 'ic-1',
          type: 'agent',
          instructions: [
            'Classify incoming customer inquiries by type',
            'Route to the appropriate department agent',
            'Prioritize urgent requests'
          ],
          top_level_node: false
        }
      },
      {
        id: 'agent-2',
        type: 'agent',
        position: { x: 100, y: 300 },
        data: {
          name: 'Technical Support',
          node_id: 'ts-1',
          type: 'agent',
          instructions: [
            'Handle technical product issues',
            'Provide troubleshooting guidance',
            'Escalate to engineering when needed'
          ],
          top_level_node: false
        }
      },
      {
        id: 'agent-3',
        type: 'agent',
        position: { x: 400, y: 300 },
        data: {
          name: 'Billing Support',
          node_id: 'bs-1',
          type: 'agent',
          instructions: [
            'Handle billing and payment inquiries',
            'Process refund requests',
            'Update customer billing information'
          ],
          top_level_node: false
        }
      },
      {
        id: 'tool-1',
        type: 'tool',
        position: { x: 50, y: 100 },
        data: {
          name: 'Language Detector',
          node_id: 'ld-1',
          type: 'tool',
          connected_to: 'agent-1'
        }
      },
      {
        id: 'tool-2',
        type: 'tool',
        position: { x: 50, y: 400 },
        data: {
          name: 'Knowledge Base',
          node_id: 'kb-1',
          type: 'tool',
          connected_to: 'agent-2'
        }
      },
      {
        id: 'tool-3',
        type: 'tool',
        position: { x: 400, y: 400 },
        data: {
          name: 'Billing System',
          node_id: 'bs-t-1',
          type: 'tool',
          connected_to: 'agent-3'
        }
      }
    ],
    edges: [
      {
        id: 'e1',
        source: 'tool-1',
        target: 'agent-1',
        type: 'smoothstep',
        animated: true
      },
      {
        id: 'e2',
        source: 'agent-1',
        target: 'agent-2',
        type: 'smoothstep',
        animated: true
      },
      {
        id: 'e3',
        source: 'agent-1',
        target: 'agent-3',
        type: 'smoothstep',
        animated: true
      },
      {
        id: 'e4',
        source: 'tool-2',
        target: 'agent-2',
        type: 'smoothstep',
        animated: true
      },
      {
        id: 'e5',
        source: 'tool-3',
        target: 'agent-3',
        type: 'smoothstep',
        animated: true
      }
    ]
  }
];

// Function to get a template tree with unique IDs
export const getTemplateTree = (templateId: string): { nodes: CustomNode[], edges: Edge[] } | null => {
  const template = templateTrees.find(t => t.id === templateId);
  if (!template) return null;
  
  return createUniqueIds(template.nodes, template.edges);
};

// Function to add a template tree to the existing workflow
export const addTemplateToWorkflow = (
  templateId: string,
  existingNodes: CustomNode[],
  existingEdges: Edge[],
  position = { x: 100, y: 100 }
): { nodes: CustomNode[], edges: Edge[] } => {
  const template = getTemplateTree(templateId);
  if (!template) return { nodes: existingNodes, edges: existingEdges };
  
  // Adjust the position of all nodes in the template
  // This is to prevent the template from overlapping with existing nodes
  const adjustedNodes = template.nodes.map(node => ({
    ...node,
    position: {
      x: node.position.x + position.x,
      y: node.position.y + position.y,
    }
  }));
  
  return {
    nodes: [...existingNodes, ...adjustedNodes],
    edges: [...existingEdges, ...template.edges]
  };
};