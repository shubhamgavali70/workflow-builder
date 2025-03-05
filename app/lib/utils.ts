// app/lib/utils.ts
import { type ClassValue, clsx } from "clsx";
import { twMerge } from "tailwind-merge";
import { Edge, Node } from "reactflow";
import { CustomNodeData } from "./types";

/**
 * Combine class names with tailwindcss
 */
export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

/**
 * Save the current flow to local storage
 */
export function saveFlow(
  nodes: Node<CustomNodeData>[],
  edges: Edge[],
  name: string = "default-flow"
) {
  if (typeof window === "undefined") return;
  
  const flow = { nodes, edges };
  localStorage.setItem(`flow-${name}`, JSON.stringify(flow));
  return flow;
}

/**
 * Load a flow from local storage
 */
export function loadFlow(name: string = "default-flow") {
  if (typeof window === "undefined") return null;
  
  const flow = localStorage.getItem(`flow-${name}`);
  if (!flow) return null;
  
  return JSON.parse(flow) as { nodes: Node<CustomNodeData>[], edges: Edge[] };
}

/**
 * Generate a unique ID
 */
export function generateId() {
  return Math.random().toString(36).substring(2, 9);
}

/**
 * Helper to export the flow as JSON
 */
export function exportFlow(
  nodes: Node<CustomNodeData>[],
  edges: Edge[],
  filename: string = "workflow.json"
) {
  const flow = { nodes, edges };
  const jsonString = JSON.stringify(flow, null, 2);
  const blob = new Blob([jsonString], { type: "application/json" });
  const url = URL.createObjectURL(blob);

  const a = document.createElement("a");
  a.href = url;
  a.download = filename;
  document.body.appendChild(a);
  a.click();
  document.body.removeChild(a);
  URL.revokeObjectURL(url);
}

/**
 * Convert a workflow to a format suitable for API submission
 */
export function workflowToApiPayload(
  nodes: Node<CustomNodeData>[],
  edges: Edge[]
) {
  // Find the top level node
  const topLevelNode = nodes.find(
    (node) => 
      node.data.type === "agent" && 
      node.data.top_level_node
  );

  if (!topLevelNode) {
    throw new Error("No top level node found in workflow");
  }

  // Collect all tools
  const tools = nodes.filter(
    (node) => node.data.type === "tool"
  );

  // Collect all workflows
  const workflows = nodes.filter(
    (node) => node.data.type === "workflow"
  );

  // Build the payload
  return {
    top_level_node: {
      node_id: topLevelNode.data.node_id,
      name: topLevelNode.data.name,
      instructions: topLevelNode.data.instructions,
    },
    tools: tools.map(tool => ({
      node_id: tool.data.node_id,
      name: tool.data.name,
      connected_to: tool.data.connected_to,
    })),
    workflows: workflows.map(workflow => ({
      node_id: workflow.data.node_id,
      name: workflow.data.name,
      graph: workflow.data.graph,
    })),
    connections: edges.map(edge => ({
      source: edge.source,
      target: edge.target,
    })),
  };
}