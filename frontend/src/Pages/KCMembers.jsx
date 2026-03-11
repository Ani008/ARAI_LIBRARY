import { useEffect, useState } from "react";
import axios from "axios";
import { useNavigate } from "react-router-dom";
import {
  Users,
  Plus,
  Download,
  Edit3,
  Trash2,
  Calendar,
  CheckCircle,
  AlertCircle,
  Search,
} from "lucide-react";
import KCModal from "../Modal/KCMembersModal";
import MembershipCountModal from "../Modal/MembershipCountModal";

const API_BASE_URL = `${import.meta.env.VITE_API_URL}/api/kcmembers`;

const KCMembers = () => {
  const [members, setMembers] = useState([]);
  const [membershipType, setMembershipType] = useState("");
  const [status, setStatus] = useState("");
  const [search, setSearch] = useState("");
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingId, setEditingId] = useState(null);
  const [showCountModal, setShowCountModal] = useState(false);
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const limit = 5; // records per page

  const navigate = useNavigate();

  const fetchMembers = async (page = 1) => {
    try {
      const token = localStorage.getItem("token");

      const res = await axios.get(API_BASE_URL, {
        params: {
          page,
          limit,
          search,
          membershipType,
          membershipStatus: status,
        },
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      if (res.data?.success) {
        setMembers(res.data.data || []);
        setCurrentPage(res.data.currentPage);
        setTotalPages(res.data.totalPages);
      } else {
        setMembers([]);
      }
    } catch (err) {
      console.error(err);
      setMembers([]);
    }
  };

  useEffect(() => {
    fetchMembers(currentPage);
  }, [currentPage, search, membershipType, status]);

  useEffect(() => {
    setCurrentPage(1);
  }, [search, membershipType, status]);

  const handleDelete = async (id) => {
    if (window.confirm("Delete this membership record?")) {
      await axios.delete(`${API_BASE_URL}/${id}`);
      fetchMembers();
    }
  };

  const membershipTypes = [
    "Corporate",
    "Educational Institution",
    "Individual",
    "Student",
    "Staff",
    "Temp Membership",
  ];

  const membershipCounts = membershipTypes.map((type) => ({
    type,
    count: members.filter((m) => m.membershipType === type).length,
  }));

  return (
    <div className="p-8 bg-gray-50 min-h-screen">
      <div className="space-y-6">
        {/* ===== Page Header ===== */}
        <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
          <div>
            <h1 className="text-2xl font-bold text-slate-800 flex items-center gap-2">
              <Users className="text-green-600" />
              KC Members
            </h1>
            <p className="text-sm text-slate-500 mt-1">
              Manage KC memberships, subscriptions and payments.
            </p>
          </div>

          <div className="flex gap-3">
            <button
              onClick={() => setShowCountModal(true)}
              className="flex items-center px-4 py-2 border border-green-600 text-green-600 rounded-md hover:bg-green-50 transition shadow-sm font-medium"
            >
              Total Subscription Details
            </button>

            <button
              onClick={() => {
                setEditingId(null);
                setIsModalOpen(true);
              }}
              className="flex items-center px-4 py-2 bg-green-600 text-white rounded-md hover:bg-green-700 transition font-medium"
            >
              <Plus className="w-4 h-4 mr-2" /> Add Member
            </button>

            <button
              onClick={() => navigate("/reports")}
              className="flex items-center px-4 py-2 border border-green-600 text-green-600 rounded-md hover:bg-green-50 transition font-medium"
            >
              <Download className="w-4 h-4 mr-2" /> Reports
            </button>
          </div>
        </div>

        {/* ===== Filter Bar ===== */}
        <div className="px-1 pb-6">
          <div className="bg-white rounded-xl border border-gray-100 shadow-sm">
            <div className="p-5 flex flex-wrap gap-4 items-center">
              {/* Search */}
              <div className="relative flex-1 min-w-[220px]">
                <Search className="absolute left-3 top-2.5 w-4 h-4 text-slate-400" />
                <input
                  value={search}
                  onChange={(e) => setSearch(e.target.value)}
                  placeholder="Search by institution..."
                  className="pl-9 pr-3 py-2 w-full rounded-md border border-gray-200 text-sm focus:ring-2 focus:ring-green-500 outline-none"
                />
              </div>

              {/* Membership Type */}
              <select
                value={membershipType}
                onChange={(e) => setMembershipType(e.target.value)}
                className="px-3 py-2 border border-gray-200 rounded-md text-sm min-w-[200px]"
              >
                <option value="">Membership Type</option>
                <option value="Corporate">Corporate</option>
                <option value="Educational Institution">
                  Educational Institution
                </option>
                <option value="Individual">Individual</option>
                <option value="Student">Student</option>
                <option value="Other">Staff</option>
                <option value="Other">Temp Membership</option>
              </select>

              {/* Status */}
              <select
                value={status}
                onChange={(e) => setStatus(e.target.value)}
                className="px-3 py-2 border border-gray-200 rounded-md text-sm min-w-[140px]"
              >
                <option value="">Membership Status</option>
                <option value="Active">Active</option>
                <option value="Inactive">Inactive</option>
              </select>
            </div>
          </div>
        </div>

        {/* ===== Table ===== */}
        <div className="bg-white rounded-xl border border-gray-100 shadow-sm overflow-hidden">
          <table className="w-full">
            <thead className="bg-slate-50 text-xs uppercase text-slate-500">
              <tr>
                <th className="px-6 py-4 text-left">Membership ID</th>
                <th className="px-6 py-4 text-left">Organization & Contact</th>
                <th className="px-6 py-4">Type</th>
                <th className="px-6 py-4">Subscriptions</th>
                <th className="px-6 py-4">Validity</th>
                <th className="px-6 py-4 text-center">Fees & Status</th>
                <th className="px-6 py-4 text-right">Actions</th>
              </tr>
            </thead>

            <tbody className="divide-y">
              {members.map((item) => (
                <tr key={item._id} className="hover:bg-green-50/40 transition">
                  <td className="px-6 py-4">
                    <div className="font-semibold text-slate-800">
                      {item.membershipId}
                    </div>
                  </td>

                  <td className="px-6 py-4">
                    <div className="font-semibold text-slate-800">
                      {item.institutionName}
                    </div>
                    <div className="text-xs text-green-600 mt-1">
                      {item.contactPerson} • {item.designation}
                    </div>
                  </td>

                  <td className="px-6 py-4 text-sm">{item.membershipType}</td>

                  <td className="px-6 py-4">
                    <div className="flex gap-1 flex-wrap">
                      {item.subscriptionType ? (
                        <Badge text={item.subscriptionType} />
                      ) : (
                        <span className="text-xs text-slate-400">N/A</span>
                      )}
                    </div>
                  </td>

                  <td className="px-6 py-4 text-xs text-slate-500">
                    <div className="flex flex-col gap-1">
                      <div className="flex items-center gap-1">
                        <span className="font-semibold text-slate-400">Start Date: </span>
                        <span>
                          {item.membershipStartDate
                            ? new Date(
                                item.membershipStartDate,
                              ).toLocaleDateString("en-GB")
                            : "N/A"}
                        </span>
                      </div>
                      <div className="flex items-center gap-1">
                        <span className="font-semibold text-slate-400">End Date: </span>
                        <span>
                          {item.membershipEndDate
                            ? new Date(
                                item.membershipEndDate,
                              ).toLocaleDateString("en-GB")
                            : "N/A"}
                        </span>
                      </div>
                    </div>
                  </td>

                  <td className="px-6 py-4 text-center">
                    <div className="font-semibold">₹{item.fees || 0}</div>
                    <div className="text-xs flex justify-center items-center text-green-600 mt-1">
                      {item.paymentStatus === "Paid" ? (
                        <CheckCircle className="w-3 h-3 mr-1" />
                      ) : (
                        <AlertCircle className="w-3 h-3 mr-1" />
                      )}
                      {item.paymentStatus || "Unpaid"}
                    </div>
                  </td>

                  <td className="px-6 py-4 text-right">
                    <div className="flex justify-end gap-2">
                      <button
                        onClick={() => {
                          setEditingId(item._id);
                          setIsModalOpen(true);
                        }}
                        className="p-2 rounded bg-slate-100 hover:bg-green-600 hover:text-white"
                      >
                        <Edit3 className="w-4 h-4" />
                      </button>
                      <button
                        onClick={() => handleDelete(item._id)}
                        className="p-2 rounded bg-slate-100 hover:bg-red-500 hover:text-white"
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
                    currentPage === page
                      ? "bg-green-600 text-white"
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

        {members.length === 0 && (
          <div className="py-20 text-center text-slate-400">
            <Users className="w-10 h-10 mx-auto mb-3 opacity-20" />
            No records found.
          </div>
        )}
      </div>

      {isModalOpen && (
        <KCModal
          onClose={() => setIsModalOpen(false)}
          editingId={editingId}
          refreshData={fetchMembers}
        />
      )}

      {showCountModal && (
        <MembershipCountModal
          onClose={() => setShowCountModal(false)}
          data={membershipCounts}
        />
      )}
    </div>
  );
};

const Badge = ({ text }) => (
  <span className="px-2 py-0.5 bg-green-50 text-green-600 text-[10px] rounded border border-green-100 font-semibold">
    {text}
  </span>
);

export default KCMembers;
