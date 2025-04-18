import QRCode from "qrcode";
import ExcelJS from "exceljs";
import { saveAs } from "file-saver";
import JSZip from "jszip";
export const generateQRCodesAndDownload = async (tokenId, stripIDs) => {
    const workbook = new ExcelJS.Workbook();
    const sheet = workbook.addWorksheet("Drug QR Data");
  
    sheet.columns = [
      { header: "Token ID", key: "tokenId", width: 30 },
      { header: "Strip ID", key: "stripId", width: 30 },
      { header: "QR Filename", key: "qrFile", width: 40 },
    ];
  
    const zip = new JSZip();
    const qrFolder = zip.folder("qr_codes");
  
    for (let stripId of stripIDs) {
      const content = `${tokenId}*&${stripId}`;
      const dataUrl = await QRCode.toDataURL(content);
      const base64 = dataUrl.split(",")[1];
  
   
      qrFolder.file(`${stripId}.png`, base64, { base64: true });
  
      
      sheet.addRow({
        tokenId,
        stripId,
        qrFile: `qr_codes/${stripId}.png`,
      });
    }
  
    const excelBuffer = await workbook.xlsx.writeBuffer();
    zip.file("drug_qr_codes.xlsx", excelBuffer);
  
    const finalZip = await zip.generateAsync({ type: "blob" });
    saveAs(finalZip, `DrugBatch_${tokenId}_QR.zip`);
    console.log("✅ Zip file created and downloaded successfully!");
  };
  