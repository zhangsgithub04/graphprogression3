const assert=require('node:assert/strict');
const {analyze}=require('../dist/engine.js');
// Independent adjacency-matrix reference: calculate all degrees, then update all pairs.
function reference(n,pairs,s,mode){
 const matrix=Array.from({length:n},()=>Array(n).fill(0));
 pairs.forEach(([u,v],i)=>{if(s&(1<<i))matrix[u][v]=matrix[v][u]=1});
 const degrees=matrix.map(row=>row.reduce((a,b)=>a+b,0));let t=0;
 pairs.forEach(([u,v],i)=>{const old=matrix[u][v];let edge=old;
  if(degrees[u]===degrees[v])edge=mode==='u'?1-old:mode==='u+'?1:0;
  if(edge)t+=2**i;
 });return t;
}
for(let n=1;n<=6;n++){
 const datasets=Object.fromEntries(['u','u+','u-'].map(mode=>[mode,analyze(n,mode)]));
 for(const [mode,a]of Object.entries(datasets)){
  assert.equal(a.sizes.reduce((x,y)=>x+y,0),a.count);
  for(const c of a.cycles){if(mode!=='u')assert.equal(c.length,1);c.forEach((s,i)=>assert.equal(a.next[s],c[(i+1)%c.length]));}
  for(let s=0;s<a.count;s++){
   const t=a.next[s];assert.equal(t,reference(n,a.pairs,s,mode));
   assert.equal(a.basin[s],a.basin[t]);
   if(a.depth[s])assert.equal(a.depth[s],a.depth[t]+1);
   if(mode==='u+')assert.equal(s&t,s,'u+ may only add');
   if(mode==='u-')assert.equal(s&t,t,'u- may only remove');
   if(mode!=='u')assert.ok(a.depth[s]<=a.pairs.length);
   for(const [m,stable,steps]of [['u+',a.plusStable[s],a.plusDepth[s]],['u-',a.minusStable[s],a.minusDepth[s]]]){
    const target=datasets[m];assert.equal(target.next[stable],stable);
    assert.equal(target.cycles[target.basin[s]][0],stable);assert.equal(steps,target.depth[s]);
   }
  }
 }
 const plus=datasets['u+'],minus=datasets['u-'],mask=plus.count-1;
 for(let s=0;s<plus.count;s++){
  assert.equal(minus.next[mask^s],mask^plus.next[s]);
  assert.equal(minus.minusStable[mask^s],mask^plus.plusStable[s]);
 }
 assert.equal(plus.plusCompleteCount,minus.minusCollapsibleCount);
 console.log(JSON.stringify({n,states:plus.count,plusStable:plus.cycles.length,minusStable:minus.cycles.length,plusComplete:plus.plusCompleteCount,minusCollapsible:minus.minusCollapsibleCount,plusMaxSteps:plus.maxDepth,minusMaxSteps:minus.maxDepth}));
}
// Already complete/empty inputs qualify with zero steps. Check nontrivial positive and negative classifications.
const a=analyze(4,'u+');assert.equal(a.plusStable[63],63);assert.equal(a.plusDepth[63],0);assert.equal(a.minusStable[0],0);assert.equal(a.minusDepth[0],0);
assert.equal(a.plusStable[7],63); // Empty-degree-class leaves first become a clique, then K4.
// P3 plus an isolate stabilizes short of K4 under u+; the star remains unchanged under u-.
assert.notEqual(a.plusStable[5],63);assert.equal(a.minusStable[7],7);
assert.throws(()=>analyze(7));assert.throws(()=>analyze(4,'bad'));
console.log('All exact-transition, monotonicity, fixed-point, property, and complement-duality checks passed.');
