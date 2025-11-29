# 🚀 AI-Powered Custom CV Generator

**منشئ السيرة الذاتية المخصص والتلقائي باستخدام الذكاء الاصطناعي**

A Node.js automation tool that uses **Google Gemini AI** to customize CVs and generate cover letters tailored to specific job applications.

---

## ✨ Features

- 🎯 **ATS Optimization** - Automatically adds relevant keywords from job descriptions
- 📝 **Smart CV Customization** - Rewrites summary and reorders skills based on job requirements
- 💼 **Cover Letter Generation** - Creates personalized cover letters for each application
- 📁 **Organized Output** - Automatically creates folders named `CompanyName-JobPosition`
- 🎨 **Design Preservation** - Maintains your original HTML/Tailwind CSS styling

---

## 📋 Prerequisites

- [Node.js](https://nodejs.org/) (v18 or higher)
- [Google Gemini API Key](https://makersuite.google.com/app/apikey)

---

## 🛠️ Installation

1. **Clone or download this project**

2. **Install dependencies**

   ```bash
   npm install
   ```

3. **Set up your API key**

   - Open `.env` file
   - Replace `your_api_key_here` with your Gemini API key:

   ```
   GEMINI_API_KEY=your_actual_api_key
   ```

4. **Update your name** in `config/config.js`:
   ```javascript
   USER: {
     FULL_NAME: 'Your Name',  // Change this!
   }
   ```

---

## 📂 Project Structure

```
├── index.js              # Main entry point
├── config/
│   └── config.js         # Configuration and constants
├── src/
│   ├── ai/
│   │   └── gemini.js     # Gemini AI integration
│   ├── utils/
│   │   ├── fileHandler.js    # File read/write operations
│   │   └── nameFormatter.js  # Name formatting utilities
│   └── templates/
│       └── prompts.js    # AI prompt templates
├── input/
│   ├── master_cv.html    # Your master CV template
│   └── job_description.txt   # Job description to apply for
├── output/               # Generated CVs and cover letters
├── .env                  # Environment variables (API key)
└── package.json
```

---

## 🚀 Usage

### Step 1: Prepare Your Master CV

Edit `input/master_cv.html` with your complete CV information. The template uses Tailwind CSS for styling.

### Step 2: Add Job Description

Copy and paste the job description into `input/job_description.txt`

### Step 3: Run the Generator

```bash
npm start
```

or

```bash
node index.js
```

### Step 4: Get Your Files

Check the `output/` folder. You'll find:

- 📁 `CompanyName-JobPosition/`
  - 📄 `YourName-JobPosition.html` - Customized CV
  - 📝 `Cover-Letter.txt` - Personalized cover letter

---

## 📖 Example

Applying for a **Frontend Developer** position at **Vodafone**:

1. Paste the job description in `input/job_description.txt`
2. Run `node index.js`
3. Get your files in `output/Vodafone-FrontendDeveloper/`:
   - `Ali-Hatem-Ramadan-FrontendDeveloper.html`
   - `Cover-Letter.txt`

---

## ⚙️ Configuration

Edit `config/config.js` to customize:

```javascript
export const CONFIG = {
  // Your personal info
  USER: {
    FULL_NAME: "Your Name",
  },

  // AI settings
  AI_SETTINGS: {
    TEMPERATURE: 0.7, // Creativity (0.0 - 1.0)
    MAX_OUTPUT_TOKENS: 8192, // Max response length
  },
};
```

---

## 🔧 Development

Run with auto-reload:

```bash
npm run dev
```

---

## 📝 Tips

1. **Keep your master CV comprehensive** - Include all your experience and skills. The AI will select relevant ones.

2. **Copy the complete job description** - Include requirements, responsibilities, and company info.

3. **Review before sending** - Always review the generated CV and cover letter before submitting.

4. **Convert to PDF** - Open the HTML file in a browser and use Print > Save as PDF.

---

## 🤝 Contributing

Feel free to submit issues and pull requests!

---

## 📄 License

MIT License
