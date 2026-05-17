var G=globalThis,W=G.ShadowRoot&&(G.ShadyCSS===void 0||G.ShadyCSS.nativeShadow)&&"adoptedStyleSheets"in Document.prototype&&"replace"in CSSStyleSheet.prototype,Y=Symbol(),gt=new WeakMap,R=class{constructor(t,e,s){if(this._$cssResult$=!0,s!==Y)throw Error("CSSResult is not constructable. Use `unsafeCSS` or `css` instead.");this.cssText=t,this.t=e}get styleSheet(){let t=this.o,e=this.t;if(W&&t===void 0){let s=e!==void 0&&e.length===1;s&&(t=gt.get(e)),t===void 0&&((this.o=t=new CSSStyleSheet).replaceSync(this.cssText),s&&gt.set(e,t))}return t}toString(){return this.cssText}},bt=i=>new R(typeof i=="string"?i:i+"",void 0,Y),P=(i,...t)=>{let e=i.length===1?i[0]:t.reduce((s,o,r)=>s+(n=>{if(n._$cssResult$===!0)return n.cssText;if(typeof n=="number")return n;throw Error("Value passed to 'css' function must be a 'css' function result: "+n+". Use 'unsafeCSS' to pass non-literal values, but take care to ensure page security.")})(o)+i[r+1],i[0]);return new R(e,i,Y)},vt=(i,t)=>{if(W)i.adoptedStyleSheets=t.map(e=>e instanceof CSSStyleSheet?e:e.styleSheet);else for(let e of t){let s=document.createElement("style"),o=G.litNonce;o!==void 0&&s.setAttribute("nonce",o),s.textContent=e.cssText,i.appendChild(s)}},X=W?i=>i:i=>i instanceof CSSStyleSheet?(t=>{let e="";for(let s of t.cssRules)e+=s.cssText;return bt(e)})(i):i;var{is:Zt,defineProperty:Qt,getOwnPropertyDescriptor:te,getOwnPropertyNames:ee,getOwnPropertySymbols:se,getPrototypeOf:ie}=Object,z=globalThis,At=z.trustedTypes,oe=At?At.emptyScript:"",re=z.reactiveElementPolyfillSupport,M=(i,t)=>i,J={toAttribute(i,t){switch(t){case Boolean:i=i?oe:null;break;case Object:case Array:i=i==null?i:JSON.stringify(i)}return i},fromAttribute(i,t){let e=i;switch(t){case Boolean:e=i!==null;break;case Number:e=i===null?null:Number(i);break;case Object:case Array:try{e=JSON.parse(i)}catch{e=null}}return e}},xt=(i,t)=>!Zt(i,t),wt={attribute:!0,type:String,converter:J,reflect:!1,useDefault:!1,hasChanged:xt};Symbol.metadata??=Symbol("metadata"),z.litPropertyMetadata??=new WeakMap;var v=class extends HTMLElement{static addInitializer(t){this._$Ei(),(this.l??=[]).push(t)}static get observedAttributes(){return this.finalize(),this._$Eh&&[...this._$Eh.keys()]}static createProperty(t,e=wt){if(e.state&&(e.attribute=!1),this._$Ei(),this.prototype.hasOwnProperty(t)&&((e=Object.create(e)).wrapped=!0),this.elementProperties.set(t,e),!e.noAccessor){let s=Symbol(),o=this.getPropertyDescriptor(t,s,e);o!==void 0&&Qt(this.prototype,t,o)}}static getPropertyDescriptor(t,e,s){let{get:o,set:r}=te(this.prototype,t)??{get(){return this[e]},set(n){this[e]=n}};return{get:o,set(n){let l=o?.call(this);r?.call(this,n),this.requestUpdate(t,l,s)},configurable:!0,enumerable:!0}}static getPropertyOptions(t){return this.elementProperties.get(t)??wt}static _$Ei(){if(this.hasOwnProperty(M("elementProperties")))return;let t=ie(this);t.finalize(),t.l!==void 0&&(this.l=[...t.l]),this.elementProperties=new Map(t.elementProperties)}static finalize(){if(this.hasOwnProperty(M("finalized")))return;if(this.finalized=!0,this._$Ei(),this.hasOwnProperty(M("properties"))){let e=this.properties,s=[...ee(e),...se(e)];for(let o of s)this.createProperty(o,e[o])}let t=this[Symbol.metadata];if(t!==null){let e=litPropertyMetadata.get(t);if(e!==void 0)for(let[s,o]of e)this.elementProperties.set(s,o)}this._$Eh=new Map;for(let[e,s]of this.elementProperties){let o=this._$Eu(e,s);o!==void 0&&this._$Eh.set(o,e)}this.elementStyles=this.finalizeStyles(this.styles)}static finalizeStyles(t){let e=[];if(Array.isArray(t)){let s=new Set(t.flat(1/0).reverse());for(let o of s)e.unshift(X(o))}else t!==void 0&&e.push(X(t));return e}static _$Eu(t,e){let s=e.attribute;return s===!1?void 0:typeof s=="string"?s:typeof t=="string"?t.toLowerCase():void 0}constructor(){super(),this._$Ep=void 0,this.isUpdatePending=!1,this.hasUpdated=!1,this._$Em=null,this._$Ev()}_$Ev(){this._$ES=new Promise(t=>this.enableUpdating=t),this._$AL=new Map,this._$E_(),this.requestUpdate(),this.constructor.l?.forEach(t=>t(this))}addController(t){(this._$EO??=new Set).add(t),this.renderRoot!==void 0&&this.isConnected&&t.hostConnected?.()}removeController(t){this._$EO?.delete(t)}_$E_(){let t=new Map,e=this.constructor.elementProperties;for(let s of e.keys())this.hasOwnProperty(s)&&(t.set(s,this[s]),delete this[s]);t.size>0&&(this._$Ep=t)}createRenderRoot(){let t=this.shadowRoot??this.attachShadow(this.constructor.shadowRootOptions);return vt(t,this.constructor.elementStyles),t}connectedCallback(){this.renderRoot??=this.createRenderRoot(),this.enableUpdating(!0),this._$EO?.forEach(t=>t.hostConnected?.())}enableUpdating(t){}disconnectedCallback(){this._$EO?.forEach(t=>t.hostDisconnected?.())}attributeChangedCallback(t,e,s){this._$AK(t,s)}_$ET(t,e){let s=this.constructor.elementProperties.get(t),o=this.constructor._$Eu(t,s);if(o!==void 0&&s.reflect===!0){let r=(s.converter?.toAttribute!==void 0?s.converter:J).toAttribute(e,s.type);this._$Em=t,r==null?this.removeAttribute(o):this.setAttribute(o,r),this._$Em=null}}_$AK(t,e){let s=this.constructor,o=s._$Eh.get(t);if(o!==void 0&&this._$Em!==o){let r=s.getPropertyOptions(o),n=typeof r.converter=="function"?{fromAttribute:r.converter}:r.converter?.fromAttribute!==void 0?r.converter:J;this._$Em=o;let l=n.fromAttribute(e,r.type);this[o]=l??this._$Ej?.get(o)??l,this._$Em=null}}requestUpdate(t,e,s,o=!1,r){if(t!==void 0){let n=this.constructor;if(o===!1&&(r=this[t]),s??=n.getPropertyOptions(t),!((s.hasChanged??xt)(r,e)||s.useDefault&&s.reflect&&r===this._$Ej?.get(t)&&!this.hasAttribute(n._$Eu(t,s))))return;this.C(t,e,s)}this.isUpdatePending===!1&&(this._$ES=this._$EP())}C(t,e,{useDefault:s,reflect:o,wrapped:r},n){s&&!(this._$Ej??=new Map).has(t)&&(this._$Ej.set(t,n??e??this[t]),r!==!0||n!==void 0)||(this._$AL.has(t)||(this.hasUpdated||s||(e=void 0),this._$AL.set(t,e)),o===!0&&this._$Em!==t&&(this._$Eq??=new Set).add(t))}async _$EP(){this.isUpdatePending=!0;try{await this._$ES}catch(e){Promise.reject(e)}let t=this.scheduleUpdate();return t!=null&&await t,!this.isUpdatePending}scheduleUpdate(){return this.performUpdate()}performUpdate(){if(!this.isUpdatePending)return;if(!this.hasUpdated){if(this.renderRoot??=this.createRenderRoot(),this._$Ep){for(let[o,r]of this._$Ep)this[o]=r;this._$Ep=void 0}let s=this.constructor.elementProperties;if(s.size>0)for(let[o,r]of s){let{wrapped:n}=r,l=this[o];n!==!0||this._$AL.has(o)||l===void 0||this.C(o,void 0,r,l)}}let t=!1,e=this._$AL;try{t=this.shouldUpdate(e),t?(this.willUpdate(e),this._$EO?.forEach(s=>s.hostUpdate?.()),this.update(e)):this._$EM()}catch(s){throw t=!1,this._$EM(),s}t&&this._$AE(e)}willUpdate(t){}_$AE(t){this._$EO?.forEach(e=>e.hostUpdated?.()),this.hasUpdated||(this.hasUpdated=!0,this.firstUpdated(t)),this.updated(t)}_$EM(){this._$AL=new Map,this.isUpdatePending=!1}get updateComplete(){return this.getUpdateComplete()}getUpdateComplete(){return this._$ES}shouldUpdate(t){return!0}update(t){this._$Eq&&=this._$Eq.forEach(e=>this._$ET(e,this[e])),this._$EM()}updated(t){}firstUpdated(t){}};v.elementStyles=[],v.shadowRootOptions={mode:"open"},v[M("elementProperties")]=new Map,v[M("finalized")]=new Map,re?.({ReactiveElement:v}),(z.reactiveElementVersions??=[]).push("2.1.2");var ot=globalThis,Et=i=>i,F=ot.trustedTypes,St=F?F.createPolicy("lit-html",{createHTML:i=>i}):void 0,Pt="$lit$",w=`lit$${Math.random().toFixed(9).slice(2)}$`,Mt="?"+w,ne=`<${Mt}>`,S=document,O=()=>S.createComment(""),L=i=>i===null||typeof i!="object"&&typeof i!="function",rt=Array.isArray,ae=i=>rt(i)||typeof i?.[Symbol.iterator]=="function",Z=`[ 	
\f\r]`,k=/<(?:(!--|\/[^a-zA-Z])|(\/?[a-zA-Z][^>\s]*)|(\/?$))/g,Ct=/-->/g,Nt=/>/g,x=RegExp(`>|${Z}(?:([^\\s"'>=/]+)(${Z}*=${Z}*(?:[^ 	
\f\r"'\`<>=]|("|')|))|$)`,"g"),It=/'/g,Tt=/"/g,kt=/^(?:script|style|textarea|title)$/i,nt=i=>(t,...e)=>({_$litType$:i,strings:t,values:e}),g=nt(1),C=nt(2),Se=nt(3),A=Symbol.for("lit-noChange"),u=Symbol.for("lit-nothing"),Rt=new WeakMap,E=S.createTreeWalker(S,129);function Ot(i,t){if(!rt(i)||!i.hasOwnProperty("raw"))throw Error("invalid template strings array");return St!==void 0?St.createHTML(t):t}var le=(i,t)=>{let e=i.length-1,s=[],o,r=t===2?"<svg>":t===3?"<math>":"",n=k;for(let l=0;l<e;l++){let a=i[l],h,c,d=-1,f=0;for(;f<a.length&&(n.lastIndex=f,c=n.exec(a),c!==null);)f=n.lastIndex,n===k?c[1]==="!--"?n=Ct:c[1]!==void 0?n=Nt:c[2]!==void 0?(kt.test(c[2])&&(o=RegExp("</"+c[2],"g")),n=x):c[3]!==void 0&&(n=x):n===x?c[0]===">"?(n=o??k,d=-1):c[1]===void 0?d=-2:(d=n.lastIndex-c[2].length,h=c[1],n=c[3]===void 0?x:c[3]==='"'?Tt:It):n===Tt||n===It?n=x:n===Ct||n===Nt?n=k:(n=x,o=void 0);let p=n===x&&i[l+1].startsWith("/>")?" ":"";r+=n===k?a+ne:d>=0?(s.push(h),a.slice(0,d)+Pt+a.slice(d)+w+p):a+w+(d===-2?l:p)}return[Ot(i,r+(i[e]||"<?>")+(t===2?"</svg>":t===3?"</math>":"")),s]},H=class i{constructor({strings:t,_$litType$:e},s){let o;this.parts=[];let r=0,n=0,l=t.length-1,a=this.parts,[h,c]=le(t,e);if(this.el=i.createElement(h,s),E.currentNode=this.el.content,e===2||e===3){let d=this.el.content.firstChild;d.replaceWith(...d.childNodes)}for(;(o=E.nextNode())!==null&&a.length<l;){if(o.nodeType===1){if(o.hasAttributes())for(let d of o.getAttributeNames())if(d.endsWith(Pt)){let f=c[n++],p=o.getAttribute(d).split(w),y=/([.?@])?(.*)/.exec(f);a.push({type:1,index:r,name:y[2],strings:p,ctor:y[1]==="."?tt:y[1]==="?"?et:y[1]==="@"?st:I}),o.removeAttribute(d)}else d.startsWith(w)&&(a.push({type:6,index:r}),o.removeAttribute(d));if(kt.test(o.tagName)){let d=o.textContent.split(w),f=d.length-1;if(f>0){o.textContent=F?F.emptyScript:"";for(let p=0;p<f;p++)o.append(d[p],O()),E.nextNode(),a.push({type:2,index:++r});o.append(d[f],O())}}}else if(o.nodeType===8)if(o.data===Mt)a.push({type:2,index:r});else{let d=-1;for(;(d=o.data.indexOf(w,d+1))!==-1;)a.push({type:7,index:r}),d+=w.length-1}r++}}static createElement(t,e){let s=S.createElement("template");return s.innerHTML=t,s}};function N(i,t,e=i,s){if(t===A)return t;let o=s!==void 0?e._$Co?.[s]:e._$Cl,r=L(t)?void 0:t._$litDirective$;return o?.constructor!==r&&(o?._$AO?.(!1),r===void 0?o=void 0:(o=new r(i),o._$AT(i,e,s)),s!==void 0?(e._$Co??=[])[s]=o:e._$Cl=o),o!==void 0&&(t=N(i,o._$AS(i,t.values),o,s)),t}var Q=class{constructor(t,e){this._$AV=[],this._$AN=void 0,this._$AD=t,this._$AM=e}get parentNode(){return this._$AM.parentNode}get _$AU(){return this._$AM._$AU}u(t){let{el:{content:e},parts:s}=this._$AD,o=(t?.creationScope??S).importNode(e,!0);E.currentNode=o;let r=E.nextNode(),n=0,l=0,a=s[0];for(;a!==void 0;){if(n===a.index){let h;a.type===2?h=new U(r,r.nextSibling,this,t):a.type===1?h=new a.ctor(r,a.name,a.strings,this,t):a.type===6&&(h=new it(r,this,t)),this._$AV.push(h),a=s[++l]}n!==a?.index&&(r=E.nextNode(),n++)}return E.currentNode=S,o}p(t){let e=0;for(let s of this._$AV)s!==void 0&&(s.strings!==void 0?(s._$AI(t,s,e),e+=s.strings.length-2):s._$AI(t[e])),e++}},U=class i{get _$AU(){return this._$AM?._$AU??this._$Cv}constructor(t,e,s,o){this.type=2,this._$AH=u,this._$AN=void 0,this._$AA=t,this._$AB=e,this._$AM=s,this.options=o,this._$Cv=o?.isConnected??!0}get parentNode(){let t=this._$AA.parentNode,e=this._$AM;return e!==void 0&&t?.nodeType===11&&(t=e.parentNode),t}get startNode(){return this._$AA}get endNode(){return this._$AB}_$AI(t,e=this){t=N(this,t,e),L(t)?t===u||t==null||t===""?(this._$AH!==u&&this._$AR(),this._$AH=u):t!==this._$AH&&t!==A&&this._(t):t._$litType$!==void 0?this.$(t):t.nodeType!==void 0?this.T(t):ae(t)?this.k(t):this._(t)}O(t){return this._$AA.parentNode.insertBefore(t,this._$AB)}T(t){this._$AH!==t&&(this._$AR(),this._$AH=this.O(t))}_(t){this._$AH!==u&&L(this._$AH)?this._$AA.nextSibling.data=t:this.T(S.createTextNode(t)),this._$AH=t}$(t){let{values:e,_$litType$:s}=t,o=typeof s=="number"?this._$AC(t):(s.el===void 0&&(s.el=H.createElement(Ot(s.h,s.h[0]),this.options)),s);if(this._$AH?._$AD===o)this._$AH.p(e);else{let r=new Q(o,this),n=r.u(this.options);r.p(e),this.T(n),this._$AH=r}}_$AC(t){let e=Rt.get(t.strings);return e===void 0&&Rt.set(t.strings,e=new H(t)),e}k(t){rt(this._$AH)||(this._$AH=[],this._$AR());let e=this._$AH,s,o=0;for(let r of t)o===e.length?e.push(s=new i(this.O(O()),this.O(O()),this,this.options)):s=e[o],s._$AI(r),o++;o<e.length&&(this._$AR(s&&s._$AB.nextSibling,o),e.length=o)}_$AR(t=this._$AA.nextSibling,e){for(this._$AP?.(!1,!0,e);t!==this._$AB;){let s=Et(t).nextSibling;Et(t).remove(),t=s}}setConnected(t){this._$AM===void 0&&(this._$Cv=t,this._$AP?.(t))}},I=class{get tagName(){return this.element.tagName}get _$AU(){return this._$AM._$AU}constructor(t,e,s,o,r){this.type=1,this._$AH=u,this._$AN=void 0,this.element=t,this.name=e,this._$AM=o,this.options=r,s.length>2||s[0]!==""||s[1]!==""?(this._$AH=Array(s.length-1).fill(new String),this.strings=s):this._$AH=u}_$AI(t,e=this,s,o){let r=this.strings,n=!1;if(r===void 0)t=N(this,t,e,0),n=!L(t)||t!==this._$AH&&t!==A,n&&(this._$AH=t);else{let l=t,a,h;for(t=r[0],a=0;a<r.length-1;a++)h=N(this,l[s+a],e,a),h===A&&(h=this._$AH[a]),n||=!L(h)||h!==this._$AH[a],h===u?t=u:t!==u&&(t+=(h??"")+r[a+1]),this._$AH[a]=h}n&&!o&&this.j(t)}j(t){t===u?this.element.removeAttribute(this.name):this.element.setAttribute(this.name,t??"")}},tt=class extends I{constructor(){super(...arguments),this.type=3}j(t){this.element[this.name]=t===u?void 0:t}},et=class extends I{constructor(){super(...arguments),this.type=4}j(t){this.element.toggleAttribute(this.name,!!t&&t!==u)}},st=class extends I{constructor(t,e,s,o,r){super(t,e,s,o,r),this.type=5}_$AI(t,e=this){if((t=N(this,t,e,0)??u)===A)return;let s=this._$AH,o=t===u&&s!==u||t.capture!==s.capture||t.once!==s.once||t.passive!==s.passive,r=t!==u&&(s===u||o);o&&this.element.removeEventListener(this.name,this,s),r&&this.element.addEventListener(this.name,this,t),this._$AH=t}handleEvent(t){typeof this._$AH=="function"?this._$AH.call(this.options?.host??this.element,t):this._$AH.handleEvent(t)}},it=class{constructor(t,e,s){this.element=t,this.type=6,this._$AN=void 0,this._$AM=e,this.options=s}get _$AU(){return this._$AM._$AU}_$AI(t){N(this,t)}};var ce=ot.litHtmlPolyfillSupport;ce?.(H,U),(ot.litHtmlVersions??=[]).push("3.3.3");var Lt=(i,t,e)=>{let s=e?.renderBefore??t,o=s._$litPart$;if(o===void 0){let r=e?.renderBefore??null;s._$litPart$=o=new U(t.insertBefore(O(),r),r,void 0,e??{})}return o._$AI(i),o};var at=globalThis,b=class extends v{constructor(){super(...arguments),this.renderOptions={host:this},this._$Do=void 0}createRenderRoot(){let t=super.createRenderRoot();return this.renderOptions.renderBefore??=t.firstChild,t}update(t){let e=this.render();this.hasUpdated||(this.renderOptions.isConnected=this.isConnected),super.update(t),this._$Do=Lt(e,this.renderRoot,this.renderOptions)}connectedCallback(){super.connectedCallback(),this._$Do?.setConnected(!0)}disconnectedCallback(){super.disconnectedCallback(),this._$Do?.setConnected(!1)}render(){return A}};b._$litElement$=!0,b.finalized=!0,at.litElementHydrateSupport?.({LitElement:b});var he=at.litElementPolyfillSupport;he?.({LitElement:b});(at.litElementVersions??=[]).push("4.2.2");var Ht={ATTRIBUTE:1,CHILD:2,PROPERTY:3,BOOLEAN_ATTRIBUTE:4,EVENT:5,ELEMENT:6},Ut=i=>(...t)=>({_$litDirective$:i,values:t}),j=class{constructor(t){}get _$AU(){return this._$AM._$AU}_$AT(t,e,s){this._$Ct=t,this._$AM=e,this._$Ci=s}_$AS(t,e){return this.update(t,e)}update(t,e){return this.render(...e)}};var Dt="important",de=" !"+Dt,Bt=Ut(class extends j{constructor(i){if(super(i),i.type!==Ht.ATTRIBUTE||i.name!=="style"||i.strings?.length>2)throw Error("The `styleMap` directive must be used in the `style` attribute and must be the only part in the attribute.")}render(i){return Object.keys(i).reduce((t,e)=>{let s=i[e];return s==null?t:t+`${e=e.includes("-")?e:e.replace(/(?:^(webkit|moz|ms|o)|)(?=[A-Z])/g,"-$&").toLowerCase()}:${s};`},"")}update(i,[t]){let{style:e}=i.element;if(this.ft===void 0)return this.ft=new Set(Object.keys(t)),this.render(t);for(let s of this.ft)t[s]==null&&(this.ft.delete(s),s.includes("-")?e.removeProperty(s):e[s]=null);for(let s in t){let o=t[s];if(o!=null){this.ft.add(s);let r=typeof o=="string"&&o.endsWith(de);s.includes("-")||r?e.setProperty(s,r?o.slice(0,-11):o,r?Dt:""):e[s]=o}}return A}});var Gt={solar:["solar","pv","photovoltaic","panel","array"],grid:["grid","mains","utility","meter","import","export","network","feed"],battery_power:["battery","batt","storage","accumulator"],battery_level:["battery","batt","soc","state_of_charge","level"],house:["house","home","consumption","load","household","demand"]},ue=new Set(["W","kW","watt","kilowatt"]),fe=new Set(["%"]);function Wt(i,t="",e){let s=`${i} ${t}`.toLowerCase();return e.reduce((o,r)=>o+(s.includes(r)?1:0),0)}function D(i){return i.length?i.sort((t,e)=>e.score-t.score)[0].entityId:null}function zt(i){let t={solar:[],grid:[],battery_power:[],battery_level:[],house:[]};for(let[e,s]of Object.entries(i.states)){if(!e.startsWith("sensor."))continue;let o=s.attributes??{},r=o.device_class??"",n=(o.unit_of_measurement??"").trim(),l=o.friendly_name??"",a=r==="power"||ue.has(n),h=r==="battery"||fe.has(n);if(a)for(let c of["solar","grid","battery_power","house"]){let d=Wt(e,l,Gt[c]);d>0&&t[c].push({entityId:e,score:d})}if(h){let c=Wt(e,l,Gt.battery_level);c>0&&t.battery_level.push({entityId:e,score:c})}}return{solar:D(t.solar),grid:D(t.grid),battery_power:D(t.battery_power),battery_level:D(t.battery_level),house:D(t.house)}}function V(i){if(!i||i.state==="unavailable"||i.state==="unknown")return null;let t=parseFloat(i.state);return isNaN(t)?null:t}function lt(i){return(i?.attributes?.unit_of_measurement??"").trim()}function ct(i,t,e="auto"){if(i==null)return null;let s=t==="kW"||t==="kilowatt",o=t==="W"||t==="watt"||t==="";return e==="kW"?i*1e3:e==="W"?i:s?i*1e3:i}function T(i){return i==null?"\u2014":Math.abs(i)>=1e3?`${(i/1e3).toFixed(1)} kW`:`${Math.round(i)} W`}var $={UNKNOWN:"unknown",IDLE:"idle",CHARGING:"charging",DISCHARGING:"discharging"},_={IDLE:"idle",IMPORTING:"importing",EXPORTING:"exporting"},K={IDLE:"idle",ACTIVE:"active"};function ht(i,t=5){return i===null?$.UNKNOWN:i>t?$.DISCHARGING:i<-t?$.CHARGING:$.IDLE}function Ft(i,t=5){return i===null||Math.abs(i)<t?_.IDLE:i>0?_.IMPORTING:_.EXPORTING}function jt(i,t=5){return i===null||Math.abs(i)<t?K.IDLE:K.ACTIVE}var dt={[$.UNKNOWN]:"#888888",[$.IDLE]:"#90a4ae",[$.CHARGING]:"#ff9800",[$.DISCHARGING]:"#4caf50"},Vt={[_.IDLE]:"#546e7a",[_.IMPORTING]:"#ef5350",[_.EXPORTING]:"#26a69a"},Kt={[$.UNKNOWN]:"?",[$.IDLE]:"Idle",[$.CHARGING]:"Charging",[$.DISCHARGING]:"Discharging"},qt={[_.IDLE]:"Grid",[_.IMPORTING]:"Importing",[_.EXPORTING]:"Exporting"};var pe=[{name:"title",selector:{text:{}},label:"Card title"},{name:"auto_detect",selector:{boolean:{}},label:"Auto-detect entities from sensor names",description:"Falls back to auto-detection when an entity is not explicitly set below."},{name:"",type:"expandable",title:"Entities",schema:[{name:"solar_entity",selector:{entity:{domain:"sensor",device_class:"power"}},label:"Solar / PV power"},{name:"grid_entity",selector:{entity:{domain:"sensor",device_class:"power"}},label:"Grid power (positive = importing)"},{name:"battery_power_entity",selector:{entity:{domain:"sensor",device_class:"power"}},label:"Battery power (positive = discharging)"},{name:"battery_level_entity",selector:{entity:{domain:"sensor",device_class:"battery"}},label:"Battery level (%)"},{name:"house_entity",selector:{entity:{domain:"sensor",device_class:"power"}},label:"House consumption (calculated if omitted)"}]},{name:"",type:"expandable",title:"Sign convention",schema:[{name:"solar_invert",selector:{boolean:{}},label:"Invert solar sign"},{name:"grid_invert",selector:{boolean:{}},label:"Invert grid sign (positive = exporting)"},{name:"battery_invert",selector:{boolean:{}},label:"Invert battery sign (positive = charging)"}]},{name:"",type:"expandable",title:"Display",schema:[{name:"low_power_threshold",selector:{number:{min:0,max:500,step:5,unit_of_measurement:"W",mode:"slider"}},label:"Low-power threshold \u2014 flow line hidden below this"},{name:"show_diagnostics",selector:{boolean:{}},label:"Show diagnostics panel (debug)"}]}],ut=class extends b{static properties={hass:{attribute:!1},_config:{state:!0}};static styles=P`
    :host { display: block; }
  `;setConfig(t){this._config={...t}}_valueChanged(t){t.stopPropagation(),this.dispatchEvent(new CustomEvent("config-changed",{detail:{config:t.detail.value}}))}render(){return!this._config||!this.hass?g``:g`
      <ha-form
        .hass=${this.hass}
        .data=${this._config}
        .schema=${pe}
        .computeLabel=${t=>t.label??t.name}
        .computeHelper=${t=>t.description??""}
        @value-changed=${this._valueChanged}
      ></ha-form>
    `}};customElements.define("power-flow-card-editor",ut);var ft={W:500,H:500},m={solar:{x:250,y:72,r:52,defaultColor:"#fdd835",label:"Solar"},grid:{x:72,y:225,r:52,defaultColor:"#42a5f5",label:"Grid"},house:{x:250,y:282,r:52,defaultColor:"#ff9800",label:"House"},battery:{x:428,y:225,r:52,defaultColor:"#66bb6a",label:"Battery"}};function $e(){let i=m.solar,t=m.house;return`M ${i.x},${i.y+i.r} C ${i.x},${i.y+155} ${t.x},${t.y-155} ${t.x},${t.y-t.r}`}function _e(){let i=m.grid,t=m.house;return`M ${i.x+i.r},${i.y} C 168,${i.y} ${t.x-90},${t.y} ${t.x-t.r},${t.y}`}function me(){let i=m.battery,t=m.house;return`M ${i.x-i.r},${i.y} C 332,${i.y} ${t.x+90},${t.y} ${t.x+t.r},${t.y}`}function ye(i,t){let e=m.house;return`M ${e.x},${e.y+e.r} C ${e.x},${e.y+105} ${i},${t-55} ${i},${t}`}function ge(i){let e=Math.min(130,420/Math.max(i,1)),s=(i-1)*e,o=ft.W/2-s/2;return Array.from({length:i},(r,n)=>({x:o+n*e,y:430}))}var be="14 46",Yt=60,pt=class extends b{static properties={hass:{attribute:!1},_config:{state:!0},_detectedEntities:{state:!0}};static styles=P`
    :host { display: block; }

    ha-card {
      overflow: hidden;
      display: flex;
      flex-direction: column;
      height: 100%;
    }

    .card-header {
      padding: 14px 16px 0;
      font-size: 1.05em;
      font-weight: 600;
      color: var(--primary-text-color);
    }

    .svg-wrap {
      flex: 1;
      padding: 10px 12px 12px;
    }

    svg.flow-svg {
      display: block;
      width: 100%;
      height: auto;
    }

    .diagnostics {
      margin: 0 12px 12px;
      padding: 8px 10px;
      font-size: 0.72em;
      line-height: 1.5;
      font-family: monospace;
      color: var(--secondary-text-color);
      background: var(--secondary-background-color, #1e1e2e);
      border-radius: 6px;
    }

    @keyframes flow-fwd {
      from { stroke-dashoffset: ${Yt}; }
      to   { stroke-dashoffset: 0; }
    }
    @keyframes flow-rev {
      from { stroke-dashoffset: -${Yt}; }
      to   { stroke-dashoffset: 0; }
    }
  `;static getConfigElement(){return document.createElement("power-flow-card-editor")}static getStubConfig(){return{auto_detect:!0,low_power_threshold:5,solar_invert:!1,grid_invert:!1,battery_invert:!1}}static getGridOptions(){return{columns:12,min_columns:6,rows:5,min_rows:4}}getCardSize(){return 5}setConfig(t){this._config={...t},this._detectedEntities=null}_entityId(t){let e=this._config,s={solar:e.solar_entity,grid:e.grid_entity,battery_power:e.battery_power_entity,battery_level:e.battery_level_entity,house:e.house_entity}[t];return s||(e.auto_detect!==!1&&this._detectedEntities?this._detectedEntities[t]??null:null)}_readW(t){let e=this._entityId(t);if(!e||!this.hass)return null;let s=this.hass.states[e],o=V(s);if(o===null)return null;let r=ct(o,lt(s));return this._config[`${t}_invert`]?-(r??0):r??0}_readLevel(t){let e=this._entityId(t);return!e||!this.hass?null:V(this.hass.states[e])}_houseW(t,e,s){let o=this._readW("house");return o!==null?o:Math.max(0,(t??0)+(e??0)-Math.min(0,s??0)*-1)}updated(t){t.has("hass")&&this.hass&&!this._detectedEntities&&this._config?.auto_detect!==!1&&(this._detectedEntities=zt(this.hass))}_moreInfo(t){t&&this.dispatchEvent(new CustomEvent("hass-more-info",{bubbles:!0,composed:!0,detail:{entityId:t}}))}_flowLine(t,e,s,o,r=!1){let n=this._config.low_power_threshold??5,l=Math.abs(o??0);if(!e||l<n)return C`
        <path d=${t}
          fill="none" stroke="#333a4a" stroke-width="2"
          stroke-dasharray="4 8" opacity="0.45"/>
      `;let a=Math.max(.5,Math.min(3,3500/l)).toFixed(2),h=Math.min(4,1.5+l/2500).toFixed(1),c=r?"flow-rev":"flow-fwd";return C`
      <!-- glow halo -->
      <path d=${t}
        fill="none"
        stroke=${s}
        stroke-width=${parseFloat(h)+5}
        stroke-linecap="round"
        opacity="0.15"/>
      <!-- animated dash -->
      <path d=${t}
        fill="none"
        stroke=${s}
        stroke-width=${h}
        stroke-dasharray=${be}
        stroke-linecap="round"
        style=${Bt({animationName:c,animationDuration:`${a}s`,animationTimingFunction:"linear",animationIterationCount:"infinite"})}/>
    `}_node(t,e,s,o,r,n,l=u){let{x:a,y:h,r:c}=m[t],d=r?"#404858":o,f=r?"#525a6a":"#ffffff";return C`
      <g style="cursor: ${n?"pointer":"default"}"
         @click=${()=>this._moreInfo(n)}>
        <!-- outer glow -->
        <circle cx=${a} cy=${h} r=${c+8}
          fill=${d} opacity="0.08"
          filter="url(#pfc-glow)"/>
        <!-- background disc -->
        <circle cx=${a} cy=${h} r=${c}
          fill="#0d1117" stroke=${d} stroke-width="2.5"/>
        ${l}
        <!-- value text -->
        <text x=${a} y=${h-9}
          text-anchor="middle" dominant-baseline="auto"
          fill=${f} font-size="15" font-weight="700"
          font-family="var(--primary-font-family, system-ui, sans-serif)">
          ${r?"\u2014":s}
        </text>
        <!-- label text -->
        <text x=${a} y=${h+11}
          text-anchor="middle" dominant-baseline="auto"
          fill=${r?"#414a5a":d}
          font-size="11.5"
          font-family="var(--primary-font-family, system-ui, sans-serif)">
          ${r?"Not set":e}
        </text>
      </g>
    `}_batteryNode(t,e,s){let o=ht(t,this._config.low_power_threshold??5),r=dt[o],{x:n,y:l,r:a}=m.battery,h=a-8,c=2*Math.PI*h,d=Math.max(0,Math.min(100,e??0)),f=(c*d/100).toFixed(1),p=(c-parseFloat(f)).toFixed(1),y=d>50?"#4caf50":d>20?"#ff9800":"#ef5350",B=C`
      <!-- track -->
      <circle cx=${n} cy=${l} r=${h}
        fill="none" stroke="#1e2535" stroke-width="5.5"/>
      <!-- fill -->
      <circle cx=${n} cy=${l} r=${h}
        fill="none" stroke=${y} stroke-width="5.5"
        stroke-dasharray="${f} ${p}"
        stroke-dashoffset="${(c*.25).toFixed(1)}"
        transform="rotate(-90 ${n} ${l})"
        style="transition: stroke-dasharray 0.6s ease, stroke 0.6s ease"/>
    `,q=e!==null?`${Math.round(d)}%`:"\u2014";return C`
      <g style="cursor: ${s?"pointer":"default"}"
         @click=${()=>this._moreInfo(s)}>
        <circle cx=${n} cy=${l} r=${a+8} fill=${r} opacity="0.08" filter="url(#pfc-glow)"/>
        <circle cx=${n} cy=${l} r=${a}     fill="#0d1117" stroke=${r} stroke-width="2.5"/>
        ${B}
        <!-- SOC % -->
        <text x=${n} y=${l-7}
          text-anchor="middle"
          fill="#ffffff" font-size="16" font-weight="800"
          font-family="var(--primary-font-family, system-ui, sans-serif)">
          ${q}
        </text>
        <!-- status label -->
        <text x=${n} y=${l+10}
          text-anchor="middle"
          fill=${r} font-size="10.5"
          font-family="var(--primary-font-family, system-ui, sans-serif)">
          ${Kt[o]}
        </text>
        <!-- power below status -->
        <text x=${n} y=${l+23}
          text-anchor="middle"
          fill="rgba(255,255,255,0.55)" font-size="10"
          font-family="var(--primary-font-family, system-ui, sans-serif)">
          ${t!==null?T(Math.abs(t)):""}
        </text>
      </g>
    `}_customNodes(){let t=this._config.custom_sensors;if(!t?.length)return u;let e=ge(t.length),s=this._config.low_power_threshold??5;return t.map((o,r)=>{let n=e[r],l=o.entity,a=l&&this.hass?.states[l],h=V(a),c=h!==null?ct(h,lt(a)):null,d=Math.abs(c??0),f=c!==null&&d>=s,p=o.color??"#ab47bc",y=ye(n.x,n.y);return C`
        ${this._flowLine(y,f,p,c??0)}
        <g style="cursor: ${l?"pointer":"default"}"
           @click=${()=>this._moreInfo(l)}>
          <circle cx=${n.x} cy=${n.y} r=${36}
            fill="#0d1117" stroke=${p} stroke-width="2"/>
          <text x=${n.x} y=${n.y-6}
            text-anchor="middle"
            fill="#ffffff" font-size="11.5" font-weight="700"
            font-family="var(--primary-font-family, system-ui, sans-serif)">
            ${c!==null?T(c):"\u2014"}
          </text>
          <text x=${n.x} y=${n.y+9}
            text-anchor="middle"
            fill=${p} font-size="10"
            font-family="var(--primary-font-family, system-ui, sans-serif)">
            ${o.name??l??"?"}
          </text>
        </g>
      `})}_diagnosticsPanel(t,e,s,o){let r=this._detectedEntities??{},n=this._config,l=[["Role","Detected","Config override","Value (W)"],["Solar",r.solar??"\u2014",n.solar_entity??"\u2014",t??"\u2014"],["Grid",r.grid??"\u2014",n.grid_entity??"\u2014",e??"\u2014"],["Battery",r.battery_power??"\u2014",n.battery_power_entity??"\u2014",s??"\u2014"],["House",r.house??"\u2014",n.house_entity??"\u2014",o??"\u2014"]];return g`
      <div class="diagnostics">
        ${l.map((a,h)=>g`
          <div style="display:grid;grid-template-columns:60px 1fr 1fr 55px;gap:4px;
                      opacity:${h===0?"0.55":"1"};
                      font-weight:${h===0?"600":"400"}">
            ${a.map(c=>g`<span>${c}</span>`)}
          </div>
        `)}
      </div>
    `}render(){if(!this._config)return g`<ha-card>No configuration.</ha-card>`;let t=this._config.low_power_threshold??5,e=this._readW("solar"),s=this._readW("grid"),o=this._readW("battery_power"),r=this._readLevel("battery_level"),n=this._houseW(e,s,o),l=Ft(s,t),a=ht(o,t),h=jt(e,t)===K.ACTIVE,c=l!==_.IDLE,d=a!==$.IDLE&&a!==$.UNKNOWN,f=Vt[l],p=dt[a],y=m.solar.defaultColor,B=m.house.defaultColor,q=l===_.EXPORTING,Xt=a===$.CHARGING,$t=this._entityId("solar"),_t=this._entityId("grid"),mt=this._entityId("battery_power")??this._entityId("battery_level"),Jt=!!(mt||this._entityId("battery_level")),yt=(this._config.custom_sensors??[]).length>0?480:380;return g`
      <ha-card>
        ${this._config.title?g`<div class="card-header">${this._config.title}</div>`:u}

        <div class="svg-wrap">
          <svg class="flow-svg"
            viewBox="0 0 ${ft.W} ${yt}"
            xmlns="http://www.w3.org/2000/svg"
            aria-label="Energy flow diagram">

            <!-- Shared defs -->
            <defs>
              <filter id="pfc-glow" x="-60%" y="-60%" width="220%" height="220%">
                <feGaussianBlur stdDeviation="5" result="blur"/>
                <feMerge>
                  <feMergeNode in="blur"/>
                  <feMergeNode in="SourceGraphic"/>
                </feMerge>
              </filter>
            </defs>

            <!-- Background -->
            <rect width=${ft.W} height=${yt} fill="#0d1117" rx="14"/>

            <!-- ── Flow lines (behind nodes) ── -->
            ${this._flowLine($e(),h,y,e??0,!1)}
            ${this._flowLine(_e(),c,f,s??0,q)}
            ${this._flowLine(me(),d,p,o??0,Xt)}
            ${this._customNodes()}

            <!-- ── Nodes ── -->

            <!-- Solar -->
            ${this._node("solar","Solar",T(e??0),y,!$t,$t)}

            <!-- Grid -->
            ${this._node("grid",qt[l],T(Math.abs(s??0)),f,!_t,_t)}

            <!-- House (no entity click — shows calculated value) -->
            ${this._node("house","House",T(n),B,!1,this._entityId("house"))}

            <!-- Battery -->
            ${Jt?this._batteryNode(o,r,mt):this._node("battery","Battery","\u2014",m.battery.defaultColor,!0,null)}

          </svg>
        </div>

        ${this._config.show_diagnostics?this._diagnosticsPanel(e,s,o,n):u}
      </ha-card>
    `}};customElements.define("power-flow-card",pt);window.customCards=window.customCards||[];window.customCards.push({type:"power-flow-card",name:"Power Flow Card",description:"Animated energy flow \u2014 Solar, Grid, Battery, House \u2014 with auto-detection, custom sensors, and battery SOC arc.",preview:!0,documentationURL:"https://github.com/ajit-thapa/solar-weather-card"});
