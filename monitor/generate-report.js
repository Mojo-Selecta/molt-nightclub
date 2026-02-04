import fs from 'fs';
import { createRequire } from 'module';
const require = createRequire(import.meta.url);

// Función para cargar JSON de manera segura
async function loadJsonFile(path) {
  try {
    if (fs.existsSync(path)) {
      return JSON.parse(fs.readFileSync(path, 'utf8'));
    }
    return {};
  } catch (error) {
    console.error(`Error loading ${path}:`, error);
    return {};
  }
}

async function generateReport() {
  // Cargar datos
  const stats = await loadJsonFile('./monitor/stats.json');
  const workflows = await loadJsonFile('./monitor/workflows.json');
  
  // Extraer métricas importantes
  const report = {
    timestamp: new Date().toISOString(),
    stars: stats.stargazers_count || 0,
    forks: stats.forks_count || 0,
    issues: stats.open_issues_count || 0,
    workflows: {
      total: workflows.total_count || 0,
      success: (workflows.workflow_runs || []).filter(w => w.conclusion === 'success').length,
      failed: (workflows.workflow_runs || []).filter(w => w.conclusion === 'failure').length
    }
  };

  // Guardar reporte actual
  fs.writeFileSync('./monitor/latest.json', JSON.stringify(report, null, 2));

  // Agregar a histórico
  const historyFile = './monitor/history.json';
  let history = [];
  if (fs.existsSync(historyFile)) {
    history = JSON.parse(fs.readFileSync(historyFile));
  }
  history.push(report);
  fs.writeFileSync(historyFile, JSON.stringify(history, null, 2));

  // Generar README con stats
  const readmeContent = `# Molt Night Club Monitor
*Actualizado: ${new Date().toLocaleString()}*

## Estadísticas
- Stars: ${report.stars}
- Forks: ${report.forks}
- Issues abiertas: ${report.issues}

## Workflows
- Total: ${report.workflows.total}
- Exitosos: ${report.workflows.success}
- Fallidos: ${report.workflows.failed}
`;

  fs.writeFileSync('./monitor/README.md', readmeContent);
  console.log("Reporte generado correctamente");
}

// Ejecutar función principal
generateReport().catch(console.error);
