import{k as M}from"./q-cea67d7a.js";import{L as ne,r as ye,M as ae}from"./q-97996d90.js";globalThis&&globalThis.__classPrivateFieldSet;globalThis&&globalThis.__classPrivateFieldGet;var _;function de(e){return e.children}_={__e:function(e,r,t,n){for(var a,d,s;r=r.__;)if((a=r.__c)&&!a.__)try{if((d=a.constructor)&&d.getDerivedStateFromError!=null&&(a.setState(d.getDerivedStateFromError(e)),s=a.__d),a.componentDidCatch!=null&&(a.componentDidCatch(e,n||{}),s=a.__d),s)return a.__E=a}catch(c){e=c}throw e}};var be=/acit|ex(?:s|g|n|p|$)|rph|grid|ows|mnc|ntw|ine[ch]|zoo|^ord|^--/i,pe=/^(area|base|br|col|embed|hr|img|input|link|meta|param|source|track|wbr)$/,W=/[\s\n\\/='"\0<>]/,he=/^xlink:?./,we=/["&<]/;function $(e){if(we.test(e+="")===!1)return e;for(var r=0,t=0,n="",a="";t<e.length;t++){switch(e.charCodeAt(t)){case 34:a="&quot;";break;case 38:a="&amp;";break;case 60:a="&lt;";break;default:continue}t!==r&&(n+=e.slice(r,t)),n+=a,r=t+1}return t!==r&&(n+=e.slice(r,t)),n}var oe=function(e,r){return String(e).replace(/(\n+)/g,"$1"+(r||"	"))},se=function(e,r,t){return String(e).length>(r||40)||!t&&String(e).indexOf(`
`)!==-1||String(e).indexOf("<")!==-1},ie={},Ce=/([A-Z])/g;function _e(e){var r="";for(var t in e){var n=e[t];n!=null&&n!==""&&(r&&(r+=" "),r+=t[0]=="-"?t:ie[t]||(ie[t]=t.replace(Ce,"-$1").toLowerCase()),r=typeof n=="number"&&be.test(t)===!1?r+": "+n+"px;":r+": "+n+";")}return r||void 0}function H(e,r){return Array.isArray(r)?r.reduce(H,e):r!=null&&r!==!1&&e.push(r),e}function le(){this.__d=!0}function ve(e,r){return{__v:e,context:r,props:e.props,setState:le,forceUpdate:le,__d:!0,__h:[]}}function z(e,r){var t=e.contextType,n=t&&r[t.__c];return t!=null?n?n.props.value:t.__:r}var R=[];function q(e,r,t,n,a,d){if(e==null||typeof e=="boolean")return"";if(typeof e!="object")return $(e);var s=t.pretty,c=s&&typeof s=="string"?s:"	";if(Array.isArray(e)){for(var g="",b=0;b<e.length;b++)s&&b>0&&(g+=`
`),g+=q(e[b],r,t,n,a,d);return g}var m,i=e.type,y=e.props,v=!1;if(typeof i=="function"){if(v=!0,!t.shallow||!n&&t.renderRootComponent!==!1){if(i===de){var p=[];return H(p,e.props.children),q(p,r,t,t.shallowHighOrder!==!1,a,d)}var h,u=e.__c=ve(e,r);_.__b&&_.__b(e);var A=_.__r;if(i.prototype&&typeof i.prototype.render=="function"){var j=z(i,r);(u=e.__c=new i(y,j)).__v=e,u._dirty=u.__d=!0,u.props=y,u.state==null&&(u.state={}),u._nextState==null&&u.__s==null&&(u._nextState=u.__s=u.state),u.context=j,i.getDerivedStateFromProps?u.state=Object.assign({},u.state,i.getDerivedStateFromProps(u.props,u.state)):u.componentWillMount&&(u.componentWillMount(),u.state=u._nextState!==u.state?u._nextState:u.__s!==u.state?u.__s:u.state),A&&A(e),h=u.render(u.props,u.state,u.context)}else for(var k=z(i,r),L=0;u.__d&&L++<25;)u.__d=!1,A&&A(e),h=i.call(e.__c,y,k);return u.getChildContext&&(r=Object.assign({},r,u.getChildContext())),_.diffed&&_.diffed(e),q(h,r,t,t.shallowHighOrder!==!1,a,d)}i=(m=i).displayName||m!==Function&&m.name||function(J){var K=(Function.prototype.toString.call(J).match(/^\s*function\s+([^( ]+)/)||"")[1];if(!K){for(var V=-1,Y=R.length;Y--;)if(R[Y]===J){V=Y;break}V<0&&(V=R.push(J)-1),K="UnnamedComponent"+V}return K}(m)}var E,w,l="<"+i;if(y){var O=Object.keys(y);t&&t.sortAttributes===!0&&O.sort();for(var C=0;C<O.length;C++){var f=O[C],o=y[f];if(f!=="children"){if(!W.test(f)&&(t&&t.allAttributes||f!=="key"&&f!=="ref"&&f!=="__self"&&f!=="__source")){if(f==="defaultValue")f="value";else if(f==="defaultChecked")f="checked";else if(f==="defaultSelected")f="selected";else if(f==="className"){if(y.class!==void 0)continue;f="class"}else a&&he.test(f)&&(f=f.toLowerCase().replace(/^xlink:?/,"xlink:"));if(f==="htmlFor"){if(y.for)continue;f="for"}f==="style"&&o&&typeof o=="object"&&(o=_e(o)),f[0]==="a"&&f[1]==="r"&&typeof o=="boolean"&&(o=String(o));var x=t.attributeHook&&t.attributeHook(f,o,r,t,v);if(x||x==="")l+=x;else if(f==="dangerouslySetInnerHTML")w=o&&o.__html;else if(i==="textarea"&&f==="value")E=o;else if((o||o===0||o==="")&&typeof o!="function"){if(!(o!==!0&&o!==""||(o=f,t&&t.xml))){l=l+" "+f;continue}if(f==="value"){if(i==="select"){d=o;continue}i==="option"&&d==o&&y.selected===void 0&&(l+=" selected")}l=l+" "+f+'="'+$(o)+'"'}}}else E=o}}if(s){var P=l.replace(/\n\s*/," ");P===l||~P.indexOf(`
`)?s&&~l.indexOf(`
`)&&(l+=`
`):l=P}if(l+=">",W.test(i))throw new Error(i+" is not a valid HTML tag name in "+l);var N,me=pe.test(i)||t.voidElements&&t.voidElements.test(i),S=[];if(w)s&&se(w)&&(w=`
`+c+oe(w,c)),l+=w;else if(E!=null&&H(N=[],E).length){for(var B=s&&~l.indexOf(`
`),te=!1,G=0;G<N.length;G++){var X=N[G];if(X!=null&&X!==!1){var T=q(X,r,t,!0,i==="svg"||i!=="foreignObject"&&a,d);if(s&&!B&&se(T)&&(B=!0),T)if(s){var re=T.length>0&&T[0]!="<";te&&re?S[S.length-1]+=T:S.push(T),te=re}else S.push(T)}}if(s&&B)for(var Q=S.length;Q--;)S[Q]=`
`+c+oe(S[Q],c)}if(S.length||w)l+=S.join("");else if(t&&t.xml)return l.substring(0,l.length-1)+" />";return!me||N||w?(s&&~l.indexOf(`
`)&&(l+=`
`),l=l+"</"+i+">"):l=l.replace(/>$/," />"),l}var Ae={shallow:!0};U.render=U;var xe=function(e,r){return U(e,r,Ae)},fe=[];function U(e,r,t){r=r||{};var n,a=_.__s;return _.__s=!0,n=t&&(t.pretty||t.voidElements||t.sortAttributes||t.shallow||t.allAttributes||t.xml||t.attributeHook)?q(e,r,t):F(e,r,!1,void 0),_.__c&&_.__c(e,fe),_.__s=a,fe.length=0,n}function Se(e,r){return e==="className"?"class":e==="htmlFor"?"for":e==="defaultValue"?"value":e==="defaultChecked"?"checked":e==="defaultSelected"?"selected":r&&he.test(e)?e.toLowerCase().replace(/^xlink:?/,"xlink:"):e}function je(e,r){return e==="style"&&r!=null&&typeof r=="object"?_e(r):e[0]==="a"&&e[1]==="r"&&typeof r=="boolean"?String(r):r}var ue=Array.isArray,ce=Object.assign;function F(e,r,t,n){if(e==null||e===!0||e===!1||e==="")return"";if(typeof e!="object")return $(e);if(ue(e)){for(var a="",d=0;d<e.length;d++)a+=F(e[d],r,t,n);return a}_.__b&&_.__b(e);var s=e.type,c=e.props;if(typeof s=="function"){if(s===de)return F(e.props.children,r,t,n);var g;g=s.prototype&&typeof s.prototype.render=="function"?function(l,O){var C=l.type,f=z(C,O),o=new C(l.props,f);l.__c=o,o.__v=l,o.__d=!0,o.props=l.props,o.state==null&&(o.state={}),o.__s==null&&(o.__s=o.state),o.context=f,C.getDerivedStateFromProps?o.state=ce({},o.state,C.getDerivedStateFromProps(o.props,o.state)):o.componentWillMount&&(o.componentWillMount(),o.state=o.__s!==o.state?o.__s:o.state);var x=_.__r;return x&&x(l),o.render(o.props,o.state,o.context)}(e,r):function(l,O){var C,f=ve(l,O),o=z(l.type,O);l.__c=f;for(var x=_.__r,P=0;f.__d&&P++<25;)f.__d=!1,x&&x(l),C=l.type.call(f,l.props,o);return C}(e,r);var b=e.__c;b.getChildContext&&(r=ce({},r,b.getChildContext()));var m=F(g,r,t,n);return _.diffed&&_.diffed(e),m}var i,y,v="<";if(v+=s,c)for(var p in i=c.children,c){var h=c[p];if(!(p==="key"||p==="ref"||p==="__self"||p==="__source"||p==="children"||p==="className"&&"class"in c||p==="htmlFor"&&"for"in c||W.test(p))){if(h=je(p=Se(p,t),h),p==="dangerouslySetInnerHTML")y=h&&h.__html;else if(s==="textarea"&&p==="value")i=h;else if((h||h===0||h==="")&&typeof h!="function"){if(h===!0||h===""){h=p,v=v+" "+p;continue}if(p==="value"){if(s==="select"){n=h;continue}s!=="option"||n!=h||"selected"in c||(v+=" selected")}v=v+" "+p+'="'+$(h)+'"'}}}var u=v;if(v+=">",W.test(s))throw new Error(s+" is not a valid HTML tag name in "+v);var A="",j=!1;if(y)A+=y,j=!0;else if(typeof i=="string")A+=$(i),j=!0;else if(ue(i))for(var k=0;k<i.length;k++){var L=i[k];if(L!=null&&L!==!1){var E=F(L,r,s==="svg"||s!=="foreignObject"&&t,n);E&&(A+=E,j=!0)}}else if(i!=null&&i!==!1&&i!==!0){var w=F(i,r,s==="svg"||s!=="foreignObject"&&t,n);w&&(A+=w,j=!0)}if(_.diffed&&_.diffed(e),j)v+=A;else if(pe.test(s))return u+" />";return v+"</"+s+">"}U.shallowRender=xe;var Z={exports:{}},D={decodeValues:!0,map:!1,silent:!1};function I(e){return typeof e=="string"&&!!e.trim()}function ee(e,r){var t=e.split(";").filter(I),n=t.shift(),a=Oe(n),d=a.name,s=a.value;r=r?Object.assign({},D,r):D;try{s=r.decodeValues?decodeURIComponent(s):s}catch(g){console.error("set-cookie-parser encountered an error while decoding a cookie with value '"+s+"'. Set options.decodeValues to false to disable this feature.",g)}var c={name:d,value:s};return t.forEach(function(g){var b=g.split("="),m=b.shift().trimLeft().toLowerCase(),i=b.join("=");m==="expires"?c.expires=new Date(i):m==="max-age"?c.maxAge=parseInt(i,10):m==="secure"?c.secure=!0:m==="httponly"?c.httpOnly=!0:m==="samesite"?c.sameSite=i:c[m]=i}),c}function Oe(e){var r="",t="",n=e.split("=");return n.length>1?(r=n.shift(),t=n.join("=")):t=e,{name:r,value:t}}function ge(e,r){if(r=r?Object.assign({},D,r):D,!e)return r.map?{}:[];if(e.headers)if(typeof e.headers.getSetCookie=="function")e=e.headers.getSetCookie();else if(e.headers["set-cookie"])e=e.headers["set-cookie"];else{var t=e.headers[Object.keys(e.headers).find(function(a){return a.toLowerCase()==="set-cookie"})];!t&&e.headers.cookie&&!r.silent&&console.warn("Warning: set-cookie-parser appears to have been called on a request object. It is designed to parse Set-Cookie headers from responses, not Cookie headers from requests. Set the option {silent: true} to suppress this warning."),e=t}if(Array.isArray(e)||(e=[e]),r=r?Object.assign({},D,r):D,r.map){var n={};return e.filter(I).reduce(function(a,d){var s=ee(d,r);return a[s.name]=s,a},n)}else return e.filter(I).map(function(a){return ee(a,r)})}function Ee(e){if(Array.isArray(e))return e;if(typeof e!="string")return[];var r=[],t=0,n,a,d,s,c;function g(){for(;t<e.length&&/\s/.test(e.charAt(t));)t+=1;return t<e.length}function b(){return a=e.charAt(t),a!=="="&&a!==";"&&a!==","}for(;t<e.length;){for(n=t,c=!1;g();)if(a=e.charAt(t),a===","){for(d=t,t+=1,g(),s=t;t<e.length&&b();)t+=1;t<e.length&&e.charAt(t)==="="?(c=!0,t=s,r.push(e.substring(n,d)),n=t):t=d+1}else t+=1;(!c||t>=e.length)&&r.push(e.substring(n,e.length))}return r}Z.exports=ge;Z.exports.parse=ge;Z.exports.parseString=ee;Z.exports.splitCookiesString=Ee;function Te(e){const r=ne(M("s_0BV7Pjvi9oE",[e]),ae()),t=ne(M("s_DcikjRBIaDE",[e]),ae()),n=ye(M("s_g8XUlGCLMBQ"));return{useAuthSignin:r,useAuthSignout:t,useAuthSession:n,onRequest:async d=>{}}}const{onRequest:ke,useAuthSession:Le,useAuthSignin:Pe,useAuthSignout:qe}=Te(M("s_obiOTa3kq10"));export{Pe as u};