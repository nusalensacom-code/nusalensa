const { execSync } = require('child_process');

// Fallback to local sqlite if DATABASE_URL is missing in build environment
if (!process.env.DATABASE_URL) {
  process.env.DATABASE_URL = 'file:./dev.db';
}

console.log('>>> [NUSALENSA BUILD] Using DATABASE_URL:', process.env.DATABASE_URL.startsWith('postgresql') ? 'PostgreSQL' : 'SQLite');

try {
  console.log('>>> [BUILD 1/3] Generating Prisma Client...');
  execSync('npx prisma generate', { stdio: 'inherit' });

  console.log('>>> [BUILD 2/3] Synchronizing Database Schema & Content...');
  execSync('npx prisma db push --accept-data-loss', { stdio: 'inherit' });
  execSync('node prisma/seed.js', { stdio: 'inherit' });

  console.log('>>> [BUILD 3/3] Compiling Next.js Application...');
  execSync('npx next build', { stdio: 'inherit' });
  console.log('>>> [NUSALENSA BUILD] COMPLETED SUCCESSFULLY! <<<');
} catch (error) {
  console.error('>>> [NUSALENSA BUILD ERROR]:', error.message);
  process.exit(1);
}
