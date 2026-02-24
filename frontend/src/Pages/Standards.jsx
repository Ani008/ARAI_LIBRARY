import React, { useState, useEffect } from "react";
import axios from "axios";
import {
  Plus,
  Edit3,
  Trash2,
  Eye,
  FileText,
  Download,
  Search,
  UserMinus,
} from "lucide-react";
import StandardModal from "../Modal/StandardModal";
import { useNavigate } from "react-router-dom";
import api from "../utils/api";

const StandardsPage = () => {
  const [standards, setStandards] = useState([]);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingId, setEditingId] = useState(null);
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const limit = 5; // records per page

  const navigate = useNavigate();

  const [search, setSearch] = useState("");
  const [departmentFilter, setDepartmentFilter] = useState("");
  const [categoryFilter, setCategoryFilter] = useState("");
  const [statusFilter, setStatusFilter] = useState("");

  // 🔥 Fetch Standards
  const fetchStandards = async () => {
    try {
      const response = await api.get("/standards", {
        params: {
          page: currentPage,
          limit: limit,
          search: search,
          department: departmentFilter,
          category: categoryFilter,
          status: statusFilter,
        },
      });

      if (response.data?.success) {
        setStandards(response.data.data || []);
        setTotalPages(response.data.totalPages);
        setCurrentPage(response.data.currentPage);
      } else {
        setStandards([]);
      }
    } catch (error) {
      console.error("Error fetching standards:", error);
      setStandards([]);
    }
  };

  useEffect(() => {
    fetchStandards(currentPage);
  }, [currentPage, search, departmentFilter, categoryFilter, statusFilter]);

  useEffect(() => {
    setCurrentPage(1);
  }, [search, departmentFilter, categoryFilter, statusFilter]);

  // 🔥 Delete Standard
  const handleDelete = async (id) => {
    if (window.confirm("Are you sure you want to delete this standard?")) {
      try {
        await api.delete(`/standards/${id}`);
        fetchStandards(currentPage);
      } catch (error) {
        console.error("Delete error:", error);
        alert("Failed to delete");
      }
    }
  };

  const handleEditClick = (id) => {
    setEditingId(id);
    setIsModalOpen(true);
  };

  return (
    <div className="p-8 bg-gray-50 min-h-screen space-y-6">
      {/* ================= HEADER (NO WHITE BG) ================= */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-slate-800 flex items-center gap-2">
            <FileText className="text-amber-400" />
            Standards Management
          </h1>
          <p className="text-sm text-slate-500 mt-1">
            Manage engineering standards, categories and lifecycle status.
          </p>
        </div>

        <div className="flex gap-3">
          <button
            onClick={() => {
              setEditingId(null);
              setIsModalOpen(true);
            }}
            className="flex items-center px-4 py-2 bg-amber-400 text-white rounded-md hover:bg-amber-300 transition shadow-sm font-medium"
          >
            <Plus className="w-4 h-4 mr-2" />
            Add New Standard
          </button>

          <button
            onClick={() => navigate("/reports")}
            className="flex items-center px-4 py-2 border border-amber-400 text-amber-400 rounded-md hover:bg-indigo-50 transition shadow-sm font-medium"
          >
            <Download className="w-4 h-4 mr-2" />
            Reports
          </button>
        </div>
      </div>

      {/* ================= FILTER CARD ================= */}
      <div className="bg-white rounded-xl border border-gray-100 shadow-sm">
        <div className="p-4 flex flex-wrap gap-4 items-center">
          {/* Search */}
          <div className="relative flex-1 min-w-[260px]">
            <Search className="absolute left-3 top-2.5 w-4 h-4 text-gray-400" />
            <input
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Search by ICN, Standard No or Title..."
              className="pl-9 pr-3 py-2 w-full rounded-md border border-gray-200 text-sm focus:ring-2 focus:ring-black outline-none"
            />
          </div>

          {/* Department */}
          <select
            value={departmentFilter}
            onChange={(e) => setDepartmentFilter(e.target.value)}
            className="px-3 py-2 border border-gray-200 rounded-md text-sm min-w-[180px]"
          >
            <option value="">Department</option>
            <option>Mechanical</option>
            <option>Civil</option>
            <option>Computer</option>
            <option>Electrical</option>
            <option>Automotive</option>
          </select>

          {/* Category */}
          <select
            value={categoryFilter}
            onChange={(e) => setCategoryFilter(e.target.value)}
            className="px-3 py-2 border border-gray-200 rounded-md text-sm min-w-[160px]"
          >
            <option value="">Category</option>
            <option>ASTM</option>
            <option>BIS</option>
            <option>DIN</option>
            <option>ISO</option>
            <option>SAE</option>
          </select>

          {/* Status */}
          <select
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
            className="px-3 py-2 border border-gray-200 rounded-md text-sm min-w-[160px]"
          >
            <option value="">Status</option>
            <option>Active</option>
            <option>Superseded</option>
            <option>Withdrawn</option>
          </select>
        </div>
      </div>

      {/* ================= TABLE CARD ================= */}
      <div className="bg-white rounded-xl border border-gray-100 shadow-sm overflow-hidden">
        <table className="w-full text-left">
          <thead className="bg-gray-50 text-gray-500 text-xs uppercase tracking-wider">
            <tr>
              <th className="px-6 py-4">ICN No.</th>
              <th className="px-6 py-4">Standard Number</th>
              <th className="px-6 py-4">Title</th>
              <th className="px-6 py-4 text-center">Department</th>
              <th className="px-6 py-4 text-center">Category</th>
              <th className="px-6 py-4 text-center">Status</th>
              <th className="px-6 py-4 text-right pr-10">Actions</th>
            </tr>
          </thead>

          <tbody className="divide-y divide-gray-100">
            {standards.map((s) => (
              <tr key={s._id} className="hover:bg-indigo-50/30 transition">
                <td className="px-6 py-4 font-semibold text-slate-800">
                  {s.icnNumber}
                </td>

                <td className="px-6 py-4 text-sm text-slate-600">
                  {s.standardNumber}
                </td>

                <td className="px-6 py-4 text-sm text-slate-500 max-w-xs truncate">
                  {s.title}
                </td>

                <td className="px-6 py-4 text-center">
                  <span className="px-3 py-1 bg-amber-100 text-black text-[10px] rounded-full font-bold uppercase">
                    {s.department}
                  </span>
                </td>

                <td className="px-6 py-4 text-center">
                  <span className="px-3 py-1 bg-amber-100 text-black text-[10px] rounded-full font-bold uppercase">
                    {s.category}
                  </span>
                </td>

                <td className="px-6 py-4 text-center">
                  <span className="px-3 py-1 bg-slate-100 text-slate-700 text-[10px] rounded-full font-bold uppercase">
                    {s.status}
                  </span>
                </td>

                <td className="px-6 py-4 text-right pr-8">
                  <div className="flex justify-end gap-2">
                    <button
                      onClick={() => handleEditClick(s._id)}
                      className="p-2 bg-slate-100 rounded hover:bg-emerald-500 hover:text-white transition"
                    >
                      <Edit3 className="w-4 h-4" />
                    </button>

                    <button
                      onClick={() => handleDelete(s._id)}
                      className="p-2 bg-slate-100 rounded hover:bg-red-500 hover:text-white transition"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>

        {/* Pagination */}
        <div className="flex justify-center items-center gap-2 py-6">
          <button
            disabled={currentPage === 1}
            onClick={() => setCurrentPage((prev) => prev - 1)}
            className="px-3 py-1 border rounded disabled:opacity-50"
          >
            Prev
          </button>

          {[...Array(totalPages)].map((_, index) => {
            const page = index + 1;
            return (
              <button
                key={page}
                onClick={() => setCurrentPage(page)}
                className={`px-3 py-1 border rounded ${
                  currentPage === page ? "bg-amber-400 text-white" : "bg-white"
                }`}
              >
                {page}
              </button>
            );
          })}

          <button
            disabled={currentPage === totalPages}
            onClick={() => setCurrentPage((prev) => prev + 1)}
            className="px-3 py-1 border rounded disabled:opacity-50"
          >
            Next
          </button>
        </div>

        {standards.length === 0 && (
          <div className="py-20 text-center text-slate-400">
            <FileText className="w-10 h-10 mx-auto mb-3 opacity-20" />
            No standards found.
          </div>
        )}
      </div>

      {/* ================= MODALS ================= */}
      {isModalOpen && (
        <StandardModal
          isOpen={isModalOpen}
          onClose={() => setIsModalOpen(false)}
          editingId={editingId}
          refreshData={fetchStandards}
        />
      )}
    </div>
  );
};

export default StandardsPage;
