/**
 * AI Prompt Templates for CV Generation
 */

/**
 * Main prompt for CV customization and cover letter generation
 * @param {string} masterCV - The master CV HTML content
 * @param {string} jobDescription - The job description text
 * @returns {string} The complete prompt
 */
export function getMainPrompt(masterCV, jobDescription) {
  return `You are an expert career consultant and professional resume writer. Your task is to customize a CV and create a cover letter based on a job description.

## IMPORTANT INSTRUCTIONS:
1. Analyze the job description to extract:
   - Company name
   - Job position/title
   - Key requirements and skills
   - Keywords that would help pass ATS (Applicant Tracking System)

2. Customize the CV by:
   - Rewriting the professional summary to highlight relevant experience for THIS specific job
   - Reordering and emphasizing skills that match the job requirements
   - Adjusting experience descriptions to emphasize relevant achievements
   - Adding relevant keywords from the job description naturally
   - KEEP the exact same HTML structure and Tailwind CSS classes - only modify the TEXT content

3. Write a professional cover letter that:
   - Is addressed to the hiring team/manager at the company
   - Highlights why the candidate is a perfect fit
   - References specific requirements from the job description
   - Is concise (3-4 paragraphs maximum)
   - Has a professional but personable tone
   - MUST end with this exact signature block (NO extra blank lines between contact details):

Sincerely,

Ali Hatem Ramadan
Phone: +201026159353
LinkedIn: https://www.linkedin.com/in/aliihatem-753025203/
Portfolio: https://ali-hatem-portfolio.vercel.app/
GitHub: https://github.com/alihatem361

4. Write an Arabic version of the cover letter that:
   - Has the same content as the English cover letter but translated to Arabic
   - Uses professional Arabic language
   - MUST end with the same signature block (in English, NO extra blank lines between contact details)

## MASTER CV (HTML):
\`\`\`html
${masterCV}
\`\`\`

## JOB DESCRIPTION:
\`\`\`
${jobDescription}
\`\`\`

## RESPONSE FORMAT:
You MUST respond with a valid JSON object in this exact format:
{
  "companyName": "The company name extracted from job description",
  "jobPosition": "The job title/position extracted from job description",
  "customizedCV": "The complete HTML of the customized CV (preserve all HTML/Tailwind styling)",
  "coverLetter": "The complete cover letter text in English",
  "coverLetterArabic": "The complete cover letter text in Arabic"
}

CRITICAL RULES:
- The customizedCV must be valid HTML that preserves ALL original Tailwind CSS classes and structure
- Only modify TEXT content, never remove or change HTML tags or CSS classes
- The JSON must be valid and parseable
- Do not include any text outside the JSON object
- Escape any special characters in strings properly for valid JSON
- Both cover letters must include the full signature block with contact details`;
}

/**
 * Fallback prompt if extraction fails
 * @param {string} jobDescription - The job description text
 * @returns {string} Simple extraction prompt
 */
export function getExtractionPrompt(jobDescription) {
  return `Extract the company name and job position from this job description:

${jobDescription}

Respond with JSON only:
{
  "companyName": "company name here",
  "jobPosition": "job position here"
}`;
}
