
import {useState} from 'react'
import {supabase} from '../lib/supabase'
import {useRouter} from 'next/router'

export default function Login(){
  const [email,setEmail]=useState('')
  const [pass,setPass]=useState('')
  const [name,setName]=useState('')
  const [mode,setMode]=useState('login')
  const [err,setErr]=useState('')
  const r=useRouter()

  async function submit(){
    setErr('')
    if(mode==='signup'){
      const {data,error}=await supabase.auth.signUp({email,password:pass,options:{data:{name}}})
      if(error) return setErr(error.message)
      await supabase.from('profiles').upsert({id:data.user.id,name})
    }else{
      const {error}=await supabase.auth.signInWithPassword({email,password:pass})
      if(error) return setErr(error.message)
    }
    r.push('/')
  }

  return <div style={{minHeight:'100vh',display:'flex',alignItems:'center',justifyContent:'center',background:'linear-gradient(#fdfcff,#f6f1ff)',fontFamily:'system-ui'}}>
    <div style={{background:'white',padding:36,borderRadius:20,width:380,boxShadow:'0 12px 30px rgba(0,0,0,.08)'}}>
      <div style={{display:'flex',alignItems:'center',gap:10,marginBottom:20}}><img src="/logo.png" height="32"/><b>LOYAH AI</b></div>
      <h2 style={{margin:'0 0 20px'}}>{mode==='login'?'Accedi':'Crea account'}</h2>
      {mode==='signup'&&<input placeholder="Nome" value={name} onChange={e=>setName(e.target.value)} style={{width:'100%',padding:12,marginBottom:10,border:'1px solid #ddd',borderRadius:10}}/>}
      <input placeholder="Email" value={email} onChange={e=>setEmail(e.target.value)} style={{width:'100%',padding:12,marginBottom:10,border:'1px solid #ddd',borderRadius:10}}/>
      <input type="password" placeholder="Password" value={pass} onChange={e=>setPass(e.target.value)} style={{width:'100%',padding:12,marginBottom:14,border:'1px solid #ddd',borderRadius:10}}/>
      {err&&<div style={{color:'crimson',fontSize:13,marginBottom:10}}>{err}</div>}
      <button onClick={submit} style={{width:'100%',padding:12,background:'#7b5cff',color:'white',border:0,borderRadius:10,fontWeight:600}}>{mode==='login'?'Entra':'Registrati'}</button>
      <div style={{marginTop:14,fontSize:14,textAlign:'center',color:'#666',cursor:'pointer'}} onClick={()=>setMode(mode==='login'?'signup':'login')}>
        {mode==='login'?'Non hai account? Registrati':'Hai già account? Accedi'}
      </div>
    </div>
  </div>
}
