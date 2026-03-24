import xlsx from 'xlsx';
import AJMTPaper from '../../models/AJMTPaper.js';

export const importAJMTPapers = async (req, res) => {
  try {
    if (!req.file) return res.status(400).json({ message: "No file uploaded" });

    const workbook = xlsx.read(req.file.buffer, { type: 'buffer' });
    const sheetData = xlsx.utils.sheet_to_json(workbook.Sheets[workbook.SheetNames[0]]);

    const importedData = sheetData.map((row, index) => {
      const getVal = (targets) => {
        const key = Object.keys(row).find(k => targets.includes(k.trim().toLowerCase()));
        return key ? row[key] : null;
      };

      // GENERATE THE UNIQUE ID HERE
      // This ensures the model is happy even though Excel doesn't have the column
      const generatedId = `AJMT-GEN-${Date.now()}-${Math.floor(1000 + Math.random() * 9000)}-${index}`;

      return {
        uniqueId: generatedId, // Assigned programmatically
        paperTitle: getVal(['paper title', 'title', 'papertitle']) || "Untitled",
        titleSubject: getVal(['subject', 'titlesubject', 'topic']) || "General",
        paperType: getVal(['type', 'papertype', 'paper type']) || "Research",
        date: getVal(['date', 'submission date']) ? new Date(getVal(['date', 'submission date'])) : new Date(),
        status: getVal(['status']) || 'Draft',
        authors: [
          {
            authorName: getVal(['Name of the Authors', 'author', 'name']) || "Unknown",
            authorEmail: getVal(['email', 'author email']) || ""
          }
        ],
        reviewers: []
      };
    });

    // Use insertMany
    const result = await AJMTPaper.insertMany(importedData, { ordered: false });

    return res.status(201).json({
      success: true,
      message: `Successfully imported ${result.length} papers with generated Unique IDs.`,
    });

  } catch (error) {
    console.error("Import Error:", error);
    
    // Check if error is due to an existing index conflict
    if (error.code === 11000) {
        return res.status(400).json({
            message: "Duplicate Error: Some records already exist or the old 'null' index is blocking the import.",
            details: error.message
        });
    }

    return res.status(500).json({ message: "Import failed", error: error.message });
  }
};