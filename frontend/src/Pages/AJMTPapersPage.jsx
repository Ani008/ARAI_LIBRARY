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
    limit: 20,
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
  }, [filters.status, filters.paperType, filters.page]);

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
                    {paper.totalScore}%
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
        </div>
      </div>

      {/* Pagination stays same */}
      {/* Modal stays same */}

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
