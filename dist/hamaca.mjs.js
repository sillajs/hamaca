const s=s=>new i(s).update(),t=t=>{const e=new c(void 0);return s((()=>e._set(t()))),e},e=s=>s instanceof c?s:new c(s);class i{constructor(s){this.fn=s,this.deps=[]}update(){this.deps.splice(0,this.deps.length).forEach((s=>{s._syncs.splice(s._syncs.indexOf(this),1)})),i.stack.unshift(this.deps),this.fn(),i.stack.shift().forEach((s=>s._syncs.push(this)))}}i.stack=[];class c{constructor(s){this._data=s,this._syncs=[]}get(s=!0){return s&&i.stack[0]&&!i.stack[0].includes(this)&&i.stack[0].push(this),this._data}map(s){return t((()=>s(this.get())))}mapIf(s,i){return s=e(s),t((()=>{const t=this.get();return s.get()?i(t):t}))}watch(t){return s((()=>{t(this.get())})),this}_set(s){this._data=s,this._modified()}_modified(){[...this._syncs].forEach((s=>s.update()))}}class n extends c{constructor(s){super(s)}set(s){this._set(s)}modify(s){s(this._data),this._modified()}}const a=(s,t=!1)=>!0===t?new c(s):new n(s);Object.assign(a,{ensure:e,calc:t,sync:s,getAll:s=>s.map((s=>s.get())),ensureAll:s=>s.map((s=>e(s)))});var h=a;export default h;
