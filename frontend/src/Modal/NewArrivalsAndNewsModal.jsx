import React, { useState, useEffect } from 'react';
import { X, Plus, Trash2, Calendar, ExternalLink, Image, Tag, AlertCircle } from 'lucide-react';

const API_BASE_URL = 'http://localhost:5000/api';

const NewArrivalsAndNewsModal = ({ isOpen, onClose, itemToEdit, onSuccess }) => {
  const [formData, setFormData] = useState({
    type: '',
    priority: 'Medium',
    title: '',
    itemType: '',
    authorPublisher: '',
    callNumber: '',
    isbnIssn: '',
    description: '',
    startDate: '',
    endDate: '',
    category: '',
    status: 'Active',
    tagsKeywords: [],
    urlLink: '',
    attachmentImageUrl: '',
    targetAudience: {
      students: false,
      faculty: false,
      staff: false,
      public: false
    },
    remarks: ''
  });

  const [currentTag, setCurrentTag] = useState('');
  const [dropdownOptions, setDropdownOptions] = useState({});
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  useEffect(() => {
    fetchDropdownOptions();
  }, []);

  useEffect(() => {
    if (itemToEdit) {
      setFormData({
        ...itemToEdit,
        startDate: itemToEdit.startDate ? itemToEdit.startDate.split('T')[0] : '',
        endDate: itemToEdit.endDate ? itemToEdit.endDate.split('T')[0] : '',
        tagsKeywords: itemToEdit.tagsKeywords || []
      });
    } else {
      resetForm();
    }
  }, [itemToEdit]);

  const fetchDropdownOptions = async () => {
    try {
      const response = await fetch(`${API_BASE_URL}/options`);
      const data = await response.json();
      setDropdownOptions(data.data);
    } catch (error) {
      console.error('Error fetching options:', error);
    }
  };

  const resetForm = () => {
    setFormData({
      type: '',
      priority: 'Medium',
      title: '',
      itemType: '',
      authorPublisher: '',
      callNumber: '',
      isbnIssn: '',
      description: '',
      startDate: '',
      endDate: '',
      category: '',
      status: 'Active',
      tagsKeywords: [],
      urlLink: '',
      attachmentImageUrl: '',
      targetAudience: {
        students: false,
        faculty: false,
        staff: false,
        public: false
      },
      remarks: ''
    });
    setCurrentTag('');
    setError('');
  };

  const handleInputChange = (e) => {
    const { name, value, type, checked } = e.target;
    
    if (name.startsWith('targetAudience.')) {
      const audienceKey = name.split('.')[1];
      setFormData(prev => ({
        ...prev,
        targetAudience: {
          ...prev.targetAudience,
          [audienceKey]: checked
        }
      }));
    } else {
      setFormData(prev => ({
        ...prev,
        [name]: value
      }));
    }
  };

  const handleAddTag = () => {
    if (currentTag.trim() && !formData.tagsKeywords.includes(currentTag.trim())) {
      setFormData(prev => ({
        ...prev,
        tagsKeywords: [...prev.tagsKeywords, currentTag.trim()]
      }));
      setCurrentTag('');
    }
  };

  const handleRemoveTag = (tagToRemove) => {
    setFormData(prev => ({
      ...prev,
      tagsKeywords: prev.tagsKeywords.filter(tag => tag !== tagToRemove)
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError('');

    try {
      const url = itemToEdit 
        ? `${API_BASE_URL}/arrivals-news/${itemToEdit._id}`
        : `${API_BASE_URL}/arrivals-news`;
      
      const method = itemToEdit ? 'PUT' : 'POST';

      const response = await fetch(url, {
        method,
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(formData)
      });

      const data = await response.json();

      if (data.success) {
        onSuccess();
        onClose();
        resetForm();
      } else {
        setError(data.message || 'Failed to save item');
      }
    } catch (error) {
      setError('Error saving item: ' + error.message);
    } finally {
      setLoading(false);
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/40 backdrop-blur-sm p-4">
      <div className="bg-white rounded-lg shadow-2xl w-full max-w-5xl max-h-[90vh] overflow-y-auto">
        

        <form onSubmit={handleSubmit} className="p-6">
          {/* Section 1: Basic Information */}
          <div className="mb-8">
            <div className="flex justify-between items-center py-5 border-b">
                      <div>
                        <h2 className="text-xl font-bold text-slate-800">New Arrival or News Item</h2>
                        <p className="text-xs text-slate-500 uppercase tracking-widest font-semibold mt-1">Manage Library Updates & Announcements</p>
                      </div>
                      <button onClick={onClose} className="text-slate-400 hover:text-slate-600 transition-colors"><X size={24} /></button>
                    </div>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1 mt-4">
                  Type
                </label>
                <select
                  name="type"
                  value={formData.type}
                  onChange={handleInputChange}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                >
                  <option value="">Select Type</option>
                  {dropdownOptions.arrivalsNewsTypes?.map(type => (
                    <option key={type} value={type}>{type}</option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1 mt-4">
                  Priority
                </label>
                <select
                  name="priority"
                  value={formData.priority}
                  onChange={handleInputChange}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                >
                  {dropdownOptions.priorities?.map(priority => (
                    <option key={priority} value={priority}>{priority}</option>
                  ))}
                </select>
              </div>

              <div className="md:col-span-2">
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Title
                </label>
                <input
                  type="text"
                  name="title"
                  value={formData.title}
                  onChange={handleInputChange}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  placeholder="Enter title"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Item Type
                </label>
                <select
                  name="itemType"
                  value={formData.itemType}
                  onChange={handleInputChange}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                >
                  <option value="">Select Item Type</option>
                  {dropdownOptions.itemTypes?.map(type => (
                    <option key={type} value={type}>{type}</option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Category
                </label>
                <select
                  name="category"
                  value={formData.category}
                  onChange={handleInputChange}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                >
                  <option value="">Select Category</option>
                  {dropdownOptions.newsCategories?.map(cat => (
                    <option key={cat} value={cat}>{cat}</option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Status
                </label>
                <select
                  name="status"
                  value={formData.status}
                  onChange={handleInputChange}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                >
                  {dropdownOptions.newsStatuses?.map(status => (
                    <option key={status} value={status}>{status}</option>
                  ))}
                </select>
              </div>
            </div>
          </div>

          {/* Section 2: Item Details */}
          <div className="mb-8">
            <h3 className="text-xl font-semibold text-gray-800 mb-4 pb-2 border-b-2 border-green-500">
              Item Details
            </h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="md:col-span-2">
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Author/Publisher
                </label>
                <input
                  type="text"
                  name="authorPublisher"
                  value={formData.authorPublisher}
                  onChange={handleInputChange}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  placeholder="Enter author or publisher name"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Call Number
                </label>
                <input
                  type="text"
                  name="callNumber"
                  value={formData.callNumber}
                  onChange={handleInputChange}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  placeholder="e.g., 629.2 SMI 2024"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  ISBN/ISSN
                </label>
                <input
                  type="text"
                  name="isbnIssn"
                  value={formData.isbnIssn}
                  onChange={handleInputChange}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  placeholder="e.g., ISBN 978-0-123-45678-9"
                />
              </div>

              <div className="md:col-span-2">
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Description
                </label>
                <textarea
                  name="description"
                  value={formData.description}
                  onChange={handleInputChange}
                  rows="4"
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  placeholder="Enter detailed description"
                />
              </div>
            </div>
          </div>

          {/* Section 3: Dates & Duration */}
          <div className="mb-8">
            <h3 className="text-xl font-semibold text-gray-800 mb-4 pb-2 border-b-2 border-purple-500 flex items-center">
              <Calendar className="mr-2" size={20} />
              Dates & Duration
            </h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Start Date
                </label>
                <input
                  type="date"
                  name="startDate"
                  value={formData.startDate}
                  onChange={handleInputChange}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  End Date
                </label>
                <input
                  type="date"
                  name="endDate"
                  value={formData.endDate}
                  onChange={handleInputChange}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                />
              </div>
            </div>
          </div>

          {/* Section 4: Tags & Keywords */}
          <div className="mb-8">
            <h3 className="text-xl font-semibold text-gray-800 mb-4 pb-2 border-b-2 border-orange-500 flex items-center">
              <Tag className="mr-2" size={20} />
              Tags & Keywords
            </h3>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Add Tags/Keywords
              </label>
              <div className="flex gap-2 mb-3">
                <input
                  type="text"
                  value={currentTag}
                  onChange={(e) => setCurrentTag(e.target.value)}
                  onKeyPress={(e) => e.key === 'Enter' && (e.preventDefault(), handleAddTag())}
                  className="flex-1 px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  placeholder="Enter tag and click + to add"
                />
                <button
                  type="button"
                  onClick={handleAddTag}
                  className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition flex items-center"
                >
                  <Plus size={20} />
                </button>
              </div>
              <div className="flex flex-wrap gap-2">
                {formData.tagsKeywords.map((tag, index) => (
                  <span
                    key={index}
                    className="bg-blue-100 text-blue-800 px-3 py-1 rounded-full text-sm flex items-center gap-2"
                  >
                    {tag}
                    <button
                      type="button"
                      onClick={() => handleRemoveTag(tag)}
                      className="text-blue-600 hover:text-blue-800"
                    >
                      <X size={16} />
                    </button>
                  </span>
                ))}
              </div>
            </div>
          </div>

          {/* Section 5: Links & Attachments */}
          <div className="mb-8">
            <h3 className="text-xl font-semibold text-gray-800 mb-4 pb-2 border-b-2 border-indigo-500 flex items-center">
              <ExternalLink className="mr-2" size={20} />
              Links & Attachments
            </h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  URL/Link
                </label>
                <input
                  type="url"
                  name="urlLink"
                  value={formData.urlLink}
                  onChange={handleInputChange}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  placeholder="https://example.com"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1 flex items-center">
                  <Image className="mr-1" size={16} />
                  Attachment/Image URL
                </label>
                <input
                  type="url"
                  name="attachmentImageUrl"
                  value={formData.attachmentImageUrl}
                  onChange={handleInputChange}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  placeholder="https://example.com/image.jpg"
                />
              </div>
            </div>
          </div>

          {/* Section 6: Target Audience */}
          <div className="mb-8">
            <h3 className="text-xl font-semibold text-gray-800 mb-4 pb-2 border-b-2 border-pink-500">
              Target Audience
            </h3>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              {['students', 'faculty', 'staff', 'public'].map((audience) => (
                <label key={audience} className="flex items-center space-x-2 cursor-pointer">
                  <input
                    type="checkbox"
                    name={`targetAudience.${audience}`}
                    checked={formData.targetAudience[audience]}
                    onChange={handleInputChange}
                    className="w-5 h-5 text-blue-600 rounded focus:ring-2 focus:ring-blue-500"
                  />
                  <span className="text-sm font-medium text-gray-700 capitalize">
                    {audience}
                  </span>
                </label>
              ))}
            </div>
          </div>

          {/* Section 7: Remarks */}
          <div className="mb-8">
            <h3 className="text-xl font-semibold text-gray-800 mb-4 pb-2 border-b-2 border-yellow-500">
              Additional Information
            </h3>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Remarks
              </label>
              <textarea
                name="remarks"
                value={formData.remarks}
                onChange={handleInputChange}
                rows="3"
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                placeholder="Enter any additional remarks or notes"
              />
            </div>
          </div>

          {/* Action Buttons */}
          <div className="flex justify-end gap-3 pt-6 border-t border-gray-200">
            <button
              type="button"
              onClick={onClose}
              className="px-6 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={loading}
              className="px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {loading ? 'Saving...' : (itemToEdit ? 'Update Item' : 'Create Item')}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default NewArrivalsAndNewsModal;