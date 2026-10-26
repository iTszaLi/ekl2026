type Position={x:number;y:number};
const STATE_KEY="__envodScrollEntry";
const STORAGE_KEY="envod.history.scroll.v1";
const memory=new Map<string,Position>();
const id=()=>crypto.randomUUID();
const pathname=(value:string)=>new URL(value,location.href).pathname.replace(/\/+$/,"")||"/";
const restorePosition=(x:number,y:number)=>{
  // Restore native scroll immediately; load the animation engine only for its
  // Lenis/ScrollTrigger synchronization so it stays out of the entry bundle.
  window.scrollTo({left:x,top:y,behavior:"instant"});
  void import("./scroll-engine").then(({restoreScrollPosition})=>{
    if(Math.abs(window.scrollX-x)<=2&&Math.abs(window.scrollY-y)<=2)restoreScrollPosition(x,y);
  }).catch(error=>console.error("Unable to synchronize scroll after history restoration",error));
};

/** One position per native history entry, never one shared value per pathname. */
export function createHistoryScrollRestoration() {
  const push=history.pushState,replace=history.replaceState,oldMode=history.scrollRestoration;
  let active=history.state?.[STATE_KEY] as string|undefined;
  let currentPath=pathname(location.href),outgoingPath=currentPath,outgoingMain=document.querySelector("main");
  let explicitAnchor:string|null=null,popHref="";
  let disposed=false,pending=false,frame=0,saveFrame=0,deadline=0;
  let observer:MutationObserver|undefined,resize:ResizeObserver|undefined;
  let target:Position|"anchor"|null=null;
  let request:()=>void=()=>{};
  try {
    const saved=JSON.parse(sessionStorage.getItem(STORAGE_KEY)||"[]") as [string,Position][];
    for(const [key,value]of saved)if(typeof key==="string"&&Number.isFinite(value?.x)&&Number.isFinite(value?.y)&&value.x>=0&&value.y>=0)memory.set(key,value);
  }catch {console.warn("[scroll-restoration] Stored positions unavailable; using this document's memory.");}
  const persist=()=>{
    while(memory.size>120)memory.delete(memory.keys().next().value!);
    try{sessionStorage.setItem(STORAGE_KEY,JSON.stringify([...memory]));}
    catch{ /* The in-memory map still supports same-document history. */ }
  };
  const adopt=(key=active||id())=>{
    active=key;
    replace.call(history,{...(history.state||{}),[STATE_KEY]:key},"",location.href);
  };
  adopt();
  const save=()=>{
    if(!active)return;
    memory.set(active,{x:window.scrollX,y:window.scrollY});persist();
  };
  const cancel=()=>{
    pending=false;cancelAnimationFrame(frame);clearTimeout(deadline);
    observer?.disconnect();resize?.disconnect();observer=undefined;resize=undefined;
  };
  const interrupt=()=>{cancel();target=null;save();};
  const ready=()=>{
    if(pathname(location.href)===outgoingPath)return true;
    const canonical=document.querySelector<HTMLLinkElement>('link[rel="canonical"]');
    if(canonical&&pathname(canonical.href)===pathname(location.href))return true;
    const main=document.querySelector("main");
    return !!main&&main!==outgoingMain&&(main.textContent?.trim().length||0)>30;
  };
  const desired=():Position|null=>{
    if(target!=="anchor")return target;
    let anchorId:string;
    try{anchorId=decodeURIComponent(location.hash.slice(1));}catch{return null;}
    const element=document.getElementById(anchorId)||document.getElementsByName(anchorId)[0];
    if(!element)return null;
    const header=document.querySelector("header");
    const offset=header?.getBoundingClientRect().height||0;
    return {x:0,y:Math.max(0,element.getBoundingClientRect().top+window.scrollY-offset-12)};
  };
  const attempt=(final=false)=>{
    if(disposed||!pending||!ready())return;
    const position=desired();if(!position)return;
    const limit=Math.max(0,document.documentElement.scrollHeight-innerHeight);
    // Do not clamp a saved deep position to a lazy route's short fallback.
    if(!final&&limit+2<position.y)return;
    const y=Math.min(position.y,limit);
    if(Math.abs(window.scrollY-y)>2||Math.abs(window.scrollX-position.x)>2)restorePosition(position.x,y);
    if(final){cancel();target=null;save();}
  };
  request=()=>{
    if(!pending||disposed)return;
    cancelAnimationFrame(frame);
    frame=requestAnimationFrame(()=>attempt());
  };
  const restore=(position:Position|"anchor"|null)=>{
    cancel();target=position;
    if(!position){history.scrollRestoration=oldMode;return;}
    history.scrollRestoration="manual";pending=true;
    observer=new MutationObserver(request);
    observer.observe(document.documentElement,{childList:true,subtree:true,attributes:true,attributeFilter:["href"]});
    resize=new ResizeObserver(request);resize.observe(document.body);
    document.fonts?.ready.then(request);
    deadline=window.setTimeout(()=>{attempt(true);if(pending){cancel();target=null;save();}},5000);
    request();
  };
  const originalPosition=memory.get(active!);
  const navigation=(performance.getEntriesByType("navigation")[0]as PerformanceNavigationTiming|undefined)?.type;
  restore((navigation==="back_forward"||navigation==="reload")?originalPosition||null:location.hash?"anchor":{x:0,y:0});
  const newPush:History["pushState"]=function(state,title,url){
    cancel();save();outgoingPath=pathname(location.href);outgoingMain=document.querySelector("main");
    active=id();explicitAnchor=null;
    const result=push.call(history,{...(state||{}),[STATE_KEY]:active},title,url);
    currentPath=pathname(location.href);
    restore(location.hash?"anchor":{x:0,y:0});return result;
  };
  const newReplace:History["replaceState"]=function(state,title,url){
    const changed=!!url&&pathname(String(url))!==pathname(location.href);
    if(changed){cancel();save();outgoingPath=pathname(location.href);outgoingMain=document.querySelector("main");active=id();}
    const result=replace.call(history,{...(state||{}),[STATE_KEY]:active},title,url);
    currentPath=pathname(location.href);
    if(changed)restore(location.hash?"anchor":{x:0,y:0});
    return result;
  };
  history.pushState=newPush;history.replaceState=newReplace;
  const onPop=(event:PopStateEvent)=>{
    cancel();save();outgoingPath=currentPath;outgoingMain=document.querySelector("main");
    const intended=explicitAnchor===location.href;
    const key=event.state?.[STATE_KEY]as string|undefined;
    const saved=key?memory.get(key):undefined;
    adopt(intended?id():key||id());popHref=location.href;explicitAnchor=null;
    restore(intended?"anchor":saved||(!key&&location.hash?"anchor":null));
    currentPath=pathname(location.href);
  };
  const onHash=()=>{
    if(popHref===location.href){popHref="";return;}
    cancel();save();adopt(id());explicitAnchor=null;restore(location.hash?"anchor":{x:0,y:0});
  };
  const onClick=(event:MouseEvent)=>{
    if(event.button||event.metaKey||event.ctrlKey||event.altKey||event.shiftKey)return;
    const link=(event.target as Element)?.closest?.("a");
    if(!link||link.target==="_blank"||link.hasAttribute("download"))return;
    const url=new URL(link.href);
    if(url.origin!==location.origin)return;
    if(url.hash&&pathname(url.href)===pathname(location.href)){
      cancel();save();explicitAnchor=url.href;
      // Native same-fragment activation may emit popstate without hashchange.
      requestAnimationFrame(()=>{if(explicitAnchor===location.href){explicitAnchor=null;restore("anchor");}});
    } else if(url.href===location.href){cancel();save();restore({x:0,y:0});}
  };
  const onScroll=()=>{
    if(pending||saveFrame)return;
    saveFrame=requestAnimationFrame(()=>{saveFrame=0;save();});
  };
  const onHide=()=>{cancel();save();};
  const onShow=(event:PageTransitionEvent)=>{if(event.persisted){cancel();target=null;save();}};
  const keyDown=(event:KeyboardEvent)=>{if(["ArrowUp","ArrowDown","PageUp","PageDown","Home","End"," ","Enter"].includes(event.key))interrupt();};
  window.addEventListener("popstate",onPop,true);window.addEventListener("hashchange",onHash);
  window.addEventListener("scroll",onScroll,{passive:true});
  window.addEventListener("pagehide",onHide);window.addEventListener("pageshow",onShow);
  window.addEventListener("wheel",interrupt,{passive:true});window.addEventListener("touchstart",interrupt,{passive:true});
  window.addEventListener("pointerdown",interrupt,{passive:true});window.addEventListener("keydown",keyDown);
  document.addEventListener("click",onClick,true);document.addEventListener("load",request,true);
  return {
    rendered:request,
    dispose(){
      cancel();save();disposed=true;cancelAnimationFrame(saveFrame);
      if(history.pushState===newPush)history.pushState=push;
      if(history.replaceState===newReplace)history.replaceState=replace;
      history.scrollRestoration=oldMode;
      window.removeEventListener("popstate",onPop,true);window.removeEventListener("hashchange",onHash);
      window.removeEventListener("scroll",onScroll);window.removeEventListener("pagehide",onHide);window.removeEventListener("pageshow",onShow);
      window.removeEventListener("wheel",interrupt);window.removeEventListener("touchstart",interrupt);
      window.removeEventListener("pointerdown",interrupt);window.removeEventListener("keydown",keyDown);
      document.removeEventListener("click",onClick,true);document.removeEventListener("load",request,true);
    },
  };
}
