const json=(status,body)=>({statusCode:status,headers:{'content-type':'application/json; charset=utf-8','cache-control':'no-store'},body:JSON.stringify(body)});
export async function handler(event){
  if(event.httpMethod!=='POST')return json(405,{error:'Método no permitido.'});
  if(!process.env.OPENAI_API_KEY)return json(503,{error:'Falta configurar OPENAI_API_KEY en el servidor.'});
  try{
    const {theme,count=40,difficulty='media',avoid=''}=JSON.parse(event.body||'{}');
    if(!theme||typeof theme!=='string'||theme.length>120)return json(400,{error:'Tema no válido.'});
    const amount=Math.max(18,Math.min(55,Number(count)||40));
    const prompt=`Crea ${amount} entradas para un crucigrama en español sobre: "${theme}". Dificultad: ${difficulty}. Responde solo JSON conforme al esquema. Las respuestas deben ser palabras o expresiones sin artículos, de 3 a 20 letras al quitar espacios y tildes; evita siglas oscuras, plurales forzados y pistas ambiguas. Cada definición debe ser breve, precisa y no contener la respuesta. Evita repetir, cuando sea posible, estas respuestas usadas antes: ${String(avoid).slice(0,1200)}.`;
    const response=await fetch('https://api.openai.com/v1/responses',{method:'POST',headers:{authorization:`Bearer ${process.env.OPENAI_API_KEY}`,'content-type':'application/json'},body:JSON.stringify({model:process.env.OPENAI_MODEL||'gpt-5-mini',input:prompt,text:{format:{type:'json_schema',name:'crossword_entries',strict:true,schema:{type:'object',properties:{entries:{type:'array',minItems:amount,maxItems:amount,items:{type:'object',properties:{answer:{type:'string'},clue:{type:'string'}},required:['answer','clue'],additionalProperties:false}}},required:['entries'],additionalProperties:false}}}})});
    const data=await response.json();if(!response.ok)throw new Error(data.error?.message||'Error de OpenAI.');
    const text=data.output_text||data.output?.flatMap(x=>x.content||[]).find(x=>x.type==='output_text')?.text;
    const parsed=JSON.parse(text);return json(200,parsed);
  }catch(error){console.error(error);return json(500,{error:'No se pudieron generar las palabras. Inténtalo de nuevo.'})}
}
