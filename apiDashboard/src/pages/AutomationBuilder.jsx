import React, { useState, useCallback, useRef, useEffect } from 'react';
import {
  ReactFlow,
  MiniMap,
  Background,
  useNodesState,
  useEdgesState,
  addEdge,
  Handle,
  Position,
  useReactFlow,
  ReactFlowProvider
} from '@xyflow/react';
import '@xyflow/react/dist/style.css';
import {
  Save, Play, X, Zap, MessageSquare,
  Settings, Trash2, ChevronLeft, Clock, User,
  GitBranch, Bell, Database, Activity, Timer,
  Check, Loader2, Edit3, Maximize2, Map, Plus, Minus, Power
} from 'lucide-react';
import axios from 'axios';

const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || 'http://localhost:5000/api';

const nodeStyles = "px-3 py-2.5 rounded-xl border shadow-sm bg-white min-w-[170px] max-w-[210px] transition-all cursor-pointer hover:shadow-md select-none relative";

const TriggerNode = ({ data, selected }) => (
  <div 
    className={`${nodeStyles} border-red-100 border-l-[3.5px] border-l-red-500`} 
    style={{ ring: selected ? '2px ring-red-400' : 'none', borderColor: selected ? '#EF4444' : '#fee2e2' }}
  >
    <div className="flex items-center gap-2">
      <div className="w-6 h-6 bg-red-50 text-red-500 rounded-lg flex items-center justify-center shrink-0">
        <Zap size={12} fill="currentColor" />
      </div>
      <div className="min-w-0 flex-1">
        <p className="text-[9px] font-black text-red-500 uppercase tracking-wider leading-none">Trigger</p>
        <h4 className="text-[11px] font-bold text-slate-800 tracking-tight mt-1 truncate">
          {data.config?.keywords?.length > 0 ? `Keywords: ${data.config.keywords.join(', ')}` : 'Set Keyword...'}
        </h4>
      </div>
    </div>
    <Handle type="source" position={Position.Bottom} style={{ background: '#EF4444', width: 6, height: 6, border: 'none' }} />
  </div>
);

const MessageNode = ({ data, selected }) => (
  <div 
    className={`${nodeStyles} border-emerald-100 border-l-[3.5px] border-l-emerald-500`} 
    style={{ ring: selected ? '2px ring-emerald-400' : 'none', borderColor: selected ? '#10B981' : '#d1fae5' }}
  >
    <Handle type="target" position={Position.Top} style={{ background: '#10B981', width: 6, height: 6, border: 'none' }} />
    <div className="flex items-center gap-2">
      <div className="w-6 h-6 bg-emerald-50 text-emerald-500 rounded-lg flex items-center justify-center shrink-0">
        <MessageSquare size={12} fill="currentColor" />
      </div>
      <div className="min-w-0 flex-1">
        <p className="text-[9px] font-black text-emerald-500 uppercase tracking-wider leading-none">Action</p>
        <h4 className="text-[11px] font-bold text-slate-800 tracking-tight mt-1 truncate">Send Text</h4>
      </div>
    </div>
    <p className="text-[9px] text-slate-400 font-semibold truncate mt-1 bg-slate-50 px-1.5 py-0.5 rounded italic">
      {data.config?.message || 'Empty message...'}
    </p>
    <Handle type="source" position={Position.Bottom} style={{ background: '#10B981', width: 6, height: 6, border: 'none' }} />
  </div>
);

const WaitNode = ({ data, selected }) => (
  <div 
    className={`${nodeStyles} border-purple-100 border-l-[3.5px] border-l-purple-500`} 
    style={{ ring: selected ? '2px ring-purple-400' : 'none', borderColor: selected ? '#8B5CF6' : '#f3e8ff' }}
  >
    <Handle type="target" position={Position.Top} style={{ background: '#8B5CF6', width: 6, height: 6, border: 'none' }} />
    <div className="flex items-center gap-2">
      <div className="w-6 h-6 bg-purple-50 text-purple-500 rounded-lg flex items-center justify-center shrink-0">
        <Clock size={12} />
      </div>
      <div className="min-w-0 flex-1">
        <p className="text-[9px] font-black text-purple-500 uppercase tracking-wider leading-none">Logic</p>
        <h4 className="text-[11px] font-bold text-slate-800 tracking-tight mt-1 truncate">Wait for Reply</h4>
      </div>
    </div>
    <p className="text-[9px] text-slate-400 font-semibold truncate mt-1 bg-slate-50 px-1.5 py-0.5 rounded italic">
      {data.config?.variableName ? `Save as: {{${data.config.variableName}}}` : 'Awaiting input...'}
    </p>
    <Handle type="source" position={Position.Bottom} style={{ background: '#8B5CF6', width: 6, height: 6, border: 'none' }} />
  </div>
);

const ConditionNode = ({ data, selected }) => (
  <div 
    className={`${nodeStyles} border-amber-100 border-l-[3.5px] border-l-amber-500`} 
    style={{ ring: selected ? '2px ring-amber-400' : 'none', borderColor: selected ? '#F59E0B' : '#fef3c7' }}
  >
    <Handle type="target" position={Position.Top} style={{ background: '#F59E0B', width: 6, height: 6, border: 'none' }} />
    <div className="flex items-center gap-2 mb-1.5">
      <div className="w-6 h-6 bg-amber-50 text-amber-600 rounded-lg flex items-center justify-center shrink-0">
        <GitBranch size={12} />
      </div>
      <div className="min-w-0 flex-1">
        <p className="text-[9px] font-black text-amber-600 uppercase tracking-wider leading-none">Branching</p>
        <h4 className="text-[11px] font-bold text-slate-800 tracking-tight mt-1 truncate">
          {data.config?.condition || 'If User Input...'}
        </h4>
      </div>
    </div>
    <div className="space-y-1">
      {(data.config?.branches || []).map((branch, i) => (
        <div key={i} className="flex items-center justify-between bg-slate-50 px-1.5 py-0.5 rounded border border-slate-100 text-[9px] font-bold text-slate-500 relative">
          <span className="truncate pr-2">Option: {branch.value || `[Empty]`}</span>
          <Handle
            type="source"
            position={Position.Right}
            id={`branch-${i}`}
            style={{ background: '#F59E0B', width: 5, height: 5, border: 'none', right: -4 }}
          />
        </div>
      ))}
    </div>
  </div>
);

const ActionNode = ({ data, selected }) => (
  <div 
    className={`${nodeStyles} border-blue-100 border-l-[3.5px] border-l-blue-500`} 
    style={{ ring: selected ? '2px ring-blue-400' : 'none', borderColor: selected ? '#3B82F6' : '#dbeafe' }}
  >
    <Handle type="target" position={Position.Top} style={{ background: '#3B82F6', width: 6, height: 6, border: 'none' }} />
    <div className="flex items-center gap-2">
      <div className="w-6 h-6 bg-blue-50 text-blue-500 rounded-lg flex items-center justify-center shrink-0">
        <Bell size={12} />
      </div>
      <div className="min-w-0 flex-1">
        <p className="text-[9px] font-black text-blue-500 uppercase tracking-wider leading-none">System</p>
        <h4 className="text-[11px] font-bold text-slate-800 tracking-tight mt-1 truncate uppercase">
          {data.config?.label || 'Notification'}
        </h4>
      </div>
    </div>
    <Handle type="source" position={Position.Bottom} style={{ background: '#3B82F6', width: 6, height: 6, border: 'none' }} />
  </div>
);

const DelayNode = ({ data, selected }) => (
  <div 
    className={`${nodeStyles} border-slate-200 border-l-[3.5px] border-l-slate-400`} 
    style={{ ring: selected ? '2px ring-slate-400' : 'none', borderColor: selected ? '#64748B' : '#f1f5f9' }}
  >
    <Handle type="target" position={Position.Top} style={{ background: '#64748B', width: 6, height: 6, border: 'none' }} />
    <div className="flex items-center gap-2">
      <div className="w-6 h-6 bg-slate-50 text-slate-500 rounded-lg flex items-center justify-center shrink-0">
        <Timer size={12} />
      </div>
      <div className="min-w-0 flex-1">
        <p className="text-[9px] font-black text-slate-450 uppercase tracking-wider leading-none">Delay</p>
        <h4 className="text-[11px] font-bold text-slate-800 tracking-tight mt-1 truncate">
          {data.config?.duration || '1'} {data.config?.unit || 'minutes'}
        </h4>
      </div>
    </div>
    <Handle type="source" position={Position.Bottom} style={{ background: '#64748B', width: 6, height: 6, border: 'none' }} />
  </div>
);

const nodeTypes = {
  triggerNode: TriggerNode,
  messageNode: MessageNode,
  waitNode: WaitNode,
  conditionNode: ConditionNode,
  actionNode: ActionNode,
  delayNode: DelayNode
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
  const [showRightPanel, setShowRightPanel] = useState(true);
  const [showMiniMap, setShowMiniMap] = useState(true);
  const [isEditingName, setIsEditingName] = useState(false);
  const [clients, setClients] = useState([]);
  const [selectedClientId, setSelectedClientId] = useState(automation?.clientId?._id || automation?.clientId || '');
  const [automationStatus, setAutomationStatus] = useState(automation?.status || 'active');
  const [history, setHistory] = useState([]);
  const [historyIndex, setHistoryIndex] = useState(-1);

  const user = JSON.parse(localStorage.getItem('user') || '{}');
  const isAdmin = user.role === 'admin';

  // Helper to clone nodes/edges safely
  const cloneState = (nds, eds) => {
    return {
      nodes: JSON.parse(JSON.stringify(nds)),
      edges: JSON.parse(JSON.stringify(eds))
    };
  };

  // Push state checkpoints to history stack
  const saveToHistory = useCallback((currentNodes, currentEdges) => {
    const state = cloneState(currentNodes, currentEdges);
    setHistory((prev) => {
      const nextHistory = prev.slice(0, historyIndex + 1);
      nextHistory.push(state);
      if (nextHistory.length > 30) nextHistory.shift();
      return nextHistory;
    });
    setHistoryIndex((prev) => Math.min(prev + 1, 29));
  }, [historyIndex]);

  // Initial base state history seed
  useEffect(() => {
    if (nodes.length > 0 && history.length === 0) {
      setHistory([cloneState(nodes, edges)]);
      setHistoryIndex(0);
    }
  }, [nodes, edges, history]);

  // History Undo operation
  const handleUndo = useCallback(() => {
    if (historyIndex > 0) {
      const prevCheckpoint = history[historyIndex - 1];
      setNodes(JSON.parse(JSON.stringify(prevCheckpoint.nodes)));
      setEdges(JSON.parse(JSON.stringify(prevCheckpoint.edges)));
      setHistoryIndex(historyIndex - 1);
      setSelectedNode(null);
    }
  }, [historyIndex, history, setNodes, setEdges]);

  // History Redo operation
  const handleRedo = useCallback(() => {
    if (historyIndex < history.length - 1) {
      const nextCheckpoint = history[historyIndex + 1];
      setNodes(JSON.parse(JSON.stringify(nextCheckpoint.nodes)));
      setEdges(JSON.parse(JSON.stringify(nextCheckpoint.edges)));
      setHistoryIndex(historyIndex + 1);
      setSelectedNode(null);
    }
  }, [historyIndex, history, setNodes, setEdges]);

  // Track Node Drag Stop to record layout movements
  const onNodeDragStop = useCallback(() => {
    saveToHistory(nodes, edges);
  }, [nodes, edges, saveToHistory]);

  const onNodesDelete = useCallback(() => {
    setTimeout(() => saveToHistory(nodes, edges), 0);
  }, [nodes, edges, saveToHistory]);

  const onEdgesDelete = useCallback(() => {
    setTimeout(() => saveToHistory(nodes, edges), 0);
  }, [nodes, edges, saveToHistory]);

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
      setWorkflowInfo({
        name: automation.name,
        description: automation.description || ''
      });
      setAutomationStatus(automation.status || 'active');
      setSelectedClientId(automation.clientId?._id || automation.clientId || '');
    }
  }, [automation]);

  const { screenToFlowPosition, fitView, zoomIn, zoomOut } = useReactFlow();

  const onConnect = useCallback(
    (params) => {
      const isBranch = params.sourceHandle && params.sourceHandle.startsWith('branch-');
      const edgeStyle = isBranch 
        ? { stroke: '#F59E0B', strokeWidth: 2 } 
        : { stroke: '#10B981', strokeWidth: 2 };
      
      const newEdge = { 
        ...params, 
        animated: true, 
        style: edgeStyle,
        type: 'smoothstep'
      };

      setEdges((eds) => {
        const nextEds = addEdge(newEdge, eds);
        saveToHistory(nodes, nextEds);
        return nextEds;
      });
    },
    [nodes, saveToHistory, setEdges]
  );

  const onNodeAdd = useCallback((type) => {
    const position = {
      x: Math.random() * 100 + 200,
      y: Math.random() * 100 + 150,
    };

    const newNode = {
      id: getId(),
      type,
      position,
      data: {
        label: `New ${type.replace('Node', '')}`,
        config: type === 'triggerNode' ? { type: 'keyword', matchType: 'exact', keywords: ['hello'] } : {}
      },
    };

    setNodes((nds) => {
      const nextNds = nds.concat(newNode);
      saveToHistory(nextNds, edges);
      return nextNds;
    });
  }, [nodes, edges, saveToHistory, setNodes]);

  const onDragOver = useCallback((event) => {
    event.preventDefault();
    event.dataTransfer.dropEffect = 'move';
  }, []);

  const onDrop = useCallback(
    (event) => {
      event.preventDefault();
      const type = event.dataTransfer.getData('application/reactflow');
      if (!type) return;

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
          config: type === 'triggerNode' ? { type: 'keyword', matchType: 'exact', keywords: ['hello'] } : {}
        },
      };

      setNodes((nds) => {
        const nextNds = nds.concat(newNode);
        saveToHistory(nextNds, edges);
        return nextNds;
      });
    },
    [screenToFlowPosition, nodes, edges, saveToHistory, setNodes]
  );

  const onNodeClick = (event, node) => {
    setSelectedNode(node);
    setShowRightPanel(true);
  };

  const onPaneClick = () => {
    setSelectedNode(null);
  };

  const updateNodeConfig = (config) => {
    if (!selectedNode) return;

    setNodes((nds) =>
      nds.map((node) => {
        if (node.id === selectedNode.id) {
          const updatedNode = {
            ...node,
            data: {
              ...node.data,
              config: { ...(node.data.config || {}), ...config },
            },
          };
          return updatedNode;
        }
        return node;
      })
    );
  };

  const handleValidate = () => {
    const hasTrigger = nodes.some(n => n.type === 'triggerNode');
    const hasAction = nodes.some(n => n.type === 'messageNode' || n.type === 'actionNode');
    
    if (!hasTrigger) {
      alert("Validation: Your workflow must contain at least one Trigger node.");
      return false;
    }
    if (!hasAction) {
      alert("Validation: Your workflow must contain at least one Action (Send Text/System Action) node.");
      return false;
    }
    
    const connectedNodeIds = new Set();
    edges.forEach(e => {
      connectedNodeIds.add(e.source);
      connectedNodeIds.add(e.target);
    });
    
    const disconnectedNodes = nodes.filter(n => !connectedNodeIds.has(n.id));
    if (disconnectedNodes.length > 0) {
      alert(`Validation Warning: You have ${disconnectedNodes.length} disconnected node(s). Connect or delete them before publishing.`);
      return false;
    }
    
    alert("Validation Success: Workflow structure is fully valid!");
    return true;
  };

  const handleToggleStatus = async () => {
    const newStatus = automationStatus === 'active' ? 'paused' : 'active';
    try {
      const token = localStorage.getItem('token');
      await axios.put(`${API_BASE_URL}/automations/${automation?._id}`, { status: newStatus }, {
        headers: { 'Authorization': `Bearer ${token}` }
      });
      setAutomationStatus(newStatus);
    } catch (err) {
      const errorMsg = err.response?.data?.error || err.message;
      alert(`Failed to update status: ${errorMsg}`);
    }
  };

  const handleSave = async (newStatus = null) => {
    try {
      setIsSaving(true);
      const token = localStorage.getItem('token');
      const statusToSave = (typeof newStatus === 'string') ? newStatus : (automation?.status || 'active');

      const workflowData = {
        name: workflowInfo.name || 'My New Workflow',
        description: workflowInfo.description || 'Automated WhatsApp conversation',
        nodes: nodes,
        edges: edges,
        status: statusToSave,
        clientId: selectedClientId || automation?.clientId || null
      };

      if (automation?._id) {
        await axios.put(`${API_BASE_URL}/automations/${automation._id}`, workflowData, {
          headers: { 'Authorization': `Bearer ${token}` }
        });
      } else {
        await axios.post(`${API_BASE_URL}/automations`, workflowData, {
          headers: { 'Authorization': `Bearer ${token}` }
        });
      }

      alert("Workflow saved successfully!");
    } catch (err) {
      const errorMsg = err.response?.data?.error || err.message;
      alert(`Failed to save: ${errorMsg}`);
    } finally {
      setIsSaving(false);
    }
  };

  const handleTestFlow = async () => {
    const isValid = handleValidate();
    if (!isValid) return;
    alert("Test flow initiated. Simulating message inbound trigger...");
  };

  return (
    <div className="flex-1 flex flex-col h-full bg-[#f8fafc] overflow-hidden">
      
      {/* Top action header bar */}
      <div className="h-14 bg-white border-b border-slate-200 flex items-center justify-between px-4 shrink-0 select-none z-10">
        <div className="flex items-center gap-3">
          <button
            onClick={onClose}
            className="flex items-center justify-center w-8 h-8 rounded-lg hover:bg-slate-50 text-slate-500 hover:text-slate-800 transition-colors border border-slate-100 shadow-sm cursor-pointer"
            title="Back to List"
          >
            <ChevronLeft size={16} />
          </button>
          
          <div className="flex items-center gap-2">
            {isAdmin && isEditingName ? (
              <input
                type="text"
                value={workflowInfo.name}
                onChange={(e) => setWorkflowInfo({ ...workflowInfo, name: e.target.value })}
                onBlur={() => {
                  setIsEditingName(false);
                  saveToHistory(nodes, edges);
                }}
                onKeyDown={(e) => { 
                  if (e.key === 'Enter') {
                    setIsEditingName(false);
                    saveToHistory(nodes, edges);
                  }
                }}
                autoFocus
                className="h-8 px-2 font-bold text-sm bg-slate-50 border border-slate-200 rounded focus:outline-none focus:border-[#004277] max-w-[200px]"
              />
            ) : (
              <div className="flex items-center gap-1.5">
                <span className="font-bold text-slate-800 text-sm">{workflowInfo.name}</span>
                {isAdmin && (
                  <button
                    onClick={() => setIsEditingName(true)}
                    className="text-slate-400 hover:text-[#004277] cursor-pointer"
                    title="Rename Workflow"
                  >
                    <Edit3 size={11} />
                  </button>
                )}
              </div>
            )}
          </div>
        </div>

        {/* Action Controls — admin gets full controls, client gets status toggle only */}
        <div className="flex items-center gap-2">
          {isAdmin ? (
            <>
              <button
                onClick={handleValidate}
                className="h-8 px-3 bg-white border border-slate-200 hover:bg-slate-50 text-slate-650 font-bold text-xs rounded-lg flex items-center gap-1 shadow-sm cursor-pointer"
                title="Validate Connections"
              >
                <Check size={12} className="text-[#004277]" />
                <span>Validate</span>
              </button>

              <button
                onClick={handleTestFlow}
                className="h-8 px-3 bg-[#22C55E]/10 hover:bg-[#22C55E]/15 border border-[#22C55E]/20 text-[#16a34a] font-bold text-xs rounded-lg flex items-center gap-1 shadow-sm cursor-pointer"
                title="Run Mock Simulation"
              >
                <Play size={11} fill="currentColor" />
                <span>Test</span>
              </button>

              <button
                onClick={() => handleSave('active')}
                disabled={isSaving}
                className="h-8 px-3.5 bg-[#004277] hover:brightness-105 active:scale-98 text-white font-bold text-xs rounded-lg flex items-center gap-1.5 shadow-sm transition-all cursor-pointer disabled:opacity-50"
                title="Save and Activate"
              >
                {isSaving ? <Loader2 size={12} className="animate-spin" /> : <Save size={12} />}
                <span>Publish</span>
              </button>

              <button
                onClick={() => setShowRightPanel(!showRightPanel)}
                className={`h-8 px-3 border rounded-lg text-xs font-bold flex items-center gap-1 shadow-sm cursor-pointer transition-all ${
                  showRightPanel 
                    ? 'bg-slate-100 text-slate-700 border-slate-300 hover:bg-slate-150' 
                    : 'bg-white text-slate-650 border-slate-200 hover:bg-slate-50'
                }`}
                title="Toggle Properties Panel"
              >
                <Settings size={13} />
                <span>{showRightPanel ? 'Hide Panel' : 'Show Panel'}</span>
              </button>
            </>
          ) : (
            /* Client-only: simple Active/Paused toggle */
            <div className="flex items-center gap-3">
              <span className={`text-xs font-bold ${
                automationStatus === 'active' ? 'text-emerald-600' : 'text-slate-400'
              }`}>
                {automationStatus === 'active' ? 'Active' : 'Paused'}
              </span>
              <button
                onClick={handleToggleStatus}
                disabled={!automation?._id}
                title={automationStatus === 'active' ? 'Click to Pause' : 'Click to Activate'}
                className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors duration-200 focus:outline-none cursor-pointer disabled:opacity-50 ${
                  automationStatus === 'active' ? 'bg-emerald-500' : 'bg-slate-300'
                }`}
              >
                <span
                  className={`inline-block h-4 w-4 transform rounded-full bg-white shadow-sm transition-transform duration-200 ${
                    automationStatus === 'active' ? 'translate-x-6' : 'translate-x-1'
                  }`}
                />
              </button>
              <div className="w-px h-5 bg-slate-200" />
              <button
                onClick={() => setShowRightPanel(!showRightPanel)}
                className={`h-8 px-3 border rounded-lg text-xs font-bold flex items-center gap-1 shadow-sm cursor-pointer transition-all ${
                  showRightPanel 
                    ? 'bg-slate-100 text-slate-700 border-slate-300' 
                    : 'bg-white text-slate-650 border-slate-200 hover:bg-slate-50'
                }`}
                title="Toggle Info Panel"
              >
                <Settings size={13} />
              </button>
            </div>
          )}
        </div>
      </div>

      {/* Main Workspace split panel */}
      <div className="flex-1 flex overflow-hidden min-h-0 relative">
        
        {/* Left Node Drawer list for drag and add (admin only) */}
        {isAdmin && (
          <aside className="w-60 bg-white border-r border-slate-200 flex flex-col shrink-0">
            <div className="p-4 border-b border-slate-100">
              <h3 className="text-xs font-bold text-slate-800 uppercase tracking-widest leading-none">Add Nodes</h3>
              <p className="text-[10px] text-slate-400 font-semibold mt-1">Drag nodes to canvas or click to insert</p>
            </div>
            
            <div className="flex-1 overflow-y-auto p-4 space-y-6 custom-scrollbar">
              <NodeDragSection title="Triggers" onNodeAdd={onNodeAdd} nodes={[
                { type: 'triggerNode', label: 'Trigger', icon: Zap, color: 'text-red-500 bg-red-50' },
              ]} />

              <NodeDragSection title="Actions" onNodeAdd={onNodeAdd} nodes={[
                { type: 'messageNode', label: 'Send Text', icon: MessageSquare, color: 'text-emerald-500 bg-emerald-50' },
                { type: 'actionNode', label: 'System Action', icon: Database, color: 'text-blue-500 bg-blue-50' },
              ]} />

              <NodeDragSection title="Logic" onNodeAdd={onNodeAdd} nodes={[
                { type: 'waitNode', label: 'Wait for Reply', icon: Clock, color: 'text-purple-500 bg-purple-50' },
                { type: 'conditionNode', label: 'Branching', icon: GitBranch, color: 'text-amber-600 bg-amber-50' },
                { type: 'delayNode', label: 'Delay', icon: Timer, color: 'text-slate-500 bg-slate-100' },
              ]} />
            </div>
          </aside>
        )}

        {/* Canvas area wrapper */}
        <div className="flex-1 relative h-full bg-[#f8fafc]">
          <ReactFlow
            nodes={nodes}
            edges={edges}
            onNodesChange={isAdmin ? onNodesChange : undefined}
            onEdgesChange={isAdmin ? onEdgesChange : undefined}
            onConnect={isAdmin ? onConnect : undefined}
            onDrop={isAdmin ? onDrop : undefined}
            onDragOver={isAdmin ? onDragOver : undefined}
            onNodeClick={onNodeClick}
            onPaneClick={onPaneClick}
            onNodeDragStop={onNodeDragStop}
            onNodesDelete={onNodesDelete}
            onEdgesDelete={onEdgesDelete}
            nodeTypes={nodeTypes}
            fitView
            nodesDraggable={isAdmin}
            nodesConnectable={isAdmin}
            elementsSelectable={true}
            className="bg-slate-50/50"
            defaultEdgeOptions={{
              style: { stroke: '#10B981', strokeWidth: 2 },
              animated: true
            }}
          >
            <Background color="#e2e8f0" gap={20} size={1} />
            {showMiniMap && (
              <MiniMap
                position="bottom-right"
                nodeColor={(n) => n.type === 'triggerNode' ? '#EF4444' : '#10B981'}
                className="hidden md:block bg-white rounded-xl shadow-lg border border-slate-200 m-4 overflow-hidden"
                style={{ width: 100, height: 75 }}
              />
            )}
          </ReactFlow>

          {/* Floating Zoom & Minimap Panel bottom-left */}
          <div className="absolute bottom-4 left-4 bg-white border border-slate-200 rounded-xl shadow-lg flex items-center p-1 gap-0.5 z-30">
            <button
              onClick={() => zoomIn()}
              className="w-7 h-7 rounded-lg hover:bg-slate-50 flex items-center justify-center text-slate-500 hover:text-slate-800 transition-colors border border-slate-100 shadow-sm cursor-pointer"
              title="Zoom In"
            >
              <Plus size={14} />
            </button>
            <button
              onClick={() => zoomOut()}
              className="w-7 h-7 rounded-lg hover:bg-slate-50 flex items-center justify-center text-slate-500 hover:text-slate-800 transition-colors border border-slate-100 shadow-sm cursor-pointer"
              title="Zoom Out"
            >
              <Minus size={14} />
            </button>
            <button
              onClick={() => fitView({ duration: 500 })}
              className="px-2 h-7 rounded-lg hover:bg-slate-50 flex items-center justify-center text-slate-500 hover:text-slate-800 transition-colors border border-slate-100 shadow-sm text-[10px] font-bold uppercase cursor-pointer"
              title="Fit View"
            >
              Fit
            </button>
            <button
              onClick={() => setShowMiniMap(!showMiniMap)}
              className={`w-7 h-7 rounded-lg hover:bg-slate-50 flex items-center justify-center text-slate-500 hover:text-slate-850 transition-colors border border-slate-100 shadow-sm cursor-pointer ${showMiniMap ? 'bg-slate-100 text-[#004277]' : ''}`}
              title="Toggle Map"
            >
              <Map size={13} />
            </button>
          </div>
        </div>

        {/* Right Collapsible Property Panel */}
        <aside className={`bg-white border-l border-slate-200 flex flex-col shrink-0 transition-all duration-300 overflow-hidden relative z-10 ${showRightPanel ? 'w-80' : 'w-0 border-l-0'}`}>
          <div className="p-4 border-b border-slate-150 flex items-center justify-between shrink-0 bg-slate-50/50">
            <h3 className="text-xs font-bold text-slate-800 uppercase tracking-widest leading-none">
              {selectedNode ? 'Node Settings' : 'Automation Info'}
            </h3>
            <button
              onClick={() => setSelectedNode(null)}
              className={`p-1.5 hover:bg-slate-100 rounded-lg text-slate-400 hover:text-slate-650 transition-colors ${!selectedNode ? 'opacity-0 pointer-events-none' : 'opacity-100'}`}
              title="Clear Selection"
            >
              <X size={14} />
            </button>
          </div>

          {/* Panel Form Fields */}
          <div className="flex-1 overflow-y-auto p-4 space-y-5 custom-scrollbar bg-white">
            {!selectedNode ? (
              // General settings
              <div className="space-y-4">
                <div className="space-y-1">
                  <label className="text-[10px] font-bold text-slate-400 uppercase tracking-wider ml-0.5">Automation Name</label>
                  <input
                    readOnly={!isAdmin}
                    type="text"
                    value={workflowInfo.name}
                    onChange={(e) => setWorkflowInfo({ ...workflowInfo, name: e.target.value })}
                    onBlur={() => saveToHistory(nodes, edges)}
                    className="w-full h-9 px-3 bg-slate-50 border border-slate-200 rounded-lg text-xs font-semibold focus:bg-white focus:border-[#004277] outline-none transition-all placeholder:text-slate-400"
                  />
                </div>
                <div className="space-y-1">
                  <label className="text-[10px] font-bold text-slate-400 uppercase tracking-wider ml-0.5">Description</label>
                  <textarea
                    readOnly={!isAdmin}
                    value={workflowInfo.description}
                    onChange={(e) => setWorkflowInfo({ ...workflowInfo, description: e.target.value })}
                    onBlur={() => saveToHistory(nodes, edges)}
                    rows={4}
                    placeholder="Describe this automation..."
                    className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-lg text-xs font-semibold focus:bg-white focus:border-[#004277] outline-none transition-all resize-none placeholder:text-slate-400"
                  />
                </div>

                {isAdmin && (
                  <>
                    <div className="space-y-1">
                      <label className="text-[10px] font-bold text-slate-400 uppercase tracking-wider ml-0.5">Assign to Client</label>
                      <select
                        value={selectedClientId}
                        onChange={(e) => setSelectedClientId(e.target.value)}
                        onBlur={() => saveToHistory(nodes, edges)}
                        className="w-full h-9 px-3 bg-slate-50 border border-slate-200 rounded-lg text-xs font-semibold focus:bg-white focus:border-[#004277] outline-none transition-all cursor-pointer"
                      >
                        <option value="">Global Template (No Client)</option>
                        {clients.map(c => (
                          <option key={c.id} value={c.id}>{c.name} ({c.businessName})</option>
                        ))}
                      </select>
                    </div>

                    <div className="space-y-1">
                      <label className="text-[10px] font-bold text-slate-400 uppercase tracking-wider ml-0.5">Workflow Status</label>
                      <select
                        value={automation?.status || 'active'}
                        onChange={(e) => {
                          handleSave(e.target.value);
                        }}
                        className="w-full h-9 px-3 bg-slate-50 border border-slate-200 rounded-lg text-xs font-semibold focus:bg-white focus:border-[#004277] outline-none transition-all cursor-pointer"
                      >
                        <option value="active">Active (Live)</option>
                        <option value="paused">Paused</option>
                        <option value="draft">Draft</option>
                        <option value="requested">Requested</option>
                      </select>
                    </div>
                  </>
                )}

                <div className="h-[1px] bg-slate-100 my-2" />

                <div className="grid grid-cols-2 gap-2 mt-4">
                  <div className="p-3 bg-slate-50 rounded-xl border border-slate-150/60">
                    <h5 className="text-[9px] font-bold text-slate-400 uppercase tracking-wider">Total Nodes</h5>
                    <p className="text-lg font-black text-slate-800 mt-1 leading-none">{nodes.length}</p>
                  </div>
                  <div className="p-3 bg-slate-50 rounded-xl border border-slate-150/60">
                    <h5 className="text-[9px] font-bold text-slate-400 uppercase tracking-wider">Connections</h5>
                    <p className="text-lg font-black text-slate-800 mt-1 leading-none">{edges.length}</p>
                  </div>
                </div>
              </div>
            ) : (
              // Dynamic selected node editor
              <div className="space-y-4">
                <div className="p-3 bg-slate-50 border border-slate-150/60 rounded-xl flex items-center gap-2">
                  <div className="w-8 h-8 rounded-lg bg-white flex items-center justify-center shrink-0 border border-slate-200">
                    {selectedNode.type === 'triggerNode' ? <Zap size={14} className="text-red-500" fill="currentColor" /> :
                     selectedNode.type === 'messageNode' ? <MessageSquare size={14} className="text-emerald-500" fill="currentColor" /> :
                     selectedNode.type === 'waitNode' ? <Clock size={14} className="text-purple-500" /> :
                     selectedNode.type === 'conditionNode' ? <GitBranch size={14} className="text-amber-500" /> :
                     selectedNode.type === 'delayNode' ? <Timer size={14} className="text-slate-500" /> :
                     <Bell size={14} className="text-blue-500" />}
                  </div>
                  <div>
                    <h4 className="text-xs font-bold text-slate-800 leading-tight">
                      {selectedNode.type === 'triggerNode' ? 'Trigger Node' :
                       selectedNode.type === 'messageNode' ? 'Message Node' :
                       selectedNode.type === 'waitNode' ? 'Wait Node' :
                       selectedNode.type === 'conditionNode' ? 'Condition Node' :
                       selectedNode.type === 'delayNode' ? 'Delay Node' :
                       'System Action Node'}
                    </h4>
                    <p className="text-[9px] text-slate-400 font-semibold mt-0.5 leading-none">ID: {selectedNode.id}</p>
                  </div>
                </div>

                {/* Node type specific properties */}
                {selectedNode.type === 'triggerNode' && (
                  <div className="space-y-4">
                    <div className="space-y-1">
                      <label className="text-[10px] font-bold text-slate-400 uppercase tracking-wider ml-0.5">Keywords (Comma separated)</label>
                      <input
                        readOnly={!isAdmin}
                        type="text"
                        value={selectedNode.data.config?.keywords?.join(', ') || ''}
                        onChange={(e) => updateNodeConfig({ keywords: e.target.value.split(',').map(k => k.trim()) })}
                        onBlur={() => saveToHistory(nodes, edges)}
                        placeholder="hello, hi, welcome"
                        className="w-full h-9 px-3 bg-slate-50 border border-slate-200 rounded-lg text-xs font-semibold focus:bg-white focus:border-[#004277] outline-none"
                      />
                    </div>
                  </div>
                )}

                {selectedNode.type === 'messageNode' && (
                  <div className="space-y-4">
                    <div className="space-y-1">
                      <label className="text-[10px] font-bold text-slate-400 uppercase tracking-wider ml-0.5">Message Content</label>
                      <textarea
                        readOnly={!isAdmin}
                        value={selectedNode.data.config?.message || ''}
                        onChange={(e) => updateNodeConfig({ message: e.target.value })}
                        onBlur={() => saveToHistory(nodes, edges)}
                        rows={6}
                        placeholder="Hello! How can we assist you?"
                        className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-lg text-xs font-semibold focus:bg-white focus:border-[#004277] outline-none resize-none"
                      />
                    </div>
                  </div>
                )}

                {selectedNode.type === 'waitNode' && (
                  <div className="space-y-4">
                    <div className="space-y-1">
                      <label className="text-[10px] font-bold text-slate-400 uppercase tracking-wider ml-0.5">Save Reply Variable</label>
                      <input
                        readOnly={!isAdmin}
                        type="text"
                        value={selectedNode.data.config?.variableName || ''}
                        onChange={(e) => updateNodeConfig({ variableName: e.target.value })}
                        onBlur={() => saveToHistory(nodes, edges)}
                        placeholder="e.g., customer_choice"
                        className="w-full h-9 px-3 bg-slate-50 border border-slate-200 rounded-lg text-xs font-semibold focus:bg-white focus:border-[#004277] outline-none"
                      />
                    </div>
                  </div>
                )}

                {selectedNode.type === 'delayNode' && (
                  <div className="space-y-4">
                    <div className="flex gap-2">
                      <div className="flex-1 space-y-1">
                        <label className="text-[10px] font-bold text-slate-400 uppercase tracking-wider ml-0.5">Duration</label>
                        <input
                          readOnly={!isAdmin}
                          type="number"
                          value={selectedNode.data.config?.duration || ''}
                          onChange={(e) => updateNodeConfig({ duration: e.target.value })}
                          onBlur={() => saveToHistory(nodes, edges)}
                          className="w-full h-9 px-3 bg-slate-50 border border-slate-200 rounded-lg text-xs font-semibold focus:bg-white focus:border-[#004277] outline-none"
                        />
                      </div>
                      <div className="flex-1 space-y-1">
                        <label className="text-[10px] font-bold text-slate-400 uppercase tracking-wider ml-0.5">Unit</label>
                        <select
                          disabled={!isAdmin}
                          value={selectedNode.data.config?.unit || 'minutes'}
                          onChange={(e) => updateNodeConfig({ unit: e.target.value })}
                          onBlur={() => saveToHistory(nodes, edges)}
                          className="w-full h-9 px-3 bg-slate-50 border border-slate-200 rounded-lg text-xs font-semibold focus:bg-white focus:border-[#004277] outline-none cursor-pointer"
                        >
                          <option value="minutes">Minutes</option>
                          <option value="hours">Hours</option>
                          <option value="days">Days</option>
                        </select>
                      </div>
                    </div>
                  </div>
                )}

                {selectedNode.type === 'conditionNode' && (
                  <div className="space-y-4">
                    <div className="space-y-1">
                      <label className="text-[10px] font-bold text-slate-400 uppercase tracking-wider ml-0.5">Match Condition</label>
                      <input
                        readOnly={!isAdmin}
                        type="text"
                        value={selectedNode.data.config?.condition || ''}
                        onChange={(e) => updateNodeConfig({ condition: e.target.value })}
                        onBlur={() => saveToHistory(nodes, edges)}
                        placeholder="e.g., reply_text"
                        className="w-full h-9 px-3 bg-slate-50 border border-slate-200 rounded-lg text-xs font-semibold focus:bg-white focus:border-[#004277] outline-none"
                      />
                    </div>

                    <div className="space-y-2">
                      <label className="text-[10px] font-bold text-slate-400 uppercase tracking-wider ml-0.5">Branches (Outputs)</label>
                      {(selectedNode.data.config?.branches || []).map((branch, i) => (
                        <div key={i} className="flex gap-2">
                          <input
                            readOnly={!isAdmin}
                            type="text"
                            value={branch.value}
                            onChange={(e) => {
                              const newBranches = [...(selectedNode.data.config.branches || [])];
                              newBranches[i].value = e.target.value;
                              updateNodeConfig({ branches: newBranches });
                            }}
                            onBlur={() => saveToHistory(nodes, edges)}
                            placeholder={`Option ${i+1}`}
                            className="flex-1 h-9 px-3 bg-slate-50 border border-slate-200 rounded-lg text-xs font-semibold focus:bg-white focus:border-[#004277] outline-none"
                          />
                          {isAdmin && (
                            <button
                              onClick={() => {
                                const newBranches = (selectedNode.data.config.branches || []).filter((_, idx) => idx !== i);
                                updateNodeConfig({ branches: newBranches });
                                saveToHistory(nodes, edges);
                              }}
                              className="w-9 h-9 border border-red-200 hover:bg-red-50 text-red-500 rounded-lg flex items-center justify-center shrink-0 cursor-pointer"
                              title="Delete Branch"
                            >
                              <Trash2 size={13} />
                            </button>
                          )}
                        </div>
                      ))}
                      {isAdmin && (
                        <button
                          type="button"
                          onClick={() => {
                            const newBranches = [...(selectedNode.data.config?.branches || []), { value: '' }];
                            updateNodeConfig({ branches: newBranches });
                            saveToHistory(nodes, edges);
                          }}
                          className="w-full h-9 border border-dashed border-slate-200 rounded-lg text-[10px] font-bold text-slate-400 uppercase tracking-wider hover:border-[#004277] hover:text-[#004277] transition-all cursor-pointer"
                        >
                          + Add Branch Option
                        </button>
                      )}
                    </div>
                  </div>
                )}

                {selectedNode.type === 'actionNode' && (
                  <div className="space-y-4">
                    <div className="space-y-2">
                      <label className="text-[10px] font-bold text-slate-400 uppercase tracking-wider ml-0.5">Action Template</label>
                      <div className="grid grid-cols-1 gap-2">
                        <button
                          disabled={!isAdmin}
                          onClick={() => {
                            updateNodeConfig({ actionType: 'notify', label: 'Notification' });
                            saveToHistory(nodes, edges);
                          }}
                          className={`p-3 rounded-xl border flex items-center gap-3 transition-all cursor-pointer ${selectedNode.data.config?.actionType === 'notify' ? 'border-[#004277] bg-blue-50/20 text-[#004277]' : 'border-slate-200 bg-slate-50 hover:bg-slate-100'}`}
                        >
                          <Bell size={14} />
                          <span className="text-xs font-bold">Admin Notification</span>
                        </button>
                      </div>
                    </div>
                  </div>
                )}

                {/* Properties Action buttons */}
                {isAdmin && (
                  <div className="pt-4 border-t border-slate-100 mt-6">
                    <button
                      onClick={() => {
                        const targetId = selectedNode.id;
                        setNodes(nds => {
                          const nextNds = nds.filter(n => n.id !== targetId);
                          // filter edges connected to deleted node
                          setEdges(eds => {
                            const nextEds = eds.filter(e => e.source !== targetId && e.target !== targetId);
                            saveToHistory(nextNds, nextEds);
                            return nextEds;
                          });
                          return nextNds;
                        });
                        setSelectedNode(null);
                      }}
                      className="w-full flex items-center justify-center gap-2 h-9 border border-red-200 hover:bg-red-50 text-red-600 text-[10px] font-black uppercase tracking-wider rounded-lg transition-colors cursor-pointer"
                    >
                      <Trash2 size={13} />
                      <span>Delete Node</span>
                    </button>
                  </div>
                )}
              </div>
            )}
          </div>

          {/* Properties footer banner */}
          <div className="p-4 border-t border-slate-100 shrink-0 bg-slate-50/50 flex items-center justify-center">
            {isAdmin ? (
              <button
                onClick={() => handleSave()}
                className="w-full flex items-center justify-center gap-2 h-9 bg-slate-900 text-white text-[10px] font-black uppercase tracking-widest rounded-lg hover:bg-slate-800 transition-colors shadow-sm"
              >
                <Save size={13} />
                <span>Save Changes</span>
              </button>
            ) : (
              <span className="text-[9px] font-bold text-slate-400 uppercase tracking-widest leading-none">Read-Only Viewer</span>
            )}
          </div>
        </aside>

      </div>
    </div>
  );
}

function NodeDragSection({ title, nodes, onNodeAdd }) {
  const onDragStart = (event, nodeType) => {
    event.dataTransfer.setData('application/reactflow', nodeType);
    event.dataTransfer.effectAllowed = 'move';
  };

  return (
    <div className="space-y-2.5">
      <h4 className="text-[10px] font-bold text-slate-400 uppercase tracking-widest ml-0.5">{title}</h4>
      <div className="space-y-2">
        {nodes.map((node) => (
          <div
            key={node.type}
            draggable
            onDragStart={(e) => onDragStart(e, node.type)}
            onClick={() => onNodeAdd(node.type)}
            className="flex items-center gap-3 p-2.5 bg-slate-50 border border-slate-200 rounded-xl cursor-grab active:cursor-grabbing hover:bg-white hover:border-[#004277]/20 hover:shadow-md transition-all active:scale-[0.98] select-none"
            title="Drag to canvas or click to add"
          >
            <div className={`w-8 h-8 ${node.color} rounded-lg flex items-center justify-center shrink-0 border border-slate-150/40`}>
              <node.icon size={14} fill={node.type.includes('trigger') ? 'currentColor' : 'none'} />
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
