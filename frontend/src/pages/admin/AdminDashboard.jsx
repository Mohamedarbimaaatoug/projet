import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  AreaChart, Area, XAxis, YAxis, Tooltip, ResponsiveContainer, BarChart, Bar, Cell
} from 'recharts';
import api from '../../api/axios';
import { StatusBadge } from '../DashboardPage';

const COLORS = ['#A88F5E', '#C4AC7D', '#8C7243', '#D6C095', '#6E5933', '#E0D0B5'];

function StatCard({ icon, label, value, sub, color = 'var(--gold)' }) {
  return (
    <div className="stat-card">
      <div className="stat-icon" style={{ background: `${color}18`, fontSize: '1.4rem' }}>{icon}</div>
      <div className="stat-value" style={{ color }}>{value}</div>
      <div className="stat-label">{label}</div>
      {sub && <div className="stat-sub">{sub}</div>}
    </div>
  );
}

export default function AdminDashboard() {
  const navigate = useNavigate();
  const [stats, setStats] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    api.get('/stats')
      .then(({ data }) => setStats(data))
      .catch(() => {})
      .finally(() => setLoading(false));
  }, []);

  if (loading) return (
    <div className="loader-wrap animate-fade">
      <div className="spinner" />
      <p>Chargement du tableau de bord…</p>
    </div>
  );

  return (
    <div className="animate-fade">
      {/* Header */}
      <div className="page-header">
        <div>
          <h2 className="page-title">📊 Tableau de bord</h2>
          <p className="page-subtitle">Vue d'ensemble — Administration Hôtel Paradis</p>
        </div>
        <button className="btn btn-secondary btn-sm" onClick={() => window.location.reload()}>
          🔄 Actualiser
        </button>
      </div>

      {stats && (
        <>
          {/* KPI Cards */}
          <div className="grid-4 stagger" style={{ marginBottom: 28 }}>
            <StatCard icon="📊" label="Total réclamations" value={stats.totalReclamations}
              sub={`${stats.todayReclamations} aujourd'hui`} />
            <StatCard icon="✅" label="Résolues" value={stats.resolvedReclamations}
              color="var(--status-resolved)" sub={`Taux: ${stats.resolutionRate}%`} />
            <StatCard icon="⏳" label="En cours" value={stats.inProgressReclamations}
              color="var(--status-progress)" sub={`${stats.newReclamations} nouvelles`} />
            <StatCard icon="⭐" label="Satisfaction" value={`${stats.avgSatisfaction}/5`}
              color="var(--gold)" sub="Note moyenne globale" />
          </div>

          {/* Charts */}
          <div className="grid-2" style={{ marginBottom: 28 }}>
            <div className="card">
              <h3 style={{ marginBottom: 20 }}>📈 Réclamations — 7 derniers jours</h3>
              <ResponsiveContainer width="100%" height={200}>
                <AreaChart data={stats.dailyData} margin={{ top: 5, right: 5, bottom: 0, left: -20 }}>
                  <defs>
                    <linearGradient id="goldGrad" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor="var(--gold)" stopOpacity={0.3} />
                      <stop offset="95%" stopColor="var(--gold)" stopOpacity={0} />
                    </linearGradient>
                  </defs>
                  <XAxis dataKey="day" axisLine={false} tickLine={false} tick={{ fontSize: 11, fill: '#9E978E' }} />
                  <YAxis axisLine={false} tickLine={false} allowDecimals={false} tick={{ fontSize: 11, fill: '#9E978E' }} />
                  <Tooltip
                    contentStyle={{ background: 'var(--bg-card2)', border: '1px solid var(--border-card)', borderRadius: 8 }}
                    labelStyle={{ color: 'var(--text-primary)', fontWeight: 600 }}
                    itemStyle={{ color: 'var(--gold)' }}
                    formatter={(v) => [v, 'Réclamations']}
                  />
                  <Area type="monotone" dataKey="count" stroke="var(--gold)" strokeWidth={2}
                    fill="url(#goldGrad)" dot={{ fill: 'var(--gold)', r: 3 }} />
                </AreaChart>
              </ResponsiveContainer>
            </div>

            <div className="card">
              <h3 style={{ marginBottom: 20 }}>🏷️ Par catégorie</h3>
              {stats.byCategory.length === 0 ? (
                <div className="empty-state"><div className="empty-icon">📭</div><p>Aucune donnée</p></div>
              ) : (
                <ResponsiveContainer width="100%" height={200}>
                  <BarChart data={stats.byCategory} layout="vertical" margin={{ top: 5, right: 5, bottom: 0, left: 10 }}>
                    <XAxis type="number" axisLine={false} tickLine={false} allowDecimals={false} tick={{ fontSize: 11, fill: '#9E978E' }} />
                    <YAxis type="category" dataKey="_id" axisLine={false} tickLine={false} tick={{ fontSize: 11, fill: '#6B665E' }} width={90} />
                    <Tooltip
                      contentStyle={{ background: 'var(--bg-card2)', border: '1px solid var(--border-card)', borderRadius: 8 }}
                      itemStyle={{ color: 'var(--gold)' }}
                      cursor={{ fill: 'rgba(168, 143, 94, 0.06)' }}
                    />
                    <Bar dataKey="count" radius={[0, 4, 4, 0]}>
                      {stats.byCategory.map((_, i) => (
                        <Cell key={i} fill={COLORS[i % COLORS.length]} />
                      ))}
                    </Bar>
                  </BarChart>
                </ResponsiveContainer>
              )}
            </div>
          </div>

          {/* Resolution rate bar */}
          <div className="card" style={{ marginBottom: 28 }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 16 }}>
              <h3>🎯 Taux de résolution</h3>
              <span style={{ color: 'var(--gold)', fontWeight: 700, fontSize: '1.3rem' }}>
                {stats.resolutionRate}%
              </span>
            </div>
            <div style={{ background: 'var(--bg-input)', borderRadius: 100, height: 10, overflow: 'hidden' }}>
              <div style={{
                width: `${stats.resolutionRate}%`, height: '100%',
                background: 'linear-gradient(90deg, var(--gold), var(--gold-light))',
                borderRadius: 100, transition: 'width 1s ease',
              }} />
            </div>
            <p style={{ fontSize: '0.78rem', color: 'var(--text-muted)', marginTop: 8 }}>
              {stats.resolvedReclamations} résolues sur {stats.totalReclamations} total
            </p>
          </div>

          {/* Recent reclamations */}
          {stats.recentReclamations?.length > 0 && (
            <div className="card">
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 20 }}>
                <h3>🕒 Réclamations récentes</h3>
                <button className="btn btn-ghost btn-sm" onClick={() => navigate('/admin/reclamations')}>
                  Voir tout →
                </button>
              </div>
              <div className="table-wrapper">
                <table>
                  <thead>
                    <tr>
                      <th>Client</th><th>Chambre</th><th>Catégorie</th><th>Statut</th><th>Date</th>
                    </tr>
                  </thead>
                  <tbody>
                    {stats.recentReclamations.map((c) => (
                      <tr key={c._id}>
                        <td className="primary">{c.clientName || '—'}</td>
                        <td>#{c.roomNumber}</td>
                        <td><span style={{ color: 'var(--gold)', fontSize: '0.82rem' }}>{c.category}</span></td>
                        <td><StatusBadge status={c.status} /></td>
                        <td style={{ fontSize: '0.78rem' }}>{new Date(c.createdAt).toLocaleDateString('fr-FR')}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          )}
        </>
      )}
    </div>
  );
}
