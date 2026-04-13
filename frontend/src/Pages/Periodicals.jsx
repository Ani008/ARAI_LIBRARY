import React, { useState, useEffect } from "react";
import { Trash2, Edit2, Plus, Search, File, Download, Upload} from "lucide-react";
import PeriodicalModal from "../Modal/PeriodicalModal";
import { useNavigate } from "react-router-dom";

const PeriodicalManagement = () => {
  const [periodicals, setPeriodicals] = useState([]);
  const [showForm, setShowForm] = useState(false);
  const [editingId, setEditingId] = useState(null);

  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  // Replace the old const limit = 5; with this:
  const [limit, setLimit] = useState(25);

  const [searchTerm, setSearchTerm] = useState("");
  const [frequencyFilter, setFrequencyFilter] = useState("");
  const [languageFilter, setLanguageFilter] = useState("");
  const [statusFilter, setStatusFilter] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");

  const [startYear, setStartYear] = useState("");
  const [endYear, setEndYear] = useState("");
  const [previewCount, setPreviewCount] = useState(null);

  const navigate = useNavigate();

  const [formData, setFormData] = useState({
    title: "",
    subtitle: "",
    authors: [],
    publisher: "",
    issn: "",
    volume: "",
    issue: "",
    series: "",
    notes: "",
    subscriptionDate: "",
    frequency: "",
    receiptDate: "",
    departmentToIssue: "",
    departmentIssueDate: "",
    addOnCopies: "",
    orderNo: "",
    poNo: "",
    vendorDetails: { name: "", phone: "", email: "" },
    mode: "",
    url: "",
    paymentDetails: { currency: "", amount: "" },
    remarksForPayment: "",
    language: "",
    status: "Active",
  });

  //  const API_BASE = "http://localhost:5000/api";
  const API_BASE = `${import.meta.env.VITE_API_URL}/api`;

  const fetchPeriodicals = async (page = 1) => {
    try {
      setLoading(true);
      const token = localStorage.getItem("token");

      const response = await fetch(
        `${API_BASE}/periodicals?page=${page}&limit=${limit}&search=${searchTerm}&frequency=${frequencyFilter}&language=${languageFilter}&status=${statusFilter}&startYear=${startYear}&endYear=${endYear}`,
        {
          headers: { Authorization: `Bearer ${token}` },
        },
      );

      if (response.ok) {
        const data = await response.json();
        setPeriodicals(data.data || []);
        setCurrentPage(data.currentPage);
        setTotalPages(data.totalPages);
      }
    } catch (err) {
      setError("Failed to fetch periodicals");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    // Only fetch the table data here
    fetchPeriodicals(currentPage);
  }, [
    currentPage,
    limit,
    searchTerm,
    frequencyFilter,
    languageFilter,
    statusFilter,
    startYear,
    endYear,
  ]);

  useEffect(() => {
    if (startYear && endYear) {
      fetchPreviewCount();
      // Reset to page 1 ONLY when the years themselves change
      setCurrentPage(1);
    } else {
      setPreviewCount(null);
    }
  }, [startYear, endYear]);

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleNestedChange = (section, field, value) => {
    setFormData((prev) => ({
      ...prev,
      [section]: { ...prev[section], [field]: value },
    }));
  };

  const handleAuthorsChange = (e) => {
    setFormData((prev) => ({
      ...prev,
      authors: e.target.value
        .split(",")
        .map((a) => a.trim())
        .filter((a) => a),
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError("");
    setSuccess("");

    try {
      const token = localStorage.getItem("token");
      const method = editingId ? "PUT" : "POST";
      const url = editingId
        ? `${API_BASE}/periodicals/${editingId}`
        : `${API_BASE}/periodicals`;

      const response = await fetch(url, {
        method,
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify(formData),
      });

      if (response.ok) {
        setSuccess(
          editingId ? "Updated successfully!" : "Created successfully!",
        );
        resetForm();
        setShowForm(false);
        fetchPeriodicals();
      }
    } catch (err) {
      setError("Error saving periodical");
    } finally {
      setLoading(false);
    }
  };

  const handleEdit = (periodical) => {
    setFormData({
      ...periodical,
      authors: periodical.authors || [],
      vendorDetails: periodical.vendorDetails || {
        name: "",
        phone: "",
        email: "",
      },
      paymentDetails: periodical.paymentDetails || { currency: "", amount: "" },
    });
    setEditingId(periodical._id);
    setShowForm(true);
  };

  const handleDelete = async (id, title) => {
    if (!window.confirm(`Delete "${title}"?`)) return;
    try {
      const token = localStorage.getItem("token");
      const response = await fetch(`${API_BASE}/periodicals/${id}`, {
        method: "DELETE",
        headers: { Authorization: `Bearer ${token}` },
      });
      if (response.ok) {
        setSuccess("Deleted successfully!");
        fetchPeriodicals();
      }
    } catch (err) {
      setError("Error deleting");
    }
  };

  const resetForm = () => {
    setFormData({
      title: "",
      subtitle: "",
      authors: [],
      publisher: "",
      issn: "",
      volume: "",
      issue: "",
      periodicalYear: "",
      series: "",
      notes: "",
      subscriptionDate: "",
      frequency: "",
      receiptDate: "",
      departmentToIssue: "",
      departmentIssueDate: "",
      addOnCopies: "",
      orderNo: "",
      poNo: "",
      vendorDetails: { name: "", phone: "", email: "" },
      mode: "",
      url: "",
      paymentDetails: { currency: "", amount: "" },
      remarksForPayment: "",
      language: "",
      status: "Active",
    });
    setEditingId(null);
  };

  const frequencyOptions = [
    "Daily",
    "Weekly",
    "Monthly",
    "Quarterly",
    "Bi-Monthly",
    "Annual",
  ];
  const languageOptions = ["English", "Marathi", "Hindi"];
  const departmentOptions = [
    "Mechanical",
    "Civil",
    "Computer",
    "Electrical",
    "Automotive",
  ];
  const statusOptions = ["Active", "Disposal", "Issued"];
  const modeOptions = ["Subscription", "Exchange", "Free", "Membership"];
  const [suggestions, setSuggestions] = useState({
    vendorNames: [],
    emails: [],
    phones: [],
    poNumbers: [],
  });

  const fetchFieldSuggestions = async (field, query) => {
    if (!query || query.length < 2) return;
    try {
      const token = localStorage.getItem("token");
      const response = await fetch(
        `${API_BASE}/periodicals/suggestions?field=${field}&query=${query}`,
        { headers: { Authorization: `Bearer ${token}` } },
      );
      const data = await response.json();
      if (data.success) {
        // Map backend field names to our local state keys
        const keyMap = {
          vendorName: "vendorNames",
          vendorEmail: "emails",
          vendorPhone: "phones",
          poNo: "poNumbers",
        };
        setSuggestions((prev) => ({ ...prev, [keyMap[field]]: data.data }));
      }
    } catch (err) {
      console.error(`Error fetching ${field} suggestions`, err);
    }
  };

  const getVisiblePages = () => {
    const pages = [];
    const range = 2;
    const start = Math.max(1, currentPage - range);
    const end = Math.min(totalPages, start + range * 2);

    // Adjust start if we're near the end
    const finalStart = Math.max(1, Math.min(start, totalPages - range * 2));

    for (let i = finalStart; i <= end; i++) {
      if (i > 0) pages.push(i);
    }
    return pages;
  };

  const fetchPreviewCount = async () => {
    if (!startYear || !endYear) return;
    try {
      const token = localStorage.getItem("token");
      const response = await fetch(
        `${API_BASE}/periodicals/disposal-preview?startYear=${startYear}&endYear=${endYear}`,
        { headers: { Authorization: `Bearer ${token}` } },
      );
      const data = await response.json();
      if (data.success) {
        setPreviewCount(data.count);
      }
    } catch (err) {
      console.error("Failed to fetch preview count", err);
    }
  };

  const handleBulkDisposal = async () => {
    if (
      !window.confirm(
        `Are you sure you want to move ${previewCount} records to Disposal?`,
      )
    )
      return;
    setLoading(true);
    try {
      const token = localStorage.getItem("token");
      const response = await fetch(`${API_BASE}/periodicals/bulk-disposal`, {
        method: "PATCH",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({ startYear, endYear }),
      });
      const data = await response.json();
      if (data.success) {
        setSuccess(data.message);
        setPreviewCount(0);
        fetchPeriodicals(1);
      }
    } catch (err) {
      setError("Bulk update failed");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="flex min-h-screen bg-slate-50">
      {/* Sidebar would go here */}

      <div className="flex-1 p-8">
        <div className="max-w-7xl mx-auto">
          {/* Header Section */}
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-8">
            <div>
              <h1 className="text-2xl font-bold text-slate-800 flex items-center gap-2">
                <File className="text-blue-600" />
                Periodicals Management
              </h1>
              <p className="text-sm text-slate-500 mt-1">
                Manage and track your periodicals, status & lifecycle.
              </p>
              {previewCount !== null && (
                <p className="text-sm font-semibold text-blue-600 mt-2 bg-blue-50 px-3 py-1 rounded-md inline-block">
                  Found {previewCount} Records for the selected range.
                </p>
              )}
            </div>

            <div className="flex items-center gap-2 flex-wrap xl:flex-nowrap">
              <div className="flex items-center gap-1 bg-white px-2 py-1 rounded-md border border-slate-200 shadow-sm">
                <input
                  type="number"
                  placeholder="Start Year"
                  className="w-20 px-1 py-0.5 text-xs border-none outline-none"
                  value={startYear}
                  onChange={(e) => {
                    setStartYear(e.target.value);
                    setCurrentPage(1);
                  }}
                />
                <span className="text-slate-400">-</span>
                <input
                  type="number"
                  placeholder="End Year"
                  className="w-20 px-1 py-0.5 text-xs border-none outline-none"
                  value={endYear}
                  onChange={(e) => setEndYear(e.target.value)}
                />
                <button
                  onClick={handleBulkDisposal}
                  disabled={!previewCount || previewCount === 0}
                  className="px-2 py-0.5 bg-amber-500 text-white text-[11px] font-semibold rounded hover:bg-amber-600 disabled:opacity-50 transition whitespace-nowrap"
                >
                  Active → Disposal
                </button>
              </div>

              <button
                onClick={() => setShowForm(true)}
                className="flex items-center gap-1 px-3 py-1.5 bg-blue-600 text-white rounded-md hover:bg-blue-700 transition shadow-sm text-sm"
              >
                <Plus size={20} />
                Add New
              </button>

              <button
                onClick={() => navigate("/reports")}
                className="flex items-center gap-1 px-3 py-1.5 border border-blue-600 text-blue-600 rounded-md hover:bg-blue-50 transition shadow-sm text-sm"
              >
                <Download size={20} />
                Report
              </button>

              <button
                onClick={() => navigate("/uploadExcel")}
                className="flex items-center px-3 py-1.5 border border-blue-600 text-blue-600 rounded-md hover:bg-indigo-50 transition shadow-sm text-sm"
              >
                <Upload className="w-4 h-4 mr-2" />
                Upload
              </button>
            </div>
          </div>

          {/* Notifications */}
          {error && (
            <div className="mb-4 p-4 bg-red-100 border border-red-400 text-red-700 rounded-lg">
              {error}
            </div>
          )}
          {success && (
            <div className="mb-4 p-4 bg-blue-100 border border-blue-400 text-blue-700 rounded-lg">
              {success}
            </div>
          )}

          {/* Table Container */}
          <div className="bg-white rounded-xl shadow-sm border border-slate-200 overflow-hidden">
            {/* Search and Filters Bar */}
            <div className="p-6 bg-gray-50 border-b border-gray-200">
              <div className="flex flex-col md:flex-row gap-4">
                <div className="flex-1 relative">
                  <Search
                    className="absolute left-3 top-3 text-gray-400"
                    size={20}
                  />
                  <input
                    type="text"
                    placeholder="Search by title, publisher, or ISSN..."
                    value={searchTerm}
                    onChange={(e) => {
                      setSearchTerm(e.target.value);
                      setCurrentPage(1);
                    }}
                    className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  />
                </div>
                <select
                  value={frequencyFilter}
                  onChange={(e) => setFrequencyFilter(e.target.value)}
                  className="px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                >
                  <option value="">All Frequencies</option>
                  {frequencyOptions.map((opt) => (
                    <option key={opt} value={opt}>
                      {opt}
                    </option>
                  ))}
                </select>
                <select
                  value={languageFilter}
                  onChange={(e) => setLanguageFilter(e.target.value)}
                  className="px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                >
                  <option value="">All Languages</option>
                  {languageOptions.map((opt) => (
                    <option key={opt} value={opt}>
                      {opt}
                    </option>
                  ))}
                </select>
                <select
                  value={statusFilter}
                  onChange={(e) => setStatusFilter(e.target.value)}
                  className="px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                >
                  <option value="">All Statuses</option>
                  {statusOptions.map((opt) => (
                    <option key={opt} value={opt}>
                      {opt}
                    </option>
                  ))}
                </select>
              </div>
            </div>

            {/* Table */}
            <div className="overflow-x-auto">
              {periodicals.length > 0 ? (
                <table className="w-full">
                  <thead>
                    <tr className="bg-gray-50 text-gray-500 border-b border-gray-200">
                      <th className="px-6 py-3 text-left text-xs font-semibold uppercase tracking-wider">
                        Title
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-semibold uppercase tracking-wider">
                        Publisher
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-semibold uppercase tracking-wider">
                        ISSN
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-semibold uppercase tracking-wider">
                        Frequency
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-semibold uppercase tracking-wider">
                        Language
                      </th>
                      <th className="px-6 py-3 text-center text-xs font-semibold uppercase tracking-wider">
                        Actions
                      </th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-gray-200">
                    {periodicals.map((periodical, index) => (
                      <tr
                        key={periodical._id}
                        className="hover:bg-blue-50/30 transition-colors"
                      >
                        <td className="px-6 py-4 text-sm text-gray-800 font-medium">
                          {periodical.title}
                        </td>
                        <td className="px-6 py-4 text-sm text-gray-600">
                          {periodical.publisher}
                        </td>
                        <td className="px-6 py-4 text-sm text-gray-600">
                          {periodical.issn || "-"}
                        </td>
                        <td className="px-6 py-4 text-sm">
                          <span className="px-3 py-1 bg-blue-100 text-blue-800 rounded-full text-xs font-medium">
                            {periodical.frequency}
                          </span>
                        </td>
                        <td className="px-6 py-4 text-sm">
                          <span className="px-3 py-1 bg-slate-100 text-slate-800 rounded-full text-xs font-medium">
                            {periodical.language || "-"}
                          </span>
                        </td>
                        <td className="px-6 py-4 text-sm">
                          <div className="flex gap-3 justify-center">
                            <button
                              onClick={() => handleEdit(periodical)}
                              className="p-2 text-blue-600 hover:bg-blue-100 rounded-lg transition"
                              title="Edit"
                            >
                              <Edit2 size={18} />
                            </button>
                            <button
                              onClick={() =>
                                handleDelete(periodical._id, periodical.title)
                              }
                              className="p-2 text-red-600 hover:bg-red-100 rounded-lg transition"
                              title="Delete"
                            >
                              <Trash2 size={18} />
                            </button>
                          </div>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              ) : (
                <div className="p-12 text-center text-gray-500">
                  {loading ? "Loading periodicals..." : "No periodicals found."}
                </div>
              )}
            </div>

            {/* Updated Pagination Logic */}
            <div className="flex flex-col md:flex-row justify-between items-center gap-4 py-6 px-6 bg-gray-50 border-t border-gray-200">
              {/* Records Dropdown */}
              <div className="flex items-center gap-2 text-sm text-slate-600">
                <span>Show</span>
                <select
                  value={limit}
                  onChange={(e) => setLimit(Number(e.target.value))}
                  className="border border-gray-300 px-2 py-1 rounded bg-white outline-none focus:ring-2 focus:ring-blue-500"
                >
                  <option value={10}>10</option>
                  <option value={25}>25</option>
                  <option value={50}>50</option>
                  <option value={100}>100</option>
                </select>
                <span>records</span>
              </div>

              {/* Page Controls */}
              <div className="flex items-center gap-2">
                <button
                  disabled={currentPage === 1}
                  onClick={() => setCurrentPage((prev) => prev - 1)}
                  className="px-3 py-1 border border-gray-300 rounded bg-white text-sm disabled:opacity-40 hover:bg-gray-100 transition"
                >
                  Prev
                </button>

                {getVisiblePages().map((page) => (
                  <button
                    key={page}
                    onClick={() => setCurrentPage(page)}
                    className={`px-3 py-1 border rounded text-sm transition ${
                      currentPage === page
                        ? "bg-blue-600 text-white border-blue-600"
                        : "bg-white text-slate-600 border-gray-300 hover:bg-gray-100"
                    }`}
                  >
                    {page}
                  </button>
                ))}

                <button
                  disabled={currentPage === totalPages}
                  onClick={() => setCurrentPage((prev) => prev + 1)}
                  className="px-3 py-1 border border-gray-300 rounded bg-white text-sm disabled:opacity-40 hover:bg-gray-100 transition"
                >
                  Next
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Modal Component - Placed outside main content but inside root div */}
      <PeriodicalModal
        showForm={showForm}
        setShowForm={setShowForm}
        formData={formData}
        setFormData={setFormData}
        handleSubmit={handleSubmit}
        handleInputChange={handleInputChange}
        handleNestedChange={handleNestedChange}
        handleAuthorsChange={handleAuthorsChange}
        loading={loading}
        editingId={editingId}
        resetForm={resetForm}
        frequencyOptions={frequencyOptions}
        languageOptions={languageOptions}
        departmentOptions={departmentOptions}
        modeOptions={modeOptions}
        suggestions={suggestions}
        fetchFieldSuggestions={fetchFieldSuggestions}
      />
    </div>
  );
};

export default PeriodicalManagement;
