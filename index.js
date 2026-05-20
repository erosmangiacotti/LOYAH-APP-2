
import {useEffect,useState} from 'react'
import {supabase} from '../lib/supabase'
import {useRouter} from 'next/router'

export default function Home(){
  const [user,setUser]=useState(null)
  const [profile,setProfile]=useState({name:''})
  const [entries,setEntries]=useState([])
  const [text,setText]=useState('')
  const [showNew,setShowNew]=useState(false)
  const r=useRouter()

  useEffect(()=>{
    supabase.auth.getSession().then(async ({data})=>{
      if(!data.session) return r.push('/login')
      setUser(data.session.user)
      const {data:p}=await supabase.from('profiles').select('name').eq('id',data.session.user.id).single()
      setProfile(p||{name:data.session.user.user_metadata.name||'Utente'})
      loadEntries(data.session.user.id)
    })
  },[])

  async function loadEntries(uid){
    const {data}=await supabase.from('entries').select('*').eq('user_id',uid).order('created_at',{ascending:false}).limit(20)
    setEntries(data||[])
  }

  async function analyze(){
    if(!text||!user) return
    const res = await fetch('/api/analyze',{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify({text,profile:{lang:'it'}})})
    const ai = await res.json()
    const entry = {
      user_id:user.id,
      title:ai.pattern||'Analisi',
      description:text.slice(0,200),
      tags:[ai.pattern],
      score:ai.scores?.availability||5,
      advice:ai.advice,
      pattern:ai.pattern
    }
    await supabase.from('entries').insert(entry)
    setText(''); setShowNew(false); loadEntries(user.id)
  }

  const clarity = entries.length? Math.round(entries.reduce((a,e)=>a+e.score,0)/entries.length*10) : 72
  const situations = entries.length

  if(!user) return null

  return <div style={{display:'flex',minHeight:'100vh',fontFamily:'Inter,system-ui',background:'#faf9fc',color:'#1e1b2e'}}>
    <aside style={{width:260,background:'white',borderRight:'1px solid #eee',padding:24,position:'fixed',height:'100vh'}}>
      <div style={{display:'flex',alignItems:'center',gap:10,marginBottom:30}}><img src="/logo.png" height="28"/><span style={{fontWeight:700}}>LOYAH AI</span></div>
      <div style={{fontSize:12,color:'#888',marginBottom:20}}>Clarity in every connection</div>
      {['Home','Diario','Pattern','Insight'].map((n,i)=><div key={n} style={{padding:'12px 14px',borderRadius:12,background:i===0?'#f3efff':'',marginBottom:6}}>{n}</div>)}
      <div style={{position:'absolute',bottom:20,left:24,right:24}}>
        <button onClick={async()=>{await supabase.auth.signOut();r.push('/login')}} style={{width:'100%',padding:10,border:'1px solid #ddd',background:'white',borderRadius:10}}>Esci</button>
        <div style={{display:'flex',alignItems:'center',gap:10,marginTop:12}}>
          <img src={`https://i.pravatar.cc/40?u=${user.email}`} style={{borderRadius:'50%'}}/>
          <div><div style={{fontWeight:600,fontSize:14}}>{profile.name}</div><div style={{fontSize:12,color:'#777'}}>{user.email}</div></div>
        </div>
      </div>
    </aside>

    <main style={{marginLeft:260,flex:1,padding:32}}>
      <div style={{display:'flex',justifyContent:'space-between',alignItems:'center',marginBottom:24}}>
        <div><h1 style={{margin:0}}>Ciao {profile.name} <span style={{color:'#b18aff'}}>♥</span></h1><div style={{color:'#777'}}>Come ti senti oggi?</div></div>
        <button onClick={()=>setShowNew(true)} style={{background:'#7b5cff',color:'white',border:0,padding:'12px 20px',borderRadius:12,fontWeight:600}}>+ Nuova Analisi</button>
      </div>

      <div style={{display:'grid',gridTemplateColumns:'1fr 1fr 1fr',gap:16,marginBottom:20}}>
        <div style={{background:'white',padding:20,borderRadius:16}}><div style={{color:'#666',fontSize:13}}>Clarity Score</div><div style={{fontSize:28,fontWeight:700}}>{clarity} <span style={{fontSize:16,color:'#999'}}>/100</span></div></div>
        <div style={{background:'white',padding:20,borderRadius:16}}><div style={{color:'#666',fontSize:13}}>Stato Emotivo</div><div style={{fontSize:22,fontWeight:700}}>Calma <span style={{color:'#22c55e'}}>●</span></div></div>
        <div style={{background:'white',padding:20,borderRadius:16}}><div style={{color:'#666',fontSize:13}}>Situazioni Tracciate</div><div style={{fontSize:28,fontWeight:700}}>{situations}</div></div>
      </div>

      <div style={{background:'white',padding:24,borderRadius:16}}>
        <h3 style={{marginTop:0}}>Il tuo diario</h3>
        {entries.length===0&&<div style={{color:'#888',padding:'20px 0'}}>Ancora nessuna analisi. Clicca "Nuova Analisi".</div>}
        {entries.map(e=><div key={e.id} style={{display:'flex',gap:14,padding:'14px 0',borderBottom:'1px solid #f0f0f0'}}>
          <div style={{width:40,height:40,borderRadius:12,background:'#f5f0ff',display:'flex',alignItems:'center',justifyContent:'center'}}>💬</div>
          <div style={{flex:1}}><div style={{fontSize:12,color:'#888'}}>{new Date(e.created_at).toLocaleString('it-IT')}</div><div style={{fontWeight:600}}>{e.title}</div><div style={{fontSize:13,color:'#666'}}>{e.description}</div></div>
          <div style={{fontWeight:700}}>{e.score}/10</div>
        </div>)}
      </div>
    </main>

    {showNew&&<div style={{position:'fixed',inset:0,background:'rgba(0,0,0,.4)',display:'flex',alignItems:'center',justifyContent:'center'}} onClick={()=>setShowNew(false)}>
      <div style={{background:'white',padding:28,borderRadius:20,width:520}} onClick={e=>e.stopPropagation()}>
        <h2>Nuova Analisi</h2>
        <textarea value={text} onChange={e=>setText(e.target.value)} placeholder="Racconta cosa è successo..." style={{width:'100%',height:120,padding:12,border:'1px solid #ddd',borderRadius:10}}/>
        <div style={{display:'flex',justifyContent:'flex-end',gap:10,marginTop:12}}>
          <button onClick={()=>setShowNew(false)} style={{padding:'10px 18px'}}>Annulla</button>
          <button onClick={analyze} style={{padding:'10px 18px',background:'#7b5cff',color:'white',border:0,borderRadius:10}}>Analizza</button>
        </div>
      </div>
    </div>}
  </div>
}
