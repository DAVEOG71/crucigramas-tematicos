export const normalize = value => value.normalize('NFD').replace(/[\u0300-\u036f]/g,'').replace(/[^A-Za-zÑñ]/g,'').toUpperCase();

const emptyGrid = size => Array.from({length:size},()=>Array(size).fill(null));

function canPlace(grid, word, row, col, vertical) {
  const size=grid.length, dr=vertical?1:0, dc=vertical?0:1;
  if(row<0||col<0||row+dr*(word.length-1)>=size||col+dc*(word.length-1)>=size)return false;
  const before=[row-dr,col-dc], after=[row+dr*word.length,col+dc*word.length];
  if(before[0]>=0&&before[1]>=0&&before[0]<size&&before[1]<size&&grid[before[0]][before[1]])return false;
  if(after[0]>=0&&after[1]>=0&&after[0]<size&&after[1]<size&&grid[after[0]][after[1]])return false;
  let crosses=0;
  for(let i=0;i<word.length;i++){
    const r=row+dr*i,c=col+dc*i,current=grid[r][c];
    if(current&&current!==word[i])return false;
    if(current===word[i])crosses++;
    if(!current){
      const neighbors=vertical?[[r,c-1],[r,c+1]]:[[r-1,c],[r+1,c]];
      if(neighbors.some(([nr,nc])=>nr>=0&&nc>=0&&nr<size&&nc<size&&grid[nr][nc]))return false;
    }
  }
  return crosses>0;
}

function candidates(grid, word) {
  const out=[];
  for(let r=0;r<grid.length;r++)for(let c=0;c<grid.length;c++)if(grid[r][c]){
    for(let i=0;i<word.length;i++)if(word[i]===grid[r][c]){
      for(const vertical of [false,true]){
        const row=r-(vertical?i:0),col=c-(vertical?0:i);
        if(canPlace(grid,word,row,col,vertical))out.push({row,col,vertical,score:1+word.length*.02});
      }
    }
  }
  return out;
}

function place(grid, word, p){for(let i=0;i<word.length;i++)grid[p.row+(p.vertical?i:0)][p.col+(p.vertical?0:i)]=word[i]}

function cropAndCenter(grid, placements, size){
  const used=[];for(let r=0;r<grid.length;r++)for(let c=0;c<grid.length;c++)if(grid[r][c])used.push([r,c]);
  const minR=Math.min(...used.map(x=>x[0])),maxR=Math.max(...used.map(x=>x[0])),minC=Math.min(...used.map(x=>x[1])),maxC=Math.max(...used.map(x=>x[1]));
  const offR=Math.floor((size-(maxR-minR+1))/2)-minR,offC=Math.floor((size-(maxC-minC+1))/2)-minC;
  const result=emptyGrid(size);for(const [r,c] of used)result[r+offR][c+offC]=grid[r][c];
  return {grid:result,placements:placements.map(p=>({...p,row:p.row+offR,col:p.col+offC}))};
}

export function generateCrossword(entries,size=20,attempts=220){
  const clean=entries.map(e=>({...e,answer:normalize(e.answer)})).filter(e=>e.answer.length>=3&&e.answer.length<=size);
  let best=null;
  for(let run=0;run<attempts;run++){
    const grid=emptyGrid(size),ordered=[...clean].sort((a,b)=>b.answer.length-a.answer.length||Math.random()-.5),placements=[];
    const first=ordered.shift();if(!first)throw new Error('No hay palabras válidas.');
    const p0={...first,row:Math.floor(size/2),col:Math.floor((size-first.answer.length)/2),vertical:false};place(grid,first.answer,p0);placements.push(p0);
    let pending=ordered,progress=true;
    while(progress&&pending.length){progress=false;const next=[];
      for(const entry of pending){const options=candidates(grid,entry.answer);if(!options.length){next.push(entry);continue}options.sort((a,b)=>b.score-a.score||Math.random()-.5);const p={...entry,...options[0]};place(grid,entry.answer,p);placements.push(p);progress=true}pending=next;
    }
    const score=placements.length*100+placements.reduce((n,p)=>n+p.answer.length,0);
    if(!best||score>best.score)best={grid,placements,score};
  }
  const centered=cropAndCenter(best.grid,best.placements,size);
  return numberPuzzle(centered.grid,centered.placements);
}

function numberPuzzle(grid,placements){
  const starts=new Map(),sorted=[...placements].sort((a,b)=>a.row-b.row||a.col-b.col);
  let n=1;for(const p of sorted){const key=`${p.row},${p.col}`;if(!starts.has(key))starts.set(key,n++);p.number=starts.get(key)}
  return {grid,placements,across:placements.filter(p=>!p.vertical).sort((a,b)=>a.number-b.number),down:placements.filter(p=>p.vertical).sort((a,b)=>a.number-b.number),numbers:Object.fromEntries(starts)};
}

export function validatePuzzle(puzzle){
  const used=puzzle.grid.flat().filter(Boolean).length;
  const crossings=puzzle.placements.reduce((total,p)=>total+[...p.answer].filter((_,i)=>{
    const r=p.row+(p.vertical?i:0),c=p.col+(p.vertical?0:i);
    return puzzle.placements.filter(q=>q!==p&&r>=q.row&&c>=q.col&&(q.vertical?c===q.col&&r<q.row+q.answer.length:r===q.row&&c<q.col+q.answer.length)).length;
  }).length,0)/2;
  return {words:puzzle.placements.length,crossings,whiteCells:used};
}
