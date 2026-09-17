import fs from 'fs';
import path from 'path';
import pdfParse from 'pdf-parse';
import mammoth from 'mammoth';
import { logger } from '../utils/logger.js';

// Comprehensive Skills dictionary for deterministic extraction
const SKILL_DICTIONARY = [
  // Languages & Core
  'JavaScript', 'TypeScript', 'Python', 'Java', 'C++', 'C#', 'Go', 'Golang', 'Rust', 'Ruby', 'PHP', 'Swift', 'Kotlin', 'SQL', 'HTML', 'HTML5', 'CSS', 'CSS3', 'Sass',
  // Frameworks & Libraries
  'React', 'React.js', 'Next.js', 'Vue', 'Vue.js', 'Angular', 'Node.js', 'Express', 'Express.js', 'FastAPI', 'Django', 'Flask', 'Spring', 'Spring Boot', 'ASP.NET', 'Redux', 'Tailwind CSS', 'Tailwind', 'Bootstrap', 'GraphQL', 'REST API', 'RESTful APIs', 'WebAssembly', 'WASM',
  // Databases & Caching
  'PostgreSQL', 'Postgres', 'MySQL', 'MongoDB', 'Redis', 'SQLite', 'Elasticsearch', 'DynamoDB', 'Cassandra', 'Oracle',
  // DevOps & Cloud
  'AWS', 'Amazon Web Services', 'Azure', 'Google Cloud', 'GCP', 'Docker', 'Kubernetes', 'K8s', 'CI/CD', 'GitHub Actions', 'Jenkins', 'Terraform', 'Ansible', 'Linux', 'Microservices', 'System Design',
  // Design & Product
  'Figma', 'FigJam', 'UI/UX', 'Wireframing', 'Prototyping', 'Design Systems', 'User Research', 'Agile', 'Scrum', 'JIRA',
  // Testing
  'Jest', 'Cypress', 'Playwright', 'Mocha', 'Chai', 'Vitest', 'Unit Testing', 'Selenium',
  // Soft skills
  'Communication', 'Problem Solving', 'Leadership', 'Teamwork', 'Mentorship', 'Critical Thinking', 'Collaboration',
];

export const resumeParserService = {
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
      // If parsing failed or corrupted file, generate descriptive placeholder
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

    // 5. Experience estimate
    let experienceYears = '3+';
    const expRegex = /(\d{1,2})\+?\s*(?:years|yrs)/i;
    const expMatch = text.match(expRegex);
    if (expMatch) {
      experienceYears = `${expMatch[1]}+`;
    }

    return {
      name: candidateName,
      email,
      phone,
      experienceYears,
      skills: Array.from(foundSkills),
    };
  },
};
