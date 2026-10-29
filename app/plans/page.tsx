'use client';
import { useEffect, useState } from 'react';
import Shell from '@/components/Shell';
import { api } from '@/lib/api';
import { PERIOD_LABELS } from '@/lib/fmt';

type Plan = {
  code: string; name: string; quotaLimit: number; quotaPeriod: string;
  durationDays: number | null; maxDevices: number; activationWindowDays: number | null; active: boolean;
};

const EMPTY: Plan = { code: '', name: '', quotaLimit: 15, quotaPeriod: 'daily', durationDays: null, maxDevices: 1, activationWindowDays: null, active: true };

export default function PlansPage() {
  const [plans, setPlans] = useState<Plan[]>([]);
  const [err, setErr] = useState('');
  const [editing, setEditing] = useState<Plan | null>(null);
  const [isNew, setIsNew] = useState(false);

  async function load() {
    try { const d = await api.get('/plans'); setPlans(d.items); } catch (e: any) { setErr(e.message); }
  }
  useEffect(() => { load(); }, []);

  async function save() {
    if (!editing) return;
    setErr('');
    try {
      const body = {
        name: editing.name,
        quotaLimit: Number(editing.quotaLimit),
        quotaPeriod: editing.quotaPeriod,
        durationDays: editing.durationDays === null || editing.durationDays === ('' as any) ? null : Number(editing.durationDays),
        maxDevices: Number(editing.maxDevices),
        activationWindowDays: editing.activationWindowDays === null || editing.activationWindowDays === ('' as any) ? null : Number(editing.activationWindowDays),
        active: editing.active,
      };
      if (isNew) await api.post('/plans', { code: editing.code, ...body });
      else await api.patch('/plans/' + editing.code, body);
      setEditing(null);
      await load();
    } catch (e: any) { setErr(e.message); }
  }

  async function del(code: string) {
    if (!confirm(`¿Eliminar el plan "${code}"?`)) return;
    setErr('');
    try { await api.del('/plans/' + code); await load(); }
    catch (e: any) { setErr(e.message === 'plan_in_use' ? 'No se puede: hay licencias usando este plan.' : e.message); }
  }

  const num = (v: number | null) => (v === null ? '∞' : v);

  return (
    <Shell>
      <div className="toolbar">
        <div>
          <div className="page-title">Planes</div>
          <div className="page-sub" style={{ marginBottom: 0 }}>Definí usos, renovación, duración y dispositivos</div>
        </div>
        <div className="spacer" />
        <button className="btn primary" onClick={() => { setEditing({ ...EMPTY }); setIsNew(true); }}>+ Nuevo plan</button>
      </div>
      {err && <div className="banner error">{err}</div>}

      <div className="card" style={{ padding: 0 }}>
        <table>
          <thead>
            <tr><th>Código</th><th>Nombre</th><th>Cupo</th><th>Renovación</th><th>Duración</th><th>Devices</th><th>Ventana</th><th></th></tr>
          </thead>
          <tbody>
            {plans.map((p) => (
              <tr key={p.code}>
                <td className="mono">{p.code}</td>
                <td>{p.name}</td>
                <td>{p.quotaLimit}</td>
                <td>{PERIOD_LABELS[p.quotaPeriod] || p.quotaPeriod}</td>
                <td>{p.durationDays === null ? 'Sin vencimiento' : `${p.durationDays} días`}</td>
                <td>{p.maxDevices}</td>
                <td>{p.activationWindowDays === null ? 'Siempre' : `${p.activationWindowDays} días`}</td>
                <td className="row">
                  <button className="btn sm" onClick={() => { setEditing({ ...p }); setIsNew(false); }}>Editar</button>
                  <button className="btn sm danger" onClick={() => del(p.code)}>Eliminar</button>
                </td>
              </tr>
            ))}
            {plans.length === 0 && <tr><td colSpan={8} className="muted" style={{ padding: 20 }}>No hay planes. Creá uno.</td></tr>}
          </tbody>
        </table>
      </div>

      {editing && (
        <div className="modal-bg" onClick={() => setEditing(null)}>
          <div className="modal" onClick={(e) => e.stopPropagation()}>
            <h3>{isNew ? 'Nuevo plan' : `Editar ${editing.code}`}</h3>
            {isNew && (
              <div className="field">
                <label>Código (sin espacios)</label>
                <input className="input mono" value={editing.code} onChange={(e) => setEditing({ ...editing, code: e.target.value })} />
              </div>
            )}
            <div className="field"><label>Nombre</label>
              <input className="input" value={editing.name} onChange={(e) => setEditing({ ...editing, name: e.target.value })} /></div>
            <div className="grid cols-2">
              <div className="field"><label>Cupo (rotaciones)</label>
                <input className="input" type="number" min={1} value={editing.quotaLimit} onChange={(e) => setEditing({ ...editing, quotaLimit: Number(e.target.value) })} /></div>
              <div className="field"><label>Renovación</label>
                <select className="input" value={editing.quotaPeriod} onChange={(e) => setEditing({ ...editing, quotaPeriod: e.target.value })}>
                  <option value="daily">Diaria</option><option value="monthly">Mensual</option><option value="total">Total (de por vida)</option>
                </select></div>
            </div>
            <div className="grid cols-2">
              <div className="field"><label>Duración (días, vacío = ∞)</label>
                <input className="input" type="number" min={1} value={editing.durationDays ?? ''} onChange={(e) => setEditing({ ...editing, durationDays: e.target.value === '' ? null : Number(e.target.value) })} /></div>
              <div className="field"><label>Dispositivos</label>
                <input className="input" type="number" min={1} value={editing.maxDevices} onChange={(e) => setEditing({ ...editing, maxDevices: Number(e.target.value) })} /></div>
            </div>
            <div className="field"><label>Ventana de activación (días, vacío = siempre)</label>
              <input className="input" type="number" min={1} value={editing.activationWindowDays ?? ''} onChange={(e) => setEditing({ ...editing, activationWindowDays: e.target.value === '' ? null : Number(e.target.value) })} /></div>
            <div className="row end mt">
              <button className="btn" onClick={() => setEditing(null)}>Cancelar</button>
              <button className="btn primary" onClick={save}>Guardar</button>
            </div>
          </div>
        </div>
      )}
    </Shell>
  );
}
