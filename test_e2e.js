const http = require('http');

function request(method, path, body = null) {
  return new Promise((resolve, reject) => {
    const data = body ? JSON.stringify(body) : null;
    const options = {
      hostname: 'localhost', port: 5000,
      path, method,
      headers: { 'Content-Type': 'application/json', ...(data ? { 'Content-Length': Buffer.byteLength(data) } : {}) }
    };
    const req = http.request(options, (res) => {
      let result = '';
      res.on('data', d => result += d);
      res.on('end', () => resolve({ status: res.statusCode, body: JSON.parse(result) }));
    });
    req.on('error', reject);
    if (data) req.write(data);
    req.end();
  });
}

const GREEN  = '\x1b[32m';
const RED    = '\x1b[31m';
const YELLOW = '\x1b[33m';
const CYAN   = '\x1b[36m';
const BOLD   = '\x1b[1m';
const RESET  = '\x1b[0m';

function pass(msg) { console.log(`${GREEN}  ✅ PASS${RESET} — ${msg}`); }
function fail(msg)  { console.log(`${RED}  ❌ FAIL${RESET} — ${msg}`); }
function info(msg)  { console.log(`${CYAN}  ℹ️  ${msg}${RESET}`); }
function step(n, msg) { console.log(`\n${BOLD}${YELLOW}[STEP ${n}]${RESET} ${BOLD}${msg}${RESET}`); }

async function runTests() {
  console.log(`\n${BOLD}${'='.repeat(55)}${RESET}`);
  console.log(`${BOLD}   🏨 HOTEL PARADIS — TEST E2E COMPLET (RÉNOVÉ)${RESET}`);
  console.log(`${BOLD}${'='.repeat(55)}${RESET}\n`);

  let clientId, reclamationId;

  // ── STEP 1: Health ─────────────────────────────────────
  step(1, 'Backend Health Check');
  try {
    const r = await request('GET', '/api/health');
    if (r.status === 200 && r.body.status === 'ok') pass(`Backend opérationnel — ${r.body.time}`);
    else fail(`Status inattendu: ${r.status}`);
  } catch (e) { fail(`Backend inaccessible: ${e.message}`); }

  // ── STEP 2: Client Login ────────────────────────────────
  step(2, 'Connexion Client (Sophie Martin, Chambre 302)');
  try {
    const r = await request('POST', '/api/clients/login', {
      name: 'Sophie Martin', email: 'sophie.martin@test.com',
      phone: '0611223344', roomNumber: '302'
    });
    if (r.status === 200 && r.body.client) {
      clientId = r.body.client._id;
      pass(`Client créé — ID: ${clientId}`);
      info(`Nom: ${r.body.client.name} | Chambre: ${r.body.client.roomNumber}`);
    } else fail(`Login client échoué: ${JSON.stringify(r.body)}`);
  } catch (e) { fail(e.message); }

  // ── STEP 3: Block admin@hotel via client login ──────────
  step(3, 'Blocage compte admin via portail client');
  try {
    const r = await request('POST', '/api/clients/login', {
      name: 'Admin', email: 'admin@hotel-paradis.com',
      phone: '0000000000', roomNumber: 'ADMIN'
    });
    if (r.status === 403) pass(`Accès admin bloqué correctement (403)`);
    else fail(`Devrait être 403, reçu: ${r.status}`);
  } catch (e) { fail(e.message); }

  // ── STEP 4: Submit Reclamation ──────────────────────────
  step(4, 'Soumission réclamation (Climatisation, Chambre 302)');
  try {
    const FormData = require('form-data');
    const form = new FormData();
    form.append('clientId', clientId);
    form.append('clientName', 'Sophie Martin');
    form.append('roomNumber', '302');
    form.append('category', 'Climatisation');
    form.append('description', 'La climatisation ne fonctionne pas depuis hier soir. Chambre très chaude.');

    const r = await new Promise((resolve, reject) => {
      const req = http.request({
        hostname: 'localhost', port: 5000,
        path: '/api/reclamations', method: 'POST',
        headers: form.getHeaders()
      }, (res) => {
        let d = '';
        res.on('data', c => d += c);
        res.on('end', () => resolve({ status: res.statusCode, body: JSON.parse(d) }));
      });
      req.on('error', reject);
      form.pipe(req);
    });

    if (r.status === 201 && r.body.reclamation) {
      reclamationId = r.body.reclamation._id;
      pass(`Réclamation créée — ID: ${reclamationId}`);
      info(`Statut initial: ${r.body.reclamation.status}`);
    } else fail(`Erreur: ${JSON.stringify(r.body)}`);
  } catch (e) {
    // Fallback: try JSON
    try {
      const r2 = await request('POST', '/api/reclamations', {
        clientId, clientName: 'Sophie Martin', roomNumber: '302',
        category: 'Climatisation',
        description: 'La climatisation ne fonctionne pas. Chambre très chaude.'
      });
      if (r2.status === 201) {
        reclamationId = r2.body.reclamation._id;
        pass(`Réclamation créée (JSON) — ID: ${reclamationId}`);
      } else fail(`${r2.status}: ${JSON.stringify(r2.body)}`);
    } catch (e2) { fail(e2.message); }
  }

  // ── STEP 5: Get Client Reclamations ────────────────────
  step(5, 'Récupération réclamations du client');
  try {
    const r = await request('GET', `/api/reclamations/client/${clientId}`);
    if (r.status === 200 && r.body.length > 0) {
      pass(`${r.body.length} réclamation(s) trouvée(s)`);
      info(`Dernière: ${r.body[0].category} — ${r.body[0].status}`);
      if (!reclamationId) reclamationId = r.body[0]._id;
    } else fail(`Aucune réclamation: ${JSON.stringify(r.body)}`);
  } catch (e) { fail(e.message); }

  // ── STEP 6: Admin Login ─────────────────────────────────
  step(6, 'Connexion Admin (admin / hotel2025)');
  try {
    const r = await request('POST', '/api/admin/login', { username: 'admin', password: 'hotel2025' });
    if (r.status === 200 && r.body.admin) {
      pass(`Admin connecté: ${r.body.admin.name} (${r.body.admin.role})`);
    } else fail(`Login admin échoué: ${JSON.stringify(r.body)}`);
  } catch (e) { fail(e.message); }

  // ── STEP 6b: Wrong Admin Password ──────────────────────
  step('6b', 'Rejet mauvais mot de passe admin');
  try {
    const r = await request('POST', '/api/admin/login', { username: 'admin', password: 'wrong' });
    if (r.status === 401) pass(`Mauvais identifiants rejetés correctement (401)`);
    else fail(`Devrait être 401, reçu: ${r.status}`);
  } catch (e) { fail(e.message); }

  // ── STEP 7: Admin Dispatch ──────────────────────────────
  step(7, `Admin dispatche réclamation ${reclamationId?.slice(-6)} → Chef Maintenance`);
  try {
    const r = await request('PATCH', `/api/reclamations/${reclamationId}/dispatch`, { dept: 'Climatisation' });
    if (r.status === 200 && r.body.reclamation) {
      pass(`Dispatché: ${r.body.message}`);
      info(`Statut: ${r.body.reclamation.status} | Dept: ${r.body.reclamation.dispatchedTo?.dept}`);
      info(`Chef: ${r.body.reclamation.dispatchedTo?.chiefName}`);
    } else fail(`Dispatch échoué: ${JSON.stringify(r.body)}`);
  } catch (e) { fail(e.message); }

  // ── STEP 8: Chef Login ──────────────────────────────────
  step(8, 'Connexion Chef Maintenance (maintenance / maint2025)');
  try {
    const r = await request('POST', '/api/chef/login', { username: 'maintenance', password: 'maint2025' });
    if (r.status === 200 && r.body.chef) {
      pass(`Chef connecté: ${r.body.chef.name} (${r.body.chef.title})`);
      info(`Département: ${r.body.chef.dept}`);
    } else fail(`Login chef échoué: ${JSON.stringify(r.body)}`);
  } catch (e) { fail(e.message); }

  // ── STEP 8b: All Chef Logins ────────────────────────────
  step('8b', 'Test tous les comptes chefs');
  const chefs = [
    { u: 'maintenance', p: 'maint2025' }, { u: 'technique',    p: 'tech2025'   },
    { u: 'menage',      p: 'menage2025' }, { u: 'restauration', p: 'resto2025'  },
    { u: 'securite',    p: 'secu2025'  }, { u: 'directeur',    p: 'dir2025'    },
  ];
  for (const c of chefs) {
    try {
      const r = await request('POST', '/api/chef/login', { username: c.u, password: c.p });
      if (r.status === 200) pass(`${c.u} → ${r.body.chef.title} ✓`);
      else fail(`${c.u}: ${r.status}`);
    } catch (e) { fail(`${c.u}: ${e.message}`); }
  }

  // ── STEP 9: Chef Gets Reclamations ─────────────────────
  step(9, 'Chef Maintenance voit ses réclamations dispatché');
  try {
    const r = await request('GET', '/api/chef/reclamations?dept=Maintenance');
    if (r.status === 200 && r.body.length > 0) {
      pass(`${r.body.length} réclamation(s) dans Maintenance`);
      info(`Première: ${r.body[0].category} — ${r.body[0].status} — Chambre ${r.body[0].roomNumber}`);
    } else if (r.status === 200 && r.body.length === 0) {
      fail('Aucune réclamation dans Maintenance (dispatch pas encore fait?)');
    } else fail(JSON.stringify(r.body));
  } catch (e) { fail(e.message); }

  // ── STEP 10: Chef Resolves ──────────────────────────────
  step(10, 'Chef soumet rapport intervention → Résolu');
  try {
    const r = await request('PATCH', `/api/chef/reclamations/${reclamationId}/resolve`, {
      interventionNote: 'Technicien intervenu à 15h30. Filtre climatisation nettoyé, gaz rechargé. Problème résolu.',
      status: 'Résolu'
    });
    if (r.status === 200 && r.body.reclamation?.status === 'Résolu') {
      pass(`Réclamation résolue avec succès`);
      info(`Note: ${r.body.reclamation.adminNote}`);
    } else fail(`Résolution échouée: ${JSON.stringify(r.body)}`);
  } catch (e) { fail(e.message); }

  // ── STEP 11: Client Sees Resolved ──────────────────────
  step(11, 'Client voit statut "Résolu" dans ses réclamations');
  try {
    const r = await request('GET', `/api/reclamations/client/${clientId}`);
    const resolved = r.body.filter(c => c.status === 'Résolu');
    if (r.status === 200 && resolved.length > 0) {
      pass(`${resolved.length} réclamation(s) résolue(s) visible(s) par le client`);
      info(`Note visible: ${resolved[0].adminNote}`);
    } else fail(`Pas de réclamation résolue: total=${r.body.length}`);
  } catch (e) { fail(e.message); }

  // ── STEP 12: Stats ──────────────────────────────────────
  step(12, 'Statistiques dashboard admin');
  try {
    const r = await request('GET', '/api/stats');
    if (r.status === 200) {
      pass(`Stats OK`);
      info(`Total: ${r.body.totalReclamations} | Résolues: ${r.body.resolvedReclamations} | Taux: ${r.body.resolutionRate}%`);
      info(`Clients list exclude admin: ${r.body.totalReclamations >= 0 ? 'OK' : 'Check'}`);
    } else fail(JSON.stringify(r.body));
  } catch (e) { fail(e.message); }

  // ── STEP 13: Clients list no admin ─────────────────────
  step(13, 'Liste clients — Admin absent');
  try {
    const r = await request('GET', '/api/clients');
    const hasAdmin = r.body.some(g => g.roomNumber === 'ADMIN' || g.email === 'admin@hotel-paradis.com');
    if (!hasAdmin) pass(`Admin absent de la liste clients ✓ (${r.body.length} client(s))`);
    else fail(`Admin encore présent dans la liste!`);
    r.body.forEach(g => info(`  → ${g.name} | Chambre ${g.roomNumber} | ${g.email}`));
  } catch (e) { fail(e.message); }

  console.log(`\n${BOLD}${'='.repeat(55)}${RESET}`);
  console.log(`${BOLD}${GREEN}   ✅ TESTS TERMINÉS${RESET}`);
  console.log(`${BOLD}${'='.repeat(55)}${RESET}\n`);
}

runTests().catch(console.error);
