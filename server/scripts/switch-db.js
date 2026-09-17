import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const schemaPath = path.resolve(__dirname, '../prisma/schema.prisma');

const target = process.argv[2]?.toLowerCase();

if (!['sqlite', 'postgres', 'postgresql'].includes(target)) {
  console.log('Usage: node scripts/switch-db.js [sqlite|postgres]');
  process.exit(1);
}

const provider = target === 'sqlite' ? 'sqlite' : 'postgresql';
let content = fs.readFileSync(schemaPath, 'utf8');

content = content.replace(
  /datasource db \{\s+provider = "(sqlite|postgresql)"/m,
  `datasource db {\n  provider = "${provider}"`
);

fs.writeFileSync(schemaPath, content, 'utf8');
console.log(`[HireIQ] Prisma schema provider switched to: ${provider}`);
