import React, { useState, useEffect } from "react";
import {
  X,
  Plus,
  Trash2,
  Upload,
  Mail,
  Check,
  Loader2,
  FileText,
  Eye,
  AlertCircle,
  Calendar,
} from "lucide-react";
import EmailPreviewModal from "./EmailpreviewModal";
import ReviewModal from "./ReviewModal";

const AJMTPaperModal = ({ isOpen, onClose, paper = null, mode = "create" }) => {
  const isEditMode = mode === "edit" && paper !== null;
  const API_BASE_URL = `${import.meta.env.VITE_API_URL}/api/ajmtpapers`;

  // Form Data State
  const [formData, setFormData] = useState({
    uniqueId: "",
    paperTitle: "",
    titleSubject: "",
    paperType: "",
    date: "",
    tentativeDateOfPublication: "",
    websiteUpdateDate: "",
    hardcopyDate: "",
    status: "Draft",
    remarks: "",
    plagiarismPercentage: ""
  });

  const [authors, setAuthors] = useState([{authorName: "",authorEmail: "",authorAddress: "",authorCity: "",authorInstitution: "",authorPhone: "",},]);
  const [reviewers, setReviewers] = useState([]);
  const [pdfFile, setPdfFile] = useState(null);
  const [pdfFileName, setPdfFileName] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");
  const [activeTab, setActiveTab] = useState("basic");
  const [fieldErrors, setFieldErrors] = useState({});
  const [emailModalOpen, setEmailModalOpen] = useState(false);
  const [selectedReviewer, setSelectedReviewer] = useState(null);
  const [originalData, setOriginalData] = useState(null);
  const [hasChanges, setHasChanges] = useState(false);

  // Pre-fill form when editing
  useEffect(() => {
    if (isEditMode && paper) {
      const formatDate = (dateString) => {
        if (!dateString) return "";
        return new Date(dateString).toISOString().split("T")[0];
      };

      const formValues = {
        uniqueId: paper.uniqueId || "",
        paperTitle: paper.paperTitle || "",
        titleSubject: paper.titleSubject || "",
        paperType: paper.paperType || "",
        date: formatDate(paper.date),
        tentativeDateOfPublication: formatDate(
          paper.tentativeDateOfPublication,
        ),
        websiteUpdateDate: formatDate(paper.websiteUpdateDate),
        hardcopyDate: formatDate(paper.hardcopyDate),
        status: paper.status || "Draft",
        remarks: paper.remarks || "",
        plagiarismPercentage: paper.plagiarismPercentage || "",
      };

      setFormData(formValues);
      setOriginalData(formValues);
      setAuthors(
        paper.authors && paper.authors.length > 0
          ? [...paper.authors]
          : [
              {
                authorName: "",
                authorEmail: "",
                authorAddress: "",
                authorCity: "",
                authorInstitution: "",
                authorPhone: "",
              },
            ],
      );
      setReviewers(paper.reviewers || []);
      setPdfFileName(paper.paperFileName || "");
    } else {
      resetForm();
    }
  }, [paper, isEditMode]);

  useEffect(() => {
    if (isEditMode && originalData) {
      const changed = JSON.stringify(formData) !== JSON.stringify(originalData);
      setHasChanges(changed);
    }
  }, [formData, originalData, isEditMode]);

  const resetForm = () => {
    setFormData({
      uniqueId: "",
      paperTitle: "",
      titleSubject: "",
      paperType: "",
      date: "",
      tentativeDateOfPublication: "",
      websiteUpdateDate: "",
      hardcopyDate: "",
      status: "Draft",
      remarks: "",
    });
    setAuthors([
      {
        authorName: "",
        authorEmail: "",
        authorAddress: "",
        authorCity: "",
        authorInstitution: "",
        authorPhone: "",
      },
    ]);
    setReviewers([]);
    setPdfFile(null);
    setPdfFileName("");
    setError("");
    setSuccess("");
    setFieldErrors({});
    setHasChanges(false);
  };

  const validateForm = () => {
    const errors = {};
    if (!formData.uniqueId.trim()) errors.uniqueId = "Unique ID is required";
    if (!formData.paperTitle.trim())
      errors.paperTitle = "Paper title is required";
    if (!formData.titleSubject.trim())
      errors.titleSubject = "Title subject is required";
    if (!formData.paperType) errors.paperType = "Paper type is required";
    if (!formData.date) errors.date = "Submission date is required";

    const validAuthors = authors.filter((a) => a.authorName.trim());
    if (validAuthors.length === 0)
      errors.authors = "At least one author is required";
    if (!isEditMode && !pdfFile)
      errors.pdfFile = "PDF file is required for new submissions";

    setFieldErrors(errors);
    return Object.keys(errors).length === 0;
  };

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value })); 
    if (fieldErrors[name]) setFieldErrors((prev) => ({ ...prev, [name]: "" }));
  };

  const handleAuthorChange = (index, field, value) => {
    const newAuthors = [...authors];
    newAuthors[index][field] = value;
    setAuthors(newAuthors);
    if (fieldErrors.authors)
      setFieldErrors((prev) => ({ ...prev, authors: "" }));
  };

  const addAuthor = () => {
    setAuthors([
      ...authors,
      {
        authorName: "",
        authorEmail: "",
        authorAddress: "",
        authorCity: "",
        authorInstitution: "",
        authorPhone: "",
      },
    ]);
  };

  const removeAuthor = (index) => {
    if (authors.length > 1) setAuthors(authors.filter((_, i) => i !== index));
  };

  const handleReviewerChange = (index, field, value) => {
    const newReviewers = [...reviewers];
    newReviewers[index][field] = value;
    setReviewers(newReviewers);
  };

  const addReviewer = () => {
    if (reviewers.length < 3) {
      setReviewers([
        ...reviewers,
        {
          reviewerNumber: reviewers.length + 1,
          reviewerName: "",
          reviewerEmail: "",
          emailSent: false,
        },
      ]);
    }
  };

  const removeReviewer = async (index) => {
    const reviewer = reviewers[index];
    if (isEditMode && reviewer._id) {
      try {
        const response = await fetch(
          `${API_BASE_URL}/${paper._id}/reviewers/${reviewer._id}`,
          { method: "DELETE" },
        );
        if (!response.ok) {
          const data = await response.json();
          throw new Error(data.message || "Failed to delete reviewer");
        }
      } catch (err) {
        setError(err.message);
        return;
      }
    }
    setReviewers(reviewers.filter((_, i) => i !== index));
  };

  const handleFileChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      if (file.type !== "application/pdf") {
        setError("Only PDF files are allowed");
        setFieldErrors((prev) => ({
          ...prev,
          pdfFile: "Only PDF files are allowed",
        }));
        return;
      }
      if (file.size > 10 * 1024 * 1024) {
        setError("File size must be less than 10MB");
        setFieldErrors((prev) => ({
          ...prev,
          pdfFile: "File size must be less than 10MB",
        }));
        return;
      }
      setPdfFile(file);
      setPdfFileName(file.name);
      setError("");
      setFieldErrors((prev) => ({ ...prev, pdfFile: "" }));
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!validateForm()) {
      setError("Please fix the errors before submitting");
      return;
    }
    setLoading(true);
    setError("");
    setSuccess("");
    try {
      if (isEditMode) await handleUpdate();
      else await handleCreate();
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  const handleCreate = async () => {
    const formDataToSend = new FormData();
    Object.keys(formData).forEach((key) => {
      if (formData[key]) formDataToSend.append(key, formData[key]);
    });

    const validAuthors = authors.filter((a) => a.authorName.trim());
    validAuthors.forEach((author, index) => {
      Object.keys(author).forEach((key) => {
        if (author[key])
          formDataToSend.append(`authors[${index}][${key}]`, author[key]);
      });
    });

    if (pdfFile) formDataToSend.append("paperFile", pdfFile);

    const response = await fetch(API_BASE_URL, {
      method: "POST",
      body: formDataToSend,
    });
    const data = await response.json();
    if (!response.ok) throw new Error(data.message || "Failed to create paper");

    if (reviewers.length > 0) {
      const paperId = data.data._id;
      for (const reviewer of reviewers) {
        if (reviewer.reviewerName && reviewer.reviewerEmail) {
          try {
            await fetch(`${API_BASE_URL}/${paperId}/reviewers`, {
              method: "POST",
              headers: { "Content-Type": "application/json" },
              body: JSON.stringify({
                reviewerNumber: reviewer.reviewerNumber,
                reviewerName: reviewer.reviewerName,
                reviewerEmail: reviewer.reviewerEmail,
              }),
            });
          } catch (err) {
            console.error("Error adding reviewer:", err);
          }
        }
      }
    }

    setSuccess("Paper created successfully!");
    setTimeout(() => {
      onClose(true);
      resetForm();
    }, 1500);
  };

  const handleUpdate = async () => {
    const updates = {};
    Object.keys(formData).forEach((key) => {
      if (formData[key] !== originalData[key]) updates[key] = formData[key];
    });
    updates.authors = authors.filter((a) => a.authorName.trim());

    if (Object.keys(updates).length === 0 && !pdfFile) {
      setError("No changes detected");
      return;
    }

    const response = await fetch(`${API_BASE_URL}/${paper._id}`, {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(updates),
    });

    const data = await response.json();
    if (!response.ok) throw new Error(data.message || "Failed to update paper");

    if (pdfFile) {
      const pdfFormData = new FormData();
      pdfFormData.append("paperFile", pdfFile);
      await fetch(`${API_BASE_URL}/${paper._id}/upload-pdf`, {
        method: "POST",
        body: pdfFormData,
      });
    }

    for (const reviewer of reviewers) {
      if (!reviewer._id && reviewer.reviewerName && reviewer.reviewerEmail) {
        try {
          await fetch(`${API_BASE_URL}/${paper._id}/reviewers`, {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({
              reviewerNumber: reviewer.reviewerNumber,
              reviewerName: reviewer.reviewerName,
              reviewerEmail: reviewer.reviewerEmail,
            }),
          });
        } catch (err) {
          console.error("Error adding new reviewer:", err);
        }
      }
    }

    setSuccess("Paper updated successfully!");
    setTimeout(() => onClose(true), 1500);
  };

  const openEmailPreview = (reviewer) => {
    setSelectedReviewer(reviewer);
    setEmailModalOpen(true);
  };

  const handleEmailSent = (reviewerNumber) => {
    const newReviewers = [...reviewers];
    const index = newReviewers.findIndex(
      (r) => r.reviewerNumber === reviewerNumber,
    );
    if (index !== -1) {
      newReviewers[index].emailSent = true;
      newReviewers[index].emailSentDate = new Date();
      setReviewers(newReviewers);
    }
  };

  return (
    <div className="fixed inset-0 bg-black/30 backdrop-blur-sm flex items-center justify-center z-50 p-4 overflow-y-auto">
      <div className="bg-white rounded-lg shadow-2xl max-w-6xl w-full my-8 max-h-[90vh] overflow-hidden flex flex-col">
        {/* Header */}
        <div className="bg-white border-b border-gray-200 px-6 py-4 flex-shrink-0">
          <div className="flex items-start justify-between">
            <div>
              <h2 className="text-2xl font-bold text-gray-900">
                {isEditMode
                  ? "Edit AJMT Paper"
                  : "New Research Paper Entry"}
              </h2>
              <p className="text-sm text-gray-500 mt-1 tracking-wide">
                Research Management System
              </p>
              {isEditMode && hasChanges && (
                <p className="text-xs text-orange-600 mt-1 flex items-center">
                  <AlertCircle size={12} className="mr-1" />
                  You have unsaved changes
                </p>
              )}
            </div>
            <button
              onClick={() => onClose(false)}
              className="text-gray-400 hover:text-gray-600 transition"
            >
              <X size={24} />
            </button>
          </div>
        </div>

        {/* Tabs */}
        <div className="border-b border-gray-200 bg-gray-50 px-6 flex-shrink-0">
          <div className="flex space-x-8">
            {["basic", "authors", "reviewers"].map((tab) => (
              <button
                key={tab}
                onClick={() => setActiveTab(tab)}
                className={`py-3 border-b-2 font-medium text-sm transition ${
                  activeTab === tab
                    ? "border-emerald-600 text-emerald-600"
                    : "border-transparent text-gray-600 hover:text-gray-800"
                }`}
              >
                {tab === "basic" && "Basic Information"}
                {tab === "authors" &&
                  `Authors (${authors.filter((a) => a.authorName.trim()).length})`}
                {tab === "reviewers" &&
                  `Reviewers & Reviews (${reviewers.length}/3)`}
              </button>
            ))}
          </div>
        </div>

        {/* Content */}
        <div className="flex-1 overflow-y-auto p-6">
          {error && (
            <div className="mb-4 bg-red-50 border border-red-200 text-red-800 px-4 py-3 rounded flex items-start">
              <AlertCircle size={18} className="mr-2 mt-0.5 flex-shrink-0" />
              <div>{error}</div>
            </div>
          )}
          {success && (
            <div className="mb-4 bg-green-50 border border-green-200 text-green-800 px-4 py-3 rounded flex items-center">
              <Check className="mr-2" size={18} />
              {success}
            </div>
          )}

          <form onSubmit={handleSubmit}>
            {/* BASIC INFO TAB */}
            {activeTab === "basic" && (
              <div className="space-y-6">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Unique ID <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="text"
                    name="uniqueId"
                    value={formData.uniqueId}
                    onChange={handleInputChange}
                    disabled={isEditMode}
                    className={`w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-emerald-500 uppercase ${
                      isEditMode ? "bg-gray-100 cursor-not-allowed" : ""
                    } ${fieldErrors.uniqueId ? "border-red-500" : "border-gray-300"}`}
                    placeholder="e.g., AJMT2024-001"
                  />
                  {fieldErrors.uniqueId && (
                    <p className="mt-1 text-sm text-red-600">
                      {fieldErrors.uniqueId}
                    </p>
                  )}
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Paper Title <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="text"
                    name="paperTitle"
                    value={formData.paperTitle}
                    onChange={handleInputChange}
                    className={`w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-emerald-500 ${
                      fieldErrors.paperTitle
                        ? "border-red-500"
                        : "border-gray-300"
                    }`}
                    placeholder="Enter the full title of the research paper"
                  />
                  {fieldErrors.paperTitle && (
                    <p className="mt-1 text-sm text-red-600">
                      {fieldErrors.paperTitle}
                    </p>
                  )}
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Title Subject <span className="text-red-500">*</span>
                    </label>
                    <input
                      type="text"
                      name="titleSubject"
                      value={formData.titleSubject}
                      onChange={handleInputChange}
                      className={`w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-emerald-500 ${
                        fieldErrors.titleSubject
                          ? "border-red-500"
                          : "border-gray-300"
                      }`}
                      placeholder="Subject area"
                    />
                    {fieldErrors.titleSubject && (
                      <p className="mt-1 text-sm text-red-600">
                        {fieldErrors.titleSubject}
                      </p>
                    )}
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Paper Type <span className="text-red-500">*</span>
                    </label>
                    <select
                      name="paperType"
                      value={formData.paperType}
                      onChange={handleInputChange}
                      className={`w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-emerald-500 ${
                        fieldErrors.paperType
                          ? "border-red-500"
                          : "border-gray-300"
                      }`}
                    >
                      <option value="">Select type</option>
                      <option value="Research Paper">Research Paper</option>
                      <option value="Review Article">Review Article</option>
                      <option value="Case Study">Case Study</option>
                      <option value="Technical Paper">Technical Paper</option>
                    </select>
                    {fieldErrors.paperType && (
                      <p className="mt-1 text-sm text-red-600">
                        {fieldErrors.paperType}
                      </p>
                    )}
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Research Paper PDF{" "}
                    {!isEditMode && <span className="text-red-500">*</span>}
                  </label>
                  <label className="cursor-pointer block">
                    <div
                      className={`border-2 border-dashed rounded-lg px-6 py-8 text-center hover:border-emerald-400 transition ${
                        fieldErrors.pdfFile
                          ? "border-red-500 bg-red-50"
                          : "border-gray-300"
                      }`}
                    >
                      <Upload
                        className="mx-auto text-gray-400 mb-2"
                        size={32}
                      />
                      <p className="text-gray-600 font-medium">
                        {pdfFileName || "Click to select PDF"}
                      </p>
                      <p className="text-xs text-gray-400 mt-1">
                        Maximum file size: 10MB
                      </p>
                    </div>
                    <input
                      type="file"
                      accept=".pdf"
                      onChange={handleFileChange}
                      className="hidden"
                    />
                  </label>
                  {fieldErrors.pdfFile && (
                    <p className="mt-1 text-sm text-red-600">
                      {fieldErrors.pdfFile}
                    </p>
                  )}
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Submission Date <span className="text-red-500">*</span>
                    </label>
                    <input
                      type="date"
                      name="date"
                      value={formData.date}
                      onChange={handleInputChange}
                      className={`w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-emerald-500 ${
                        fieldErrors.date ? "border-red-500" : "border-gray-300"
                      }`}
                    />
                    {fieldErrors.date && (
                      <p className="mt-1 text-sm text-red-600">
                        {fieldErrors.date}
                      </p>
                    )}
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Tentative Pub. Date
                    </label>
                    <input
                      type="date"
                      name="tentativeDateOfPublication"
                      value={formData.tentativeDateOfPublication}
                      onChange={handleInputChange}
                      className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-emerald-500"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Website Update Date
                    </label>
                    <input
                      type="date"
                      name="websiteUpdateDate"
                      value={formData.websiteUpdateDate}
                      onChange={handleInputChange}
                      className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-emerald-500"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Hardcopy Date
                    </label>
                    <input
                      type="date"
                      name="hardcopyDate"
                      value={formData.hardcopyDate}
                      onChange={handleInputChange}
                      className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-emerald-500"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Plagiarism Percentage (%)
                  </label>
                  <input
                    type="number"
                    name="plagiarismPercentage"
                    value={formData.plagiarismPercentage}
                    onChange={handleInputChange}
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-emerald-500"
                    placeholder="Enter percentage (e.g. 15)"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Status
                  </label>
                  <select
                    name="status"
                    value={formData.status}
                    onChange={handleInputChange}
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-emerald-500"
                  >
                    <option value="Draft">Draft</option>
                    <option value="Under Review">Under Review</option>
                    <option value="Accepted">Accepted</option>
                    <option value="Rejected">Rejected</option>
                    <option value="Published">Published</option>
                  </select>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Remarks
                  </label>
                  <textarea
                    name="remarks"
                    value={formData.remarks}
                    onChange={handleInputChange}
                    rows={4}
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-emerald-500"
                    placeholder="Any additional notes..."
                  />
                </div>
              </div>
            )}
            {/* AUTHORS TAB */}
            {activeTab === "authors" && (
              <div className="space-y-6">
                <div className="flex items-center justify-between mb-4">
                  <h3 className="text-lg font-semibold text-gray-900">
                    Authors ({authors.filter((a) => a.authorName.trim()).length}
                    )
                  </h3>
                  <button
                    type="button"
                    onClick={addAuthor}
                    className="text-sm text-emerald-600 hover:text-emerald-700 font-medium flex items-center"
                  >
                    <Plus size={16} className="mr-1" />
                    Add Author
                  </button>
                </div>

                {fieldErrors.authors && (
                  <div className="bg-red-50 border border-red-200 text-red-800 px-4 py-3 rounded">
                    {fieldErrors.authors}
                  </div>
                )}

                <div className="space-y-4">
                  {authors.map((author, index) => (
                    <div
                      key={index}
                      className="border border-gray-200 rounded-lg p-4 bg-gray-50"
                    >
                      <div className="flex justify-between items-center mb-3">
                        <span className="text-sm font-semibold text-gray-700">
                          Author {index + 1}
                        </span>
                        {authors.length > 1 && (
                          <button
                            type="button"
                            onClick={() => removeAuthor(index)}
                            className="text-red-500 hover:text-red-700"
                          >
                            <Trash2 size={16} />
                          </button>
                        )}
                      </div>

                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div>
                          <label className="block text-xs font-medium text-gray-600 mb-1">
                            Name <span className="text-red-500">*</span>
                          </label>
                          <input
                            type="text"
                            value={author.authorName}
                            onChange={(e) =>
                              handleAuthorChange(
                                index,
                                "authorName",
                                e.target.value,
                              )
                            }
                            className="w-full px-3 py-2 border border-gray-300 rounded focus:ring-1 focus:ring-emerald-500 focus:border-emerald-500 text-sm"
                            placeholder="Author Name"
                          />
                        </div>

                        <div>
                          <label className="block text-xs font-medium text-gray-600 mb-1">
                            Email
                          </label>
                          <input
                            type="email"
                            value={author.authorEmail}
                            onChange={(e) =>
                              handleAuthorChange(
                                index,
                                "authorEmail",
                                e.target.value,
                              )
                            }
                            className="w-full px-3 py-2 border border-gray-300 rounded focus:ring-1 focus:ring-emerald-500 focus:border-emerald-500 text-sm"
                            placeholder="Author Email"
                          />
                        </div>

                        <div>
                          <label className="block text-xs font-medium text-gray-600 mb-1">
                            Institution
                          </label>
                          <input
                            type="text"
                            value={author.authorInstitution}
                            onChange={(e) =>
                              handleAuthorChange(
                                index,
                                "authorInstitution",
                                e.target.value,
                              )
                            }
                            className="w-full px-3 py-2 border border-gray-300 rounded focus:ring-1 focus:ring-emerald-500 focus:border-emerald-500 text-sm"
                            placeholder="University Name"
                          />
                        </div>

                        <div>
                          <label className="block text-xs font-medium text-gray-600 mb-1">
                            City
                          </label>
                          <input
                            type="text"
                            value={author.authorCity}
                            onChange={(e) =>
                              handleAuthorChange(
                                index,
                                "authorCity",
                                e.target.value,
                              )
                            }
                            className="w-full px-3 py-2 border border-gray-300 rounded focus:ring-1 focus:ring-emerald-500 focus:border-emerald-500 text-sm"
                            placeholder="City Name"
                          />
                        </div>

                        <div>
                          <label className="block text-xs font-medium text-gray-600 mb-1">
                            Address
                          </label>
                          <input
                            type="text"
                            value={author.authorAddress}
                            onChange={(e) =>
                              handleAuthorChange(
                                index,
                                "authorAddress",
                                e.target.value,
                              )
                            }
                            className="w-full px-3 py-2 border border-gray-300 rounded focus:ring-1 focus:ring-emerald-500 focus:border-emerald-500 text-sm"
                            placeholder="Full Address"
                          />
                        </div>

                        <div>
                          <label className="block text-xs font-medium text-gray-600 mb-1">
                            Phone
                          </label>
                          <input
                            type="text"
                            value={author.authorPhone}
                            onChange={(e) =>
                              handleAuthorChange(
                                index,
                                "authorPhone",
                                e.target.value,
                              )
                            }
                            className="w-full px-3 py-2 border border-gray-300 rounded focus:ring-1 focus:ring-emerald-500 focus:border-emerald-500 text-sm"
                            placeholder="Phone No"
                          />
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}
            {/* REVIEWERS TAB */}
            {activeTab === "reviewers" && (
              <div className="space-y-6">
                <div className="flex items-center justify-between mb-4">
                  <h3 className="text-lg font-semibold text-gray-900">
                    Reviewers ({reviewers.length}/3)
                  </h3>
                  {reviewers.length < 3 && (
                    <button
                      type="button"
                      onClick={addReviewer}
                      className="text-sm text-emerald-600 hover:text-emerald-700 font-medium flex items-center"
                    >
                      <Plus size={16} className="mr-1" />
                      Add Reviewer
                    </button>
                  )}
                </div>

                {!isEditMode && (
                  <div className="bg-yellow-50 border border-yellow-200 text-yellow-800 px-4 py-3 rounded-lg text-sm">
                    💡 Save the paper first before sending emails to reviewers
                  </div>
                )}

                <div className="space-y-4">
                  {reviewers.map((reviewer, index) => (
                    <div
                      key={index}
                      className="border border-gray-200 rounded-lg p-4 bg-gray-50"
                    >
                      <div className="flex justify-between items-center mb-3">
                        <div className="flex items-center gap-2">
                          <span className="text-sm font-semibold text-gray-700">
                            Reviewer {reviewer.reviewerNumber}
                          </span>
                          {reviewer.emailSent && (
                            <span className="text-xs bg-green-100 text-green-700 px-2 py-1 rounded">
                              ✓ Email Sent
                            </span>
                          )}
                          {reviewer.reviews && reviewer.reviews.length > 0 && (
                            <span className="text-xs bg-purple-100 text-purple-700 px-2 py-1 rounded">
                              {reviewer.reviews.length} Review
                            </span>
                          )}
                        </div>
                        <button
                          type="button"
                          onClick={() => removeReviewer(index)}
                          className="text-red-500 hover:text-red-700"
                        >
                          <Trash2 size={16} />
                        </button>
                      </div>

                      <div className="grid grid-cols-1 md:grid-cols-2 gap-3 mb-3">
                        <div>
                          <label className="block text-xs font-medium text-gray-600 mb-1">
                            Name <span className="text-red-500">*</span>
                          </label>
                          <input
                            type="text"
                            value={reviewer.reviewerName}
                            onChange={(e) =>
                              handleReviewerChange(
                                index,
                                "reviewerName",
                                e.target.value,
                              )
                            }
                            className="w-full px-3 py-2 border border-gray-300 rounded focus:ring-1 focus:ring-emerald-500 focus:border-emerald-500 text-sm"
                            placeholder="Reviewer Name"
                          />
                        </div>

                        <div>
                          <label className="block text-xs font-medium text-gray-600 mb-1">
                            Email <span className="text-red-500">*</span>
                          </label>
                          <input
                            type="email"
                            value={reviewer.reviewerEmail}
                            onChange={(e) =>
                              handleReviewerChange(
                                index,
                                "reviewerEmail",
                                e.target.value,
                              )
                            }
                            className="w-full px-3 py-2 border border-gray-300 rounded focus:ring-1 focus:ring-emerald-500 focus:border-emerald-500 text-sm"
                            placeholder="Reviewer Email"
                          />
                        </div>
                      </div>

                      {/* Action Buttons */}
                      {isEditMode && paper && (
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-2">
                          {/* Send Email Button */}
                          <button
                            type="button"
                            onClick={() => openEmailPreview(reviewer)}
                            disabled={
                              !reviewer.reviewerName || !reviewer.reviewerEmail
                            }
                            className="flex items-center justify-center py-2 px-4 rounded font-medium text-sm transition border-2 border-emerald-600 text-emerald-600 hover:bg-emerald-50 disabled:opacity-50 disabled:cursor-not-allowed"
                          >
                            {reviewer.emailSent ? (
                              <>
                                <Check className="mr-2" size={16} />
                                Email Sent
                              </>
                            ) : (
                              <>
                                <Eye className="mr-2" size={16} />
                                Preview & Send Email
                              </>
                            )}
                          </button>
                        </div>
                      )}

                      {!isEditMode &&
                        reviewer.reviewerName &&
                        reviewer.reviewerEmail && (
                          <div className="text-xs text-gray-500 italic">
                            Save the paper to enable email and review features
                          </div>
                        )}
                    </div>
                  ))}

                  {reviewers.length === 0 && (
                    <div className="text-center py-8 text-gray-500">
                      <Mail size={48} className="mx-auto mb-2 text-gray-400" />
                      <p>No reviewers added yet</p>
                      <p className="text-sm">
                        Click "Add Reviewer" to get started
                      </p>
                    </div>
                  )}
                </div>
              </div>
            )}
          </form>
        </div>

        {/* FOOTER */}
        <div className="border-t border-gray-200 px-6 py-4 bg-gray-50 flex justify-between items-center flex-shrink-0">
          <button
            type="button"
            onClick={() => onClose(false)}
            disabled={loading}
            className="px-6 py-2 border border-gray-300 text-gray-700 rounded hover:bg-gray-100 transition uppercase text-sm font-medium disabled:opacity-50 disabled:cursor-not-allowed"
          >
            Discard
          </button>
          <button
            type="submit"
            onClick={handleSubmit}
            disabled={loading}
            className="bg-emerald-600 text-white px-8 py-2 rounded hover:bg-emerald-700 transition disabled:bg-emerald-300 disabled:cursor-not-allowed flex items-center text-sm font-medium"
          >
            {loading ? (
              <>
                <Loader2 className="mr-2 animate-spin" size={18} />
                Saving...
              </>
            ) : (
              "Save AJMT Paper"
            )}
          </button>
        </div>
      </div>

      {/* Email Preview Modal */}
      {selectedReviewer && (
        <EmailPreviewModal
          isOpen={emailModalOpen}
          onClose={() => {
            setEmailModalOpen(false);
            setSelectedReviewer(null);
          }}
          reviewer={selectedReviewer}
          paperId={paper?._id}
          paperTitle={formData.paperTitle}
          paperSubject={formData.titleSubject}
          authorNames={authors
            .map((a) => a.authorName)
            .filter(Boolean)
            .join(", ")}
          onEmailSent={handleEmailSent}
        />
      )}
    </div>
  );
};

export default AJMTPaperModal;
