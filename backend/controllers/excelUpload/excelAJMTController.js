import xlsx from "xlsx";
import AJMTPaper from "../../models/AJMTPaper.js";

export const importAJMTPapers = async (req, res) => {
  try {
    if (!req.file) return res.status(400).json({ message: "No file uploaded" });

    const workbook = xlsx.read(req.file.buffer, { type: "buffer" });
    const sheetData = xlsx.utils.sheet_to_json(
      workbook.Sheets[workbook.SheetNames[0]],
      { defval: null } // Ensures empty cells are null
    );

    const importedData = sheetData.map((row, index) => {
      // Improved helper to find keys regardless of spaces, hidden chars, or casing
      const getVal = (targets) => {
        const lowerTargets = targets.map(t => t.trim().toLowerCase());
        const key = Object.keys(row).find((k) => 
          lowerTargets.includes(k.trim().toLowerCase())
        );
        const value = key ? row[key] : null;
        // Treat common empty indicators as null
        return (value === "-" || value === "null" || value === "" || value === undefined) ? null : value;
      };

      // Safe Date Parser to prevent 1970-01-01 bug
      const parseDate = (val) => {
        if (!val) return null;
        const d = new Date(val);
        // If Excel provides a number (date code), convert it properly
        if (typeof val === 'number') {
            return new Date((val - (25567 + 1)) * 86400 * 1000);
        }
        return isNaN(d.getTime()) ? null : d;
      };

      // Generate the Unique ID
      const generatedId = `AJMT-GEN-${Date.now()}-${Math.floor(1000 + Math.random() * 9000)}-${index}`;

      return {
        uniqueId: generatedId,
        paperTitle: getVal(["title"]) || "Untitled",
        titleSubject: getVal(["title subject"]) || "General",
        paperType: getVal(["paper type"]) || "Research Paper",
        
        // Correctly mapping "Submission Date" to "date" field
        date: parseDate(getVal(["submission date"])) || new Date(),
        
        // Handling the "Plagarism" typo from your Excel and mapping to schema
        plagiarismPercentage: parseFloat(getVal(["plagarism percentage", "plagiarism percentage"])) || 0,
        
        status: getVal(["status"]) || "Draft",
        
        authors: [
          {
            // Maps both "Name of the Author/s" (Sheet1) and "Name of the Authors" (Sheet2)
            authorName: getVal(["name of the author/s", "name of the authors"]) || "Unknown",
            authorAddress: getVal(["full address"]) || "",
            authorEmail: getVal(["author email", "email"]) || "",
            authorInstitution: getVal(["institution"]) || "",
            authorCity: getVal(["city"]) || "",
          },
        ],
        
        reviewers: [
          {
            reviewerNumber: 1,
            reviewerName: getVal(["name of 1st reviewer"]) || "",
            reviewerEmail: getVal(["1st reviewer email"]) || "",
          },
          {
            reviewerNumber: 2,
            reviewerName: getVal(["name of 2nd reviewer"]) || "",
            reviewerEmail: getVal(["2nd reviewer email"]) || "",
          },
          {
            reviewerNumber: 3,
            reviewerName: getVal(["name of 3rd reviewer"]) || "",
            reviewerEmail: getVal(["3rd reviewer email"]) || "",
          },
        ].filter(rev => rev.reviewerName.trim() !== "" || rev.reviewerEmail.trim() !== ""),
        
        tentativeDateOfPublication: parseDate(getVal(["tentative date of publication"])),
        websiteUpdateDate: parseDate(getVal(["website update date"])),
        remarks: getVal(["remarks"]) || "",
      };
    }).filter(item => item.paperTitle !== "Untitled"); // Skip entirely empty rows

    // Use insertMany to upload all 905 lines efficiently
    const result = await AJMTPaper.insertMany(importedData, { ordered: false });

    return res.status(201).json({
      success: true,
      count: result.length,
      message: `Successfully imported ${result.length} papers.`,
    });

  } catch (error) {
    console.error("Import Error:", error);
    return res.status(500).json({ 
      message: "Import failed", 
      error: error.message 
    });
  }
};