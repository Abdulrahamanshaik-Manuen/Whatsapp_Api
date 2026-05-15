import React, { useState, useCallback, useRef, useEffect } from 'react';
import {
  ReactFlow,
  MiniMap,
  Controls,
  Background,
  useNodesState,
  useEdgesState,
  addEdge,
  Panel,
  Handle,
  Position,
  useReactFlow,
  ReactFlowProvider
} from '@xyflow/react';
import '@xyflow/react/dist/style.css';
import {
  Save, Play, X, Zap, MessageSquare,
  Settings, Trash2, ChevronLeft, Clock
} from 'lucide-react';
import axios from 'axios';

const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || 'http://localhost:5000/api';

const nodeStyles = "px-4 py-3 rounded-2xl border-2 shadow-xl bg-white min-w-[200px] transition-all cursor-pointer hover:scale-[1.02]";

const TriggerNode = ({ data, selected }) => (
  <div className={`${nodeStyles}`} style={{ borderColor: selected ? '#E74C3C' : '#FADBD8' }}>
    <div className="flex items-center gap-3 mb-2">
      <div className="w-8 h-8 bg-red-50 text-red-500 rounded-xl flex items-center justify-center">
        <Zap size={16} fill="currentColor" />
      </div>
      <div className="flex-1">
        <p className="text-[10px] font-black text-red-500 uppercase tracking-widest leading-none">Trigger</p>
        <h4 className="text-xs font-black text-slate-800 tracking-tight mt-1">
          {data.config?.keywords?.length > 0 ? `Keywords: ${data.config.keywords.join(', ')}` : 'No keywords set'}
        </h4>
      </div>
    </div>
    <Handle type="source" position={Position.Bottom} style={{ background: '#E74C3C' }} />
  </div>
);

const MessageNode = ({ data, selected }) => (
  <div className={`${nodeStyles}`} style={{ borderColor: selected ? '#06D6A0' : '#D1F2EB' }}>
    <Handle type="target" position={Position.Top} style={{ background: '#06D6A0' }} />
    <div className="flex items-center gap-3 mb-2">
      <div className="w-8 h-8 bg-emerald-50 text-emerald-500 rounded-xl flex items-center justify-center">
        <MessageSquare size={16} fill="currentColor" />
      </div>
      <div className="flex-1">
        <p className="text-[10px] font-black text-emerald-500 uppercase tracking-widest leading-none">Action</p>
        <h4 className="text-xs font-black text-slate-800 tracking-tight mt-1">Send Text</h4>
      </div>
    </div>
    <p className="text-[9px] text-slate-400 font-bold line-clamp-2 bg-slate-50 p-2 rounded-lg italic">
      {data.config?.message || 'Empty message...'}
    </p>
    <Handle type="source" position={Position.Bottom} style={{ background: '#06D6A0' }} />
  </div>
);

const WaitNode = ({ data, selected }) => (
  <div className={`${nodeStyles}`} style={{ borderColor: selected ? '#8E44AD' : '#EBDEF0' }}>
    <Handle type="target" position={Position.Top} style={{ background: '#8E44AD' }} />
    <div className="flex items-center gap-3 mb-2">
      <div className="w-8 h-8 bg-purple-50 text-purple-500 rounded-xl flex items-center justify-center">
        <Clock size={16} />
      </div>
      <div className="flex-1">
        <p className="text-[10px] font-black text-purple-500 uppercase tracking-widest leading-none">Logic</p>
        <h4 className="text-xs font-black text-slate-800 tracking-tight mt-1">
          {data.config?.variableName ? `Save as: {{${data.config.variableName}}}` : 'Wait for Reply'}
        </h4>
      </div>
    </div>
    <Handle type="source" position={Position.Bottom} style={{ background: '#8E44AD' }} />
  </div>
);

const nodeTypes = {
  triggerNode: TriggerNode,
  messageNode: MessageNode,
  waitNode: WaitNode
};

const initialNodes = [
  {
    id: 'node_1',
    type: 'triggerNode',
    position: { x: 250, y: 50 },
    data: { label: 'Keyword: hello', config: { type: 'keyword', keywords: ['hello'], matchType: 'exact' } }
  },
];

const initialEdges = [];

let id = 0;
const getId = () => `node_${Date.now()}_${id++}`;

function BuilderCanvas({ onClose, automation }) {
  const [nodes, setNodes, onNodesChange] = useNodesState(automation?.nodes || initialNodes);
  const [edges, setEdges, onEdgesChange] = useEdgesState(automation?.edges || initialEdges);
  const [selectedNode, setSelectedNode] = useState(null);
  const [workflowInfo, setWorkflowInfo] = useState({
    name: automation?.name || 'My New Workflow',
    description: automation?.description || 'Automated WhatsApp conversation'
  });
  const [isSaving, setIsSaving] = useState(false);
  const [showSettings, setShowSettings] = useState(!!automation);
  const [clients, setClients] = useState([]);
  const [selectedClientId, setSelectedClientId] = useState(automation?.clientId?._id || automation?.clientId || '');

  const user = JSON.parse(localStorage.getItem('user') || '{}');
  const isAdmin = user.role === 'admin';

  useEffect(() => {
    if (isAdmin) {
      fetchClients();
    }
  }, [isAdmin]);

  const fetchClients = async () => {
    try {
      const token = localStorage.getItem('token');
      const response = await axios.get(`${API_BASE_URL}/admin/users`, {
        headers: { 'Authorization': `Bearer ${token}` }
      });
      setClients(response.data.users);
    } catch (err) {
      console.error("Failed to fetch clients:", err);
    }
  };

  useEffect(() => {
    if (automation) {
      setShowSettings(true);
      setWorkflowInfo({
        name: automation.name,
        description: automation.description || ''
      });
    }
  }, [automation]);

  const reactFlowWrapper = useRef(null);
  const { screenToFlowPosition, fitView } = useReactFlow();

  useEffect(() => {
    setTimeout(() => fitView({ padding: 0.2 }), 100);
  }, [fitView]);

  const onConnect = useCallback(
    (params) => setEdges((eds) => addEdge({ ...params, animated: true, style: { stroke: '#06D6A0', strokeWidth: 3 } }, eds)),
    []
  );

  const onNodeAdd = useCallback((type) => {
    const position = {
      x: Math.random() * 200 + 100,
      y: Math.random() * 200 + 100,
    };

    const newNode = {
      id: getId(),
      type,
      position,
      data: {
        label: `New ${type.replace('Node', '')}`,
        config: type === 'triggerNode' ? { type: 'keyword', matchType: 'exact', keywords: [] } : {}
      },
    };

    setNodes((nds) => nds.concat(newNode));
  }, [setNodes]);

  const onDragOver = useCallback((event) => {
    event.preventDefault();
    event.dataTransfer.dropEffect = 'move';
  }, []);

  const onDrop = useCallback(
    (event) => {
      event.preventDefault();

      const type = event.dataTransfer.getData('application/reactflow');

      if (typeof type === 'undefined' || !type) return;

      const position = screenToFlowPosition({
        x: event.clientX,
        y: event.clientY,
      });

      const newNode = {
        id: getId(),
        type,
        position,
        data: {
          label: `New ${type.replace('Node', '')}`,
          config: type === 'triggerNode' ? { type: 'keyword', matchType: 'exact', keywords: [] } : {}
        },
      };

      setNodes((nds) => nds.concat(newNode));
    },
    [screenToFlowPosition]
  );

  const onNodeClick = (event, node) => {
    setSelectedNode(node);
  };

  const updateNodeConfig = (config) => {
    setNodes((nds) =>
      nds.map((node) => {
        if (node.id === selectedNode.id) {
          return {
            ...node,
            data: {
              ...node.data,
              config: { ...node.data.config, ...config },
            },
          };
        }
        return node;
      })
    );
    setSelectedNode(prev => ({ ...prev, data: { ...prev.data, config: { ...prev.data.config, ...config } } }));
  };

  const handleSave = async (newStatus = null) => {
    try {
      setIsSaving(true);
      const token = localStorage.getItem('token');

      // Ensure status is a string, not an event object
      const statusToSave = (typeof newStatus === 'string') ? newStatus : (automation?.status || 'active');

      const workflowData = {
        name: workflowInfo.name || 'My New Workflow',
        description: workflowInfo.description || 'Automated WhatsApp conversation',
        nodes: nodes,
        edges: edges,
        status: statusToSave,
        clientId: selectedClientId || automation?.clientId || null
      };

      let response;
      if (automation?._id) {
        response = await axios.put(`${API_BASE_URL}/automations/${automation._id}`, workflowData, {
          headers: { 'Authorization': `Bearer ${token}` }
        });
      } else {
        response = await axios.post(`${API_BASE_URL}/automations`, workflowData, {
          headers: { 'Authorization': `Bearer ${token}` }
        });
      }

      console.log("[Automation Builder] Workflow saved:", response.data);
      alert("Workflow saved successfully!");
    } catch (err) {
      const errorMsg = err.response?.data?.error || err.message;
      console.error("[Automation Builder] Save failed:", errorMsg);
      alert(`Failed to save: ${errorMsg}`);
    } finally {
      setIsSaving(false);
    }
  };

  const handleTestFlow = async () => {
    alert("Test Flow initiated. This will simulate a keyword trigger 'hello'. Check your WhatsApp or backend logs.");
    // In a real scenario, this would call an API endpoint to simulate a webhook
  };

  return (
    <div className="flex h-screen bg-[#f1f5f9] overflow-hidden font-sans">
      {/* Node Sidebar */}
      <aside className="w-80 bg-white border-r border-slate-200 flex flex-col z-10 shadow-2xl">
        <div className="p-6 border-b border-slate-100 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-primary rounded-2xl flex items-center justify-center text-white shadow-xl shadow-primary/20">
              <Zap size={20} fill="currentColor" />
            </div>
            <h2 className="text-xl font-black text-slate-800 tracking-tighter">Flow Builder</h2>
          </div>
          <button onClick={onClose} className="p-2 hover:bg-slate-50 rounded-xl transition-all">
            <ChevronLeft size={20} className="text-slate-400" />
          </button>
        </div>

        <div className="flex-1 overflow-y-auto p-6 space-y-8 custom-scrollbar">
          <NodeSection title="Triggers" onNodeAdd={onNodeAdd} nodes={[
            { type: 'triggerNode', label: 'Trigger', icon: Zap, color: 'text-red-500 bg-red-50' },
          ]} />

          <NodeSection title="Actions" onNodeAdd={onNodeAdd} nodes={[
            { type: 'messageNode', label: 'Send Text', icon: MessageSquare, color: 'text-emerald-500 bg-emerald-50' },
          ]} />

          <NodeSection title="Logic" onNodeAdd={onNodeAdd} nodes={[
            { type: 'waitNode', label: 'Wait for Reply', icon: Clock, color: 'text-purple-500 bg-purple-50' },
          ]} />
        </div>

        <div className="p-6 border-t border-slate-100 space-y-3 bg-slate-50/50">
          <button
            onClick={() => handleSave()}
            disabled={isSaving}
            className="w-full flex items-center justify-center gap-2 px-6 py-3.5 bg-slate-900 text-white text-[11px] font-black rounded-2xl hover:bg-slate-800 transition-all uppercase tracking-widest shadow-xl shadow-slate-200 disabled:opacity-50"
          >
            <Save size={16} />
            {isSaving ? 'Saving...' : 'Save Workflow'}
          </button>
        </div>
      </aside>

      {/* Canvas Area */}
      <div className="flex-1 relative h-full w-full" ref={reactFlowWrapper}>
        <ReactFlow
          nodes={nodes}
          edges={edges}
          onNodesChange={onNodesChange}
          onEdgesChange={onEdgesChange}
          onConnect={onConnect}
          onDrop={onDrop}
          onDragOver={onDragOver}
          onNodeClick={onNodeClick}
          nodeTypes={nodeTypes}
          fitView
          className="bg-slate-50"
          defaultEdgeOptions={{
            style: { stroke: '#06D6A0', strokeWidth: 3 },
            animated: true
          }}
        >
          <Background color="#e2e8f0" gap={25} size={1} />
          <Controls className="bg-white border-slate-200 rounded-xl shadow-xl overflow-hidden" />
          <MiniMap
            position="bottom-right"
            nodeColor={(n) => n.type === 'triggerNode' ? '#E74C3C' : '#06D6A0'}
            className="bg-white rounded-2xl shadow-2xl border border-slate-100 m-8"
          />

          <Panel position="top-right" className="flex items-center gap-3">
            <div className="flex bg-white/80 backdrop-blur-md p-1.5 rounded-2xl border border-slate-100 shadow-xl gap-2">
              <button
                onClick={() => setShowSettings(!showSettings)}
                className="px-4 py-2 bg-white text-slate-600 text-[10px] font-black rounded-xl uppercase tracking-widest flex items-center gap-2 border border-slate-100 hover:bg-slate-50 active:scale-95 transition-all"
              >
                <Settings size={12} />
                Settings
              </button>
              <button
                onClick={handleTestFlow}
                className="px-4 py-2 bg-emerald-500 text-white text-[10px] font-black rounded-xl uppercase tracking-widest flex items-center gap-2 shadow-lg shadow-emerald-500/20 hover:brightness-110 active:scale-95 transition-all"
              >
                <Play size={12} fill="currentColor" />
                Test Flow
              </button>
            </div>
          </Panel>
        </ReactFlow>
      </div>

      {/* Settings Sidebar */}
      <aside
        className={`fixed top-0 right-0 h-full w-96 bg-white border-l border-slate-200 flex flex-col z-[100] shadow-[-20px_0_40px_rgba(0,0,0,0.05)] transition-all duration-500 ease-in-out ${showSettings || selectedNode ? 'translate-x-0' : 'translate-x-full'}`}
      >
        <div className="p-8 border-b border-slate-100 flex items-center justify-between">
          <div className="flex items-center gap-4">
            <div className="w-10 h-10 bg-slate-50 rounded-2xl flex items-center justify-center text-slate-400">
              <Settings size={20} />
            </div>
            <h3 className="text-lg font-black text-slate-800 tracking-tight">
              {selectedNode ? 'Node Config' : 'Automation Info'}
            </h3>
          </div>
          <button
            onClick={() => {
              setSelectedNode(null);
              setShowSettings(false);
            }}
            className="p-2 hover:bg-slate-50 rounded-xl text-slate-400"
          >
            <X size={20} />
          </button>
        </div>

        <div className="flex-1 overflow-y-auto p-8 space-y-8 custom-scrollbar">
          {!selectedNode ? (
            <div className="space-y-6">
              <div className="space-y-2">
                <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">Automation Name</label>
                <input
                  type="text"
                  value={workflowInfo.name}
                  onChange={(e) => setWorkflowInfo(prev => ({ ...prev, name: e.target.value }))}
                  placeholder="e.g. Welcome Greeting"
                  className="w-full px-5 py-4 bg-slate-50 border-2 border-transparent rounded-2xl text-sm font-bold focus:bg-white focus:border-primary transition-all outline-none"
                />
              </div>
              <div className="space-y-2">
                <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">Description</label>
                <textarea
                  value={workflowInfo.description}
                  onChange={(e) => setWorkflowInfo(prev => ({ ...prev, description: e.target.value }))}
                  placeholder="Describe what this workflow does..."
                  className="w-full h-32 p-5 bg-slate-50 border-2 border-transparent rounded-[2rem] text-sm font-bold focus:bg-white focus:border-primary transition-all resize-none outline-none"
                />
              </div>

              {isAdmin && (
                 <div className="space-y-3">
                    <div className="flex items-center gap-2 mb-1">
                       <User size={12} className="text-primary" />
                       <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Assign to Client</label>
                    </div>
                    <select 
                      value={selectedClientId}
                      onChange={(e) => setSelectedClientId(e.target.value)}
                      className="w-full px-5 py-4 bg-slate-50 border-2 border-transparent rounded-2xl text-xs font-bold focus:bg-white focus:border-primary transition-all outline-none appearance-none cursor-pointer"
                    >
                       <option value="">Global Template (No Client)</option>
                       {clients.map(c => (
                          <option key={c.id} value={c.id}>{c.name} ({c.businessName})</option>
                       ))}
                    </select>
                    <p className="text-[9px] text-slate-400 font-medium px-1 italic">Assigning to a client makes this flow visible in their dashboard.</p>
                 </div>
              )}

              <div className="h-[1px] bg-slate-50 my-2"></div>

              <div className="space-y-4">
                <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">Quick Actions</label>
                <div className="grid grid-cols-1 gap-2">
                  <div className="p-4 bg-blue-50/50 rounded-2xl border border-blue-100/50">
                    <h5 className="text-[10px] font-black text-blue-600 uppercase tracking-widest mb-1">Total Nodes</h5>
                    <p className="text-xl font-black text-blue-900">{nodes.length}</p>
                  </div>
                </div>
              </div>
            </div>
          ) : (
            <>
              {selectedNode.type === 'messageNode' && (
                <div className="space-y-6">
                  <div className="space-y-2">
                    <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">Message Content</label>
                    <textarea
                      value={selectedNode.data.config?.message || ''}
                      onChange={(e) => updateNodeConfig({ message: e.target.value })}
                      placeholder="Hello! How can we help you today?"
                      className="w-full h-40 p-5 bg-slate-50 border-2 border-transparent rounded-[2rem] text-sm font-bold focus:bg-white focus:border-secondary transition-all resize-none outline-none"
                    />
                  </div>
                </div>
              )}

              {selectedNode.type === 'triggerNode' && (
                <div className="space-y-6">
                  <div className="space-y-2">
                    <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">Keywords (Comma separated)</label>
                    <input
                      type="text"
                      value={selectedNode.data.config?.keywords?.join(', ') || ''}
                      onChange={(e) => updateNodeConfig({ keywords: e.target.value.split(',').map(k => k.trim()) })}
                      className="w-full px-5 py-4 bg-slate-50 border-2 border-transparent rounded-2xl text-sm font-bold focus:bg-white focus:border-primary transition-all outline-none"
                    />
                  </div>
                </div>
              )}

              {selectedNode.type === 'waitNode' && (
                <div className="space-y-6">
                  <div className="space-y-2">
                    <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">Save reply as variable</label>
                    <input
                      type="text"
                      value={selectedNode.data.config?.variableName || ''}
                      onChange={(e) => updateNodeConfig({ variableName: e.target.value })}
                      placeholder="e.g. customer_name"
                      className="w-full px-5 py-4 bg-slate-50 border-2 border-transparent rounded-2xl text-sm font-bold focus:bg-white focus:border-purple-500 transition-all outline-none"
                    />
                    <p className="text-[9px] text-slate-400 font-medium px-1 italic">This allows you to store the user's response and use it later.</p>
                  </div>
                </div>
              )}
            </>
          )}
        </div>

        <div className="p-8 border-t border-slate-100 space-y-3 bg-slate-50/50">
          <button
            onClick={() => handleSave()}
            disabled={isSaving}
            className="w-full flex items-center justify-center gap-2 px-6 py-4 bg-primary text-white text-[11px] font-black rounded-2xl hover:bg-primary/90 transition-all uppercase tracking-widest shadow-xl shadow-primary/20 disabled:opacity-50"
          >
            <Save size={16} />
            {isSaving ? 'Saving...' : 'Save Changes'}
          </button>

          {selectedNode && (
            <button onClick={() => {
              setNodes(nds => nds.filter(n => n.id !== selectedNode.id));
              setSelectedNode(null);
            }} className="w-full flex items-center justify-center gap-2 px-6 py-4 bg-red-50 text-red-600 text-[10px] font-black rounded-2xl hover:bg-red-100 transition-all uppercase tracking-widest">
              <Trash2 size={14} />
              Delete Node
            </button>
          )}
        </div>
      </aside>
    </div>
  );
}

function NodeSection({ title, nodes, onNodeAdd }) {
  const onDragStart = (event, nodeType) => {
    event.dataTransfer.setData('application/reactflow', nodeType);
    event.dataTransfer.effectAllowed = 'move';
  };

  return (
    <div className="space-y-4">
      <h3 className="text-[11px] font-black text-slate-400 uppercase tracking-[0.2em]">{title}</h3>
      <div className="grid grid-cols-1 gap-3">
        {nodes.map((node) => (
          <div
            key={node.type}
            draggable
            onDragStart={(e) => onDragStart(e, node.type)}
            onClick={() => onNodeAdd(node.type)}
            className="group flex items-center gap-4 p-4 bg-slate-50/50 border border-slate-100 rounded-2xl cursor-grab active:cursor-grabbing hover:bg-white hover:border-red-500/20 hover:shadow-xl hover:shadow-slate-200/50 transition-all active:scale-95"
          >
            <div className={`w-10 h-10 ${node.color} rounded-xl flex items-center justify-center group-hover:scale-110 transition-transform`}>
              <node.icon size={20} fill={node.type.includes('trigger') ? 'currentColor' : 'none'} />
            </div>
            <span className="text-xs font-bold text-slate-700">{node.label}</span>
          </div>
        ))}
      </div>
    </div>
  );
}

export default function AutomationBuilder(props) {
  return (
    <ReactFlowProvider>
      <BuilderCanvas {...props} />
    </ReactFlowProvider>
  );
}
