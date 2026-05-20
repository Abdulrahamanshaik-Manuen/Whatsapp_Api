import React, { useState, useEffect, useRef } from 'react';
import {
  User, Shield, Save, Trash2, ShieldCheck, Plus,
  Landmark, Package, ShoppingBag, PlusCircle, Edit3, Loader2, Search,
  Upload, Download, ChevronRight, ChevronDown
} from 'lucide-react';
import * as XLSX from 'xlsx';

const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || 'http://localhost:5000/api';

export default function SettingsPage({ userData, businessData, onUpdate }) {
  const [activeTab, setActiveTab] = useState('Profile');
  const [loading, setLoading] = useState(false);
  const [products, setProducts] = useState([]);
  const [fetchingProducts, setFetchingProducts] = useState(false);
  const [isEditingProduct, setIsEditingProduct] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [currentPage, setCurrentPage] = useState(1);
  const [itemsPerPage, setItemsPerPage] = useState(20);
  const [expandedRows, setExpandedRows] = useState(new Set());
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
    { id: 'Bank', icon: Landmark, label: 'Bank Details' },
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
    bank_name: businessData?.bank_name || '',
    account_number: businessData?.account_number || '',
    ifsc_code: businessData?.ifsc_code || '',
    account_holder_name: businessData?.account_holder_name || '',
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
        bank_name: businessData.bank_name || '',
        account_number: businessData.account_number || '',
        ifsc_code: businessData.ifsc_code || '',
        account_holder_name: businessData.account_holder_name || '',
        logo_url: businessData.logo_url || ''
      });
    }
  }, [businessData]);

  useEffect(() => {
    if (activeTab === 'Catalogue') {
      fetchProducts();
    }
  }, [activeTab]);

  const fetchProducts = async () => {
    setFetchingProducts(true);
    try {
      const token = localStorage.getItem('token');
      const res = await fetch(`${API_BASE_URL}/products`, {
        headers: { 'Authorization': `Bearer ${token}` }
      });
      const data = await res.json();
      if (res.ok) setProducts(data);
    } catch (err) {
      console.error(err);
    } finally {
      setFetchingProducts(false);
    }
  };

  const handleLogoUpload = (e) => {
    const file = e.target.files[0];
    if (!file) return;
    if (file.size > 2 * 1024 * 1024) {
      alert('File size must be less than 2MB.');
      return;
    }
    const reader = new FileReader();
    reader.onloadend = () => {
      setFormData(prev => ({ ...prev, logo_url: reader.result }));
    };
    reader.readAsDataURL(file);
  };

  const handleUpdateProfile = async () => {
    setLoading(true);
    try {
      const token = localStorage.getItem('token');
      const res = await fetch(`${API_BASE_URL}/business/profile`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify(formData)
      });
      if (res.ok) {
        alert('Settings updated successfully!');
        onUpdate();
      } else {
        const err = await res.json();
        alert(`Error: ${err.error}`);
      }
    } catch (err) {
      console.error(err);
      alert('Failed to update settings.');
    } finally {
      setLoading(false);
    }
  };

  const handleSaveProduct = async () => {
    setLoading(true);
    try {
      const token = localStorage.getItem('token');
      const method = isEditingProduct ? 'PUT' : 'POST';
      const url = isEditingProduct ? `${API_BASE_URL}/products/${productForm._id}` : `${API_BASE_URL}/products`;

      const res = await fetch(url, {
        method,
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify(productForm)
      });

      if (res.ok) {
        alert(isEditingProduct ? 'Product updated!' : 'Product added!');
        setProductForm({ name: '', category: '', variants: [{ quantity: '', price: '', stock_status: 'In Stock' }] });
        setIsEditingProduct(false);
        fetchProducts();
      }
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const handleAddVariant = () => {
    setProductForm({
      ...productForm,
      variants: [...productForm.variants, { quantity: '', price: '', stock_status: 'In Stock' }]
    });
  };

  const handleRemoveVariant = (index) => {
    const newVariants = productForm.variants.filter((_, i) => i !== index);
    setProductForm({ ...productForm, variants: newVariants });
  };

  const handleVariantChange = (index, field, value) => {
    const newVariants = [...productForm.variants];
    newVariants[index][field] = value;
    setProductForm({ ...productForm, variants: newVariants });
  };

  const handleDeleteProduct = async (id) => {
    if (!window.confirm('Delete this product?')) return;
    try {
      const token = localStorage.getItem('token');
      await fetch(`${API_BASE_URL}/products/${id}`, {
        method: 'DELETE',
        headers: { 'Authorization': `Bearer ${token}` }
      });
      fetchProducts();
    } catch (err) {
      console.error(err);
    }
  };

  const handleImportClick = () => {
    fileInputRef.current?.click();
  };

  const handleFileChange = async (e) => {
    const file = e.target.files[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = async (evt) => {
      try {
        const bstr = evt.target.result;
        const wb = XLSX.read(bstr, { type: 'binary' });
        const wsname = wb.SheetNames[0];
        const ws = wb.Sheets[wsname];
        const data = XLSX.utils.sheet_to_json(ws);

        const grouped = {};
        data.forEach(row => {
          const key = `${row['Item Name']}_${row['Category']}`;
          if (!grouped[key]) {
            grouped[key] = {
              name: row['Item Name'],
              category: row['Category'],
              variants: []
            };
          }
          grouped[key].variants.push({
            quantity: row['Quantity']?.toString() || '1 unit',
            price: parseFloat(row['Price']) || 0,
            stock_status: row['Stock Status'] || 'In Stock'
          });
        });

        const productsToImport = Object.values(grouped);

        setLoading(true);
        const token = localStorage.getItem('token');
        const res = await fetch(`${API_BASE_URL}/products/bulk`, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${token}`
          },
          body: JSON.stringify(productsToImport)
        });

        if (res.ok) {
          alert(`Successfully imported ${productsToImport.length} items!`);
          fetchProducts();
        }
      } catch (err) {
        console.error(err);
        alert('Error parsing file.');
      } finally {
        setLoading(false);
        e.target.value = null;
      }
    };
    reader.readAsBinaryString(file);
  };

  const downloadSampleTemplate = () => {
    const ws_data = [
      ["Item Name", "Category", "Quantity", "Price", "Stock Status"],
      ["Ghee Puja Diya", "Daily Essentials", "1kg", "200", "In Stock"],
      ["Ghee Puja Diya", "Daily Essentials", "500gms", "110", "In Stock"],
      ["Moong Dal", "Groceries", "1kg", "120", "In Stock"]
    ];
    const ws = XLSX.utils.aoa_to_sheet(ws_data);
    const wb = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(wb, ws, "Inventory");
    XLSX.writeFile(wb, "Inventory_Template.xlsx");
  };

  const toggleRow = (id) => {
    const newExpanded = new Set(expandedRows);
    if (newExpanded.has(id)) newExpanded.delete(id);
    else newExpanded.add(id);
    setExpandedRows(newExpanded);
  };

  // Pagination Logic
  const filteredProducts = products.filter(p =>
    p.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
    p.category.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const totalPages = Math.ceil(filteredProducts.length / itemsPerPage);
  const indexOfLastItem = currentPage * itemsPerPage;
  const indexOfFirstItem = indexOfLastItem - itemsPerPage;
  const currentItems = filteredProducts.slice(indexOfFirstItem, indexOfLastItem);

  return (
    <div className="flex-1 flex flex-col h-full bg-[#F9FAFB] overflow-hidden">

      {/* Header Section */}
      <div className="px-8 pt-8 pb-2 shrink-0">
        <div className="max-w-7xl mx-auto flex flex-col md:flex-row md:items-center justify-between gap-6">
          <div className="space-y-2">
            <h1 className="text-3xl font-black text-primary tracking-tight">Settings</h1>
            <p className="text-[11px] text-slate-500 font-bold uppercase tracking-wider">Configure your account protocols and financial nodes</p>
          </div>

          <div className="flex items-center gap-3">
            {activeTab === 'Catalogue' && (
              <button
                onClick={downloadSampleTemplate}
                className="px-4 py-3 bg-white border border-slate-200 text-slate-600 text-[10px] font-black uppercase tracking-widest rounded-xl hover:bg-slate-50 transition-all flex items-center gap-2 shadow-sm"
              >
                <Download size={16} />
                Template
              </button>
            )}
            <button
              onClick={activeTab === 'Catalogue' ? handleSaveProduct : handleUpdateProfile}
              disabled={loading}
              className="px-8 py-3 bg-[#003B6D] text-white text-[10px] font-black uppercase tracking-widest rounded-xl hover:brightness-110 transition-all shadow-lg shadow-[#003B6D]/20 active:scale-95 flex items-center gap-2"
            >
              <Save size={16} />
              {loading ? 'Processing...' : (activeTab === 'Catalogue' ? 'Sync Inventory' : 'Save Configuration')}
            </button>
          </div>
        </div>
      </div>

      <main className="flex-1 overflow-y-auto custom-scrollbar px-8 py-6">
        <div className="max-w-7xl mx-auto space-y-8">

          <div className="grid grid-cols-1 xl:grid-cols-12 gap-8">

            {/* Sidebar Navigation */}
            <div className="xl:col-span-3">
              <div className="bg-white p-2 rounded-[1.5rem] border border-slate-100 shadow-sm sticky top-0">
                {tabs.map((tab) => (
                  <button
                    key={tab.id}
                    onClick={() => setActiveTab(tab.id)}
                    className={`w-full flex items-center gap-3 px-6 py-4 rounded-xl transition-all duration-300 ${activeTab === tab.id
                      ? 'bg-primary text-white shadow-xl shadow-primary/20'
                      : 'text-slate-400 hover:bg-slate-50 hover:text-slate-600'}`}
                  >
                    <tab.icon size={18} strokeWidth={activeTab === tab.id ? 2.5 : 2} />
                    <span className={`text-[11px] font-black uppercase tracking-widest ${activeTab === tab.id ? 'opacity-100' : 'opacity-70'}`}>{tab.label}</span>
                  </button>
                ))}
              </div>
            </div>

            {/* Content Area */}
            <div className="xl:col-span-9">
              <div className="bg-white rounded-[1.5rem] border border-slate-100 shadow-sm overflow-hidden">

                {activeTab === 'Profile' && (
                  <div className="p-10 space-y-12 animate-in fade-in duration-500">
                    <div className="flex items-center gap-8 pb-10 border-b border-slate-50">
                      <input
                        type="file"
                        ref={logoInputRef}
                        onChange={handleLogoUpload}
                        className="hidden"
                        accept="image/*"
                      />
                      <div
                        onClick={() => logoInputRef.current?.click()}
                        className="w-20 h-20 rounded-2xl bg-slate-50 flex items-center justify-center text-slate-300 border border-slate-100 relative group cursor-pointer hover:border-primary/50 transition-colors shrink-0 overflow-hidden"
                      >
                        {formData.logo_url ? (
                          <img
                            src={formData.logo_url}
                            alt="Business Logo"
                            className="w-full h-full object-cover rounded-2xl"
                          />
                        ) : (
                          <User size={32} />
                        )}
                        <button
                          type="button"
                          className="absolute -bottom-1 -right-1 w-7 h-7 bg-primary rounded-lg text-white shadow-lg flex items-center justify-center border-2 border-white hover:scale-110 transition-transform"
                        >
                          <Plus size={14} strokeWidth={3} />
                        </button>
                      </div>
                      <div>
                        <h3 className="text-xl font-black text-[#003B6D] tracking-tight">{businessData?.business_name || 'Enterprise Account'}</h3>
                        <p className="text-[10px] font-bold text-slate-400 mt-1 uppercase tracking-widest">Linked: {userData?.phone || 'No Connectivity'}</p>
                      </div>
                    </div>

                    <div className="space-y-8">
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                        <div className="space-y-3">
                          <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">Business Identity</label>
                          <input
                            value={formData.business_name}
                            onChange={e => setFormData({ ...formData, business_name: e.target.value })}
                            placeholder="Enter business name"
                            className="w-full px-6 py-4 bg-slate-50 border border-slate-100 rounded-2xl text-sm font-bold text-slate-700 focus:bg-white focus:ring-4 focus:ring-primary/5 focus:border-primary transition-all outline-none"
                          />
                        </div>
                        <div className="space-y-3">
                          <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">Contact Email</label>
                          <input
                            value={formData.email}
                            onChange={e => setFormData({ ...formData, email: e.target.value })}
                            placeholder="admin@enterprise.com"
                            className="w-full px-6 py-4 bg-slate-50 border border-slate-100 rounded-2xl text-sm font-bold text-slate-700 focus:bg-white focus:ring-4 focus:ring-primary/5 focus:border-primary transition-all outline-none"
                          />
                        </div>
                      </div>

                      <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                        <div className="space-y-3">
                          <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">Business Category</label>
                          <select
                            value={formData.business_category}
                            onChange={e => setFormData({ ...formData, business_category: e.target.value })}
                            className="w-full px-6 py-4 bg-slate-50 border border-slate-100 rounded-2xl text-sm font-bold text-slate-700 focus:bg-white focus:ring-4 focus:ring-primary/5 focus:border-primary transition-all outline-none"
                          >
                            <option value="">Select Category</option>
                            {['Retail', 'E-commerce', 'Healthcare', 'Education', 'Finance', 'Real Estate', 'Technology', 'Logistics', 'Other'].map(c => (
                              <option key={c} value={c}>{c}</option>
                            ))}
                          </select>
                        </div>
                        <div className="space-y-3">
                          <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">Business Description</label>
                          <input
                            value={formData.business_description}
                            onChange={e => setFormData({ ...formData, business_description: e.target.value })}
                            placeholder="Brief description of your services"
                            className="w-full px-6 py-4 bg-slate-50 border border-slate-100 rounded-2xl text-sm font-bold text-slate-700 focus:bg-white focus:ring-4 focus:ring-primary/5 focus:border-primary transition-all outline-none"
                          />
                        </div>
                      </div>

                      <div className="space-y-3">
                        <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">Business Address</label>
                        <input
                          value={formData.address}
                          onChange={e => setFormData({ ...formData, address: e.target.value })}
                          placeholder="Street Address, Suite, Unit"
                          className="w-full px-6 py-4 bg-slate-50 border border-slate-100 rounded-2xl text-sm font-bold text-slate-700 focus:bg-white focus:ring-4 focus:ring-primary/5 focus:border-primary transition-all outline-none"
                        />
                      </div>

                      <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
                        <div className="space-y-3">
                          <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">City</label>
                          <input
                            value={formData.city}
                            onChange={e => setFormData({ ...formData, city: e.target.value })}
                            placeholder="City"
                            className="w-full px-6 py-4 bg-slate-50 border border-slate-100 rounded-2xl text-sm font-bold text-slate-700 focus:bg-white focus:ring-4 focus:ring-primary/5 focus:border-primary transition-all outline-none"
                          />
                        </div>
                        <div className="space-y-3">
                          <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">State / Province</label>
                          <input
                            value={formData.state}
                            onChange={e => setFormData({ ...formData, state: e.target.value })}
                            placeholder="State"
                            className="w-full px-6 py-4 bg-slate-50 border border-slate-100 rounded-2xl text-sm font-bold text-slate-700 focus:bg-white focus:ring-4 focus:ring-primary/5 focus:border-primary transition-all outline-none"
                          />
                        </div>
                        <div className="space-y-3">
                          <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">Country</label>
                          <input
                            value={formData.country}
                            onChange={e => setFormData({ ...formData, country: e.target.value })}
                            placeholder="Country"
                            className="w-full px-6 py-4 bg-slate-50 border border-slate-100 rounded-2xl text-sm font-bold text-slate-700 focus:bg-white focus:ring-4 focus:ring-primary/5 focus:border-primary transition-all outline-none"
                          />
                        </div>
                      </div>
                    </div>
                  </div>
                )}

                {activeTab === 'Bank' && (
                  <div className="p-10 space-y-10 animate-in fade-in duration-500">
                    <div className="flex items-center gap-6">
                      <div className="w-16 h-16 bg-emerald-50 text-emerald-600 rounded-2xl flex items-center justify-center border border-emerald-100 shadow-sm shadow-emerald-100/50">
                        <Landmark size={28} />
                      </div>
                      <div>
                        <h3 className="text-xl font-black text-[#003B6D] tracking-tight">Bank Details</h3>
                        <p className="text-[10px] text-slate-400 font-bold uppercase tracking-widest mt-1">Configure your business bank account details</p>
                      </div>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-10">
                      <div className="space-y-3">
                        <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">Bank Name</label>
                        <input
                          value={formData.bank_name}
                          onChange={e => setFormData({ ...formData, bank_name: e.target.value })}
                          placeholder="e.g. HDFC International"
                          className="w-full px-6 py-4 bg-slate-50 border border-slate-100 rounded-2xl text-sm font-bold text-slate-700 focus:bg-white focus:ring-4 focus:ring-emerald-500/5 focus:border-emerald-500 transition-all outline-none"
                        />
                      </div>
                      <div className="space-y-3">
                        <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">Account Holder Name</label>
                        <input
                          value={formData.account_holder_name}
                          onChange={e => setFormData({ ...formData, account_holder_name: e.target.value })}
                          placeholder="Name on records"
                          className="w-full px-6 py-4 bg-slate-50 border border-slate-100 rounded-2xl text-sm font-bold text-slate-700 focus:bg-white focus:ring-4 focus:ring-emerald-500/5 focus:border-emerald-500 transition-all outline-none"
                        />
                      </div>
                      <div className="space-y-3">
                        <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">Account Number</label>
                        <input
                          value={formData.account_number}
                          onChange={e => setFormData({ ...formData, account_number: e.target.value })}
                          placeholder="0000 0000 0000"
                          className="w-full px-6 py-4 bg-slate-50 border border-slate-100 rounded-2xl text-sm font-bold text-slate-700 focus:bg-white focus:ring-4 focus:ring-emerald-500/5 focus:border-emerald-500 transition-all outline-none"
                        />
                      </div>
                      <div className="space-y-3">
                        <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">IFSC Code</label>
                        <input
                          value={formData.ifsc_code}
                          onChange={e => setFormData({ ...formData, ifsc_code: e.target.value })}
                          placeholder="IFSC / SWIFT"
                          className="w-full px-6 py-4 bg-slate-50 border border-slate-100 rounded-2xl text-sm font-bold text-slate-700 focus:bg-white focus:ring-4 focus:ring-emerald-500/5 focus:border-emerald-500 transition-all outline-none"
                        />
                      </div>
                    </div>

                    <div className="p-8 bg-slate-50 rounded-2xl border border-slate-100 flex items-start gap-4">
                      <ShieldCheck size={20} className="text-emerald-500 shrink-0" />
                      <p className="text-[11px] text-slate-500 font-medium leading-relaxed">Bank details are encrypted. Ensure all information matches your legal bank documents to avoid payout delays.</p>
                    </div>
                  </div>
                )}

                {activeTab === 'Security' && (
                  <div className="p-10 space-y-10 animate-in fade-in duration-500">
                    <div className="space-y-1">
                      <h3 className="text-xl font-black text-[#003B6D] tracking-tight">Change Password</h3>
                      <p className="text-[10px] text-slate-400 font-bold uppercase tracking-widest mt-1">Update your security credentials</p>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-10">
                      <div className="space-y-3">
                        <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">Current Password</label>
                        <input type="password" placeholder="••••••••" className="w-full px-6 py-4 bg-slate-50 border border-slate-100 rounded-2xl text-sm font-bold focus:bg-white transition-all outline-none" />
                      </div>
                      <div className="space-y-3">
                        <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">New Password</label>
                        <input type="password" placeholder="••••••••" className="w-full px-6 py-4 bg-slate-50 border border-slate-100 rounded-2xl text-sm font-bold focus:bg-white transition-all outline-none" />
                      </div>
                    </div>

                    {/* Account Purge Decommissioned for clients */}
                  </div>
                )}

                {activeTab === 'Catalogue' && (
                  <div className="p-8 space-y-8 animate-in fade-in duration-500">

                    {/* Top Bar */}
                    <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-6">
                      <div className="space-y-1">
                        <h3 className="text-xl font-black text-[#003B6D] tracking-tight">Enterprise Inventory</h3>
                        <p className="text-[10px] text-slate-400 font-bold uppercase tracking-widest mt-1">High-performance management of {products.length} assets</p>
                      </div>
                      <div className="flex flex-wrap items-center gap-3">
                        <div className="relative flex-1 min-w-[240px]">
                          <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-300" size={16} />
                          <input
                            type="text"
                            placeholder="Search catalogue..."
                            value={searchQuery}
                            onChange={(e) => { setSearchQuery(e.target.value); setCurrentPage(1); }}
                            className="w-full pl-10 pr-4 py-3 bg-slate-50 border border-slate-100 rounded-xl text-[11px] font-bold focus:bg-white transition-all outline-none"
                          />
                        </div>
                        <button
                          onClick={handleImportClick}
                          className="px-6 py-3 bg-emerald-50 text-emerald-600 border border-emerald-100 text-[10px] font-black uppercase tracking-widest rounded-xl hover:bg-emerald-100 transition-all flex items-center gap-2 shadow-sm"
                        >
                          <Upload size={16} />
                          Import
                        </button>
                        <input type="file" ref={fileInputRef} onChange={handleFileChange} accept=".csv, .xlsx, .xls" className="hidden" />
                      </div>
                    </div>

                    {/* Quick Entry Form (Collapsible or Inline) */}
                    <div className="bg-slate-50/50 rounded-[1.5rem] border border-slate-100 p-6 space-y-6">
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        <div className="space-y-2">
                          <label className="text-[9px] font-black text-slate-400 uppercase tracking-widest ml-1">Product Identity</label>
                          <input
                            value={productForm.name}
                            onChange={e => setProductForm({ ...productForm, name: e.target.value })}
                            placeholder="e.g. Papad"
                            className="w-full px-5 py-3.5 bg-white border border-slate-200 rounded-xl text-xs font-bold text-slate-700 outline-none focus:ring-2 focus:ring-primary/10 transition-all"
                          />
                        </div>
                        <div className="space-y-2">
                          <label className="text-[9px] font-black text-slate-400 uppercase tracking-widest ml-1">Market Category</label>
                          <input
                            value={productForm.category}
                            onChange={e => setProductForm({ ...productForm, category: e.target.value })}
                            placeholder="e.g. Daily Essentials"
                            className="w-full px-5 py-3.5 bg-white border border-slate-200 rounded-xl text-xs font-bold text-slate-700 outline-none focus:ring-2 focus:ring-primary/10 transition-all"
                          />
                        </div>
                      </div>

                      <div className="space-y-4">
                        <div className="flex items-center justify-between">
                          <span className="text-[9px] font-black text-slate-400 uppercase tracking-widest ml-1">Pricing Protocols</span>
                          <button onClick={handleAddVariant} className="text-[9px] font-black text-primary uppercase tracking-widest flex items-center gap-1.5 hover:underline">
                            <PlusCircle size={14} /> Add Scale
                          </button>
                        </div>

                        <div className="space-y-3">
                          {productForm.variants.map((v, idx) => (
                            <div key={idx} className="flex flex-col md:flex-row items-center gap-3 bg-white p-3 rounded-xl border border-slate-100 shadow-sm animate-in slide-in-from-top-2">
                              <input
                                value={v.quantity}
                                onChange={e => handleVariantChange(idx, 'quantity', e.target.value)}
                                placeholder="1 Piece / 1kg"
                                className="flex-1 px-4 py-2 bg-slate-50 border-none rounded-lg text-xs font-bold"
                              />
                              <div className="relative w-full md:w-32">
                                <span className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-300 font-bold text-[10px]">₹</span>
                                <input
                                  type="number"
                                  value={v.price}
                                  onChange={e => handleVariantChange(idx, 'price', e.target.value)}
                                  className="w-full pl-6 pr-3 py-2 bg-slate-50 border-none rounded-lg text-xs font-bold"
                                />
                              </div>
                              <select
                                value={v.stock_status}
                                onChange={e => handleVariantChange(idx, 'stock_status', e.target.value)}
                                className="w-full md:w-32 px-3 py-2 bg-slate-50 border-none rounded-lg text-[10px] font-black uppercase tracking-widest"
                              >
                                <option>In Stock</option>
                                <option>Out of Stock</option>
                              </select>
                              {productForm.variants.length > 1 && (
                                <button onClick={() => handleRemoveVariant(idx)} className="p-2 text-rose-400 hover:bg-rose-50 rounded-lg transition-colors">
                                  <Trash2 size={16} />
                                </button>
                              )}
                            </div>
                          ))}
                        </div>
                      </div>
                    </div>

                    {/* Data Grid / Table */}
                    <div className="border border-slate-100 rounded-[1.5rem] overflow-hidden bg-white shadow-sm">
                      <table className="w-full text-left border-collapse">
                        <thead>
                          <tr className="bg-slate-50/50 border-b border-slate-100">
                            <th className="px-6 py-4 text-[10px] font-black text-slate-400 uppercase tracking-widest w-12 text-center"></th>
                            <th className="px-6 py-4 text-[10px] font-black text-slate-400 uppercase tracking-widest">Asset Name</th>
                            <th className="px-6 py-4 text-[10px] font-black text-slate-400 uppercase tracking-widest">Category</th>
                            <th className="px-6 py-4 text-[10px] font-black text-slate-400 uppercase tracking-widest">Pricing</th>
                            <th className="px-6 py-4 text-[10px] font-black text-slate-400 uppercase tracking-widest text-right">Actions</th>
                          </tr>
                        </thead>
                        <tbody className="divide-y divide-slate-50">
                          {fetchingProducts ? (
                            <tr>
                              <td colSpan="5" className="px-6 py-20">
                                <div className="flex flex-col items-center gap-3 opacity-50">
                                  <Loader2 size={24} className="animate-spin text-primary" />
                                  <span className="text-[10px] font-black uppercase tracking-widest">Accessing Node Database...</span>
                                </div>
                              </td>
                            </tr>
                          ) : currentItems.length === 0 ? (
                            <tr>
                              <td colSpan="5" className="px-6 py-20 text-center">
                                <ShoppingBag size={32} className="mx-auto text-slate-200 mb-3" />
                                <p className="text-[11px] font-bold text-slate-400 uppercase tracking-widest">No matching assets found</p>
                              </td>
                            </tr>
                          ) : (
                            currentItems.map((product) => {
                              const hasMultiple = product.variants?.length > 1;
                              const firstVariant = product.variants?.[0] || {};

                              return (
                                <React.Fragment key={product._id}>
                                  <tr className={`hover:bg-slate-50/80 transition-colors group ${expandedRows.has(product._id) ? 'bg-slate-50/30' : ''}`}>
                                    <td className="px-6 py-4 text-center">
                                      {hasMultiple && (
                                        <button
                                          onClick={() => toggleRow(product._id)}
                                          className="p-1.5 hover:bg-white rounded-lg border border-transparent hover:border-slate-100 transition-all"
                                        >
                                          {expandedRows.has(product._id) ? <ChevronDown size={14} className="text-primary" /> : <ChevronRight size={14} className="text-slate-300" />}
                                        </button>
                                      )}
                                    </td>
                                    <td className="px-6 py-4">
                                      <div className="flex items-center gap-3">
                                        <div className="w-8 h-8 bg-slate-50 rounded-lg flex items-center justify-center text-slate-400 group-hover:text-primary transition-colors">
                                          <Package size={16} />
                                        </div>
                                        <span className="text-xs font-black text-[#003B6D] tracking-tight">{product.name}</span>
                                      </div>
                                    </td>
                                    <td className="px-6 py-4">
                                      <span className="px-3 py-1 bg-slate-50 text-slate-500 text-[9px] font-black uppercase tracking-widest rounded-full border border-slate-100">
                                        {product.category}
                                      </span>
                                    </td>
                                    <td className="px-6 py-4">
                                      {hasMultiple ? (
                                        <div className="flex items-center gap-2">
                                          <span className="text-[10px] font-black text-primary uppercase tracking-widest bg-primary/5 px-2 py-1 rounded-md">
                                            {product.variants.length} Options
                                          </span>
                                          <span className="text-[10px] font-bold text-slate-400">Starting ₹{Math.min(...product.variants.map(v => v.price))}</span>
                                        </div>
                                      ) : (
                                        <div className="flex items-center gap-3">
                                          <span className="text-xs font-black text-primary">₹{firstVariant.price}</span>
                                          <span className="text-[9px] font-bold text-slate-400 uppercase tracking-widest">{firstVariant.quantity}</span>
                                          <div className={`w-1.5 h-1.5 rounded-full ${firstVariant.stock_status === 'In Stock' ? 'bg-emerald-500' : 'bg-rose-500'}`} title={firstVariant.stock_status} />
                                        </div>
                                      )}
                                    </td>
                                    <td className="px-6 py-4">
                                      <div className="flex items-center justify-end gap-2">
                                        <button
                                          onClick={() => {
                                            setProductForm(product);
                                            setIsEditingProduct(true);
                                            window.scrollTo({ top: 0, behavior: 'smooth' });
                                          }}
                                          className="p-2 text-slate-300 hover:text-primary hover:bg-white rounded-lg transition-all"
                                        >
                                          <Edit3 size={16} />
                                        </button>
                                        <button
                                          onClick={() => handleDeleteProduct(product._id)}
                                          className="p-2 text-slate-300 hover:text-rose-500 hover:bg-rose-50 rounded-lg transition-all"
                                        >
                                          <Trash2 size={16} />
                                        </button>
                                      </div>
                                    </td>
                                  </tr>
                                  {hasMultiple && expandedRows.has(product._id) && (
                                    <tr>
                                      <td colSpan="5" className="px-6 py-4 bg-slate-50/20 border-b border-slate-50">
                                        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4 animate-in slide-in-from-left-2">
                                          {product.variants?.map((v, i) => (
                                            <div key={i} className="p-4 bg-white rounded-xl border border-slate-100 shadow-sm flex flex-col gap-2">
                                              <div className="flex items-center justify-between">
                                                <span className="text-[10px] font-black text-slate-900 uppercase tracking-tight">{v.quantity}</span>
                                                <div className={`w-1.5 h-1.5 rounded-full ${v.stock_status === 'In Stock' ? 'bg-emerald-500' : 'bg-rose-500'}`} />
                                              </div>
                                              <div className="flex items-baseline gap-1">
                                                <span className="text-[10px] font-bold text-slate-400">Price:</span>
                                                <span className="text-sm font-black text-primary">₹{v.price}</span>
                                              </div>
                                              <span className={`text-[8px] font-black uppercase tracking-widest ${v.stock_status === 'In Stock' ? 'text-emerald-600' : 'text-rose-600'}`}>
                                                {v.stock_status}
                                              </span>
                                            </div>
                                          ))}
                                        </div>
                                      </td>
                                    </tr>
                                  )}
                                </React.Fragment>
                              );
                            })
                          )}
                        </tbody>
                      </table>

                      {/* Pagination Footer */}
                      {!fetchingProducts && filteredProducts.length > 0 && (
                        <div className="px-6 py-4 bg-slate-50/30 border-t border-slate-100 flex items-center justify-between">
                          <div className="flex items-center gap-4">
                            <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest">
                              Showing {indexOfFirstItem + 1} to {Math.min(indexOfLastItem, filteredProducts.length)} of {filteredProducts.length}
                            </span>
                            <div className="h-3 w-px bg-slate-200" />
                            <div className="flex items-center gap-2">
                              <span className="text-[9px] font-black text-slate-400 uppercase tracking-widest">Rows:</span>
                              <select
                                value={itemsPerPage}
                                onChange={(e) => { setItemsPerPage(Number(e.target.value)); setCurrentPage(1); }}
                                className="bg-white border border-slate-200 rounded-lg px-2 py-1 text-[10px] font-black text-primary outline-none focus:ring-2 focus:ring-primary/10 transition-all cursor-pointer"
                              >
                                {[10, 20, 50, 100].map(n => (
                                  <option key={n} value={n}>{n}</option>
                                ))}
                              </select>
                            </div>
                          </div>
                          <div className="flex items-center gap-2">
                            <button
                              disabled={currentPage === 1}
                              onClick={() => setCurrentPage(prev => prev - 1)}
                              className="p-2 bg-white border border-slate-200 rounded-lg text-slate-400 hover:text-primary disabled:opacity-30 disabled:cursor-not-allowed transition-all"
                            >
                              <ChevronRight size={16} className="rotate-180" />
                            </button>
                            <span className="text-[11px] font-black text-[#003B6D] px-2">Page {currentPage} / {totalPages}</span>
                            <button
                              disabled={currentPage === totalPages}
                              onClick={() => setCurrentPage(prev => prev + 1)}
                              className="p-2 bg-white border border-slate-200 rounded-lg text-slate-400 hover:text-primary disabled:opacity-30 disabled:cursor-not-allowed transition-all"
                            >
                              <ChevronRight size={16} />
                            </button>
                          </div>
                        </div>
                      )}
                    </div>
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>
      </main>
    </div>
  );
}
