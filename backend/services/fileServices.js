
import fs from "fs";
import ErrorHandler from "../middleware/error.js";

export const streamDownload = (filePath, res, originalName) => {
  try {
    console.log("DOWNLOAD PATH:", filePath);
    console.log("FILENAME:", originalName);

    if (!fs.existsSync(filePath)) {
      throw new ErrorHandler("File not found on server", 404);
    }

    return res.download(filePath, originalName, (err) => {
      if (err) {
        console.log("DOWNLOAD ERROR:", err);

        if (!res.headersSent) {
          return res.status(500).json({
            success: false,
            error: "Error downloading file",
          });
        }
      }
    });
  } catch (error) {
    console.log("STREAM ERROR:", error);

    return res.status(error.statusCode || 500).json({
      success: false,
      error: error.message || "Error streaming file",
    });
  }
};