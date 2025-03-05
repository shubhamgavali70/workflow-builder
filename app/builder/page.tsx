// app/builder/page.tsx
'use client';

import { useEffect } from 'react';
import dynamic from 'next/dynamic';
import { ReactFlowProvider } from 'reactflow';
import { useBuilderStore } from '@/app/lib/store';
import { loadFlow } from '@/app/lib/utils';

// Load the Builder component dynamically to avoid SSR issues with ReactFlow
const Builder = dynamic(
  () => import('@/app/builder/components/Builder'),
  { ssr: false }
);

export default function BuilderPage() {
  const { setNodes, setEdges } = useBuilderStore();

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