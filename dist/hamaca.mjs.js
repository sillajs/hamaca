const t=t=>t instanceof i,s=s=>t(s)?s:new i(s),e=t=>{const s=new i;return r((()=>{s._=t(),c(s)})),s},n=[],c=t=>[...t._obs].forEach((t=>t())),r=(t,s)=>{const e=[],c=()=>{s&&!s.active||(e.splice(0,e.length).forEach((t=>{t._obs.splice(t._obs.indexOf(c),1)})),n.unshift(e),t(),n.shift().forEach((t=>t._obs.push(c))))};c()};class i{constructor(t){this._=t,this._obs=[]}get(t=!0){return t&&n[0]&&!n[0].includes(this)&&n[0].push(this),this._}to(t){return e((()=>t(this.get())))}watch(t){r((()=>t(this.get())))}}class h extends i{constructor(t){super(t)}set(t){this._=t,c(this)}modify(t){t(this._),c(this)}}var o=Object.assign(((t,s=!1)=>!0===s?new i(t):new h(t)),{ensure:s,calc:e,isData:t,sync:r,getAll:t=>t.map((t=>t.get())),ensureAll:t=>t.map((t=>s(t)))});export default o;
