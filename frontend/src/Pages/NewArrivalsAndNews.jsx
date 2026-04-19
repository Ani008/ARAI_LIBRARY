import React, { useState, useEffect } from "react";
import axios from "axios";
import {
  Plus,
  Edit3,
  Trash2,
  Newspaper,
  Search,
  Calendar,
  Filter,
  RefreshCw,
} from "lucide-react";
import NewArrivalsAndNewsModal from "../Modal/NewArrivalsAndNewsModal";

const API_BASE_URL = `${import.meta.env.VITE_API_URL}/api`;

const NewArrivalsAndNews = () => {
  const [items, setItems] = useState([]);
  const [loading, setLoading] = useState(true);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingItem, setEditingItem] = useState(null);

  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const limit = 5;

  const [searchTerm, setSearchTerm] = useState("");
  const [startDate, setStartDate] = useState("");
  const [endDate, setEndDate] = useState("");
  const [dropdownOptions, setDropdownOptions] = useState({});

  const fetchItems = async (page = 1) => {
    setLoading(true);

    try {
      const token = localStorage.getItem("token");

      const response = await axios.get(`${API_BASE_URL}/arrivals-news`, {
        params: {
          page,
          limit,
          search: searchTerm,
          startDate,
          endDate,
        },
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      if (response.data?.success) {
        setItems(response.data.data || []);
        setTotalPages(response.data.totalPages);
        setCurrentPage(response.data.currentPage);
      } else {
        setItems([]);
      }

      // Keep dropdown options separate
      const optionsRes = await axios.get(`${API_BASE_URL}/options`);
      setDropdownOptions(optionsRes.data.data);
    } catch (error) {
      console.error("Error fetching data:", error);
      setItems([]);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchItems(currentPage);
  }, [currentPage, searchTerm, startDate, endDate]);

  useEffect(() => {
    setCurrentPage(1);
  }, [searchTerm, startDate, endDate]);

  const handleEdit = (item) => {
    setEditingItem(item); // 1. Set the data
    setIsModalOpen(true); // 2. Then open modal
  };

  const handleAddNew = () => {
    setEditingItem(null); // 1. Clear previous data
    setIsModalOpen(true); // 2. Then open modal
  };

  const handleDelete = async (id) => {
    if (window.confirm("Are you sure you want to delete this entry?")) {
      try {
        await axios.delete(`${API_BASE_URL}/arrivals-news/${id}`);
        fetchItems();
      } catch (error) {
        alert("Failed to delete the record.");
      }
    }
  };

  return (
    <div className="p-8 bg-gray-50 min-h-screen font-sans">
      <div className="max-w-7xl mx-auto">
        {/* Header Section */}
        <div className="flex flex-col md:flex-row md:items-center justify-between mb-8 gap-4">
          <div>
            <h1 className="text-2xl font-bold text-slate-800 flex items-center gap-2">
              <Newspaper className="text-blue-600" />
              New Arrivals & News
            </h1>
            <p className="text-slate-500 text-sm mt-1">
              Manage library updates and announcements.
            </p>
          </div>

          <button
            onClick={handleAddNew}
            className="flex items-center justify-center px-5 py-2.5 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-all shadow-md font-semibold text-sm"
          >
            <Plus className="w-4 h-4 mr-2" /> Add New Entry
          </button>
        </div>

        {/* Filter Bar */}
        <div className="bg-white p-4 rounded-xl shadow-sm border border-gray-100 mb-6">
          <div className="grid grid-cols-1 lg:grid-cols-4 gap-4">
            {/* Search */}
            <div className="relative">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 w-4 h-4" />
              <input
                type="text"
                placeholder="Search by title or topic..."
                className="w-full pl-10 pr-4 py-2 border border-gray-200 rounded-lg focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 outline-none text-sm"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
              />
            </div>

            {/* Type Filter */}
            <input
              type="date"
              className="px-3 py-2 border border-gray-200 rounded-lg text-sm outline-none focus:border-blue-500"
              value={startDate}
              onChange={(e) => setStartDate(e.target.value)}
            />

            {/* Category Filter */}
            <input
              type="date"
              className="px-3 py-2 border border-gray-200 rounded-lg text-sm outline-none focus:border-blue-500"
              value={endDate}
              onChange={(e) => setEndDate(e.target.value)}
            />

            {/* Find Button */}
            <button
              onClick={() => fetchItems(1)}
              className="flex items-center justify-center gap-2 px-3 py-2 border border-gray-200 rounded-lg text-sm"
            >
              <RefreshCw size={14} />
              Refresh
            </button>
          </div>
        </div>

        {/* Table Content */}
        <div className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="bg-slate-50/50 border-b border-gray-100">
                  <th className="px-6 py-4 text-xs font-semibold text-slate-500 uppercase">
                    Heading
                  </th>

                  <th className="px-6 py-4 text-xs font-semibold text-slate-500 uppercase">
                    Date
                  </th>

                  <th className="px-6 py-4 text-xs font-semibold text-slate-500 uppercase text-right">
                    Actions
                  </th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100">
                {loading ? (
                  <tr>
                    <td
                      colSpan="3"
                      className="py-10 text-center text-slate-400"
                    >
                      Loading...
                    </td>
                  </tr>
                ) : (
                  items.map((item) => (
                    <tr
                      key={item._id}
                      className="hover:bg-blue-50/30 transition-colors group"
                    >
                      <td className="px-6 py-4">
                        <div className="font-bold text-slate-800">
                          {item.heading}
                        </div>
                      </td>

                      <td className="px-6 py-4">
                        <div className="text-xs text-slate-500 flex items-center gap-2">
                          <Calendar size={12} />
                          {item.date
                            ? new Date(item.date).toLocaleDateString("en-GB")
                            : "N/A"}
                        </div>
                      </td>

                      <td className="px-6 py-4 text-right">
                        <div className="flex justify-end gap-2">
                          <button
                            onClick={() => handleEdit(item)}
                            className="p-2 text-slate-400 hover:text-blue-600 hover:bg-blue-50 rounded-lg transition-all"
                          >
                            <Edit3 size={18} />
                          </button>

                          <button
                            onClick={() => handleDelete(item._id)}
                            className="p-2 text-slate-400 hover:text-red-600 hover:bg-red-50 rounded-lg transition-all"
                          >
                            <Trash2 size={18} />
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))
                )}
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
                      currentPage === page
                        ? "bg-blue-600 text-white"
                        : "bg-white"
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
          </div>
        </div>
      </div>

      {/* Modal Integration - Fixed props */}
      {isModalOpen && (
        <NewArrivalsAndNewsModal
          isOpen={isModalOpen}
          onClose={() => setIsModalOpen(false)}
          itemToEdit={editingItem}
          onSuccess={fetchItems}
        />
      )}
    </div>
  );
};

export default NewArrivalsAndNews;
