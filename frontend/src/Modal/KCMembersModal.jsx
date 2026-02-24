import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { X, Plus, Trash2, BookOpen, CreditCard, Globe, Mail, Phone, Calendar, User } from 'lucide-react';

const API_BASE_URL = "http://localhost:5000/api/kcmembers"; 

const KCModal = ({ onClose, editingId, refreshData }) => {
  const [formData, setFormData] = useState({
    membershipId: '',
    institutionName: '',
    contactPerson: '',
    designation: '',
    membershipType: 'Corporate', // Matches Enum
    completeAddress: '',
    email: '',
    phone: '',
    alternatePhone: '',
    website: '',
    membershipStartDate: '',
    membershipEndDate: '',
    subscriptionTypes: {
      automotiveAbstracts: false,
      araiJournal: false,
      kcMembershipOption1: false,
      kcMembershipOption2: false
    },
    fees: '',
    paymentFrequency: '',
    paymentStatus: '',
    lastPaymentDate: '',
    notes: ''
  });

  useEffect(() => {
    if (editingId) {
      const fetchSingle = async () => {
        try {
          const res = await axios.get(`${API_BASE_URL}/${editingId}`);
          const item = res.data.data;
          
          // Formatting dates for HTML input (YYYY-MM-DD)
          const formatDate = (date) => date ? new Date(date).toISOString().split('T')[0] : '';
          
          setFormData({
            ...item,
            membershipStartDate: formatDate(item.membershipStartDate),
            membershipEndDate: formatDate(item.membershipEndDate),
            lastPaymentDate: formatDate(item.lastPaymentDate)
          });
        } catch (error) {
          console.error("Error fetching member:", error);
        }
      };
      fetchSingle();
    }
  }, [editingId]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      if (editingId) {
        await axios.put(`${API_BASE_URL}/${editingId}`, formData);
      } else {
        await axios.post(API_BASE_URL, formData);
      }
      refreshData();
      onClose();
    } catch (error) {
      alert(error.response?.data?.message || "Error saving member record.");
    }
  };

  const inputClass = "w-full border border-slate-300 rounded-lg px-3 py-2 text-sm focus:ring-1 focus:ring-emerald-500 outline-none transition-all bg-white";
  const labelClass = "block text-[11px] font-bold text-slate-500 uppercase tracking-wider mb-1";

  

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/40 backdrop-blur-sm p-4">
      <div className="bg-white rounded-2xl shadow-2xl w-full max-w-5xl max-h-[92vh] overflow-hidden flex flex-col border border-slate-200">
        
        {/* Header */}
        <div className="flex justify-between items-center px-8 py-5 border-b bg-slate-50">
          <div>
            <h2 className="text-xl font-bold text-slate-800">{editingId ? 'Update' : 'New'} KC Membership</h2>
            <p className="text-xs text-green-600 uppercase tracking-widest font-semibold mt-1">Knowledge Centre Management</p>
          </div>
          <button onClick={onClose} className="text-slate-400 hover:text-slate-600 transition-colors"><X size={24} /></button>
        </div>

        {/* Form Content */}
        <form onSubmit={handleSubmit} className="overflow-y-auto p-8 space-y-10">
          
          {/* Section 1: Institution Details */}
          <section>
            <HeaderSection icon={<Globe size={18}/>} title="Institution Details" color="text-green-600" />
            <div className="grid grid-cols-1 md:grid-cols-3 gap-5">

              <div className="md:col-span-1"> 
                <label className={labelClass}>Membership Type</label>
                <select className={inputClass} value={formData.membershipType} onChange={(e) => setFormData({...formData, membershipType: e.target.value})}>
                  <option value="Corporate">Corporate</option>
                  <option value="Educational Institution">Educational Institution</option>
                  <option value="Individual">Individual</option>
                  <option value="Government">Staff</option>
                  <option value="Other">Temp Membership</option>
                  <option value="Student">Student</option>
                  
                </select>
              </div>
               
              <div className="md:col-span-2">
                <label className={labelClass}>Membership ID</label>
                <input required className={inputClass} value={formData.membershipId} onChange={(e) => setFormData({...formData, membershipId: e.target.value})} />
              </div>

              <div className="md:col-span-1">
                <label className={labelClass}>Name</label>
                <input required className={inputClass} value={formData.institutionName} onChange={(e) => setFormData({...formData, institutionName: e.target.value})} />
              </div>
              
              <div className="md:col-span-2">
                <label className={labelClass}>Complete Address</label>
                <input className={inputClass} value={formData.completeAddress} onChange={(e) => setFormData({...formData, completeAddress: e.target.value})} />
              </div>
            </div>
          </section>

          {/* Section 2: Contact Person */}
          <section>
            <HeaderSection icon={<User size={18}/>} title="Primary Contact" color="text-blue-600" />
            <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
              <div><label className={labelClass}>Contact Person *</label><input required className={inputClass} value={formData.contactPerson} onChange={(e) => setFormData({...formData, contactPerson: e.target.value})} /></div>
              <div><label className={labelClass}>Designation</label><input className={inputClass} value={formData.designation} onChange={(e) => setFormData({...formData, designation: e.target.value})} /></div>
              <div><label className={labelClass}>Email Address</label><input type="email" className={inputClass} value={formData.email} onChange={(e) => setFormData({...formData, email: e.target.value})} /></div>
              <div><label className={labelClass}>Phone</label><input className={inputClass} value={formData.phone} onChange={(e) => setFormData({...formData, phone: e.target.value})} /></div>
              <div><label className={labelClass}>Alternate Phone</label><input className={inputClass} value={formData.alternatePhone} onChange={(e) => setFormData({...formData, alternatePhone: e.target.value})} /></div>
              <div><label className={labelClass}>Website</label><input className={inputClass} value={formData.website} onChange={(e) => setFormData({...formData, website: e.target.value})} /></div>
            </div>
          </section>

          {/* Section 3: Subscriptions & Dates */}
          <section className="grid grid-cols-1 md:grid-cols-2 gap-10">
            <div>
              <HeaderSection icon={<Calendar size={18}/>} title="Membership Period" color="text-indigo-600" />
              <div className="grid grid-cols-2 gap-4">
                <div><label className={labelClass}>Start Date</label><input type="date" className={inputClass} value={formData.membershipStartDate} onChange={(e) => setFormData({...formData, membershipStartDate: e.target.value})} /></div>
                <div><label className={labelClass}>End Date</label><input type="date" className={inputClass} value={formData.membershipEndDate} onChange={(e) => setFormData({...formData, membershipEndDate: e.target.value})} /></div>
              </div>
            </div>
            <div>
              <HeaderSection icon={<BookOpen size={18}/>} title="Subscription Types" color="text-orange-600" />
              <div className="grid grid-cols-2 gap-y-3">
                {Object.keys(formData.subscriptionTypes).map((type) => (
                  <label key={type} className="flex items-center space-x-3 cursor-pointer">
                    <input 
                      type="checkbox" 
                      className="w-4 h-4 text-emerald-600 rounded border-gray-300 focus:ring-emerald-500"
                      checked={formData.subscriptionTypes[type]}
                      onChange={(e) => setFormData({
                        ...formData, 
                        subscriptionTypes: { ...formData.subscriptionTypes, [type]: e.target.checked }
                      })}
                    />
                    <span className="text-sm text-slate-600 capitalize">{type.replace(/([A-Z])/g, ' $1')}</span>
                  </label>
                ))}
              </div>
            </div>
          </section>

          {/* Section 4: Payment Details */}
          <section>
            <HeaderSection icon={<CreditCard size={18}/>} title="Financial Details" color="text-red-600" />
            <div className="grid grid-cols-1 md:grid-cols-4 gap-5">
              <div><label className={labelClass}>Fees Amount</label><input type="number" className={inputClass} value={formData.fees} onChange={(e) => setFormData({...formData, fees: e.target.value})} /></div>
              <div>
                <label className={labelClass}>Frequency</label>
                <select className={inputClass} value={formData.paymentFrequency} onChange={(e) => setFormData({...formData, paymentFrequency: e.target.value})}>
                  <option value="">Select</option>
                  <option value="Daily">Daily</option>
                  <option value="Weekly">Weekly</option>
                  <option value="Monthly">Monthly</option>
                  <option value="Yearly">Yearly</option>
                </select>
              </div>
              <div>
                <label className={labelClass}>Status</label>
                <select className={inputClass} value={formData.paymentStatus} onChange={(e) => setFormData({...formData, paymentStatus: e.target.value})}>
                  <option value="">Select</option>
                  <option value="Paid">Paid</option>
                  <option value="Unpaid">Unpaid</option>
                </select>
              </div>
              <div><label className={labelClass}>Last Payment Date</label><input type="date" className={inputClass} value={formData.lastPaymentDate} onChange={(e) => setFormData({...formData, lastPaymentDate: e.target.value})} /></div>

              <div className="md:col-span-4"><label className={labelClass}>Notes</label><textarea className={`${inputClass} h-20`} value={formData.notes} onChange={(e) => setFormData({...formData, notes: e.target.value})} /></div>
            </div>
          </section>

        </form>

        {/* Footer */}
        <div className="p-6 border-t bg-slate-50 flex justify-end gap-3">
          <button type="button" onClick={onClose} className="px-8 py-2.5 text-sm font-bold text-slate-500 hover:bg-slate-200 rounded-xl transition-all">Discard</button>
          <button onClick={handleSubmit} className="px-12 py-2.5 text-sm font-bold text-white bg-green-600 hover:bg-green-700 rounded-xl shadow-lg shadow-green-100 transition-all">
            {editingId ? 'Update Record' : 'Create Member'}
          </button>
        </div>
      </div>
    </div>
  );
};

const HeaderSection = ({ icon, title, color }) => (
  <div className={`flex items-center gap-2 mb-6 ${color} border-b border-slate-100 pb-2`}>
    {icon}
    <h3 className="font-bold text-xs uppercase tracking-[0.2em]">{title}</h3>
  </div>
);

export default KCModal;