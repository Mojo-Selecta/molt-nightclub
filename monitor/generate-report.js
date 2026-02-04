const fs = require('fs');
const stats = require('./stats.json');
const workflows = require('./workflows.json');

// Extraer métricas importantes
const report = {
  timestamp: new Date().toISOString(),
  stars: stats.stargazers_count,
  forks: stats.forks_count,
  issues: stats.open_issues_count,
  workflows: {
    total: workflows.total_count,
    success: workflows.workflow_runs.filter(w => w.conclusion === 'success').length,
    failed: workflows.workflow_runs.filter(w => w.conclusion === 'failure').length
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
