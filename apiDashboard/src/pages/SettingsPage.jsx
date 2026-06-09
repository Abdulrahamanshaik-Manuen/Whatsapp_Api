import React, { useState, useEffect, useRef } from 'react';
import {
  User, Shield, Save, Trash2, ShieldCheck, Plus,
  Package, ShoppingBag, PlusCircle, Edit3, Loader2, Search,
  Upload, Download, ChevronRight, ChevronDown, Lock, LogOut,
  Key, Camera, AlertCircle, Check
} from 'lucide-react';
import * as XLSX from 'xlsx';

const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || 'http://localhost:5000/api';

// Compact form field used in Profile
const Field = ({ label, children }) => (
  <div className="space-y-1">
    <label className="text-[9px] font-black text-slate-400 uppercase tracking-widest ml-0.5">{label}</label>
    {children}
  </div>
);

const inputCls = "w-full h-9 px-3 bg-slate-50 border border-slate-200 rounded-lg text-xs font-semibold text-slate-700 focus:bg-white focus:border-[#004277] focus:ring-1 focus:ring-[#004277]/10 outline-none transition-all placeholder:text-slate-300";
const selectCls = "w-full h-9 px-3 bg-slate-50 border border-slate-200 rounded-lg text-xs font-semibold text-slate-700 focus:bg-white focus:border-[#004277] focus:ring-1 focus:ring-[#004277]/10 outline-none transition-all cursor-pointer";

export default function SettingsPage({ userData, businessData, onUpdate }) {
  const [activeTab, setActiveTab] = useState('Profile');
  const [loading, setLoading] = useState(false);
  const [isDirty, setIsDirty] = useState(false);
  const [products, setProducts] = useState([]);
  const [fetchingProducts, setFetchingProducts] = useState(false);
  const [isEditingProduct, setIsEditingProduct] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [currentPage, setCurrentPage] = useState(1);
  const [itemsPerPage, setItemsPerPage] = useState(20);
  const [expandedRows, setExpandedRows] = useState(new Set());
  const [securityForm, setSecurityForm] = useState({ currentPassword: '', newPassword: '', confirmPassword: '' });
  const [saveFeedback, setSaveFeedback] = useState(null); // 'success' | 'error'
  const fileInputRef = useRef(null);
  const logoInputRef = useRef(null);

  const [productForm, setProductForm] = useState({
    name: '',
    category: '',
    variants: [{ quantity: '', price: '', stock_status: 'In Stock' }]
  });

  const tabs = [
    { id: 'Profile', icon: User, label: 'Profile' },
    { id: 'Security', icon: Shield, label: 'Security' },
    { id: 'Catalogue', icon: ShoppingBag, label: 'Catalogue' }
  ];

  const [formData, setFormData] = useState({
    business_name: businessData?.business_name || '',
    email: businessData?.email || '',
    business_category: businessData?.business_category || 'Other',
    business_description: businessData?.business_description || '',
    address: businessData?.address || '',
    city: businessData?.city || '',
    state: businessData?.state || '',
    country: businessData?.country || '',
    logo_url: businessData?.logo_url || ''
  });

  useEffect(() => {
    if (businessData) {
      setFormData({
        business_name: businessData.business_name || '',
        email: businessData.email || '',
        business_category: businessData.business_category || 'Other',
        business_description: businessData.business_description || '',
        address: businessData.address || '',
        city: businessData.city || '',
        state: businessData.state || '',
        country: businessData.country || '',
        logo_url: businessData.logo_url || ''
      });
      setIsDirty(false);
    }
  }, [businessData]);

  useEffect(() => {
    if (activeTab === 'Catalogue') fetchProducts();
  }, [activeTab]);

  const updateField = (key, val) => {
    setFormData(prev => ({ ...prev, [key]: val }));
    setIsDirty(true);
  };

  const fetchProducts = async () => {
    setFetchingProducts(true);
    try {
      const token = localStorage.getItem('token');
      const res = await fetch(`${API_BASE_URL}/products`, { headers: { 'Authorization': `Bearer ${token}` } });
      const data = await res.json();
      if (res.ok) setProducts(data);
    } catch (err) { console.error(err); }
    finally { setFetchingProducts(false); }
  };

  const handleLogoUpload = (e) => {
    const file = e.target.files[0];
    if (!file) return;
    if (file.size > 2 * 1024 * 1024) { alert('Max 2MB'); return; }
    const reader = new FileReader();
    reader.onloadend = () => { setFormData(prev => ({ ...prev, logo_url: reader.result })); setIsDirty(true); };
    reader.readAsDataURL(file);
  };

  const handleUpdateProfile = async () => {
    setLoading(true);
    try {
      const token = localStorage.getItem('token');
      const res = await fetch(`${API_BASE_URL}/business/profile`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json', 'Authorization': `Bearer ${token}` },
        body: JSON.stringify(formData)
      });
      if (res.ok) {
        setSaveFeedback('success');
        setTimeout(() => setSaveFeedback(null), 2500);
        setIsDirty(false);
        onUpdate();
      } else {
        const err = await res.json();
        alert(`Error: ${err.error}`);
        setSaveFeedback('error');
      }
    } catch (err) {
      console.error(err);
      setSaveFeedback('error');
    } finally { setLoading(false); }
  };

  const handleSaveProduct = async () => {
    setLoading(true);
    try {
      const token = localStorage.getItem('token');
      const method = isEditingProduct ? 'PUT' : 'POST';
      const url = isEditingProduct ? `${API_BASE_URL}/products/${productForm._id}` : `${API_BASE_URL}/products`;
      const res = await fetch(url, {
        method,
        headers: { 'Content-Type': 'application/json', 'Authorization': `Bearer ${token}` },
        body: JSON.stringify(productForm)
      });
      if (res.ok) {
        setProductForm({ name: '', category: '', variants: [{ quantity: '', price: '', stock_status: 'In Stock' }] });
        setIsEditingProduct(false);
        fetchProducts();
      }
    } catch (err) { console.error(err); }
    finally { setLoading(false); }
  };

  const handleAddVariant = () => setProductForm({ ...productForm, variants: [...productForm.variants, { quantity: '', price: '', stock_status: 'In Stock' }] });
  const handleRemoveVariant = (i) => setProductForm({ ...productForm, variants: productForm.variants.filter((_, idx) => idx !== i) });
  const handleVariantChange = (i, field, val) => {
    const v = [...productForm.variants]; v[i][field] = val;
    setProductForm({ ...productForm, variants: v });
  };

  const handleDeleteProduct = async (id) => {
    if (!window.confirm('Delete this product?')) return;
    const token = localStorage.getItem('token');
    await fetch(`${API_BASE_URL}/products/${id}`, { method: 'DELETE', headers: { 'Authorization': `Bearer ${token}` } });
    fetchProducts();
  };

  const handleFileChange = async (e) => {
    const file = e.target.files[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = async (evt) => {
      try {
        const wb = XLSX.read(evt.target.result, { type: 'binary' });
        const ws = wb.Sheets[wb.SheetNames[0]];
        const data = XLSX.utils.sheet_to_json(ws);
        const grouped = {};
        data.forEach(row => {
          const key = `${row['Item Name']}_${row['Category']}`;
          if (!grouped[key]) grouped[key] = { name: row['Item Name'], category: row['Category'], variants: [] };
          grouped[key].variants.push({ quantity: row['Quantity']?.toString() || '1 unit', price: parseFloat(row['Price']) || 0, stock_status: row['Stock Status'] || 'In Stock' });
        });
        setLoading(true);
        const token = localStorage.getItem('token');
        const res = await fetch(`${API_BASE_URL}/products/bulk`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json', 'Authorization': `Bearer ${token}` },
          body: JSON.stringify(Object.values(grouped))
        });
        if (res.ok) { alert(`Imported ${Object.keys(grouped).length} items!`); fetchProducts(); }
      } catch (err) { alert('Error parsing file.'); }
      finally { setLoading(false); e.target.value = null; }
    };
    reader.readAsBinaryString(file);
  };

  const downloadSampleTemplate = () => {
    const ws = XLSX.utils.aoa_to_sheet([
      ['Item Name', 'Category', 'Quantity', 'Price', 'Stock Status'],
      ['Ghee Puja Diya', 'Daily Essentials', '1kg', '200', 'In Stock'],
      ['Moong Dal', 'Groceries', '1kg', '120', 'In Stock']
    ]);
    const wb = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(wb, ws, 'Inventory');
    XLSX.writeFile(wb, 'Inventory_Template.xlsx');
  };

  const toggleRow = (id) => {
    const n = new Set(expandedRows);
    n.has(id) ? n.delete(id) : n.add(id);
    setExpandedRows(n);
  };

  const filteredProducts = products.filter(p =>
    p.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
    p.category.toLowerCase().includes(searchQuery.toLowerCase())
  );
  const totalPages = Math.ceil(filteredProducts.length / itemsPerPage);
  const currentItems = filteredProducts.slice((currentPage - 1) * itemsPerPage, currentPage * itemsPerPage);

  return (
    <div className="flex-1 flex flex-col h-full bg-[#f8fafc] overflow-hidden">
      <main className="flex-1 overflow-y-auto custom-scrollbar p-4 md:p-6 space-y-4">

        {/* ── Page Header ── */}
        <div className="flex items-center justify-between pb-3.5 border-b border-slate-100 shrink-0">
          <div>
            <h1 className="text-2xl font-bold text-slate-800 tracking-tight leading-none">Settings</h1>
            <p className="text-xs text-slate-400 font-semibold mt-2 leading-none">Manage your account and business configuration</p>
          </div>
        </div>

        {/* ── Two-column layout: Nav + Content ── */}
        <div className="flex gap-4 min-h-0">

          {/* ── Left: Compact Nav ── */}
          <div className="w-44 shrink-0">
            <div className="bg-white rounded-lg border border-slate-200 shadow-sm overflow-hidden sticky top-0">
              <div className="px-3 py-2.5 border-b border-slate-100 bg-slate-50/50">
                <p className="text-[9px] font-black text-slate-400 uppercase tracking-widest">Settings</p>
              </div>
              <nav className="p-1.5 space-y-0.5">
                {tabs.map(tab => (
                  <button
                    key={tab.id}
                    onClick={() => setActiveTab(tab.id)}
                    className={`w-full flex items-center gap-2.5 px-3 py-2 rounded-md transition-all text-left cursor-pointer ${
                      activeTab === tab.id
                        ? 'bg-[#004277] text-white'
                        : 'text-slate-500 hover:bg-slate-50 hover:text-slate-700'
                    }`}
                  >
                    <tab.icon size={14} className="shrink-0" />
                    <span className="text-xs font-semibold">{tab.label}</span>
                    {activeTab === tab.id && <ChevronRight size={12} className="ml-auto opacity-60" />}
                  </button>
                ))}
              </nav>
            </div>
          </div>

          {/* ── Right: Content Panel ── */}
          <div className="flex-1 min-w-0 pb-16">

            {/* ── PROFILE TAB ── */}
            {activeTab === 'Profile' && (
              <div className="bg-white rounded-lg border border-slate-200 shadow-sm overflow-hidden animate-in fade-in duration-300">
                <div className="flex items-center gap-2 px-4 py-3 border-b border-slate-100 bg-slate-50/50">
                  <User size={13} className="text-[#004277]" />
                  <h3 className="text-[10px] font-black text-slate-700 uppercase tracking-widest">Business Profile</h3>
                </div>

                <div className="p-4 space-y-4">
                  {/* Logo + Name row */}
                  <div className="flex items-center gap-4 pb-4 border-b border-slate-100">
                    <input type="file" ref={logoInputRef} onChange={handleLogoUpload} className="hidden" accept="image/*" />
                    <div
                      onClick={() => logoInputRef.current?.click()}
                      className="relative w-14 h-14 rounded-lg bg-slate-50 flex items-center justify-center border border-slate-200 cursor-pointer hover:border-[#004277]/40 transition-colors shrink-0 overflow-hidden group"
                    >
                      {formData.logo_url
                        ? <img src={formData.logo_url} alt="Logo" className="w-full h-full object-cover" />
                        : <User size={22} className="text-slate-300" />
                      }
                      <div className="absolute inset-0 bg-black/30 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
                        <Camera size={14} className="text-white" />
                      </div>
                    </div>
                    <div>
                      <p className="text-sm font-bold text-slate-800">{formData.business_name || 'Your Business'}</p>
                      <p className="text-[10px] text-slate-400 font-semibold mt-0.5">{userData?.phone || 'No phone linked'}</p>
                      <button
                        onClick={() => logoInputRef.current?.click()}
                        className="text-[9px] text-[#004277] font-bold mt-1 hover:underline cursor-pointer"
                      >
                        Change logo
                      </button>
                    </div>
                  </div>

                  {/* Form grid */}
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                    <Field label="Business Name">
                      <input className={inputCls} value={formData.business_name} onChange={e => updateField('business_name', e.target.value)} placeholder="e.g. Manuen Infotech" />
                    </Field>
                    <Field label="Contact Email">
                      <input className={inputCls} value={formData.email} onChange={e => updateField('email', e.target.value)} placeholder="admin@company.com" />
                    </Field>
                    <Field label="Business Category">
                      <select className={selectCls} value={formData.business_category} onChange={e => updateField('business_category', e.target.value)}>
                        {['Retail', 'E-commerce', 'Healthcare', 'Education', 'Finance', 'Real Estate', 'Technology', 'Logistics', 'Other'].map(c => (
                          <option key={c} value={c}>{c}</option>
                        ))}
                      </select>
                    </Field>
                    <Field label="Business Description">
                      <input className={inputCls} value={formData.business_description} onChange={e => updateField('business_description', e.target.value)} placeholder="Brief description of services" />
                    </Field>
                  </div>

                  {/* Address */}
                  <Field label="Street Address">
                    <input className={inputCls} value={formData.address} onChange={e => updateField('address', e.target.value)} placeholder="Street, Suite, Unit" />
                  </Field>
                  <div className="grid grid-cols-3 gap-3">
                    <Field label="City">
                      <input className={inputCls} value={formData.city} onChange={e => updateField('city', e.target.value)} placeholder="City" />
                    </Field>
                    <Field label="State">
                      <input className={inputCls} value={formData.state} onChange={e => updateField('state', e.target.value)} placeholder="State" />
                    </Field>
                    <Field label="Country">
                      <input className={inputCls} value={formData.country} onChange={e => updateField('country', e.target.value)} placeholder="Country" />
                    </Field>
                  </div>
                </div>
              </div>
            )}

            {/* ── SECURITY TAB ── */}
            {activeTab === 'Security' && (
              <div className="space-y-4 animate-in fade-in duration-300">

                {/* Change Password */}
                <div className="bg-white rounded-lg border border-slate-200 shadow-sm overflow-hidden">
                  <div className="flex items-center gap-2 px-4 py-3 border-b border-slate-100 bg-slate-50/50">
                    <Key size={13} className="text-[#004277]" />
                    <h3 className="text-[10px] font-black text-slate-700 uppercase tracking-widest">Change Password</h3>
                  </div>
                  <div className="p-4 grid grid-cols-1 md:grid-cols-3 gap-3">
                    <Field label="Current Password">
                      <input type="password" className={inputCls} placeholder="••••••••"
                        value={securityForm.currentPassword}
                        onChange={e => setSecurityForm(p => ({ ...p, currentPassword: e.target.value }))} />
                    </Field>
                    <Field label="New Password">
                      <input type="password" className={inputCls} placeholder="••••••••"
                        value={securityForm.newPassword}
                        onChange={e => setSecurityForm(p => ({ ...p, newPassword: e.target.value }))} />
                    </Field>
                    <Field label="Confirm Password">
                      <input type="password" className={inputCls} placeholder="••••••••"
                        value={securityForm.confirmPassword}
                        onChange={e => setSecurityForm(p => ({ ...p, confirmPassword: e.target.value }))} />
                    </Field>
                  </div>
                  {securityForm.newPassword && securityForm.confirmPassword && securityForm.newPassword !== securityForm.confirmPassword && (
                    <div className="mx-4 mb-3 flex items-center gap-2 text-rose-500">
                      <AlertCircle size={12} />
                      <span className="text-[10px] font-semibold">Passwords do not match</span>
                    </div>
                  )}
                  <div className="px-4 pb-4">
                    <button className="h-8 px-4 bg-[#004277] text-white text-xs font-bold rounded-lg hover:brightness-105 cursor-pointer transition-all">
                      Update Password
                    </button>
                  </div>
                </div>

                {/* Security Actions */}
                <div className="bg-white rounded-lg border border-slate-200 shadow-sm overflow-hidden">
                  <div className="flex items-center gap-2 px-4 py-3 border-b border-slate-100 bg-slate-50/50">
                    <ShieldCheck size={13} className="text-[#004277]" />
                    <h3 className="text-[10px] font-black text-slate-700 uppercase tracking-widest">Account Security</h3>
                  </div>
                  <div className="divide-y divide-slate-100">
                    {/* Sessions */}
                    <div className="flex items-center justify-between px-4 py-3">
                      <div>
                        <p className="text-xs font-semibold text-slate-700">Active Sessions</p>
                        <p className="text-[10px] text-slate-400 font-semibold mt-0.5">Sign out from all other devices</p>
                      </div>
                      <button className="flex items-center gap-1.5 h-7 px-3 bg-rose-50 border border-rose-200 text-rose-600 text-[10px] font-bold rounded-lg hover:bg-rose-100 cursor-pointer transition-all">
                        <LogOut size={11} />
                        Logout All
                      </button>
                    </div>
                  </div>
                </div>

              </div>
            )}

            {/* ── CATALOGUE TAB ── */}
            {activeTab === 'Catalogue' && (
              <div className="space-y-4 animate-in fade-in duration-300">

                {/* Catalogue Toolbar */}
                <div className="bg-white rounded-lg border border-slate-200 shadow-sm px-4 py-2.5 flex flex-wrap items-center gap-2">
                  <div className="relative flex-1 min-w-[160px]">
                    <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-300" size={13} />
                    <input
                      type="text"
                      placeholder="Search products..."
                      value={searchQuery}
                      onChange={e => { setSearchQuery(e.target.value); setCurrentPage(1); }}
                      className="w-full h-8 pl-8 pr-3 bg-slate-50 border border-slate-200 rounded-lg text-xs font-semibold focus:bg-white focus:border-[#004277] focus:ring-1 focus:ring-[#004277]/10 outline-none transition-all"
                    />
                  </div>
                  <div className="flex items-center gap-2 ml-auto">
                    <span className="text-[10px] text-slate-400 font-semibold">{products.length} items</span>
                    <div className="w-px h-4 bg-slate-200" />
                    <button
                      onClick={() => fileInputRef.current?.click()}
                      className="flex items-center gap-1.5 h-8 px-3 bg-white border border-slate-200 hover:bg-slate-50 text-slate-600 text-xs font-bold rounded-lg transition-all cursor-pointer"
                    >
                      <Upload size={12} />
                      Import
                    </button>
                    <button
                      onClick={downloadSampleTemplate}
                      className="flex items-center gap-1.5 h-8 px-3 bg-white border border-slate-200 hover:bg-slate-50 text-slate-600 text-xs font-bold rounded-lg transition-all cursor-pointer"
                    >
                      <Download size={12} />
                      Template
                    </button>
                    <input type="file" ref={fileInputRef} onChange={handleFileChange} accept=".csv,.xlsx,.xls" className="hidden" />
                  </div>
                </div>

                {/* Add / Edit Product Form */}
                <div className="bg-white rounded-lg border border-slate-200 shadow-sm overflow-hidden">
                  <div className="flex items-center gap-2 px-4 py-3 border-b border-slate-100 bg-slate-50/50">
                    <PlusCircle size={13} className="text-[#004277]" />
                    <h3 className="text-[10px] font-black text-slate-700 uppercase tracking-widest">
                      {isEditingProduct ? 'Edit Product' : 'Add Product'}
                    </h3>
                    {isEditingProduct && (
                      <button
                        onClick={() => { setProductForm({ name: '', category: '', variants: [{ quantity: '', price: '', stock_status: 'In Stock' }] }); setIsEditingProduct(false); }}
                        className="ml-auto text-[9px] text-slate-400 hover:text-rose-500 font-bold cursor-pointer"
                      >
                        Cancel
                      </button>
                    )}
                  </div>
                  <div className="p-4 space-y-3">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                      <Field label="Product Name">
                        <input className={inputCls} value={productForm.name} onChange={e => setProductForm({ ...productForm, name: e.target.value })} placeholder="e.g. Papad" />
                      </Field>
                      <Field label="Category">
                        <input className={inputCls} value={productForm.category} onChange={e => setProductForm({ ...productForm, category: e.target.value })} placeholder="e.g. Groceries" />
                      </Field>
                    </div>

                    <div className="space-y-2">
                      <div className="flex items-center justify-between">
                        <p className="text-[9px] font-black text-slate-400 uppercase tracking-widest">Variants / Pricing</p>
                        <button onClick={handleAddVariant} className="text-[9px] text-[#004277] font-bold hover:underline flex items-center gap-1 cursor-pointer">
                          <PlusCircle size={11} /> Add Variant
                        </button>
                      </div>
                      <div className="space-y-2">
                        {productForm.variants.map((v, idx) => (
                          <div key={idx} className="flex items-center gap-2 bg-slate-50 rounded-lg p-2">
                            <input
                              value={v.quantity}
                              onChange={e => handleVariantChange(idx, 'quantity', e.target.value)}
                              placeholder="1 Piece / 1kg"
                              className="flex-1 h-8 px-3 bg-white border border-slate-200 rounded-md text-xs font-semibold outline-none focus:border-[#004277] transition-all"
                            />
                            <div className="relative">
                              <span className="absolute left-2.5 top-1/2 -translate-y-1/2 text-slate-400 text-xs font-bold">₹</span>
                              <input
                                type="number"
                                value={v.price}
                                onChange={e => handleVariantChange(idx, 'price', e.target.value)}
                                placeholder="0"
                                className="w-24 h-8 pl-6 pr-2 bg-white border border-slate-200 rounded-md text-xs font-semibold outline-none focus:border-[#004277] transition-all"
                              />
                            </div>
                            <select
                              value={v.stock_status}
                              onChange={e => handleVariantChange(idx, 'stock_status', e.target.value)}
                              className="h-8 px-2 bg-white border border-slate-200 rounded-md text-[10px] font-bold outline-none focus:border-[#004277] transition-all cursor-pointer"
                            >
                              <option>In Stock</option>
                              <option>Out of Stock</option>
                            </select>
                            {productForm.variants.length > 1 && (
                              <button onClick={() => handleRemoveVariant(idx)} className="w-7 h-7 flex items-center justify-center text-rose-400 hover:bg-rose-50 rounded-md cursor-pointer transition-colors">
                                <Trash2 size={13} />
                              </button>
                            )}
                          </div>
                        ))}
                      </div>
                    </div>

                    <div className="flex justify-end">
                      <button
                        onClick={handleSaveProduct}
                        disabled={loading || !productForm.name}
                        className="flex items-center gap-2 h-8 px-4 bg-[#004277] text-white text-xs font-bold rounded-lg hover:brightness-105 cursor-pointer disabled:opacity-50 transition-all active:scale-98"
                      >
                        {loading ? <Loader2 size={12} className="animate-spin" /> : <Plus size={12} />}
                        {isEditingProduct ? 'Update Product' : 'Add Product'}
                      </button>
                    </div>
                  </div>
                </div>

                {/* Product List Table */}
                <div className="bg-white rounded-lg border border-slate-200 shadow-sm overflow-hidden">
                  <div className="flex items-center gap-2 px-4 py-3 border-b border-slate-100 bg-slate-50/50">
                    <Package size={13} className="text-[#004277]" />
                    <h3 className="text-[10px] font-black text-slate-700 uppercase tracking-widest flex-1">Product List</h3>
                    <span className="text-[9px] text-slate-400 font-bold">{filteredProducts.length} of {products.length}</span>
                  </div>

                  <div className="overflow-x-auto">
                    <table className="w-full min-w-[520px]">
                      <thead>
                        <tr className="border-b border-slate-100 bg-slate-50/50">
                          <th className="w-8 px-3 py-2.5" />
                          <th className="px-4 py-2.5 text-left text-[9px] font-black text-slate-400 uppercase tracking-widest">Product</th>
                          <th className="px-4 py-2.5 text-left text-[9px] font-black text-slate-400 uppercase tracking-widest">Category</th>
                          <th className="px-4 py-2.5 text-left text-[9px] font-black text-slate-400 uppercase tracking-widest">Price</th>
                          <th className="px-4 py-2.5 text-right text-[9px] font-black text-slate-400 uppercase tracking-widest">Actions</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-slate-100">
                        {fetchingProducts ? (
                          <tr><td colSpan={5} className="py-12 text-center">
                            <Loader2 size={20} className="animate-spin text-[#004277] mx-auto" />
                          </td></tr>
                        ) : currentItems.length === 0 ? (
                          <tr><td colSpan={5} className="py-10 text-center">
                            <ShoppingBag size={24} className="mx-auto text-slate-200 mb-2" />
                            <p className="text-xs font-semibold text-slate-400">{searchQuery ? 'No matching products' : 'No products yet'}</p>
                          </td></tr>
                        ) : currentItems.map(product => {
                          const hasMultiple = product.variants?.length > 1;
                          const fv = product.variants?.[0] || {};
                          return (
                            <React.Fragment key={product._id}>
                              <tr className={`hover:bg-slate-50/60 transition-colors ${expandedRows.has(product._id) ? 'bg-slate-50/30' : ''}`}>
                                <td className="px-3 py-2.5 text-center">
                                  {hasMultiple && (
                                    <button onClick={() => toggleRow(product._id)} className="p-1 rounded hover:bg-slate-100 cursor-pointer transition-colors">
                                      {expandedRows.has(product._id)
                                        ? <ChevronDown size={13} className="text-[#004277]" />
                                        : <ChevronRight size={13} className="text-slate-300" />}
                                    </button>
                                  )}
                                </td>
                                <td className="px-4 py-2.5">
                                  <div className="flex items-center gap-2">
                                    <div className="w-7 h-7 bg-slate-50 rounded-md flex items-center justify-center text-slate-300 shrink-0">
                                      <Package size={13} />
                                    </div>
                                    <span className="text-xs font-semibold text-slate-800">{product.name}</span>
                                  </div>
                                </td>
                                <td className="px-4 py-2.5">
                                  <span className="inline-flex px-2 py-0.5 bg-slate-50 text-slate-500 text-[9px] font-black uppercase tracking-widest rounded border border-slate-100">
                                    {product.category}
                                  </span>
                                </td>
                                <td className="px-4 py-2.5">
                                  {hasMultiple ? (
                                    <span className="text-[10px] text-[#004277] font-bold">
                                      {product.variants.length} variants · from ₹{Math.min(...product.variants.map(v => v.price))}
                                    </span>
                                  ) : (
                                    <div className="flex items-center gap-2">
                                      <span className="text-xs font-bold text-[#004277]">₹{fv.price}</span>
                                      <span className="text-[9px] text-slate-400 font-semibold">{fv.quantity}</span>
                                      <div className={`w-1.5 h-1.5 rounded-full ${fv.stock_status === 'In Stock' ? 'bg-emerald-500' : 'bg-rose-400'}`} />
                                    </div>
                                  )}
                                </td>
                                <td className="px-4 py-2.5">
                                  <div className="flex items-center justify-end gap-1">
                                    <button
                                      onClick={() => { setProductForm(product); setIsEditingProduct(true); window.scrollTo({ top: 0, behavior: 'smooth' }); }}
                                      className="w-7 h-7 flex items-center justify-center text-slate-400 hover:text-[#004277] hover:bg-slate-100 rounded cursor-pointer transition-all"
                                    >
                                      <Edit3 size={13} />
                                    </button>
                                    <button
                                      onClick={() => handleDeleteProduct(product._id)}
                                      className="w-7 h-7 flex items-center justify-center text-slate-400 hover:text-rose-500 hover:bg-rose-50 rounded cursor-pointer transition-all"
                                    >
                                      <Trash2 size={13} />
                                    </button>
                                  </div>
                                </td>
                              </tr>
                              {hasMultiple && expandedRows.has(product._id) && (
                                <tr>
                                  <td colSpan={5} className="bg-slate-50/50 px-12 py-3 border-b border-slate-100">
                                    <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-2">
                                      {product.variants.map((v, i) => (
                                        <div key={i} className="bg-white rounded-lg border border-slate-200 px-3 py-2 flex items-center justify-between gap-2">
                                          <div>
                                            <p className="text-[9px] font-black text-slate-600 uppercase">{v.quantity}</p>
                                            <p className="text-xs font-bold text-[#004277] mt-0.5">₹{v.price}</p>
                                          </div>
                                          <div className={`w-1.5 h-1.5 rounded-full shrink-0 ${v.stock_status === 'In Stock' ? 'bg-emerald-500' : 'bg-rose-400'}`} />
                                        </div>
                                      ))}
                                    </div>
                                  </td>
                                </tr>
                              )}
                            </React.Fragment>
                          );
                        })}
                      </tbody>
                    </table>
                  </div>

                  {/* Pagination */}
                  {!fetchingProducts && filteredProducts.length > itemsPerPage && (
                    <div className="px-4 py-2.5 border-t border-slate-100 bg-slate-50/30 flex items-center justify-between">
                      <span className="text-[10px] text-slate-400 font-semibold">
                        {(currentPage - 1) * itemsPerPage + 1}–{Math.min(currentPage * itemsPerPage, filteredProducts.length)} of {filteredProducts.length}
                      </span>
                      <div className="flex items-center gap-1.5">
                        <select value={itemsPerPage} onChange={e => { setItemsPerPage(Number(e.target.value)); setCurrentPage(1); }}
                          className="h-7 px-2 bg-white border border-slate-200 rounded text-[10px] font-bold outline-none cursor-pointer">
                          {[10, 20, 50].map(n => <option key={n} value={n}>{n} / page</option>)}
                        </select>
                        <button disabled={currentPage === 1} onClick={() => setCurrentPage(p => p - 1)}
                          className="w-7 h-7 flex items-center justify-center bg-white border border-slate-200 rounded text-slate-400 hover:text-[#004277] disabled:opacity-30 cursor-pointer transition-all">
                          <ChevronRight size={13} className="rotate-180" />
                        </button>
                        <span className="text-[10px] font-bold text-slate-600">{currentPage} / {totalPages || 1}</span>
                        <button disabled={currentPage === totalPages || totalPages === 0} onClick={() => setCurrentPage(p => p + 1)}
                          className="w-7 h-7 flex items-center justify-center bg-white border border-slate-200 rounded text-slate-400 hover:text-[#004277] disabled:opacity-30 cursor-pointer transition-all">
                          <ChevronRight size={13} />
                        </button>
                      </div>
                    </div>
                  )}
                </div>
              </div>
            )}
          </div>
        </div>
      </main>

      {/* ── Sticky Save Bar (Profile only) ── */}
      {activeTab === 'Profile' && (
        <div className={`shrink-0 border-t border-slate-200 bg-white px-4 py-2.5 flex items-center justify-between transition-all ${isDirty ? 'shadow-lg' : ''}`}>
          <div className="flex items-center gap-2">
            {isDirty
              ? <><div className="w-1.5 h-1.5 bg-amber-400 rounded-full animate-pulse" /><span className="text-[10px] font-bold text-slate-500">Unsaved changes</span></>
              : saveFeedback === 'success'
              ? <><div className="w-1.5 h-1.5 bg-emerald-500 rounded-full" /><span className="text-[10px] font-bold text-emerald-600">Saved successfully</span></>
              : <span className="text-[10px] font-semibold text-slate-400">All changes saved</span>
            }
          </div>
          <div className="flex items-center gap-2">
            {isDirty && (
              <button
                onClick={() => { if (businessData) { setFormData({ business_name: businessData.business_name || '', email: businessData.email || '', business_category: businessData.business_category || 'Other', business_description: businessData.business_description || '', address: businessData.address || '', city: businessData.city || '', state: businessData.state || '', country: businessData.country || '', logo_url: businessData.logo_url || '' }); setIsDirty(false); } }}
                className="h-8 px-3 bg-white border border-slate-200 text-slate-500 text-xs font-bold rounded-lg hover:bg-slate-50 cursor-pointer transition-all"
              >
                Discard
              </button>
            )}
            <button
              onClick={handleUpdateProfile}
              disabled={loading || !isDirty}
              className="flex items-center gap-2 h-8 px-4 bg-[#004277] hover:brightness-105 text-white text-xs font-bold rounded-lg transition-all cursor-pointer disabled:opacity-40 disabled:cursor-not-allowed active:scale-98"
            >
              {loading
                ? <Loader2 size={12} className="animate-spin" />
                : saveFeedback === 'success'
                ? <Check size={12} />
                : <Save size={12} />
              }
              {loading ? 'Saving...' : 'Save Changes'}
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
