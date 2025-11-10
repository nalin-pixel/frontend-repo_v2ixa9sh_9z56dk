import { useEffect, useMemo, useState } from 'react'

const API_BASE = import.meta.env.VITE_BACKEND_URL || 'http://localhost:8000'

function useApiList(collection, refreshKey) {
  const [data, setData] = useState([])
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState(null)

  useEffect(() => {
    let ignore = false
    async function run() {
      setLoading(true); setError(null)
      try {
        const res = await fetch(`${API_BASE}/api/list/${collection}`)
        if (!res.ok) throw new Error(`List ${collection} failed`)
        const json = await res.json()
        if (!ignore) setData(json.items || [])
      } catch (e) {
        if (!ignore) setError(e.message)
      } finally {
        if (!ignore) setLoading(false)
      }
    }
    run()
    return () => { ignore = true }
  }, [collection, refreshKey])

  return { data, loading, error }
}

function StatCard({ label, value }) {
  return (
    <div className="p-4 rounded-xl bg-white/70 backdrop-blur border border-gray-200 shadow-sm">
      <p className="text-sm text-gray-500">{label}</p>
      <p className="text-2xl font-semibold text-gray-900">{value}</p>
    </div>
  )
}

function Section({ title, actions, children }) {
  return (
    <div className="bg-white rounded-xl border border-gray-200 shadow-sm">
      <div className="px-4 sm:px-6 py-4 flex items-center justify-between border-b border-gray-100">
        <h3 className="text-lg font-semibold text-gray-800">{title}</h3>
        <div className="flex items-center gap-2">{actions}</div>
      </div>
      <div className="p-4 sm:p-6">{children}</div>
    </div>
  )
}

function SimpleTable({ items, columns }) {
  return (
    <div className="overflow-x-auto">
      <table className="min-w-full text-sm">
        <thead>
          <tr className="text-left text-gray-500">
            {columns.map(col => (
              <th key={col.key} className="py-2 pr-6 font-medium">{col.label}</th>
            ))}
          </tr>
        </thead>
        <tbody>
          {items.map((row, idx) => (
            <tr key={idx} className="border-t border-gray-100">
              {columns.map(col => (
                <td key={col.key} className="py-2 pr-6 text-gray-800">
                  {col.render ? col.render(row[col.key], row) : (String(row[col.key] ?? ''))}
                </td>
              ))}
            </tr>
          ))}
          {items.length === 0 && (
            <tr><td className="py-6 text-gray-400" colSpan={columns.length}>No records yet</td></tr>
          )}
        </tbody>
      </table>
    </div>
  )
}

function CreateHousehold({ onCreated }) {
  const [name, setName] = useState('')
  const [risk, setRisk] = useState('')
  const [loading, setLoading] = useState(false)
  async function submit(e){
    e.preventDefault(); setLoading(true)
    try{
      const res = await fetch(`${API_BASE}/api/create`,{method:'POST', headers:{'Content-Type':'application/json'}, body: JSON.stringify({collection:'household', data:{name, risk_profile: risk}})})
      if(!res.ok) throw new Error('Create failed')
      setName(''); setRisk(''); onCreated()
    }catch(err){ alert(err.message) } finally{ setLoading(false) }
  }
  return (
    <form onSubmit={submit} className="flex flex-col sm:flex-row gap-2">
      <input className="input" placeholder="Household name" value={name} onChange={e=>setName(e.target.value)} required />
      <select className="input" value={risk} onChange={e=>setRisk(e.target.value)}>
        <option value="">Risk profile</option>
        <option>Conservative</option>
        <option>Moderate</option>
        <option>Aggressive</option>
      </select>
      <button disabled={loading} className="btn-primary">{loading? 'Saving...' : 'Add Household'}</button>
    </form>
  )
}

function CreateClient({ onCreated, households }) {
  const [first, setFirst] = useState('')
  const [last, setLast] = useState('')
  const [email, setEmail] = useState('')
  const [householdId, setHouseholdId] = useState('')
  const [loading, setLoading] = useState(false)
  async function submit(e){
    e.preventDefault(); setLoading(true)
    try{
      const data = { first_name:first, last_name:last, email, household_id: householdId || null }
      const res = await fetch(`${API_BASE}/api/create`,{method:'POST', headers:{'Content-Type':'application/json'}, body: JSON.stringify({collection:'client', data})})
      if(!res.ok) throw new Error('Create failed')
      setFirst(''); setLast(''); setEmail(''); setHouseholdId(''); onCreated()
    }catch(err){ alert(err.message) } finally{ setLoading(false) }
  }
  return (
    <form onSubmit={submit} className="grid grid-cols-1 sm:grid-cols-5 gap-2">
      <input className="input" placeholder="First name" value={first} onChange={e=>setFirst(e.target.value)} required />
      <input className="input" placeholder="Last name" value={last} onChange={e=>setLast(e.target.value)} required />
      <input className="input" placeholder="Email" value={email} onChange={e=>setEmail(e.target.value)} />
      <select className="input" value={householdId} onChange={e=>setHouseholdId(e.target.value)}>
        <option value="">No household</option>
        {households.map(h => (
          <option key={h._id} value={h._id}>{h.name}</option>
        ))}
      </select>
      <button disabled={loading} className="btn-primary">{loading? 'Saving...' : 'Add Client'}</button>
    </form>
  )
}

function CreateTask({ onCreated, clients }){
  const [title, setTitle] = useState('')
  const [assignee, setAssignee] = useState('')
  const [clientId, setClientId] = useState('')
  const [loading, setLoading] = useState(false)
  async function submit(e){
    e.preventDefault(); setLoading(true)
    try{
      const res = await fetch(`${API_BASE}/api/create`, { method:'POST', headers:{'Content-Type':'application/json'}, body: JSON.stringify({ collection:'task', data:{ title, assignee_id: assignee || null, related_client_id: clientId || null } }) })
      if(!res.ok) throw new Error('Create failed')
      setTitle(''); setAssignee(''); setClientId(''); onCreated()
    }catch(err){ alert(err.message) } finally{ setLoading(false) }
  }
  return (
    <form onSubmit={submit} className="grid grid-cols-1 sm:grid-cols-4 gap-2">
      <input className="input" placeholder="Task title" value={title} onChange={e=>setTitle(e.target.value)} required />
      <input className="input" placeholder="Assignee ID (optional)" value={assignee} onChange={e=>setAssignee(e.target.value)} />
      <select className="input" value={clientId} onChange={e=>setClientId(e.target.value)}>
        <option value="">Related client (optional)</option>
        {clients.map(c => (
          <option key={c._id} value={c._id}>{c.first_name} {c.last_name}</option>
        ))}
      </select>
      <button disabled={loading} className="btn-primary">{loading? 'Saving...' : 'Add Task'}</button>
    </form>
  )
}

function AIActions({ onNewData, households }){
  const [householdId, setHouseholdId] = useState('')
  const [year, setYear] = useState(new Date().getFullYear())
  const [loading, setLoading] = useState(false)

  async function call(path, body){
    setLoading(true)
    try{
      const res = await fetch(`${API_BASE}${path}`, { method:'POST', headers:{'Content-Type':'application/json'}, body: JSON.stringify(body) })
      const json = await res.json()
      onNewData?.()
      alert('AI action completed. Check Recommendations and Compliance.')
      return json
    } catch(e){ alert(e.message) } finally { setLoading(false) }
  }

  async function seed(){
    setLoading(true)
    try{
      const res = await fetch(`${API_BASE}/api/seed/demo`, { method:'POST', headers:{'Content-Type':'application/json'}, body: JSON.stringify({ count_clients: 20 }) })
      const json = await res.json()
      onNewData?.()
      alert(json.message || 'Seeded demo data')
    } catch(e){ alert(e.message) } finally { setLoading(false) }
  }

  return (
    <div className="flex flex-col sm:flex-row gap-2">
      <select className="input" value={householdId} onChange={e=>setHouseholdId(e.target.value)}>
        <option value="">Select household (optional)</option>
        {households.map(h => <option key={h._id} value={h._id}>{h.name}</option>)}
      </select>
      <button disabled={loading} className="btn-secondary" onClick={()=>call('/api/ai/portfolio/analysis',{ household_id: householdId || null, account_ids: [] })}>Portfolio Analysis</button>
      <div className="flex items-center gap-2">
        <input type="number" className="input w-28" value={year} onChange={e=>setYear(parseInt(e.target.value||`${new Date().getFullYear()}`))} />
        <button disabled={loading} className="btn-secondary" onClick={()=>call('/api/ai/tax/optimization',{ household_id: householdId || null, year })}>Tax Optimization</button>
      </div>
      <button disabled={loading} className="btn-secondary" onClick={()=>call('/api/ai/estate/plan',{ household_id: householdId || null, goals: [], facts: {} })}>Estate Plan Review</button>
      <button disabled={loading} className="btn-ghost" onClick={seed}>Seed 20 Demo Clients</button>
    </div>
  )
}

export default function Dashboard(){
  const [refreshKey, setRefreshKey] = useState(0)
  const forceRefresh = () => setRefreshKey(k => k+1)

  const households = useApiList('household', refreshKey)
  const clients = useApiList('client', refreshKey)
  const tasks = useApiList('task', refreshKey)
  const recos = useApiList('recommendation', refreshKey)
  const compliance = useApiList('compliance', refreshKey)

  const stats = useMemo(() => ([
    { label: 'Households', value: households.data.length },
    { label: 'Clients', value: clients.data.length },
    { label: 'Open Tasks', value: tasks.data.filter(t => t.status !== 'done').length },
    { label: 'Recommendations', value: recos.data.length },
  ]), [households.data, clients.data, tasks.data, recos.data])

  return (
    <div className="min-h-screen bg-gradient-to-br from-sky-50 via-indigo-50 to-emerald-50">
      <div className="max-w-7xl mx-auto p-4 sm:p-8 space-y-6">
        <header className="flex items-center justify-between">
          <div>
            <h1 className="text-2xl sm:text-3xl font-bold text-gray-900">AI-Driven Wealth CRM</h1>
            <p className="text-gray-600">Operate with an always-on compliance co-pilot and proactive AI recommendations.</p>
          </div>
          <a href="/test" className="btn-ghost">Health Check</a>
        </header>

        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
          {stats.map(s => <StatCard key={s.label} label={s.label} value={s.value} />)}
        </div>

        <Section title="Quick Create" actions={<AIActions onNewData={forceRefresh} households={households.data} />}>
          <div className="space-y-3">
            <CreateHousehold onCreated={forceRefresh} />
            <CreateClient onCreated={forceRefresh} households={households.data} />
            <CreateTask onCreated={forceRefresh} clients={clients.data} />
          </div>
        </Section>

        <Section title="Households">
          <SimpleTable
            items={households.data}
            columns=[
              { key: 'name', label: 'Name' },
              { key: 'risk_profile', label: 'Risk' },
              { key: 'members', label: 'Members', render: (v) => Array.isArray(v) ? v.length : 0 },
            ]
          />
        </Section>

        <Section title="Clients">
          <SimpleTable
            items={clients.data}
            columns=[
              { key: 'first_name', label: 'First' },
              { key: 'last_name', label: 'Last' },
              { key: 'email', label: 'Email' },
              { key: 'household_id', label: 'Household' },
            ]
          />
        </Section>

        <Section title="Tasks">
          <SimpleTable
            items={tasks.data}
            columns=[
              { key: 'title', label: 'Title' },
              { key: 'status', label: 'Status' },
              { key: 'priority', label: 'Priority' },
            ]
          />
        </Section>

        <Section title="Recommendations">
          <SimpleTable
            items={recos.data}
            columns=[
              { key: 'category', label: 'Category' },
              { key: 'title', label: 'Title' },
              { key: 'status', label: 'Status' },
              { key: 'impact_score', label: 'Impact' },
            ]
          />
        </Section>

        <Section title="Compliance Activity Log">
          <SimpleTable
            items={compliance.data}
            columns=[
              { key: 'timestamp', label: 'Time', render: (v) => v ? new Date(v).toLocaleString() : '' },
              { key: 'action', label: 'Action' },
              { key: 'resource_type', label: 'Resource' },
              { key: 'resource_id', label: 'ID' },
              { key: 'labels', label: 'Labels', render: (v) => Array.isArray(v) ? v.join(', ') : '' },
            ]
          />
        </Section>

        <footer className="text-center text-sm text-gray-500 py-8">Built with AI automation and compliance-first design.</footer>
      </div>
    </div>
  )
}

// Tailwind utility presets
export const styles = `
.input{ @apply w-full bg-white border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500; }
.btn-primary{ @apply inline-flex items-center justify-center px-4 py-2 rounded-lg bg-indigo-600 text-white text-sm font-medium hover:bg-indigo-700 transition; }
.btn-secondary{ @apply inline-flex items-center justify-center px-4 py-2 rounded-lg bg-slate-800 text-white text-sm font-medium hover:bg-slate-900 transition; }
.btn-ghost{ @apply inline-flex items-center justify-center px-3 py-2 rounded-lg border border-gray-300 text-gray-700 text-sm hover:bg-gray-50; }
`
