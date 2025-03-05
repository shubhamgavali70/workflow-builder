// app/builder/components/TemplateTreePanel.tsx
import { useCallback } from 'react';
import { useBuilderStore } from '@/app/lib/store';
import { Button } from '@/components/ui/button';
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
  DialogFooter,
  DialogClose,
} from '@/components/ui/dialog';
import { PlusCircle, FileCode, FolderTree } from 'lucide-react';
import { templateTrees, addTemplateToWorkflow } from '@/app/lib/templateTrees';

export default function TemplateTreePanel() {
  const { nodes, edges, setNodes, setEdges } = useBuilderStore();

  const handleAddTemplate = useCallback((templateId: string) => {
    const result = addTemplateToWorkflow(
      templateId, 
      nodes, 
      edges, 
      { x: Math.random() * 300, y: Math.random() * 300 } // Random position to avoid overlap
    );
    
    setNodes(result.nodes);
    setEdges(result.edges);
  }, [nodes, edges, setNodes, setEdges]);

  return (
    <Dialog>
      <DialogTrigger asChild>
        <Button 
          variant="outline" 
          className="flex items-center gap-2"
          size="sm"
        >
          <FolderTree size={16} />
          Add Template Tree
        </Button>
      </DialogTrigger>
      <DialogContent className="sm:max-w-[625px]">
        <DialogHeader>
          <DialogTitle>Add Template Tree</DialogTitle>
          <DialogDescription>
            Select a pre-configured template tree to add to your workflow. 
            These templates include predefined agents and tools that you can modify after adding.
          </DialogDescription>
        </DialogHeader>
        
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 py-4 max-h-[60vh] overflow-y-auto">
          {templateTrees.map((template) => (
            <Card key={template.id} className="flex flex-col">
              <CardHeader className="pb-2">
                <CardTitle className="text-lg">{template.name}</CardTitle>
                <CardDescription>{template.description}</CardDescription>
              </CardHeader>
              <CardContent className="py-2">
                <div className="text-sm">
                  <div className="flex items-center gap-2 mb-1">
                    <div className="flex-1">Agents:</div>
                    <div className="font-medium">
                      {template.nodes.filter(n => n.type === 'agent').length}
                    </div>
                  </div>
                  <div className="flex items-center gap-2">
                    <div className="flex-1">Tools:</div>
                    <div className="font-medium">
                      {template.nodes.filter(n => n.type === 'tool').length}
                    </div>
                  </div>
                </div>
              </CardContent>
              <CardFooter className="mt-auto pt-2">
                <DialogClose asChild>
                  <Button 
                    className="w-full flex items-center gap-2" 
                    onClick={() => handleAddTemplate(template.id)}
                  >
                    <PlusCircle size={16} />
                    Add to Workflow
                  </Button>
                </DialogClose>
              </CardFooter>
            </Card>
          ))}
        </div>
        
        <DialogFooter>
          <DialogClose asChild>
            <Button variant="outline">Cancel</Button>
          </DialogClose>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}