import path from "path";
import ora from "ora";
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

  try {
    // Step 1: Validate configuration
    let spinner = ora("Validating configuration...").start();
    validateConfig();
    spinner.succeed("Configuration valid");

    // Step 2: Read input files
    spinner = ora("Reading input files...").start();

    const masterCV = await readFile(CONFIG.PATHS.MASTER_CV);
    const jobDescription = await readFile(CONFIG.PATHS.JOB_DESCRIPTION);
    spinner.succeed(`Loaded master CV (${masterCV.length} chars) and job description (${jobDescription.length} chars)`);

    // Step 3: Generate customized content using AI
    spinner = ora("Generating customized content with AI (this might take a minute)...").start();
    const prompt = getMainPrompt(masterCV, jobDescription);
    const result = await generateCustomizedCV(prompt);

    spinner.succeed(`AI generated CV for ${result.jobPosition} at ${result.companyName}`);

    // Step 4: Create output folder and save files
    spinner = ora("Saving generated files...").start();

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
    spinner.succeed(`Saved files to output directory`);

    // Step 5: Generate PDF from HTML
    spinner = ora("Generating PDF...").start();
    const htmlFilePath = path.resolve(outputPath, cvFileName);
    const pdfFileName = generatePDFFileName(
      CONFIG.USER.FULL_NAME,
      result.jobPosition
    );
    const pdfFilePath = path.resolve(outputPath, pdfFileName);

    await generatePDF(htmlFilePath, pdfFilePath);
    spinner.succeed(`Generated PDF successfully`);

    // Success message
    console.log("\n" + "=".repeat(50));
    console.log("\n✨ SUCCESS! Files generated successfully!\n");
    console.log(`📁 Output folder: ${outputPath}`);
    console.log(`📄 CV (HTML): ${cvFileName}`);
    console.log(`📄 CV (PDF): ${pdfFileName} ✨ Selectable Text!`);
    console.log(`📝 Cover Letter (EN): Cover-Letter.txt`);
    console.log(`📝 Cover Letter (AR): Cover-Letter-Arabic.txt`);
    console.log("\n🎯 Next steps:");
    console.log("   1. Use the PDF file for job applications");
    console.log("   2. Copy the cover letter for your application");
    console.log("\n");
  } catch (error) {
    if (typeof spinner !== 'undefined' && spinner.isSpinning) {
      spinner.fail("An error occurred");
    }
    console.error("\n❌ Error:", error.message);

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
