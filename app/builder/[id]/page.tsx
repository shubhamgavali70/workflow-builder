// app/builder/page.tsx
'use client';

import { useEffect } from 'react';
import dynamic from 'next/dynamic';
import { ReactFlowProvider } from 'reactflow';
import { useBuilderStore } from '@/app/lib/store';
import { loadFlow } from '@/app/lib/utils';
import { useParams } from "next/navigation";

// Load the Builder component dynamically to avoid SSR issues with ReactFlow
const Builder = dynamic(
  () => import('@/app/builder/components/Builder'),
  { ssr: false }
);

export default function BuilderPage() {
  const { setNodes, setEdges } = useBuilderStore();
  const { id } = useParams(); // Extracts the UUID from the dynamic route

  const workflowId = id as string;
  console.log(workflowId);
  // Load saved flow on mount if available
  useEffect(() => {
    const savedFlow = loadFlow();
    if (savedFlow) {
      setNodes(savedFlow.nodes);
      setEdges(savedFlow.edges);
    }
  }, [setNodes, setEdges]);

  return (
    <ReactFlowProvider>
      <div className="h-screen w-full">
        <Builder />
      </div>
    </ReactFlowProvider>
  );
}