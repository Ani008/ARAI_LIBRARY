import React, { useState, useEffect } from "react";

import axios from "axios";
import {
  Plus,
  Edit3,
  Trash2,
  Eye,
  BookCopy,
  Globe,
  Download,
  FileText,
} from "lucide-react";
import AbstractModal from "../Modal/AbstractModal"; // Pointing to your new modal
import { useNavigate } from "react-router-dom";

const API_BASE_URL = `${import.meta.env.VITE_API_URL}/api/abstracts`;

const Abstracts = () => {
  const [abstracts, setAbstracts] = useState([]);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingId, setEditingId] = useState(null);
  const [viewingAbstract, setViewingAbstract] = useState(null);
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const limit = 5; // records per page
  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState("");
  const [subjectFilter, setSubjectFilter] = useState("");

  const navigate = useNavigate();

  const fetchAbstracts = async () => {
    try {
      const response = await axios.get(API_BASE_URL,{
        params: {
          page: currentPage,
          limit: limit,
          search: search,
          subject: subjectFilter,
          status: statusFilter,
        },
      });

      if (response.data?.success) {
        setAbstracts(response.data.data || []);
        setTotalPages(response.data.totalPages);
        setCurrentPage(response.data.currentPage);
      } else {
        setAbstracts([]);
      }
    } catch (error) {
      console.error("Error fetching standards:", error);
      setStandards([]);
    }
  };

  useEffect(() => {
    fetchAbstracts(currentPage);
  }, [currentPage, search, subjectFilter, statusFilter]);

  useEffect(() => {
    setCurrentPage(1);
  }, [search, subjectFilter, statusFilter]);

  const handleDelete = async (id) => {
    if (
      window.confirm("Are you sure you want to delete this research abstract?")
    ) {
      try {
        await axios.delete(`${API_BASE_URL}/${id}`);
        fetchAbstracts();
      } catch (error) {
        alert("Failed to delete record.");
      }
    }
  };

  const filteredAbstracts = abstracts.filter((item) => {
    if (
      search &&
      !(
        item.title?.toLowerCase().includes(search.toLowerCase()) ||
        item.journal?.toLowerCase().includes(search.toLowerCase()) ||
        item.authors?.join(", ").toLowerCase().includes(search.toLowerCase())
      )
    )
      return false;

    if (statusFilter && item.status !== statusFilter) return false;

    if (subjectFilter && item.subject !== subjectFilter) return false;

    return true;
  });

  return (
    <div className="p-8 bg-gray-50 min-h-screen space-y-6">
      {/* ================= HEADER (NO WHITE BG) ================= */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-slate-800 flex items-center gap-2">
            <FileText className="text-rose-600" />
            Automotive Abstract Management
          </h1>
          <p className="text-sm text-slate-500 mt-1">
            Manage automotive research abstracts and publications.
          </p>
        </div>

        <div className="flex gap-3">
          <button
            onClick={() => {
              setEditingId(null);
              setIsModalOpen(true);
            }}
            className="flex items-center px-4 py-2 bg-rose-600 text-white rounded-md hover:bg-rose-700 transition shadow-sm font-medium"
          >
            <Plus className="w-4 h-4 mr-2" />
            Add New Abstract
          </button>

          <button
            onClick={() => navigate("/reports")}
            className="flex items-center px-4 py-2 border border-rose-600 text-rose-600 rounded-md hover:bg-rose-50 transition shadow-sm font-medium"
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
            <input
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Search by title, author or journal..."
              className="pl-4 pr-3 py-2 w-full rounded-md border border-gray-200 text-sm focus:ring-2 focus:ring-rose-500 outline-none"
            />
          </div>

          {/* Subject */}
          <select
            value={subjectFilter}
            onChange={(e) => setSubjectFilter(e.target.value)}
            className="px-3 py-2 border border-gray-200 rounded-md text-sm min-w-[180px]"
          >
            <option value="">Subject</option>
            <option>Powertrain</option>
            <option>EV</option>
            <option>Safety</option>
            <option>Materials</option>
            <option>General</option>
          </select>

          {/* Status */}
          <select
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
            className="px-3 py-2 border border-gray-200 rounded-md text-sm min-w-[160px]"
          >
            <option value="">Status</option>
            <option>Published</option>
            <option>Draft</option>
            <option>Archived</option>
          </select>
        </div>
      </div>

      {/* ================= TABLE CARD ================= */}
      <div className="bg-white rounded-xl border border-gray-100 shadow-sm overflow-hidden">
        <table className="w-full text-left">
          <thead className="bg-gray-50 text-gray-500 text-xs uppercase tracking-wider">
            <tr>
              <th className="px-6 py-4">Research Title & Authors</th>
              <th className="px-6 py-4">Journal / Source</th>
              <th className="px-6 py-4 text-center">Pub. Year</th>
              <th className="px-6 py-4 text-center">Subject</th>
              <th className="px-6 py-4 text-center">Status</th>
              <th className="px-6 py-4 text-right pr-10">Actions</th>
            </tr>
          </thead>

          <tbody className="divide-y divide-gray-100">
            {abstracts.map((item) => (
              <tr key={item._id} className="hover:bg-rose-50/30 transition">
                {/* Title & Authors */}
                <td className="px-6 py-4">
                  <div className="font-semibold text-slate-800">
                    {item.title}
                  </div>
                  <div className="text-[11px] text-rose-600 mt-1 font-medium">
                    {item.authors?.join(", ") || "No authors listed"}
                  </div>
                </td>

                {/* Journal */}
                <td className="px-6 py-4 text-sm text-slate-600">
                  <div className="font-medium">{item.journal || "N/A"}</div>
                  <div className="text-[10px] italic text-slate-400">
                    {item.source}
                  </div>
                </td>

                {/* Year */}
                <td className="px-6 py-4 text-center font-mono text-sm text-slate-500">
                  {item.publicationYear || item.year || "—"}
                </td>

                {/* Subject */}
                <td className="px-6 py-4 text-center">
                  <span className="px-2 py-1 text-xs font-semibold bg-slate-100 text-slate-600 rounded">
                    {item.subject?.join(", ") || "General"}
                  </span>
                </td>

                {/* Status */}
                <td className="px-6 py-4 text-center">
                  <span className="px-3 py-1 bg-rose-50 text-rose-700 text-[10px] rounded-full font-semibold uppercase">
                    {item.status || "Published"}
                  </span>
                </td>

                {/* Actions */}
                <td className="px-6 py-4 text-right pr-8">
                  <div className="flex justify-end gap-2">
                    <button
                      onClick={() => {
                        setEditingId(item._id);
                        setIsModalOpen(true);
                      }}
                      className="p-2 bg-slate-100 rounded hover:bg-rose-500 hover:text-white transition"
                    >
                      <Edit3 className="w-4 h-4" />
                    </button>

                    <button
                      onClick={() => handleDelete(item._id)}
                      className="p-2 bg-slate-100 rounded hover:bg-red-500 hover:text-white transition"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>

                    {item.url && (
                      <a
                        href={item.url}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="p-2 bg-slate-100 rounded hover:bg-indigo-500 hover:text-white transition"
                      >
                        <Globe className="w-4 h-4" />
                      </a>
                    )}
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
                  currentPage === page ? "bg-rose-600 text-white" : "bg-white"
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

        {abstracts.length === 0 && (
          <div className="py-20 text-center text-slate-400">
            <BookCopy className="w-10 h-10 mx-auto mb-3 opacity-20" />
            No abstracts found.
          </div>
        )}
      </div>

      {/* ================= MODAL ================= */}
      {isModalOpen && (
        <AbstractModal
          onClose={() => setIsModalOpen(false)}
          editingId={editingId}
          refreshData={fetchAbstracts}
        />
      )}
    </div>
  );
};

export default Abstracts;
