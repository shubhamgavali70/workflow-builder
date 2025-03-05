// app/builder/components/TemplateTreeEditor.tsx
import { useState } from 'react';
import { Button } from '@/components/ui/button';
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
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Pencil, Save, Trash, Plus, X } from 'lucide-react';
import { CustomNode } from '@/app/lib/types';
import { Edge } from 'reactflow';
import { TemplateTree, templateTrees } from '@/app/lib/templateTrees';
import { Textarea } from '@/components/ui/textarea';
import { 
  Table, 
  TableBody, 
  TableCaption, 
  TableCell, 
  TableHead, 
  TableHeader, 
  TableRow 
} from '@/app/components/ui/table';
import { ScrollArea } from '@/app/components/ui/scroll-area';

interface TemplateTreeEditorProps {
  onSave: (template: { nodes: CustomNode[], edges: Edge[] }) => void;
}

export default function TemplateTreeEditor({ onSave }: TemplateTreeEditorProps) {
  const [selectedTemplate, setSelectedTemplate] = useState<TemplateTree | null>(null);
  const [editedNodes, setEditedNodes] = useState<CustomNode[]>([]);
  const [editedEdges, setEditedEdges] = useState<Edge[]>([]);
  const [editingNodeId, setEditingNodeId] = useState<string | null>(null);
  const [nodeName, setNodeName] = useState('');
  const [nodeInstructions, setNodeInstructions] = useState<string[]>([]);
  const [newInstruction, setNewInstruction] = useState('');
  
  const handleSelectTemplate = (templateId: string) => {
    const template = templateTrees.find(t => t.id === templateId);
    if (template) {
      setSelectedTemplate(template);
      setEditedNodes([...template.nodes]);
      setEditedEdges([...template.edges]);
    }
  };
  
  const handleEditNode = (nodeId: string) => {
    const node = editedNodes.find(n => n.id === nodeId);
    if (node) {
      setEditingNodeId(nodeId);
      setNodeName(node.data.name);
      setNodeInstructions(node.data.type === 'agent' ? node.data.instructions : []);
    }
  };
  
  const handleSaveNodeEdit = () => {
    if (!editingNodeId) return;
    
    setEditedNodes(editedNodes.map(node => {
      if (node.id === editingNodeId) {
        return {
          ...node,
          data: {
            ...node.data,
            name: nodeName,
            ...(node.data.type === 'agent' ? { instructions: nodeInstructions } : {})
          }
        };
      }
      return node;
    }));
    
    setEditingNodeId(null);
  };
  
  const handleAddInstruction = () => {
    if (newInstruction.trim()) {
      setNodeInstructions([...nodeInstructions, newInstruction.trim()]);
      setNewInstruction('');
    }
  };
  
  const handleRemoveInstruction = (index: number) => {
    setNodeInstructions(nodeInstructions.filter((_, i) => i !== index));
  };
  
  const handleSaveTemplate = () => {
    if (!selectedTemplate) return;
    onSave({ nodes: editedNodes, edges: editedEdges });
  };
  
  return (
    <Dialog>
      <DialogTrigger asChild>
        <Button 
          variant="outline" 
          className="flex items-center gap-2"
          size="sm"
        >
          <Pencil size={16} />
          Edit Template Trees
        </Button>
      </DialogTrigger>
      <DialogContent className="sm:max-w-[80vw] max-h-[90vh] overflow-hidden">
        <DialogHeader>
          <DialogTitle>Edit Template Trees</DialogTitle>
          <DialogDescription>
            Modify existing template trees before adding them to your workflow.
          </DialogDescription>
        </DialogHeader>
        
        <div className="flex h-[70vh]">
          {/* Template Selection Sidebar */}
          <div className="w-64 border-r p-4">
            <h3 className="font-medium mb-4">Template Trees</h3>
            <div className="space-y-2">
              {templateTrees.map((template) => (
                <Button
                  key={template.id}
                  variant={selectedTemplate?.id === template.id ? "default" : "outline"}
                  className="w-full justify-start"
                  onClick={() => handleSelectTemplate(template.id)}
                >
                  {template.name}
                </Button>
              ))}
            </div>
          </div>
          
          {/* Template Editor */}
          <div className="flex-1 p-4 overflow-hidden">
            {selectedTemplate ? (
              <Tabs defaultValue="nodes" className="h-full flex flex-col">
                <TabsList>
                  <TabsTrigger value="nodes">Nodes</TabsTrigger>
                  <TabsTrigger value="edges">Connections</TabsTrigger>
                </TabsList>
                
                <TabsContent value="nodes" className="flex-1 overflow-hidden">
                  <ScrollArea className="h-[55vh]">
                    <Table>
                      <TableCaption>List of nodes in the template</TableCaption>
                      <TableHeader>
                        <TableRow>
                          <TableHead className="w-[100px]">Type</TableHead>
                          <TableHead>Name</TableHead>
                          <TableHead className="w-[150px]">Actions</TableHead>
                        </TableRow>
                      </TableHeader>
                      <TableBody>
                        {editedNodes.map((node) => (
                          <TableRow key={node.id}>
                            <TableCell className="font-medium capitalize">{node.data.type}</TableCell>
                            <TableCell>{node.data.name}</TableCell>
                            <TableCell>
                              <Button 
                                variant="outline" 
                                size="sm"
                                onClick={() => handleEditNode(node.id)}
                              >
                                Edit
                              </Button>
                            </TableCell>
                          </TableRow>
                        ))}
                      </TableBody>
                    </Table>
                  </ScrollArea>
                </TabsContent>
                
                <TabsContent value="edges" className="flex-1 overflow-hidden">
                  <ScrollArea className="h-[55vh]">
                    <Table>
                      <TableCaption>Connections between nodes</TableCaption>
                      <TableHeader>
                        <TableRow>
                          <TableHead>From</TableHead>
                          <TableHead>To</TableHead>
                          <TableHead className="w-[150px]">Type</TableHead>
                        </TableRow>
                      </TableHeader>
                      <TableBody>
                        {editedEdges.map((edge) => (
                          <TableRow key={edge.id}>
                            <TableCell>
                              {editedNodes.find(n => n.id === edge.source)?.data.name || 'Unknown'}
                            </TableCell>
                            <TableCell>
                              {editedNodes.find(n => n.id === edge.target)?.data.name || 'Unknown'}
                            </TableCell>
                            <TableCell>{edge.type || 'standard'}</TableCell>
                          </TableRow>
                        ))}
                      </TableBody>
                    </Table>
                  </ScrollArea>
                </TabsContent>
              </Tabs>
            ) : (
              <div className="flex h-full items-center justify-center text-muted-foreground">
                Select a template to edit
              </div>
            )}
          </div>
          
          {/* Node Edit Panel */}
          {editingNodeId && (
            <div className="w-72 border-l p-4 overflow-auto">
              <div className="flex items-center justify-between mb-4">
                <h3 className="font-medium">Edit Node</h3>
                <Button 
                  size="icon" 
                  variant="ghost" 
                  onClick={() => setEditingNodeId(null)}
                >
                  <X size={16} />
                </Button>
              </div>
              
              <div className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="node-name">Node Name</Label>
                  <Input 
                    id="node-name" 
                    value={nodeName} 
                    onChange={(e) => setNodeName(e.target.value)} 
                  />
                </div>
                
                {nodeInstructions !== undefined && (
                  <div className="space-y-2">
                    <Label>Instructions</Label>
                    <div className="space-y-2 max-h-60 overflow-y-auto">
                      {nodeInstructions.map((instruction, index) => (
                        <div key={index} className="flex items-center gap-2">
                          <div className="flex-1 text-sm border p-2 rounded">
                            {instruction}
                          </div>
                          <Button 
                            size="icon" 
                            variant="ghost" 
                            onClick={() => handleRemoveInstruction(index)}
                            className="h-8 w-8 text-destructive"
                          >
                            <Trash size={14} />
                          </Button>
                        </div>
                      ))}
                    </div>
                    
                    <div className="flex items-center space-x-2 mt-2">
                      <Input
                        placeholder="Add instruction..."
                        value={newInstruction}
                        onChange={(e) => setNewInstruction(e.target.value)}
                        onKeyDown={(e) => {
                          if (e.key === 'Enter') {
                            e.preventDefault();
                            handleAddInstruction();
                          }
                        }}
                      />
                      <Button 
                        size="sm" 
                        onClick={handleAddInstruction}
                        disabled={!newInstruction.trim()}
                      >
                        <Plus size={16} />
                      </Button>
                    </div>
                  </div>
                )}
                
                <Button 
                  className="w-full mt-4" 
                  onClick={handleSaveNodeEdit}
                >
                  Save Changes
                </Button>
              </div>
            </div>
          )}
        </div>
        
        <DialogFooter>
          <DialogClose asChild>
            <Button variant="outline">Cancel</Button>
          </DialogClose>
          <DialogClose asChild>
            <Button onClick={handleSaveTemplate} disabled={!selectedTemplate}>
              Apply Template
            </Button>
          </DialogClose>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}