import React, { useState } from 'react';
import { X, Mail, Send, Loader2, Check } from 'lucide-react';

const EmailPreviewModal = ({ isOpen, onClose, reviewer, paperId, paperTitle, paperSubject, authorNames, onEmailSent }) => {
  const [emailSubject, setEmailSubject] = useState(
    `Research Paper Review Request: ${paperTitle}`
  );

  const [emailBody, setEmailBody] = useState(`Dear ${reviewer?.reviewerName || 'Reviewer'},

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

  const [sending, setSending] = useState(false);
  const [progress, setProgress] = useState(0);
  const [sent, setSent] = useState(false);
  const [error, setError] = useState('');

  const API_BASE_URL = 'http://localhost:5000/api/ajmtpapers';

  const handleSend = async () => {
    if (!paperId || !reviewer) {
      setError('Missing paper or reviewer information');
      return;
    }

    setSending(true);
    setProgress(0);
    setError('');

    // Simulate progress bar
    const progressInterval = setInterval(() => {
      setProgress(prev => {
        if (prev >= 90) {
          clearInterval(progressInterval);
          return 90;
        }
        return prev + 10;
      });
    }, 200);

    try {
      const response = await fetch(
        `${API_BASE_URL}/${paperId}/send-email/${reviewer.reviewerNumber}`,
        {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            customSubject: emailSubject,
            customBody: emailBody
          })
        }
      );

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.message || 'Failed to send email');
      }

      // Complete progress
      clearInterval(progressInterval);
      setProgress(100);
      setSent(true);

      // Notify parent
      if (onEmailSent) {
        onEmailSent(reviewer.reviewerNumber);
      }

      // Close after 2 seconds
      setTimeout(() => {
        onClose();
      }, 2000);

    } catch (err) {
      clearInterval(progressInterval);
      setError(err.message);
      setProgress(0);
    } finally {
      setSending(false);
    }
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
              <h2 className="text-xl font-bold">Email Preview & Edit</h2>
              <p className="text-sm text-emerald-100">Review and customize before sending</p>
            </div>
          </div>
          <button
            onClick={onClose}
            disabled={sending}
            className="text-white hover:bg-white/20 rounded-full p-2 transition disabled:opacity-50"
          >
            <X size={20} />
          </button>
        </div>

        {/* Content */}
        <div className="overflow-y-auto max-h-[calc(90vh-200px)] p-6 space-y-6">
          {/* Error Message */}
          {error && (
            <div className="bg-red-50 border border-red-200 text-red-800 px-4 py-3 rounded-lg">
              {error}
            </div>
          )}

          {/* Success Message */}
          {sent && (
            <div className="bg-green-50 border border-green-200 text-green-800 px-4 py-3 rounded-lg flex items-center">
              <Check className="mr-2" size={20} />
              Email sent successfully to {reviewer?.reviewerName}!
            </div>
          )}

          {/* Subject Line */}
          <div>
            <label className="block text-sm font-semibold text-gray-700 mb-2 uppercase tracking-wide">
              Subject Line
            </label>
            <input
              type="text"
              value={emailSubject}
              onChange={(e) => setEmailSubject(e.target.value)}
              disabled={sending || sent}
              className="w-full px-4 py-3 border-2 border-gray-300 rounded-lg focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500 font-medium disabled:bg-gray-100 disabled:cursor-not-allowed"
            />
          </div>

          {/* Email Body */}
          <div>
            <label className="block text-sm font-semibold text-gray-700 mb-2 uppercase tracking-wide">
              Email Message
            </label>
            <textarea
              value={emailBody}
              onChange={(e) => setEmailBody(e.target.value)}
              disabled={sending || sent}
              rows={20}
              className="w-full px-4 py-3 border-2 border-gray-300 rounded-lg focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500 font-mono text-sm leading-relaxed disabled:bg-gray-100 disabled:cursor-not-allowed"
            />
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

          {/* Progress Bar */}
          {sending && (
            <div className="space-y-2">
              <div className="flex items-center justify-between text-sm">
                <span className="text-gray-700 font-medium">Sending email...</span>
                <span className="text-emerald-600 font-bold">{progress}%</span>
              </div>
              <div className="w-full bg-gray-200 rounded-full h-3 overflow-hidden">
                <div
                  className="bg-gradient-to-r from-emerald-500 to-teal-500 h-3 rounded-full transition-all duration-300 ease-out"
                  style={{ width: `${progress}%` }}
                />
              </div>
              <p className="text-xs text-gray-500 text-center">
                Please wait, do not close this window...
              </p>
            </div>
          )}

          {/* Info Box */}
          {!sent && (
            <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
              <div className="flex items-start">
                <div className="flex-shrink-0">
                  <svg className="h-5 w-5 text-blue-600" fill="currentColor" viewBox="0 0 20 20">
                    <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7-4a1 1 0 11-2 0 1 1 0 012 0zM9 9a1 1 0 000 2v3a1 1 0 001 1h1a1 1 0 100-2v-3a1 1 0 00-1-1H9z" clipRule="evenodd" />
                  </svg>
                </div>
                <div className="ml-3">
                  <h4 className="text-sm font-semibold text-blue-800">Customize Your Email</h4>
                  <p className="text-sm text-blue-700 mt-1">
                    You can modify the subject and message above. The PDF will be automatically attached when you send the email.
                  </p>
                </div>
              </div>
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="border-t border-gray-200 px-6 py-4 bg-gray-50 flex justify-between items-center">
          <button
            onClick={onClose}
            disabled={sending}
            className="px-6 py-2.5 border-2 border-gray-300 text-gray-700 rounded-lg hover:bg-gray-100 transition font-medium disabled:opacity-50 disabled:cursor-not-allowed"
          >
            Cancel
          </button>
          <button
            onClick={handleSend}
            disabled={sending || sent}
            className="bg-gradient-to-r from-emerald-600 to-teal-600 text-white px-8 py-2.5 rounded-lg hover:from-emerald-700 hover:to-teal-700 transition font-medium flex items-center shadow-lg disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {sending ? (
              <>
                <Loader2 className="mr-2 animate-spin" size={18} />
                Sending...
              </>
            ) : sent ? (
              <>
                <Check className="mr-2" size={18} />
                Email Sent
              </>
            ) : (
              <>
                <Send size={18} className="mr-2" />
                Send Email to {reviewer?.reviewerName}
              </>
            )}
          </button>
        </div>
      </div>
    </div>
  );
};

export default EmailPreviewModal;