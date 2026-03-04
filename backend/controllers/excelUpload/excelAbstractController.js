import xlsx from "xlsx";
import Abstract from "../../models/Abstract.js";

export const importAbstractsExcel = async (req, res) => {
  
  try {
    if (!req.file) {
      return res.status(400).json({ message: "No file uploaded" });
    }

    const workbook = xlsx.read(req.file.buffer, { type: "buffer" });

    const sheetName = workbook.SheetNames[0];
    const sheet = workbook.Sheets[sheetName];

    const data = xlsx.utils.sheet_to_json(sheet);

    const formattedData = data.map((row) => ({
      title: row["Title"],
      authors: row["Authors"]? row["Authors"].split(",").map(a => a.trim()): [],
      keyword: row["Keywords"]? row["Keywords"].split(",").map(k => k.trim()): [],
      volume: row["Sl. No."],
      year: row["Year"],
      publicationMonth: row["PublicationMonth"],
      source: row["Source"],
      summary: row["Summary"],
      url: row["URL"]
    }));

    await Abstract.insertMany(formattedData);

    res.status(200).json({
      message: "Excel uploaded successfully",
      recordsInserted: formattedData.length
    });

  } catch (error) {
    console.error(error);
    res.status(500).json({
      message: "Error uploading Excel",
      error: error.message
    });
  }
};