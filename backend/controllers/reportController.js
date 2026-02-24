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

    // Add header row
    worksheet.columns = [
      { header: "ICN Number", key: "icnNumber", width: 15 },
      { header: "Standard Number", key: "standardNumber", width: 20 },
      { header: "Title", key: "title", width: 40 },
      { header: "Department", key: "department", width: 20 },
      { header: "Category", key: "category", width: 15 },
      { header: "Created Date", key: "createdAt", width: 20 },
    ];

    // Style header row
    worksheet.getRow(1).font = { bold: true, color: { argb: "FFFFFFFF" } };
    worksheet.getRow(1).fill = {
      type: "pattern",
      pattern: "solid",
      fgColor: { argb: "FF4472C4" },
    };

    // Add data rows
    standards.forEach((standard) => {
      worksheet.addRow({
        icnNumber: standard.icnNumber,
        standardNumber: standard.standardNumber,
        title: standard.title,
        department: standard.department,
        category: standard.category,
        createdAt: standard.createdAt
          ? new Date(standard.createdAt).toLocaleDateString()
          : "",
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

// 2. Category-wise Standards Report
exports.standardsCategoryWiseReport = async (req, res, next) => {
  try {
    const { category } = req.query;

    let filter = {};
    if (category) {
      filter.category = category;
    }

    const standards = await Standard.find(filter).sort({
      category: 1,
      icnNumber: 1,
    });

    const workbook = new ExcelJS.Workbook();
    const worksheet = workbook.addWorksheet("Category-wise Standards");

    worksheet.columns = [
      { header: "ICN Number", key: "icnNumber", width: 15 },
      { header: "Standard Number", key: "standardNumber", width: 20 },
      { header: "Title", key: "title", width: 40 },
      { header: "Category", key: "category", width: 15 },
      { header: "Department", key: "department", width: 20 },
      { header: "Created Date", key: "createdAt", width: 20 },
    ];

    worksheet.getRow(1).font = { bold: true, color: { argb: "FFFFFFFF" } };
    worksheet.getRow(1).fill = {
      type: "pattern",
      pattern: "solid",
      fgColor: { argb: "FF70AD47" },
    };

    standards.forEach((standard) => {
      worksheet.addRow({
        icnNumber: standard.icnNumber,
        standardNumber: standard.standardNumber,
        title: standard.title,
        category: standard.category,
        department: standard.department,
        createdAt: standard.createdAt
          ? new Date(standard.createdAt).toLocaleDateString()
          : "",
      });
    });

    worksheet.columns.forEach((column) => {
      column.alignment = { vertical: "middle", wrapText: true };
    });

    const buffer = await workbook.xlsx.writeBuffer();

    res.setHeader(
      "Content-Type",
      "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
    );
    res.setHeader(
      "Content-Disposition",
      `attachment; filename=Standards_Category_Report_${Date.now()}.xlsx`,
    );
    res.send(buffer);
  } catch (error) {
    next(error);
  }
};

// 3. Amendments History Report
exports.standardsAmendmentsReport = async (req, res, next) => {
  try {
    const standards = await Standard.find().sort({ updatedAt: -1 });

    const workbook = new ExcelJS.Workbook();
    const worksheet = workbook.addWorksheet("Amendments History");

    worksheet.columns = [
      { header: "ICN Number", key: "icnNumber", width: 15 },
      { header: "Standard Number", key: "standardNumber", width: 20 },
      { header: "Title", key: "title", width: 40 },
      { header: "Department", key: "department", width: 20 },
      { header: "Category", key: "category", width: 15 },
      { header: "Created Date", key: "createdAt", width: 20 },
      { header: "Last Modified", key: "updatedAt", width: 20 },
    ];

    worksheet.getRow(1).font = { bold: true, color: { argb: "FFFFFFFF" } };
    worksheet.getRow(1).fill = {
      type: "pattern",
      pattern: "solid",
      fgColor: { argb: "FFED7D31" },
    };

    standards.forEach((standard) => {
      worksheet.addRow({
        icnNumber: standard.icnNumber,
        standardNumber: standard.standardNumber,
        title: standard.title,
        department: standard.department,
        category: standard.category,
        createdAt: standard.createdAt
          ? new Date(standard.createdAt).toLocaleDateString()
          : "",
        updatedAt: standard.updatedAt
          ? new Date(standard.updatedAt).toLocaleString()
          : "",
      });
    });

    worksheet.columns.forEach((column) => {
      column.alignment = { vertical: "middle", wrapText: true };
    });

    const buffer = await workbook.xlsx.writeBuffer();

    res.setHeader(
      "Content-Type",
      "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
    );
    res.setHeader(
      "Content-Disposition",
      `attachment; filename=Standards_Amendments_Report_${Date.now()}.xlsx`,
    );
    res.send(buffer);
  } catch (error) {
    next(error);
  }
};

// ==================== PERIODICALS REPORTS ====================

// 4. Year-wise Periodicals Report
exports.periodicalsYearWiseReport = async (req, res, next) => {
  try {
    const { year } = req.query;

    let filter = {};
    if (year) {
      const startDate = new Date(`${year}-01-01`);
      const endDate = new Date(`${year}-12-31`);
      filter.subscriptionDate = { $gte: startDate, $lte: endDate };
    }

    const periodicals = await Periodical.find(filter).sort({
      subscriptionDate: -1,
    });

    const workbook = new ExcelJS.Workbook();
    const worksheet = workbook.addWorksheet("Year-wise Periodicals");

    worksheet.columns = [
      { header: "Title", key: "title", width: 30 },
      { header: "Publisher", key: "publisher", width: 25 },
      { header: "ISSN", key: "issn", width: 15 },
      { header: "Frequency", key: "frequency", width: 15 },
      { header: "Volume", key: "volume", width: 10 },
      { header: "Issue", key: "issue", width: 10 },
      { header: "Subscription Date", key: "subscriptionDate", width: 20 },
      { header: "Receipt Date", key: "receiptDate", width: 20 },
      { header: "Status", key: "status", width: 15 },
    ];

    worksheet.getRow(1).font = { bold: true, color: { argb: "FFFFFFFF" } };
    worksheet.getRow(1).fill = {
      type: "pattern",
      pattern: "solid",
      fgColor: { argb: "FF5B9BD5" },
    };

    periodicals.forEach((periodical) => {
      worksheet.addRow({
        title: periodical.title,
        publisher: periodical.publisher,
        issn: periodical.issn || "",
        frequency: periodical.frequency,
        volume: periodical.volume || "",
        issue: periodical.issue || "",
        subscriptionDate: periodical.subscriptionDate
          ? new Date(periodical.subscriptionDate).toLocaleDateString()
          : "",
        receiptDate: periodical.receiptDate
          ? new Date(periodical.receiptDate).toLocaleDateString()
          : "",
        status: periodical.status || "",
      });
    });

    worksheet.columns.forEach((column) => {
      column.alignment = { vertical: "middle", wrapText: true };
    });

    const buffer = await workbook.xlsx.writeBuffer();

    res.setHeader(
      "Content-Type",
      "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
    );
    res.setHeader(
      "Content-Disposition",
      `attachment; filename=Periodicals_Year_Report_${Date.now()}.xlsx`,
    );
    res.send(buffer);
  } catch (error) {
    next(error);
  }
};

// 5. Frequency-wise Periodicals Report
exports.periodicalsFrequencyWiseReport = async (req, res, next) => {
  try {
    const { frequency } = req.query;

    let filter = {};
    if (frequency) {
      filter.frequency = frequency;
    }

    const periodicals = await Periodical.find(filter).sort({
      frequency: 1,
      title: 1,
    });

    const workbook = new ExcelJS.Workbook();
    const worksheet = workbook.addWorksheet("Frequency-wise Periodicals");

    worksheet.columns = [
      { header: "Title", key: "title", width: 30 },
      { header: "Publisher", key: "publisher", width: 25 },
      { header: "Frequency", key: "frequency", width: 15 },
      { header: "ISSN", key: "issn", width: 15 },
      { header: "Volume", key: "volume", width: 10 },
      { header: "Issue", key: "issue", width: 10 },
      { header: "Last Receipt Date", key: "receiptDate", width: 20 },
      { header: "Department", key: "departmentToIssue", width: 20 },
    ];

    worksheet.getRow(1).font = { bold: true, color: { argb: "FFFFFFFF" } };
    worksheet.getRow(1).fill = {
      type: "pattern",
      pattern: "solid",
      fgColor: { argb: "FFC65911" },
    };

    periodicals.forEach((periodical) => {
      worksheet.addRow({
        title: periodical.title,
        publisher: periodical.publisher,
        frequency: periodical.frequency,
        issn: periodical.issn || "",
        volume: periodical.volume || "",
        issue: periodical.issue || "",
        receiptDate: periodical.receiptDate
          ? new Date(periodical.receiptDate).toLocaleDateString()
          : "",
        departmentToIssue: periodical.departmentToIssue || "",
      });
    });

    worksheet.columns.forEach((column) => {
      column.alignment = { vertical: "middle", wrapText: true };
    });

    const buffer = await workbook.xlsx.writeBuffer();

    res.setHeader(
      "Content-Type",
      "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
    );
    res.setHeader(
      "Content-Disposition",
      `attachment; filename=Periodicals_Frequency_Report_${Date.now()}.xlsx`,
    );
    res.send(buffer);
  } catch (error) {
    next(error);
  }
};

// 6. Missing Issues Report
exports.periodicalsMissingIssuesReport = async (req, res, next) => {
  try {
    const periodicals = await Periodical.find({
      receiptDate: { $ne: null },
    }).sort({ receiptDate: 1 });

    const currentDate = new Date();
    const missingIssues = [];

    periodicals.forEach((periodical) => {
      if (!periodical.receiptDate) return;

      const lastReceiptDate = new Date(periodical.receiptDate);
      let expectedNextDate;
      let daysDifference;

      // Calculate expected next receipt based on frequency
      switch (periodical.frequency) {
        case "Daily":
          expectedNextDate = new Date(lastReceiptDate);
          expectedNextDate.setDate(expectedNextDate.getDate() + 1);
          daysDifference = 1;
          break;
        case "Weekly":
          expectedNextDate = new Date(lastReceiptDate);
          expectedNextDate.setDate(expectedNextDate.getDate() + 7);
          daysDifference = 7;
          break;
        case "Bi-Monthly":
          expectedNextDate = new Date(lastReceiptDate);
          expectedNextDate.setMonth(expectedNextDate.getMonth() + 2);
          daysDifference = 60;
          break;
        case "Monthly":
          expectedNextDate = new Date(lastReceiptDate);
          expectedNextDate.setMonth(expectedNextDate.getMonth() + 1);
          daysDifference = 30;
          break;
        case "Quarterly":
          expectedNextDate = new Date(lastReceiptDate);
          expectedNextDate.setMonth(expectedNextDate.getMonth() + 3);
          daysDifference = 90;
          break;
        case "Annual":
          expectedNextDate = new Date(lastReceiptDate);
          expectedNextDate.setFullYear(expectedNextDate.getFullYear() + 1);
          daysDifference = 365;
          break;
        default:
          return;
      }

      // Check if issue is overdue
      if (currentDate > expectedNextDate) {
        const daysOverdue = Math.floor(
          (currentDate - expectedNextDate) / (1000 * 60 * 60 * 24),
        );
        missingIssues.push({
          ...periodical.toObject(),
          expectedNextDate,
          daysOverdue,
        });
      }
    });

    const workbook = new ExcelJS.Workbook();
    const worksheet = workbook.addWorksheet("Missing Issues");

    worksheet.columns = [
      { header: "Title", key: "title", width: 30 },
      { header: "Publisher", key: "publisher", width: 25 },
      { header: "Frequency", key: "frequency", width: 15 },
      { header: "Last Receipt Date", key: "receiptDate", width: 20 },
      { header: "Expected Next Date", key: "expectedNextDate", width: 20 },
      { header: "Days Overdue", key: "daysOverdue", width: 15 },
      { header: "ISSN", key: "issn", width: 15 },
      { header: "Volume", key: "volume", width: 10 },
    ];

    worksheet.getRow(1).font = { bold: true, color: { argb: "FFFFFFFF" } };
    worksheet.getRow(1).fill = {
      type: "pattern",
      pattern: "solid",
      fgColor: { argb: "FFC00000" },
    };

    missingIssues.forEach((periodical) => {
      const row = worksheet.addRow({
        title: periodical.title,
        publisher: periodical.publisher,
        frequency: periodical.frequency,
        receiptDate: new Date(periodical.receiptDate).toLocaleDateString(),
        expectedNextDate: new Date(
          periodical.expectedNextDate,
        ).toLocaleDateString(),
        daysOverdue: periodical.daysOverdue,
        issn: periodical.issn || "",
        volume: periodical.volume || "",
      });

      // Highlight overdue rows in red
      if (periodical.daysOverdue > 30) {
        row.fill = {
          type: "pattern",
          pattern: "solid",
          fgColor: { argb: "FFFFC7CE" },
        };
      }
    });

    worksheet.columns.forEach((column) => {
      column.alignment = { vertical: "middle", wrapText: true };
    });

    const buffer = await workbook.xlsx.writeBuffer();

    res.setHeader(
      "Content-Type",
      "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
    );
    res.setHeader(
      "Content-Disposition",
      `attachment; filename=Periodicals_Missing_Issues_${Date.now()}.xlsx`,
    );
    res.send(buffer);
  } catch (error) {
    next(error);
  }
};

// ==================== ABSTRACTS REPORTS ====================

// 7. Department-wise Abstracts Report
exports.abstractsDepartmentWiseReport = async (req, res, next) => {
  try {
    const { department } = req.query;

    let filter = {};
    if (department) {
      filter.department = department;
    }

    const abstracts = await Abstract.find(filter).sort({
      department: 1,
      createdAt: -1,
    });

    const workbook = new ExcelJS.Workbook();
    const worksheet = workbook.addWorksheet("Department-wise Abstracts");

    worksheet.columns = [
      { header: "Title", key: "title", width: 35 },
      { header: "Authors", key: "authors", width: 30 },
      { header: "Department", key: "department", width: 20 },
      { header: "Journal", key: "journal", width: 25 },
      { header: "Year", key: "year", width: 10 },
      { header: "Subject", key: "subject", width: 25 },
      { header: "Keywords", key: "keyword", width: 30 },
      { header: "Status", key: "status", width: 15 },
    ];

    worksheet.getRow(1).font = { bold: true, color: { argb: "FFFFFFFF" } };
    worksheet.getRow(1).fill = {
      type: "pattern",
      pattern: "solid",
      fgColor: { argb: "FF7030A0" },
    };

    abstracts.forEach((abstract) => {
      worksheet.addRow({
        title: abstract.title,
        authors: abstract.authors ? abstract.authors.join(", ") : "",
        department: abstract.department || "",
        journal: abstract.journal || "",
        year: abstract.year || "",
        subject: abstract.subject || "",
        keyword: abstract.keyword || "",
        status: abstract.status || "",
      });
    });

    worksheet.columns.forEach((column) => {
      column.alignment = { vertical: "middle", wrapText: true };
    });

    const buffer = await workbook.xlsx.writeBuffer();

    res.setHeader(
      "Content-Type",
      "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
    );
    res.setHeader(
      "Content-Disposition",
      `attachment; filename=Abstracts_Department_Report_${Date.now()}.xlsx`,
    );
    res.send(buffer);
  } catch (error) {
    next(error);
  }
};

// 8. Year-wise Abstracts Report
exports.abstractsYearWiseReport = async (req, res, next) => {
  try {
    const { year } = req.query;

    let filter = {};
    if (year) {
      filter.year = year;
    }

    const abstracts = await Abstract.find(filter).sort({ year: -1, title: 1 });

    const workbook = new ExcelJS.Workbook();
    const worksheet = workbook.addWorksheet("Year-wise Abstracts");

    worksheet.columns = [
      { header: "Title", key: "title", width: 35 },
      { header: "Authors", key: "authors", width: 30 },
      { header: "Year", key: "year", width: 10 },
      { header: "Publication Year", key: "publicationYear", width: 15 },
      { header: "Journal", key: "journal", width: 25 },
      { header: "Volume", key: "volume", width: 10 },
      { header: "Issue", key: "issue", width: 10 },
      { header: "Subject", key: "subject", width: 25 },
    ];

    worksheet.getRow(1).font = { bold: true, color: { argb: "FFFFFFFF" } };
    worksheet.getRow(1).fill = {
      type: "pattern",
      pattern: "solid",
      fgColor: { argb: "FF44546A" },
    };

    abstracts.forEach((abstract) => {
      worksheet.addRow({
        title: abstract.title,
        authors: abstract.authors ? abstract.authors.join(", ") : "",
        year: abstract.year || "",
        publicationYear: abstract.publicationYear || "",
        journal: abstract.journal || "",
        volume: abstract.volume || "",
        issue: abstract.issue || "",
        subject: abstract.subject || "",
      });
    });

    worksheet.columns.forEach((column) => {
      column.alignment = { vertical: "middle", wrapText: true };
    });

    const buffer = await workbook.xlsx.writeBuffer();

    res.setHeader(
      "Content-Type",
      "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
    );
    res.setHeader(
      "Content-Disposition",
      `attachment; filename=Abstracts_Year_Report_${Date.now()}.xlsx`,
    );
    res.send(buffer);
  } catch (error) {
    next(error);
  }
};

// 9. Keyword Analysis Report
exports.abstractsKeywordAnalysisReport = async (req, res, next) => {
  try {
    const abstracts = await Abstract.find({ keyword: { $ne: "" } });

    // Analyze keywords
    const keywordMap = new Map();

    abstracts.forEach((abstract) => {
      if (abstract.keyword) {
        const keywords = abstract.keyword
          .split(",")
          .map((k) => k.trim().toLowerCase());
        keywords.forEach((keyword) => {
          if (keyword) {
            if (keywordMap.has(keyword)) {
              keywordMap.get(keyword).count++;
              keywordMap.get(keyword).abstracts.push(abstract.title);
            } else {
              keywordMap.set(keyword, {
                keyword: keyword,
                count: 1,
                abstracts: [abstract.title],
              });
            }
          }
        });
      }
    });

    // Convert to array and sort by count
    const keywordAnalysis = Array.from(keywordMap.values()).sort(
      (a, b) => b.count - a.count,
    );

    const workbook = new ExcelJS.Workbook();
    const worksheet = workbook.addWorksheet("Keyword Analysis");

    worksheet.columns = [
      { header: "Keyword", key: "keyword", width: 25 },
      { header: "Frequency", key: "count", width: 15 },
      { header: "Related Abstracts", key: "abstracts", width: 60 },
    ];

    worksheet.getRow(1).font = { bold: true, color: { argb: "FFFFFFFF" } };
    worksheet.getRow(1).fill = {
      type: "pattern",
      pattern: "solid",
      fgColor: { argb: "FF00B050" },
    };

    keywordAnalysis.forEach((item) => {
      worksheet.addRow({
        keyword: item.keyword,
        count: item.count,
        abstracts:
          item.abstracts.slice(0, 5).join("; ") +
          (item.abstracts.length > 5 ? "..." : ""),
      });
    });

    worksheet.columns.forEach((column) => {
      column.alignment = { vertical: "middle", wrapText: true };
    });

    const buffer = await workbook.xlsx.writeBuffer();

    res.setHeader(
      "Content-Type",
      "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
    );
    res.setHeader(
      "Content-Disposition",
      `attachment; filename=Abstracts_Keyword_Analysis_${Date.now()}.xlsx`,
    );
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

    worksheet.columns = [
      { header: "Institution Name", key: "institutionName", width: 30 },
      { header: "Contact Person", key: "contactPerson", width: 25 },
      { header: "Designation", key: "designation", width: 25 },
      { header: "Membership Type", key: "membershipType", width: 20 },
      { header: "Email", key: "email", width: 30 },
      { header: "Phone", key: "phone", width: 15 },
      { header: "Start Date", key: "membershipStartDate", width: 15 },
      { header: "End Date", key: "membershipEndDate", width: 15 },
      { header: "Payment Status", key: "paymentStatus", width: 15 },
      { header: "Fees", key: "fees", width: 12 },
    ];

    worksheet.getRow(1).font = { bold: true, color: { argb: "FFFFFFFF" } };
    worksheet.getRow(1).fill = {
      type: "pattern",
      pattern: "solid",
      fgColor: { argb: "FF0070C0" },
    };

    members.forEach((member) => {
      worksheet.addRow({
        institutionName: member.institutionName,
        contactPerson: member.contactPerson,
        designation: member.designation || "",
        membershipType: member.membershipType,
        email: member.email || "",
        phone: member.phone || "",
        membershipStartDate: member.membershipStartDate
          ? new Date(member.membershipStartDate).toLocaleDateString()
          : "",
        membershipEndDate: member.membershipEndDate
          ? new Date(member.membershipEndDate).toLocaleDateString()
          : "",
        paymentStatus: member.paymentStatus || "",
        fees: member.fees || "",
      });
    });

    worksheet.columns.forEach((column) => {
      column.alignment = { vertical: "middle", wrapText: true };
    });

    const buffer = await workbook.xlsx.writeBuffer();

    res.setHeader(
      "Content-Type",
      "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
    );
    res.setHeader(
      "Content-Disposition",
      `attachment; filename=KC_Complete_Membership_${Date.now()}.xlsx`,
    );
    res.send(buffer);
  } catch (error) {
    next(error);
  }
};

// 11. Payment Status Report
exports.kcMembersPaymentStatusReport = async (req, res, next) => {
  try {
    const members = await KCMember.find().sort({
      paymentStatus: 1,
      institutionName: 1,
    });

    const workbook = new ExcelJS.Workbook();
    const worksheet = workbook.addWorksheet("Payment Status");

    worksheet.columns = [
      { header: "Institution Name", key: "institutionName", width: 30 },
      { header: "Contact Person", key: "contactPerson", width: 25 },
      { header: "Membership Type", key: "membershipType", width: 20 },
      { header: "Payment Status", key: "paymentStatus", width: 15 },
      { header: "Fees", key: "fees", width: 12 },
      { header: "Payment Frequency", key: "paymentFrequency", width: 18 },
      { header: "Last Payment Date", key: "lastPaymentDate", width: 18 },
      { header: "Transaction ID", key: "transactionId", width: 25 },
      { header: "Bank Name", key: "nameOfBank", width: 25 },
    ];

    worksheet.getRow(1).font = { bold: true, color: { argb: "FFFFFFFF" } };
    worksheet.getRow(1).fill = {
      type: "pattern",
      pattern: "solid",
      fgColor: { argb: "FF00B050" },
    };

    members.forEach((member) => {
      const row = worksheet.addRow({
        institutionName: member.institutionName,
        contactPerson: member.contactPerson,
        membershipType: member.membershipType,
        paymentStatus: member.paymentStatus || "",
        fees: member.fees || "",
        paymentFrequency: member.paymentFrequency || "",
        lastPaymentDate: member.lastPaymentDate
          ? new Date(member.lastPaymentDate).toLocaleDateString()
          : "",
        transactionId: member.transactionId || "",
        nameOfBank: member.nameOfBank || "",
      });

      // Highlight unpaid in red
      if (member.paymentStatus === "Unpaid") {
        row.getCell("paymentStatus").fill = {
          type: "pattern",
          pattern: "solid",
          fgColor: { argb: "FFFF0000" },
        };
        row.getCell("paymentStatus").font = {
          color: { argb: "FFFFFFFF" },
          bold: true,
        };
      }
    });

    worksheet.columns.forEach((column) => {
      column.alignment = { vertical: "middle", wrapText: true };
    });

    const buffer = await workbook.xlsx.writeBuffer();

    res.setHeader(
      "Content-Type",
      "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
    );
    res.setHeader(
      "Content-Disposition",
      `attachment; filename=KC_Payment_Status_${Date.now()}.xlsx`,
    );
    res.send(buffer);
  } catch (error) {
    next(error);
  }
};

exports.kcMembersOverdueReport = async (req, res, next) => {
  try {
    const currentDate = new Date();
    const overdueMembers = await KCMember.find({
      paymentStatus: "Unpaid",
      membershipEndDate: { $lt: currentDate },
    }).sort({ membershipEndDate: 1 });

    const workbook = new ExcelJS.Workbook();
    const worksheet = workbook.addWorksheet("Overdue Members");

    worksheet.columns = [
      { header: "Institution Name", key: "institutionName", width: 30 },
      { header: "Contact Person", key: "contactPerson", width: 25 },
      { header: "Email", key: "email", width: 30 },
      { header: "Phone", key: "phone", width: 15 },
      { header: "Membership Type", key: "membershipType", width: 20 },
      { header: "End Date", key: "membershipEndDate", width: 15 },
      { header: "Days Overdue", key: "daysOverdue", width: 15 },
      { header: "Fees", key: "fees", width: 12 },
      { header: "Payment Status", key: "paymentStatus", width: 15 },
    ];

    worksheet.getRow(1).font = { bold: true, color: { argb: "FFFFFFFF" } };
    worksheet.getRow(1).fill = {
      type: "pattern",
      pattern: "solid",
      fgColor: { argb: "FFC00000" },
    };

    overdueMembers.forEach((member) => {
      const daysOverdue = Math.floor(
        (currentDate - new Date(member.membershipEndDate)) /
          (1000 * 60 * 60 * 24),
      );

      const row = worksheet.addRow({
        institutionName: member.institutionName,
        contactPerson: member.contactPerson,
        email: member.email || "",
        phone: member.phone || "",
        membershipType: member.membershipType,
        membershipEndDate: new Date(
          member.membershipEndDate,
        ).toLocaleDateString(),
        daysOverdue: daysOverdue,
        fees: member.fees || "",
        paymentStatus: member.paymentStatus,
      });

      // Highlight severely overdue (>90 days) in darker red
      if (daysOverdue > 90) {
        row.fill = {
          type: "pattern",
          pattern: "solid",
          fgColor: { argb: "FFFF0000" },
        };
        row.font = { color: { argb: "FFFFFFFF" } };
      } else {
        row.fill = {
          type: "pattern",
          pattern: "solid",
          fgColor: { argb: "FFFFC7CE" },
        };
      }
    });

    worksheet.columns.forEach((column) => {
      column.alignment = { vertical: "middle", wrapText: true };
    });

    const buffer = await workbook.xlsx.writeBuffer();

    res.setHeader(
      "Content-Type",
      "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
    );
    res.setHeader(
      "Content-Disposition",
      `attachment; filename=KC_Overdue_Members_${Date.now()}.xlsx`,
    );
    res.send(buffer);
  } catch (error) {
    next(error);
  }
};

exports.kcMembersSubscriptionAnalysisReport = async (req, res, next) => {
  try {
    const members = await KCMember.find();

    const workbook = new ExcelJS.Workbook();
    const worksheet = workbook.addWorksheet("Subscription Analysis");

    worksheet.columns = [
      { header: "Institution Name", key: "institutionName", width: 30 },
      { header: "Membership Type", key: "membershipType", width: 20 },
      { header: "Automotive Abstracts", key: "automotiveAbstracts", width: 20 },
      { header: "ARAI Journal", key: "araiJournal", width: 18 },
      { header: "KC Option 1", key: "kcOption1", width: 15 },
      { header: "KC Option 2", key: "kcOption2", width: 15 },
      { header: "Total Subscriptions", key: "totalSubscriptions", width: 18 },
      { header: "Fees", key: "fees", width: 12 },
    ];

    worksheet.getRow(1).font = { bold: true, color: { argb: "FFFFFFFF" } };
    worksheet.getRow(1).fill = {
      type: "pattern",
      pattern: "solid",
      fgColor: { argb: "FF7030A0" },
    };

    members.forEach((member) => {
      const subscriptions = member.subscriptionTypes || {};
      const totalSubs =
        (subscriptions.automotiveAbstracts ? 1 : 0) +
        (subscriptions.araiJournal ? 1 : 0) +
        (subscriptions.kcMembershipOption1 ? 1 : 0) +
        (subscriptions.kcMembershipOption2 ? 1 : 0);

      worksheet.addRow({
        institutionName: member.institutionName,
        membershipType: member.membershipType,
        automotiveAbstracts: subscriptions.automotiveAbstracts ? "Yes" : "No",
        araiJournal: subscriptions.araiJournal ? "Yes" : "No",
        kcOption1: subscriptions.kcMembershipOption1 ? "Yes" : "No",
        kcOption2: subscriptions.kcMembershipOption2 ? "Yes" : "No",
        totalSubscriptions: totalSubs,
        fees: member.fees || "",
      });
    });

    worksheet.columns.forEach((column) => {
      column.alignment = { vertical: "middle", wrapText: true };
    });

    const buffer = await workbook.xlsx.writeBuffer();

    res.setHeader(
      "Content-Type",
      "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
    );
    res.setHeader(
      "Content-Disposition",
      `attachment; filename=KC_Subscription_Analysis_${Date.now()}.xlsx`,
    );
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

    const upcomingRenewals = await KCMember.find({
      membershipEndDate: {
        $gte: currentDate,
        $lte: thirtyDaysLater,
      },
    }).sort({ membershipEndDate: 1 });

    const workbook = new ExcelJS.Workbook();
    const worksheet = workbook.addWorksheet("Upcoming Renewals");

    worksheet.columns = [
      { header: "Institution Name", key: "institutionName", width: 30 },
      { header: "Contact Person", key: "contactPerson", width: 25 },
      { header: "Email", key: "email", width: 30 },
      { header: "Phone", key: "phone", width: 15 },
      { header: "Membership Type", key: "membershipType", width: 20 },
      { header: "End Date", key: "membershipEndDate", width: 15 },
      { header: "Days Until Renewal", key: "daysUntilRenewal", width: 18 },
      { header: "Fees", key: "fees", width: 12 },
      { header: "Payment Status", key: "paymentStatus", width: 15 },
    ];

    worksheet.getRow(1).font = { bold: true, color: { argb: "FFFFFFFF" } };
    worksheet.getRow(1).fill = {
      type: "pattern",
      pattern: "solid",
      fgColor: { argb: "FFFFC000" },
    };

    upcomingRenewals.forEach((member) => {
      const daysUntilRenewal = Math.floor(
        (new Date(member.membershipEndDate) - currentDate) /
          (1000 * 60 * 60 * 24),
      );

      const row = worksheet.addRow({
        institutionName: member.institutionName,
        contactPerson: member.contactPerson,
        email: member.email || "",
        phone: member.phone || "",
        membershipType: member.membershipType,
        membershipEndDate: new Date(
          member.membershipEndDate,
        ).toLocaleDateString(),
        daysUntilRenewal: daysUntilRenewal,
        fees: member.fees || "",
        paymentStatus: member.paymentStatus || "",
      });

      // Highlight urgent renewals (< 7 days) in orange
      if (daysUntilRenewal < 7) {
        row.fill = {
          type: "pattern",
          pattern: "solid",
          fgColor: { argb: "FFFF9900" },
        };
      }
    });

    worksheet.columns.forEach((column) => {
      column.alignment = { vertical: "middle", wrapText: true };
    });

    const buffer = await workbook.xlsx.writeBuffer();

    res.setHeader(
      "Content-Type",
      "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
    );
    res.setHeader(
      "Content-Disposition",
      `attachment; filename=KC_Upcoming_Renewals_${Date.now()}.xlsx`,
    );
    res.send(buffer);
  } catch (error) {
    next(error);
  }
};

exports.kcMembersPrintAddressLabelsReport = async (req, res, next) => {
  try {
    const members = await KCMember.find({
      paymentStatus: "Paid",
    }).sort({ institutionName: 1 });

    const workbook = new ExcelJS.Workbook();
    const worksheet = workbook.addWorksheet("Address Labels");

    worksheet.columns = [{ header: "Label", key: "label", width: 60 }];

    worksheet.getRow(1).font = { bold: true, color: { argb: "FFFFFFFF" } };
    worksheet.getRow(1).fill = {
      type: "pattern",
      pattern: "solid",
      fgColor: { argb: "FF4472C4" },
    };

    members.forEach((member) => {
      const addressLabel = [
        member.institutionName,
        `Attn: ${member.contactPerson}`,
        member.designation || "",
        member.completeAddress || "",
        member.phone ? `Phone: ${member.phone}` : "",
        member.email ? `Email: ${member.email}` : "",
      ]
        .filter((line) => line)
        .join("\n");

      const row = worksheet.addRow({
        label: addressLabel,
      });

      row.height = 80;
      row.alignment = { vertical: "top", wrapText: true };

      // Add border around each label
      row.eachCell((cell) => {
        cell.border = {
          top: { style: "thin" },
          left: { style: "thin" },
          bottom: { style: "thin" },
          right: { style: "thin" },
        };
      });
    });

    const buffer = await workbook.xlsx.writeBuffer();

    res.setHeader(
      "Content-Type",
      "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
    );
    res.setHeader(
      "Content-Disposition",
      `attachment; filename=KC_Address_Labels_${Date.now()}.xlsx`,
    );
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

