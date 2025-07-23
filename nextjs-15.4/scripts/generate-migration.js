const { execSync } = require('child_process');
const fs = require('fs');
const path = require('path');

function getTimestamp() {
  const now = new Date();
  const year = now.getFullYear();
  const month = String(now.getMonth() + 1).padStart(2, '0');
  const day = String(now.getDate()).padStart(2, '0');
  const hours = String(now.getHours()).padStart(2, '0');
  const minutes = String(now.getMinutes()).padStart(2, '0');
  const seconds = String(now.getSeconds()).padStart(2, '0');
  
  return `${year}${month}${day}${hours}${minutes}${seconds}`;
}

async function main() {
  try {
    console.log('🔄 Generating Drizzle migration with timestamp naming...');
    
    // Run drizzle-kit generate
    execSync('drizzle-kit generate', { stdio: 'inherit' });
    
    // Get the migrations directory
    const migrationsDir = path.join(process.cwd(), 'drizzle', 'migrations');
    
    // Find the most recently created .sql file
    const files = fs.readdirSync(migrationsDir)
      .filter(file => file.endsWith('.sql'))
      .map(file => ({
        file,
        path: path.join(migrationsDir, file),
        mtime: fs.statSync(path.join(migrationsDir, file)).mtime
      }))
      .sort((a, b) => b.mtime - a.mtime);
    
    if (files.length === 0) {
      console.log('ℹ️  No new migration files found');
      return;
    }
    
    const mostRecent = files[0];
    
    // Check if it already has timestamp format
    const timestampRegex = /^\d{14}_/;
    if (timestampRegex.test(mostRecent.file)) {
      console.log(`✅ Migration already has timestamp format: ${mostRecent.file}`);
      return;
    }
    
    // Generate new filename with timestamp
    const timestamp = getTimestamp();
    const originalName = mostRecent.file;
    const namePart = originalName.replace(/^\d+_/, ''); // Remove number prefix
    const newName = `${timestamp}_${namePart}`;
    const newPath = path.join(migrationsDir, newName);
    
    // Rename the file
    fs.renameSync(mostRecent.path, newPath);
    
    console.log(`✅ Renamed migration: ${originalName} → ${newName}`);
    
    // Update meta journal if it exists
    const metaDir = path.join(migrationsDir, 'meta');
    const journalPath = path.join(metaDir, '_journal.json');
    
    if (fs.existsSync(journalPath)) {
      const journal = JSON.parse(fs.readFileSync(journalPath, 'utf8'));
      
      // Update the journal entries
      if (journal.entries) {
        journal.entries = journal.entries.map(entry => {
          if (entry.tag === originalName.replace('.sql', '')) {
            return { ...entry, tag: newName.replace('.sql', '') };
          }
          return entry;
        });
        
        fs.writeFileSync(journalPath, JSON.stringify(journal, null, 2));
        console.log('✅ Updated migration journal');
      }
    }
    
    console.log('🎉 Migration generated successfully with timestamp naming!');
    
  } catch (error) {
    console.error('❌ Failed to generate migration:', error.message);
    process.exit(1);
  }
}

main();