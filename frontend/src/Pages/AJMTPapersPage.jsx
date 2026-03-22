import React, { useState, useEffect } from "react";
import {
  Plus,
  Edit,
  Trash2,
  Filter,
  Search,
  FileText,
  Mail,
  Eye,
  Calendar,
} from "lucide-react";
import AJMTPaperModal from "../Modal/AJMTPaperModal";

const AJMTPapersPage = () => {
  const [papers, setPapers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  // Modal states
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [selectedPaper, setSelectedPaper] = useState(null);
  const [modalMode, setModalMode] = useState("create"); // 'create' or 'edit'

  // Filter states
  const [filters, setFilters] = useState({
    search: "",
    status: "",
    paperType: "",
    page: 1,
    limit: 25,
  });

  // Pagination
  const [pagination, setPagination] = useState({
    total: 0,
    totalPages: 0,
    currentPage: 1,
  });

  const API_BASE_URL = `${import.meta.env.VITE_API_URL}/api/ajmtpapers`;

  // Fetch papers
  const fetchPapers = async () => {
    setLoading(true);
    setError("");

    try {
      const queryParams = new URLSearchParams();
      if (filters.status) queryParams.append("status", filters.status);
      if (filters.paperType) queryParams.append("paperType", filters.paperType);
      queryParams.append("page", filters.page);
      queryParams.append("limit", filters.limit);

      const response = await fetch(`${API_BASE_URL}?${queryParams}`);
      const data = await response.json();

      if (data.success) {
        setPapers(data.data);
        setPagination({
          total: data.total,
          totalPages: data.totalPages,
          currentPage: data.currentPage,
        });
      } else {
        setError(data.message || "Failed to fetch papers");
      }
    } catch (err) {
      setError("Network error. Please check your connection.");
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchPapers();
  }, [filters.status, filters.paperType, filters.page, filters.limit]);

  // Filter papers by search
  const filteredPapers = papers.filter((paper) => {
    if (!filters.search) return true;
    const searchLower = filters.search.toLowerCase();
    return (
      paper.uniqueId?.toLowerCase().includes(searchLower) ||
      paper.paperTitle?.toLowerCase().includes(searchLower) ||
      paper.titleSubject?.toLowerCase().includes(searchLower) ||
      paper.authors?.some((a) =>
        a.authorName?.toLowerCase().includes(searchLower),
      )
    );
  });

  // Handle create new
  const handleCreateNew = () => {
    setSelectedPaper(null);
    setModalMode("create");
    setIsModalOpen(true);
  };

  // Handle edit
  const handleEdit = (paper) => {
    setSelectedPaper(paper);
    setModalMode("edit");
    setIsModalOpen(true);
  };

  // Handle delete
  const handleDelete = async (paperId) => {
    if (
      !window.confirm(
        "Are you sure you want to delete this paper? This action cannot be undone.",
      )
    ) {
      return;
    }

    try {
      const response = await fetch(`${API_BASE_URL}/${paperId}`, {
        method: "DELETE",
      });

      const data = await response.json();

      if (data.success) {
        fetchPapers();
      } else {
        alert(data.message || "Failed to delete paper");
      }
    } catch (err) {
      alert("Error deleting paper");
      console.error(err);
    }
  };

  // Handle modal close
  const handleModalClose = (shouldRefresh) => {
    setIsModalOpen(false);
    setSelectedPaper(null);
    if (shouldRefresh) {
      fetchPapers();
    }
  };

  // Format date
  const formatDate = (dateString) => {
    if (!dateString) return "N/A";
    return new Date(dateString).toLocaleDateString("en-US", {
      year: "numeric",
      month: "short",
      day: "numeric",
    });
  };

  // Get status color
  const getStatusColor = (status) => {
    const colors = {
      Draft: "bg-gray-100 text-gray-800 border-gray-300",
      "Under Review": "bg-blue-100 text-blue-800 border-blue-300",
      Accepted: "bg-green-100 text-green-800 border-green-300",
      Rejected: "bg-red-100 text-red-800 border-red-300",
      Published: "bg-purple-100 text-purple-800 border-purple-300",
    };
    return colors[status] || "bg-gray-100 text-gray-800 border-gray-300";
  };

  const getVisiblePages = () => {
    const { totalPages, currentPage } = pagination;
    const pages = [];
    const range = 2;
    const start = Math.max(1, currentPage - range);
    const end = Math.min(totalPages, start + range * 2);
    const finalStart = Math.max(1, Math.min(start, totalPages - range * 2));

    for (let i = finalStart; i <= end; i++) {
      if (i > 0) pages.push(i);
    }
    return pages;
  };

  return (
    <div className="min-h-screen bg-gray-50">
      {/* HEADER (NO WHITE BG) */}
      <div className="max-w-7xl mx-auto px-6 pt-8 pb-6">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold text-slate-900">
              AJMT Research Papers
            </h1>
            <p className="mt-1 text-sm text-slate-500">
              Manage and track research paper submissions
            </p>
          </div>

          <button
            onClick={() => {
              setSelectedPaper(null);
              setModalMode("create");
              setIsModalOpen(true);
            }}
            className="bg-emerald-600 text-white px-6 py-2.5 rounded-lg hover:bg-emerald-700 transition shadow-sm font-medium flex items-center"
          >
            <Plus size={18} className="mr-2" />
            New Paper
          </button>
        </div>
      </div>

      {/* FILTER SECTION (WHITE CARD) */}
      <div className="max-w-7xl mx-auto px-6 pb-6">
        <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-5">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            {/* Search */}
            <div className="md:col-span-2 relative">
              <Search
                className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400"
                size={18}
              />
              <input
                type="text"
                placeholder="Search by ID, title, subject, or author..."
                value={filters.search}
                onChange={(e) =>
                  setFilters((prev) => ({ ...prev, search: e.target.value }))
                }
                className="w-full pl-10 pr-4 py-2.5 border border-gray-200 rounded-lg text-sm focus:ring-2 focus:ring-emerald-500 outline-none"
              />
            </div>

            {/* Status */}
            <select
              value={filters.status}
              onChange={(e) =>
                setFilters((prev) => ({
                  ...prev,
                  status: e.target.value,
                  page: 1,
                }))
              }
              className="w-full px-4 py-2.5 border border-gray-200 rounded-lg text-sm focus:ring-2 focus:ring-emerald-500 outline-none"
            >
              <option value="">All Statuses</option>
              <option value="Draft">Draft</option>
              <option value="Under Review">Under Review</option>
              <option value="Accepted">Accepted</option>
              <option value="Rejected">Rejected</option>
              <option value="Published">Published</option>
            </select>

            {/* Type */}
            <select
              value={filters.paperType}
              onChange={(e) =>
                setFilters((prev) => ({
                  ...prev,
                  paperType: e.target.value,
                  page: 1,
                }))
              }
              className="w-full px-4 py-2.5 border border-gray-200 rounded-lg text-sm focus:ring-2 focus:ring-emerald-500 outline-none"
            >
              <option value="">All Types</option>
              <option value="Research Paper">Research Paper</option>
              <option value="Review Article">Review Article</option>
              <option value="Case Study">Case Study</option>
              <option value="Technical Paper">Technical Paper</option>
            </select>
          </div>
        </div>
      </div>

      {/* TABLE SECTION (WHITE CARD) */}
      <div className="max-w-7xl mx-auto px-6 pb-10">
        <div className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden">
          <table className="w-full text-left">
            <thead className="bg-slate-50 text-slate-500 text-xs uppercase tracking-wider">
              <tr>
                <th className="px-6 py-4">Paper</th>
                <th className="px-6 py-4">Type</th>
                <th className="px-6 py-4">Status</th>
                <th className="px-6 py-4">Submitted</th>
                <th className="px-6 py-4">Reviewers</th>
                <th className="px-6 py-4">Score</th>
                <th className="px-6 py-4 text-right pr-8">Actions</th>
              </tr>
            </thead>

            <tbody className="divide-y divide-gray-100">
              {filteredPapers.map((paper) => (
                <tr key={paper._id} className="hover:bg-gray-50 transition">
                  {/* Paper */}
                  <td className="px-6 py-4">
                    <div className="font-semibold text-slate-800">
                      {paper.paperTitle}
                    </div>
                    <div className="text-xs text-slate-500 mt-1">
                      {paper.uniqueId}
                    </div>
                  </td>

                  {/* Type */}
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-slate-600 align-middle">
                    {paper.paperType}
                  </td>

                  {/* Status */}
                  <td className="px-6 py-4">
                    <span
                      className={`px-3 py-1 whitespace-nowrap inline-block text-xs font-semibold rounded-full border ${getStatusColor(paper.status)}`}
                    >
                      {paper.status}
                    </span>
                  </td>

                  {/* Date */}
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-slate-600 align-middle">
                    {formatDate(paper.date)}
                  </td>

                  {/* Reviewers */}
                  <td className="px-6 py-4 text-sm text-slate-600">
                    {paper.reviewers?.length || 0}/3
                  </td>

                  {/* Score */}
                  <td className="px-6 py-4 text-sm font-semibold text-slate-800">
                    {paper.plagiarismPercentage}%
                  </td>

                  {/* Actions */}
                  <td className="px-6 py-4 text-right pr-8">
                    <div className="flex justify-end gap-2">
                      <button
                        onClick={() => handleEdit(paper)}
                        className="p-2 bg-slate-100 text-slate-600 rounded hover:bg-emerald-500 hover:text-white transition"
                      >
                        <Edit size={16} />
                      </button>
                      <button
                        onClick={() => handleDelete(paper._id)}
                        className="p-2 bg-slate-100 text-slate-600 rounded hover:bg-red-500 hover:text-white transition"
                      >
                        <Trash2 size={16} />
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
          {/* If there are no papers, show a message */}
          {filteredPapers.length === 0 && !loading && (
            <div className="p-12 text-center text-slate-500">
              No research papers found matching your criteria.
            </div>
          )}
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-6 pb-12">
        <div className="flex flex-col md:flex-row justify-between items-center gap-4 py-4 px-6 bg-white rounded-xl shadow-sm border border-gray-100">
          {/* Left Side: Records per page */}
          <div className="flex items-center gap-2 text-sm text-slate-600">
            <span>Show</span>
            <select
              value={filters.limit}
              onChange={(e) =>
                setFilters((prev) => ({
                  ...prev,
                  limit: Number(e.target.value),
                  page: 1,
                }))
              }
              className="border border-gray-200 px-2 py-1.5 rounded-lg bg-slate-50 outline-none focus:ring-2 focus:ring-emerald-500 cursor-pointer"
            >
              <option value={25}>25</option>
              <option value={50}>50</option>
              <option value={100}>100</option>
            </select>
            <span>records</span>
          </div>

          {/* Right Side: Navigation Buttons */}
          <div className="flex items-center gap-2">
            <button
              disabled={pagination.currentPage === 1}
              onClick={() =>
                setFilters((prev) => ({ ...prev, page: prev.page - 1 }))
              }
              className="px-4 py-2 border border-gray-200 rounded-lg bg-white text-sm font-medium disabled:opacity-40 hover:bg-gray-50 transition shadow-sm"
            >
              Prev
            </button>

            <div className="flex items-center gap-1.5">
              {getVisiblePages().map((page) => (
                <button
                  key={page}
                  onClick={() => setFilters((prev) => ({ ...prev, page }))}
                  className={`min-w-[40px] h-10 flex items-center justify-center border rounded-lg text-sm font-semibold transition-all ${
                    pagination.currentPage === page
                      ? "bg-emerald-600 text-white border-emerald-600 shadow-md scale-105"
                      : "bg-white text-slate-600 border-gray-200 hover:border-emerald-500 hover:text-emerald-600"
                  }`}
                >
                  {page}
                </button>
              ))}
            </div>

            <button
              disabled={pagination.currentPage === pagination.totalPages}
              onClick={() =>
                setFilters((prev) => ({ ...prev, page: prev.page + 1 }))
              }
              className="px-4 py-2 border border-gray-200 rounded-lg bg-white text-sm font-medium disabled:opacity-40 hover:bg-gray-50 transition shadow-sm"
            >
              Next
            </button>
          </div>
        </div>
      </div>

      {isModalOpen && (
        <AJMTPaperModal
          isOpen={isModalOpen}
          onClose={() => setIsModalOpen(false)}
          paper={selectedPaper}
          mode={modalMode}
        />
      )}
    </div>
  );
};

export default AJMTPapersPage;
