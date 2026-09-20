import {generateCrossword,validatePuzzle} from './engine.js';
const $=id=>document.getElementById(id);let current=null,showSolution=false,lastSeed='';

async function generate(){
  const theme=$('theme').value.trim();if(!theme)return setStatus('Escribe primero un tema.',true);
  setBusy(true);setStatus('La IA prepara las palabras y el motor busca la mejor cuadrícula…');
  try{
    const res=await fetch('/api/generar-palabras',{method:'POST',headers:{'content-type':'application/json'},body:JSON.stringify({theme,count:Number($('wordCount').value),difficulty:$('difficulty').value,avoid:lastSeed})});
    const data=await res.json();if(!res.ok)throw new Error(data.error||'No se pudo conectar con la IA.');
    lastSeed=data.entries.map(x=>x.answer).join(',');
    current=generateCrossword(data.entries,Number($('size').value));showSolution=false;render();
    const q=validatePuzzle(current);setStatus(`Generado: ${q.words} palabras, ${q.crossings} cruces y ${q.whiteCells} casillas útiles.`);
  }catch(e){setStatus(e.message,true)}finally{setBusy(false)}
}

function render(){
  $('result').classList.remove('hidden');$('puzzleTitle').textContent=$('theme').value;$('grid').replaceChildren();
  const size=current.grid.length;$('grid').style.gridTemplateColumns=`repeat(${size},1fr)`;
  for(let r=0;r<size;r++)for(let c=0;c<size;c++){
    const cell=document.createElement('div'),letter=current.grid[r][c];cell.className='cell'+(letter?'':' block');
    if(letter){const key=`${r},${c}`;if(current.numbers[key]){const s=document.createElement('span');s.className='number';s.textContent=current.numbers[key];cell.append(s)}const input=document.createElement('input');input.maxLength=1;input.autocomplete='off';input.setAttribute('aria-label',`Fila ${r+1}, columna ${c+1}`);input.value=showSolution?letter:'';cell.append(input)}$('grid').append(cell);
  }
  fillClues('across',current.across);fillClues('down',current.down);const q=validatePuzzle(current);$('quality').innerHTML=`${q.words} PALABRAS<br>${q.crossings} CRUCES`;$('toggleSolution').disabled=false;$('print').disabled=false;$('toggleSolution').textContent=showSolution?'Ocultar solución':'Mostrar solución';
}
function fillClues(id,list){const ol=$(id);ol.replaceChildren();for(const item of list){const li=document.createElement('li');li.innerHTML=`<span class="clue-number">${item.number}.</span>${escapeHtml(item.clue)}`;ol.append(li)}}
function escapeHtml(s){const d=document.createElement('div');d.textContent=s;return d.innerHTML}
function setBusy(v){$('generate').disabled=v;$('regenerate').disabled=v}
function setStatus(text,error=false){$('status').textContent=text;$('status').classList.toggle('error',error)}
$('generate').addEventListener('click',generate);$('regenerate').addEventListener('click',generate);$('toggleSolution').addEventListener('click',()=>{showSolution=!showSolution;render()});$('print').addEventListener('click',()=>window.print());$('theme').addEventListener('keydown',e=>{if(e.key==='Enter')generate()});
