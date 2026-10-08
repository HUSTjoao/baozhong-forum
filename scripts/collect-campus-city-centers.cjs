const fs = require('node:fs');
(async()=>{
 const root='https://geo.datav.aliyun.com/areas_v3/bound/';
 async function load(code){const response=await fetch(root+code+'_full.json',{signal:AbortSignal.timeout(14000)});if(!response.ok)throw Error(String(response.status));return response.json()}
 const national=await load(100000);const cities={};const provinces=national.features.filter(f=>f.properties.adcode!==100000);
 const normalize=name=>name.replace(/市$/,'');
 for(const p of provinces){if([110000,120000,310000,500000].includes(p.properties.adcode))cities[normalize(p.properties.name)]=p.properties.center;}
 let index=0;const failures=[];
 await Promise.all(Array.from({length:4},async()=>{while(index<provinces.length){const p=provinces[index++];if([110000,120000,310000,500000,710000,810000,820000].includes(p.properties.adcode))continue;try{const json=await load(p.properties.adcode);for(const f of json.features){const c=f.properties.center;if(Array.isArray(c)&&c.length===2)cities[normalize(f.properties.name)]=c}}catch{failures.push(p.properties.name)}}}));
 try { const xianyang=await load(610400); const yangling=xianyang.features.find(f=>f.properties.name==='杨陵区'); if(yangling?.properties.center)cities['杨凌示范区']=yangling.properties.center; } catch { failures.push('杨凌示范区'); }
 fs.writeFileSync('data/campus-city-centers.json',JSON.stringify({source:root,precision:'city-center',cities},null,2)+'\n');console.log({cities:Object.keys(cities).length,failures});
})().catch(e=>{console.error(e);process.exit(1)});

