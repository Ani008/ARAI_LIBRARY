exports.importStandardsExcel = async (req, res) => {
  try {
    if (!req.file) {
      return res.status(400).json({
        success: false,
        message: "Excel file required",
      });
    }

    const workbook = XLSX.read(req.file.buffer, { type: "buffer" });
    const sheet = workbook.Sheets[workbook.SheetNames[0]];
    const rows = XLSX.utils.sheet_to_json(sheet);

    const formattedData = rows.map((row) => ({
      requisition_no: row["Req No."] || "",
      requisition_date: safeParseDate(row["Req Date"]),
      pr_no: row["PR number"] || "",
      po_no: row["PO Number"] || "",
      amount: Number(row["Amount"]) || 0,
      date_received: safeParseDate(row["Date Sent To Dept"]),

      standardNumber: row["Standard Number"] || "", // ❗ NO TEMP VALUES
      title: row["Title"] || "",
      status: row["Status"] || "Active",
      accnNumber: row["ACCN Number"] || "",
      publisher: row["Publisher"] || "",
      oldIcnNumber: row["OLD ICN No."] || "",
      department: row["Department"] || "General",

      summary: row["Summary / Remarks"] || "",
    }));

    let inserted = 0;
    let skipped = [];

    try {
      const result = await Standard.insertMany(formattedData, {
        ordered: false, // 🔥 continue even if some fail
      });

      inserted = result.length;
    } catch (err) {
      // 🔥 This catches partial failures
      if (err.writeErrors) {
        err.writeErrors.forEach((e) => {
          skipped.push({
            row: e.index,
            error: e.errmsg,
          });
        });

        inserted = formattedData.length - skipped.length;
      } else {
        throw err;
      }
    }

    res.json({
      success: true,
      message: "Excel import completed 🚀",
      inserted,
      skippedCount: skipped.length,
      skippedDetails: skipped,
    });

  } catch (error) {
    console.error("IMPORT ERROR:", error);
    res.status(500).json({
      success: false,
      message: "Excel import failed",
    });
  }
};