import React, { useState, useEffect } from "react";
import {
  X,
  Plus,
  Trash2,
  Calendar,
  ExternalLink,
  Image,
  Tag,
  AlertCircle,
} from "lucide-react";
import axios from "axios";

const API_BASE_URL = `${import.meta.env.VITE_API_URL}/api`;

const NewArrivalsAndNewsModal = ({
  isOpen,
  onClose,
  itemToEdit,
  onSuccess,
}) => {
  const [formData, setFormData] = useState({
    date: "",
    heading: "",
    news: [
      {
        srno: 1,
        newsTopic: "",
        link: "",
        source: "",
      },
    ],
  });

  const [loading, setLoading] = useState(false);
  const [email, setEmail] = useState("");
  const [showPreview, setShowPreview] = useState(false);
  const [previewHtml, setPreviewHtml] = useState("");

  useEffect(() => {
    if (itemToEdit) {
      setFormData({
        date: itemToEdit.date?.split("T")[0] || "",
        heading: itemToEdit.heading || "",
        news: itemToEdit.news || [],
      });
    } else {
      setFormData({
        date: "",
        heading: "",
        news: [
          {
            srno: 1,
            newsTopic: "",
            link: "",
            source: "",
          },
        ],
      });
    }
  }, [itemToEdit]);

  const handleRowChange = (index, field, value) => {
    const updated = [...formData.news];
    updated[index][field] = value;

    setFormData({
      ...formData,
      news: updated,
    });
  };

  const addRow = () => {
    setFormData((prev) => ({
      ...prev,
      news: [
        ...prev.news,
        {
          srno: prev.news.length + 1,
          newsTopic: "",
          link: "",
          source: "",
        },
      ],
    }));
  };

  const deleteRow = (index) => {
    const updated = formData.news.filter((_, i) => i !== index);

    const reNumbered = updated.map((row, i) => ({
      ...row,
      srno: i + 1,
    }));

    setFormData({
      ...formData,
      news: reNumbered,
    });
  };

  const handlePreview = () => {
    const html = generateEmailHTML(formData);
    setPreviewHtml(html);
    setShowPreview(true);
  };

  const handleSendEmail = async () => {
    try {
      await axios.post(`${API_BASE_URL}/arrivals-news/send-email`, {
        email,
        items: [formData],
      });

      alert("Email sent successfully");
      setShowPreview(false);
    } catch (err) {
      console.error(err);
      alert("Failed to send email");
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);

    try {
      const url = itemToEdit
        ? `${API_BASE_URL}/arrivals-news/${itemToEdit._id}`
        : `${API_BASE_URL}/arrivals-news`;

      const method = itemToEdit ? "PUT" : "POST";

      const response = await fetch(url, {
        method,
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(formData),
      });

      const data = await response.json();

      if (data.success) {
        onSuccess();
        onClose();
      }
    } catch (err) {
      console.error(err);
    }

    setLoading(false);
  };

  if (!isOpen) return null;

  const generateEmailHTML = (data) => {
    return `
  <div style="font-family: Arial, sans-serif;">

  <p>Good Morning !</p>

  <h3 style="margin-bottom:10px;">
  ARAI KNOWLEDGE CENTER MODULES
  </h3>

  <h4 style="margin-top:15px;">
  ${data.heading}
  </h4>

  <table 
  style="
  border-collapse: collapse;
  width: 100%;
  border: 1px solid #000;
  font-size: 13px;
  ">

  <thead>
  <tr>

  <th style="border:1px solid #000; padding:6px;">
  SrNo
  </th>

  <th style="border:1px solid #000; padding:6px;">
  News Topic
  </th>

  <th style="border:1px solid #000; padding:6px;">
  Source
  </th>

  <th style="border:1px solid #000; padding:6px;">
  Link
  </th>

  </tr>
  </thead>

  <tbody>

  ${data.news
    .map(
      (row, index) => `

  <tr>

  <td style="border:1px solid #000; padding:6px;">
  ${index + 1}
  </td>

  <td style="border:1px solid #000; padding:6px;">
  ${row.newsTopic || ""}
  </td>

  <td style="border:1px solid #000; padding:6px;">
  ${row.source || ""}
  </td>

  <td style="border:1px solid #000; padding:6px;">
  <a href="${row.link}" target="_blank">
  ${row.link || "Open"}
  </a>
  </td>

  </tr>

  `,
    )
    .join("")}

  </tbody>
  </table>

  </div>
  `;
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/40 backdrop-blur-sm p-4">
      <div className="bg-white rounded-lg shadow-2xl w-full max-w-5xl max-h-[90vh] overflow-y-auto">
        <form onSubmit={handleSubmit} className="p-6">
          {/* Section 1: Basic Information */}
          <div className="mb-8">
            <div className="flex justify-between items-center py-5 border-b">
              <div>
                <h2 className="text-xl font-bold text-slate-800">
                  New Arrival or News Item
                </h2>
                <p className="text-xs text-slate-500 uppercase tracking-widest font-semibold mt-1">
                  Manage Library Updates & Announcements
                </p>
              </div>
              <button
                onClick={onClose}
                className="text-slate-400 hover:text-slate-600 transition-colors"
              >
                <X size={24} />
              </button>
            </div>
            {/* Date + Heading */}
            <div className="grid grid-cols-2 gap-4 mb-6">
              <div>
                <label className="block text-sm font-medium mb-1">Date</label>
                <input
                  type="date"
                  value={formData.date}
                  onChange={(e) =>
                    setFormData({ ...formData, date: e.target.value })
                  }
                  className="w-full border px-3 py-2 rounded-lg"
                />
              </div>

              <div>
                <label className="block text-sm font-medium mb-1">
                  Heading
                </label>
                <input
                  type="text"
                  value={formData.heading}
                  onChange={(e) =>
                    setFormData({ ...formData, heading: e.target.value })
                  }
                  className="w-full border px-3 py-2 rounded-lg"
                  placeholder="Enter heading"
                />
              </div>
            </div>
            <div className="flex items-center gap-3 mb-4">
              <input
                type="email"
                placeholder="Enter email address"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="px-3 py-2 border rounded-lg text-sm w-64"
              />

              <button
                type="button"
                onClick={handlePreview}
                className="px-4 py-2 bg-gray-700 text-white rounded-lg text-sm"
              >
                Preview
              </button>

              <button
                type="button"
                onClick={handleSendEmail}
                className="px-4 py-2 bg-blue-600 text-white rounded-lg text-sm"
              >
                Send Email
              </button>
            </div>

            {/* Table */}
            <div className="border rounded-lg overflow-hidden">
              <table className="w-full">
                <thead className="bg-gray-100">
                  <tr>
                    <th className="p-2">SrNo</th>
                    <th className="p-2">News Topic</th>
                    <th className="p-2">Link</th>
                    <th className="p-2">Source</th>
                    <th className="p-2">Action</th>
                  </tr>
                </thead>

                <tbody>
                  {formData.news.map((row, index) => (
                    <tr key={index} className="border-t">
                      <td className="p-2 text-center">{row.srno}</td>

                      <td className="p-2">
                        <input
                          value={row.newsTopic}
                          onChange={(e) =>
                            handleRowChange(index, "newsTopic", e.target.value)
                          }
                          className="w-full border px-2 py-1 rounded"
                        />
                      </td>

                      <td className="p-2">
                        <input
                          value={row.link}
                          onChange={(e) =>
                            handleRowChange(index, "link", e.target.value)
                          }
                          className="w-full border px-2 py-1 rounded"
                        />
                      </td>

                      <td className="p-2">
                        <input
                          value={row.source}
                          onChange={(e) =>
                            handleRowChange(index, "source", e.target.value)
                          }
                          className="w-full border px-2 py-1 rounded"
                        />
                      </td>

                      <td className="p-2 text-center">
                        <button
                          type="button"
                          onClick={() => deleteRow(index)}
                          className="text-red-500"
                        >
                          <Trash2 size={16} />
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            {/* Add Row Button */}
            <button
              type="button"
              onClick={addRow}
              className="mt-4 flex items-center gap-2 bg-blue-600 text-white px-4 py-2 rounded-lg"
            >
              <Plus size={16} />
              Add News
            </button>

            <div className="flex justify-end mt-6">
              <button
                type="submit"
                disabled={loading}
                className="bg-green-600 text-white px-6 py-2 rounded-lg"
              >
                {loading ? "Saving..." : "Save"}
              </button>
            </div>
          </div>
        </form>
      </div>

      {showPreview && (
        <div className="fixed inset-0 z-[60] flex items-center justify-center bg-black/40">
          <div className="bg-white w-[800px] max-h-[80vh] overflow-y-auto rounded-lg shadow-xl">
            <div className="flex justify-between items-center p-4 border-b">
              <h3 className="font-semibold">Email Preview</h3>

              <button onClick={() => setShowPreview(false)}>
                <X size={18} />
              </button>
            </div>

            <div
              className="p-4"
              dangerouslySetInnerHTML={{ __html: previewHtml }}
            />

            <div className="flex justify-end gap-3 p-4 border-t">
              <button
                onClick={() => setShowPreview(false)}
                className="px-4 py-2 border rounded"
              >
                Close
              </button>

              <button
                onClick={handleSendEmail}
                className="px-4 py-2 bg-blue-600 text-white rounded"
              >
                Send Email
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default NewArrivalsAndNewsModal;
