import test from 'node:test';import assert from 'node:assert/strict';import {normalize,generateCrossword,validatePuzzle} from '../public/engine.js';
test('normaliza tildes, espacios y signos',()=>assert.equal(normalize('Árbol de Gernika'),'ARBOLDEGERNIKA'));
test('genera una cuadrícula conectada con numeración',()=>{
 const words=['VELAZQUEZ','GOYA','MURILLO','PICASSO','SOROLLA','DALÍ','ZURBARAN','MENINAS','PRADO','GUERNICA','RETRATO','LIENZO'].map((answer,i)=>({answer,clue:`Pista ${i}`}));
 const puzzle=generateCrossword(words,15,40),q=validatePuzzle(puzzle);assert.equal(puzzle.grid.length,15);assert.ok(q.words>=7);assert.ok(q.crossings>=6);assert.ok(puzzle.across.length>0);assert.ok(puzzle.down.length>0);
});
