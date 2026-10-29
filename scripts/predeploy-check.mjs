import fs from 'node:fs';
import process from 'node:process';

const config = fs.readFileSync(new URL('../wrangler.jsonc', import.meta.url), 'utf8');
const id = config.match(/"database_id"\s*:\s*"([^"]+)"/)?.[1];
const name = config.match(/"database_name"\s*:\s*"([^"]+)"/)?.[1];
const problems = [];
if (!id || id.includes('REPLACE_WITH') || !/^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i.test(id)) problems.push('Set database_id in wrangler.jsonc to the verified existing D1 database ID.');
if (!name || name.includes('REPLACE_WITH')) problems.push('Set database_name in wrangler.jsonc to the verified existing D1 database name.');
if (problems.length) {
  console.error('DEPLOYMENT BLOCKED to protect existing data:');
  for (const p of problems) console.error(`- ${p}`);
  console.error('Do not create a new database as a workaround. Verify the existing production binding first.');
  process.exit(1);
}
console.log('Configuration placeholders are cleared. This check does not verify database identity, backups, security, or production readiness.');
