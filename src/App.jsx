import { useState, useEffect, useMemo, useCallback } from 'react'
import { supabase } from './supabaseClient.js'

const GENEROS = [
  'Amor y familia','Autoayuda','Biología','Ciencia','Dinero y finanzas',
  'Fantasía','Ficción','Filosofía','Física','Historia','Ingeniería',
  'Lectura','Literatura','Memorias','Negocios','Poesía','Política',
  'Productividad','Psicología','Realizamiento','Research','Romance',
  'Salud','Work-life balance','Mitologia', 'Policiaca' , 'Comedia' 
]
const MESES = ['Enero','Febrero','Marzo','Abril','Mayo','Junio','Julio','Agosto','Septiembre','Octubre','Noviembre','Diciembre']
const FORMATOS = ['Ebook','Papel']

const C = {
  bg:       '#033331',
  surface:  '#0d3d3b',
  border:   '#1a5a58',
  green:    '#05af6a',
  gold:     '#f8dfa9',
  cream:    '#f8f1e4',
  muted:    '#8aafac',
  K:        '#05af6a',
  P:        '#f8dfa9',
}

const GENRE_COLORS = {
  'Ficción':C.green,'Fantasía':'#60c090','Romance':'#ff9ab0',
  'Psicología':'#7ab4d4','Filosofía':'#c4b464','Negocios':'#9ad464',
  'Historia':'#d4a464','Salud':'#64d4b4','Poesía':'#d48ad4',
  'Ciencia':'#64b4d4','Física':'#d46464','Research':'#a0a0a0',
  'Política':'#e0a050','Biología':'#80d480','Literatura':'#b0a0d4',
}

const SEED_LEIDOS = [
  {titulo:'Circe',autor:'Madelline Miller',generos:['Lectura'],formato:'Papel',personaje:9,prosa:8,trama:8,aprendizaje:3,entretenimiento:8.5,total:7.3,mes_leido:'Enero',paginas:448,lector:'P'},
  {titulo:'Slow productivity',autor:'Cal Newport',generos:['Productividad'],formato:'Ebook',personaje:6,prosa:7,trama:6,aprendizaje:9,entretenimiento:5,total:6.6,mes_leido:'Enero',paginas:256,lector:'P'},
  {titulo:'The top 5 regrets of the dying',autor:'Bronnie Ware',generos:['Filosofía'],formato:'Ebook',personaje:8,prosa:9,trama:9,aprendizaje:10,entretenimiento:7,total:8.6,mes_leido:'Febrero',paginas:245,lector:'P'},
  {titulo:'Danzante del filo',autor:'Brandon Sanderson',generos:['Ficción','Fantasía'],formato:'Ebook',personaje:9,prosa:7,trama:10,aprendizaje:4,entretenimiento:10,total:8,mes_leido:'Enero',paginas:150,lector:'P'},
  {titulo:'Todos nuestros ayeres',autor:'Natalia Ginzburg',generos:['Literatura'],formato:'Ebook',personaje:6,prosa:4,trama:4,aprendizaje:2,entretenimiento:5,total:4.2,mes_leido:'Enero',paginas:150,lector:'P'},
]

const SEED_BIBLIOTECA = [
  {titulo:'Sin límites',autor:'Jim Kwik',generos:['Realizamiento']},
  {titulo:'Start with no',autor:'Jim Camp',generos:['Negocios']},
  {titulo:'Never eat alone',autor:'Keith Ferrazzi',generos:['Amor y familia']},
  {titulo:'The minimalist entrepeneur',autor:'Sahil Lavingia',generos:['Negocios']},
  {titulo:'La caída de Númenor',autor:'J.R.R.Tolkien',generos:['Ficción','Fantasía']},
  {titulo:'Atrévete a no gustar',autor:'Fumitake Koga',generos:['Autoayuda']},
  {titulo:'Predictably irrational',autor:'Dan Ariely',generos:['Psicología']},
  {titulo:'Anything you want',autor:'Derek Sivers',generos:['Negocios']},
  {titulo:'The 4-hour body',autor:'Tim Ferriss',generos:['Salud']},
  {titulo:'Miracle morning',autor:'Hal Elrod',generos:['Productividad']},
]

// ─── SUPABASE HOOK ───────────────────────────────────────────────────────────
function useTable(table, seedData) {
  const [rows, setRows] = useState([])
  const [loading, setLoading] = useState(true)
  const [seeded, setSeeded] = useState(false)

  // fetchAll: pages through ALL rows using the Supabase client with explicit range
  const fetchAll = useCallback(async () => {
    const PAGE = 500
    let all = [], from = 0
    while (true) {
      const { data, error } = await supabase
        .from(table)
        .select('*')
        .order('id', { ascending: true })
        .range(from, from + PAGE - 1)
        .limit(PAGE)
      if (error || !data || data.length === 0) break
      all = [...all, ...data]
      if (data.length < PAGE) break
      from += PAGE
    }
    return all
  }, [table])

  const load = useCallback(async () => {
    const data = await fetchAll()
    if (data.length === 0 && !seeded) {
      // Insert seed data on first load
      const { error: e2 } = await supabase.from(table).insert(seedData)
      if (!e2) {
        setSeeded(true)
        setRows(await fetchAll())
      }
    } else {
      setRows(data)
    }
    setLoading(false)
  }, [table, seeded, fetchAll])

  useEffect(() => { load() }, [load])

  // Realtime subscription
  useEffect(() => {
    const channel = supabase
      .channel(`changes-${table}`)
      .on('postgres_changes', { event: '*', schema: 'public', table }, () => load())
      .subscribe()
    return () => supabase.removeChannel(channel)
  }, [table, load])

  async function insert(item) {
    const { data, error } = await supabase.from(table).insert(item).select().single()
    if (!error) setRows(prev => [...prev, data])
    return { data, error }
  }

  async function update(id, updates) {
    const { data, error } = await supabase.from(table).update(updates).eq('id', id).select().single()
    if (!error) setRows(prev => prev.map(r => r.id === id ? data : r))
    return { data, error }
  }

  async function remove(id) {
    const { error } = await supabase.from(table).delete().eq('id', id)
    if (!error) setRows(prev => prev.filter(r => r.id !== id))
    return { error }
  }

  return { rows, loading, insert, update, remove, reload: load }
}
// ─── UI ATOMS ────────────────────────────────────────────────────────────────
const iS = { background:'rgba(0,0,0,0.3)', border:`1px solid ${C.border}`, borderRadius:6, padding:'8px 10px', color:C.cream, fontSize:13, fontFamily:'inherit', width:'100%', boxSizing:'border-box', outline:'none' }
const sS = { ...iS, cursor:'pointer' }

function Btn({ label, onClick, secondary, sm, danger, disabled }) {
  return (
    <button onClick={onClick} disabled={disabled}
      style={{ background:danger?'rgba(220,60,60,0.8)':secondary?'rgba(255,255,255,0.07)':C.green, color:danger?'#fff':secondary?C.cream:C.bg, border:secondary?`1px solid ${C.border}`:'none', padding:sm?'5px 12px':'8px 18px', borderRadius:6, cursor:disabled?'not-allowed':'pointer', fontWeight:700, fontSize:sm?11:13, fontFamily:'inherit', opacity:disabled?0.5:1, transition:'all 0.15s' }}>
      {label}
    </button>
  )
}

function IBtn({ icon, onClick, danger, sm }) {
  return (
    <button onClick={onClick}
      style={{ background:danger?'rgba(200,60,60,0.15)':'rgba(5,175,106,0.15)', border:'none', color:danger?'#f99':C.green, cursor:'pointer', padding:sm?'2px 6px':'4px 8px', borderRadius:4, fontSize:sm?10:12 }}>
      {icon}
    </button>
  )
}

function Stars({ value }) {
  return (
    <div style={{ display:'inline-flex', alignItems:'center', gap:6 }}>
      <div style={{ position:'relative', width:80, height:10 }}>
        <div style={{ position:'absolute', inset:0, background:'#1a4a48', borderRadius:3 }}/>
        <div style={{ position:'absolute', top:0, left:0, width:`${Math.min((value/10)*100,100)}%`, height:'100%', background:`linear-gradient(90deg,${C.green},#3dd890)`, borderRadius:3 }}/>
      </div>
      <span style={{ color:C.gold, fontSize:13, fontWeight:700 }}>{value}</span>
    </div>
  )
}

function GenreTags({ generos }) {
  if (!generos?.length) return null
  return (
    <div style={{ display:'flex', flexWrap:'wrap', gap:4 }}>
      {generos.map(g => (
        <span key={g} style={{ fontSize:10, padding:'2px 7px', borderRadius:10, border:`1px solid ${GENRE_COLORS[g]||C.border}55`, color:GENRE_COLORS[g]||C.muted, background:`${GENRE_COLORS[g]||'#1a5a58'}18` }}>{g}</span>
      ))}
    </div>
  )
}

function GenreMultiSelect({ value = [], onChange }) {
  return (
    <div style={{ display:'flex', flexWrap:'wrap', gap:5, marginTop:4 }}>
      {GENEROS.map(g => {
        const on = value.includes(g)
        return (
          <button key={g} type="button" onClick={() => onChange(on ? value.filter(x => x !== g) : [...value, g])}
            style={{ padding:'3px 10px', borderRadius:12, border:`1px solid ${on?C.green:C.border}`, background:on?`${C.green}33`:'transparent', color:on?C.green:C.muted, fontSize:11, cursor:'pointer' }}>
            {on ? '✓ ' : ''}{g}
          </button>
        )
      })}
    </div>
  )
}

function SH({ title, sub, action }) {
  return (
    <div style={{ display:'flex', justifyContent:'space-between', alignItems:'flex-end', marginBottom:18 }}>
      <div>
        <h2 style={{ margin:0, fontSize:19, color:C.gold }}>{title}</h2>
        {sub && <div style={{ fontSize:11, color:C.muted, marginTop:2 }}>{sub}</div>}
      </div>
      {action && <Btn label={action.label} onClick={action.fn} />}
    </div>
  )
}

function Empty({ msg }) {
  return <div style={{ textAlign:'center', padding:32, color:'#445', fontSize:13 }}>{msg}</div>
}

function Card({ title, children }) {
  return (
    <div style={{ background:C.surface, borderRadius:10, padding:16, marginBottom:14 }}>
      <h3 style={{ margin:'0 0 14px', fontSize:13, color:C.gold }}>{title}</h3>
      {children}
    </div>
  )
}

function FL({ label, children, wide }) {
  return (
    <div style={{ gridColumn:wide?'1 / -1':undefined, marginBottom:8 }}>
      <label style={{ display:'block', fontSize:10, color:C.muted, marginBottom:4 }}>{label}</label>
      {children}
    </div>
  )
}

function Modal({ title, children, onClose, wide }) {
  return (
    <div style={{ position:'fixed', inset:0, background:'rgba(0,0,0,0.8)', zIndex:999, display:'flex', alignItems:'center', justifyContent:'center', padding:16 }}>
      <div style={{ background:C.surface, borderRadius:14, padding:22, width:'100%', maxWidth:wide?580:440, maxHeight:'92vh', overflowY:'auto', border:`1px solid ${C.border}` }}>
        <div style={{ display:'flex', justifyContent:'space-between', alignItems:'center', marginBottom:18 }}>
          <h2 style={{ margin:0, fontSize:16, color:C.gold }}>{title}</h2>
          <button onClick={onClose} style={{ background:'none', border:'none', color:C.cream, cursor:'pointer', fontSize:18 }}>✕</button>
        </div>
        {children}
      </div>
    </div>
  )
}

function Spinner() {
  return (
    <div style={{ display:'flex', alignItems:'center', justifyContent:'center', padding:40 }}>
      <div style={{ width:32, height:32, border:`3px solid ${C.border}`, borderTop:`3px solid ${C.green}`, borderRadius:'50%', animation:'spin 0.8s linear infinite' }}/>
      <style>{`@keyframes spin{to{transform:rotate(360deg)}}`}</style>
    </div>
  )
}

// ─── PAGES ───────────────────────────────────────────────────────────────────

function BibliotecaPage({ bib, leidos }) {
  const [search, setSearch] = useState('')
  const [fg, setFg] = useState('')
  const [filterRec, setFilterRec] = useState('')
  const [showForm, setShowForm] = useState(false)
  const [editItem, setEditItem] = useState(null)

  const leidosSet = useMemo(() => new Set(leidos.rows.map(l => l.titulo?.toLowerCase().trim())), [leidos.rows])

  const filtered = useMemo(() => bib.rows.filter(b => {
    const ms = !search || b.titulo?.toLowerCase().includes(search.toLowerCase()) || b.autor?.toLowerCase().includes(search.toLowerCase())
    const mg = !fg || b.generos?.includes(fg)
    const mr = !filterRec || (b.recomendado_por && b.recomendado_por.includes(filterRec))
    return ms && mg && mr
  }), [bib.rows, search, fg, filterRec])

  async function handleSave(form) {
    if (form.id) { const { id, ...u } = form; await bib.update(id, u) }
    else await bib.insert(form)
    setShowForm(false); setEditItem(null)
  }

  async function handleDelete(id) {
    if (window.confirm('¿Eliminar este libro?')) await bib.remove(id)
  }

  return (
    <div>
      <SH title="Biblioteca Conjunta" sub={`${bib.rows.length} libros · ${leidos.rows.length} leídos`} action={{ label:'+ Añadir libro', fn:() => setShowForm(true) }}/>
      <div style={{ display:'flex', gap:8, marginBottom:14, flexWrap:'wrap' }}>
        <input value={search} onChange={e => setSearch(e.target.value)} placeholder="Buscar título o autor..." style={{ ...iS, width:200 }}/>
        <select value={fg} onChange={e => setFg(e.target.value)} style={{ ...sS, width:190 }}>
          <option value="">Todos los géneros</option>
          {GENEROS.map(g => <option key={g}>{g}</option>)}
        </select>
        <select value={filterRec} onChange={e => setFilterRec(e.target.value)} style={{ ...sS, width:190 }}>
          <option value="">💌 Todas recomendaciones</option>
          <option value="K">💌 Rec. por Kiara</option>
          <option value="P">💌 Rec. por Pablo</option>
        </select>
        {(search||fg||filterRec) && <Btn label="✕ Limpiar" onClick={() => { setSearch(''); setFg(''); setFilterRec('') }} secondary sm/>}
      </div>
      {bib.loading ? <Spinner /> : (
        <div style={{ overflowX:'auto' }}>
          <table style={{ width:'100%', borderCollapse:'collapse', fontSize:12 }}>
            <thead>
              <tr style={{ background:C.surface }}>
                {['#','Título','Autor','Géneros','Estado',''].map(h => (
                  <th key={h} style={{ padding:'9px 10px', textAlign:'left', color:C.gold, fontWeight:700, borderBottom:`1px solid ${C.border}` }}>{h}</th>
                ))}
              </tr>
            </thead>
            <tbody>
              {filtered.map((b, i) => {
                const yl = leidosSet.has(b.titulo?.toLowerCase().trim())
                const recs = b.recomendado_por || []
                return (
                  <tr key={b.id} style={{ background:i%2===0?'rgba(255,255,255,0.025)':'transparent', borderBottom:'1px solid rgba(255,255,255,0.04)' }}>
                    <td style={{ padding:'8px 10px', color:C.muted, fontSize:11 }}>{i+1}</td>
                    <td style={{ padding:'8px 10px', color:yl?C.green:C.cream, fontWeight:yl?600:400 }}>
                      {yl && <span style={{ marginRight:5, fontSize:10 }}>✓</span>}{b.titulo}
                      {recs.length > 0 && (
                        <div style={{ display:'flex', gap:4, marginTop:3, flexWrap:'wrap' }}>
                          {recs.includes('K') && <span style={{ fontSize:9, padding:'1px 6px', borderRadius:8, background:`${C.K}22`, color:C.K, border:`1px solid ${C.K}44` }}>💌 Kiara</span>}
                          {recs.includes('P') && <span style={{ fontSize:9, padding:'1px 6px', borderRadius:8, background:`${C.P}22`, color:C.P, border:`1px solid ${C.P}44` }}>💌 Pablo</span>}
                        </div>
                      )}
                    </td>
                    <td style={{ padding:'8px 10px', color:'#aad4d0', fontSize:11 }}>{b.autor}</td>
                    <td style={{ padding:'8px 10px' }}><GenreTags generos={b.generos}/></td>
                    <td style={{ padding:'8px 10px' }}>
                      {yl ? <span style={{ color:C.green, fontSize:10, fontWeight:700 }}>LEÍDO</span> : <span style={{ color:'#445', fontSize:10 }}>pendiente</span>}
                    </td>
                    <td style={{ padding:'8px 10px' }}>
                      <div style={{ display:'flex', gap:4 }}>
                        <IBtn icon="✏" onClick={() => setEditItem(b)}/>
                        <IBtn icon="✕" onClick={() => handleDelete(b.id)} danger/>
                      </div>
                    </td>
                  </tr>
                )
              })}
            </tbody>
          </table>
          {!filtered.length && <Empty msg="Sin resultados"/>}
        </div>
      )}
      {(showForm || editItem) && (
        <BibFormModal book={editItem} onSave={handleSave} onClose={() => { setShowForm(false); setEditItem(null) }}/>
      )}
    </div>
  )
}

function LeidosPage({ leidos, bib }) {
  const [lector, setLector] = useState('Todos')
  const [fg, setFg] = useState('')
  const [mes, setMes] = useState('')
  const [search, setSearch] = useState('')
  const [showForm, setShowForm] = useState(false)
  const [editItem, setEditItem] = useState(null)

  const filtered = useMemo(() => leidos.rows.filter(b => {
    const ml = lector === 'Todos' || b.lector === lector
    const mg = !fg || b.generos?.includes(fg)
    const mm = !mes || b.mes_leido === mes
    const ms = !search || b.titulo?.toLowerCase().includes(search.toLowerCase()) || b.autor?.toLowerCase().includes(search.toLowerCase())
    return ml && mg && mm && ms
  }), [leidos.rows, lector, fg, mes, search])

  async function handleSave(form) {
    const dup = leidos.rows.some(b => b.id !== form.id && b.titulo?.toLowerCase().trim() === form.titulo?.toLowerCase().trim() && b.lector === form.lector)
    if (dup) { alert('⚠️ Este libro ya está registrado para este lector.'); return }
    if (form.id) { const { id, ...u } = form; await leidos.update(id, u) }
    else await leidos.insert(form)
    setShowForm(false); setEditItem(null)
  }

  async function handleDelete(id) {
    if (window.confirm('¿Eliminar este libro leído?')) await leidos.remove(id)
  }

  const kC = leidos.rows.filter(b => b.lector === 'K').length
  const pC = leidos.rows.filter(b => b.lector === 'P').length

  return (
    <div>
      <SH title="Libros Leídos" sub={`${leidos.rows.length} total · 👩 K: ${kC} · 👨 P: ${pC}`} action={{ label:'+ Añadir leído', fn:() => setShowForm(true) }}/>
      <div style={{ display:'flex', gap:8, marginBottom:16, flexWrap:'wrap' }}>
        {['Todos','K','P'].map(l => (
          <button key={l} onClick={() => setLector(l)}
            style={{ padding:'6px 14px', borderRadius:20, border:`1px solid ${lector===l?(l==='K'?C.K:l==='P'?C.P:C.green):C.border}`, background:lector===l?(l==='K'?`${C.K}22`:l==='P'?`${C.P}22`:`${C.green}22`):'transparent', color:lector===l?(l==='K'?C.K:l==='P'?C.P:C.green):C.muted, fontSize:12, cursor:'pointer' }}>
            {l==='Todos'?'👥 Todos':l==='K'?'👩 Kiara':'👨 Pablo'}
          </button>
        ))}
        <select value={fg} onChange={e => setFg(e.target.value)} style={{ ...sS, width:180 }}>
          <option value="">Todos géneros</option>
          {GENEROS.map(g => <option key={g}>{g}</option>)}
        </select>
        <select value={mes} onChange={e => setMes(e.target.value)} style={{ ...sS, width:160 }}>
          <option value="">Todos los meses</option>
          {MESES.map(m => <option key={m}>{m}</option>)}
        </select>
        <input value={search} onChange={e => setSearch(e.target.value)} placeholder="Buscar..." style={{ ...iS, width:140 }}/>
      </div>
      {leidos.loading ? <Spinner /> : (
        <div style={{ display:'grid', gridTemplateColumns:'repeat(auto-fill,minmax(290px,1fr))', gap:12 }}>
          {filtered.map(b => <LeidoCard key={b.id} book={b} onEdit={() => setEditItem(b)} onDelete={() => handleDelete(b.id)}/>)}
        </div>
      )}
      {!leidos.loading && !filtered.length && <Empty msg="Nada aquí todavía"/>}
      {(showForm || editItem) && (
        <LeidoFormModal book={editItem} bib={bib.rows} onSave={handleSave} onClose={() => { setShowForm(false); setEditItem(null) }}/>
      )}
    </div>
  )
}

function LeidoCard({ book, onEdit, onDelete }) {
  const bc = book.lector === 'K' ? C.K : C.P
  return (
    <div style={{ background:C.surface, borderRadius:10, padding:14, borderLeft:`3px solid ${bc}` }}>
      <div style={{ display:'flex', justifyContent:'space-between', alignItems:'flex-start', marginBottom:8 }}>
        <div style={{ flex:1, minWidth:0 }}>
          <div style={{ fontSize:14, fontWeight:700, color:C.gold, marginBottom:2, overflow:'hidden', textOverflow:'ellipsis', whiteSpace:'nowrap' }}>{book.titulo}</div>
          <div style={{ fontSize:11, color:'#aad4d0' }}>{book.autor}</div>
        </div>
        <div style={{ display:'flex', flexDirection:'column', alignItems:'center', gap:4, marginLeft:8, flexShrink:0 }}>
          <div style={{ width:28, height:28, borderRadius:'50%', background:bc, color:C.bg, display:'flex', alignItems:'center', justifyContent:'center', fontWeight:900, fontSize:12 }}>{book.lector}</div>
          <div style={{ display:'flex', gap:3 }}>
            <IBtn icon="✏" onClick={onEdit} sm/>
            <IBtn icon="✕" onClick={onDelete} danger sm/>
          </div>
        </div>
      </div>
      <div style={{ display:'flex', gap:6, flexWrap:'wrap', marginBottom:8 }}>
        <GenreTags generos={book.generos}/>
        <span style={{ fontSize:10, background:'rgba(255,255,255,0.08)', padding:'2px 7px', borderRadius:10 }}>{book.formato}</span>
        {book.mes_leido && <span style={{ fontSize:10, background:`${C.green}22`, padding:'2px 7px', borderRadius:10, color:C.green }}>{book.mes_leido}</span>}
      </div>
      {book.total > 0 && (
        <div>
          <Stars value={book.total}/>
          <div style={{ display:'grid', gridTemplateColumns:'1fr 1fr', gap:3, marginTop:6 }}>
            {[['Personaje',book.personaje],['Prosa',book.prosa],['Trama',book.trama],['Aprendizaje',book.aprendizaje],['Entretenimiento',book.entretenimiento]].map(([k,v]) => v > 0 && (
              <div key={k} style={{ fontSize:10, color:C.muted }}>{k}: <span style={{ color:C.cream }}>{v}</span></div>
            ))}
          </div>
        </div>
      )}
    </div>
  )
}

function EstadisticasPage({ leidos }) {
  const rows = leidos.rows
  const kB = rows.filter(b => b.lector === 'K')
  const pB = rows.filter(b => b.lector === 'P')
  const byMonth = useMemo(() => {
    const m = {}
    MESES.forEach(x => { m[x] = { K:0, P:0 } })
    rows.forEach(b => { if (b.mes_leido && m[b.mes_leido]) m[b.mes_leido][b.lector] = (m[b.mes_leido][b.lector]||0) + 1 })
    return MESES.map(x => ({ mes:x.slice(0,3), ...m[x] })).filter(x => x.K || x.P)
  }, [rows])
  const ranking = useMemo(() => rows.filter(b => b.total > 0).sort((a,b) => b.total - a.total).slice(0,10), [rows])
  const scored = rows.filter(b => b.total > 0)
  const avgV = scored.length ? (scored.reduce((s,b) => s + b.total, 0) / scored.length).toFixed(1) : '-'
  function topA(books) {
    const m = {}
    books.forEach(b => { if (b.autor) m[b.autor] = (m[b.autor]||0) + 1 })
    return Object.entries(m).sort((a,b) => b[1]-a[1]).slice(0,6).map(([name,count]) => ({ name, count }))
  }
  if (leidos.loading) return <Spinner/>
  return (
    <div>
      <SH title="Estadísticas" sub="Tu año en libros"/>
      <div style={{ display:'grid', gridTemplateColumns:'repeat(4,1fr)', gap:10, marginBottom:20 }}>
        {[['📚','Total',rows.length,null],['👩','Kiara',kB.length,C.K],['👨','Pablo',pB.length,C.P],['⭐','Nota media',avgV,C.green]].map(([icon,label,value,color]) => (
          <div key={label} style={{ background:C.surface, borderRadius:10, padding:'14px 10px', textAlign:'center', borderBottom:`2px solid ${color||C.border}` }}>
            <div style={{ fontSize:18 }}>{icon}</div>
            <div style={{ fontSize:22, fontWeight:900, color:color||C.gold, margin:'4px 0 2px' }}>{value}</div>
            <div style={{ fontSize:10, color:C.muted }}>{label}</div>
          </div>
        ))}
      </div>
      <div style={{ display:'grid', gridTemplateColumns:'1fr 1fr', gap:14, marginBottom:14 }}>
        <Card title="📖 Autores más leídos — Kiara">
          {topA(kB).length ? topA(kB).map(d => <BarRow key={d.name} d={d} max={Math.max(...topA(kB).map(x=>x.count),1)} color={C.K}/>) : <Empty msg="Sin datos"/>}
        </Card>
        <Card title="📖 Autores más leídos — Pablo">
          {topA(pB).length ? topA(pB).map(d => <BarRow key={d.name} d={d} max={Math.max(...topA(pB).map(x=>x.count),1)} color={C.P}/>) : <Empty msg="Sin datos"/>}
        </Card>
      </div>
      {byMonth.length > 0 && (
        <Card title="📅 Libros leídos por mes">
          <div style={{ display:'flex', alignItems:'flex-end', gap:8, height:150, overflowX:'auto' }}>
            {byMonth.map(d => {
              const max = Math.max(...byMonth.flatMap(x => [x.K,x.P]), 1)
              return (
                <div key={d.mes} style={{ display:'flex', flexDirection:'column', alignItems:'center', minWidth:38 }}>
                  <div style={{ display:'flex', alignItems:'flex-end', gap:3, height:120 }}>
                    <div style={{ width:13, height:`${(d.K/max)*120}px`, background:C.K, borderRadius:'3px 3px 0 0', position:'relative' }}>
                      {d.K > 0 && <span style={{ position:'absolute', top:-13, left:'50%', transform:'translateX(-50%)', fontSize:9, color:C.K }}>{d.K}</span>}
                    </div>
                    <div style={{ width:13, height:`${(d.P/max)*120}px`, background:C.P, borderRadius:'3px 3px 0 0', position:'relative' }}>
                      {d.P > 0 && <span style={{ position:'absolute', top:-13, left:'50%', transform:'translateX(-50%)', fontSize:9, color:C.P }}>{d.P}</span>}
                    </div>
                  </div>
                  <div style={{ fontSize:9, color:C.muted, marginTop:4 }}>{d.mes}</div>
                </div>
              )
            })}
          </div>
          <div style={{ display:'flex', gap:14, justifyContent:'flex-end', marginTop:8 }}>
            <span style={{ fontSize:11, color:C.K }}>■ Kiara</span>
            <span style={{ fontSize:11, color:C.P }}>■ Pablo</span>
          </div>
        </Card>
      )}
      <Card title="🏆 Ranking por nota">
        {ranking.map((b,i) => (
          <div key={b.id} style={{ display:'flex', alignItems:'center', gap:10, padding:'8px 0', borderBottom:'1px solid rgba(255,255,255,0.06)' }}>
            <div style={{ width:26, height:26, borderRadius:'50%', background:i<3?C.green:'#1a4a48', color:i<3?C.bg:C.cream, display:'flex', alignItems:'center', justifyContent:'center', fontWeight:900, fontSize:11, flexShrink:0 }}>{i+1}</div>
            <div style={{ flex:1, minWidth:0 }}>
              <div style={{ fontSize:12, color:C.gold, overflow:'hidden', textOverflow:'ellipsis', whiteSpace:'nowrap' }}>{b.titulo}</div>
              <div style={{ fontSize:10, color:C.muted }}>{b.autor} · <span style={{ color:b.lector==='K'?C.K:C.P }}>{b.lector==='K'?'Kiara':'Pablo'}</span></div>
            </div>
            <Stars value={b.total}/>
          </div>
        ))}
        {!ranking.length && <Empty msg="Sin libros puntuados aún"/>}
      </Card>
    </div>
  )
}

function BarRow({ d, max, color }) {
  return (
    <div style={{ marginBottom:8 }}>
      <div style={{ display:'flex', justifyContent:'space-between', fontSize:11, marginBottom:2 }}>
        <span style={{ overflow:'hidden', textOverflow:'ellipsis', whiteSpace:'nowrap', maxWidth:'80%', color:C.cream }}>{d.name}</span>
        <span style={{ color }}>{d.count}</span>
      </div>
      <div style={{ background:'#1a3a38', borderRadius:3, height:7 }}>
        <div style={{ width:`${(d.count/max)*100}%`, height:'100%', background:color, borderRadius:3 }}/>
      </div>
    </div>
  )
}

function AleatorioPage({ bib, leidos, listaK, listaP }) {
  const [rec, setRec] = useState(null)
  const [spinning, setSpinning] = useState(false)
  const [fg, setFg] = useState('')
  const [autor, setAutor] = useState('')
  const [filterRec, setFilterRec] = useState('')
  const [peso, setPeso] = useState(50)
  const [quien, setQuien] = useState('ambos') // 'K', 'P', 'ambos'

  const leidosSet = useMemo(() => new Set(leidos.rows.map(l => l.titulo?.toLowerCase().trim())), [leidos.rows])
  const autores = useMemo(() => [...new Set(bib.rows.map(b => b.autor).filter(Boolean))].sort(), [bib.rows])

  const pool = useMemo(() => bib.rows.filter(b => {
    const nl = !leidosSet.has(b.titulo?.toLowerCase().trim())
    const mg = !fg || b.generos?.includes(fg)
    const ma = !autor || b.autor === autor
    const mr = !filterRec || (b.recomendado_por && b.recomendado_por.includes(filterRec))
    return nl && mg && ma && mr
  }), [bib.rows, leidosSet, fg, autor, filterRec])

  // Weighted pick using list position
  function weightedPick(books) {
    if (!books.length) return null
    if (peso === 0) return books[Math.floor(Math.random() * books.length)]
    const listaUsar = quien === 'K' ? [listaK] : quien === 'P' ? [listaP] : [listaK, listaP]
    const weighted = books.map(b => {
      let bestScore = 0
      listaUsar.forEach(lista => {
        const pos = lista.indexOf(b.id)
        if (pos !== -1) {
          const score = 1 - (pos / Math.max(lista.length, 1))
          bestScore = Math.max(bestScore, score)
        }
      })
      // blend: peso=0 → all equal (w=1), peso=100 → fully position-driven
      const w = 1 + bestScore * 3 * (peso / 100)
      return { book: b, w }
    })
    const total = weighted.reduce((s, x) => s + x.w, 0)
    let r = Math.random() * total
    for (const { book, w } of weighted) { r -= w; if (r <= 0) return book }
    return weighted[weighted.length - 1].book
  }

  function spin() {
    if (!pool.length) return
    setSpinning(true); setRec(null)
    setTimeout(() => { setRec(weightedPick(pool)); setSpinning(false) }, 700)
  }

  const pesoLabel = peso === 0 ? 'Todos los libros tienen la misma probabilidad.'
    : peso < 40 ? 'La lista influye poco, aún bastante aleatorio.'
    : peso < 70 ? 'Equilibrio: los primeros de la lista salen más, pero hay sorpresas.'
    : 'Los primeros de la lista tienen mucho más peso. Los últimos casi no salen.'

  const listaActiva = quien === 'K' ? listaK : quien === 'P' ? listaP : [...new Set([...listaK, ...listaP])]
  const getPosLabel = (b) => {
    const parts = []
    if (listaK.indexOf(b.id) !== -1) parts.push(`#${listaK.indexOf(b.id)+1} lista K`)
    if (listaP.indexOf(b.id) !== -1) parts.push(`#${listaP.indexOf(b.id)+1} lista P`)
    return parts.join(' · ')
  }

  return (
    <div>
      <SH title="Libro Aleatorio" sub="Déjate sorprender"/>

      {/* QUIEN SOY */}
      <div style={{ display:'flex', gap:8, marginBottom:14, alignItems:'center' }}>
        <span style={{ fontSize:12, color:C.muted }}>¿Quién eres?</span>
        {[['K','👩 Kiara',C.K],['P','👨 Pablo',C.P],['ambos','👥 Ambos','#8cc']].map(([v,lbl,col]) => (
          <button key={v} onClick={() => setQuien(v)}
            style={{ padding:'6px 16px', borderRadius:20, border:`1px solid ${quien===v?col:C.border}`, background:quien===v?`${col}22`:'transparent', color:quien===v?col:C.muted, fontSize:12, cursor:'pointer' }}>
            {lbl}
          </button>
        ))}
      </div>

      <div style={{ display:'flex', gap:8, marginBottom:12, flexWrap:'wrap' }}>
        <select value={fg} onChange={e => setFg(e.target.value)} style={{ ...sS, width:190 }}>
          <option value="">Cualquier género</option>
          {GENEROS.map(g => <option key={g}>{g}</option>)}
        </select>
        <select value={autor} onChange={e => setAutor(e.target.value)} style={{ ...sS, width:190 }}>
          <option value="">Cualquier autor</option>
          {autores.map(a => <option key={a}>{a}</option>)}
        </select>
        <select value={filterRec} onChange={e => setFilterRec(e.target.value)} style={{ ...sS, width:190 }}>
          <option value="">💌 Todas recomendaciones</option>
          <option value="K">💌 Rec. por Kiara</option>
          <option value="P">💌 Rec. por Pablo</option>
        </select>
        <span style={{ color:C.muted, fontSize:11, alignSelf:'center' }}>{pool.length} disponibles</span>
      </div>

      {/* SLIDER PESO */}
      <div style={{ background:C.surface, borderRadius:10, padding:'14px 16px', marginBottom:20, border:`1px solid ${C.border}` }}>
        <div style={{ display:'flex', justifyContent:'space-between', alignItems:'center', marginBottom:8 }}>
          <span style={{ fontSize:12, color:C.gold, fontWeight:700 }}>⚖️ Peso de la lista de prioridad</span>
          <span style={{ fontSize:14, color:C.green, fontWeight:900 }}>{peso}%</span>
        </div>
        <input type="range" min={0} max={100} step={10} value={peso} onChange={e => setPeso(Number(e.target.value))}
          style={{ width:'100%', accentColor:C.green }}/>
        <div style={{ display:'flex', justifyContent:'space-between', fontSize:10, color:'#556', marginTop:4 }}>
          <span>🎲 100% aleatorio</span>
          <span>📋 Lista manda</span>
        </div>
        <div style={{ fontSize:10, color:'#778', marginTop:6 }}>{pesoLabel}
          {listaActiva.length === 0 && ' · ⚠️ La lista está vacía, ve a 📋 Lista para ordenar.'}
        </div>
      </div>

      <div style={{ textAlign:'center', marginBottom:28 }}>
        <button onClick={spin} disabled={!pool.length || spinning}
          style={{ background:pool.length?C.green:'#1a4a48', color:C.bg, border:'none', padding:'16px 52px', borderRadius:30, fontSize:15, fontWeight:900, cursor:pool.length?'pointer':'not-allowed', fontFamily:'inherit', letterSpacing:2, opacity:pool.length?1:0.5 }}>
          {spinning ? '🎲 ...' : '🎲  ¡Recomiéndame uno!'}
        </button>
      </div>
      {rec && !spinning && (
        <div style={{ background:C.surface, borderRadius:14, padding:24, maxWidth:440, margin:'0 auto', textAlign:'center', border:`2px solid ${C.green}` }}>
          <div style={{ fontSize:40, marginBottom:10 }}>📖</div>
          <div style={{ fontSize:20, fontWeight:900, color:C.gold, marginBottom:6 }}>{rec.titulo}</div>
          <div style={{ fontSize:13, color:'#aad4d0', marginBottom:12 }}>{rec.autor}</div>
          <GenreTags generos={rec.generos}/>
          {getPosLabel(rec) && <div style={{ fontSize:11, color:C.green, marginTop:8, fontWeight:600 }}>📋 {getPosLabel(rec)}</div>}
          {(rec.recomendado_por||[]).includes('K') && <div style={{ fontSize:11, color:C.K, marginTop:6 }}>💌 Kiara lo recomienda</div>}
          {(rec.recomendado_por||[]).includes('P') && <div style={{ fontSize:11, color:C.P, marginTop:4 }}>💌 Pablo lo recomienda</div>}
          {rec.paginas && <div style={{ fontSize:11, color:C.muted, marginTop:10 }}>{rec.paginas} páginas</div>}
        </div>
      )}
      {!pool.length && <div style={{ textAlign:'center', color:C.muted, padding:24 }}>🎉 ¡No quedan libros con esos filtros!</div>}
    </div>
  )
}

function ComprarPage({ leidos }) {
  const list = useMemo(() => leidos.rows.filter(b => b.formato === 'Ebook' && b.total >= 7).sort((a,b) => b.total - a.total), [leidos.rows])
  return (
    <div>
      <SH title="Lista de Compra" sub="Ebooks leídos con nota ≥ 7 → candidatos a comprar en papel"/>
      {leidos.loading ? <Spinner/> : !list.length ? <Empty msg="Ningún ebook supera el 7 aún"/> : (
        <div style={{ display:'grid', gridTemplateColumns:'repeat(auto-fill,minmax(270px,1fr))', gap:12 }}>
          {list.map(b => (
            <div key={b.id} style={{ background:C.surface, borderRadius:10, padding:14, border:`1px solid ${C.gold}22` }}>
              <div style={{ display:'flex', justifyContent:'space-between', alignItems:'flex-start' }}>
                <div style={{ flex:1, minWidth:0 }}>
                  <div style={{ fontSize:13, fontWeight:700, color:C.gold, marginBottom:3, overflow:'hidden', textOverflow:'ellipsis', whiteSpace:'nowrap' }}>{b.titulo}</div>
                  <div style={{ fontSize:11, color:'#aad4d0', marginBottom:8 }}>{b.autor}</div>
                  <GenreTags generos={b.generos}/>
                </div>
                <div style={{ textAlign:'center', marginLeft:10, flexShrink:0 }}>
                  <div style={{ fontSize:24, fontWeight:900, color:C.green }}>{b.total}</div>
                  <div style={{ fontSize:9, color:C.muted }}>/10</div>
                </div>
              </div>
              <div style={{ marginTop:10 }}><Stars value={b.total}/></div>
              <div style={{ fontSize:10, color:b.lector==='K'?C.K:C.P, marginTop:6 }}>{b.lector==='K'?'👩 Kiara':'👨 Pablo'}</div>
            </div>
          ))}
        </div>
      )}
    </div>
  )
}

// ─── FORMS ───────────────────────────────────────────────────────────────────
// Clean numeric fields: convert empty string to null, strings to numbers
function cleanInts(form, fields) {
  const out = { ...form }
  fields.forEach(f => {
    if (out[f] === '' || out[f] === undefined) out[f] = null
    else if (out[f] !== null) out[f] = Number(out[f])
  })
  return out
}
function BibFormModal({ book, onSave, onClose }) {
  const [form, setForm] = useState(book ? { ...book, generos:book.generos||[], recomendado_por:book.recomendado_por||[] } : { titulo:'', autor:'', generos:[], paginas:'', recomendado_por:[] })
  const set = (k,v) => setForm(f => ({ ...f, [k]:v }))
  const toggleRec = (who) => {
    const cur = form.recomendado_por || []
    set('recomendado_por', cur.includes(who) ? cur.filter(x => x !== who) : [...cur, who])
  }
  return (
    <Modal title={book ? 'Editar libro' : 'Añadir a biblioteca'} onClose={onClose} wide>
      <div style={{ display:'grid', gridTemplateColumns:'1fr 1fr', gap:10, marginBottom:10 }}>
        <FL label="Título *" wide><input value={form.titulo} onChange={e => set('titulo', e.target.value)} style={iS} autoFocus/></FL>
        <FL label="Autor"><input value={form.autor||''} onChange={e => set('autor', e.target.value)} style={iS}/></FL>
        <FL label="Páginas"><input type="number" value={form.paginas||''} onChange={e => set('paginas', e.target.value)} style={iS}/></FL>
      </div>
      <FL label="Géneros (puedes elegir varios)">
        <GenreMultiSelect value={form.generos||[]} onChange={v => set('generos', v)}/>
      </FL>
      <div style={{ background:'rgba(0,0,0,0.2)', borderRadius:8, padding:12, marginTop:14 }}>
        <div style={{ fontSize:11, color:C.gold, fontWeight:700, marginBottom:10 }}>💌 Recomendado por</div>
        <div style={{ display:'flex', gap:8 }}>
          {[['K','👩 Kiara',C.K],['P','👨 Pablo',C.P]].map(([who,lbl,col]) => {
            const on = (form.recomendado_por||[]).includes(who)
            return (
              <button key={who} type="button" onClick={() => toggleRec(who)}
                style={{ padding:'6px 18px', borderRadius:12, border:`1px solid ${on?col:C.border}`, background:on?`${col}22`:'transparent', color:on?col:C.muted, fontSize:13, cursor:'pointer' }}>
                {on ? '✓ ' : ''}{lbl}
              </button>
            )
          })}
        </div>
        <div style={{ fontSize:10, color:'#556', marginTop:6 }}>Marca quién recomienda este libro al otro</div>
      </div>
      <div style={{ display:'flex', gap:8, justifyContent:'flex-end', marginTop:16 }}>
        <Btn label="Cancelar" onClick={onClose} secondary/>
        <Btn label="Guardar" onClick={() => { if (!form.titulo) return alert('Título obligatorio'); onSave(cleanInts(form, ['paginas'])) }}/>
      </div>
    </Modal>
  )
}

function LeidoFormModal({ book, bib, onSave, onClose }) {
  const empty = { titulo:'', autor:'', generos:[], formato:'Ebook', lector:'K', mes_leido:'Enero', paginas:'', personaje:0, prosa:0, trama:0, aprendizaje:0, entretenimiento:0, total:0 }
  const [form, setForm] = useState(book ? { ...empty, ...book, generos:book.generos||[] } : empty)
  const set = (k,v) => setForm(f => ({ ...f, [k]:v }))
  const calcT = () => {
    const v = [form.personaje,form.prosa,form.trama,form.aprendizaje,form.entretenimiento].map(Number).filter(x => x > 0)
    return v.length ? parseFloat((v.reduce((a,b) => a+b, 0) / v.length).toFixed(1)) : 0
  }
  function autofill(val) {
    set('titulo', val)
    const f = bib.find(b => b.titulo?.toLowerCase() === val.toLowerCase())
    if (f) setForm(p => ({ ...p, titulo:f.titulo, autor:f.autor||p.autor, generos:f.generos||p.generos, paginas:f.paginas||p.paginas }))
  }
  return (
    <Modal title={book ? 'Editar lectura' : 'Registrar lectura'} onClose={onClose} wide>
      <div style={{ display:'grid', gridTemplateColumns:'1fr 1fr', gap:10, marginBottom:10 }}>
        <FL label="Título * (autocompleta de biblioteca)" wide>
          <input list="btitles" value={form.titulo} onChange={e => autofill(e.target.value)} style={iS} placeholder="Escribe o elige..." autoFocus/>
          <datalist id="btitles">{bib.map(b => <option key={b.id} value={b.titulo}/>)}</datalist>
        </FL>
        <FL label="Autor"><input value={form.autor||''} onChange={e => set('autor', e.target.value)} style={iS}/></FL>
        <FL label="Lector">
          <select value={form.lector} onChange={e => set('lector', e.target.value)} style={sS}>
            <option value="K">👩 Kiara</option>
            <option value="P">👨 Pablo</option>
          </select>
        </FL>
        <FL label="Formato">
          <select value={form.formato} onChange={e => set('formato', e.target.value)} style={sS}>
            {FORMATOS.map(f => <option key={f}>{f}</option>)}
          </select>
        </FL>
        <FL label="Mes leído">
          <select value={form.mes_leido} onChange={e => set('mes_leido', e.target.value)} style={sS}>
            {MESES.map(m => <option key={m}>{m}</option>)}
          </select>
        </FL>
        <FL label="Páginas"><input type="number" value={form.paginas||''} onChange={e => set('paginas', e.target.value)} style={iS}/></FL>
      </div>
      <FL label="Géneros (puedes elegir varios)">
        <GenreMultiSelect value={form.generos||[]} onChange={v => set('generos', v)}/>
      </FL>
      <div style={{ background:'rgba(0,0,0,0.25)', borderRadius:8, padding:12, marginTop:12 }}>
        <div style={{ fontSize:12, color:C.gold, marginBottom:10, fontWeight:700 }}>Puntuación (0 – 10)</div>
        <div style={{ display:'grid', gridTemplateColumns:'1fr 1fr', gap:10 }}>
          {[['personaje','👤 Personaje'],['prosa','✍️ Prosa'],['trama','📖 Trama'],['aprendizaje','🧠 Aprendizaje'],['entretenimiento','🎭 Entretenimiento']].map(([k,label]) => (
            <div key={k}>
              <div style={{ fontSize:11, color:C.muted, marginBottom:3 }}>{label}: <span style={{ color:C.gold, fontWeight:700 }}>{form[k]}</span></div>
              <input type="range" min={0} max={10} step={0.5} value={form[k]} onChange={e => set(k, parseFloat(e.target.value))} style={{ width:'100%', accentColor:C.green }}/>
            </div>
          ))}
        </div>
        <div style={{ marginTop:12, fontSize:15, color:C.green, fontWeight:900 }}>Media calculada: {calcT()} / 10</div>
      </div>
      <div style={{ display:'flex', gap:8, justifyContent:'flex-end', marginTop:14 }}>
        <Btn label="Cancelar" onClick={onClose} secondary/>
        <Btn label="Guardar" onClick={() => { if (!form.titulo) return alert('Título obligatorio'); onSave(cleanInts({ ...form, total:calcT() }, ['paginas','personaje','prosa','trama','aprendizaje','entretenimiento','total'])) }}/>
      </div>
    </Modal>
  )
}


// ─── LISTA PAGE ───────────────────────────────────────────────────────────────
function ListaPanel({who, color, lista, saveLista, bibRows, leidosRows}) {
  const [dragIdx, setDragIdx] = useState(null)
  const [overIdx, setOverIdx] = useState(null)
  const [search, setSearch] = useState('')
  const [showAdd, setShowAdd] = useState(false)

  const leidosSet = useMemo(() => new Set(leidosRows.map(l => l.titulo?.toLowerCase().trim())), [leidosRows])

  const items = useMemo(() =>
    lista.map(id => bibRows.find(b => b.id === id)).filter(Boolean)
  , [lista, bibRows])

  const candidates = useMemo(() =>
    bibRows.filter(b =>
      !lista.includes(b.id) &&
      !leidosSet.has(b.titulo?.toLowerCase().trim()) &&
      (!search || b.titulo?.toLowerCase().includes(search.toLowerCase()) || b.autor?.toLowerCase().includes(search.toLowerCase()))
    )
  , [bibRows, lista, leidosSet, search])

  function addToList(id) { saveLista([...lista, id]) }
  function removeFromList(id) { saveLista(lista.filter(x => x !== id)) }
  function moveUp(idx) { if (idx === 0) return; const l=[...lista]; [l[idx-1],l[idx]]=[l[idx],l[idx-1]]; saveLista(l) }
  function moveDown(idx) { if (idx === lista.length-1) return; const l=[...lista]; [l[idx],l[idx+1]]=[l[idx+1],l[idx]]; saveLista(l) }

  function onDragStart(e, idx) { setDragIdx(idx); e.dataTransfer.effectAllowed='move' }
  function onDragOver(e, idx) { e.preventDefault(); setOverIdx(idx) }
  function onDrop(e, idx) {
    e.preventDefault()
    if (dragIdx === null || dragIdx === idx) { setDragIdx(null); setOverIdx(null); return }
    const l = [...lista]
    const [moved] = l.splice(dragIdx, 1)
    l.splice(idx, 0, moved)
    saveLista(l)
    setDragIdx(null); setOverIdx(null)
  }
  function onDragEnd() { setDragIdx(null); setOverIdx(null) }

  return (
    <div style={{ flex:1, minWidth:0 }}>
      <div style={{ display:'flex', alignItems:'center', justifyContent:'space-between', marginBottom:12, padding:'10px 14px', background:C.surface, borderRadius:10, border:`1px solid ${color}33` }}>
        <div style={{ display:'flex', alignItems:'center', gap:10 }}>
          <div style={{ width:32, height:32, borderRadius:'50%', background:color, color:C.bg, display:'flex', alignItems:'center', justifyContent:'center', fontWeight:900, fontSize:14 }}>{who}</div>
          <div>
            <div style={{ fontSize:14, fontWeight:700, color }}>{who==='K'?'👩 Kiara':'👨 Pablo'}</div>
            <div style={{ fontSize:10, color:C.muted }}>{lista.length} libros ordenados</div>
          </div>
        </div>
        <Btn label={showAdd?'✕ Cerrar':'+ Añadir'} onClick={() => setShowAdd(s => !s)} secondary sm/>
      </div>

      {showAdd && (
        <div style={{ background:'rgba(0,0,0,0.25)', borderRadius:8, padding:12, marginBottom:12, border:`1px solid ${C.border}` }}>
          <input value={search} onChange={e => setSearch(e.target.value)} placeholder="Buscar para añadir..." style={{...iS, marginBottom:8}}/>
          <div style={{ maxHeight:200, overflowY:'auto', display:'flex', flexDirection:'column', gap:4 }}>
            {candidates.slice(0,40).map(b => (
              <div key={b.id} style={{ display:'flex', alignItems:'center', justifyContent:'space-between', padding:'6px 8px', background:C.surface, borderRadius:6, fontSize:12 }}>
                <div style={{ flex:1, minWidth:0 }}>
                  <div style={{ overflow:'hidden', textOverflow:'ellipsis', whiteSpace:'nowrap', color:C.cream }}>{b.titulo}</div>
                  <div style={{ fontSize:10, color:C.muted }}>{b.autor}</div>
                </div>
                <IBtn icon="+" onClick={() => addToList(b.id)} sm/>
              </div>
            ))}
            {!candidates.length && <div style={{ color:C.muted, fontSize:12, textAlign:'center', padding:8 }}>Sin resultados</div>}
          </div>
        </div>
      )}

      {!items.length
        ? <div style={{ textAlign:'center', padding:'32px 16px', color:'#445', fontSize:13, border:'1px dashed #1a4a48', borderRadius:8 }}>
            Añade libros para ordenarlos.<br/>
            <span style={{ fontSize:11, color:'#334' }}>El orden afecta al aleatorio.</span>
          </div>
        : <div style={{ display:'flex', flexDirection:'column', gap:4 }}>
            {items.map((b, idx) => {
              const isDragging = dragIdx === idx
              const isOver = overIdx === idx && dragIdx !== idx
              return (
                <div key={b.id}
                  draggable
                  onDragStart={e => onDragStart(e, idx)}
                  onDragOver={e => onDragOver(e, idx)}
                  onDrop={e => onDrop(e, idx)}
                  onDragEnd={onDragEnd}
                  style={{ display:'flex', alignItems:'center', gap:8, padding:'8px 10px', borderRadius:8, background:isDragging?'rgba(5,175,106,0.08)':C.surface, border:`1px solid ${isOver?color:isDragging?C.border:'rgba(255,255,255,0.04)'}`, opacity:isDragging?0.5:1, cursor:'grab', userSelect:'none' }}>
                  <div style={{ width:24, height:24, borderRadius:'50%', background:idx<3?color:'#1a3a38', color:idx<3?C.bg:C.muted, display:'flex', alignItems:'center', justifyContent:'center', fontWeight:700, fontSize:11, flexShrink:0 }}>{idx+1}</div>
                  <span style={{ color:'#334', fontSize:14, flexShrink:0 }}>⠿</span>
                  <div style={{ flex:1, minWidth:0 }}>
                    <div style={{ fontSize:12, color:C.cream, overflow:'hidden', textOverflow:'ellipsis', whiteSpace:'nowrap' }}>{b.titulo}</div>
                    <div style={{ fontSize:10, color:C.muted }}>{b.autor}</div>
                  </div>
                  {(b.recomendado_por||[]).includes(who==='K'?'P':'K') && (
                    <span style={{ fontSize:9, padding:'1px 6px', borderRadius:8, background:`${who==='K'?C.P:C.K}22`, color:who==='K'?C.P:C.K, border:`1px solid ${who==='K'?C.P:C.K}44`, flexShrink:0 }}>
                      💌 {who==='K'?'Pablo':'Kiara'}
                    </span>
                  )}
                  <div style={{ display:'flex', flexDirection:'column', gap:2, flexShrink:0 }}>
                    <button onClick={() => moveUp(idx)} disabled={idx===0} style={{ background:'none', border:'none', color:idx===0?'#334':C.muted, cursor:idx===0?'default':'pointer', fontSize:10, padding:'1px 4px' }}>▲</button>
                    <button onClick={() => moveDown(idx)} disabled={idx===items.length-1} style={{ background:'none', border:'none', color:idx===items.length-1?'#334':C.muted, cursor:idx===items.length-1?'default':'pointer', fontSize:10, padding:'1px 4px' }}>▼</button>
                  </div>
                  <IBtn icon="✕" onClick={() => removeFromList(b.id)} danger sm/>
                </div>
              )
            })}
          </div>
      }
    </div>
  )
}

function ListaPage({bib, leidos, listaK, saveListaK, listaP, saveListaP}) {
  return (
    <div>
      <SH title="Listas de Prioridad" sub="Arrastra para ordenar · los primeros tienen más peso en el aleatorio"/>
      <div style={{ fontSize:11, color:C.muted, marginBottom:16, padding:'8px 12px', background:'rgba(5,175,106,0.06)', borderRadius:8, border:'1px solid rgba(5,175,106,0.15)' }}>
        💡 Cada uno ordena su lista de forma independiente. El aleatorio usa la posición: cuanto más arriba, más probable que salga. También puedes usar ▲▼ en móvil.
      </div>
      <div style={{ display:'grid', gridTemplateColumns:'1fr 1fr', gap:16 }}>
        <ListaPanel who="K" color={C.K} lista={listaK} saveLista={saveListaK} bibRows={bib.rows} leidosRows={leidos.rows}/>
        <ListaPanel who="P" color={C.P} lista={listaP} saveLista={saveListaP} bibRows={bib.rows} leidosRows={leidos.rows}/>
      </div>
    </div>
  )
}

// ─── APP ROOT ────────────────────────────────────────────────────────────────
const NAV = [
  { id:'biblioteca',   icon:'📚', label:'Biblioteca' },
  { id:'leidos',       icon:'✅', label:'Leídos' },
  { id:'lista',        icon:'📋', label:'Lista' },
  { id:'estadisticas', icon:'📊', label:'Stats' },
  { id:'aleatorio',    icon:'🎲', label:'Aleatorio' },
  { id:'comprar',      icon:'🛒', label:'Comprar' },
]

function useListaStorage(key) {
  const [lista, setLista] = useState([])
  const [loaded, setLoaded] = useState(false)

  useEffect(() => {
    async function load() {
      try {
        const r = await window.storage?.get(key)
        if (r?.value) setLista(JSON.parse(r.value))
      } catch(e) {}
      setLoaded(true)
    }
    load()
  }, [key])

  async function saveLista(newLista) {
    setLista(newLista)
    try { await window.storage?.set(key, JSON.stringify(newLista)) } catch(e) {}
  }

  return [lista, saveLista, loaded]
}

export default function App() {
  const [page, setPage] = useState('biblioteca')
  const leidos = useTable('leidos', SEED_LEIDOS)
  const bib    = useTable('biblioteca', SEED_BIBLIOTECA)
  const [listaK, saveListaK] = useListaStorage('kp_listaK_v1')
  const [listaP, saveListaP] = useListaStorage('kp_listaP_v1')

  return (
    <div style={{ fontFamily:"'Segoe UI',Georgia,serif", background:C.bg, minHeight:'100vh', color:C.cream, display:'flex', flexDirection:'column' }}>
      <div style={{ background:C.surface, padding:'14px 20px', borderBottom:`2px solid ${C.green}22`, display:'flex', alignItems:'center', justifyContent:'space-between', flexShrink:0 }}>
        <div>
          <div style={{ fontSize:10, letterSpacing:5, color:C.green, textTransform:'uppercase' }}>— BIBLIOTECA —</div>
          <h1 style={{ margin:'2px 0 0', fontSize:24, color:C.gold, letterSpacing:3, fontFamily:'Georgia,serif' }}>K & P</h1>
        </div>
        <div style={{ display:'flex', gap:8 }}>
          <span style={{ background:C.K, color:C.bg, padding:'4px 14px', borderRadius:20, fontSize:12, fontWeight:700 }}>Kiara</span>
          <span style={{ background:C.P, color:C.bg, padding:'4px 14px', borderRadius:20, fontSize:12, fontWeight:700 }}>Pablo</span>
        </div>
      </div>
      <div style={{ display:'flex', background:C.surface, borderBottom:`1px solid ${C.border}`, overflowX:'auto', flexShrink:0 }}>
        {NAV.map(n => (
          <button key={n.id} onClick={() => setPage(n.id)}
            style={{ padding:'11px 18px', background:page===n.id?C.bg:'transparent', color:page===n.id?C.gold:C.cream, border:'none', cursor:'pointer', fontSize:13, fontFamily:'inherit', borderBottom:page===n.id?`2px solid ${C.green}`:'2px solid transparent', whiteSpace:'nowrap', transition:'all 0.15s' }}>
            {n.icon} {n.label}
          </button>
        ))}
      </div>
      <div style={{ flex:1, overflowY:'auto', padding:'20px 16px' }}>
        <div style={{ maxWidth:980, margin:'0 auto' }}>
          {page === 'biblioteca'   && <BibliotecaPage bib={bib} leidos={leidos}/>}
          {page === 'leidos'       && <LeidosPage leidos={leidos} bib={bib}/>}
          {page === 'lista'        && <ListaPage bib={bib} leidos={leidos} listaK={listaK} saveListaK={saveListaK} listaP={listaP} saveListaP={saveListaP}/>}
          {page === 'estadisticas' && <EstadisticasPage leidos={leidos}/>}
          {page === 'aleatorio'    && <AleatorioPage bib={bib} leidos={leidos} listaK={listaK} listaP={listaP}/>}
          {page === 'comprar'      && <ComprarPage leidos={leidos}/>}
        </div>
      </div>
    </div>
  )
}
