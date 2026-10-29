'use client';
import { useEffect, useState } from 'react';
import Shell from '@/components/Shell';
import { api } from '@/lib/api';

type Stats = {
  licenses: { active: number; blocked: number; revoked: number };
  rotationsToday: number;
  last7Days: { date: string; count: number }[];
};

export default function Dashboard() {
  const [s, setS] = useState<Stats | null>(null);
  const [err, setErr] = useState('');

  useEffect(() => {
    api.get('/stats').then(setS).catch((e) => setErr(e.message));
  }, []);

  const max = s ? Math.max(1, ...s.last7Days.map((d) => d.count)) : 1;

  return (
    <Shell>
      <div className="page-title">Dashboard</div>
      <div className="page-sub">Resumen de licencias y actividad</div>
      {err && <div className="banner error">{err}</div>}
      {s && (
        <>
          <div className="grid cols-4">
            <div className="card stat"><div className="n">{s.licenses.active}</div><div className="l">Licencias activas</div></div>
            <div className="card stat"><div className="n">{s.licenses.blocked}</div><div className="l">Bloqueadas</div></div>
            <div className="card stat"><div className="n">{s.licenses.revoked}</div><div className="l">Revocadas</div></div>
            <div className="card stat"><div className="n">{s.rotationsToday}</div><div className="l">Rotaciones hoy</div></div>
          </div>
          <div className="sectitle">Rotaciones últimos 7 días</div>
          <div className="card">
            <div className="bars">
              {s.last7Days.length === 0 && <span className="muted">Sin datos todavía.</span>}
              {s.last7Days.map((d) => (
                <div key={d.date} className="bar" style={{ height: `${(d.count / max) * 100}%` }}>
                  <b>{d.count}</b>
                  <span>{d.date.slice(5)}</span>
                </div>
              ))}
            </div>
          </div>
        </>
      )}
    </Shell>
  );
}
