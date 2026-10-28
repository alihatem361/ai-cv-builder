import path from "path";
import { CONFIG, validateConfig } from "./config/config.js";
import { readFile, saveOutputFiles } from "./src/utils/fileHandler.js";
import {
  generateFolderName,
  generateCVFileName,
} from "./src/utils/nameFormatter.js";
import { generateCustomizedCV } from "./src/ai/gemini.js";
import { getMainPrompt } from "./src/templates/prompts.js";
import { generatePDF, generatePDFFileName } from "./src/utils/pdfGenerator.js";

/**
 * Main function to generate customized CV and cover letter
 */
async function main() {
  console.log("\n🚀 AI-Powered CV Generator Started\n");
  console.log("=".repeat(50));
  const runStartedAt = Date.now();

  try {
    // Step 1: Validate configuration
    console.log("\n📋 Step 1: Validating configuration...");
    let stepStartedAt = Date.now();
    validateConfig();
    console.log("   ✅ Configuration valid");
    console.log(`   ⏱️ Validation: ${((Date.now() - stepStartedAt) / 1000).toFixed(1)}s`);

    // Step 2: Read input files
    console.log("\n📂 Step 2: Reading input files...");
    stepStartedAt = Date.now();

    const masterCV = await readFile(CONFIG.PATHS.MASTER_CV);
    console.log(`   ✅ Loaded master CV (${masterCV.length} characters)`);

    const jobDescription = await readFile(CONFIG.PATHS.JOB_DESCRIPTION);
    console.log(
      `   ✅ Loaded job description (${jobDescription.length} characters)`
    );
    console.log(`   ⏱️ Input loading: ${((Date.now() - stepStartedAt) / 1000).toFixed(1)}s`);

    // Step 3: Generate customized content using AI
    console.log("\n🤖 Step 3: Generating customized content...");
    stepStartedAt = Date.now();
    const prompt = getMainPrompt(masterCV, jobDescription);
    const result = await generateCustomizedCV(prompt);

    console.log(`   ⏱️ AI generation: ${((Date.now() - stepStartedAt) / 1000).toFixed(1)}s`);
    console.log(`   ✅ Company detected: ${result.companyName}`);
    console.log(`   ✅ Position detected: ${result.jobPosition}`);

    // Step 4: Create output folder and save files
    console.log("\n💾 Step 4: Saving generated files...");
    stepStartedAt = Date.now();

    const folderName = generateFolderName(
      result.companyName,
      result.jobPosition
    );
    const cvFileName = generateCVFileName(
      CONFIG.USER.FULL_NAME,
      result.jobPosition
    );

    const files = {
      [cvFileName]: result.customizedCV,
      "Cover-Letter.txt": result.coverLetter,
      "Cover-Letter-Arabic.txt": result.coverLetterArabic,
    };

    const outputPath = await saveOutputFiles(
      CONFIG.PATHS.OUTPUT_DIR,
      folderName,
      files
    );
    console.log(`   ⏱️ File saving: ${((Date.now() - stepStartedAt) / 1000).toFixed(1)}s`);

    // Step 5: Generate PDF from HTML
    console.log("\n📑 Step 5: Generating PDF (Text-based)...");
    const htmlFilePath = path.resolve(outputPath, cvFileName);
    const pdfFileName = generatePDFFileName(
      CONFIG.USER.FULL_NAME,
      result.jobPosition
    );
    const pdfFilePath = path.resolve(outputPath, pdfFileName);

    stepStartedAt = Date.now();
    await generatePDF(htmlFilePath, pdfFilePath);
    console.log(`   ⏱️ PDF generation: ${((Date.now() - stepStartedAt) / 1000).toFixed(1)}s`);

    // Success message
    console.log("\n" + "=".repeat(50));
    console.log("\n✨ SUCCESS! Files generated successfully!\n");
    console.log(`📁 Output folder: ${outputPath}`);
    console.log(`📄 CV (HTML): ${cvFileName}`);
    console.log(`📄 CV (PDF): ${pdfFileName} ✨ Selectable Text!`);
    console.log(`📝 Cover Letter (EN): Cover-Letter.txt`);
    console.log(`📝 Cover Letter (AR): Cover-Letter-Arabic.txt`);
    console.log(`⏱️ Total elapsed time: ${((Date.now() - runStartedAt) / 1000).toFixed(1)}s`);
    console.log("\n🎯 Next steps:");
    console.log("   1. Use the PDF file for job applications");
    console.log("   2. Copy the cover letter for your application");
    console.log("\n");
  } catch (error) {
    console.error("\n❌ Error:", error.message);
    console.error(`⏱️ Failed after ${((Date.now() - runStartedAt) / 1000).toFixed(1)}s`);

    if (error.message.includes("File not found")) {
      console.log("\n💡 Tip: Make sure you have created the input files:");
      console.log("   - input/master_cv.html (your CV template)");
      console.log(
        "   - input/job_description.txt (the job you're applying for)"
      );
    }

    process.exit(1);
  }
}

// Run the main function
main();
