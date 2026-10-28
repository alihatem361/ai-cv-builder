import puppeteer from "puppeteer";
import path from "path";

/**
 * Convert HTML file to PDF using Puppeteer
 * Creates a text-based PDF (selectable/searchable text)
 * @param {string} htmlFilePath - Absolute path to the HTML file
 * @param {string} pdfFilePath - Absolute path for the output PDF file
 * @param {Object} options - PDF generation options
 */
export async function generatePDF(htmlFilePath, pdfFilePath, options = {}) {
  const defaultOptions = {
    format: "A4",
    printBackground: true,
    scale: 0.95, // تكبير الخط قليلاً للوضوح
    margin: {
      top: "8mm",
      bottom: "8mm",
      left: "8mm",
      right: "8mm",
    },
  };

  const pdfOptions = { ...defaultOptions, ...options, path: pdfFilePath };

  let browser = null;

  try {
    console.log("   🌐 Launching browser...");
    browser = await puppeteer.launch({
      headless: true,
      args: ["--no-sandbox", "--disable-setuid-sandbox"],
    });

    const page = await browser.newPage();

    // Convert to file:// URL format
    const fileUrl = `file:///${htmlFilePath.replace(/\\/g, "/")}`;

    console.log("   📄 Loading HTML file...");
    // Two idle connections are enough for this file-based document and its CDN assets.
    // networkidle0 can wait unnecessarily long for third-party requests to settle.
    await page.goto(fileUrl, {
      waitUntil: "networkidle2",
      timeout: 30000,
    });

    // Emulate print media to activate Tailwind's print: modifiers, then wait for web fonts.
    await page.emulateMediaType("print");
    await page.evaluate(() => document.fonts.ready.then(() => true));

    console.log("   🖨️ Generating PDF...");
    await page.pdf(pdfOptions);

    console.log(`   ✅ PDF created: ${path.basename(pdfFilePath)}`);

    return pdfFilePath;
  } catch (error) {
    throw new Error(`Failed to generate PDF: ${error.message}`);
  } finally {
    if (browser) {
      await browser.close();
    }
  }
}

/**
 * Generate CV file name for PDF
 * @param {string} userName - User's full name
 * @param {string} position - Job position
 * @returns {string} PDF file name
 */
export function generatePDFFileName(userName, position) {
  const formattedName = userName
    .trim()
    .replace(/\s+/g, "-")
    .replace(/[^a-zA-Z0-9-]/g, "")
    .replace(/-+/g, "-");

  const formattedPosition = position
    .trim()
    .split(/\s+/)
    .map((word) => word.charAt(0).toUpperCase() + word.slice(1).toLowerCase())
    .join("")
    .replace(/[^a-zA-Z0-9]/g, "");

  return `${formattedName}-${formattedPosition}.pdf`;
}
