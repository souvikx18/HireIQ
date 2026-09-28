import fs from 'fs';
import path from 'path';
import pdfParse from 'pdf-parse';
import mammoth from 'mammoth';
import { config } from '../config/index.js';
import { logger } from '../utils/logger.js';

// Comprehensive Skills dictionary for deterministic extraction
const SKILL_DICTIONARY = [
  // Languages & Core
  'JavaScript', 'TypeScript', 'Python', 'Java', 'C++', 'C#', 'C', 'Go', 'Golang', 'Rust', 'Ruby', 'PHP', 'Swift', 'Kotlin', 'SQL', 'DBMS', 'HTML', 'HTML5', 'CSS', 'CSS3', 'Sass',
  // Frameworks & Libraries
  'React', 'React.js', 'Next.js', 'Vue', 'Vue.js', 'Angular', 'Node.js', 'Express', 'Express.js', 'FastAPI', 'Django', 'Flask', 'Spring', 'Spring Boot', 'ASP.NET', 'Redux', 'Tailwind CSS', 'Tailwind', 'Bootstrap', 'GraphQL', 'REST API', 'RESTful APIs', 'WebAssembly', 'WASM',
  // Databases & Caching
  'PostgreSQL', 'Postgres', 'MySQL', 'MongoDB', 'Redis', 'SQLite', 'Elasticsearch', 'DynamoDB', 'Cassandra', 'Oracle',
  // DevOps & Cloud
  'AWS', 'Amazon Web Services', 'Azure', 'Google Cloud', 'GCP', 'Docker', 'Kubernetes', 'K8s', 'CI/CD', 'GitHub Actions', 'Jenkins', 'Terraform', 'Ansible', 'Linux', 'Microservices', 'System Design', 'Git', 'GitHub',
  // CS Fundamentals & Architecture
  'Data Structures & Algorithms', 'Data Structures', 'Algorithms', 'DSA', 'Operating Systems', 'Computer Networks', 'OOP', 'Object Oriented Programming',
  // Design & Product
  'Figma', 'FigJam', 'UI/UX', 'Wireframing', 'Prototyping', 'Design Systems', 'User Research', 'Agile', 'Scrum', 'JIRA',
  // Testing
  'Jest', 'Cypress', 'Playwright', 'Mocha', 'Chai', 'Vitest', 'Unit Testing', 'Selenium',
  // Soft skills
  'Communication', 'Problem Solving', 'Leadership', 'Teamwork', 'Mentorship', 'Critical Thinking', 'Collaboration',
];

export const resumeParserService = {
  async parseWithGemini(filePath, originalFileName, mimeType = 'application/pdf') {
    if (!config.ai.geminiApiKey) return null;
    const models = ['gemini-flash-lite-latest', 'gemini-3.8-flash', 'gemini-flash-latest'];

    try {
      const buf = fs.readFileSync(filePath);
      const base64 = buf.toString('base64');

      for (const model of models) {
        try {
          const url = `https://generativelanguage.googleapis.com/v1beta/models/${model}:generateContent?key=${config.ai.geminiApiKey}`;

          const res = await fetch(url, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
              contents: [
                {
                  parts: [
                    { inlineData: { mimeType, data: base64 } },
                    {
                      text: 'You are an enterprise ATS resume parser. Extract candidate details from this resume document accurately. Output strictly a JSON object with keys: "name" (string), "email" (string), "phone" (string or null), "experienceYears" (string e.g. "0+", "1+", "3+"), "education" (string describing degree, university/board, year e.g. "B.Tech in Computer Science, Brainware University"), "skills" (array of strings: all programming languages, web technologies, databases, frameworks, CS fundamentals, soft skills detected on the document), "fullText" (complete plain text transcription of the resume). Do not include markdown code block formatting, just the raw JSON object.'
                    }
                  ]
                }
              ]
            })
          });

          if (!res.ok) {
            logger.warn(`Gemini model ${model} parse returned status ${res.status}, trying next model...`);
            await new Promise((r) => setTimeout(r, 400));
            continue;
          }

          const data = await res.json();
          const rawResponseText = data?.candidates?.[0]?.content?.parts?.[0]?.text;
          if (!rawResponseText) continue;

          const cleanedJson = rawResponseText.replace(/```(?:json)?/gi, '').replace(/```/g, '').trim();
          const parsed = JSON.parse(cleanedJson);
          if (parsed && (parsed.name || (Array.isArray(parsed.skills) && parsed.skills.length > 0))) {
            let eduStr = parsed.education;
            if (Array.isArray(eduStr)) {
              eduStr = eduStr.join(' | ');
            }
            return {
              ...parsed,
              education: eduStr || null,
              skills: Array.isArray(parsed.skills) ? [...new Set(parsed.skills.map((s) => String(s).trim()).filter(Boolean))] : [],
            };
          }
        } catch (mErr) {
          logger.warn(`Model ${model} parse error:`, mErr.message);
        }
      }

      return null;
    } catch (err) {
      logger.warn('Gemini multimodal resume extraction error:', err.message);
      return null;
    }
  },


  async extractText(filePath, originalFileName) {
    const ext = path.extname(originalFileName).toLowerCase();
    let text = '';

    try {
      if (ext === '.pdf') {
        const dataBuffer = fs.readFileSync(filePath);
        const data = await pdfParse(dataBuffer);
        text = data.text || '';
      } else if (ext === '.docx' || ext === '.doc') {
        const result = await mammoth.extractRawText({ path: filePath });
        text = result.value || '';
      } else if (ext === '.txt') {
        text = fs.readFileSync(filePath, 'utf-8');
      } else {
        throw new Error(`Unsupported file extension: ${ext}`);
      }
    } catch (err) {
      logger.error(`Error reading resume file ${filePath}:`, err);
      text = `Candidate resume document: ${originalFileName}. Content could not be parsed as text.`;
    }

    return text.trim();
  },


  extractCandidateInfo(text, originalFileName) {
    // 1. Email extraction regex
    const emailRegex = /([a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,})/;
    const emailMatch = text.match(emailRegex);
    const email = emailMatch
      ? emailMatch[1].toLowerCase()
      : `candidate.${Date.now()}@applicant.hireiq.internal`;

    // 2. Phone extraction regex
    const phoneRegex = /(\+?\d{1,3}[-.\s]?)?(\(?\d{3}\)?[-.\s]?)?\d{3}[-.\s]?\d{4}/;
    const phoneMatch = text.match(phoneRegex);
    const phone = phoneMatch ? phoneMatch[0] : null;

    // 3. Name heuristic: First line or clean filename
    let candidateName = '';
    const cleanFileName = path
      .basename(originalFileName, path.extname(originalFileName))
      .replace(/[_-]/g, ' ')
      .replace(/\bresume\b|\bcv\b|\bprofile\b/gi, '')
      .trim();

    const lines = text
      .split('\n')
      .map((l) => l.trim())
      .filter(Boolean);

    if (lines.length > 0 && lines[0].length < 40 && !lines[0].includes('@') && !/\d/.test(lines[0])) {
      candidateName = lines[0];
    } else if (cleanFileName.length >= 2) {
      candidateName = cleanFileName
        .split(' ')
        .filter(Boolean)
        .map((w) => w.charAt(0).toUpperCase() + w.slice(1))
        .join(' ');
    } else {
      candidateName = 'Evaluated Candidate';
    }

    // 4. Skills extraction
    const foundSkills = new Set();
    const lowerText = text.toLowerCase();

    for (const skill of SKILL_DICTIONARY) {
      const escaped = skill.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
      const regex = new RegExp(`(^|[^a-zA-Z0-9])${escaped}([^a-zA-Z0-9]|$)`, 'i');
      if (regex.test(text) || lowerText.includes(skill.toLowerCase())) {
        foundSkills.add(skill);
      }
    }

    // 5. Experience estimate (Do not assume 3+ for students/freshers)
    let experienceYears = '0+';
    const expRegex = /(\d{1,2})\+?\s*(?:years|yrs)/i;
    const expMatch = text.match(expRegex);
    if (expMatch) {
      experienceYears = `${expMatch[1]}+`;
    }

    // 6. Education extraction heuristic
    let education = null;
    const eduRegex = /(?:B\.?\s*Tech|B\.?\s*E\.?|B\.?\s*Sc|Bachelor|Master|M\.?\s*Tech|M\.?\s*Sc|MCA|BCA|Degree)[^\n.]{0,80}/i;
    const eduMatch = text.match(eduRegex);
    if (eduMatch) {
      education = eduMatch[0].trim();
    }

    return {
      name: candidateName,
      email,
      phone,
      experienceYears,
      education,
      skills: Array.from(foundSkills),
    };
  },
};
