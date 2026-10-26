import {useEffect,useRef} from "react";
import {createHistoryScrollRestoration} from "@/lib/history-scroll-restoration";
export function RouteScrollRestoration({location}:{location:string}) {
  const controller=useRef<ReturnType<typeof createHistoryScrollRestoration>|null>(null);
  useEffect(()=>{
    controller.current=createHistoryScrollRestoration();
    return()=>{controller.current?.dispose();controller.current=null;};
  },[]);
  useEffect(()=>{controller.current?.rendered();},[location]);
  return null;
}
