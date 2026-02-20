import { useState, useEffect, useMemo } from "react";
import { supabase } from "./supabaseClient.js";

const GENEROS_LIST = ["Amor y familia","Autoayuda","Biología","Ciencia","Dinero y finanzas","Fantasía","Ficción","Filosofía","Física","Historia","Ingeniería","Lectura","Literatura","Memorias","Negocios","Poesía","Política","Productividad","Psicología","Realizamiento","Research","Romance","Salud","Work-life balance","Mitología"];
const MESES = ["Enero","Febrero","Marzo","Abril","Mayo","Junio","Julio","Agosto","Septiembre","Octubre","Noviembre","Diciembre"];
const FORMATOS = ["Ebook","Papel"];
const C = { darkCyan:"#033331", medCyan:"#0d3d3b", deepCyan:"#05af6a", medOrange:"#f8dfa9", paleOrange:"#f8f1e4", K:"#f8dfa9", P:"#05af6a" };

const SEED_LEIDOS = [
 
];

const SEED_BIBLIOTECA = [
  
];

// ── Supabase hooks ─────────────────────────────────────────────────────────

// Convierte fila de DB a objeto app (leidos: mes_leido → mesLeido)
function fromDbLeido(row) {
  return { ...row, mesLeido: row.mes_leido };
}
// Convierte objeto app a fila de DB (leidos: mesLeido → mes_leido)
function toDbLeido(obj) {
  const { mesLeido, id, ...rest } = obj;
  const row = { ...rest, mes_leido: mesLeido };
  if (id && typeof id === 'number' && id < 2000000000) row.id = id;
  // Limpiar campos numéricos vacíos
  if (row.paginas === '' || row.paginas === null) row.paginas = null;
  else row.paginas = Number(row.paginas);
  ['personaje','prosa','trama','aprendizaje','entretenimiento','total'].forEach(k => {
    row[k] = Number(row[k]) || 0;
  });
  return row;
}
function toDbBiblioteca(obj) {
  const { id, ...rest } = obj;
  const row = { ...rest };
  if (id && typeof id === 'number' && id < 2000000000) row.id = id;
  return row;
}

function useTable(tableName, seedData, fromDb, toDb) {
  const [data, setData] = useState([]);
  const [loaded, setLoaded] = useState(false);
  const [dbIds, setDbIds] = useState(new Set()); // IDs que existen en DB

  async function reload() {
    const { data: rows, error } = await supabase.from(tableName).select('*').order('id');
    if (!error && rows) {
      const mapped = rows.map(fromDb);
      setData(mapped);
      setDbIds(new Set(rows.map(r => r.id)));
      return mapped;
    }
    return null;
  }

  useEffect(() => {
    (async () => {
      const { data: rows, error } = await supabase.from(tableName).select('*').order('id');
      if (!error && rows) {
        if (rows.length === 0) {
          // Primera vez: sembrar datos
          const chunks = [];
          for (let i = 0; i < seedData.length; i += 50) chunks.push(seedData.slice(i, i + 50));
          for (const chunk of chunks) {
            await supabase.from(tableName).insert(chunk.map(item => {
              const { id, ...rest } = item; // no pasar IDs al seed
              return rest;
            }));
          }
          await reload();
        } else {
          const mapped = rows.map(fromDb);
          setData(mapped);
          setDbIds(new Set(rows.map(r => r.id)));
        }
      }
      setLoaded(true);
    })();
  }, []);

  async function save(newArray) {
    // Optimistic update
    setData(newArray);

    const currentDbIds = dbIds;
    const newIds = new Set(newArray.map(x => x.id).filter(Boolean));

    // Borrar los que ya no están
    const toDelete = [...currentDbIds].filter(id => !newIds.has(id));
    if (toDelete.length) {
      await supabase.from(tableName).delete().in('id', toDelete);
    }

    // Insertar los nuevos (sin id en DB o con id generado por Date.now que es > 2B)
    const toInsert = newArray.filter(x => !x.id || !currentDbIds.has(x.id));
    if (toInsert.length) {
      await supabase.from(tableName).insert(toInsert.map(item => {
        const row = toDb(item);
        delete row.id; // dejar que DB genere el id
        return row;
      }));
    }

    // Actualizar los que existen
    const toUpdate = newArray.filter(x => x.id && currentDbIds.has(x.id));
    for (const item of toUpdate) {
      const row = toDb(item);
      const id = row.id;
      delete row.id;
      await supabase.from(tableName).update(row).eq('id', id);
    }

    // Recargar para tener IDs reales
    await reload();
  }

  return [data, save, loaded];
}

// ── UI helpers ─────────────────────────────────────────────────────────────

function Stars({ value }) {
  return (
    <div style={{ display:"inline-flex",alignItems:"center",gap:6 }}>
      <div style={{ position:"relative",width:80,height:10 }}>
        <div style={{ position:"absolute",inset:0,background:"#1a4a48",borderRadius:3 }}/>
        <div style={{ position:"absolute",top:0,left:0,width:`${Math.min(value/10*100,100)}%`,height:"100%",background:`linear-gradient(90deg,${C.deepCyan},#3dd890)`,borderRadius:3 }}/>
      </div>
      <span style={{ color:C.medOrange,fontSize:13,fontWeight:700 }}>{value}</span>
    </div>
  );
}

function GenreMultiSelect({ value=[], onChange }) {
  return (
    <div style={{ display:"flex",flexWrap:"wrap",gap:5,marginTop:4 }}>
      {GENEROS_LIST.map(g=>{
        const on=value.includes(g);
        return <button key={g} type="button" onClick={()=>onChange(on?value.filter(x=>x!==g):[...value,g])}
          style={{ padding:"3px 10px",borderRadius:12,border:`1px solid ${on?C.deepCyan:"#1a5a58"}`,background:on?`${C.deepCyan}33`:"transparent",color:on?C.deepCyan:"#8cc",fontSize:11,cursor:"pointer" }}>
          {on?"✓ ":""}{g}
        </button>;
      })}
    </div>
  );
}

const GENRE_COLORS = { "Ficción":C.deepCyan,"Fantasía":"#60c090","Romance":"#ff9ab0","Psicología":"#7ab4d4","Filosofía":"#c4b464","Negocios":"#9ad464","Historia":"#d4a464","Salud":"#64d4b4","Poesía":"#d48ad4","Ciencia":"#64b4d4","Física":"#d46464","Research":"#a0a0a0" };
function GenreTags({ generos }) {
  if(!generos||!generos.length) return null;
  return <div style={{ display:"flex",flexWrap:"wrap",gap:4 }}>{generos.map(g=>(
    <span key={g} style={{ fontSize:10,padding:"2px 7px",borderRadius:10,border:`1px solid ${GENRE_COLORS[g]||"#1a5a58"}55`,color:GENRE_COLORS[g]||"#8cc",background:`${GENRE_COLORS[g]||"#1a5a58"}18` }}>{g}</span>
  ))}</div>;
}

const iS={background:"rgba(0,0,0,0.3)",border:`1px solid #1a5a58`,borderRadius:6,padding:"8px 10px",color:C.paleOrange,fontSize:12,fontFamily:"Georgia,serif",width:"100%",boxSizing:"border-box"};
const sS={...iS,cursor:"pointer"};

function Btn({label,onClick,secondary,sm}) {
  return <button onClick={onClick} style={{ background:secondary?"rgba(255,255,255,0.07)":C.deepCyan,color:secondary?C.paleOrange:C.darkCyan,border:secondary?`1px solid #1a5a58`:"none",padding:sm?"5px 12px":"8px 18px",borderRadius:6,cursor:"pointer",fontWeight:700,fontSize:sm?11:12,fontFamily:"Georgia,serif" }}>{label}</button>;
}
function IBtn({icon,onClick,danger,sm}) {
  return <button onClick={onClick} style={{ background:danger?"rgba(200,60,60,0.15)":"rgba(5,175,106,0.15)",border:"none",color:danger?"#f99":C.deepCyan,cursor:"pointer",padding:sm?"2px 5px":"4px 8px",borderRadius:4,fontSize:sm?10:12 }}>{icon}</button>;
}
function SH({title,sub,action}) {
  return <div style={{ display:"flex",justifyContent:"space-between",alignItems:"flex-end",marginBottom:18 }}>
    <div><h2 style={{ margin:0,fontSize:19,color:C.medOrange }}>{title}</h2>{sub&&<div style={{ fontSize:11,color:"#8cc",marginTop:2 }}>{sub}</div>}</div>
    {action&&<Btn label={action.label} onClick={action.fn}/>}
  </div>;
}
function Empty({msg}) { return <div style={{ textAlign:"center",padding:28,color:"#556",fontSize:13 }}>{msg}</div>; }
function Card({title,children}) {
  return <div style={{ background:C.medCyan,borderRadius:10,padding:16,marginBottom:14 }}>
    <h3 style={{ margin:"0 0 14px",fontSize:13,color:C.medOrange }}>{title}</h3>{children}
  </div>;
}
function FL({label,children,wide}) {
  return <div style={{ gridColumn:wide?"1 / -1":undefined,marginBottom:8 }}>
    <label style={{ display:"block",fontSize:10,color:"#8cc",marginBottom:4 }}>{label}</label>{children}
  </div>;
}
function Modal({title,children,onClose,wide}) {
  return <div style={{ position:"fixed",inset:0,background:"rgba(0,0,0,0.75)",zIndex:999,display:"flex",alignItems:"center",justifyContent:"center",padding:16 }}>
    <div style={{ background:C.medCyan,borderRadius:14,padding:22,width:"100%",maxWidth:wide?560:420,maxHeight:"92vh",overflowY:"auto",border:`1px solid #1a5a58` }}>
      <div style={{ display:"flex",justifyContent:"space-between",alignItems:"center",marginBottom:18 }}>
        <h2 style={{ margin:0,fontSize:16,color:C.medOrange }}>{title}</h2>
        <button onClick={onClose} style={{ background:"none",border:"none",color:C.paleOrange,cursor:"pointer",fontSize:18 }}>✕</button>
      </div>
      {children}
    </div>
  </div>;
}

// ── Pages ──────────────────────────────────────────────────────────────────

function BibliotecaPage({leidos,saveBiblioteca,biblioteca}) {
  const [search,setSearch]=useState("");const [fg,setFg]=useState("");
  const [showForm,setShowForm]=useState(false);const [editItem,setEditItem]=useState(null);
  const leidosSet=useMemo(()=>new Set(leidos.map(l=>l.titulo?.toLowerCase().trim())),[leidos]);
  const filtered=useMemo(()=>biblioteca.filter(b=>{
    const ms=!search||b.titulo?.toLowerCase().includes(search.toLowerCase())||b.autor?.toLowerCase().includes(search.toLowerCase());
    const mg=!fg||(b.generos&&b.generos.includes(fg));
    return ms&&mg;
  }),[biblioteca,search,fg]);
  function handleSave(book) {
    if(book.id) saveBiblioteca(biblioteca.map(b=>b.id===book.id?book:b));
    else saveBiblioteca([...biblioteca,{...book,id:Date.now()}]);
    setShowForm(false);setEditItem(null);
  }
  function handleDelete(id){if(window.confirm("¿Eliminar?"))saveBiblioteca(biblioteca.filter(b=>b.id!==id));}
  return <div>
    <SH title="Biblioteca Conjunta" sub={`${biblioteca.length} libros · ${leidos.length} leídos`} action={{label:"+ Añadir",fn:()=>setShowForm(true)}}/>
    <div style={{ display:"flex",gap:8,marginBottom:14,flexWrap:"wrap" }}>
      <input value={search} onChange={e=>setSearch(e.target.value)} placeholder="Buscar título o autor..." style={{...iS,width:200}}/>
      <select value={fg} onChange={e=>setFg(e.target.value)} style={sS}>
        <option value="">Todos los géneros</option>{GENEROS_LIST.map(g=><option key={g}>{g}</option>)}
      </select>
      {(search||fg)&&<Btn label="✕ Limpiar" onClick={()=>{setSearch("");setFg("");}} secondary sm/>}
    </div>
    <div style={{ overflowX:"auto" }}>
      <table style={{ width:"100%",borderCollapse:"collapse",fontSize:12 }}>
        <thead><tr style={{ background:C.medCyan }}>{["Título","Autor","Géneros","Estado",""].map(h=><th key={h} style={{ padding:"9px 10px",textAlign:"left",color:C.medOrange,fontWeight:700,borderBottom:`1px solid #1a5a58` }}>{h}</th>)}</tr></thead>
        <tbody>{filtered.map((b,i)=>{
          const yl=leidosSet.has(b.titulo?.toLowerCase().trim());
          return <tr key={b.id} style={{ background:i%2===0?"rgba(255,255,255,0.025)":"transparent",borderBottom:"1px solid rgba(255,255,255,0.04)" }}>
            <td style={{ padding:"9px 10px",color:yl?C.deepCyan:C.paleOrange }}>{yl&&<span style={{ marginRight:5,fontSize:10 }}>✓</span>}{b.titulo}</td>
            <td style={{ padding:"9px 10px",color:"#aad4d0",fontSize:11 }}>{b.autor}</td>
            <td style={{ padding:"9px 10px" }}><GenreTags generos={b.generos}/></td>
            <td style={{ padding:"9px 10px" }}>{yl?<span style={{ color:C.deepCyan,fontSize:10,fontWeight:700 }}>LEÍDO</span>:<span style={{ color:"#556",fontSize:10 }}>pendiente</span>}</td>
            <td style={{ padding:"9px 10px" }}><div style={{ display:"flex",gap:4 }}><IBtn icon="✏" onClick={()=>setEditItem(b)}/><IBtn icon="✕" onClick={()=>handleDelete(b.id)} danger/></div></td>
          </tr>;
        })}</tbody>
      </table>
      {!filtered.length&&<Empty msg="Sin resultados"/>}
    </div>
    {(showForm||editItem)&&<BibFormModal book={editItem} onSave={handleSave} onClose={()=>{setShowForm(false);setEditItem(null);}}/>}
  </div>;
}

function LeidosPage({leidos,saveLeidos,biblioteca}) {
  const [lector,setLector]=useState("Todos");const [fg,setFg]=useState("");const [mes,setMes]=useState("");const [search,setSearch]=useState("");
  const [showForm,setShowForm]=useState(false);const [editItem,setEditItem]=useState(null);
  const filtered=useMemo(()=>leidos.filter(b=>{
    const ml=lector==="Todos"||b.lector===lector;
    const mg=!fg||(b.generos&&b.generos.includes(fg));
    const mm=!mes||b.mesLeido===mes;
    const ms=!search||b.titulo?.toLowerCase().includes(search.toLowerCase())||b.autor?.toLowerCase().includes(search.toLowerCase());
    return ml&&mg&&mm&&ms;
  }),[leidos,lector,fg,mes,search]);
  function handleSave(book) {
    const dup=leidos.some(b=>b.id!==book.id&&b.titulo?.toLowerCase().trim()===book.titulo?.toLowerCase().trim()&&b.lector===book.lector);
    if(dup){alert("⚠️ Este libro ya está registrado para este lector.");return;}
    if(book.id) saveLeidos(leidos.map(b=>b.id===book.id?book:b));
    else saveLeidos([...leidos,{...book,id:Date.now()}]);
    setShowForm(false);setEditItem(null);
  }
  function handleDelete(id){if(window.confirm("¿Eliminar?"))saveLeidos(leidos.filter(b=>b.id!==id));}
  const kC=leidos.filter(b=>b.lector==="K").length,pC=leidos.filter(b=>b.lector==="P").length;
  return <div>
    <SH title="Libros Leídos" sub={`${leidos.length} total · 👩 K:${kC} · 👨 P:${pC}`} action={{label:"+ Añadir leído",fn:()=>setShowForm(true)}}/>
    <div style={{ display:"flex",gap:8,marginBottom:16,flexWrap:"wrap" }}>
      {["Todos","K","P"].map(l=><button key={l} onClick={()=>setLector(l)} style={{ padding:"6px 14px",borderRadius:20,border:`1px solid ${lector===l?(l==="K"?C.K:l==="P"?C.P:C.deepCyan):"#1a5a58"}`,background:lector===l?(l==="K"?`${C.K}22`:l==="P"?`${C.P}22`:`${C.deepCyan}22`):"transparent",color:lector===l?(l==="K"?C.K:l==="P"?C.P:C.deepCyan):"#8cc",fontSize:12,cursor:"pointer" }}>{l==="Todos"?"👥 Todos":l==="K"?"👩 Kiara":"👨 Pablo"}</button>)}
      <select value={fg} onChange={e=>setFg(e.target.value)} style={sS}><option value="">Todos géneros</option>{GENEROS_LIST.map(g=><option key={g}>{g}</option>)}</select>
      <select value={mes} onChange={e=>setMes(e.target.value)} style={sS}><option value="">Todos los meses</option>{MESES.map(m=><option key={m}>{m}</option>)}</select>
      <input value={search} onChange={e=>setSearch(e.target.value)} placeholder="Buscar..." style={{...iS,width:130}}/>
    </div>
    <div style={{ display:"grid",gridTemplateColumns:"repeat(auto-fill,minmax(290px,1fr))",gap:12 }}>
      {filtered.map(b=><LeidoCard key={b.id} book={b} onEdit={()=>setEditItem(b)} onDelete={()=>handleDelete(b.id)}/>)}
    </div>
    {!filtered.length&&<Empty msg="Nada aquí todavía"/>}
    {(showForm||editItem)&&<LeidoFormModal book={editItem} biblioteca={biblioteca} onSave={handleSave} onClose={()=>{setShowForm(false);setEditItem(null);}}/>}
  </div>;
}

function LeidoCard({book,onEdit,onDelete}) {
  const bc=book.lector==="K"?C.K:C.P;
  return <div style={{ background:C.medCyan,borderRadius:10,padding:14,borderLeft:`3px solid ${bc}` }}>
    <div style={{ display:"flex",justifyContent:"space-between",alignItems:"flex-start",marginBottom:8 }}>
      <div style={{ flex:1,minWidth:0 }}>
        <div style={{ fontSize:14,fontWeight:700,color:C.medOrange,marginBottom:2,overflow:"hidden",textOverflow:"ellipsis",whiteSpace:"nowrap" }}>{book.titulo}</div>
        <div style={{ fontSize:11,color:"#aad4d0" }}>{book.autor}</div>
      </div>
      <div style={{ display:"flex",flexDirection:"column",alignItems:"center",gap:4,marginLeft:8,flexShrink:0 }}>
        <div style={{ width:28,height:28,borderRadius:"50%",background:bc,color:C.darkCyan,display:"flex",alignItems:"center",justifyContent:"center",fontWeight:900,fontSize:12 }}>{book.lector}</div>
        <div style={{ display:"flex",gap:3 }}><IBtn icon="✏" onClick={onEdit} sm/><IBtn icon="✕" onClick={onDelete} danger sm/></div>
      </div>
    </div>
    <div style={{ display:"flex",gap:6,flexWrap:"wrap",marginBottom:8 }}>
      <GenreTags generos={book.generos}/>
      <span style={{ fontSize:10,background:"rgba(255,255,255,0.08)",padding:"2px 7px",borderRadius:10 }}>{book.formato}</span>
      {book.mesLeido&&<span style={{ fontSize:10,background:`${C.deepCyan}22`,padding:"2px 7px",borderRadius:10,color:C.deepCyan }}>{book.mesLeido}</span>}
    </div>
    {book.total>0&&<div>
      <Stars value={book.total}/>
      <div style={{ display:"grid",gridTemplateColumns:"1fr 1fr",gap:3,marginTop:6 }}>
        {[["Personaje",book.personaje],["Prosa",book.prosa],["Trama",book.trama],["Aprendizaje",book.aprendizaje],["Entretenimiento",book.entretenimiento]].map(([k,v])=>v>0&&<div key={k} style={{ fontSize:10,color:"#8cc" }}>{k}: <span style={{ color:C.paleOrange }}>{v}</span></div>)}
      </div>
    </div>}
  </div>;
}

function EstadisticasPage({leidos}) {
  const kB=leidos.filter(b=>b.lector==="K"),pB=leidos.filter(b=>b.lector==="P");
  const byMonth=useMemo(()=>{
    const m={};MESES.forEach(x=>{m[x]={K:0,P:0}});
    leidos.forEach(b=>{if(b.mesLeido&&m[b.mesLeido])m[b.mesLeido][b.lector]=(m[b.mesLeido][b.lector]||0)+1});
    return MESES.map(x=>({mes:x.slice(0,3),...m[x]})).filter(x=>x.K||x.P);
  },[leidos]);
  const ranking=useMemo(()=>leidos.filter(b=>b.total>0).sort((a,b)=>b.total-a.total).slice(0,10),[leidos]);
  const avg=leidos.filter(b=>b.total>0);
  const avgV=avg.length?(avg.reduce((s,b)=>s+b.total,0)/avg.length).toFixed(1):"-";
  function topA(books){const m={};books.forEach(b=>{if(b.autor)m[b.autor]=(m[b.autor]||0)+1});return Object.entries(m).sort((a,b)=>b[1]-a[1]).slice(0,6).map(([name,count])=>({name,count}));}
  return <div>
    <SH title="Estadísticas" sub="Tu año en libros"/>
    <div style={{ display:"grid",gridTemplateColumns:"repeat(4,1fr)",gap:10,marginBottom:20 }}>
      {[["📚","Total",leidos.length,null],["👩","Kiara",kB.length,C.K],["👨","Pablo",pB.length,C.P],["⭐","Nota media",avgV,C.deepCyan]].map(([icon,label,value,color])=>(
        <div key={label} style={{ background:C.medCyan,borderRadius:10,padding:"14px 10px",textAlign:"center",borderBottom:`2px solid ${color||"#1a4a48"}` }}>
          <div style={{ fontSize:18 }}>{icon}</div>
          <div style={{ fontSize:22,fontWeight:900,color:color||C.medOrange,margin:"4px 0 2px" }}>{value}</div>
          <div style={{ fontSize:10,color:"#8cc" }}>{label}</div>
        </div>
      ))}
    </div>
    <div style={{ display:"grid",gridTemplateColumns:"1fr 1fr",gap:14,marginBottom:14 }}>
      <Card title="📖 Autores — Kiara">{topA(kB).length?topA(kB).map(d=><BarRow key={d.name} d={d} max={Math.max(...topA(kB).map(x=>x.count),1)} color={C.K}/>):<Empty msg="Sin datos"/>}</Card>
      <Card title="📖 Autores — Pablo">{topA(pB).length?topA(pB).map(d=><BarRow key={d.name} d={d} max={Math.max(...topA(pB).map(x=>x.count),1)} color={C.P}/>):<Empty msg="Sin datos"/>}</Card>
    </div>
    {byMonth.length>0&&<Card title="📅 Libros por mes">
      <div style={{ display:"flex",alignItems:"flex-end",gap:8,height:148,overflowX:"auto" }}>
        {byMonth.map(d=>{
          const max=Math.max(...byMonth.flatMap(x=>[x.K,x.P]),1);
          return <div key={d.mes} style={{ display:"flex",flexDirection:"column",alignItems:"center",minWidth:38 }}>
            <div style={{ display:"flex",alignItems:"flex-end",gap:3,height:120 }}>
              <div style={{ width:13,height:`${(d.K/max)*120}px`,background:C.K,borderRadius:"3px 3px 0 0",position:"relative" }}>{d.K>0&&<span style={{ position:"absolute",top:-13,left:"50%",transform:"translateX(-50%)",fontSize:9,color:C.K }}>{d.K}</span>}</div>
              <div style={{ width:13,height:`${(d.P/max)*120}px`,background:C.P,borderRadius:"3px 3px 0 0",position:"relative" }}>{d.P>0&&<span style={{ position:"absolute",top:-13,left:"50%",transform:"translateX(-50%)",fontSize:9,color:C.P }}>{d.P}</span>}</div>
            </div>
            <div style={{ fontSize:9,color:"#8cc",marginTop:4 }}>{d.mes}</div>
          </div>;
        })}
      </div>
      <div style={{ display:"flex",gap:14,justifyContent:"flex-end",marginTop:8 }}><span style={{ fontSize:11,color:C.K }}>■ Kiara</span><span style={{ fontSize:11,color:C.P }}>■ Pablo</span></div>
    </Card>}
    <Card title="🏆 Ranking por nota">
      {ranking.map((b,i)=><div key={b.id} style={{ display:"flex",alignItems:"center",gap:10,padding:"8px 0",borderBottom:"1px solid rgba(255,255,255,0.06)" }}>
        <div style={{ width:26,height:26,borderRadius:"50%",background:i<3?C.deepCyan:"#1a4a48",color:i<3?C.darkCyan:C.paleOrange,display:"flex",alignItems:"center",justifyContent:"center",fontWeight:900,fontSize:11,flexShrink:0 }}>{i+1}</div>
        <div style={{ flex:1,minWidth:0 }}>
          <div style={{ fontSize:12,color:C.medOrange,overflow:"hidden",textOverflow:"ellipsis",whiteSpace:"nowrap" }}>{b.titulo}</div>
          <div style={{ fontSize:10,color:"#8cc" }}>{b.autor} · <span style={{ color:b.lector==="K"?C.K:C.P }}>{b.lector==="K"?"Kiara":"Pablo"}</span></div>
        </div>
        <Stars value={b.total}/>
      </div>)}
      {!ranking.length&&<Empty msg="Sin libros puntuados aún"/>}
    </Card>
  </div>;
}

function BarRow({d,max,color}) {
  return <div style={{ marginBottom:8 }}>
    <div style={{ display:"flex",justifyContent:"space-between",fontSize:11,marginBottom:2 }}>
      <span style={{ overflow:"hidden",textOverflow:"ellipsis",whiteSpace:"nowrap",maxWidth:"80%",color:C.paleOrange }}>{d.name}</span>
      <span style={{ color }}>{d.count}</span>
    </div>
    <div style={{ background:"#1a3a38",borderRadius:3,height:7 }}><div style={{ width:`${(d.count/max)*100}%`,height:"100%",background:color,borderRadius:3 }}/></div>
  </div>;
}

function AleatorioPage({biblioteca,leidos}) {
  const [rec,setRec]=useState(null);const [spinning,setSpinning]=useState(false);
  const [fg,setFg]=useState("");const [autor,setAutor]=useState("");
  const [yo,setYo]=useState("");const [soloOtro,setSoloOtro]=useState(false);
  const leidosSet=useMemo(()=>new Set(leidos.map(l=>l.titulo?.toLowerCase().trim())),[leidos]);
  const leidosPorK=useMemo(()=>new Set(leidos.filter(l=>l.lector==="K").map(l=>l.titulo?.toLowerCase().trim())),[leidos]);
  const leidosPorP=useMemo(()=>new Set(leidos.filter(l=>l.lector==="P").map(l=>l.titulo?.toLowerCase().trim())),[leidos]);
  const autores=useMemo(()=>[...new Set(biblioteca.map(b=>b.autor).filter(Boolean))].sort(),[biblioteca]);
  const otro=yo==="K"?"P":yo==="P"?"K":null;
  const leidosPorOtro=otro==="K"?leidosPorK:otro==="P"?leidosPorP:new Set();
  const pool=useMemo(()=>biblioteca.filter(b=>{
    const titulo=b.titulo?.toLowerCase().trim();
    const mg=!fg||(b.generos&&b.generos.includes(fg));
    const ma=!autor||b.autor===autor;
    if(soloOtro&&yo){
      // Solo libros que el otro ha leído y yo no
      const yoLeido=yo==="K"?leidosPorK:leidosPorP;
      return mg&&ma&&leidosPorOtro.has(titulo)&&!yoLeido.has(titulo);
    }
    return mg&&ma&&!leidosSet.has(titulo);
  }),[biblioteca,leidosSet,leidosPorK,leidosPorP,fg,autor,soloOtro,yo]);
  function spin(){if(!pool.length)return;setSpinning(true);setRec(null);setTimeout(()=>{setRec(pool[Math.floor(Math.random()*pool.length)]);setSpinning(false);},700);}
  return <div>
    <SH title="Libro Aleatorio" sub="Déjate sorprender"/>
    <div style={{ background:C.medCyan,borderRadius:10,padding:14,marginBottom:20 }}>
      <div style={{ fontSize:11,color:"#8cc",marginBottom:8 }}>¿Quién eres?</div>
      <div style={{ display:"flex",gap:8,marginBottom:14 }}>
        {[["","👥 Ambos"],["K","👩 Kiara"],["P","👨 Pablo"]].map(([v,label])=>(
          <button key={v} onClick={()=>{setYo(v);setSoloOtro(false);setRec(null);}}
            style={{ padding:"7px 16px",borderRadius:20,border:`1px solid ${yo===v?(v==="K"?C.K:v==="P"?C.P:C.deepCyan):"#1a5a58"}`,background:yo===v?(v==="K"?`${C.K}22`:v==="P"?`${C.P}22`:`${C.deepCyan}22`):"transparent",color:yo===v?(v==="K"?C.K:v==="P"?C.P:C.deepCyan):"#8cc",fontSize:12,cursor:"pointer" }}>
            {label}
          </button>
        ))}
      </div>
      {yo&&<label style={{ display:"flex",alignItems:"center",gap:8,fontSize:12,color:"#8cc",cursor:"pointer",marginBottom:4 }}>
        <input type="checkbox" checked={soloOtro} onChange={e=>setSoloOtro(e.target.checked)} style={{ accentColor:C.deepCyan }}/>
        Solo libros que {yo==="K"?"Pablo":"Kiara"} ya ha leído (y yo no)
      </label>}
    </div>
    <div style={{ display:"flex",gap:8,marginBottom:20,flexWrap:"wrap" }}>
      <select value={fg} onChange={e=>setFg(e.target.value)} style={sS}><option value="">Cualquier género</option>{GENEROS_LIST.map(g=><option key={g}>{g}</option>)}</select>
      <select value={autor} onChange={e=>setAutor(e.target.value)} style={sS}><option value="">Cualquier autor</option>{autores.map(a=><option key={a}>{a}</option>)}</select>
      <span style={{ color:"#8cc",fontSize:11,alignSelf:"center" }}>{pool.length} disponibles</span>
    </div>
    <div style={{ textAlign:"center",marginBottom:28 }}>
      <button onClick={spin} disabled={!pool.length||spinning} style={{ background:pool.length?C.deepCyan:"#1a4a48",color:C.darkCyan,border:"none",padding:"15px 50px",borderRadius:30,fontSize:15,fontWeight:900,cursor:pool.length?"pointer":"not-allowed",fontFamily:"Georgia,serif",letterSpacing:2,opacity:pool.length?1:0.5 }}>
        {spinning?"🎲 ...":"🎲  ¡Recomiéndame uno!"}
      </button>
    </div>
    {rec&&!spinning&&<div style={{ background:C.medCyan,borderRadius:14,padding:24,maxWidth:420,margin:"0 auto",textAlign:"center",border:`2px solid ${C.deepCyan}` }}>
      <div style={{ fontSize:36,marginBottom:10 }}>📖</div>
      <div style={{ fontSize:20,fontWeight:900,color:C.medOrange,marginBottom:6 }}>{rec.titulo}</div>
      <div style={{ fontSize:13,color:"#aad4d0",marginBottom:12 }}>{rec.autor}</div>
      <GenreTags generos={rec.generos}/>
      {rec.paginas&&<div style={{ fontSize:11,color:"#8cc",marginTop:10 }}>{rec.paginas} páginas</div>}
    </div>}
    {!pool.length&&<div style={{ textAlign:"center",color:"#8cc",padding:24 }}>🎉 ¡No quedan libros con esos filtros!</div>}
  </div>;
}

function ComprarPage({leidos}) {
  const list=useMemo(()=>leidos.filter(b=>b.formato==="Ebook"&&b.total>=7).sort((a,b)=>b.total-a.total),[leidos]);
  return <div>
    <SH title="Lista de Compra" sub="Ebooks leídos con nota ≥ 7 → candidatos a comprar en papel"/>
    {!list.length?<Empty msg="Ningún ebook supera el 7 aún"/>:
    <div style={{ display:"grid",gridTemplateColumns:"repeat(auto-fill,minmax(270px,1fr))",gap:12 }}>
      {list.map(b=><div key={b.id} style={{ background:C.medCyan,borderRadius:10,padding:14,border:`1px solid ${C.medOrange}22` }}>
        <div style={{ display:"flex",justifyContent:"space-between",alignItems:"flex-start" }}>
          <div style={{ flex:1,minWidth:0 }}>
            <div style={{ fontSize:13,fontWeight:700,color:C.medOrange,marginBottom:3,overflow:"hidden",textOverflow:"ellipsis",whiteSpace:"nowrap" }}>{b.titulo}</div>
            <div style={{ fontSize:11,color:"#aad4d0",marginBottom:8 }}>{b.autor}</div>
            <GenreTags generos={b.generos}/>
          </div>
          <div style={{ textAlign:"center",marginLeft:10,flexShrink:0 }}>
            <div style={{ fontSize:24,fontWeight:900,color:C.deepCyan }}>{b.total}</div>
            <div style={{ fontSize:9,color:"#8cc" }}>/10</div>
          </div>
        </div>
        <div style={{ marginTop:10 }}><Stars value={b.total}/></div>
        <div style={{ fontSize:10,color:"#8cc",marginTop:6 }}>
          {b.lector==="K"?"👩 Kiara":"👨 Pablo"} · {b.mesLeido}
        </div>
      </div>)}
    </div>}
  </div>;
}

function BibFormModal({book,onSave,onClose}) {
  const [form,setForm]=useState(book||{titulo:"",autor:"",generos:[],paginas:""});
  const set=(k,v)=>setForm(f=>({...f,[k]:v}));
  return <Modal title={book?"Editar libro":"Añadir a biblioteca"} onClose={onClose}>
    <FL label="Título *"><input value={form.titulo} onChange={e=>set("titulo",e.target.value)} style={iS}/></FL>
    <FL label="Autor"><input value={form.autor||""} onChange={e=>set("autor",e.target.value)} style={iS}/></FL>
    <FL label="Páginas"><input type="number" value={form.paginas||""} onChange={e=>set("paginas",e.target.value)} style={iS}/></FL>
    <FL label="Géneros (puede ser varios)"><GenreMultiSelect value={form.generos||[]} onChange={v=>set("generos",v)}/></FL>
    <div style={{ display:"flex",gap:8,justifyContent:"flex-end",marginTop:16 }}>
      <Btn label="Cancelar" onClick={onClose} secondary/><Btn label="Guardar" onClick={()=>{if(!form.titulo)return alert("Título obligatorio");onSave(form);}}/>
    </div>
  </Modal>;
}

function LeidoFormModal({book,biblioteca,onSave,onClose}) {
  const [form,setForm]=useState(book||{titulo:"",autor:"",generos:[],formato:"Ebook",lector:"K",mesLeido:"Enero",paginas:"",personaje:0,prosa:0,trama:0,aprendizaje:0,entretenimiento:0,total:0});
  const set=(k,v)=>setForm(f=>({...f,[k]:v}));
  const calcT=()=>{const v=[form.personaje,form.prosa,form.trama,form.aprendizaje,form.entretenimiento].map(Number).filter(x=>x>0);return v.length?parseFloat((v.reduce((a,b)=>a+b,0)/v.length).toFixed(1)):0;};
  function autofill(val){set("titulo",val);const f=biblioteca.find(b=>b.titulo?.toLowerCase()===val.toLowerCase());if(f)setForm(p=>({...p,titulo:f.titulo,autor:f.autor||p.autor,generos:f.generos||p.generos,paginas:f.paginas||p.paginas}));}
  return <Modal title={book?"Editar lectura":"Registrar lectura"} onClose={onClose} wide>
    <div style={{ display:"grid",gridTemplateColumns:"1fr 1fr",gap:10,marginBottom:10 }}>
      <FL label="Título *" wide>
        <input list="btitles" value={form.titulo} onChange={e=>autofill(e.target.value)} style={iS} placeholder="Escribe o elige de la biblioteca"/>
        <datalist id="btitles">{biblioteca.map(b=><option key={b.id} value={b.titulo}/>)}</datalist>
      </FL>
      <FL label="Autor"><input value={form.autor||""} onChange={e=>set("autor",e.target.value)} style={iS}/></FL>
      <FL label="Lector"><select value={form.lector} onChange={e=>set("lector",e.target.value)} style={sS}><option value="K">👩 Kiara</option><option value="P">👨 Pablo</option></select></FL>
      <FL label="Formato"><select value={form.formato} onChange={e=>set("formato",e.target.value)} style={sS}>{FORMATOS.map(f=><option key={f}>{f}</option>)}</select></FL>
      <FL label="Mes leído"><select value={form.mesLeido} onChange={e=>set("mesLeido",e.target.value)} style={sS}>{MESES.map(m=><option key={m}>{m}</option>)}</select></FL>
      <FL label="Páginas"><input type="number" value={form.paginas||""} onChange={e=>set("paginas",e.target.value)} style={iS}/></FL>
    </div>
    <FL label="Géneros (puede ser varios)"><GenreMultiSelect value={form.generos||[]} onChange={v=>set("generos",v)}/></FL>
    <div style={{ background:"rgba(0,0,0,0.25)",borderRadius:8,padding:12,marginTop:12 }}>
      <div style={{ fontSize:12,color:C.medOrange,marginBottom:10,fontWeight:700 }}>Puntuación (0–10)</div>
      <div style={{ display:"grid",gridTemplateColumns:"1fr 1fr",gap:8 }}>
        {[["personaje","Personaje"],["prosa","Prosa"],["trama","Trama"],["aprendizaje","Aprendizaje"],["entretenimiento","Entretenimiento"]].map(([k,label])=>(
          <div key={k}><div style={{ fontSize:11,color:"#8cc",marginBottom:3 }}>{label}: <span style={{ color:C.medOrange }}>{form[k]}</span></div>
          <input type="range" min={0} max={10} step={0.5} value={form[k]} onChange={e=>set(k,parseFloat(e.target.value))} style={{ width:"100%",accentColor:C.deepCyan }}/></div>
        ))}
      </div>
      <div style={{ marginTop:10,fontSize:14,color:C.deepCyan,fontWeight:900 }}>Media: {calcT()} / 10</div>
    </div>
    <div style={{ display:"flex",gap:8,justifyContent:"flex-end",marginTop:14 }}>
      <Btn label="Cancelar" onClick={onClose} secondary/><Btn label="Guardar" onClick={()=>{if(!form.titulo)return alert("Título obligatorio");onSave({...form,total:calcT()});}}/>
    </div>
  </Modal>;
}

// ── Root ───────────────────────────────────────────────────────────────────

const NAV=[{id:"biblioteca",icon:"📚",label:"Biblioteca"},{id:"leidos",icon:"✅",label:"Leídos"},{id:"estadisticas",icon:"📊",label:"Stats"},{id:"aleatorio",icon:"🎲",label:"Aleatorio"},{id:"comprar",icon:"🛒",label:"Comprar"}];
function useSupabaseTable(tableName, seedData, fromDb, toDb) {
  const [data, setData] = useState([]);
  const [loaded, setLoaded] = useState(false);

  async function reload() {
    const { data: rows } = await supabase.from(tableName).select('*').order('id');
    if (rows) setData(rows.map(fromDb));
    return rows;
  }

  useEffect(() => {
    (async () => {
      const { data: rows } = await supabase.from(tableName).select('*').order('id');
      if (rows && rows.length === 0 && seedData.length > 0) {
        for (let i = 0; i < seedData.length; i += 50) {
          const chunk = seedData.slice(i, i + 50).map(({ id, ...rest }) => rest);
          await supabase.from(tableName).insert(chunk);
        }
        await reload();
      } else if (rows) {
        setData(rows.map(fromDb));
      }
      setLoaded(true);
    })();
  }, []);

  async function save(newArray) {
    const oldIds = new Set(data.map(x => x.id).filter(Boolean));

    // Borrar eliminados
    const toDelete = [...oldIds].filter(id => !newArray.find(x => x.id === id));
    for (const id of toDelete) {
      await supabase.from(tableName).delete().eq('id', id);
    }

    // Insertar nuevos
    const toInsert = newArray.filter(x => !x.id || !oldIds.has(x.id));
    for (const item of toInsert) {
      const row = toDb(item);
      delete row.id;
      await supabase.from(tableName).insert(row);
    }

    // Actualizar existentes
    const toUpdate = newArray.filter(x => x.id && oldIds.has(x.id));
    for (const item of toUpdate) {
      const row = toDb(item);
      const id = row.id;
      delete row.id;
      await supabase.from(tableName).update(row).eq('id', id);
    }

    await reload();
  }

  return [data, save, loaded];
}
export default function App() {
  const [page,setPage]=useState("biblioteca");
  const [leidos,saveLeidos,lL]=useSupabaseTable("leidos",SEED_LEIDOS,fromDbLeido,toDbLeido);
  const [biblioteca,saveBiblioteca,bL]=useSupabaseTable("biblioteca",SEED_BIBLIOTECA,r=>r,toDbBiblioteca);

  if(!lL||!bL) return (
    <div style={{ background:C.darkCyan,minHeight:"100vh",display:"flex",alignItems:"center",justifyContent:"center" }}>
      <div style={{ textAlign:"center" }}>
        <div style={{ fontSize:32 }}>📚</div>
        <div style={{ color:C.medOrange,fontSize:18,fontFamily:"Georgia,serif",letterSpacing:2,marginTop:8 }}>K & P</div>
        <div style={{ color:"#8cc",fontSize:12,marginTop:6 }}>Cargando...</div>
      </div>
    </div>
  );

  const props={leidos,saveLeidos,biblioteca,saveBiblioteca};
  return (
    <div style={{ fontFamily:"Georgia,serif",background:C.darkCyan,minHeight:"100vh",color:C.paleOrange,display:"flex",flexDirection:"column" }}>
      <div style={{ background:C.medCyan,padding:"14px 20px",borderBottom:`2px solid ${C.deepCyan}22`,display:"flex",alignItems:"center",justifyContent:"space-between",flexShrink:0 }}>
        <div>
          <div style={{ fontSize:10,letterSpacing:5,color:C.deepCyan,textTransform:"uppercase" }}>— BIBLIOTECA —</div>
          <h1 style={{ margin:"2px 0 0",fontSize:24,color:C.medOrange,letterSpacing:3 }}>K & P</h1>
        </div>
        <div style={{ display:"flex",gap:8 }}>
          <span style={{ background:C.K,color:C.darkCyan,padding:"4px 14px",borderRadius:20,fontSize:12,fontWeight:700 }}>Kiara</span>
          <span style={{ background:C.P,color:C.darkCyan,padding:"4px 14px",borderRadius:20,fontSize:12,fontWeight:700 }}>Pablo</span>
        </div>
      </div>
      <div style={{ display:"flex",background:C.medCyan,borderBottom:`1px solid #1a4a48`,overflowX:"auto",flexShrink:0 }}>
        {NAV.map(n=><button key={n.id} onClick={()=>setPage(n.id)} style={{ padding:"11px 18px",background:page===n.id?C.darkCyan:"transparent",color:page===n.id?C.medOrange:C.paleOrange,border:"none",cursor:"pointer",fontSize:12,fontFamily:"Georgia,serif",borderBottom:page===n.id?`2px solid ${C.deepCyan}`:"2px solid transparent",whiteSpace:"nowrap" }}>{n.icon} {n.label}</button>)}
      </div>
      <div style={{ flex:1,overflowY:"auto",padding:"20px 16px" }}>
        <div style={{ maxWidth:960,margin:"0 auto" }}>
          {page==="biblioteca"&&<BibliotecaPage {...props}/>}
          {page==="leidos"&&<LeidosPage {...props}/>}
          {page==="estadisticas"&&<EstadisticasPage leidos={leidos}/>}
          {page==="aleatorio"&&<AleatorioPage biblioteca={biblioteca} leidos={leidos}/>}
          {page==="comprar"&&<ComprarPage leidos={leidos}/>}
        </div>
      </div>
    </div>
  );
}
