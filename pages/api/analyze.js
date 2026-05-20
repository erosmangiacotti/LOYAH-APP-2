
export default async function handler(req,res){
  const {text,profile} = req.body||{}
  const sys = `Sei LOYAH AI. Analizza in italiano. Rispondi JSON: {"pattern":"max 3 parole","advice":"1 frase empatica","scores":{"availability":1-10,"consistency":1-10,"respect":1-10}}`
  try{
    const r = await fetch('https://api.openai.com/v1/chat/completions',{
      method:'POST',
      headers:{'Authorization':`Bearer ${process.env.OPENAI_API_KEY}`,'Content-Type':'application/json'},
      body:JSON.stringify({model:'gpt-4o-mini',messages:[{role:'system',content:sys},{role:'user',content:text}],temperature:0.4,response_format:{type:'json_object'}})
    })
    const j = await r.json()
    res.json(JSON.parse(j.choices[0].message.content))
  }catch(e){
    res.json({pattern:'Conversazione',advice:'Osserva con calma per qualche giorno.',scores:{availability:5,consistency:5,respect:5}})
  }
}
