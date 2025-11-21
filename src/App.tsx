import { useEffect, useMemo } from 'react';
import ReactFlow, { Controls, MiniMap, Background, Handle, Position } from 'reactflow';
import type { Node, Edge } from 'reactflow';   
import { useStore } from './store';

const initialNodes: Node<{ label: string }>[]  = [
  { id: 'extract', position: { x: 100, y: 100 }, data: { label: 'Extract Users' } },
  { id: 'transform', position: { x: 300, y: 50 }, data: { label: 'Transform Data' } },
  { id: 'validate', position: { x: 300, y: 150 }, data: { label: 'Validate' } },
  { id: 'load', position: { x: 500, y: 100 }, data: { label: 'Load to DB' } },
  { id: 'notify', position: { x: 700, y: 100 }, data: { label: 'Send Notification' } },
];

const initialEdges: Edge[] = [
  { id: 'e1', source: 'extract', target: 'transform' },
  { id: 'e2', source: 'extract', target: 'validate' },
  { id: 'e3', source: 'transform', target: 'load' },
  { id: 'e4', source: 'validate', target: 'load' },
  { id: 'e5', source: 'load', target: 'notify' },
];

const statusColor = {
  pending: 'bg-slate-400',
  running: 'bg-blue-500 animate-pulse',
  success: 'bg-green-500',
  failed: 'bg-red-500',
};

function CustomNode({ data, id }: any) {
  const { nodeStatus } = useStore();
  const status = nodeStatus[id]?.status || 'pending';

  return (
    <div className={`px-4 py-3 rounded-lg text-white font-semibold shadow-lg transition-all duration-500 ${statusColor[status]}`}>
      <Handle type="target" position={Position.Top} />
      <div>{data.label}</div>
      <div className="text-xs mt-1 opacity-90">{status.toUpperCase()}</div>
      <Handle type="source" position={Position.Bottom} />
    </div>
  );
}

const nodeTypes = { custom: CustomNode };

export default function App() {
  const { nodeStatus, selectedNode, setSelectedNode, setNodeStatus } = useStore();

  const nodes = useMemo(() => initialNodes.map(node => ({
    ...node,
    type: 'custom',
    data: { ...node.data, status: nodeStatus[node.id]?.status || 'pending' }
  })), [nodeStatus]);

  useEffect(() => {
    const nodes = ['extract', 'transform', 'validate', 'load', 'notify'];
    const statuses = ['running', 'success', 'failed'] as const;

    const interval = setInterval(() => {
      const randomNode = nodes[Math.floor(Math.random() * nodes.length)];
      const newStatus = statuses[Math.floor(Math.random() * statuses.length)];
      const error = newStatus === 'failed' ? 'Timeout / DB Error' : undefined;
      setNodeStatus(randomNode, { status: newStatus, error });
    }, 2500 + Math.random() * 3000);

    return () => clearInterval(interval);
  }, [setNodeStatus]);

  const selectedData = selectedNode ? nodeStatus[selectedNode] : null;

  return (
    <div className="w-screen h-screen flex">
      <ReactFlow
        nodes={nodes}
        edges={initialEdges}
        nodeTypes={nodeTypes}
        onNodeClick={(_, node) => setSelectedNode(node.id)}
        fitView
      >
        <Controls />
        <MiniMap />
        <Background />
      </ReactFlow>

      {/* Side Panel */}
      {selectedNode && (
        <div className="w-96 bg-gray-900 text-white p-6 overflow-y-auto">
          <h2 className="text-2xl font-bold mb-4">{selectedNode.toUpperCase()}</h2>
          <div className="space-y-4">
            <div><strong>Status:</strong> <span className={`ml-2 px-3 py-1 rounded ${statusColor[nodeStatus[selectedNode]?.status || 'pending']}`}>{nodeStatus[selectedNode]?.status || 'pending'}</span></div>
            <div><strong>Last Updated:</strong> {selectedData?.timestamp ? new Date(selectedData.timestamp).toLocaleTimeString() : '-'}</div>
            {selectedData?.error && <div className="bg-red-900 p-3 rounded"><strong>Error:</strong> {selectedData.error}</div>}
            <button className="bg-blue-600 hover:bg-blue-700 px-4 py-2 rounded">View Full Logs →</button>
            <button className="bg-green-600 hover:bg-green-700 px-4 py-2 rounded ml-2">Retry Node</button>
          </div>
          <button onClick={() => setSelectedNode(null)} className="absolute top-4 right-4 text-2xl">×</button>
        </div>
      )}
    </div>
  );
}