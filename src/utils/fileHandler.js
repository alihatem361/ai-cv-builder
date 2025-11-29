import fs from "fs/promises";
import path from "path";

/**
 * Read file content as string
 * @param {string} filePath - Path to the file
 * @returns {Promise<string>} File content
 */
export async function readFile(filePath) {
  try {
    const content = await fs.readFile(filePath, "utf-8");
    return content;
  } catch (error) {
    if (error.code === "ENOENT") {
      throw new Error(`File not found: ${filePath}`);
    }
    throw error;
  }
}

/**
 * Write content to a file
 * @param {string} filePath - Path to the file
 * @param {string} content - Content to write
 */
export async function writeFile(filePath, content) {
  try {
    await fs.writeFile(filePath, content, "utf-8");
  } catch (error) {
    throw new Error(`Failed to write file: ${filePath} - ${error.message}`);
  }
}

/**
 * Create a directory if it doesn't exist
 * @param {string} dirPath - Path to the directory
 */
export async function createDirectory(dirPath) {
  try {
    await fs.mkdir(dirPath, { recursive: true });
  } catch (error) {
    throw new Error(
      `Failed to create directory: ${dirPath} - ${error.message}`
    );
  }
}

/**
 * Check if a file or directory exists
 * @param {string} filePath - Path to check
 * @returns {Promise<boolean>} True if exists
 */
export async function exists(filePath) {
  try {
    await fs.access(filePath);
    return true;
  } catch {
    return false;
  }
}

/**
 * Create output folder structure and save generated files
 * @param {string} outputDir - Base output directory
 * @param {string} folderName - Company-Position folder name
 * @param {Object} files - Object with file names and content
 */
export async function saveOutputFiles(outputDir, folderName, files) {
  const folderPath = path.join(outputDir, folderName);

  // Create the output folder
  await createDirectory(folderPath);

  // Save each file
  for (const [fileName, content] of Object.entries(files)) {
    const filePath = path.join(folderPath, fileName);
    await writeFile(filePath, content);
    console.log(`   ✅ Created: ${filePath}`);
  }

  return folderPath;
}
