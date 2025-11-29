# AI-Powered Custom CV Generator

## Project Overview

This is a Node.js automation tool that uses Google Gemini AI to customize CVs and generate cover letters for job applications.

## Tech Stack

- **Runtime:** Node.js
- **AI Model:** Google Gemini 1.5 Flash
- **Styling:** Tailwind CSS (via CDN)
- **Data Format:** JSON

## Project Structure

```
├── index.js              # Main entry point
├── config/
│   └── config.js         # Configuration and constants
├── src/
│   ├── ai/
│   │   └── gemini.js     # Gemini AI integration
│   ├── utils/
│   │   ├── fileHandler.js # File read/write operations
│   │   └── nameFormatter.js # Name formatting utilities
│   └── templates/
│       └── prompts.js    # AI prompt templates
├── input/
│   ├── master_cv.html    # Your master CV template
│   └── job_description.txt # Job description to apply for
├── output/               # Generated CVs and cover letters
├── .env                  # Environment variables (API key)
└── package.json
```

## How to Run

1. Add your Gemini API key to `.env` file
2. Update `input/master_cv.html` with your CV
3. Paste job description in `input/job_description.txt`
4. Run: `node index.js`

## Development Guidelines

- Keep AI prompts in `src/templates/prompts.js`
- All file operations go through `src/utils/fileHandler.js`
- Output folders are named: `CompanyName-JobPosition`
- CV files are named: `YourName-JobPosition.html`
