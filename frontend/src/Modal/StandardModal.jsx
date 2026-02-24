import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { X, ClipboardList, BookOpen, PlusCircle} from 'lucide-react';
import api from "../utils/api";

const StandardModal = ({ onClose, editingId, refreshData }) => {
  const [formData, setFormData] = useState({
    
    requisition_no: '', requisition_date: '', pr_no: '', po_no: '', amount: '', date_received: '',
   
    standardNumber: '', title: '', author: '', department: 'Mechanical', 
    category: 'ISO', edition: '', status: 'Active', publisher: '', 
    publication_date: '', pages: '', isbn_issn: '', doi_url: '',
    
    amendment_date: '', amendment_remarks: '', summary: '', remarks: '', keywords: ''
  });

  const [icnDisplay, setIcnDisplay] = useState('----');

  useEffect(() => {
    if (editingId) {
      const fetchSingle = async () => {
        try {
          const res = await api.get(`/standards/${editingId}`);
          const item = res.data.data;
          // Pre-fill all fields (formatting dates for HTML input)
          const formattedItem = { ...item };
          ['requisition_date', 'date_received', 'publication_date', 'amendment_date'].forEach(dateField => {
            if (item[dateField]) formattedItem[dateField] = item[dateField].split('T')[0];
          });
          setFormData(formattedItem);
          setIcnDisplay(item.icnNumber);
        } catch (error) {
          console.error("Error fetching standard", error);
        }
      };
      fetchSingle();
    }
  }, [editingId]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      if (editingId) {
        await api.put(`/standards/${editingId}`, formData);
      } else {
        await api.post(`/standards`, formData);
      }
      refreshData();
      onClose();
    } catch (error) {
      alert(error.response?.data?.message || "Error saving data.");
    }
  };

  const inputClass = "w-full border border-slate-300 rounded-lg px-3 py-2 text-sm focus:ring-1 focus:ring-amber-500 outline-none transition-all";
  const labelClass = "block text-[11px] font-bold text-slate-500 uppercase tracking-wider mb-1";

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/40 backdrop-blur-sm p-4">
      <div className="bg-white rounded-2xl shadow-2xl w-full max-w-4xl max-h-[90vh] overflow-hidden flex flex-col border border-slate-200">
        
        {/* Header */}
        <div className="flex justify-between items-center px-8 py-5 border-b bg-slate-50">
          <div>
            <h2 className="text-xl font-bold text-slate-800">{editingId ? 'Update' : 'Create'} Standard Specification</h2>
            <p className="text-xs text-slate-500">ICN Reference: <span className="font-mono text-amber-600 font-bold">{icnDisplay}</span></p>
          </div>
          <button onClick={onClose} className="text-slate-400 hover:text-slate-600"><X size={24} /></button>
        </div>

        {/* Scrollable Content */}
        <form onSubmit={handleSubmit} className="overflow-y-auto p-8 space-y-8">
          
          {/* Section 1: Procurement */}
          <section>
            <div className="flex items-center gap-2 mb-4 text-amber-600 border-b pb-2">
              <ClipboardList size={18} />
              <h3 className="font-bold text-sm uppercase tracking-widest">Procurement Information</h3>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div><label className={labelClass}>Requisition No</label><input className={inputClass} value={formData.requisition_no} onChange={(e) => setFormData({...formData, requisition_no: e.target.value})} /></div>
              <div><label className={labelClass}>Requisition Date</label><input type="date" className={inputClass} value={formData.requisition_date} onChange={(e) => setFormData({...formData, requisition_date: e.target.value})} /></div>
              <div><label className={labelClass}>PR Number</label><input className={inputClass} value={formData.pr_no} onChange={(e) => setFormData({...formData, pr_no: e.target.value})} /></div>
              <div><label className={labelClass}>PO Number</label><input className={inputClass} value={formData.po_no} onChange={(e) => setFormData({...formData, po_no: e.target.value})} /></div>
              <div><label className={labelClass}>Amount (₹)</label><input type="number" className={inputClass} value={formData.amount} onChange={(e) => setFormData({...formData, amount: e.target.value})} /></div>
              <div><label className={labelClass}>Date Received</label><input type="date" className={inputClass} value={formData.date_received} onChange={(e) => setFormData({...formData, date_received: e.target.value})} /></div>
            </div>
          </section>

          {/* Section 2: Bibliographic */}
          <section>
            <div className="flex items-center gap-2 mb-4 text-emerald-600 border-b pb-2">
              <BookOpen size={18} />
              <h3 className="font-bold text-sm uppercase tracking-widest">Bibliographic Information</h3>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="md:col-span-1"><label className={labelClass}>Standard Number *</label><input required className={inputClass} value={formData.standardNumber} onChange={(e) => setFormData({...formData, standardNumber: e.target.value})} /></div>
              <div className="md:col-span-1"><label className={labelClass}>Status</label><select className={inputClass} value={formData.status} onChange={(e) => setFormData({...formData, status: e.target.value})}><option>Active</option><option>Superseded</option><option>Withdrawn</option></select></div>
              <div className="md:col-span-2"><label className={labelClass}>Title *</label><input required className={inputClass} value={formData.title} onChange={(e) => setFormData({...formData, title: e.target.value})} /></div>
              <div><label className={labelClass}>Author(s)</label><input className={inputClass} value={formData.author} onChange={(e) => setFormData({...formData, author: e.target.value})} /></div>
              <div><label className={labelClass}>Publisher</label><input className={inputClass} value={formData.publisher} onChange={(e) => setFormData({...formData, publisher: e.target.value})} /></div>
              <div className="grid grid-cols-2 gap-2">
                <div><label className={labelClass}>Department</label><select className={inputClass} value={formData.department} onChange={(e) => setFormData({...formData, department: e.target.value})}>{['Mechanical', 'Civil', 'Computer', 'Electrical', 'Automotive'].map(d => <option key={d}>{d}</option>)}</select></div>
                <div><label className={labelClass}>Category</label><select className={inputClass} value={formData.category} onChange={(e) => setFormData({...formData, category: e.target.value})}>{['ASTM', 'BIS', 'DIN', 'ISO', 'SAE'].map(c => <option key={c}>{c}</option>)}</select></div>
              </div>
              <div className="grid grid-cols-2 gap-2">
                 <div><label className={labelClass}>Edition</label><input className={inputClass} value={formData.edition} onChange={(e) => setFormData({...formData, edition: e.target.value})} /></div>
                 <div><label className={labelClass}>Pages</label><input className={inputClass} value={formData.pages} onChange={(e) => setFormData({...formData, pages: e.target.value})} /></div>
              </div>
            </div>
          </section>

          {/* Section 3: Additional */}
          <section>
            <div className="flex items-center gap-2 mb-4 text-orange-600 border-b pb-2">
              <PlusCircle size={18} />
              <h3 className="font-bold text-sm uppercase tracking-widest">Additional & Amendment Info</h3>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div><label className={labelClass}>Amendment Date</label><input type="date" className={inputClass} value={formData.amendment_date} onChange={(e) => setFormData({...formData, amendment_date: e.target.value})} /></div>
              <div><label className={labelClass}>Keywords</label><input className={inputClass} placeholder="e.g. Steel, ISO, Quality" value={formData.keywords} onChange={(e) => setFormData({...formData, keywords: e.target.value})} /></div>
              <div className="md:col-span-2"><label className={labelClass}>Summary / Remarks</label><textarea className={`${inputClass} h-20`} value={formData.summary} onChange={(e) => setFormData({...formData, summary: e.target.value})} /></div>
            </div>
          </section>

        </form>

        {/* Footer */}
        <div className="p-6 border-t bg-slate-50 flex justify-end gap-3">
          <button type="button" onClick={onClose} className="px-6 py-2 text-sm font-bold text-slate-500 hover:bg-slate-200 rounded-lg transition-all">Discard</button>
          <button onClick={handleSubmit} className="px-10 py-2 text-sm font-bold text-white bg-amber-600 hover:bg-amber-700 rounded-lg shadow-lg shadow-amber-100 transition-all">
            {editingId ? 'Save Changes' : 'Create Record'}
          </button>
        </div>
      </div>
    </div>
  );
};

export default StandardModal;