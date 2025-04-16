import fs from "fs";
import path from "path";
import QRCode from "qrcode";
import ExcelJS from "exceljs";
import archiver from "archiver";

// ✅ UPDATE THESE:
const tokenId = "0xabc123"; // Example tokenId
const stripIDs = ["abc-1", "abc-2", "abc-3"]; // Your stripIDs

const outputDir = "./strip_qr_output";
const qrDir = path.join(outputDir, "qr_codes");
const excelFile = path.join(outputDir, "strip_qr_codes.xlsx");
const zipFile = "./strip_qr_codes.zip";

// 🧹 Step 1: Clean/Create Directories
fs.rmSync(outputDir, { recursive: true, force: true });
fs.mkdirSync(qrDir, { recursive: true });

// 📘 Step 2: Create Excel File
const workbook = new ExcelJS.Workbook();
const sheet = workbook.addWorksheet("Drug QR Data");
sheet.columns = [
  { header: "Token ID", key: "tokenId", width: 40 },
  { header: "Strip ID", key: "stripId", width: 30 },
  { header: "QR Filename", key: "qrFile", width: 40 },
];

// 🔁 Step 3: Generate QR Codes & Fill Excel
for (let stripId of stripIDs) {
  const content = `${tokenId}-${stripId}`;
  const qrPath = path.join(qrDir, `${stripId}.png`);

  await QRCode.toFile(qrPath, content, { type: "png", margin: 2 });

  sheet.addRow({
    tokenId,
    stripId,
    qrFile: `qr_codes/${stripId}.png`,
  });
}

// 💾 Step 4: Save Excel
await workbook.xlsx.writeFile(excelFile);

// 🗜️ Step 5: Zip It All
const output = fs.createWriteStream(zipFile);
const archive = archiver("zip", { zlib: { level: 9 } });

archive.pipe(output);
archive.directory(outputDir, false);
await archive.finalize();

console.log("✅ Done! File saved:", zipFile);
