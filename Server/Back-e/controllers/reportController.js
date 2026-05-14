const ExcelJS = require("exceljs");
const PDFDocument = require("pdfkit");
const Standard = require("../models/Standard");
const Periodical = require("../models/Periodical");
const Abstract = require("../models/Abstract");
const KCMember = require("../models/KCMembers");
const ArrivalAndNews = require("../models/ArrivalsAndNews");

// ==================== STANDARDS REPORTS ====================

// 1. Department-wise Standards Report
exports.standardsDepartmentWiseReport = async (req, res, next) => {
  try {
    const { department } = req.query;

    let filter = {};
    if (department) {
      filter.department = department;
    }

    const standards = await Standard.find(filter).sort({
      department: 1,
      icnNumber: 1,
    });

    // Create workbook
    const workbook = new ExcelJS.Workbook();
    const worksheet = workbook.addWorksheet("Department-wise Standards");

      worksheet.columns = [
      { header: "Department", key: "department", width: 15 },
      { header: "ICN", key: "icnNumber", width: 10 },
      { header: "Standard No", key: "standardNumber", width: 20 },
      { header: "Title", key: "title", width: 35 },
      { header: "Category", key: "category", width: 15 },
      { header: "Status", key: "status", width: 12 },
      { header: "Req No", key: "requisition_no", width: 15 },
      { header: "PO No", key: "po_no", width: 15 },
      { header: "Amount", key: "amount", width: 10 },
      { header: "Publisher", key: "publisher", width: 15 },
      { header: "Accn No", key: "accnNumber", width: 15 },
      { header: "Keywords", key: "keywords", width: 25 },
    ];

    // Style header row
    worksheet.getRow(1).font = { bold: true, color: { argb: "FFFFFFFF" } };
    worksheet.getRow(1).fill = {
      type: "pattern",
      pattern: "solid",
      fgColor: { argb: "FF4472C4" },
    };

    // Add data rows
    standards.forEach((s) => {
      worksheet.addRow({
        department: s.department,
        icnNumber: s.icnNumber,
        standardNumber: s.standardNumber,
        title: s.title,
        category: s.category,
        status: s.status,
        requisition_no: s.requisition_no,
        po_no: s.po_no,
        amount: s.amount,
        publisher: s.publisher,
        accnNumber: s.accnNumber,
        keywords: Array.isArray(s.keywords) ? s.keywords.join(", ") : s.keywords,
      });
    });

    // Auto-fit columns
    worksheet.columns.forEach((column) => {
      column.alignment = { vertical: "middle", wrapText: true };
    });

    // Generate buffer
    const buffer = await workbook.xlsx.writeBuffer();

    // Set headers and send file
    res.setHeader(
      "Content-Type",
      "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
    );
    res.setHeader(
      "Content-Disposition",
      `attachment; filename=Standards_Department_Report_${Date.now()}.xlsx`,
    );
    res.send(buffer);
  } catch (error) {
    next(error);
  }
};

// 2. Requisition Number-wise Report
exports.standardsRequisitionWiseReport = async (req, res, next) => {
  try {
    const { requisition_no } = req.query;
    let filter = {};
    if (requisition_no) {
      filter.requisition_no = requisition_no;
    }

    const standards = await Standard.find(filter).sort({ requisition_no: 1 });

    const workbook = new ExcelJS.Workbook();
    const worksheet = workbook.addWorksheet("Requisition-wise Report");

    worksheet.columns = [
      { header: "Req No", key: "requisition_no", width: 15 },
      { header: "ICN", key: "icnNumber", width: 10 },
      { header: "Standard No", key: "standardNumber", width: 20 },
      { header: "Title", key: "title", width: 35 },
      { header: "Department", key: "department", width: 15 },
      { header: "Category", key: "category", width: 15 },
      { header: "Status", key: "status", width: 12 },
      { header: "PO No", key: "po_no", width: 15 },
      { header: "Amount", key: "amount", width: 10 },
      { header: "Publisher", key: "publisher", width: 15 },
      { header: "Accn No", key: "accnNumber", width: 15 },
      { header: "Keywords", key: "keywords", width: 25 },
    ];

    // Royal Blue Header
    worksheet.getRow(1).font = { bold: true, color: { argb: "FFFFFFFF" } };
    worksheet.getRow(1).fill = { type: "pattern", pattern: "solid", fgColor: { argb: "FF2E75B6" } };

    standards.forEach((s) => {
      worksheet.addRow({
        requisition_no: s.requisition_no,
        icnNumber: s.icnNumber,
        standardNumber: s.standardNumber,
        title: s.title,
        department: s.department,
        category: s.category,
        status: s.status,
        po_no: s.po_no,
        amount: s.amount,
        publisher: s.publisher,
        accnNumber: s.accnNumber,
        keywords: Array.isArray(s.keywords) ? s.keywords.join(", ") : s.keywords,
      });
    });

    const buffer = await workbook.xlsx.writeBuffer();
    res.setHeader("Content-Type", "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet");
    res.setHeader("Content-Disposition", `attachment; filename=Requisition_Report_${Date.now()}.xlsx`);
    res.send(buffer);
  } catch (error) { next(error); }
};

// 3. Status-wise Report (Active, Superseded, Withdrawn)
exports.standardsStatusWiseReport = async (req, res, next) => {
  try {
    const { status } = req.query;
    let filter = {};
    if (status) filter.status = status;

    const standards = await Standard.find(filter).sort({ status: 1, standardNumber: 1 });

    const workbook = new ExcelJS.Workbook();
    const worksheet = workbook.addWorksheet("Status-wise Report");

      worksheet.columns = [
      { header: "Status", key: "status", width: 12 },
      { header: "ICN", key: "icnNumber", width: 10 },
      { header: "Standard No", key: "standardNumber", width: 20 },
      { header: "Title", key: "title", width: 35 },
      { header: "Department", key: "department", width: 15 },
      { header: "Category", key: "category", width: 15 },
      { header: "Req No", key: "requisition_no", width: 15 },
      { header: "PO No", key: "po_no", width: 15 },
      { header: "Amount", key: "amount", width: 10 },
      { header: "Publisher", key: "publisher", width: 15 },
      { header: "Accn No", key: "accnNumber", width: 15 },
      { header: "Keywords", key: "keywords", width: 25 },
    ];

    // Purple Header
    worksheet.getRow(1).font = { bold: true, color: { argb: "FFFFFFFF" } };
    worksheet.getRow(1).fill = { type: "pattern", pattern: "solid", fgColor: { argb: "FF7030A0" } };

    standards.forEach((s) => {
      worksheet.addRow({
        status: s.status,
        icnNumber: s.icnNumber,
        standardNumber: s.standardNumber,
        title: s.title,
        department: s.department,
        category: s.category,
        requisition_no: s.requisition_no,
        po_no: s.po_no,
        amount: s.amount,
        publisher: s.publisher,
        accnNumber: s.accnNumber,
        keywords: Array.isArray(s.keywords) ? s.keywords.join(", ") : s.keywords,
      });
    });

    const buffer = await workbook.xlsx.writeBuffer();
    res.setHeader("Content-Type", "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet");
    res.setHeader("Content-Disposition", `attachment; filename=Status_Report_${Date.now()}.xlsx`);
    res.send(buffer);
  } catch (error) { next(error); }
};

// 4. Standard Number-wise Report (Specific Search/Filter)
exports.standardsNumberWiseReport = async (req, res, next) => {
  try {
    const { standardNumber } = req.query;
    let filter = {};
    if (standardNumber) {
      filter.standardNumber = { $regex: standardNumber, $options: "i" }; // Partial match
    }

    const standards = await Standard.find(filter).sort({ standardNumber: 1 });

    const workbook = new ExcelJS.Workbook();
    const worksheet = workbook.addWorksheet("Standard Number Report");

    worksheet.columns = [
      { header: "Standard No", key: "standardNumber", width: 20 },
      { header: "ICN", key: "icnNumber", width: 10 },
      { header: "Title", key: "title", width: 35 },
      { header: "Department", key: "department", width: 15 },
      { header: "Category", key: "category", width: 15 },
      { header: "Status", key: "status", width: 12 },
      { header: "Req No", key: "requisition_no", width: 15 },
      { header: "PO No", key: "po_no", width: 15 },
      { header: "Amount", key: "amount", width: 10 },
      { header: "Publisher", key: "publisher", width: 15 },
      { header: "Accn No", key: "accnNumber", width: 15 },
      { header: "Keywords", key: "keywords", width: 25 },
    ];


    // Dark Grey Header
    worksheet.getRow(1).font = { bold: true, color: { argb: "FFFFFFFF" } };
    worksheet.getRow(1).fill = { type: "pattern", pattern: "solid", fgColor: { argb: "FF3B3838" } };

    standards.forEach((s) => {
      worksheet.addRow({
        standardNumber: s.standardNumber,
        icnNumber: s.icnNumber,
        title: s.title,
        department: s.department,
        category: s.category,
        status: s.status,
        requisition_no: s.requisition_no,
        po_no: s.po_no,
        amount: s.amount,
        publisher: s.publisher,
        accnNumber: s.accnNumber,
        keywords: Array.isArray(s.keywords) ? s.keywords.join(", ") : s.keywords,
      });
    });

    const buffer = await workbook.xlsx.writeBuffer();
    res.setHeader("Content-Type", "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet");
    res.setHeader("Content-Disposition", `attachment; filename=Standard_Number_Report_${Date.now()}.xlsx`);
    res.send(buffer);
  } catch (error) { next(error); }
};

// 5. Complete Directory (All Fields)
exports.standardsCompleteDirectoryReport = async (req, res, next) => {
  try {
    const standards = await Standard.find().sort({ icnNumber: 1 });

    const workbook = new ExcelJS.Workbook();
    const worksheet = workbook.addWorksheet("Complete Standards Directory");

    // Comprehensive column list based on your StandardModal
    worksheet.columns = [
      { header: "ICN", key: "icnNumber", width: 10 },
      { header: "Standard No", key: "standardNumber", width: 20 },
      { header: "Title", key: "title", width: 35 },
      { header: "Department", key: "department", width: 15 },
      { header: "Category", key: "category", width: 15 },
      { header: "Status", key: "status", width: 12 },
      { header: "Req No", key: "requisition_no", width: 15 },
      { header: "PO No", key: "po_no", width: 15 },
      { header: "Amount", key: "amount", width: 10 },
      { header: "Publisher", key: "publisher", width: 15 },
      { header: "Accn No", key: "accnNumber", width: 15 },
      { header: "Keywords", key: "keywords", width: 25 },
    ];

    // Gold/Dark Yellow Header for Directory
    worksheet.getRow(1).font = { bold: true, color: { argb: "FFFFFFFF" } };
    worksheet.getRow(1).fill = { type: "pattern", pattern: "solid", fgColor: { argb: "FFC65911" } };

    standards.forEach((s) => {
      worksheet.addRow({
        icnNumber: s.icnNumber,
        standardNumber: s.standardNumber,
        title: s.title,
        department: s.department,
        category: s.category,
        status: s.status,
        requisition_no: s.requisition_no,
        po_no: s.po_no,
        amount: s.amount,
        publisher: s.publisher,
        accnNumber: s.accnNumber,
        keywords: s.keywords,
      });
    });

    const buffer = await workbook.xlsx.writeBuffer();
    res.setHeader("Content-Type", "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet");
    res.setHeader("Content-Disposition", `attachment; filename=Complete_Standards_Directory_${Date.now()}.xlsx`);
    res.send(buffer);
  } catch (error) { next(error); }
};

// ==================== PERIODICALS REPORTS ====================

exports.periodicalsSubscriptionDateReport = async (req, res, next) => {
  try {
    const { startDate, endDate } = req.query;
    let filter = {};
    
    // Date filtering logic
    if (startDate && endDate) {
      filter.subscriptionDate = { 
        $gte: new Date(startDate), 
        $lte: new Date(endDate) 
      };
    }

    const periodicals = await Periodical.find(filter).sort({ subscriptionDate: 1 });

    const workbook = new ExcelJS.Workbook();
    const worksheet = workbook.addWorksheet("Subscription Date Report");

    // Comprehensive column list (Total 28 Columns)
    worksheet.columns = [
      { header: "Subscription Date", key: "subscriptionDate", width: 18 },
      { header: "Title", key: "title", width: 30 },
      { header: "Subtitle", key: "subtitle", width: 25 },
      { header: "Authors", key: "authors", width: 30 },
      { header: "Publisher", key: "publisher", width: 20 },
      { header: "ISSN", key: "issn", width: 15 },
      { header: "Frequency", key: "frequency", width: 12 },
      { header: "Volume", key: "volume", width: 10 },
      { header: "Issue", key: "issue", width: 10 },
      { header: "Month", key: "periodicalMonth", width: 12 },
      { header: "Year", key: "periodicalYear", width: 10 },
      { header: "Series", key: "series", width: 15 },
      { header: "Receipt Date", key: "receiptDate", width: 18 },
      { header: "Dept to Issue", key: "departmentToIssue", width: 18 },
      { header: "Dept Issue Date", key: "departmentIssueDate", width: 18 },
      { header: "Add-on Copies", key: "addOnCopies", width: 12 },
      { header: "Order No", key: "orderNo", width: 12 },
      { header: "PO No", key: "poNo", width: 15 },
      { header: "Vendor Name", key: "vendorName", width: 20 },
      { header: "Vendor Phone", key: "vendorPhone", width: 15 },
      { header: "Vendor Email", key: "vendorEmail", width: 25 },
      { header: "Mode", key: "mode", width: 12 },
      { header: "URL", key: "url", width: 25 },
      { header: "Currency", key: "currency", width: 10 },
      { header: "Amount", key: "amount", width: 12 },
      { header: "Payment Remarks", key: "remarksForPayment", width: 25 },
      { header: "Language", key: "language", width: 12 },
      { header: "Status", key: "status", width: 12 },
      { header: "Notes", key: "notes", width: 30 },
    ];

    // Blue Header (FF4472C4)
    worksheet.getRow(1).font = { bold: true, color: { argb: "FFFFFFFF" } };
    worksheet.getRow(1).fill = { 
      type: "pattern", 
      pattern: "solid", 
      fgColor: { argb: "FF4472C4" } 
    };

    periodicals.forEach((p) => {
      worksheet.addRow({
        subscriptionDate: p.subscriptionDate ? new Date(p.subscriptionDate).toLocaleDateString() : "N/A",
        title: p.title,
        subtitle: p.subtitle,
        authors: Array.isArray(p.authors) ? p.authors.join(", ") : "",
        publisher: p.publisher,
        issn: p.issn,
        frequency: p.frequency,
        volume: p.volume,
        issue: p.issue,
        periodicalMonth: p.periodicalMonth,
        periodicalYear: p.periodicalYear,
        series: p.series,
        receiptDate: p.receiptDate ? new Date(p.receiptDate).toLocaleDateString() : "",
        departmentToIssue: p.departmentToIssue,
        departmentIssueDate: p.departmentIssueDate ? new Date(p.departmentIssueDate).toLocaleDateString() : "",
        addOnCopies: p.addOnCopies,
        orderNo: p.orderNo,
        poNo: p.poNo,
        vendorName: p.vendorDetails?.name || "",
        vendorPhone: p.vendorDetails?.phone || "",
        vendorEmail: p.vendorDetails?.email || "",
        mode: p.mode,
        url: p.url,
        currency: p.paymentDetails?.currency || "",
        amount: p.paymentDetails?.amount || 0,
        remarksForPayment: p.remarksForPayment,
        language: p.language,
        status: p.status,
        notes: p.notes,
      });
    });

    // Vertical align and text wrapping
    worksheet.columns.forEach((column) => {
      column.alignment = { vertical: "middle", horizontal: "left", wrapText: true };
    });

    const buffer = await workbook.xlsx.writeBuffer();

    res.setHeader("Content-Type", "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet");
    res.setHeader("Content-Disposition", `attachment; filename=Subscription_Report_${Date.now()}.xlsx`);
    res.send(buffer);

  } catch (error) { 
    next(error); 
  }
};

// 2. Frequency-wise Report (Frequency Column First)
exports.periodicalsFrequencyWiseReport = async (req, res, next) => {
  try {
    const { frequency } = req.query;
    let filter = frequency ? { frequency } : {};

    // Sorted by Frequency first, then alphabetically by Title
    const periodicals = await Periodical.find(filter).sort({ 
      frequency: 1, 
      title: 1 
    });

    const workbook = new ExcelJS.Workbook();
    const worksheet = workbook.addWorksheet("Frequency Report");

    // Full 28-Column Comprehensive List
    worksheet.columns = [
      { header: "Frequency", key: "frequency", width: 15 },
      { header: "Title", key: "title", width: 30 },
      { header: "Subtitle", key: "subtitle", width: 25 },
      { header: "Authors", key: "authors", width: 30 },
      { header: "Publisher", key: "publisher", width: 20 },
      { header: "ISSN", key: "issn", width: 15 },
      { header: "Volume", key: "volume", width: 10 },
      { header: "Issue", key: "issue", width: 10 },
      { header: "Month", key: "periodicalMonth", width: 12 },
      { header: "Year", key: "periodicalYear", width: 10 },
      { header: "Series", key: "series", width: 15 },
      { header: "Subscription Date", key: "subscriptionDate", width: 18 },
      { header: "Receipt Date", key: "receiptDate", width: 18 },
      { header: "Dept to Issue", key: "departmentToIssue", width: 18 },
      { header: "Dept Issue Date", key: "departmentIssueDate", width: 18 },
      { header: "Add-on Copies", key: "addOnCopies", width: 12 },
      { header: "Order No", key: "orderNo", width: 12 },
      { header: "PO No", key: "poNo", width: 15 },
      { header: "Vendor Name", key: "vendorName", width: 20 },
      { header: "Vendor Phone", key: "vendorPhone", width: 15 },
      { header: "Vendor Email", key: "vendorEmail", width: 25 },
      { header: "Mode", key: "mode", width: 12 },
      { header: "URL", key: "url", width: 25 },
      { header: "Currency", key: "currency", width: 10 },
      { header: "Amount", key: "amount", width: 12 },
      { header: "Payment Remarks", key: "remarksForPayment", width: 25 },
      { header: "Language", key: "language", width: 12 },
      { header: "Status", key: "status", width: 12 },
      { header: "Notes", key: "notes", width: 30 },
    ];

    // Orange Header (FFED7D31)
    worksheet.getRow(1).font = { bold: true, color: { argb: "FFFFFFFF" } };
    worksheet.getRow(1).fill = { 
      type: "pattern", 
      pattern: "solid", 
      fgColor: { argb: "FFED7D31" } 
    };

    periodicals.forEach((p) => {
      worksheet.addRow({
        frequency: p.frequency,
        title: p.title,
        subtitle: p.subtitle,
        authors: Array.isArray(p.authors) ? p.authors.join(", ") : "",
        publisher: p.publisher,
        issn: p.issn,
        volume: p.volume,
        issue: p.issue,
        periodicalMonth: p.periodicalMonth,
        periodicalYear: p.periodicalYear,
        series: p.series,
        subscriptionDate: p.subscriptionDate ? new Date(p.subscriptionDate).toLocaleDateString() : "",
        receiptDate: p.receiptDate ? new Date(p.receiptDate).toLocaleDateString() : "",
        departmentToIssue: p.departmentToIssue,
        departmentIssueDate: p.departmentIssueDate ? new Date(p.departmentIssueDate).toLocaleDateString() : "",
        addOnCopies: p.addOnCopies,
        orderNo: p.orderNo,
        poNo: p.poNo,
        vendorName: p.vendorDetails?.name || "",
        vendorPhone: p.vendorDetails?.phone || "",
        vendorEmail: p.vendorDetails?.email || "",
        mode: p.mode,
        url: p.url,
        currency: p.paymentDetails?.currency || "",
        amount: p.paymentDetails?.amount || 0,
        remarksForPayment: p.remarksForPayment,
        language: p.language,
        status: p.status,
        notes: p.notes,
      });
    });

    // Vertical align and text wrapping for readability
    worksheet.columns.forEach((column) => {
      column.alignment = { vertical: "middle", horizontal: "left", wrapText: true };
    });

    const buffer = await workbook.xlsx.writeBuffer();

    res.setHeader("Content-Type", "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet");
    res.setHeader("Content-Disposition", `attachment; filename=Frequency_Report_${Date.now()}.xlsx`);
    res.send(buffer);

  } catch (error) { 
    next(error); 
  }
};

// 3. Title-wise Report (Title Column First)
exports.periodicalsTitleWiseReport = async (req, res, next) => {
  try {
    const { title } = req.query;
    // Keep your regex filter for flexible searching
    let filter = title ? { title: { $regex: title, $options: "i" } } : {};

    const periodicals = await Periodical.find(filter).sort({ title: 1 });

    const workbook = new ExcelJS.Workbook();
    const worksheet = workbook.addWorksheet("Title-wise Report");

    // Full 28-Column Comprehensive List (Matching your Schema)
    worksheet.columns = [
      { header: "Title", key: "title", width: 35 },
      { header: "Subtitle", key: "subtitle", width: 25 },
      { header: "Authors", key: "authors", width: 30 },
      { header: "Publisher", key: "publisher", width: 25 },
      { header: "ISSN", key: "issn", width: 15 },
      { header: "Frequency", key: "frequency", width: 12 },
      { header: "Volume", key: "volume", width: 10 },
      { header: "Issue", key: "issue", width: 10 },
      { header: "Month", key: "periodicalMonth", width: 12 },
      { header: "Year", key: "periodicalYear", width: 10 },
      { header: "Series", key: "series", width: 15 },
      { header: "Subscription Date", key: "subscriptionDate", width: 18 },
      { header: "Receipt Date", key: "receiptDate", width: 18 },
      { header: "Dept to Issue", key: "departmentToIssue", width: 18 },
      { header: "Dept Issue Date", key: "departmentIssueDate", width: 18 },
      { header: "Add-on Copies", key: "addOnCopies", width: 12 },
      { header: "Order No", key: "orderNo", width: 12 },
      { header: "PO No", key: "poNo", width: 15 },
      { header: "Vendor Name", key: "vendorName", width: 20 },
      { header: "Vendor Phone", key: "vendorPhone", width: 15 },
      { header: "Vendor Email", key: "vendorEmail", width: 25 },
      { header: "Mode", key: "mode", width: 12 },
      { header: "URL", key: "url", width: 25 },
      { header: "Currency", key: "currency", width: 10 },
      { header: "Amount", key: "amount", width: 12 },
      { header: "Payment Remarks", key: "remarksForPayment", width: 25 },
      { header: "Language", key: "language", width: 12 },
      { header: "Status", key: "status", width: 12 },
      { header: "Notes", key: "notes", width: 30 },
    ];

    // Green Header (FF70AD47)
    worksheet.getRow(1).font = { bold: true, color: { argb: "FFFFFFFF" } };
    worksheet.getRow(1).fill = { 
      type: "pattern", 
      pattern: "solid", 
      fgColor: { argb: "FF70AD47" } 
    };

    periodicals.forEach((p) => {
      worksheet.addRow({
        title: p.title,
        subtitle: p.subtitle,
        authors: Array.isArray(p.authors) ? p.authors.join(", ") : "",
        publisher: p.publisher,
        issn: p.issn,
        frequency: p.frequency,
        volume: p.volume,
        issue: p.issue,
        periodicalMonth: p.periodicalMonth,
        periodicalYear: p.periodicalYear,
        series: p.series,
        subscriptionDate: p.subscriptionDate ? new Date(p.subscriptionDate).toLocaleDateString() : "",
        receiptDate: p.receiptDate ? new Date(p.receiptDate).toLocaleDateString() : "",
        departmentToIssue: p.departmentToIssue,
        departmentIssueDate: p.departmentIssueDate ? new Date(p.departmentIssueDate).toLocaleDateString() : "",
        addOnCopies: p.addOnCopies,
        orderNo: p.orderNo,
        poNo: p.poNo,
        vendorName: p.vendorDetails?.name || "",
        vendorPhone: p.vendorDetails?.phone || "",
        vendorEmail: p.vendorDetails?.email || "",
        mode: p.mode,
        url: p.url,
        currency: p.paymentDetails?.currency || "",
        amount: p.paymentDetails?.amount || 0,
        remarksForPayment: p.remarksForPayment,
        language: p.language,
        status: p.status,
        notes: p.notes,
      });
    });

    // Vertical align and text wrapping
    worksheet.columns.forEach((column) => {
      column.alignment = { vertical: "middle", horizontal: "left", wrapText: true };
    });

    const buffer = await workbook.xlsx.writeBuffer();

    res.setHeader("Content-Type", "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet");
    res.setHeader("Content-Disposition", `attachment; filename=Title_Search_Report_${Date.now()}.xlsx`);
    res.send(buffer);

  } catch (error) { 
    next(error); 
  }
};

// 4. Status-wise Report (Status Column First)
exports.periodicalsStatusWiseReport = async (req, res, next) => {
  try {
    const { status } = req.query;
    let filter = status ? { status } : {};

    const periodicals = await Periodical.find(filter).sort({ status: 1, title: 1 });

    const workbook = new ExcelJS.Workbook();
    const worksheet = workbook.addWorksheet("Status-wise Report");

    // Full 28-Column Comprehensive List
    worksheet.columns = [
      { header: "Status", key: "status", width: 15 },
      { header: "Title", key: "title", width: 35 },
      { header: "Subtitle", key: "subtitle", width: 25 },
      { header: "Authors", key: "authors", width: 30 },
      { header: "Publisher", key: "publisher", width: 25 },
      { header: "ISSN", key: "issn", width: 15 },
      { header: "Frequency", key: "frequency", width: 12 },
      { header: "Volume", key: "volume", width: 10 },
      { header: "Issue", key: "issue", width: 10 },
      { header: "Month", key: "periodicalMonth", width: 12 },
      { header: "Year", key: "periodicalYear", width: 10 },
      { header: "Series", key: "series", width: 15 },
      { header: "Subscription Date", key: "subscriptionDate", width: 18 },
      { header: "Receipt Date", key: "receiptDate", width: 18 },
      { header: "Dept to Issue", key: "departmentToIssue", width: 18 },
      { header: "Dept Issue Date", key: "departmentIssueDate", width: 18 },
      { header: "Add-on Copies", key: "addOnCopies", width: 12 },
      { header: "Order No", key: "orderNo", width: 12 },
      { header: "PO No", key: "poNo", width: 15 },
      { header: "Vendor Name", key: "vendorName", width: 20 },
      { header: "Vendor Phone", key: "vendorPhone", width: 15 },
      { header: "Vendor Email", key: "vendorEmail", width: 25 },
      { header: "Mode", key: "mode", width: 12 },
      { header: "URL", key: "url", width: 25 },
      { header: "Currency", key: "currency", width: 10 },
      { header: "Amount", key: "amount", width: 12 },
      { header: "Payment Remarks", key: "remarksForPayment", width: 25 },
      { header: "Language", key: "language", width: 12 },
      { header: "Notes", key: "notes", width: 30 },
    ];

    // Purple Header (FF7030A0)
    worksheet.getRow(1).font = { bold: true, color: { argb: "FFFFFFFF" } };
    worksheet.getRow(1).fill = { 
      type: "pattern", 
      pattern: "solid", 
      fgColor: { argb: "FF7030A0" } 
    };

    periodicals.forEach((p) => {
      worksheet.addRow({
        status: p.status,
        title: p.title,
        subtitle: p.subtitle,
        authors: Array.isArray(p.authors) ? p.authors.join(", ") : "",
        publisher: p.publisher,
        issn: p.issn,
        frequency: p.frequency,
        volume: p.volume,
        issue: p.issue,
        periodicalMonth: p.periodicalMonth,
        periodicalYear: p.periodicalYear,
        series: p.series,
        subscriptionDate: p.subscriptionDate ? new Date(p.subscriptionDate).toLocaleDateString() : "",
        receiptDate: p.receiptDate ? new Date(p.receiptDate).toLocaleDateString() : "",
        departmentToIssue: p.departmentToIssue,
        departmentIssueDate: p.departmentIssueDate ? new Date(p.departmentIssueDate).toLocaleDateString() : "",
        addOnCopies: p.addOnCopies,
        orderNo: p.orderNo,
        poNo: p.poNo,
        vendorName: p.vendorDetails?.name || "",
        vendorPhone: p.vendorDetails?.phone || "",
        vendorEmail: p.vendorDetails?.email || "",
        mode: p.mode,
        url: p.url,
        currency: p.paymentDetails?.currency || "",
        amount: p.paymentDetails?.amount || 0,
        remarksForPayment: p.remarksForPayment,
        language: p.language,
        notes: p.notes,
      });
    });

    // Formatting
    worksheet.columns.forEach((column) => {
      column.alignment = { vertical: "middle", horizontal: "left", wrapText: true };
    });

    const buffer = await workbook.xlsx.writeBuffer();

    res.setHeader("Content-Type", "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet");
    res.setHeader("Content-Disposition", `attachment; filename=Status_Report_${Date.now()}.xlsx`);
    res.send(buffer);

  } catch (error) { 
    next(error); 
  }
};

// 5. Complete Directory (Comprehensive Data)
exports.periodicalsCompleteDirectoryReport = async (req, res, next) => {
  try {
    const periodicals = await Periodical.find().sort({ title: 1 });

    const workbook = new ExcelJS.Workbook();
    const worksheet = workbook.addWorksheet("Complete Directory");

    // Comprehensive column list based on your Periodical Schema
    worksheet.columns = [
      { header: "Title", key: "title", width: 30 },
      { header: "Subtitle", key: "subtitle", width: 25 },
      { header: "Authors", key: "authors", width: 30 },
      { header: "Publisher", key: "publisher", width: 20 },
      { header: "ISSN", key: "issn", width: 15 },
      { header: "Frequency", key: "frequency", width: 12 },
      { header: "Volume", key: "volume", width: 10 },
      { header: "Issue", key: "issue", width: 10 },
      { header: "Month", key: "periodicalMonth", width: 12 },
      { header: "Year", key: "periodicalYear", width: 10 },
      { header: "Series", key: "series", width: 15 },
      { header: "Subscription Date", key: "subscriptionDate", width: 18 },
      { header: "Receipt Date", key: "receiptDate", width: 18 },
      { header: "Dept to Issue", key: "departmentToIssue", width: 18 },
      { header: "Dept Issue Date", key: "departmentIssueDate", width: 18 },
      { header: "Add-on Copies", key: "addOnCopies", width: 12 },
      { header: "Order No", key: "orderNo", width: 12 },
      { header: "PO No", key: "poNo", width: 15 },
      { header: "Vendor Name", key: "vendorName", width: 20 },
      { header: "Vendor Phone", key: "vendorPhone", width: 15 },
      { header: "Vendor Email", key: "vendorEmail", width: 25 },
      { header: "Mode", key: "mode", width: 12 },
      { header: "URL", key: "url", width: 25 },
      { header: "Currency", key: "currency", width: 10 },
      { header: "Amount", key: "amount", width: 12 },
      { header: "Payment Remarks", key: "remarksForPayment", width: 25 },
      { header: "Language", key: "language", width: 12 },
      { header: "Status", key: "status", width: 12 },
      { header: "Notes", key: "notes", width: 30 },
    ];

    // Dark Blue/Navy Header
    worksheet.getRow(1).font = { bold: true, color: { argb: "FFFFFFFF" } };
    worksheet.getRow(1).fill = { 
        type: "pattern", 
        pattern: "solid", 
        fgColor: { argb: "FF203764" } 
    };

    periodicals.forEach((p) => {
      worksheet.addRow({
        title: p.title,
        subtitle: p.subtitle,
        authors: Array.isArray(p.authors) ? p.authors.join(", ") : "",
        publisher: p.publisher,
        issn: p.issn,
        frequency: p.frequency,
        volume: p.volume,
        issue: p.issue,
        periodicalMonth: p.periodicalMonth,
        periodicalYear: p.periodicalYear,
        series: p.series,
        subscriptionDate: p.subscriptionDate ? new Date(p.subscriptionDate).toLocaleDateString() : "",
        receiptDate: p.receiptDate ? new Date(p.receiptDate).toLocaleDateString() : "",
        departmentToIssue: p.departmentToIssue,
        departmentIssueDate: p.departmentIssueDate ? new Date(p.departmentIssueDate).toLocaleDateString() : "",
        addOnCopies: p.addOnCopies,
        orderNo: p.orderNo,
        poNo: p.poNo,
        vendorName: p.vendorDetails?.name || "",
        vendorPhone: p.vendorDetails?.phone || "",
        vendorEmail: p.vendorDetails?.email || "",
        mode: p.mode,
        url: p.url,
        currency: p.paymentDetails?.currency || "",
        amount: p.paymentDetails?.amount || 0,
        remarksForPayment: p.remarksForPayment,
        language: p.language,
        status: p.status,
        notes: p.notes,
      });
    });

    // Formatting: Middle alignment and text wrapping for long fields
    worksheet.columns.forEach((column) => {
        column.alignment = { vertical: "middle", horizontal: "left", wrapText: true };
    });

    const buffer = await workbook.xlsx.writeBuffer();
    
    res.setHeader("Content-Type", "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet");
    res.setHeader("Content-Disposition", `attachment; filename=Periodicals_Complete_Directory_${Date.now()}.xlsx`);
    res.send(buffer);

  } catch (error) { 
    next(error); 
  }
};

// 6. Missing Issues Report (Overdue Only)
exports.periodicalsMissingIssuesReport = async (req, res, next) => {
  try {
    // Only fetch periodicals that have a previous receipt date and are Active
    const periodicals = await Periodical.find({
      receiptDate: { $ne: null },
      status: "Active"
    }).sort({ receiptDate: 1 });

    const currentDate = new Date();
    const missingIssues = [];

    periodicals.forEach((periodical) => {
      const lastReceiptDate = new Date(periodical.receiptDate);
      let expectedNextDate = new Date(lastReceiptDate);

      // Calculate expected next receipt based on frequency
      switch (periodical.frequency) {
        case "Daily":
          expectedNextDate.setDate(expectedNextDate.getDate() + 1);
          break;
        case "Weekly":
          expectedNextDate.setDate(expectedNextDate.getDate() + 7);
          break;
        case "Monthly":
          expectedNextDate.setMonth(expectedNextDate.getMonth() + 1);
          break;
        case "Bi-Monthly":
          expectedNextDate.setMonth(expectedNextDate.getMonth() + 2);
          break;
        case "Quarterly":
          expectedNextDate.setMonth(expectedNextDate.getMonth() + 3);
          break;
        case "Annual":
          expectedNextDate.setFullYear(expectedNextDate.getFullYear() + 1);
          break;
        default:
          return;
      }

      // ONLY include if the current date has passed the expected date
      if (currentDate > expectedNextDate) {
        const daysOverdue = Math.floor((currentDate - expectedNextDate) / (1000 * 60 * 60 * 24));
        missingIssues.push({
          ...periodical.toObject(),
          expectedNextDate,
          daysOverdue,
        });
      }
    });

    const workbook = new ExcelJS.Workbook();
    const worksheet = workbook.addWorksheet("Missing Issues Only");

    // Comprehensive 30-Column List (Urgent data first)
    worksheet.columns = [
      { header: "Expected Next Date", key: "expectedNextDate", width: 20 },
      { header: "Days Overdue", key: "daysOverdue", width: 15 },
      { header: "Last Receipt Date", key: "receiptDate", width: 18 },
      { header: "Title", key: "title", width: 30 },
      { header: "Frequency", key: "frequency", width: 12 },
      { header: "Vendor Name", key: "vendorName", width: 20 },
      { header: "Vendor Phone", key: "vendorPhone", width: 15 },
      { header: "Vendor Email", key: "vendorEmail", width: 25 },
      { header: "Publisher", key: "publisher", width: 20 },
      { header: "ISSN", key: "issn", width: 15 },
      { header: "Volume", key: "volume", width: 10 },
      { header: "Issue", key: "issue", width: 10 },
      { header: "Month", key: "periodicalMonth", width: 12 },
      { header: "Year", key: "periodicalYear", width: 10 },
      { header: "PO No", key: "poNo", width: 15 },
      { header: "Currency", key: "currency", width: 10 },
      { header: "Amount", key: "amount", width: 12 },
      { header: "Mode", key: "mode", width: 12 },
      { header: "Subscription Date", key: "subscriptionDate", width: 18 },
      { header: "Dept to Issue", key: "departmentToIssue", width: 18 },
      { header: "Order No", key: "orderNo", width: 12 },
      { header: "Language", key: "language", width: 12 },
      { header: "Notes", key: "notes", width: 30 },
    ];

    // Sharp Red Header (FFC00000)
    worksheet.getRow(1).font = { bold: true, color: { argb: "FFFFFFFF" } };
    worksheet.getRow(1).fill = { 
      type: "pattern", 
      pattern: "solid", 
      fgColor: { argb: "FFC00000" } 
    };

    missingIssues.forEach((p) => {
      const rowData = {
        expectedNextDate: p.expectedNextDate.toLocaleDateString(),
        daysOverdue: p.daysOverdue,
        receiptDate: new Date(p.receiptDate).toLocaleDateString(),
        title: p.title,
        frequency: p.frequency,
        vendorName: p.vendorDetails?.name || "",
        vendorPhone: p.vendorDetails?.phone || "",
        vendorEmail: p.vendorDetails?.email || "",
        publisher: p.publisher,
        issn: p.issn,
        volume: p.volume,
        issue: p.issue,
        periodicalMonth: p.periodicalMonth,
        periodicalYear: p.periodicalYear,
        poNo: p.poNo,
        currency: p.paymentDetails?.currency || "",
        amount: p.paymentDetails?.amount || 0,
        mode: p.mode,
        subscriptionDate: p.subscriptionDate ? new Date(p.subscriptionDate).toLocaleDateString() : "",
        departmentToIssue: p.departmentToIssue,
        orderNo: p.orderNo,
        language: p.language,
        notes: p.notes,
      };

      const row = worksheet.addRow(rowData);

      // Light Red highlight for critical delays (> 30 days)
      if (p.daysOverdue > 30) {
        row.eachCell((cell) => {
          cell.fill = {
            type: "pattern",
            pattern: "solid",
            fgColor: { argb: "FFFFC7CE" },
          };
        });
      }
    });

    // Vertical align and text wrapping
    worksheet.columns.forEach((column) => {
      column.alignment = { vertical: "middle", horizontal: "left", wrapText: true };
    });

    const buffer = await workbook.xlsx.writeBuffer();

    res.setHeader("Content-Type", "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet");
    res.setHeader("Content-Disposition", `attachment; filename=Missing_Issues_${Date.now()}.xlsx`);
    res.send(buffer);

  } catch (error) { 
    next(error); 
  }
};

// ==================== ABSTRACTS REPORTS ====================

exports.abstractsSubjectWiseReport = async (req, res, next) => {
  try {
    const { subject } = req.query;
    let filter = {};
    if (subject) {
      // Correctly handles the array field in your model
      filter.subject = { $in: [subject] }; 
    }

    const abstracts = await Abstract.find(filter).sort({ subject: 1, title: 1 });

    const workbook = new ExcelJS.Workbook();
    const worksheet = workbook.addWorksheet("Subject-wise Abstracts");

    // Comprehensive 15-column list (Subject first for this report)
    worksheet.columns = [
      { header: "Subject", key: "subject", width: 25 },
      { header: "Title", key: "title", width: 35 },
      { header: "Authors", key: "authors", width: 25 },
      { header: "Journal", key: "journal", width: 20 },
      { header: "Source", key: "source", width: 20 },
      { header: "Keywords", key: "keyword", width: 20 },
      { header: "Vol", key: "volume", width: 8 },
      { header: "Issue", key: "issue", width: 8 },
      { header: "Year", key: "year", width: 8 },
      { header: "Month", key: "publicationMonth", width: 12 },
      { header: "Summary", key: "summary", width: 40 },
      { header: "Status", key: "status", width: 12 },
      { header: "Published In AA", key: "publishedInAA", width: 25 },
      { header: "URL", key: "url", width: 25 },
      { header: "Remarks", key: "remarks", width: 20 },
    ];

    // Purple Header (FF7030A0)
    worksheet.getRow(1).font = { bold: true, color: { argb: "FFFFFFFF" } };
    worksheet.getRow(1).fill = { 
      type: "pattern", 
      pattern: "solid", 
      fgColor: { argb: "FF7030A0" } 
    };

    abstracts.forEach((a) => {
      worksheet.addRow({
        subject: Array.isArray(a.subject) ? a.subject.join(", ") : "",
        title: a.title,
        authors: Array.isArray(a.authors) ? a.authors.join(", ") : "",
        journal: a.journal,
        source: a.source,
        keyword: Array.isArray(a.keyword) ? a.keyword.join(", ") : "",
        volume: a.volume,
        issue: a.issue,
        year: a.year,
        publicationMonth: a.publicationMonth,
        summary: a.summary,
        status: a.status,
        publishedInAA: a.publishedInAA,
        url: a.url,
        remarks: a.remarks,
      });
    });

    // Formatting: Top alignment is best for rows with long summaries
    worksheet.columns.forEach((column) => {
      column.alignment = { vertical: "top", horizontal: "left", wrapText: true };
    });

    const buffer = await workbook.xlsx.writeBuffer();

    res.setHeader("Content-Type", "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet");
    res.setHeader("Content-Disposition", `attachment; filename=Subject_Report_${Date.now()}.xlsx`);
    
    res.send(buffer);
  } catch (error) { 
    next(error); 
  }
};

// 2. Yearly Archives Report
exports.abstractsYearlyArchivesReport = async (req, res, next) => {
  try {
    const { year } = req.query;
    let filter = year ? { year } : {};

    // Sorted by Year (desc) and then Title (asc)
    const abstracts = await Abstract.find(filter).sort({ year: -1, title: 1 });

    const workbook = new ExcelJS.Workbook();
    const worksheet = workbook.addWorksheet("Yearly Archives");

    // Comprehensive 15-column list (Year first as requested)
    worksheet.columns = [
      { header: "Year", key: "year", width: 10 },
      { header: "Title", key: "title", width: 35 },
      { header: "Authors", key: "authors", width: 25 },
      { header: "Journal", key: "journal", width: 20 },
      { header: "Source", key: "source", width: 20 },
      { header: "Keywords", key: "keyword", width: 20 },
      { header: "Vol", key: "volume", width: 8 },
      { header: "Issue", key: "issue", width: 8 },
      { header: "Month", key: "publicationMonth", width: 12 },
      { header: "Subject", key: "subject", width: 20 },
      { header: "Summary", key: "summary", width: 40 },
      { header: "Status", key: "status", width: 12 },
      { header: "Published In AA", key: "publishedInAA", width: 25 },
      { header: "URL", key: "url", width: 25 },
      { header: "Remarks", key: "remarks", width: 20 },
    ];

    // Slate Blue Header (FF44546A)
    worksheet.getRow(1).font = { bold: true, color: { argb: "FFFFFFFF" } };
    worksheet.getRow(1).fill = { 
      type: "pattern", 
      pattern: "solid", 
      fgColor: { argb: "FF44546A" } 
    };

    abstracts.forEach((a) => {
      worksheet.addRow({
        year: a.year,
        title: a.title,
        authors: Array.isArray(a.authors) ? a.authors.join(", ") : "",
        journal: a.journal,
        source: a.source,
        keyword: Array.isArray(a.keyword) ? a.keyword.join(", ") : "",
        volume: a.volume,
        issue: a.issue,
        publicationMonth: a.publicationMonth,
        subject: Array.isArray(a.subject) ? a.subject.join(", ") : "",
        summary: a.summary,
        status: a.status,
        publishedInAA: a.publishedInAA,
        url: a.url,
        remarks: a.remarks,
      });
    });

    // Formatting: Top alignment for better handling of multi-line summaries
    worksheet.columns.forEach((column) => {
      column.alignment = { vertical: "top", horizontal: "left", wrapText: true };
    });

    const buffer = await workbook.xlsx.writeBuffer();

    res.setHeader("Content-Type", "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet");
    res.setHeader("Content-Disposition", `attachment; filename=Yearly_Archive_${year || "All"}_${Date.now()}.xlsx`);
    
    res.send(buffer);
  } catch (error) { 
    next(error); 
  }
};

// 3. Published In AA Report (Filter for non-empty publishedInAA)
exports.abstractsPublishedInAAReport = async (req, res, next) => {
  try {
    // Only fetch records where PublishedInAA is actually filled
    const abstracts = await Abstract.find({
      publishedInAA: { $exists: true, $ne: "" }
    }).sort({ createdAt: -1 });

    const workbook = new ExcelJS.Workbook();
    const worksheet = workbook.addWorksheet("Published In AA");

    // Comprehensive 15-column list (Published In AA Details moved to first)
    worksheet.columns = [
      { header: "Published In AA Details", key: "publishedInAA", width: 35 },
      { header: "Title", key: "title", width: 35 },
      { header: "Authors", key: "authors", width: 25 },
      { header: "Journal", key: "journal", width: 20 },
      { header: "Source", key: "source", width: 20 },
      { header: "Keywords", key: "keyword", width: 20 },
      { header: "Vol", key: "volume", width: 8 },
      { header: "Issue", key: "issue", width: 8 },
      { header: "Year", key: "year", width: 8 },
      { header: "Month", key: "publicationMonth", width: 12 },
      { header: "Subject", key: "subject", width: 20 },
      { header: "Summary", key: "summary", width: 40 },
      { header: "Status", key: "status", width: 12 },
      { header: "URL", key: "url", width: 25 },
      { header: "Remarks", key: "remarks", width: 20 },
    ];

    // Rose/Crimson Header (FFE11D48)
    worksheet.getRow(1).font = { bold: true, color: { argb: "FFFFFFFF" } };
    worksheet.getRow(1).fill = { 
      type: "pattern", 
      pattern: "solid", 
      fgColor: { argb: "FFE11D48" } 
    };

    abstracts.forEach((a) => {
      worksheet.addRow({
        publishedInAA: a.publishedInAA,
        title: a.title,
        authors: Array.isArray(a.authors) ? a.authors.join(", ") : "",
        journal: a.journal,
        source: a.source,
        keyword: Array.isArray(a.keyword) ? a.keyword.join(", ") : "",
        volume: a.volume,
        issue: a.issue,
        year: a.year,
        publicationMonth: a.publicationMonth,
        subject: Array.isArray(a.subject) ? a.subject.join(", ") : "",
        summary: a.summary,
        status: a.status,
        url: a.url,
        remarks: a.remarks,
      });
    });

    // Formatting: Vertical alignment and text wrapping
    worksheet.columns.forEach((column) => {
      column.alignment = { vertical: "top", horizontal: "left", wrapText: true };
    });

    const buffer = await workbook.xlsx.writeBuffer();

    res.setHeader("Content-Type", "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet");
    res.setHeader("Content-Disposition", `attachment; filename=Published_In_AA_${Date.now()}.xlsx`);
    
    res.send(buffer);
  } catch (error) { 
    next(error); 
  }
};

// 4. Status-wise Report
exports.abstractsStatusWiseReport = async (req, res, next) => {
  try {
    const { status } = req.query;
    let filter = status ? { status } : {};

    const abstracts = await Abstract.find(filter).sort({ status: 1, title: 1 });

    const workbook = new ExcelJS.Workbook();
    const worksheet = workbook.addWorksheet("Status-wise Abstracts");

    // Comprehensive 15-column list based on your Abstract Schema
    worksheet.columns = [
      { header: "Status", key: "status", width: 12 },
      { header: "Title", key: "title", width: 35 },
      { header: "Authors", key: "authors", width: 25 },
      { header: "Journal", key: "journal", width: 20 },
      { header: "Source", key: "source", width: 20 },
      { header: "Keywords", key: "keyword", width: 20 },
      { header: "Vol", key: "volume", width: 8 },
      { header: "Issue", key: "issue", width: 8 },
      { header: "Year", key: "year", width: 8 },
      { header: "Month", key: "publicationMonth", width: 12 },
      { header: "Subject", key: "subject", width: 20 },
      { header: "Summary", key: "summary", width: 40 },
      { header: "Published In AA", key: "publishedInAA", width: 25 },
      { header: "URL", key: "url", width: 25 },
      { header: "Remarks", key: "remarks", width: 20 },
    ];

    // Dark Green Header (FF00B050)
    worksheet.getRow(1).font = { bold: true, color: { argb: "FFFFFFFF" } };
    worksheet.getRow(1).fill = { 
      type: "pattern", 
      pattern: "solid", 
      fgColor: { argb: "FF00B050" } 
    };

    abstracts.forEach((a) => {
      worksheet.addRow({
        status: a.status,
        title: a.title,
        authors: Array.isArray(a.authors) ? a.authors.join(", ") : "",
        journal: a.journal,
        source: a.source,
        keyword: Array.isArray(a.keyword) ? a.keyword.join(", ") : "",
        volume: a.volume,
        issue: a.issue,
        year: a.year,
        publicationMonth: a.publicationMonth,
        subject: Array.isArray(a.subject) ? a.subject.join(", ") : "",
        summary: a.summary,
        publishedInAA: a.publishedInAA,
        url: a.url,
        remarks: a.remarks,
      });
    });

    // Formatting: Top alignment for long summaries and text wrapping
    worksheet.columns.forEach((column) => {
      column.alignment = { vertical: "top", horizontal: "left", wrapText: true };
    });

    const buffer = await workbook.xlsx.writeBuffer();

    res.setHeader("Content-Type", "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet");
    res.setHeader("Content-Disposition", `attachment; filename=Abstracts_Status_Report_${Date.now()}.xlsx`);
    
    res.send(buffer);
  } catch (error) { 
    next(error); 
  }
};

// 5. Complete Directory (Comprehensive All-Field Report)
exports.abstractsCompleteDirectoryReport = async (req, res, next) => {
  try {
    // Sorting by newest first as per your original logic
    const abstracts = await Abstract.find().sort({ createdAt: -1 });

    const workbook = new ExcelJS.Workbook();
    const worksheet = workbook.addWorksheet("Complete Abstract Directory");

    // Comprehensive 15-column list based on your Abstract Schema
    worksheet.columns = [
      { header: "Title", key: "title", width: 35 },
      { header: "Authors", key: "authors", width: 25 },
      { header: "Journal", key: "journal", width: 20 },
      { header: "Source", key: "source", width: 20 },
      { header: "Keywords", key: "keyword", width: 20 },
      { header: "Vol", key: "volume", width: 8 },
      { header: "Issue", key: "issue", width: 8 },
      { header: "Year", key: "year", width: 8 },
      { header: "Month", key: "publicationMonth", width: 12 },
      { header: "Subject", key: "subject", width: 20 },
      { header: "Summary", key: "summary", width: 40 }, // Added missing field
      { header: "Status", key: "status", width: 12 },
      { header: "Published In AA", key: "publishedInAA", width: 25 },
      { header: "URL", key: "url", width: 25 }, // Added missing field
      { header: "Remarks", key: "remarks", width: 20 },
    ];

    // Navy Header (FF203764)
    worksheet.getRow(1).font = { bold: true, color: { argb: "FFFFFFFF" } };
    worksheet.getRow(1).fill = { 
      type: "pattern", 
      pattern: "solid", 
      fgColor: { argb: "FF203764" } 
    };

    abstracts.forEach((a) => {
      worksheet.addRow({
        title: a.title,
        // Using Array check for safety on authors, keywords, and subjects
        authors: Array.isArray(a.authors) ? a.authors.join(", ") : "",
        journal: a.journal,
        source: a.source,
        keyword: Array.isArray(a.keyword) ? a.keyword.join(", ") : "",
        volume: a.volume,
        issue: a.issue,
        year: a.year,
        publicationMonth: a.publicationMonth,
        subject: Array.isArray(a.subject) ? a.subject.join(", ") : "",
        summary: a.summary, // Mapping added
        status: a.status,
        publishedInAA: a.publishedInAA,
        url: a.url, // Mapping added
        remarks: a.remarks,
      });
    });

    // Formatting: Ensure long text like Summary wraps and aligns to top/left
    worksheet.columns.forEach((column) => {
      column.alignment = { vertical: "top", horizontal: "left", wrapText: true };
    });

    const buffer = await workbook.xlsx.writeBuffer();

    res.setHeader("Content-Type", "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet");
    res.setHeader("Content-Disposition", `attachment; filename=Complete_Abstract_Directory_${Date.now()}.xlsx`);
    
    res.send(buffer);
  } catch (error) { 
    next(error); 
  }
};

// ==================== KC MEMBERSHIP REPORTS ====================

// 10. Complete Membership Report
exports.kcMembersCompleteReport = async (req, res, next) => {
  try {
    const members = await KCMember.find().sort({ institutionName: 1 });

    const workbook = new ExcelJS.Workbook();
    const worksheet = workbook.addWorksheet("Complete Membership");

    // Comprehensive 20-column list based on your KCMember Schema
    worksheet.columns = [
      { header: "Membership ID", key: "membershipId", width: 15 },
      { header: "Institution Name", key: "institutionName", width: 30 },
      { header: "Contact Person", key: "contactPerson", width: 25 },
      { header: "Designation", key: "designation", width: 20 },
      { header: "Membership Type", key: "membershipType", width: 25 },
      { header: "Subscription Type", key: "subscriptionType", width: 20 },
      { header: "Membership Status", key: "membershipStatus", width: 15 },
      { header: "Start Date", key: "membershipStartDate", width: 15 },
      { header: "End Date", key: "membershipEndDate", width: 15 },
      { header: "Email", key: "email", width: 30 },
      { header: "Phone", key: "phone", width: 15 },
      { header: "Alt Phone", key: "alternatePhone", width: 15 },
      { header: "Website", key: "website", width: 25 },
      { header: "Complete Address", key: "completeAddress", width: 40 },
      { header: "Fees", key: "fees", width: 12 },
      { header: "Payment Status", key: "paymentStatus", width: 15 },
      { header: "Last Payment Date", key: "lastPaymentDate", width: 18 },
      { header: "Transaction ID", key: "transactionId", width: 20 },
      { header: "Bank Name", key: "nameOfBank", width: 20 },
      { header: "Notes", key: "notes", width: 30 },
    ];

    // Standard Blue Header (FF0070C0)
    worksheet.getRow(1).font = { bold: true, color: { argb: "FFFFFFFF" } };
    worksheet.getRow(1).fill = {
      type: "pattern",
      pattern: "solid",
      fgColor: { argb: "FF0070C0" },
    };

    members.forEach((m) => {
      worksheet.addRow({
        membershipId: m.membershipId,
        institutionName: m.institutionName,
        contactPerson: m.contactPerson,
        designation: m.designation || "",
        membershipType: m.membershipType,
        subscriptionType: m.subscriptionType || "",
        membershipStatus: m.membershipStatus || "",
        membershipStartDate: m.membershipStartDate ? new Date(m.membershipStartDate).toLocaleDateString() : "",
        membershipEndDate: m.membershipEndDate ? new Date(m.membershipEndDate).toLocaleDateString() : "",
        email: m.email || "",
        phone: m.phone || "",
        alternatePhone: m.alternatePhone || "",
        website: m.website || "",
        completeAddress: m.completeAddress || "",
        fees: m.fees || 0,
        paymentStatus: m.paymentStatus || "",
        lastPaymentDate: m.lastPaymentDate ? new Date(m.lastPaymentDate).toLocaleDateString() : "",
        transactionId: m.transactionId || "",
        nameOfBank: m.nameOfBank || "",
        notes: m.notes || "",
      });
    });

    // Formatting: Scannable alignment and wrapping for long addresses/notes
    worksheet.columns.forEach((column) => {
      column.alignment = { vertical: "middle", horizontal: "left", wrapText: true };
    });

    const buffer = await workbook.xlsx.writeBuffer();

    res.setHeader("Content-Type", "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet");
    res.setHeader("Content-Disposition", `attachment; filename=KC_Complete_Membership_${Date.now()}.xlsx`);
    
    res.send(buffer);
  } catch (error) {
    next(error);
  }
};

// 11. Payment Status Report
exports.kcMembersPaymentStatusReport = async (req, res, next) => {
  try {
    // Sorted by Payment Status first, then Institution Name
    const members = await KCMember.find().sort({
      paymentStatus: 1,
      institutionName: 1,
    });

    const workbook = new ExcelJS.Workbook();
    const worksheet = workbook.addWorksheet("Payment Status");

    // Comprehensive 20-column list (Payment details moved to front)
    worksheet.columns = [
      { header: "Payment Status", key: "paymentStatus", width: 15 },
      { header: "Institution Name", key: "institutionName", width: 30 },
      { header: "Contact Person", key: "contactPerson", width: 25 },
      { header: "Fees", key: "fees", width: 12 },
      { header: "Last Payment Date", key: "lastPaymentDate", width: 18 },
      { header: "Transaction ID", key: "transactionId", width: 20 },
      { header: "Bank Name", key: "nameOfBank", width: 20 },
      { header: "Membership ID", key: "membershipId", width: 15 },
      { header: "Designation", key: "designation", width: 20 },
      { header: "Membership Type", key: "membershipType", width: 25 },
      { header: "Subscription Type", key: "subscriptionType", width: 20 },
      { header: "Membership Status", key: "membershipStatus", width: 15 },
      { header: "Start Date", key: "membershipStartDate", width: 15 },
      { header: "End Date", key: "membershipEndDate", width: 15 },
      { header: "Email", key: "email", width: 30 },
      { header: "Phone", key: "phone", width: 15 },
      { header: "Alt Phone", key: "alternatePhone", width: 15 },
      { header: "Website", key: "website", width: 25 },
      { header: "Complete Address", key: "completeAddress", width: 40 },
      { header: "Notes", key: "notes", width: 30 },
    ];

    // Green Header (FF00B050)
    worksheet.getRow(1).font = { bold: true, color: { argb: "FFFFFFFF" } };
    worksheet.getRow(1).fill = {
      type: "pattern",
      pattern: "solid",
      fgColor: { argb: "FF00B050" },
    };

    members.forEach((m) => {
      const row = worksheet.addRow({
        paymentStatus: m.paymentStatus || "Unpaid",
        institutionName: m.institutionName,
        contactPerson: m.contactPerson,
        fees: m.fees || 0,
        lastPaymentDate: m.lastPaymentDate ? new Date(m.lastPaymentDate).toLocaleDateString() : "",
        transactionId: m.transactionId || "",
        nameOfBank: m.nameOfBank || "",
        membershipId: m.membershipId,
        designation: m.designation || "",
        membershipType: m.membershipType,
        subscriptionType: m.subscriptionType || "",
        membershipStatus: m.membershipStatus || "",
        membershipStartDate: m.membershipStartDate ? new Date(m.membershipStartDate).toLocaleDateString() : "",
        membershipEndDate: m.membershipEndDate ? new Date(m.membershipEndDate).toLocaleDateString() : "",
        email: m.email || "",
        phone: m.phone || "",
        alternatePhone: m.alternatePhone || "",
        website: m.website || "",
        completeAddress: m.completeAddress || "",
        notes: m.notes || "",
      });

      // Highlight unpaid status in red with white text
      if (m.paymentStatus === "Unpaid" || !m.paymentStatus) {
        const statusCell = row.getCell("paymentStatus");
        statusCell.fill = {
          type: "pattern",
          pattern: "solid",
          fgColor: { argb: "FFFF0000" },
        };
        statusCell.font = {
          color: { argb: "FFFFFFFF" },
          bold: true,
        };
      }
    });

    // Formatting: Apply uniform alignment and wrapping
    worksheet.columns.forEach((column) => {
      column.alignment = { vertical: "middle", horizontal: "left", wrapText: true };
    });

    const buffer = await workbook.xlsx.writeBuffer();

    res.setHeader("Content-Type", "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet");
    res.setHeader("Content-Disposition", `attachment; filename=KC_Payment_Status_${Date.now()}.xlsx`);
    
    res.send(buffer);
  } catch (error) {
    next(error);
  }
};

exports.kcMembersOverdueReport = async (req, res, next) => {
  try {
    const currentDate = new Date();
    // Only fetch members who are Unpaid and past their End Date
    const overdueMembers = await KCMember.find({
      paymentStatus: "Unpaid",
      membershipEndDate: { $lt: currentDate },
    }).sort({ membershipEndDate: 1 });

    const workbook = new ExcelJS.Workbook();
    const worksheet = workbook.addWorksheet("Overdue Members");

    // Comprehensive 21-column list (Adding calculated "Days Overdue")
    worksheet.columns = [
      { header: "Days Overdue", key: "daysOverdue", width: 15 },
      { header: "End Date", key: "membershipEndDate", width: 15 },
      { header: "Institution Name", key: "institutionName", width: 30 },
      { header: "Contact Person", key: "contactPerson", width: 25 },
      { header: "Membership ID", key: "membershipId", width: 15 },
      { header: "Email", key: "email", width: 30 },
      { header: "Phone", key: "phone", width: 15 },
      { header: "Fees", key: "fees", width: 12 },
      { header: "Payment Status", key: "paymentStatus", width: 15 },
      { header: "Membership Type", key: "membershipType", width: 25 },
      { header: "Subscription Type", key: "subscriptionType", width: 20 },
      { header: "Designation", key: "designation", width: 20 },
      { header: "Membership Status", key: "membershipStatus", width: 15 },
      { header: "Start Date", key: "membershipStartDate", width: 15 },
      { header: "Alt Phone", key: "alternatePhone", width: 15 },
      { header: "Website", key: "website", width: 25 },
      { header: "Complete Address", key: "completeAddress", width: 40 },
      { header: "Last Payment Date", key: "lastPaymentDate", width: 18 },
      { header: "Transaction ID", key: "transactionId", width: 20 },
      { header: "Bank Name", key: "nameOfBank", width: 20 },
      { header: "Notes", key: "notes", width: 30 },
    ];

    // Red Header (FFC00000)
    worksheet.getRow(1).font = { bold: true, color: { argb: "FFFFFFFF" } };
    worksheet.getRow(1).fill = {
      type: "pattern",
      pattern: "solid",
      fgColor: { argb: "FFC00000" },
    };

    overdueMembers.forEach((m) => {
      const daysOverdue = Math.floor(
        (currentDate - new Date(m.membershipEndDate)) / (1000 * 60 * 60 * 24)
      );

      const row = worksheet.addRow({
        daysOverdue: daysOverdue,
        membershipEndDate: new Date(m.membershipEndDate).toLocaleDateString(),
        institutionName: m.institutionName,
        contactPerson: m.contactPerson,
        membershipId: m.membershipId,
        email: m.email || "",
        phone: m.phone || "",
        fees: m.fees || 0,
        paymentStatus: m.paymentStatus,
        membershipType: m.membershipType,
        subscriptionType: m.subscriptionType || "",
        designation: m.designation || "",
        membershipStatus: m.membershipStatus || "",
        membershipStartDate: m.membershipStartDate ? new Date(m.membershipStartDate).toLocaleDateString() : "",
        alternatePhone: m.alternatePhone || "",
        website: m.website || "",
        completeAddress: m.completeAddress || "",
        lastPaymentDate: m.lastPaymentDate ? new Date(m.lastPaymentDate).toLocaleDateString() : "",
        transactionId: m.transactionId || "",
        nameOfBank: m.nameOfBank || "",
        notes: m.notes || "",
      });

      // Conditional formatting based on your logic
      if (daysOverdue > 90) {
        // Severe delay: Dark Red / White text
        row.eachCell((cell) => {
          cell.fill = {
            type: "pattern",
            pattern: "solid",
            fgColor: { argb: "FFFF0000" },
          };
          cell.font = { color: { argb: "FFFFFFFF" }, bold: true };
        });
      } else {
        // Moderate delay: Light Red / Pink background
        row.eachCell((cell) => {
          cell.fill = {
            type: "pattern",
            pattern: "solid",
            fgColor: { argb: "FFFFC7CE" },
          };
        });
      }
    });

    // Formatting alignment
    worksheet.columns.forEach((column) => {
      column.alignment = { vertical: "middle", horizontal: "left", wrapText: true };
    });

    const buffer = await workbook.xlsx.writeBuffer();

    res.setHeader("Content-Type", "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet");
    res.setHeader("Content-Disposition", `attachment; filename=KC_Overdue_Report_${Date.now()}.xlsx`);
    
    res.send(buffer);
  } catch (error) {
    next(error);
  }
};

exports.kcMembersSubscriptionAnalysisReport = async (req, res, next) => {
  try {
    const members = await KCMember.find().sort({ membershipType: 1, institutionName: 1 });

    const workbook = new ExcelJS.Workbook();
    const worksheet = workbook.addWorksheet("Subscription Analysis");

    // Comprehensive 24-column list (Analysis columns + all 20 schema fields)
    worksheet.columns = [
      { header: "Institution Name", key: "institutionName", width: 30 },
      { header: "Membership Type", key: "membershipType", width: 25 },
      { header: "Subscription Type", key: "subscriptionType", width: 20 },
      // Analysis Helper Columns
      { header: "Is Automotive Abstract", key: "isAA", width: 18 },
      { header: "Is ARAI Journal", key: "isJournal", width: 15 },
      { header: "Is KC Option 1", key: "isOpt1", width: 15 },
      { header: "Is KC Option 2", key: "isOpt2", width: 15 },
      // Remaining Schema Fields
      { header: "Membership ID", key: "membershipId", width: 15 },
      { header: "Contact Person", key: "contactPerson", width: 25 },
      { header: "Designation", key: "designation", width: 20 },
      { header: "Membership Status", key: "membershipStatus", width: 15 },
      { header: "Start Date", key: "membershipStartDate", width: 15 },
      { header: "End Date", key: "membershipEndDate", width: 15 },
      { header: "Email", key: "email", width: 30 },
      { header: "Phone", key: "phone", width: 15 },
      { header: "Alt Phone", key: "alternatePhone", width: 15 },
      { header: "Website", key: "website", width: 25 },
      { header: "Complete Address", key: "completeAddress", width: 40 },
      { header: "Fees", key: "fees", width: 12 },
      { header: "Payment Status", key: "paymentStatus", width: 15 },
      { header: "Last Payment Date", key: "lastPaymentDate", width: 18 },
      { header: "Transaction ID", key: "transactionId", width: 20 },
      { header: "Bank Name", key: "nameOfBank", width: 20 },
      { header: "Notes", key: "notes", width: 30 },
    ];

    // Purple Header (FF7030A0)
    worksheet.getRow(1).font = { bold: true, color: { argb: "FFFFFFFF" } };
    worksheet.getRow(1).fill = {
      type: "pattern",
      pattern: "solid",
      fgColor: { argb: "FF7030A0" },
    };

    members.forEach((m) => {
      // Mapping logic based on your schema's Enum values
      const type = m.membershipType || "";
      
      worksheet.addRow({
        institutionName: m.institutionName,
        membershipType: type,
        subscriptionType: m.subscriptionType || "",
        // Analysis Flags
        isAA: type === "Automotive Abstract" ? "Yes" : "No",
        isJournal: type === "ARAI Journal" ? "Yes" : "No",
        isOpt1: type === "KC Membership Option 1" ? "Yes" : "No",
        isOpt2: type === "KC Membership Option 2" ? "Yes" : "No",
        // Schema Fields
        membershipId: m.membershipId,
        contactPerson: m.contactPerson,
        designation: m.designation || "",
        membershipStatus: m.membershipStatus || "",
        membershipStartDate: m.membershipStartDate ? new Date(m.membershipStartDate).toLocaleDateString() : "",
        membershipEndDate: m.membershipEndDate ? new Date(m.membershipEndDate).toLocaleDateString() : "",
        email: m.email || "",
        phone: m.phone || "",
        alternatePhone: m.alternatePhone || "",
        website: m.website || "",
        completeAddress: m.completeAddress || "",
        fees: m.fees || 0,
        paymentStatus: m.paymentStatus || "",
        lastPaymentDate: m.lastPaymentDate ? new Date(m.lastPaymentDate).toLocaleDateString() : "",
        transactionId: m.transactionId || "",
        nameOfBank: m.nameOfBank || "",
        notes: m.notes || "",
      });
    });

    // Formatting alignment
    worksheet.columns.forEach((column) => {
      column.alignment = { vertical: "middle", horizontal: "left", wrapText: true };
    });

    const buffer = await workbook.xlsx.writeBuffer();

    res.setHeader("Content-Type", "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet");
    res.setHeader("Content-Disposition", `attachment; filename=KC_Subscription_Analysis_${Date.now()}.xlsx`);
    
    res.send(buffer);
  } catch (error) {
    next(error);
  }
};

exports.kcMembersUpcomingRenewalsReport = async (req, res, next) => {
  try {
    const currentDate = new Date();
    const thirtyDaysLater = new Date();
    thirtyDaysLater.setDate(currentDate.getDate() + 30);

    // Fetch members whose membership ends in the next 30 days
    const upcomingRenewals = await KCMember.find({
      membershipEndDate: {
        $gte: currentDate,
        $lte: thirtyDaysLater,
      },
    }).sort({ membershipEndDate: 1 });

    const workbook = new ExcelJS.Workbook();
    const worksheet = workbook.addWorksheet("Upcoming Renewals");

    // Comprehensive 21-column list (Calculated days first)
    worksheet.columns = [
      { header: "Days Until Renewal", key: "daysUntilRenewal", width: 18 },
      { header: "End Date", key: "membershipEndDate", width: 15 },
      { header: "Institution Name", key: "institutionName", width: 30 },
      { header: "Contact Person", key: "contactPerson", width: 25 },
      { header: "Membership ID", key: "membershipId", width: 15 },
      { header: "Email", key: "email", width: 30 },
      { header: "Phone", key: "phone", width: 15 },
      { header: "Fees", key: "fees", width: 12 },
      { header: "Payment Status", key: "paymentStatus", width: 15 },
      { header: "Membership Type", key: "membershipType", width: 25 },
      { header: "Subscription Type", key: "subscriptionType", width: 20 },
      { header: "Designation", key: "designation", width: 20 },
      { header: "Membership Status", key: "membershipStatus", width: 15 },
      { header: "Start Date", key: "membershipStartDate", width: 15 },
      { header: "Alt Phone", key: "alternatePhone", width: 15 },
      { header: "Website", key: "website", width: 25 },
      { header: "Complete Address", key: "completeAddress", width: 40 },
      { header: "Last Payment Date", key: "lastPaymentDate", width: 18 },
      { header: "Transaction ID", key: "transactionId", width: 20 },
      { header: "Bank Name", key: "nameOfBank", width: 20 },
      { header: "Notes", key: "notes", width: 30 },
    ];

    // Gold/Yellow Header (FFFFC000)
    worksheet.getRow(1).font = { bold: true, color: { argb: "FFFFFFFF" } };
    worksheet.getRow(1).fill = {
      type: "pattern",
      pattern: "solid",
      fgColor: { argb: "FFFFC000" },
    };

    upcomingRenewals.forEach((m) => {
      const daysUntilRenewal = Math.floor(
        (new Date(m.membershipEndDate) - currentDate) / (1000 * 60 * 60 * 24)
      );

      const row = worksheet.addRow({
        daysUntilRenewal: daysUntilRenewal,
        membershipEndDate: new Date(m.membershipEndDate).toLocaleDateString(),
        institutionName: m.institutionName,
        contactPerson: m.contactPerson,
        membershipId: m.membershipId,
        email: m.email || "",
        phone: m.phone || "",
        fees: m.fees || 0,
        paymentStatus: m.paymentStatus || "",
        membershipType: m.membershipType,
        subscriptionType: m.subscriptionType || "",
        designation: m.designation || "",
        membershipStatus: m.membershipStatus || "",
        membershipStartDate: m.membershipStartDate ? new Date(m.membershipStartDate).toLocaleDateString() : "",
        alternatePhone: m.alternatePhone || "",
        website: m.website || "",
        completeAddress: m.completeAddress || "",
        lastPaymentDate: m.lastPaymentDate ? new Date(m.lastPaymentDate).toLocaleDateString() : "",
        transactionId: m.transactionId || "",
        nameOfBank: m.nameOfBank || "",
        notes: m.notes || "",
      });

      // Highlight urgent renewals (< 7 days) in Orange background
      if (daysUntilRenewal < 7) {
        row.eachCell((cell) => {
          cell.fill = {
            type: "pattern",
            pattern: "solid",
            fgColor: { argb: "FFFF9900" },
          };
          cell.font = { bold: true };
        });
      }
    });

    // Formatting: Scannable alignment
    worksheet.columns.forEach((column) => {
      column.alignment = { vertical: "middle", horizontal: "left", wrapText: true };
    });

    const buffer = await workbook.xlsx.writeBuffer();

    res.setHeader("Content-Type", "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet");
    res.setHeader("Content-Disposition", `attachment; filename=KC_Upcoming_Renewals_${Date.now()}.xlsx`);
    
    res.send(buffer);
  } catch (error) {
    next(error);
  }
};

exports.kcMembersPrintAddressLabelsReport = async (req, res, next) => {
  try {
    // Only fetching Paid members for mailing/stickers
    const members = await KCMember.find({
      paymentStatus: "Paid",
    }).sort({ institutionName: 1 });

    const workbook = new ExcelJS.Workbook();
    const worksheet = workbook.addWorksheet("Address Labels");

    // Primary Label column + all 20 schema fields for background reference
    worksheet.columns = [
      { header: "PRINTABLE LABEL", key: "label", width: 60 }, // The visual label
      { header: "Membership ID", key: "membershipId", width: 15 },
      { header: "Institution Name", key: "institutionName", width: 30 },
      { header: "Contact Person", key: "contactPerson", width: 25 },
      { header: "Designation", key: "designation", width: 20 },
      { header: "Membership Type", key: "membershipType", width: 25 },
      { header: "Subscription Type", key: "subscriptionType", width: 20 },
      { header: "Membership Status", key: "membershipStatus", width: 15 },
      { header: "Start Date", key: "membershipStartDate", width: 15 },
      { header: "End Date", key: "membershipEndDate", width: 15 },
      { header: "Email", key: "email", width: 30 },
      { header: "Phone", key: "phone", width: 15 },
      { header: "Alt Phone", key: "alternatePhone", width: 15 },
      { header: "Website", key: "website", width: 25 },
      { header: "Complete Address", key: "completeAddress", width: 40 },
      { header: "Fees", key: "fees", width: 12 },
      { header: "Payment Status", key: "paymentStatus", width: 15 },
      { header: "Last Payment Date", key: "lastPaymentDate", width: 18 },
      { header: "Transaction ID", key: "transactionId", width: 20 },
      { header: "Bank Name", key: "nameOfBank", width: 20 },
      { header: "Notes", key: "notes", width: 30 },
    ];

    // Royal Blue Header (FF4472C4)
    worksheet.getRow(1).font = { bold: true, color: { argb: "FFFFFFFF" } };
    worksheet.getRow(1).fill = {
      type: "pattern",
      pattern: "solid",
      fgColor: { argb: "FF4472C4" },
    };

    members.forEach((m) => {
      // Constructing the multi-line printable block
      const addressLabel = [
        m.institutionName,
        `Attn: ${m.contactPerson}`,
        m.designation || "",
        m.completeAddress || "",
        m.phone ? `Phone: ${m.phone}` : "",
        m.email ? `Email: ${m.email}` : "",
      ]
        .filter((line) => line && line.trim() !== "")
        .join("\n");

      const row = worksheet.addRow({
        label: addressLabel,
        membershipId: m.membershipId,
        institutionName: m.institutionName,
        contactPerson: m.contactPerson,
        designation: m.designation || "",
        membershipType: m.membershipType,
        subscriptionType: m.subscriptionType || "",
        membershipStatus: m.membershipStatus || "",
        membershipStartDate: m.membershipStartDate ? new Date(m.membershipStartDate).toLocaleDateString() : "",
        membershipEndDate: m.membershipEndDate ? new Date(m.membershipEndDate).toLocaleDateString() : "",
        email: m.email || "",
        phone: m.phone || "",
        alternatePhone: m.alternatePhone || "",
        website: m.website || "",
        completeAddress: m.completeAddress || "",
        fees: m.fees || 0,
        paymentStatus: m.paymentStatus,
        lastPaymentDate: m.lastPaymentDate ? new Date(m.lastPaymentDate).toLocaleDateString() : "",
        transactionId: m.transactionId || "",
        nameOfBank: m.nameOfBank || "",
        notes: m.notes || "",
      });

      // Styling the Label column specifically for printing
      const labelCell = row.getCell("label");
      row.height = 90; // Slightly increased height for better spacing
      labelCell.alignment = { vertical: "top", horizontal: "left", wrapText: true };
      labelCell.border = {
        top: { style: "thin" },
        left: { style: "thin" },
        bottom: { style: "thin" },
        right: { style: "thin" },
      };
    });

    const buffer = await workbook.xlsx.writeBuffer();

    res.setHeader("Content-Type", "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet");
    res.setHeader("Content-Disposition", `attachment; filename=KC_Address_Labels_${Date.now()}.xlsx`);
    
    res.send(buffer);
  } catch (error) {
    next(error);
  }
};

// ==================== ARRIVALS & NEWS PDF REPORTS ====================

// Helper function to create table in PDF
const createPDFTable = (doc, data, startY) => {
  const tableTop = startY;
  const rowHeight = 30;
  const colWidths = {
    title: 180,
    type: 100,
    category: 90,
    itemType: 80,
    status: 70,
    date: 90
  };

  let y = tableTop;

  // Draw header background
  doc.rect(50, y, 500, rowHeight).fill('#4472C4');

  // Header text
  doc.fontSize(9).fillColor('#FFFFFF').font('Helvetica-Bold');
  doc.text('Title', 55, y + 10, { width: colWidths.title - 10 });
  doc.text('Type', 235, y + 10, { width: colWidths.type - 10 });
  doc.text('Category', 335, y + 10, { width: colWidths.category - 10 });
  doc.text('Item Type', 425, y + 10, { width: colWidths.itemType - 10 });
  doc.text('Status', 505, y + 10, { width: colWidths.status - 10 });

  y += rowHeight;

  // Draw data rows
  doc.font('Helvetica').fontSize(8);
  let rowIndex = 0;

  data.forEach((item, index) => {
    // Alternate row colors
    if (rowIndex % 2 === 0) {
      doc.rect(50, y, 500, rowHeight).fillAndStroke('#F2F2F2', '#CCCCCC');
    } else {
      doc.rect(50, y, 500, rowHeight).fillAndStroke('#FFFFFF', '#CCCCCC');
    }

    // Row data
    doc.fillColor('#000000');
    doc.text(item.title || 'N/A', 55, y + 8, { width: colWidths.title - 10, height: rowHeight - 16, ellipsis: true });
    doc.text(item.type || 'N/A', 235, y + 8, { width: colWidths.type - 10 });
    doc.text(item.category || 'N/A', 335, y + 8, { width: colWidths.category - 10 });
    doc.text(item.itemType || 'N/A', 425, y + 8, { width: colWidths.itemType - 10 });
    doc.text(item.status || 'N/A', 505, y + 8, { width: colWidths.status - 10 });

    y += rowHeight;
    rowIndex++;

    // Check if we need a new page
    if (y > 700 && index < data.length - 1) {
      doc.addPage();
      y = 50;
    }
  });

  return y;
};

// 1. Category-wise Report
exports.arrivalsNewsCategoryWiseReport = async (req, res, next) => {
  try {
    const { category } = req.query;
    
    if (!category) {
      return res.status(400).json({
        success: false,
        message: 'Category parameter is required'
      });
    }

    const items = await ArrivalAndNews.find({ category }).sort({ createdAt: -1 });

    if (items.length === 0) {
      return res.status(404).json({
        success: false,
        message: `No items found for category: ${category}`
      });
    }

    // Create PDF
    const doc = new PDFDocument({ margin: 50, size: 'A4' });

    // Set response headers
    res.setHeader('Content-Type', 'application/pdf');
    res.setHeader('Content-Disposition', `attachment; filename=Arrivals_News_Category_${category}_${Date.now()}.pdf`);

    // Pipe PDF to response
    doc.pipe(res);

    // Header
    doc.fontSize(20).fillColor('#4472C4').font('Helvetica-Bold');
    doc.text('Arrivals & News Report', { align: 'center' });
    
    doc.fontSize(14).fillColor('#000000').font('Helvetica');
    doc.text(`Category: ${category}`, { align: 'center' });
    
    doc.moveDown(0.5);
    doc.fontSize(10).fillColor('#666666');
    doc.text(`Generated on: ${new Date().toLocaleDateString()} at ${new Date().toLocaleTimeString()}`, { align: 'center' });
    doc.text(`Total Records: ${items.length}`, { align: 'center' });
    
    doc.moveDown(1);

    // Draw line
    doc.strokeColor('#4472C4').lineWidth(2);
    doc.moveTo(50, doc.y).lineTo(550, doc.y).stroke();
    doc.moveDown(1);

    // Create table
    createPDFTable(doc, items, doc.y);

    // Add footer
    const pageCount = doc.bufferedPageRange().count;
    for (let i = 0; i < pageCount; i++) {
      doc.switchToPage(i);
      doc.fontSize(8).fillColor('#666666');
      doc.text(
        `Page ${i + 1} of ${pageCount}`,
        50,
        doc.page.height - 50,
        { align: 'center' }
      );
    }

    // Finalize PDF
    doc.end();

  } catch (error) {
    next(error);
  }
};

// 2. Type-wise Report
exports.arrivalsNewsTypeWiseReport = async (req, res, next) => {
  try {
    const { type } = req.query;
    
    if (!type) {
      return res.status(400).json({
        success: false,
        message: 'Type parameter is required'
      });
    }

    const items = await ArrivalAndNews.find({ type }).sort({ createdAt: -1 });

    if (items.length === 0) {
      return res.status(404).json({
        success: false,
        message: `No items found for type: ${type}`
      });
    }

    // Create PDF
    const doc = new PDFDocument({ margin: 50, size: 'A4' });

    // Set response headers
    res.setHeader('Content-Type', 'application/pdf');
    res.setHeader('Content-Disposition', `attachment; filename=Arrivals_News_Type_${type.replace(/ /g, '_')}_${Date.now()}.pdf`);

    // Pipe PDF to response
    doc.pipe(res);

    // Header
    doc.fontSize(20).fillColor('#70AD47').font('Helvetica-Bold');
    doc.text('Arrivals & News Report', { align: 'center' });
    
    doc.fontSize(14).fillColor('#000000').font('Helvetica');
    doc.text(`Type: ${type}`, { align: 'center' });
    
    doc.moveDown(0.5);
    doc.fontSize(10).fillColor('#666666');
    doc.text(`Generated on: ${new Date().toLocaleDateString()} at ${new Date().toLocaleTimeString()}`, { align: 'center' });
    doc.text(`Total Records: ${items.length}`, { align: 'center' });
    
    doc.moveDown(1);

    // Draw line
    doc.strokeColor('#70AD47').lineWidth(2);
    doc.moveTo(50, doc.y).lineTo(550, doc.y).stroke();
    doc.moveDown(1);

    // Create table
    createPDFTable(doc, items, doc.y);

    // Add footer
    const pageCount = doc.bufferedPageRange().count;
    for (let i = 0; i < pageCount; i++) {
      doc.switchToPage(i);
      doc.fontSize(8).fillColor('#666666');
      doc.text(
        `Page ${i + 1} of ${pageCount}`,
        50,
        doc.page.height - 50,
        { align: 'center' }
      );
    }

    // Finalize PDF
    doc.end();

  } catch (error) {
    next(error);
  }
};

// 3. Priority-wise Report
exports.arrivalsNewsPriorityWiseReport = async (req, res, next) => {
  try {
    const { priority } = req.query;
    
    if (!priority) {
      return res.status(400).json({
        success: false,
        message: 'Priority parameter is required'
      });
    }

    const items = await ArrivalAndNews.find({ priority }).sort({ createdAt: -1 });

    if (items.length === 0) {
      return res.status(404).json({
        success: false,
        message: `No items found for priority: ${priority}`
      });
    }

    // Create PDF
    const doc = new PDFDocument({ margin: 50, size: 'A4' });

    // Set response headers
    res.setHeader('Content-Type', 'application/pdf');
    res.setHeader('Content-Disposition', `attachment; filename=Arrivals_News_Priority_${priority}_${Date.now()}.pdf`);

    // Pipe PDF to response
    doc.pipe(res);

    // Header color based on priority
    let headerColor = '#FFC000'; // Medium - Yellow
    if (priority === 'High') headerColor = '#ED7D31'; // Orange
    if (priority === 'Urgent') headerColor = '#C00000'; // Red

    doc.fontSize(20).fillColor(headerColor).font('Helvetica-Bold');
    doc.text('Arrivals & News Report', { align: 'center' });
    
    doc.fontSize(14).fillColor('#000000').font('Helvetica');
    doc.text(`Priority: ${priority}`, { align: 'center' });
    
    doc.moveDown(0.5);
    doc.fontSize(10).fillColor('#666666');
    doc.text(`Generated on: ${new Date().toLocaleDateString()} at ${new Date().toLocaleTimeString()}`, { align: 'center' });
    doc.text(`Total Records: ${items.length}`, { align: 'center' });
    
    doc.moveDown(1);

    // Draw line
    doc.strokeColor(headerColor).lineWidth(2);
    doc.moveTo(50, doc.y).lineTo(550, doc.y).stroke();
    doc.moveDown(1);

    // Create table
    createPDFTable(doc, items, doc.y);

    // Add footer
    const pageCount = doc.bufferedPageRange().count;
    for (let i = 0; i < pageCount; i++) {
      doc.switchToPage(i);
      doc.fontSize(8).fillColor('#666666');
      doc.text(
        `Page ${i + 1} of ${pageCount}`,
        50,
        doc.page.height - 50,
        { align: 'center' }
      );
    }

    // Finalize PDF
    doc.end();

  } catch (error) {
    next(error);
  }
};

// 4. Status-wise Report
exports.arrivalsNewsStatusWiseReport = async (req, res, next) => {
  try {
    const { status } = req.query;
    
    if (!status) {
      return res.status(400).json({
        success: false,
        message: 'Status parameter is required'
      });
    }

    const items = await ArrivalAndNews.find({ status }).sort({ createdAt: -1 });

    if (items.length === 0) {
      return res.status(404).json({
        success: false,
        message: `No items found for status: ${status}`
      });
    }

    // Create PDF
    const doc = new PDFDocument({ margin: 50, size: 'A4' });

    // Set response headers
    res.setHeader('Content-Type', 'application/pdf');
    res.setHeader('Content-Disposition', `attachment; filename=Arrivals_News_Status_${status}_${Date.now()}.pdf`);

    // Pipe PDF to response
    doc.pipe(res);

    // Header
    doc.fontSize(20).fillColor('#5B9BD5').font('Helvetica-Bold');
    doc.text('Arrivals & News Report', { align: 'center' });
    
    doc.fontSize(14).fillColor('#000000').font('Helvetica');
    doc.text(`Status: ${status}`, { align: 'center' });
    
    doc.moveDown(0.5);
    doc.fontSize(10).fillColor('#666666');
    doc.text(`Generated on: ${new Date().toLocaleDateString()} at ${new Date().toLocaleTimeString()}`, { align: 'center' });
    doc.text(`Total Records: ${items.length}`, { align: 'center' });
    
    doc.moveDown(1);

    // Draw line
    doc.strokeColor('#5B9BD5').lineWidth(2);
    doc.moveTo(50, doc.y).lineTo(550, doc.y).stroke();
    doc.moveDown(1);

    // Create table
    createPDFTable(doc, items, doc.y);

    // Add footer
    const pageCount = doc.bufferedPageRange().count;
    for (let i = 0; i < pageCount; i++) {
      doc.switchToPage(i);
      doc.fontSize(8).fillColor('#666666');
      doc.text(
        `Page ${i + 1} of ${pageCount}`,
        50,
        doc.page.height - 50,
        { align: 'center' }
      );
    }

    // Finalize PDF
    doc.end();

  } catch (error) {
    next(error);
  }
};

// 5. Complete Report (All Items)
exports.arrivalsNewsCompleteReport = async (req, res, next) => {
  try {
    const items = await ArrivalAndNews.find().sort({ createdAt: -1 });

    if (items.length === 0) {
      return res.status(404).json({
        success: false,
        message: 'No items found'
      });
    }

    // Create PDF
    const doc = new PDFDocument({ margin: 50, size: 'A4' });

    // Set response headers
    res.setHeader('Content-Type', 'application/pdf');
    res.setHeader('Content-Disposition', `attachment; filename=Arrivals_News_Complete_Report_${Date.now()}.pdf`);

    // Pipe PDF to response
    doc.pipe(res);

    // Header
    doc.fontSize(20).fillColor('#7030A0').font('Helvetica-Bold');
    doc.text('Arrivals & News - Complete Report', { align: 'center' });
    
    doc.moveDown(0.5);
    doc.fontSize(10).fillColor('#666666').font('Helvetica');
    doc.text(`Generated on: ${new Date().toLocaleDateString()} at ${new Date().toLocaleTimeString()}`, { align: 'center' });
    doc.text(`Total Records: ${items.length}`, { align: 'center' });
    
    doc.moveDown(1);

    // Draw line
    doc.strokeColor('#7030A0').lineWidth(2);
    doc.moveTo(50, doc.y).lineTo(550, doc.y).stroke();
    doc.moveDown(1);

    // Create table
    createPDFTable(doc, items, doc.y);

    // Add footer
    const pageCount = doc.bufferedPageRange().count;
    for (let i = 0; i < pageCount; i++) {
      doc.switchToPage(i);
      doc.fontSize(8).fillColor('#666666');
      doc.text(
        `Page ${i + 1} of ${pageCount}`,
        50,
        doc.page.height - 50,
        { align: 'center' }
      );
    }

    // Finalize PDF
    doc.end();

  } catch (error) {
    next(error);
  }
};

