import { useEffect, useMemo } from 'react';
import ReactFlow, {
  Controls,
  MiniMap,
  Background,
  Handle,
  Position,
  useNodesState,
  useEdgesState,
  type Node as RFNode,
  type Edge as RFEdge,
} from 'reactflow';
// reactflow styles are imported once in `src/main.tsx`

import { useStore, type NodeStatusType } from './store';

type CustomNode = RFNode<{ label: string }>;
type CustomEdge = RFEdge;

const initialNodes: CustomNode[] = [
  { id: 'extract', position: { x: 100, y: 100 }, data: { label: 'Extract Users' }, type: 'custom' },
  { id: 'transform', position: { x: 300, y: 50 }, data: { label: 'Transform Data' }, type: 'custom' },
  { id: 'validate', position: { x: 300, y: 150 }, data: { label: 'Validate' }, type: 'custom' },
  { id: 'load', position: { x: 500, y: 100 }, data: { label: 'Load to DB' }, type: 'custom' },
  { id: 'notify', position: { x: 700, y: 100 }, data: { label: 'Send Notification' }, type: 'custom' },
];

const initialEdges: CustomEdge[] = [
  { id: 'e1', source: 'extract', target: 'transform' },
  { id: 'e2', source: 'extract', target: 'validate' },
  { id: 'e3', source: 'transform', target: 'load' },
  { id: 'e4', source: 'validate', target: 'load' },
  { id: 'e5', source: 'load', target: 'notify' },
];

const statusColor: Record<NodeStatusType, string> = {
  pending: 'bg-gray-600 border-gray-400',
  running: 'bg-blue-600 border-blue-400 animate-pulse',
  success: 'bg-green-600 border-green-400',
  failed: 'bg-red-600 border-red-400',
};

function CustomNode({ data, id }: any) {
  const { nodeStatus } = useStore();
  const status = nodeStatus[id]?.status || 'pending';

  return (
    <div className={`px-6 py-4 rounded-xl text-white font-bold shadow-2xl border-4 transition-all duration-500 ${statusColor[status]}`}>
      <Handle type="target" position={Position.Top} className="w-3 h-3" />
      <div className="text-lg">{data.label}</div>
      <div className="text-sm mt-1 opacity-90">{status.toUpperCase()}</div>
      <Handle type="source" position={Position.Bottom} className="w-3 h-3" />
    </div>
  );
}

// nodeTypes will be memoized inside the component to keep a stable reference

export default function App() {
  const { nodeStatus, selectedNode, setSelectedNode, setNodeStatus } = useStore();

  const [edges] = useEdgesState(initialEdges);

  const nodeTypes = useMemo(() => ({ custom: CustomNode }), []);

  useEffect(() => {
    const interval = setInterval(() => {
      const nodeIds = ['extract', 'transform', 'validate', 'load', 'notify'];
      const randomId = nodeIds[Math.floor(Math.random() * nodeIds.length)];
      const statuses: NodeStatusType[] = ['running', 'success', 'failed'];
      const newStatus = statuses[Math.floor(Math.random() * statuses.length)];
      const error = newStatus === 'failed' ? 'Timeout / DB Error' : undefined;
      setNodeStatus(randomId, { status: newStatus, error });
    }, 3000);

    return () => clearInterval(interval);
  }, [setNodeStatus]);

  const selectedData = selectedNode ? nodeStatus[selectedNode] : null;

  return (
    <div className="w-screen h-screen bg-gray-950 flex" style={{ width: '100vw', height: '100vh' }}>
      <div className="flex-1" style={{ width: '100%', height: '100%' }}>
        <ReactFlow
          nodes={nodes}
          edges={edges}
          nodeTypes={nodeTypes}
          onNodeClick={(_, node) => setSelectedNode(node.id)}
          fitView
          style={{ width: '100%', height: '100%', background: '#0f172a' }}
        >
          <Background color="#374151" gap={20} />
          <Controls className="bg-gray-800 border-gray-700 text-white" />
          <MiniMap className="bg-gray-900" />
        </ReactFlow>
      </div>

      {selectedNode && selectedData && (
        <div className="w-96 bg-gray-900 border-l border-gray-700 p-8 relative">
          <button onClick={() => setSelectedNode(null)} className="absolute top-4 right-4 text-3xl hover:text-red-500">×</button>
          <h2 className="text-3xl font-bold text-white mb-6">{selectedNode.toUpperCase()}</h2>
          <div className="space-y-5 text-lg">
            <div>
              <strong className="text-gray-400">Status:</strong>{' '}
              <span className={`ml-3 px-4 py-2 rounded-lg font-bold ${statusColor[selectedData.status]}`}>
                {selectedData.status.toUpperCase()}
              </span>
            </div>
            <div><strong className="text-gray-400">Last Updated:</strong> {new Date(selectedData.timestamp).toLocaleTimeString()}</div>
            {selectedData.error && (
              <div className="bg-red-900/50 border border-red-700 p-4 rounded-lg">
                <strong className="text-red-400">Error:</strong> {selectedData.error}
              </div>
            )}
            <div className="flex gap-3 mt-8">
              <button className="bg-blue-600 hover:bg-blue-700 px-6 py-3 rounded-lg font-bold">View Full Logs →</button>
              <button className="bg-green-600 hover:bg-green-700 px-6 py-3 rounded-lg font-bold">Retry Node</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}