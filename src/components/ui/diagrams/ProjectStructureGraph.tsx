import { useCallback } from 'react';
import {
  ReactFlow,
  useNodesState,
  useEdgesState,
  addEdge,
  Controls,
  Background,
  ReactFlowProvider,
  type Node,
  type Edge,
  Handle,
  Position
} from '@xyflow/react';
import '@xyflow/react/dist/style.css';

// --- Custom Node Component ---
const GlassNode = ({ data, isConnectable }: any) => {
  return (
    <div className="group relative min-w-[140px] rounded-xl border border-[hsl(var(--bc)/0.1)] bg-[hsl(var(--b1)/0.6)] px-3 py-2 shadow-xl backdrop-blur-md transition-all hover:border-[hsl(var(--a)/0.5)] hover:bg-[hsl(var(--b2)/0.8)] hover:shadow-[0_0_20px_hsl(var(--a)/0.1)]">
      <Handle type="target" position={Position.Top} className="!bg-[hsl(var(--a))] !w-3 !h-3 !-top-1.5 opacity-0 group-hover:opacity-100 transition-opacity" isConnectable={isConnectable} />
      
      <div className="flex items-center gap-3">
        <div className={`flex h-10 w-10 items-center justify-center rounded-lg ${data.type === 'folder' ? 'bg-[hsl(var(--a)/0.1)] text-[hsl(var(--a))]' : 'bg-blue-500/10 text-blue-500'}`}>
          {data.type === 'folder' ? (
             <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M20 20a2 2 0 0 0 2-2V8a2 2 0 0 0-2-2h-7.9a2 2 0 0 1-1.69-.9L9.6 3.9A2 2 0 0 0 7.93 3H4a2 2 0 0 0-2 2v13a2 2 0 0 0 2 2Z"/></svg>
          ) : (
             <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M15 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V7Z"/><path d="M14 2v4a2 2 0 0 0 2 2h4"/></svg>
          )}
        </div>
        <div className="flex flex-col">
          <span className="text-sm font-bold text-[hsl(var(--bc))] group-hover:text-[hsl(var(--a))] transition-colors">{data.label}</span>
          <span className="text-[10px] uppercase tracking-wider text-[hsl(var(--bc)/0.5)]">{data.desc || 'Component'}</span>
        </div>
      </div>
      
      <Handle type="source" position={Position.Bottom} className="!bg-[hsl(var(--a))] !w-3 !h-3 !-bottom-1.5 opacity-0 group-hover:opacity-100 transition-opacity" isConnectable={isConnectable} />
    </div>
  );
};

const nodeTypes = {
  glass: GlassNode,
};

// --- Initial Data ---
const initialNodes: Node[] = [
  { id: '1', type: 'glass', position: { x: 250, y: 0 }, data: { label: 'Project Root', type: 'folder', desc: 'Repo' } },
  { id: '2', type: 'glass', position: { x: 100, y: 120 }, data: { label: 'src', type: 'folder', desc: 'Source' } },
  { id: '3', type: 'glass', position: { x: 400, y: 120 }, data: { label: 'public', type: 'folder', desc: 'Assets' } },
  { id: '4', type: 'glass', position: { x: 0, y: 240 }, data: { label: 'components', type: 'folder', desc: 'UI Lib' } },
  { id: '5', type: 'glass', position: { x: 200, y: 240 }, data: { label: 'pages', type: 'folder', desc: 'Routes' } },
  { id: '6', type: 'glass', position: { x: 380, y: 360 }, data: { label: 'index.astro', type: 'file', desc: 'Home' } },
  { id: '7', type: 'glass', position: { x: -50, y: 360 }, data: { label: 'ui', type: 'folder', desc: 'Shadcn' } },
];

const initialEdges: Edge[] = [
  { id: 'e1-2', source: '1', target: '2', animated: true, style: { stroke: 'hsl(var(--a))' } },
  { id: 'e1-3', source: '1', target: '3', animated: true, style: { stroke: 'hsl(var(--a))' } },
  { id: 'e2-4', source: '2', target: '4', animated: true, style: { stroke: 'hsl(var(--a))' } },
  { id: 'e2-5', source: '2', target: '5', animated: true, style: { stroke: 'hsl(var(--a))' } },
  { id: 'e5-6', source: '5', target: '6', animated: true, type: 'smoothstep', style: { stroke: 'hsl(var(--s))' } },
  { id: 'e4-7', source: '4', target: '7', animated: true, type: 'smoothstep', style: { stroke: 'hsl(var(--s))' } },
];

const Flow = () => {
  const [nodes, , onNodesChange] = useNodesState(initialNodes);
  const [edges, setEdges, onEdgesChange] = useEdgesState(initialEdges);

  const onConnect = useCallback(
    (params: any) => setEdges((eds) => addEdge(params, eds)),
    [setEdges],
  );

  return (
    <div className="h-[400px] sm:h-[500px] w-full rounded-2xl border border-[hsl(var(--bc)/0.1)] bg-[hsl(var(--b1)/0.5)] overflow-hidden backdrop-blur-md relative">
      <ReactFlow
        nodes={nodes}
        edges={edges}
        onNodesChange={onNodesChange}
        onEdgesChange={onEdgesChange}
        onConnect={onConnect}
        nodeTypes={nodeTypes}
        fitView
        proOptions={{ hideAttribution: true }}
        className="bg-transparent [&_.react-flow__attribution]:!hidden"
      >
        <Controls 
          className="!bg-transparent !border-none !shadow-none [&_button]:!bg-[hsl(var(--b2))] [&_button]:!border-[hsl(var(--bc)/0.2)] [&_button]:!border-b-[hsl(var(--bc)/0.2)] [&_button]:!text-[hsl(var(--bc))] [&_button:hover]:!bg-[hsl(var(--a)/0.2)] [&_svg]:!fill-current [&_path]:!fill-current" 
        />
        <Background color="hsl(var(--bc))" gap={16} size={1} className="opacity-10" />
      </ReactFlow>
    </div>
  );
};

export default function ProjectStructureGraph() {
  return (
    <ReactFlowProvider>
      <Flow />
    </ReactFlowProvider>
  );
}
