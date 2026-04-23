import React, { useEffect, useState, useRef } from "react";
import { X, Mail, Send, Loader2, Check } from "lucide-react";
import Quill from "quill";
import "quill/dist/quill.snow.css";

const EmailPreviewModal = ({
  isOpen,
  onClose,
  reviewer,
  paperId,
  paperTitle,
  uniqueId,
  manuscriptReceivedDate,
  plagiarismPercentage,
  onEmailSent,
}) => {
  const [emailSubject, setEmailSubject] = useState(
    `Research Paper Review Request: ${paperTitle}`,
  );
  const [editableContent, setEditableContent] = useState("");
  const [sending, setSending] = useState(false);
  const [progress, setProgress] = useState(0);
  const [sent, setSent] = useState(false);
  const [error, setError] = useState("");

  const editorRef = useRef(null);
  const quillRef = useRef(null);

  // Layout Constants for Email Compatibility
  const tableStyle =
    "border-collapse: collapse; width: 100%; border: 1px solid black;";
  const tdStyle = "border: 1px solid black; padding: 8px; font-size: 14px;";

  const beforeEditable = `
<table width="100%" cellpadding="0" cellspacing="0" style="font-family: Arial; font-size:14px; line-height:1.4;">
<tr>
<td>

<p style="margin:0 0 10px 0;"><strong>AJMT – Paper Review (Paper No. ${uniqueId})</strong></p>

<p style="margin:0 0 8px 0;"><strong>Manuscript Information</strong></p>

<table border="1" cellpadding="0" cellspacing="0" style="${tableStyle}; width:100%; table-layout:fixed;">
<tr><td style="${tdStyle}; width:40%;"><strong>Journal Name</strong></td><td style="${tdStyle}">ARAI Journal of Mobility Technology</td></tr>
<tr><td style="${tdStyle}"><strong>Manuscript Number</strong></td><td style="${tdStyle}">${uniqueId}</td></tr>
<tr><td style="${tdStyle}"><strong>Manuscript Title</strong></td><td style="${tdStyle}">${paperTitle}</td></tr>
<tr><td style="${tdStyle}"><strong>Date Received</strong></td><td style="${tdStyle}">${manuscriptReceivedDate}</td></tr>
<tr><td style="${tdStyle}"><strong>Plagiarism %</strong></td><td style="${tdStyle}">${plagiarismPercentage || ""}</td></tr>
</table>
  `;

  const afterEditable = `

<p style="margin:10px 0 5px;"><strong>RATING SCORE</strong></p>

<table border="1" cellpadding="0" cellspacing="0" style="${tableStyle}; width:100%; table-layout:fixed;">
<tr>
<th style="${tdStyle}; width:10%;">Sl. No.</th>
<th style="${tdStyle}; width:60%;">Particulars</th>
<th style="${tdStyle}; width:30%;">Score</th>
</tr>

<tr><td style="${tdStyle}">1</td><td style="${tdStyle}">Long Term Reference Value</td><td style="${tdStyle}"></td></tr>
<tr><td style="${tdStyle}">2</td><td style="${tdStyle}">Concepts & Organization</td><td style="${tdStyle}"></td></tr>
<tr><td style="${tdStyle}">3</td><td style="${tdStyle}">Professional Integrity</td><td style="${tdStyle}"></td></tr>

<tr><td style="${tdStyle}">1</td><td style="${tdStyle}">Long Term Reference Value</td><td style="${tdStyle}"></td></tr>
<tr><td style="${tdStyle}">2</td><td style="${tdStyle}">Concepts & Organization</td><td style="${tdStyle}"></td></tr>
<tr><td style="${tdStyle}">3</td><td style="${tdStyle}">Professional Integrity</td><td style="${tdStyle}"></td></tr>
<tr><td style="${tdStyle}">4</td><td style="${tdStyle}">Innovation</td><td style="${tdStyle}"></td></tr>
<tr><td style="${tdStyle}">5</td><td style="${tdStyle}">Quality & Validation</td><td style="${tdStyle}"></td></tr>
<tr><td style="${tdStyle}">6</td><td style="${tdStyle}">Soundness of Conclusion</td><td style="${tdStyle}"></td></tr>
<tr><td style="${tdStyle}" colspan="2"><strong>Total out of 60</strong></td><td style="${tdStyle}"></td></tr>
</table>
<p style="margin:10px 0 5px; font-size:13px;">
  Scores range from 1 to 10, with 1 being the lowest and 10 being the highest.
</p>

<p style="margin:10px 0 5px;">
  <strong>Whether Recommended for Journal (Please √ mark)</strong>
</p>

<table border="1" cellpadding="0" cellspacing="0" 
  style="${tableStyle}; width:100%; table-layout:fixed; border-collapse:collapse;">

  <tr>
    <td style="${tdStyle}; vertical-align:middle;">Approved</td>
    <td style="${tdStyle}; width:40px;"></td>

    <td style="${tdStyle}; vertical-align:middle;">Approved if Modified-Minor</td>
    <td style="${tdStyle}; width:40px;"></td>

    <td style="${tdStyle}; vertical-align:middle;">Approved if Modified – Major</td>
    <td style="${tdStyle}; width:40px;"></td>

    <td style="${tdStyle}; vertical-align:middle;">Disapproved</td>
    <td style="${tdStyle}; width:40px;"></td>
  </tr>

</table>

<p style="margin:10px 0 5px;">
  <strong>
    Comments & Corrective Actions: 
    (Why it is Approved / Disapproved? What corrections are required?)
  </strong>
</p>

<table border="1" cellpadding="0" cellspacing="0" 
  style="${tableStyle}; width:100%; table-layout:fixed; border-collapse:collapse;">

  <tr><td style="${tdStyle}; height:25px;">1.</td></tr>
  <tr><td style="${tdStyle}; height:25px;">2.</td></tr>
  <tr><td style="${tdStyle}; height:25px;">3.</td></tr>
  <tr><td style="${tdStyle}; height:25px;">4.</td></tr>
  <tr><td style="${tdStyle}; height:25px;">5.</td></tr>

</table>

<p style="margin:10px 0 0 0;">Yours Sincerely,</p>

<p style="margin:5px 0 0 0;">
  <strong>Dr A. Madhava Rao</strong><br/>
  Sr. Manager, Knowledge Centres (Kothrud & Chakan)<br/>
  Assistant Editor (ARAI Journal of Mobility Technology)<br/>
  The Automotive Research Association of India<br/>
  Pune - Maharashtra<br/>
  Tel: 020-6762-1126 | https://araijournal.com
</p>

`;

  useEffect(() => {
    if (isOpen && editorRef.current && !quillRef.current) {
      quillRef.current = new Quill(editorRef.current, { theme: "snow" });
      const initialHtml = `
        <p>Dear ${reviewer?.reviewerName ?? "Sir"},</p>
        <p>We believe you are one of the subject expert, so we are sending you this paper based on your expertise and subject area. Please review the paper and provide your comments. Your comments and suggestions for improving the paper's quality will be shared with the author for further revisions before being sent to print.</p>
        <p>Please find the manuscript attached for your reference. You can either print the paper or use the edit tools (Insert / Comment) to make changes. After finishing the review, please provide your comments and score in the below table.</p>
      `;
      quillRef.current.root.innerHTML = initialHtml;
      setEditableContent(initialHtml);
      quillRef.current.on("text-change", () =>
        setEditableContent(quillRef.current.root.innerHTML),
      );
    }
  }, [isOpen, reviewer]);

  const handleSend = async () => {
    setSending(true);
    setError("");
    try {
      const response = await fetch(
        `${import.meta.env.VITE_API_URL}/api/ajmtpapers/${paperId}/send-email/${reviewer.reviewerNumber}`,
        {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            customSubject: emailSubject,
            customBody: beforeEditable + editableContent + afterEditable,
          }),
        },
      );
      if (!response.ok) throw new Error("Failed to send email");
      setSent(true);
      if (onEmailSent) onEmailSent(reviewer.reviewerNumber);
      setTimeout(onClose, 2000);
    } catch (err) {
      setError(err.message);
    } finally {
      setSending(false);
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-[60] p-4">
      <div className="bg-white rounded-lg shadow-2xl max-w-4xl w-full max-h-[90vh] flex flex-col overflow-hidden">
        <div className="bg-emerald-600 text-white px-6 py-4 flex items-center justify-between">
          <h2 className="text-xl font-bold">Email Preview</h2>
          <button onClick={onClose}>
            <X size={20} />
          </button>
        </div>
        <div className="flex-1 overflow-y-auto p-6 space-y-4">
          {error && (
            <div className="text-red-600 bg-red-50 p-2 rounded">{error}</div>
          )}
          {sent && (
            <div className="text-green-600 bg-green-50 p-2 rounded">
              Email Sent!
            </div>
          )}
          <input
            className="w-full p-2 border rounded"
            value={emailSubject}
            onChange={(e) => setEmailSubject(e.target.value)}
          />
          <div ref={editorRef} style={{ height: "200px" }} />
          <div className="border p-4 bg-gray-50 rounded">
            <div
              dangerouslySetInnerHTML={{
                __html: beforeEditable + editableContent + afterEditable,
              }}
            />
          </div>
        </div>
        <div className="p-4 border-t bg-gray-50 flex justify-end gap-2">
          <button onClick={onClose} className="px-4 py-2 border rounded">
            Cancel
          </button>
          <button
            onClick={handleSend}
            disabled={sending}
            className="bg-emerald-600 text-white px-6 py-2 rounded flex items-center"
          >
            {sending ? (
              <Loader2 className="animate-spin mr-2" size={18} />
            ) : (
              <Send className="mr-2" size={18} />
            )}
            Send Email
          </button>
        </div>
      </div>
    </div>
  );
};

export default EmailPreviewModal;
