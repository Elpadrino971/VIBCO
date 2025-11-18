'use client';

import React, { useCallback, useState } from 'react';
import ReactFlow, {
  Node,
  Edge,
  addEdge,
  Background,
  Controls,
  MiniMap,
  Connection,
  useNodesState,
  useEdgesState,
  MarkerType,
  Panel,
} from 'reactflow';
import 'reactflow/dist/style.css';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';

// Types de nœuds disponibles
const nodeTypes = [
  { type: 'trigger', label: '⚡ Trigger', color: '#10b981' },
  { type: 'action', label: '⚙️ Action', color: '#3b82f6' },
  { type: 'condition', label: '🔀 Condition', color: '#f59e0b' },
  { type: 'delay', label: '⏱️ Delay', color: '#8b5cf6' },
  { type: 'api', label: '🌐 API Call', color: '#ec4899' },
  { type: 'database', label: '🗄️ Database', color: '#14b8a6' },
  { type: 'email', label: '📧 Email', color: '#ef4444' },
  { type: 'webhook', label: '🔗 Webhook', color: '#6366f1' },
];

// Nœuds initiaux
const initialNodes: Node[] = [
  {
    id: '1',
    type: 'input',
    data: { label: '⚡ Webhook Trigger' },
    position: { x: 250, y: 50 },
    style: { background: '#10b981', color: 'white', border: '2px solid #059669' },
  },
];

const initialEdges: Edge[] = [];

export function WorkflowBuilder() {
  const [nodes, setNodes, onNodesChange] = useNodesState(initialNodes);
  const [edges, setEdges, onEdgesChange] = useEdgesState(initialEdges);
  const [selectedNodeType, setSelectedNodeType] = useState('action');
  const [nodeIdCounter, setNodeIdCounter] = useState(2);

  // Connexion de nœuds
  const onConnect = useCallback(
    (params: Connection) =>
      setEdges((eds) =>
        addEdge(
          {
            ...params,
            animated: true,
            style: { stroke: '#3b82f6' },
            markerEnd: { type: MarkerType.ArrowClosed, color: '#3b82f6' },
          },
          eds
        )
      ),
    [setEdges]
  );

  // Ajout d'un nouveau nœud
  const addNode = () => {
    const nodeTypeInfo = nodeTypes.find((nt) => nt.type === selectedNodeType);
    if (!nodeTypeInfo) return;

    const newNode: Node = {
      id: String(nodeIdCounter),
      type: 'default',
      data: { label: nodeTypeInfo.label },
      position: {
        x: Math.random() * 400 + 100,
        y: Math.random() * 400 + 100,
      },
      style: {
        background: nodeTypeInfo.color,
        color: 'white',
        border: `2px solid ${nodeTypeInfo.color}`,
        borderRadius: '8px',
        padding: '10px',
      },
    };

    setNodes((nds) => [...nds, newNode]);
    setNodeIdCounter((id) => id + 1);
  };

  // Suppression de nœud
  const deleteNode = (nodeId: string) => {
    setNodes((nds) => nds.filter((n) => n.id !== nodeId));
    setEdges((eds) => eds.filter((e) => e.source !== nodeId && e.target !== nodeId));
  };

  // Export du workflow
  const exportWorkflow = () => {
    const workflow = {
      nodes: nodes.map((n) => ({
        id: n.id,
        type: n.type,
        label: n.data.label,
        position: n.position,
      })),
      edges: edges.map((e) => ({
        source: e.source,
        target: e.target,
      })),
    };

    const dataStr = JSON.stringify(workflow, null, 2);
    const dataBlob = new Blob([dataStr], { type: 'application/json' });
    const url = URL.createObjectURL(dataBlob);
    const link = document.createElement('a');
    link.href = url;
    link.download = 'workflow.json';
    link.click();
  };

  // Import de workflow
  const importWorkflow = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = (e) => {
      try {
        const workflow = JSON.parse(e.target?.result as string);
        setNodes(
          workflow.nodes.map((n: any) => ({
            id: n.id,
            type: n.type || 'default',
            data: { label: n.label },
            position: n.position,
          }))
        );
        setEdges(
          workflow.edges.map((e: any) => ({
            id: `${e.source}-${e.target}`,
            source: e.source,
            target: e.target,
          }))
        );
      } catch (error) {
        console.error('Error importing workflow:', error);
        alert('Error importing workflow');
      }
    };
    reader.readAsText(file);
  };

  // Génération vers N8N
  const generateN8N = () => {
    const n8nWorkflow = {
      name: 'Generated Workflow',
      nodes: nodes.map((node, index) => ({
        parameters: {},
        id: node.id,
        name: node.data.label,
        type: 'n8n-nodes-base.httpRequest',
        typeVersion: 1,
        position: [node.position.x, node.position.y],
      })),
      connections: {},
      settings: {
        executionOrder: 'v1',
      },
    };

    // Créer les connexions
    edges.forEach((edge) => {
      const sourceNode = nodes.find((n) => n.id === edge.source);
      if (sourceNode) {
        const sourceName = sourceNode.data.label;
        if (!n8nWorkflow.connections[sourceName]) {
          n8nWorkflow.connections[sourceName] = { main: [[]] };
        }

        const targetNode = nodes.find((n) => n.id === edge.target);
        if (targetNode) {
          n8nWorkflow.connections[sourceName].main[0].push({
            node: targetNode.data.label,
            type: 'main',
            index: 0,
          });
        }
      }
    });

    const dataStr = JSON.stringify(n8nWorkflow, null, 2);
    const dataBlob = new Blob([dataStr], { type: 'application/json' });
    const url = URL.createObjectURL(dataBlob);
    const link = document.createElement('a');
    link.href = url;
    link.download = 'n8n-workflow.json';
    link.click();
  };

  return (
    <div className="h-screen flex flex-col">
      {/* Toolbar */}
      <div className="bg-white border-b p-4">
        <div className="container mx-auto flex items-center justify-between">
          <h1 className="text-2xl font-bold">🔄 Workflow Builder 2.0</h1>

          <div className="flex items-center gap-4">
            <select
              value={selectedNodeType}
              onChange={(e) => setSelectedNodeType(e.target.value)}
              className="border rounded px-3 py-2"
            >
              {nodeTypes.map((nt) => (
                <option key={nt.type} value={nt.type}>
                  {nt.label}
                </option>
              ))}
            </select>

            <Button onClick={addNode} size="sm">
              ➕ Add Node
            </Button>

            <div className="flex gap-2">
              <Button onClick={exportWorkflow} variant="outline" size="sm">
                💾 Export
              </Button>

              <label>
                <input
                  type="file"
                  accept=".json"
                  onChange={importWorkflow}
                  className="hidden"
                />
                <Button variant="outline" size="sm" onClick={() => {}}>
                  📂 Import
                </Button>
              </label>

              <Button onClick={generateN8N} variant="outline" size="sm">
                🔧 Export N8N
              </Button>
            </div>
          </div>
        </div>
      </div>

      {/* Flow Canvas */}
      <div className="flex-1">
        <ReactFlow
          nodes={nodes}
          edges={edges}
          onNodesChange={onNodesChange}
          onEdgesChange={onEdgesChange}
          onConnect={onConnect}
          fitView
          attributionPosition="bottom-left"
        >
          <Background color="#aaa" gap={16} />
          <Controls />
          <MiniMap
            nodeColor={(node) => {
              const style = node.style as any;
              return style?.background || '#3b82f6';
            }}
            nodeStrokeWidth={3}
            zoomable
            pannable
          />

          <Panel position="top-left" className="bg-white p-4 rounded-lg shadow-lg">
            <div className="space-y-2">
              <h3 className="font-bold">📊 Stats</h3>
              <p className="text-sm">Nodes: {nodes.length}</p>
              <p className="text-sm">Connections: {edges.length}</p>
            </div>
          </Panel>

          <Panel position="bottom-right" className="bg-white p-4 rounded-lg shadow-lg">
            <div className="space-y-2">
              <h3 className="font-bold text-sm">🎨 Node Types</h3>
              <div className="grid grid-cols-2 gap-2">
                {nodeTypes.map((nt) => (
                  <div
                    key={nt.type}
                    className="flex items-center gap-2 text-xs"
                  >
                    <div
                      className="w-3 h-3 rounded"
                      style={{ background: nt.color }}
                    />
                    <span>{nt.label}</span>
                  </div>
                ))}
              </div>
            </div>
          </Panel>
        </ReactFlow>
      </div>

      {/* Instructions */}
      <div className="bg-gray-50 border-t p-3">
        <div className="container mx-auto flex items-center justify-between text-sm text-gray-600">
          <div className="flex gap-6">
            <span>💡 Drag nodes to position them</span>
            <span>🔗 Click and drag from one node to another to connect</span>
            <span>🗑️ Select a node and press Delete to remove</span>
          </div>
          <span className="font-medium">Coding 2.0 - Visual Workflow Builder</span>
        </div>
      </div>
    </div>
  );
}
