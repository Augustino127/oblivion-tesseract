import { execSync } from 'child_process';
import { existsSync } from 'fs';

console.log('🚀 Déploiement sur GitHub Pages...\n');

// Vérifier que le build existe
if (!existsSync('./dist')) {
    console.error('❌ Le dossier dist/ n\'existe pas. Lancez "npm run build" d\'abord.');
    process.exit(1);
}

try {
    // Aller dans le dossier dist
    process.chdir('./dist');

    // Initialiser un repo git
    execSync('git init', { stdio: 'inherit' });
    execSync('git add -A', { stdio: 'inherit' });
    execSync('git commit -m "Deploy to GitHub Pages"', { stdio: 'inherit' });

    // Forcer push sur gh-pages
    const repoUrl = execSync('git -C .. remote get-url origin').toString().trim();
    execSync(`git push -f ${repoUrl} HEAD:gh-pages`, { stdio: 'inherit' });

    console.log('\n✅ Déployé avec succès sur gh-pages !');
    console.log('📍 Allez dans Settings > Pages et sélectionnez la branche "gh-pages"');

} catch (error) {
    console.error('❌ Erreur lors du déploiement:', error.message);
    process.exit(1);
}
