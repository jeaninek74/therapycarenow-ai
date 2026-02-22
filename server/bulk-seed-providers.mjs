/**
 * Bulk Provider Seeder — TherapyCareNow
 * Inserts 10,000 unique providers into the database in batches
 * Clears ALL existing providers first, then inserts fresh unique data
 */

import { readFileSync } from 'fs';
import mysql from 'mysql2/promise';
import * as dotenv from 'dotenv';
dotenv.config();

const DATABASE_URL = process.env.DATABASE_URL;
if (!DATABASE_URL) {
  console.error('DATABASE_URL not set');
  process.exit(1);
}

const providers = JSON.parse(readFileSync('./server/providers-data.json', 'utf-8'));
console.log(`Loaded ${providers.length} providers`);

// Pre-flight uniqueness check
const nameSet = new Set(providers.map(p => p.name));
const npiSet = new Set(providers.map(p => p.npiNumber));
const licSet = new Set(providers.map(p => p.licenseNumber));
const phoneSet = new Set(providers.map(p => p.phone));

if (nameSet.size !== providers.length) { console.error('DUPLICATE NAMES DETECTED — aborting'); process.exit(1); }
if (npiSet.size !== providers.length) { console.error('DUPLICATE NPIs DETECTED — aborting'); process.exit(1); }
if (licSet.size !== providers.length) { console.error('DUPLICATE LICENSE NUMBERS DETECTED — aborting'); process.exit(1); }
if (phoneSet.size !== providers.length) { console.error('DUPLICATE PHONES DETECTED — aborting'); process.exit(1); }

console.log('Pre-flight uniqueness check passed ✓');

const url = new URL(DATABASE_URL);
const connection = await mysql.createConnection({
  host: url.hostname,
  port: parseInt(url.port) || 3306,
  user: url.username,
  password: url.password,
  database: url.pathname.slice(1),
  ssl: { rejectUnauthorized: false },
  multipleStatements: false,
});

console.log('Connected to database');

// Wipe ALL existing providers cleanly
console.log('Wiping all existing provider data...');
await connection.execute('DELETE FROM provider_specialties');
await connection.execute('DELETE FROM provider_insurance');
await connection.execute('DELETE FROM providers');
console.log('All existing providers cleared ✓');

// Insert in batches of 100
const BATCH_SIZE = 100;
let inserted = 0;
let errors = 0;

for (let i = 0; i < providers.length; i += BATCH_SIZE) {
  const batch = providers.slice(i, i + BATCH_SIZE);

  for (const p of batch) {
    try {
      const [result] = await connection.execute(
        `INSERT INTO providers
          (name, licenseState, licenseType, licenseNumber, npiNumber, verificationStatus,
           telehealthAvailable, inPersonAvailable, city, stateCode, phone,
           languages, costTag, acceptsNewPatients, urgencyAvailability, bio, isActive)
         VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
        [
          p.name, p.licenseState, p.licenseType, p.licenseNumber, p.npiNumber,
          p.verificationStatus, p.telehealthAvailable ? 1 : 0, p.inPersonAvailable ? 1 : 0,
          p.city, p.stateCode, p.phone, p.languages, p.costTag,
          p.acceptsNewPatients ? 1 : 0, p.urgencyAvailability, p.bio, 1
        ]
      );

      const providerId = result.insertId;

      // Insert specialties
      if (p.specialties) {
        for (const spec of p.specialties.split(',')) {
          await connection.execute(
            'INSERT INTO provider_specialties (providerId, specialty) VALUES (?, ?)',
            [providerId, spec.trim()]
          );
        }
      }

      // Insert insurance
      if (p.insurance) {
        for (const carrier of p.insurance.split(',')) {
          await connection.execute(
            'INSERT INTO provider_insurance (providerId, insuranceName) VALUES (?, ?)',
            [providerId, carrier.trim()]
          );
        }
      }

      inserted++;
    } catch (err) {
      errors++;
      if (errors <= 5) console.error(`\nError inserting ${p.name}: ${err.message}`);
    }
  }

  const pct = Math.round(Math.min(i + BATCH_SIZE, providers.length) / providers.length * 100);
  process.stdout.write(`\rProgress: ${inserted}/${providers.length} (${pct}%) | Errors: ${errors}`);
}

console.log(`\n\nSeeding complete!`);
console.log(`  Inserted: ${inserted}`);
console.log(`  Errors:   ${errors}`);

// Final counts
const [total] = await connection.execute('SELECT COUNT(*) as total FROM providers');
const [byState] = await connection.execute('SELECT stateCode, COUNT(*) as cnt FROM providers GROUP BY stateCode ORDER BY stateCode');

console.log(`\nTotal providers in database: ${total[0].total}`);
console.log('\nProviders per state:');
for (const row of byState) {
  process.stdout.write(`  ${row.stateCode}: ${row.cnt}  `);
}
console.log('');

await connection.end();
