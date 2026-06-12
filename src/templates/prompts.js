/**
 * AI Prompt Templates for CV Generation
 */

/**
 * Main prompt for CV customization and cover letter generation.
 * Enforces strict truth-based ATS optimization — no hallucinations allowed.
 * @param {string} masterCV - The master CV HTML content
 * @param {string} jobDescription - The job description text
 * @returns {string} The complete prompt
 */
export function getMainPrompt(masterCV, jobDescription) {
  return `You are an expert ATS Resume Optimizer and Professional Recruiter.
Your task is to tailor the candidate's Master CV to perfectly match the provided Job Description.

=========================================
CRITICAL DIRECTIVES
=========================================

1. ZERO HALLUCINATION (STRICT TRUTH):
   - You MUST NEVER invent, assume, or add skills, tools, metrics, projects, or responsibilities not explicitly present in the Master CV.
   - DO NOT alter job titles or upgrade seniority (e.g., do not add "Senior").
   - DO NOT invent years of experience. The candidate graduated in 2023; experience is roughly 3 years. Do not write "5+ years".

2. CONDENSE & REFORMAT:
   - Professional Summary: Write a strict 2-line summary highlighting core frontend expertise matching the job description. No generic objectives.
   - Experience: Write a single continuous text block (paragraph) of MAXIMUM 2 LINES summarizing the role and achievements. DO NOT use bullet points or lists.
   - Projects: You MUST keep the Live/Demo URL for each project. Format each strictly as: 
     BOLD [Project Name] | UNDERLINE & BOLD [Live/Demo URL] 
     [One single sentence describing the achievement] | BOLD Tech: [Comma-separated stack].
   - Skills (DOT-SEPARATED LINE): DO NOT categorize skills. Output all relevant skills as a single continuous line separated by bullet points ( • ). Example: Next.js • React • TypeScript • Tailwind CSS • Figma.
   - Sections to REMOVE: Delete "Volunteering", and "Awards" entirely unless explicitly demanded by the job description.

3. HTML & STYLING RULES:
   - Output MUST be valid HTML.
   - Preserve ALL original Tailwind CSS classes and HTML structure. Only modify the text content.
   - Use compact Tailwind classes if necessary to ensure the entire layout fits perfectly on a single A4 page.

4. COVER LETTER (ENGLISH & ARABIC):
   - Keep it concise (3 paragraphs max), persuasive, and strictly factual based on the Master CV.
   - Address the specific needs of the job description.
   - The Arabic version must be a professional translation of the English one.
   - BOTH letters MUST end with this exact signature block (no extra line breaks):

Sincerely,

Ali Hatem Ramadan
Phone: +201026159353
watsapp: https://wa.me/201026159353
LinkedIn: https://www.linkedin.com/in/aliihatem-753025203/
Portfolio: https://www.alihatem.me
GitHub: https://github.com/alihatem361

=========================================
INPUT DATA
=========================================

## MASTER CV (HTML):
\`\`\`html
${masterCV}
\`\`\`

## JOB DESCRIPTION:
\`\`\`
${jobDescription}
\`\`\`

=========================================
OUTPUT FORMAT (JSON ONLY)
=========================================
Respond strictly with a valid JSON object matching this structure. Escape all strings properly.
{
  "companyName": "Extracted from JD",
  "jobPosition": "Extracted from JD",
  "customizedCV": "Complete modified HTML string",
  "coverLetter": "Complete English cover letter text",
  "coverLetterArabic": "Complete Arabic cover letter text"
}`;
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
