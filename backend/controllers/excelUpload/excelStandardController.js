const XLSX = require("xlsx");
const Standard = require("../../models/Standard");

exports.importStandardsExcel = async (req, res) => {
  try {

    if (!req.file) {
      return res.status(400).json({
        success: false,
        message: "Excel file required"
      });
    }

    const workbook = XLSX.read(req.file.buffer, {
      type: "buffer"
    });

    const sheet =
      workbook.Sheets[workbook.SheetNames[0]];

    const rows =
      XLSX.utils.sheet_to_json(sheet);

    let inserted = 0;
    let skipped = [];

    for (const row of rows) {
      try {

        await Standard.create({
          standardNumber: row["STD No"],
          department: row["Dept"],
          amendment_date:
            parseDate(row["Amendment Date"]),
          remarks: row["Remarks"] || "",
        });

        inserted++;

      } catch (err) {
        skipped.push(row["STD No"]);
      }
    }

    res.json({
      success: true,
      inserted,
      skipped
    });

  } catch (error) {
    console.error(error);

    res.status(500).json({
      success: false,
      message: "Excel import failed"
    });
  }
};


/* DATE FORMAT FIX */
function parseDate(date) {

  if (!date) return null;

  if (typeof date === "number") {
    const parsed =
      XLSX.SSF.parse_date_code(date);

    return new Date(
      parsed.y,
      parsed.m - 1,
      parsed.d
    );
  }

  const parts = date.split("-");
  if (parts.length === 3)
    return new Date(
      `${parts[2]}-${parts[1]}-${parts[0]}`
    );

  return new Date(date);
}