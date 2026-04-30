import React, { useState, useRef, useEffect } from 'react';
import axios from 'axios';
import {
  Plus,
  Save,
  Rocket,
  Search,
  Filter,
  MoreVertical,
  Play,
  FileEdit,
  Copy,
  Trash2,
  ChevronRight,
  MousePointer2,
  MessageSquare,
  GitBranch,
  Split,
  LayoutGrid,
  Maximize2,
  Minimize2,
  Settings2,
  Clock,
  Image as ImageIcon,
  Video,
  FileText,
  Code2,
  CheckCircle2,
  Zap,
  Phone,
  Send,
  X,
  ChevronDown,
  Info,
  ExternalLink,
  Trash,
  Upload,
  Download,
  RotateCcw,
  RotateCw,
  Target,
  UserPlus,
  ArrowRight,
  Minus
} from 'lucide-react';

const API_BASE_URL = 'http://localhost:5000/api/automation'; // Adjust as needed

export default function AutomationPage() {
  const [activeView, setActiveView] = useState('list'); // 'list' or 'builder'
  const [filterTab, setFilterTab] = useState('all');
  const [searchQuery, setSearchQuery] = useState('');
  const [flows, setFlows] = useState([]);
  const [loading, setLoading] = useState(true);
  const [currentFlow, setCurrentFlow] = useState(null);

  // Builder States
  const [selectedNodeId, setSelectedNodeId] = useState(null);
  const [draggingNodeId, setDraggingNodeId] = useState(null);
  const [dragOffset, setDragOffset] = useState({ x: 0, y: 0 });
  const [drawingConnection, setDrawingConnection] = useState(null);
  const [mousePosition, setMousePosition] = useState({ x: 0, y: 0 });
  const [searchBlocks, setSearchBlocks] = useState('');
  const [canvasScale, setCanvasScale] = useState(1);
  const [isSaving, setIsSaving] = useState(false);

  const canvasRef = useRef(null);

  // Initial Blocks Configuration
  const blockTypes = [
    { type: 'text', label: 'Text', description: 'Send text message', icon: MessageSquare, color: 'text-blue-600', bg: 'bg-blue-50' },
    { type: 'image', label: 'Image', description: 'Send image', icon: ImageIcon, color: 'text-emerald-600', bg: 'bg-emerald-50' },
    { type: 'video', label: 'Video', description: 'Send video', icon: Video, color: 'text-purple-600', bg: 'bg-purple-50' },
    { type: 'button', label: 'Button', description: 'Button options', icon: LayoutGrid, color: 'text-amber-600', bg: 'bg-amber-50' },
    { type: 'quick_reply', label: 'Quick Reply', description: 'Quick reply buttons', icon: Zap, color: 'text-pink-600', bg: 'bg-pink-50' },
    { type: 'condition', label: 'Condition', description: 'Logic condition', icon: Split, color: 'text-indigo-600', bg: 'bg-indigo-50' },
    { type: 'wait', label: 'Wait', description: 'Wait for sometime', icon: Clock, color: 'text-slate-600', bg: 'bg-slate-50' },
    { type: 'user_input', label: 'User Input', description: 'Ask user something', icon: FileText, color: 'text-orange-600', bg: 'bg-orange-50' },
    { type: 'go_to', label: 'Go To', description: 'Jump to another block', icon: ArrowRight, color: 'text-cyan-600', bg: 'bg-cyan-50' },
  ];

  useEffect(() => {
    fetchFlows();
  }, []);

  const handleMouseDown = (e, nodeId) => {
    e.stopPropagation();
    const node = currentFlow.nodes.find(n => n.id === nodeId);
    if (!node) return;
    
    setSelectedNodeId(nodeId);
    setDraggingNodeId(nodeId);
    setDragOffset({
      x: e.clientX - node.x,
      y: e.clientY - node.y
    });
  };

  const handleMouseMove = (e) => {
    setMousePosition({ x: e.clientX, y: e.clientY });
    if (!draggingNodeId) return;

    const updatedNodes = currentFlow.nodes.map(node => 
      node.id === draggingNodeId 
        ? { ...node, x: e.clientX - dragOffset.x, y: e.clientY - dragOffset.y }
        : node
    );
    setCurrentFlow({ ...currentFlow, nodes: updatedNodes });
  };

  const handleMouseUp = () => {
    setDraggingNodeId(null);
    setDrawingConnection(null);
  };

  const handleConnectionStart = (e, nodeId) => {
    e.stopPropagation();
    const node = currentFlow.nodes.find(n => n.id === nodeId);
    if (!node) return;
    setDrawingConnection({
      fromId: nodeId,
      fromX: node.x + 130, // Center of node
      fromY: node.y + 100  // Bottom handle position approx
    });
  };

  const handleConnectionEnd = (e, nodeId) => {
    e.stopPropagation();
    if (!drawingConnection || drawingConnection.fromId === nodeId) return;

    // Check if connection already exists
    const exists = currentFlow.connections.some(c => c.from === drawingConnection.fromId && c.to === nodeId);
    if (exists) return;

    const newConnection = {
      from: drawingConnection.fromId,
      to: nodeId
    };

    setCurrentFlow({
      ...currentFlow,
      connections: [...currentFlow.connections, newConnection]
    });
    setDrawingConnection(null);
  };

  const fetchFlows = async () => {
    try {
      setLoading(true);
      const response = await axios.get(API_BASE_URL);
      setFlows(response.data);
    } catch (error) {
      console.error('Error fetching flows:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleCreateNew = () => {
    const newFlow = {
      name: 'New Automation Flow',
      status: 'draft',
      triggers: ['When user sends a message'],
      nodes: [],
      connections: []
    };
    setCurrentFlow(newFlow);
    setActiveView('builder');
  };

  const handleEditFlow = (flow) => {
    setCurrentFlow(flow);
    setActiveView('builder');
  };

  const handleSaveFlow = async () => {
    try {
      setIsSaving(true);
      if (currentFlow._id) {
        await axios.put(`${API_BASE_URL}/${currentFlow._id}`, currentFlow);
      } else {
        const response = await axios.post(API_BASE_URL, currentFlow);
        setCurrentFlow(response.data);
      }
      fetchFlows();
    } catch (error) {
      console.error('Error saving flow:', error);
    } finally {
      setIsSaving(false);
    }
  };

  const updateNodeData = (nodeId, newData) => {
    const updatedNodes = currentFlow.nodes.map(node =>
      node.id === nodeId ? { ...node, data: { ...node.data, ...newData } } : node
    );
    setCurrentFlow({ ...currentFlow, nodes: updatedNodes });
  };

  const addNode = (block) => {
    const newNode = {
      id: `node_${Date.now()}`,
      type: block.type,
      label: `${block.label}`,
      x: 150 + (currentFlow.nodes.length * 40),
      y: 150 + (currentFlow.nodes.length * 40),
      data: {
        caption: 'New message content...',
        trigger: block.type === 'start' ? 'When user sends a message' : undefined
      }
    };
    setCurrentFlow({
      ...currentFlow,
      nodes: [...currentFlow.nodes, newNode]
    });
  };

  const selectedNode = currentFlow?.nodes.find(n => n.id === selectedNodeId);

  if (activeView === 'builder') {
    return (
      <div className="flex flex-col h-[calc(100vh+20px)] -mt-8 -mx-8 overflow-hidden bg-slate-50 relative">
        {/* Top Blocks Toolbar */}
        <div className="bg-white border-b border-slate-200 px-4 py-1.5 flex items-center justify-between z-10 shadow-sm">
          <div className="flex items-center gap-3">
            <button
              onClick={() => setActiveView('list')}
              className="p-1.5 hover:bg-slate-100 rounded-lg text-slate-500 transition-colors"
            >
              <ChevronRight className="rotate-180" size={18} />
            </button>
            <div className="h-6 w-px bg-slate-200 mx-1"></div>
            <div className="flex items-center gap-1.5 overflow-x-auto no-scrollbar">
              {blockTypes.map((block, i) => (
                <div
                  key={i}
                  onClick={() => addNode(block)}
                  className="flex items-center gap-1.5 px-2 py-1 rounded-lg border border-transparent hover:border-emerald-200 hover:bg-emerald-50/50 cursor-pointer transition-all group shrink-0"
                >
                  <div className={`w-5 h-5 rounded ${block.bg} ${block.color} flex items-center justify-center transition-transform group-hover:scale-110`}>
                    <block.icon size={12} />
                  </div>
                  <span className="text-[10px] font-bold text-slate-500">{block.label}</span>
                </div>
              ))}
            </div>
          </div>

          <div className="flex items-center gap-2 ml-4">
            <button
              onClick={handleSaveFlow}
              disabled={isSaving}
              className="px-3 py-1.5 text-[10px] font-bold text-slate-600 hover:bg-slate-50 rounded-lg border border-slate-200 flex items-center gap-1.5 transition-all disabled:opacity-50"
            >
              <Save size={14} className="text-slate-400" />
              {isSaving ? 'Saving...' : 'Save Draft'}
            </button>
            <button
              className="px-3 py-1.5 text-[10px] font-bold text-white bg-emerald-500 hover:bg-emerald-600 rounded-lg shadow-md shadow-emerald-100 flex items-center gap-1.5 transition-all"
            >
              <Rocket size={14} />
              Publish
            </button>
          </div>
        </div>

        <div className="flex-1 flex overflow-hidden">
          {/* Canvas Area */}
          <div 
            ref={canvasRef}
            onMouseMove={handleMouseMove}
            onMouseUp={handleMouseUp}
            onMouseLeave={handleMouseUp}
            className="flex-1 relative overflow-hidden bg-slate-50 select-none" 
            style={{
              backgroundImage: 'radial-gradient(#e2e8f0 1.5px, transparent 1.5px)',
              backgroundSize: '30px 30px',
              transform: `scale(${canvasScale})`,
              transformOrigin: 'center center'
            }}
          >
            {/* SVG Connections Layer */}
            <svg className="absolute inset-0 w-full h-full pointer-events-none z-0">
              {currentFlow.connections.map((conn, i) => {
                const fromNode = currentFlow.nodes.find(n => n.id === conn.from);
                const toNode = currentFlow.nodes.find(n => n.id === conn.to);
                if (!fromNode || !toNode) return null;
                const x1 = fromNode.x + 130;
                const y1 = fromNode.y + (fromNode.type === 'start' ? 80 : 120); // Adjust based on node height
                const x2 = toNode.x + 130;
                const y2 = toNode.y;
                return (
                  <path
                    key={i}
                    d={`M ${x1} ${y1} C ${x1} ${y1 + 50}, ${x2} ${y2 - 50}, ${x2} ${y2}`}
                    fill="none"
                    stroke="#10b981"
                    strokeWidth="3"
                    markerEnd="url(#arrowhead)"
                  />
                );
              })}
              
              {/* Active Drawing Connection */}
              {drawingConnection && (
                <path
                  d={`M ${drawingConnection.fromX} ${drawingConnection.fromY} C ${drawingConnection.fromX} ${drawingConnection.fromY + 50}, ${mousePosition.x - (canvasRef.current?.getBoundingClientRect().left || 0)} ${mousePosition.y - (canvasRef.current?.getBoundingClientRect().top || 0) - 50}, ${mousePosition.x - (canvasRef.current?.getBoundingClientRect().left || 0)} ${mousePosition.y - (canvasRef.current?.getBoundingClientRect().top || 0)}`}
                  fill="none"
                  stroke="#10b981"
                  strokeWidth="3"
                  strokeDasharray="5,5"
                />
              )}

              <defs>
                <marker id="arrowhead" markerWidth="10" markerHeight="7" refX="9" refY="3.5" orient="auto">
                  <polygon points="0 0, 10 3.5, 0 7" fill="#10b981" />
                </marker>
              </defs>
            </svg>

            {/* Nodes */}
            {currentFlow.nodes.map((node) => (
              <div
                key={node.id}
                onMouseDown={(e) => handleMouseDown(e, node.id)}
                style={{ left: node.x, top: node.y }}
                className={`absolute w-64 bg-white border-2 rounded-2xl shadow-xl overflow-visible cursor-move transition-shadow z-10 ${selectedNodeId === node.id ? 'border-emerald-500 ring-4 ring-emerald-500/10' : 'border-slate-100 hover:border-slate-300'}`}
              >
                {/* Input Handle (Top) */}
                {node.type !== 'start' && (
                  <div 
                    onMouseUp={(e) => handleConnectionEnd(e, node.id)}
                    className="absolute -top-3 left-1/2 -translate-x-1/2 w-6 h-6 flex items-center justify-center group cursor-crosshair z-20"
                  >
                    <div className={`w-3 h-3 rounded-full border-2 border-slate-300 bg-white group-hover:bg-emerald-500 group-hover:border-emerald-500 transition-colors ${drawingConnection ? 'scale-125 border-emerald-500 animate-pulse' : ''}`}></div>
                  </div>
                )}

                <div className={`px-4 py-2 flex items-center justify-between rounded-t-2xl ${node.type === 'start' ? 'bg-emerald-500' : node.type === 'end' ? 'bg-red-500' : 'bg-blue-500'}`}>
                  <div className="flex items-center gap-2 text-white">
                    {node.type === 'start' ? <Zap size={14} fill="white" /> : node.type === 'end' ? <Target size={14} /> : <ImageIcon size={14} />}
                    <span className="text-[10px] font-bold uppercase tracking-wider">{node.label}</span>
                  </div>
                  <div className="flex items-center gap-1">
                    <button 
                       onClick={(e) => {
                         e.stopPropagation();
                         const updatedNodes = currentFlow.nodes.filter(n => n.id !== node.id);
                         const updatedConnections = currentFlow.connections.filter(c => c.from !== node.id && c.to !== node.id);
                         setCurrentFlow({ ...currentFlow, nodes: updatedNodes, connections: updatedConnections });
                       }}
                       className="p-1 hover:bg-white/20 rounded text-white"
                    >
                      <Trash2 size={12} />
                    </button>
                    <MoreVertical size={14} className="text-white opacity-50" />
                  </div>
                </div>

                <div className="p-4 bg-white rounded-b-2xl">
                  {node.type === 'start' && (
                    <div className="space-y-2">
                      <p className="text-[10px] font-bold text-slate-400 uppercase">Trigger</p>
                      <select
                        value={node.data.trigger}
                        onMouseDown={(e) => e.stopPropagation()}
                        onChange={(e) => updateNodeData(node.id, { trigger: e.target.value })}
                        className="w-full bg-slate-50 border border-slate-200 rounded-lg px-2 py-1 text-xs font-medium outline-none focus:border-emerald-500 transition-all cursor-pointer"
                      >
                        <option>When user sends a message</option>
                        <option>New subscriber added</option>
                        <option>Keyword: HELP</option>
                      </select>
                    </div>
                  )}
                  {(node.type === 'image' || node.type === 'video' || node.type === 'audio' || node.type === 'text') && (
                    <div className="space-y-1">
                       <p className="text-[10px] font-bold text-slate-400 uppercase">{node.type === 'text' ? 'Message' : 'Caption'}</p>
                       <textarea
                        value={node.data.caption || ''}
                        onMouseDown={(e) => e.stopPropagation()}
                        onChange={(e) => updateNodeData(node.id, { caption: e.target.value })}
                        placeholder={`Type ${node.type === 'text' ? 'message' : 'caption'}...`}
                        className="w-full h-20 bg-slate-50 border border-slate-200 rounded-lg px-2 py-1.5 text-xs font-medium outline-none focus:border-emerald-500 transition-all resize-none"
                      />
                    </div>
                  )}
                  {node.type === 'end' && (
                    <div className="text-center py-2">
                      <p className="text-xs font-bold text-slate-400 uppercase">End Flow</p>
                    </div>
                  )}
                </div>

                {/* Output Handle (Bottom) */}
                {node.type !== 'end' && (
                  <div 
                    onMouseDown={(e) => handleConnectionStart(e, node.id)}
                    className="absolute -bottom-3 left-1/2 -translate-x-1/2 w-6 h-6 flex items-center justify-center group cursor-crosshair z-20"
                  >
                    <div className="w-3 h-3 rounded-full border-2 border-slate-300 bg-white group-hover:bg-emerald-500 group-hover:border-emerald-500 transition-colors"></div>
                  </div>
                )}
              </div>
            ))}
          </div>

        </div>
      </div>
    );
  }

  return (
    <div className="flex flex-col bg-slate-50 -m-8 min-h-[calc(100vh-80px)] overflow-hidden">
      <div className="bg-white border-b border-slate-200 px-8 py-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-8">
            {[
              { label: 'Total Flows', value: flows.length.toString(), color: 'text-blue-600' },
              { label: 'Active', value: flows.filter(f => f.status === 'active').length.toString(), color: 'text-emerald-600' },
              { label: 'Total Steps', value: '12', color: 'text-amber-600' },
              { label: 'Subscribers', value: '842', color: 'text-purple-600' }
            ].map((stat, i) => (
              <div key={i} className="flex flex-col">
                <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest leading-none mb-1">{stat.label}</p>
                <p className={`text-lg font-black ${stat.color} leading-none`}>{stat.value}</p>
              </div>
            ))}
          </div>
          <button
            onClick={handleCreateNew}
            className="flex items-center gap-2 px-6 py-3 bg-emerald-500 text-white rounded-2xl font-bold hover:bg-emerald-600 transition-all shadow-xl shadow-emerald-200 group"
          >
            <Plus size={20} className="group-hover:rotate-90 transition-transform" />
            Create New Flow
          </button>
        </div>
      </div>

      <div className="flex-1 overflow-y-auto p-8 space-y-8">
        <div className="bg-white border border-slate-200 rounded-3xl shadow-sm overflow-hidden flex flex-col">
          <div className="p-6 border-b border-slate-100 flex flex-col lg:flex-row items-center justify-between gap-4">
            <div className="flex items-center gap-2 bg-slate-50 p-1.5 rounded-2xl border border-slate-200">
              {['all', 'active', 'draft'].map((tab) => (
                <button
                  key={tab}
                  onClick={() => setFilterTab(tab)}
                  className={`px-6 py-2 text-xs font-bold rounded-xl transition-all capitalize ${filterTab === tab ? 'bg-white text-emerald-600 shadow-md border border-slate-200' : 'text-slate-400 hover:text-slate-600'}`}
                >
                  {tab}
                </button>
              ))}
            </div>
            <div className="relative flex-1 lg:w-80">
              <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400" size={18} />
              <input
                type="text"
                placeholder="Search your flows..."
                className="w-full pl-12 pr-4 py-3 bg-slate-50 border border-slate-200 rounded-2xl text-sm outline-none focus:border-emerald-500 transition-all font-medium"
              />
            </div>
          </div>

          {loading ? (
            <div className="p-20 text-center text-slate-400 font-bold">Loading flows...</div>
          ) : flows.length === 0 ? (
            <div className="p-20 flex flex-col items-center text-center gap-6">
              <div className="w-20 h-20 bg-slate-50 rounded-full flex items-center justify-center text-slate-200">
                <GitBranch size={40} />
              </div>
              <div>
                <h3 className="text-xl font-bold text-slate-800">No flows created yet</h3>
                <p className="text-slate-400 max-w-xs mt-2 font-medium text-sm">Start building your first automation flow.</p>
              </div>
              <button onClick={handleCreateNew} className="px-8 py-3 bg-slate-900 text-white rounded-2xl font-bold hover:bg-black transition-all">Create Flow</button>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 p-8 gap-8">
              {flows.map((flow) => (
                <div
                  key={flow._id}
                  className="group bg-white border border-slate-200 rounded-3xl p-6 hover:border-emerald-500 hover:shadow-2xl hover:shadow-emerald-500/10 transition-all relative overflow-hidden"
                >
                  <div className="flex items-start justify-between mb-6">
                    <div className={`w-14 h-14 rounded-2xl flex items-center justify-center ${flow.status === 'active' ? 'bg-emerald-50 text-emerald-600' : 'bg-slate-50 text-slate-400'}`}>
                      <GitBranch size={28} />
                    </div>
                    <div className="flex items-center gap-2">
                      <span className={`px-3 py-1 rounded-full text-[10px] font-black uppercase tracking-widest ${flow.status === 'active' ? 'bg-green-100 text-green-700' : 'bg-slate-100 text-slate-600'}`}>
                        {flow.status}
                      </span>
                    </div>
                  </div>
                  <h4 className="font-black text-slate-800 text-xl group-hover:text-emerald-600 transition-colors">{flow.name}</h4>
                  <p className="text-[10px] text-slate-400 font-bold uppercase tracking-widest mt-2">{new Date(flow.updatedAt).toLocaleDateString()}</p>
                  <div className="mt-8 flex items-center justify-between pt-6 border-t border-slate-50">
                    <button
                      onClick={() => handleEditFlow(flow)}
                      className="px-6 py-2 bg-slate-900 text-white rounded-xl text-xs font-bold hover:bg-black transition-all flex items-center gap-2"
                    >
                      <FileEdit size={14} /> Open Builder
                    </button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
