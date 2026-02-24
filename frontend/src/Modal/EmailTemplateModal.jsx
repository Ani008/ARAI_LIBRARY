import React, { useState } from 'react';
import { X, Mail, Edit2, Send } from 'lucide-react';

const EmailTemplateModal = ({ isOpen, onClose, onSend, reviewerName, paperTitle, paperSubject, authorNames }) => {
  const [emailSubject, setEmailSubject] = useState(
    `Research Paper Review Request: ${paperTitle}`
  );

  const [emailBody, setEmailBody] = useState(`Dear ${reviewerName},

We hope this email finds you well. We are writing to request your expertise in reviewing a research paper submitted to our journal.

Paper Details:
• Title: ${paperTitle}
• Subject: ${paperSubject}
• Author(s): ${authorNames}

Please find the research paper attached to this email. We would greatly appreciate your review and feedback on the following aspects:

• Originality and significance of the research
• Methodology and approach
• Quality of analysis and results
• Clarity and organization of the paper
• Plagiarism check and proper citations

We kindly request that you complete your review within 2-3 weeks from the date of this email.

When submitting your review, please include:
1. Overall assessment and recommendation
2. Plagiarism percentage (if detected)
3. Detailed comments and suggestions
4. Any concerns or questions

If you have any questions or need additional information, please do not hesitate to contact us.

Thank you for your time and valuable contribution to academic research.

Best regards,
AJMT Editorial Team
Academic Journal Management Tool`);

  const handleSend = () => {
    onSend({
      subject: emailSubject,
      body: emailBody
    });
    onClose();
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-[60] p-4">
      <div className="bg-white rounded-lg shadow-2xl max-w-4xl w-full max-h-[90vh] overflow-hidden">
        {/* Header */}
        <div className="bg-gradient-to-r from-emerald-600 to-teal-600 text-white px-6 py-4 flex items-center justify-between">
          <div className="flex items-center">
            <Mail className="mr-3" size={24} />
            <div>
              <h2 className="text-xl font-bold">Email Template Preview</h2>
              <p className="text-sm text-emerald-100">Review and edit before sending</p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="text-white hover:bg-white/20 rounded-full p-2 transition"
          >
            <X size={20} />
          </button>
        </div>

        {/* Content */}
        <div className="overflow-y-auto max-h-[calc(90vh-180px)] p-6 space-y-6">
          {/* Subject Line */}
          <div>
            <div className="flex items-center justify-between mb-2">
              <label className="block text-sm font-semibold text-gray-700 uppercase tracking-wide">
                Subject Line
              </label>
              <Edit2 size={16} className="text-emerald-600" />
            </div>
            <input
              type="text"
              value={emailSubject}
              onChange={(e) => setEmailSubject(e.target.value)}
              className="w-full px-4 py-3 border-2 border-gray-300 rounded-lg focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500 font-medium"
            />
          </div>

          {/* Email Body */}
          <div>
            <div className="flex items-center justify-between mb-2">
              <label className="block text-sm font-semibold text-gray-700 uppercase tracking-wide">
                Email Message
              </label>
              <Edit2 size={16} className="text-emerald-600" />
            </div>
            <textarea
              value={emailBody}
              onChange={(e) => setEmailBody(e.target.value)}
              rows={20}
              className="w-full px-4 py-3 border-2 border-gray-300 rounded-lg focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500 font-mono text-sm leading-relaxed"
            />
          </div>

          {/* Instructions */}
          <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
            <div className="flex items-start">
              <div className="flex-shrink-0">
                <svg className="h-5 w-5 text-blue-600" fill="currentColor" viewBox="0 0 20 20">
                  <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7-4a1 1 0 11-2 0 1 1 0 012 0zM9 9a1 1 0 000 2v3a1 1 0 001 1h1a1 1 0 100-2v-3a1 1 0 00-1-1H9z" clipRule="evenodd" />
                </svg>
              </div>
              <div className="ml-3">
                <h4 className="text-sm font-semibold text-blue-800">Edit Template</h4>
                <p className="text-sm text-blue-700 mt-1">
                  You can modify the subject and message above. The PDF will be automatically attached when you send the email.
                </p>
              </div>
            </div>
          </div>

          {/* Preview */}
          <div className="border-2 border-gray-200 rounded-lg p-6 bg-gray-50">
            <h4 className="text-sm font-semibold text-gray-700 uppercase tracking-wide mb-4">
              Email Preview
            </h4>
            <div className="bg-white rounded-lg p-6 shadow-sm">
              <div className="border-b border-gray-200 pb-3 mb-4">
                <div className="text-xs text-gray-500 uppercase font-semibold mb-1">Subject:</div>
                <div className="text-base font-semibold text-gray-900">{emailSubject}</div>
              </div>
              <div className="whitespace-pre-wrap text-sm text-gray-700 leading-relaxed">
                {emailBody}
              </div>
              <div className="mt-6 pt-4 border-t border-gray-200">
                <div className="flex items-center text-xs text-gray-500">
                  <svg className="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15.172 7l-6.586 6.586a2 2 0 102.828 2.828l6.414-6.586a4 4 0 00-5.656-5.656l-6.415 6.585a6 6 0 108.486 8.486L20.5 13" />
                  </svg>
                  Attachment: {paperTitle}.pdf
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Footer */}
        <div className="border-t border-gray-200 px-6 py-4 bg-gray-50 flex justify-between items-center">
          <button
            onClick={onClose}
            className="px-6 py-2.5 border-2 border-gray-300 text-gray-700 rounded-lg hover:bg-gray-100 transition font-medium"
          >
            Cancel
          </button>
          <button
            onClick={handleSend}
            className="bg-gradient-to-r from-emerald-600 to-teal-600 text-white px-8 py-2.5 rounded-lg hover:from-emerald-700 hover:to-teal-700 transition font-medium flex items-center shadow-lg"
          >
            <Send size={18} className="mr-2" />
            Send Email to {reviewerName}
          </button>
        </div>
      </div>
    </div>
  );
};

export default EmailTemplateModal;