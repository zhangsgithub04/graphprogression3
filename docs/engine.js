/* Exact simultaneous dynamics on labeled simple undirected graphs. */
(function(root){
function transitions(n,pairs,mode){
 const count=2**pairs.length,next=new Int32Array(count),indeg=new Int32Array(count);
 for(let s=0;s<count;s++){
  const d=new Uint8Array(n);
  pairs.forEach(([u,v],i)=>{if(s&(1<<i)){d[u]++;d[v]++;}});
  let t=s;
  pairs.forEach(([u,v],i)=>{if(d[u]!==d[v])return;const bit=1<<i;
   if(mode==='u')t^=bit;
   else if(mode==='u+')t|=bit;
   else t&=~bit;
  });
  next[s]=t;indeg[t]++;
 }
 const queue=[];
 for(let s=0;s<count;s++)if(!indeg[s])queue.push(s);
 for(let i=0;i<queue.length;i++){const t=next[queue[i]];if(--indeg[t]===0)queue.push(t);}
 const basin=new Int32Array(count).fill(-1),depth=new Int32Array(count),cycles=[];
 for(let s=0;s<count;s++)if(indeg[s]&&basin[s]<0){const id=cycles.length,c=[];let t=s;do{basin[t]=id;c.push(t);t=next[t];}while(t!==s);cycles.push(c);}
 for(let i=queue.length-1;i>=0;i--){const s=queue[i];basin[s]=basin[next[s]];depth[s]=depth[next[s]]+1;}
 const sizes=new Int32Array(cycles.length);for(let s=0;s<count;s++)sizes[basin[s]]++;
 return{next,basin,depth,cycles,sizes,maxDepth:Math.max(...depth)};
}
function analyze(n,mode='u'){
 if(!Number.isInteger(n)||n<1||n>6)throw Error('Choose an integer from 1 to 6.');
 if(!['u','u+','u-'].includes(mode))throw Error('Choose u, u+, or u-.');
 const pairs=[];for(let u=0;u<n;u++)for(let v=u+1;v<n;v++)pairs.push([u,v]);
 const count=2**pairs.length,plus=transitions(n,pairs,'u+'),minus=transitions(n,pairs,'u-');
 const active=mode==='u+'?plus:mode==='u-'?minus:transitions(n,pairs,'u');
 const plusStable=new Int32Array(count),minusStable=new Int32Array(count);
 let plusCompleteCount=0,minusCollapsibleCount=0;
 for(let s=0;s<count;s++){
  plusStable[s]=plus.cycles[plus.basin[s]][0];minusStable[s]=minus.cycles[minus.basin[s]][0];
  if(plusStable[s]===count-1)plusCompleteCount++;
  if(minusStable[s]===0)minusCollapsibleCount++;
 }
 return{n,mode,pairs,count,...active,plusStable,minusStable,plusDepth:plus.depth,minusDepth:minus.depth,plusCompleteCount,minusCollapsibleCount};
}
if(typeof module!=='undefined')module.exports={analyze};else root.GraphEngine={analyze};
})(typeof self!=='undefined'?self:globalThis);
