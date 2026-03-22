import React, { useState, useEffect } from "react";
import axios from "axios";
import {
  X,
  Plus,
  Trash2,
  BookOpen,
  CreditCard,
  Globe,
  Mail,
  Phone,
  Calendar,
  User,
} from "lucide-react";

const API_BASE_URL = `${import.meta.env.VITE_API_URL}/api/kcmembers`;

const SUBSCRIPTION_MAP = {
  "Automotive Abstract": ["Subscribers", "Exchange", "GOI"],
  "KC Membership Option 1": ["Individual", "Educational", "Company"],
  "KC Membership Option 2": [
    "Educational",
    "ARAI Member Company",
    "Other Company",
  ],
  "ARAI Journal": ["Standard"],
};

const KCModal = ({ onClose, editingId, refreshData }) => {
  const [formData, setFormData] = useState({
    membershipId: "",
    institutionName: "",
    contactPerson: "",
    designation: "",
    membershipType: "Automotive Abstract", // Matches Enum
    completeAddress: "",
    email: "",
    phone: "",
    alternatePhone: "",
    website: "",
    membershipStartDate: "",
    membershipStatus: "",
    membershipEndDate: "",
    subscriptionType: "",
    fees: "",
    paymentStatus: "",
    lastPaymentDate: "",
    notes: "",
  });

  useEffect(() => {
    if (editingId) {
      const fetchSingle = async () => {
        try {
          const res = await axios.get(`${API_BASE_URL}/${editingId}`);
          const item = res.data.data;

          // Formatting dates for HTML input (YYYY-MM-DD)
          const formatDate = (date) =>
            date ? new Date(date).toISOString().split("T")[0] : "";

          setFormData({
            ...item,
            subscriptionType: item.subscriptionType || "",
            membershipStartDate: formatDate(item.membershipStartDate),
            membershipEndDate: formatDate(item.membershipEndDate),
            lastPaymentDate: formatDate(item.lastPaymentDate),
          });
        } catch (error) {
          console.error("Error fetching member:", error);
        }
      };
      fetchSingle();
    }
  }, [editingId]);

  const fetchIdPreview = async (mType, sType) => {
    if (!mType || !sType) return;
    try {
      const res = await axios.get(`${API_BASE_URL}/preview-id`, {
        params: { membershipType: mType, subscriptionType: sType },
      });
      setFormData((prev) => ({ ...prev, membershipId: res.data.previewId }));
    } catch (err) {
      console.error("Preview failed", err);
      setFormData((prev) => ({ ...prev, membershipId: "Error generating ID" }));
    }
  };

  const handleMembershipTypeChange = (e) => {
    const selectedType = e.target.value;
    setFormData((prev) => ({
      ...prev,
      membershipType: selectedType,
      subscriptionType: "", // Reset second dropdown
      membershipId: "", // Clear ID while user is choosing
    }));
  };

  const handleSubscriptionChange = async (e) => {
    const selectedSub = e.target.value;

    // Update local state first
    setFormData((prev) => ({ ...prev, subscriptionType: selectedSub }));

    // Immediately fetch the ID using the NEW value (selectedSub)
    // instead of waiting for formData state to update
    if (!editingId && selectedSub && formData.membershipType) {
      try {
        const res = await axios.get(`${API_BASE_URL}/preview-id`, {
          params: {
            membershipType: formData.membershipType,
            subscriptionType: selectedSub,
          },
        });

        // Update the visual ID immediately
        setFormData((prev) => ({ ...prev, membershipId: res.data.previewId }));
      } catch (err) {
        console.error("Preview failed", err);
      }
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      // Create a copy to send to the server
      const dataToSubmit = { ...formData };

      // If creating new, let backend handle the ID entirely
      if (!editingId) {
        delete dataToSubmit.membershipId;
      }

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

  const inputClass =
    "w-full border border-slate-300 rounded-lg px-3 py-2 text-sm focus:ring-1 focus:ring-emerald-500 outline-none transition-all bg-white";
  const labelClass =
    "block text-[11px] font-bold text-slate-500 uppercase tracking-wider mb-1";

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/40 backdrop-blur-sm p-4">
      <div className="bg-white rounded-2xl shadow-2xl w-full max-w-5xl max-h-[92vh] overflow-hidden flex flex-col border border-slate-200">
        {/* Header */}
        <div className="flex justify-between items-center px-8 py-5 border-b bg-slate-50">
          <div>
            <h2 className="text-xl font-bold text-slate-800">
              {editingId ? "Update" : "New"} KC Membership
            </h2>
            <p className="text-xs text-green-600 uppercase tracking-widest font-semibold mt-1">
              Knowledge Centre Management
            </p>
          </div>
          <button
            onClick={onClose}
            className="text-slate-400 hover:text-slate-600 transition-colors"
          >
            <X size={24} />
          </button>
        </div>

        {/* Form Content */}
        <form
          onSubmit={handleSubmit}
          className="overflow-y-auto p-8 space-y-10"
        >
          {/* Section 1: Institution Details */}
          <section>
            <HeaderSection
              icon={<Globe size={18} />}
              title="Institution Details"
              color="text-green-600"
            />
            <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
              {/* ROW 1: MEMBERSHIP IDENTITY */}
              <div>
                <label className={labelClass}>Subscription Type</label>
                <select
                  className={inputClass}
                  value={formData.membershipType}
                  onChange={handleMembershipTypeChange}
                >
                  {Object.keys(SUBSCRIPTION_MAP).map((type) => (
                    <option key={type} value={type}>
                      {type}
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className={labelClass}>Membership Type</label>
                <select
                  required
                  className={inputClass}
                  value={formData.subscriptionType}
                  onChange={handleSubscriptionChange}
                >
                  <option value="">Select Membership</option>
                  {SUBSCRIPTION_MAP[formData.membershipType]?.map((sub) => (
                    <option key={sub} value={sub}>
                      {sub}
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className={labelClass}>
                  Membership ID (Auto-Generated)
                </label>
                <div className="relative">
                  <input
                    readOnly
                    className={`${inputClass} font-mono font-bold text-emerald-700 bg-emerald-50 border-emerald-200`}
                    value={formData.membershipId}
                    placeholder="ID will appear here..."
                  />
                  {!editingId &&
                    formData.membershipId &&
                    formData.membershipId !== "Select Subscription..." && (
                      <span className="absolute right-3 top-2 text-[10px] bg-emerald-200 text-emerald-800 px-2 py-0.5 rounded-full uppercase">
                        Next
                      </span>
                    )}
                </div>
              </div>

              {/* ROW 2: INSTITUTION INFO */}
              <div className="md:col-span-2">
                <label className={labelClass}>Name of Institution</label>
                <input
                  required
                  className={inputClass}
                  value={formData.institutionName}
                  onChange={(e) =>
                    setFormData({
                      ...formData,
                      institutionName: e.target.value,
                    })
                  }
                  placeholder="Enter institution name"
                />
              </div>

              <div>
                <label className={labelClass}>Membership Status</label>
                <select
                  className={inputClass}
                  value={formData.membershipStatus || ""}
                  onChange={(e) =>
                    setFormData({
                      ...formData,
                      membershipStatus: e.target.value,
                    })
                  }
                >
                  <option value="">Select Status</option>
                  <option>Active</option>
                  <option>Inactive</option>
                </select>
              </div>

              {/* ROW 3: FULL WIDTH ADDRESS */}
              <div className="md:col-span-3">
                <label className={labelClass}>Complete Address</label>
                <input
                  className={inputClass}
                  value={formData.completeAddress}
                  onChange={(e) =>
                    setFormData({
                      ...formData,
                      completeAddress: e.target.value,
                    })
                  }
                  placeholder="Enter full physical address"
                />
              </div>
            </div>
          </section>

          {/* Section 2: Contact Person */}
          <section>
            <HeaderSection
              icon={<User size={18} />}
              title="Primary Contact"
              color="text-blue-600"
            />
            <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
              <div>
                <label className={labelClass}>Contact Person *</label>
                <input
                  required
                  className={inputClass}
                  value={formData.contactPerson}
                  onChange={(e) =>
                    setFormData({ ...formData, contactPerson: e.target.value })
                  }
                />
              </div>
              <div>
                <label className={labelClass}>Designation</label>
                <input
                  className={inputClass}
                  value={formData.designation}
                  onChange={(e) =>
                    setFormData({ ...formData, designation: e.target.value })
                  }
                />
              </div>
              <div>
                <label className={labelClass}>Email Address</label>
                <input
                  type="email"
                  className={inputClass}
                  value={formData.email}
                  onChange={(e) =>
                    setFormData({ ...formData, email: e.target.value })
                  }
                />
              </div>
              <div>
                <label className={labelClass}>Phone</label>
                <input
                  className={inputClass}
                  value={formData.phone}
                  onChange={(e) =>
                    setFormData({ ...formData, phone: e.target.value })
                  }
                />
              </div>
              <div>
                <label className={labelClass}>Undertaking Email</label>
                <input
                  className={inputClass}
                  value={formData.alternatePhone}
                  onChange={(e) =>
                    setFormData({ ...formData, alternatePhone: e.target.value })
                  }
                />
              </div>
              <div>
                <label className={labelClass}>Website</label>
                <input
                  className={inputClass}
                  value={formData.website}
                  onChange={(e) =>
                    setFormData({ ...formData, website: e.target.value })
                  }
                />
              </div>
            </div>
          </section>

          {/* Section 3: Subscriptions & Dates */}
          <section className="grid grid-cols-1 md:grid-cols-2 gap-10">
            <div>
              <HeaderSection
                icon={<Calendar size={18} />}
                title="Membership Period"
                color="text-indigo-600"
              />
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className={labelClass}>Start Date</label>
                  <input
                    type="date"
                    className={inputClass}
                    value={formData.membershipStartDate}
                    onChange={(e) =>
                      setFormData({
                        ...formData,
                        membershipStartDate: e.target.value,
                      })
                    }
                  />
                </div>
                <div>
                  <label className={labelClass}>End Date</label>
                  <input
                    type="date"
                    className={inputClass}
                    value={formData.membershipEndDate}
                    onChange={(e) =>
                      setFormData({
                        ...formData,
                        membershipEndDate: e.target.value,
                      })
                    }
                  />
                </div>
              </div>
            </div>
          </section>

          {/* Section 4: Payment Details */}
          <section>
            <HeaderSection
              icon={<CreditCard size={18} />}
              title="Financial Details"
              color="text-red-600"
            />
            <div className="grid grid-cols-1 md:grid-cols-4 gap-5">
              <div>
                <label className={labelClass}>Fees Amount</label>
                <input
                  type="number"
                  className={inputClass}
                  value={formData.fees}
                  onChange={(e) =>
                    setFormData({ ...formData, fees: e.target.value })
                  }
                />
              </div>

              <div>
                <label className={labelClass}>Status</label>
                <select
                  className={inputClass}
                  value={formData.paymentStatus}
                  onChange={(e) =>
                    setFormData({ ...formData, paymentStatus: e.target.value })
                  }
                >
                  <option value="">Select</option>
                  <option value="Paid">Paid</option>
                  <option value="Unpaid">Unpaid</option>
                </select>
              </div>
              <div>
                <label className={labelClass}>Last Payment Date</label>
                <input
                  type="date"
                  className={inputClass}
                  value={formData.lastPaymentDate}
                  onChange={(e) =>
                    setFormData({
                      ...formData,
                      lastPaymentDate: e.target.value,
                    })
                  }
                />
              </div>

              <div className="md:col-span-4">
                <label className={labelClass}>Notes</label>
                <textarea
                  className={`${inputClass} h-20`}
                  value={formData.notes}
                  onChange={(e) =>
                    setFormData({ ...formData, notes: e.target.value })
                  }
                />
              </div>
            </div>
          </section>
        </form>

        {/* Footer */}
        <div className="p-6 border-t bg-slate-50 flex justify-end gap-3">
          <button
            type="button"
            onClick={onClose}
            className="px-8 py-2.5 text-sm font-bold text-slate-500 hover:bg-slate-200 rounded-xl transition-all"
          >
            Discard
          </button>
          <button
            onClick={handleSubmit}
            className="px-12 py-2.5 text-sm font-bold text-white bg-green-600 hover:bg-green-700 rounded-xl shadow-lg shadow-green-100 transition-all"
          >
            {editingId ? "Update Record" : "Create Member"}
          </button>
        </div>
      </div>
    </div>
  );
};

const HeaderSection = ({ icon, title, color }) => (
  <div
    className={`flex items-center gap-2 mb-6 ${color} border-b border-slate-100 pb-2`}
  >
    {icon}
    <h3 className="font-bold text-xs uppercase tracking-[0.2em]">{title}</h3>
  </div>
);

export default KCModal;
