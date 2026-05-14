import React, { useState, useEffect } from 'react';
import { X, Save, AlertCircle, Check } from 'lucide-react';
import api from "../utils/api";

const ReviewModal = ({ isOpen, onClose, reviewer, paperId, onReviewAdded }) => {
  const [formData, setFormData] = useState({
    plagiarismPercentage: '',
    sentDate: '',
    remarks: ''
  });

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [fieldErrors, setFieldErrors] = useState({});



  // const API_BASE_URL = 'http://localhost:5000/api/ajmtpapers';
  const API_BASE_URL = `${import.meta.env.VITE_API_URL}/api/ajmtpapers`;

  // Check if reviewer already has a review
  const hasExistingReview = reviewer?.reviews && reviewer.reviews.length > 0;

  // Reset form when modal opens
  useEffect(() => {
    if (isOpen && reviewer) {
      // Set default date to today
      const today = new Date().toISOString().split('T')[0];
      setFormData({
        plagiarismPercentage: '',
        sentDate: today,
        remarks: ''
      });
      setError('');
      setSuccess('');
      setFieldErrors({});
    }
  }, [isOpen, reviewer]);

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
    
    // Clear field error
    if (fieldErrors[name]) {
      setFieldErrors(prev => ({ ...prev, [name]: '' }));
    }
  };

  const validateForm = () => {
    const errors = {};

    // Plagiarism percentage validation
    if (!formData.plagiarismPercentage && formData.plagiarismPercentage !== 0) {
      errors.plagiarismPercentage = 'Plagiarism percentage is required';
    } else {
      const value = parseFloat(formData.plagiarismPercentage);
      if (isNaN(value)) {
        errors.plagiarismPercentage = 'Must be a valid number';
      } else if (value < 0 || value > 100) {
        errors.plagiarismPercentage = 'Must be between 0 and 100';
      }
    }

    // Date validation
    if (!formData.sentDate) {
      errors.sentDate = 'Review date is required';
    }

    setFieldErrors(errors);
    return Object.keys(errors).length === 0;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    // Check if already has review
    if (hasExistingReview) {
      setError('This reviewer has already submitted a review. Only one review per reviewer is allowed.');
      return;
    }

    if (!validateForm()) {
      setError('Please fix the errors before submitting');
      return;
    }

    setLoading(true);
    setError('');
    setSuccess('');

    try {
      const response = await fetch(
        `${API_BASE_URL}/${paperId}/reviewers/${reviewer._id}/reviews`,
        {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            plagiarismPercentage: parseFloat(formData.plagiarismPercentage),
            sentDate: formData.sentDate,
            remarks: formData.remarks
          })
        }
      );

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.message || 'Failed to add review');
      }

      setSuccess('Review added successfully!');

      // Notify parent component
      if (onReviewAdded) {
        onReviewAdded(data.data);
      }

      // Close after 1.5 seconds
      setTimeout(() => {
        onClose();
      }, 1500);

    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-[60] p-4">
      <div className="bg-white rounded-lg shadow-2xl max-w-2xl w-full overflow-hidden">
        {/* Header */}
        <div className="bg-gradient-to-r from-emerald-600 to-teal-600 text-white px-6 py-4 flex items-center justify-between">
          <div>
            <h2 className="text-xl font-bold">Add Review</h2>
            <p className="text-sm text-emerald-100">
              Reviewer: {reviewer?.reviewerName}
            </p>
          </div>
          <button
            onClick={onClose}
            disabled={loading}
            className="text-white hover:bg-white/20 rounded-full p-2 transition disabled:opacity-50"
          >
            <X size={20} />
          </button>
        </div>

        {/* Content */}
        <form onSubmit={handleSubmit} className="p-6 space-y-6">
          {/* Error/Success Messages */}
          {error && (
            <div className="bg-red-50 border border-red-200 text-red-800 px-4 py-3 rounded-lg flex items-start">
              <AlertCircle size={18} className="mr-2 mt-0.5 flex-shrink-0" />
              <div>{error}</div>
            </div>
          )}

          {success && (
            <div className="bg-green-50 border border-green-200 text-green-800 px-4 py-3 rounded-lg flex items-center">
              <Check className="mr-2" size={18} />
              {success}
            </div>
          )}

          {/* Warning if already has review */}
          {hasExistingReview && (
            <div className="bg-yellow-50 border border-yellow-200 text-yellow-800 px-4 py-3 rounded-lg flex items-start">
              <AlertCircle size={18} className="mr-2 mt-0.5 flex-shrink-0" />
              <div>
                <strong>Note:</strong> This reviewer has already submitted a review. Only one review per reviewer is allowed. You can edit the existing review instead.
              </div>
            </div>
          )}

          {/* Plagiarism Percentage */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Plagiarism Percentage <span className="text-red-500">*</span>
            </label>
            <div className="flex items-center gap-2">
              <input
                type="number"
                name="plagiarismPercentage"
                value={formData.plagiarismPercentage}
                onChange={handleInputChange}
                min="0"
                max="100"
                step="0.1"
                disabled={loading || hasExistingReview}
                className={`flex-1 px-4 py-2 border rounded-lg focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500 disabled:bg-gray-100 disabled:cursor-not-allowed ${
                  fieldErrors.plagiarismPercentage ? 'border-red-500' : 'border-gray-300'
                }`}
                placeholder="e.g., 5.5"
              />
              <span className="text-sm font-medium text-gray-600">%</span>
            </div>
            {fieldErrors.plagiarismPercentage && (
              <p className="mt-1 text-sm text-red-600">{fieldErrors.plagiarismPercentage}</p>
            )}
            <p className="mt-1 text-xs text-gray-500">
              Enter the plagiarism percentage detected (0-100)
            </p>
          </div>

          {/* Review Date */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Review Submission Date <span className="text-red-500">*</span>
            </label>
            <input
              type="date"
              name="sentDate"
              value={formData.sentDate}
              onChange={handleInputChange}
              disabled={loading || hasExistingReview}
              className={`w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500 disabled:bg-gray-100 disabled:cursor-not-allowed ${
                fieldErrors.sentDate ? 'border-red-500' : 'border-gray-300'
              }`}
            />
            {fieldErrors.sentDate && (
              <p className="mt-1 text-sm text-red-600">{fieldErrors.sentDate}</p>
            )}
            <p className="mt-1 text-xs text-gray-500">
              Date when the review was received
            </p>
          </div>

          {/* Remarks */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Reviewer's Remarks
            </label>
            <textarea
              name="remarks"
              value={formData.remarks}
              onChange={handleInputChange}
              disabled={loading || hasExistingReview}
              rows={6}
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500 disabled:bg-gray-100 disabled:cursor-not-allowed"
              placeholder="Enter detailed remarks and feedback from the reviewer..."
            />
            <p className="mt-1 text-xs text-gray-500">
              Include any comments, suggestions, or concerns from the reviewer
            </p>
          </div>

          {/* Info Box */}
          {!hasExistingReview && (
            <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
              <div className="flex items-start">
                <div className="flex-shrink-0">
                  <svg className="h-5 w-5 text-blue-600" fill="currentColor" viewBox="0 0 20 20">
                    <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7-4a1 1 0 11-2 0 1 1 0 012 0zM9 9a1 1 0 000 2v3a1 1 0 001 1h1a1 1 0 100-2v-3a1 1 0 00-1-1H9z" clipRule="evenodd" />
                  </svg>
                </div>
                <div className="ml-3">
                  <h4 className="text-sm font-semibold text-blue-800">One Review Per Reviewer</h4>
                  <p className="text-sm text-blue-700 mt-1">
                    Each reviewer can only submit one review. After saving, you can edit this review if needed, but cannot add additional reviews from the same reviewer.
                  </p>
                </div>
              </div>
            </div>
          )}
        </form>

        {/* Footer */}
        <div className="border-t border-gray-200 px-6 py-4 bg-gray-50 flex justify-between items-center">
          <button
            type="button"
            onClick={onClose}
            disabled={loading}
            className="px-6 py-2.5 border-2 border-gray-300 text-gray-700 rounded-lg hover:bg-gray-100 transition font-medium disabled:opacity-50 disabled:cursor-not-allowed"
          >
            Cancel
          </button>
          <button
            type="submit"
            onClick={handleSubmit}
            disabled={loading || hasExistingReview}
            className="bg-gradient-to-r from-emerald-600 to-teal-600 text-white px-8 py-2.5 rounded-lg hover:from-emerald-700 hover:to-teal-700 transition font-medium flex items-center shadow-lg disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {loading ? (
              <>
                <div className="animate-spin mr-2 h-4 w-4 border-2 border-white border-t-transparent rounded-full" />
                Saving...
              </>
            ) : (
              <>
                <Save size={18} className="mr-2" />
                Save Review
              </>
            )}
          </button>
        </div>
      </div>
    </div>
  );
};

export default ReviewModal;