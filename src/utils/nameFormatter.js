/**
 * Format a name for use in file/folder names
 * Converts "John Doe" to "John-Doe"
 * @param {string} name - Name to format
 * @returns {string} Formatted name
 */
export function formatNameForFile(name) {
  return name
    .trim()
    .replace(/\s+/g, "-") // Replace spaces with hyphens
    .replace(/[^a-zA-Z0-9-]/g, "") // Remove special characters
    .replace(/-+/g, "-"); // Remove duplicate hyphens
}

/**
 * Format job position for file/folder names
 * Converts "Frontend Developer" to "FrontendDeveloper"
 * @param {string} position - Job position
 * @returns {string} Formatted position
 */
export function formatPositionForFile(position) {
  return position
    .trim()
    .split(/\s+/)
    .map((word) => word.charAt(0).toUpperCase() + word.slice(1).toLowerCase())
    .join("")
    .replace(/[^a-zA-Z0-9]/g, "");
}

/**
 * Format company name for folder
 * Converts "Google LLC" to "Google"
 * @param {string} company - Company name
 * @returns {string} Formatted company name
 */
export function formatCompanyForFolder(company) {
  return company
    .trim()
    .split(/\s+/)[0] // Take first word
    .replace(/[^a-zA-Z0-9]/g, ""); // Remove special characters
}

/**
 * Generate folder name from company and position
 * @param {string} company - Company name
 * @param {string} position - Job position
 * @returns {string} Folder name (e.g., "Vodafone-FrontendDeveloper")
 */
export function generateFolderName(company, position) {
  const formattedCompany = formatCompanyForFolder(company);
  const formattedPosition = formatPositionForFile(position);
  return `${formattedCompany}-${formattedPosition}`;
}

/**
 * Generate CV file name
 * @param {string} userName - User's full name
 * @param {string} position - Job position
 * @returns {string} CV file name (e.g., "Ali-Hatem-Ramadan-FrontendDeveloper.html")
 */
export function generateCVFileName(userName, position) {
  const formattedName = formatNameForFile(userName);
  const formattedPosition = formatPositionForFile(position);
  return `${formattedName}-${formattedPosition}.html`;
}
