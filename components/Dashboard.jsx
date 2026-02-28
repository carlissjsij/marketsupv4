"use client";
import { useState, useRef, useEffect, useMemo } from "react";
import { authenticate, syncAll } from "../lib/api-client";
import { buildDashboard } from "../lib/transform";

/* ═══════════════════════════════════════════════════════════
   MarketSUP.AI v4 — Power BI Premium
   Light KPI Cards · Dark Chrome · Full Icons · YoY Highlight
   ═══════════════════════════════════════════════════════════ */

const D = {
  chrome: "#0C0C10", chrome2: "#111116", chrome3: "#17171E",
  panel: "#1C1C24", panelHover: "#222230",
  bd: "#2A2A38", bd2: "#33334A",
  card: "#FAFAFA", cardAlt: "#F3F3F6", cardDark: "#EDEDF2",
  cardBd: "#E2E2EA",
  gold: "#B8960F", goldSoft: "#D4AF37", goldBg: "rgba(212,175,55,.06)",
  green: "#1B9E4B", greenSoft: "#27AE60", greenBg: "#E8F8EF", greenBgD: "rgba(39,174,96,.08)",
  red: "#D32F2F", redSoft: "#E74C3C", redBg: "#FDECEC", redBgD: "rgba(231,76,60,.08)",
  blue: "#2563EB", blueBg: "#EBF2FF",
  orange: "#E67E22", orangeBg: "#FFF3E0",
  purple: "#7C3AED", purpleBg: "#F3EEFF",
  cyan: "#0891B2",
  tx: "#1A1A2E", txSec: "#6B6B80", txDim: "#9898AD",
  txLight: "#E8E8F0", txLightSec: "#A0A0B5", txLightDim: "#666680",
  wh: "#FFFFFF",
};
const F = "'Manrope',sans-serif", FM = "'IBM Plex Mono',monospace";

// ══════════ DATA ══════════
const PRODUTOS=[{id:1,nome:"Arroz Seleto T1 5kg",grupo:"Mercearia",sub:"Arroz",marca:"Seleto",curva:"A",custo:14.50,preco:13.32,mg:-8.87,vd:15370,qtd:1060,est:342,forn:"Camil Alimentos",lucro:-1252,meta_mg:25},{id:2,nome:"Leite LV Terra Viva 1L",grupo:"Laticínios",sub:"Leite",marca:"Terra Viva",curva:"A",custo:4.56,preco:3.88,mg:-17.44,vd:3784,qtd:830,est:120,forn:"Laticínios Terra Viva",lucro:-562,meta_mg:20},{id:3,nome:"Café São Joaquim 500g",grupo:"Mercearia",sub:"Café",marca:"São Joaquim",curva:"A",custo:25.02,preco:23.14,mg:-8.15,vd:6606,qtd:264,est:89,forn:"Café São Joaquim",lucro:-498,meta_mg:28},{id:4,nome:"Açúcar Cristal União 5kg",grupo:"Mercearia",sub:"Açúcar",marca:"União",curva:"A",custo:18.90,preco:22.90,mg:17.47,vd:8920,qtd:389,est:215,forn:"Camil Alimentos",lucro:1558,meta_mg:22},{id:5,nome:"Feijão Carioca 1kg",grupo:"Mercearia",sub:"Feijão",marca:"Kicaldo",curva:"A",custo:6.80,preco:8.49,mg:19.91,vd:4350,qtd:512,est:178,forn:"Kicaldo Alimentos",lucro:865,meta_mg:20},{id:6,nome:"Óleo Soja 900ml",grupo:"Mercearia",sub:"Óleo",marca:"Soya",curva:"B",custo:5.10,preco:6.29,mg:18.92,vd:3200,qtd:508,est:230,forn:"Bunge Alimentos",lucro:605,meta_mg:18},{id:7,nome:"Farinha Trigo 1kg",grupo:"Mercearia",sub:"Farinha",marca:"Dona Benta",curva:"B",custo:4.20,preco:5.79,mg:27.46,vd:2890,qtd:499,est:312,forn:"J.Macêdo",lucro:793,meta_mg:25},{id:8,nome:"Macarrão 500g",grupo:"Mercearia",sub:"Massa",marca:"Adria",curva:"B",custo:2.80,preco:3.99,mg:29.82,vd:2100,qtd:526,est:445,forn:"Pastificio Adria",lucro:626,meta_mg:28},{id:9,nome:"Catchup Heinz 397g",grupo:"Mercearia",sub:"Molhos",marca:"Heinz",curva:"B",custo:8.90,preco:12.99,mg:31.49,vd:1820,qtd:140,est:67,forn:"Kraft Heinz",lucro:573,meta_mg:30},{id:10,nome:"Acém KG",grupo:"Açougue",sub:"Bovino",marca:"—",curva:"A",custo:32.90,preco:39.90,mg:17.54,vd:69159,qtd:1733,est:89,forn:"Frigorífico JBS",lucro:12128,meta_mg:22},{id:11,nome:"Costela Bovina KG",grupo:"Açougue",sub:"Bovino",marca:"—",curva:"A",custo:28.50,preco:34.90,mg:18.34,vd:24698,qtd:707,est:45,forn:"Frigorífico JBS",lucro:4529,meta_mg:20},{id:12,nome:"Banana Prata KG",grupo:"FLV",sub:"Frutas",marca:"—",curva:"A",custo:2.80,preco:4.99,mg:43.89,vd:8970,qtd:1797,est:380,forn:"CEASA Regional",lucro:3937,meta_mg:35},{id:13,nome:"Tomate Italiano KG",grupo:"FLV",sub:"Verduras",marca:"—",curva:"B",custo:5.50,preco:8.99,mg:38.82,vd:5394,qtd:600,est:120,forn:"CEASA Regional",lucro:2094,meta_mg:30},{id:14,nome:"Pão Francês KG",grupo:"Padaria",sub:"Pães",marca:"Próprio",curva:"A",custo:4.20,preco:14.99,mg:71.98,vd:18750,qtd:1250,est:0,forn:"Produção Própria",lucro:13500,meta_mg:55},{id:15,nome:"Cerveja Skol 350ml",grupo:"Bebidas",sub:"Cerveja",marca:"Skol",curva:"A",custo:2.60,preco:3.49,mg:25.50,vd:12540,qtd:3594,est:1200,forn:"Ambev",lucro:3198,meta_mg:22},{id:16,nome:"Coca-Cola 2L",grupo:"Bebidas",sub:"Refrigerante",marca:"Coca-Cola",curva:"A",custo:6.80,preco:8.99,mg:24.36,vd:9890,qtd:1100,est:560,forn:"Coca-Cola FEMSA",lucro:2409,meta_mg:20},{id:17,nome:"Detergente Ypê 500ml",grupo:"Limpeza",sub:"Detergente",marca:"Ypê",curva:"B",custo:1.90,preco:2.99,mg:36.45,vd:1794,qtd:600,est:890,forn:"Química Amparo",lucro:654,meta_mg:30},{id:18,nome:"Sabonete Dove 90g",grupo:"Higiene",sub:"Sabonete",marca:"Dove",curva:"C",custo:3.40,preco:4.99,mg:31.86,vd:998,qtd:200,est:340,forn:"Unilever",lucro:318,meta_mg:28},{id:19,nome:"Leite Hercules 1L",grupo:"Laticínios",sub:"Leite",marca:"Hercules",curva:"A",custo:4.19,preco:3.82,mg:-9.69,vd:24184,qtd:6337,est:200,forn:"Laticínios Hercules",lucro:-2365,meta_mg:18},{id:20,nome:"Linguiça Toscana Frimesa",grupo:"Frios",sub:"Embutidos",marca:"Frimesa",curva:"B",custo:10.79,preco:9.98,mg:-8.12,vd:1597,qtd:160,est:34,forn:"Frimesa",lucro:-129,meta_mg:22}];

const SETORES=[{n:"Mercearia",vd:823400,cp:612000,mg:28.5,pt:28.3,rcv:74.3,mv:850000,mm:27,sk:1420},{n:"Açougue",vd:521300,cp:498000,mg:24.7,pt:17.9,rcv:95.5,mv:500000,mm:25,sk:85},{n:"FLV",vd:312500,cp:198000,mg:38.2,pt:10.7,rcv:63.4,mv:300000,mm:35,sk:210},{n:"Padaria",vd:289100,cp:142000,mg:52.1,pt:9.9,rcv:49.1,mv:280000,mm:48,sk:95},{n:"Bebidas",vd:445600,cp:389000,mg:22.3,pt:15.3,rcv:87.3,mv:460000,mm:23,sk:680},{n:"Frios/Latic.",vd:298400,cp:215000,mg:31.4,pt:10.3,rcv:72.1,mv:310000,mm:30,sk:340},{n:"Limpeza",vd:142300,cp:108000,mg:26.8,pt:4.9,rcv:75.9,mv:150000,mm:28,sk:380},{n:"Higiene",vd:77800,cp:58000,mg:29.1,pt:2.7,rcv:74.5,mv:80000,mm:27,sk:290}];

const FORN=[{n:"Camil Alimentos",cp:189400,pr:34,lt:3,cd:"28/42 DDL",uc:"25/02"},{n:"Frigorífico JBS",cp:312000,pr:18,lt:1,cd:"7/14 DDL",uc:"27/02"},{n:"Ambev",cp:145600,pr:42,lt:2,cd:"21 DDL",uc:"26/02"},{n:"Coca-Cola FEMSA",cp:98700,pr:28,lt:2,cd:"21 DDL",uc:"24/02"},{n:"Bunge Alimentos",cp:78900,pr:12,lt:4,cd:"28 DDL",uc:"22/02"},{n:"CEASA Regional",cp:67800,pr:95,lt:0,cd:"À Vista",uc:"27/02"},{n:"Kraft Heinz",cp:45200,pr:22,lt:5,cd:"42 DDL",uc:"20/02"},{n:"Unilever",cp:89300,pr:65,lt:3,cd:"28/42 DDL",uc:"23/02"}];

const VD7=[{d:"Seg",v:412300,m:420000},{d:"Ter",v:389500,m:420000},{d:"Qua",v:445200,m:420000},{d:"Qui",v:478100,m:420000},{d:"Sex",v:523400,m:480000},{d:"Sáb",v:612800,m:560000},{d:"Dom",v:298100,m:320000}];

const API_EPS=[{cat:"Cadastros",c:D.blue,eps:["/usuarios","/clientes","/fornecedores","/compradores","/vendedores"]},{cat:"Produtos",c:D.green,eps:["/produtos","/produtos/estoque","/produtos/precos","/produtos/embalagens","/produtos/locais","/produtos/marcas","/produtos/grupos","/produtos/subgrupos"]},{cat:"Vendas",c:D.goldSoft,eps:["/vendas","/vendas/hoje","/vendas/finalizadoras","/pdv","/saidas","/saidas/produtos","/saidas/chave"]},{cat:"Compras",c:D.orange,eps:["/entradas","/entradas/produtos","/entradas/pedidoscompra","/entradas/chave","/pedidoscompra","/pedidoscompra/produtos","/pedidoscompra/status"]},{cat:"Financeiro",c:D.cyan,eps:["/contas/receber","/contas/pagar","/despesas","/condicoespagamento","/prazospagamento"]},{cat:"Fiscal",c:D.purple,eps:["/nfs","/nfs/servicos","/series","/seriesNFS","/servicos","/servicosmunicipio"]},{cat:"Preços",c:D.red,eps:["/tabelaspreco","/tabelaspreco/itens"]}];

// ══════════ UTILS ══════════
const fmt=n=>{if(n==null)return"—";if(Math.abs(n)>=1e6)return(n/1e6).toFixed(2).replace(".",",")+"M";if(Math.abs(n)>=1e3)return n.toLocaleString("pt-BR");return typeof n==="number"?n.toFixed(n%1?2:0).replace(".",","):n};
const fR=n=>"R$ "+fmt(n);

// ══════════ YOY BADGE — BIG & PROMINENT ══════════
function YoY({v,size="normal"}){
  if(v==null)return null;
  const pos=v>=0;
  const bg=pos?D.greenBg:D.redBg;
  const cl=pos?D.green:D.red;
  const sz=size==="big";
  return(
    <div style={{display:"inline-flex",alignItems:"center",gap:3,padding:sz?"4px 10px":"3px 8px",borderRadius:6,background:bg,border:`1px solid ${cl}22`}}>
      <span style={{fontSize:sz?11:9,fontWeight:800,color:cl,fontFamily:FM}}>{pos?"▲":"▼"} {Math.abs(v).toFixed(1).replace(".",",")}%</span>
      {sz&&<span style={{fontSize:8,color:cl,opacity:.7}}>YoY</span>}
    </div>
  );
}

// ══════════ KPI CARD — WHITE CARD STYLE ══════════
function KPI({icon,title,value,meta,yoy,pfx="",sfx="",color=D.goldSoft,size="normal",spark}){
  const hit=meta!=null?(sfx==="%"?value>=meta:value>=meta):null;
  const big=size==="big";
  const metaPct=meta?((value/meta)*100):null;
  return(
    <div style={{
      background:D.card,borderRadius:12,padding:big?"18px 20px":"14px 16px",
      border:`1px solid ${D.cardBd}`,position:"relative",overflow:"hidden",
      boxShadow:"0 1px 3px rgba(0,0,0,.04)",transition:"box-shadow .2s",
    }}>
      {/* Top color bar */}
      <div style={{position:"absolute",top:0,left:0,right:0,height:3,background:hit===false?D.red:color,opacity:.7,borderRadius:"12px 12px 0 0"}}/>
      
      {/* Header row: icon + title + YoY */}
      <div style={{display:"flex",justifyContent:"space-between",alignItems:"flex-start",marginBottom:big?10:6}}>
        <div style={{display:"flex",alignItems:"center",gap:6}}>
          <span style={{fontSize:big?18:15}}>{icon}</span>
          <span style={{fontSize:big?11:10,color:D.txSec,fontWeight:700,letterSpacing:.3,textTransform:"uppercase"}}>{title}</span>
        </div>
        <YoY v={yoy} size={big?"big":"normal"}/>
      </div>

      {/* Value */}
      <div style={{display:"flex",alignItems:"flex-end",gap:8}}>
        <div style={{
          fontSize:big?30:22,fontWeight:800,letterSpacing:-1,lineHeight:1,fontFamily:FM,
          color:hit===false?D.red:D.tx,
        }}>
          {pfx}{typeof value==="number"?(sfx==="%"?value.toFixed(2).replace(".",","):fmt(value)):value}{sfx}
        </div>
        {spark&&<Spark data={spark} color={color}/>}
      </div>

      {/* Meta bar */}
      {meta!=null&&(
        <div style={{marginTop:big?12:8,display:"flex",alignItems:"center",gap:8}}>
          <span style={{fontSize:9,color:D.txDim,fontWeight:600}}>Meta</span>
          <span style={{fontSize:10,color:D.txSec,fontFamily:FM,fontWeight:700}}>{pfx}{sfx==="%"?meta.toFixed(2).replace(".",","):fmt(meta)}{sfx}</span>
          <div style={{flex:1,height:4,background:D.cardDark,borderRadius:2,overflow:"hidden"}}>
            <div style={{width:`${Math.min(metaPct,100)}%`,height:"100%",borderRadius:2,background:hit?D.green:D.red,transition:"width .8s ease"}}/>
          </div>
          <span style={{
            fontSize:9,fontWeight:800,fontFamily:FM,
            padding:"2px 6px",borderRadius:4,
            background:hit?D.greenBg:D.redBg,color:hit?D.green:D.red,
          }}>{metaPct?.toFixed(0)}%</span>
        </div>
      )}
    </div>
  );
}

function Spark({data,w=70,h=24,color=D.goldSoft}){
  const mx=Math.max(...data),mn=Math.min(...data);
  const pts=data.map((v,i)=>`${(i/(data.length-1))*w},${h-((v-mn)/(mx-mn||1))*h}`).join(" ");
  return(<svg width={w} height={h}><polyline points={pts} fill="none" stroke={color} strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" opacity=".6"/></svg>);
}

function Tag({text,color}){return(<span style={{display:"inline-block",padding:"3px 9px",borderRadius:5,fontSize:9,fontWeight:700,letterSpacing:.3,background:color+"15",color,border:`1px solid ${color}25`}}>{text}</span>);}

// ══════════ SECTION TITLE ══════════
function Section({icon,title,children}){
  return(
    <div>
      <div style={{display:"flex",alignItems:"center",gap:8,marginBottom:10}}>
        <span style={{fontSize:16}}>{icon}</span>
        <span style={{fontSize:12,fontWeight:800,color:D.txLight,letterSpacing:.5,textTransform:"uppercase"}}>{title}</span>
        <div style={{flex:1,height:1,background:D.bd,marginLeft:8}}/>
      </div>
      {children}
    </div>
  );
}

// ══════════ PERIOD FILTER ══════════
function PeriodFilter({period,setPeriod}){
  return(
    <div style={{display:"flex",gap:4,alignItems:"center",flexWrap:"wrap"}}>
      {["Hoje","7 Dias","15 Dias","Mensal","Trimestral","Anual","Personalizado"].map(p=>(
        <button key={p} onClick={()=>setPeriod(p)} style={{padding:"6px 14px",borderRadius:7,border:`1px solid ${period===p?D.goldSoft+"60":D.bd}`,background:period===p?D.goldBg:"transparent",color:period===p?D.goldSoft:D.txLightDim,fontSize:10,fontWeight:700,cursor:"pointer",fontFamily:F,transition:"all .15s"}}>{p}</button>
      ))}
      <div style={{width:1,height:24,background:D.bd,margin:"0 4px"}}/>
      {[["Loja","Todas"],["Setor","Todos"],["Curva","ABC"]].map(([l,v])=>(
        <div key={l} style={{padding:"6px 12px",borderRadius:7,background:D.panel,border:`1px solid ${D.bd}`,fontSize:10,color:D.txLightSec,display:"flex",gap:4,alignItems:"center",cursor:"pointer"}}>
          <span style={{color:D.txLightDim}}>{l}:</span><span style={{fontWeight:700,color:D.txLight}}>{v}</span><span style={{fontSize:7,color:D.txLightDim}}>&#9662;</span>
        </div>
      ))}
    </div>
  );
}

// ══════════ HEADER ══════════
function Hdr({title,sub,children}){
  return(
    <div style={{padding:"14px 24px",borderBottom:`1px solid ${D.bd}`,display:"flex",justifyContent:"space-between",alignItems:"center",flexWrap:"wrap",gap:10}}>
      <div><h1 style={{margin:0,fontSize:18,fontWeight:800,color:D.txLight,fontFamily:F,letterSpacing:-.5}}>{title}</h1>{sub&&<p style={{margin:"2px 0 0",fontSize:11,color:D.txLightDim}}>{sub}</p>}</div>
      {children}
    </div>
  );
}

// ══════════ BAR CHART ══════════
function BarChart({data,h=130}){
  const mx=Math.max(...data.map(d=>Math.max(d.v,d.m||0)));
  return(
    <div style={{display:"flex",alignItems:"flex-end",gap:6,height:h}}>
      {data.map((d,i)=>(
        <div key={i} style={{flex:1,display:"flex",flexDirection:"column",alignItems:"center",gap:3}}>
          <div style={{display:"flex",alignItems:"flex-end",gap:2,height:h-20,width:"100%"}}>
            <div style={{flex:1,borderRadius:"4px 4px 0 0",height:`${(d.v/mx)*100}%`,background:`linear-gradient(180deg,${D.goldSoft},${D.gold})`,transition:"height .8s"}}/>
            {d.m!=null&&<div style={{flex:1,borderRadius:"4px 4px 0 0",height:`${(d.m/mx)*100}%`,background:D.chrome3,opacity:.4,transition:"height .8s"}}/>}
          </div>
          <span style={{fontSize:8,color:D.txLightDim,fontFamily:FM}}>{d.d}</span>
        </div>
      ))}
    </div>
  );
}

function Donut({segs,sz=90}){const tot=segs.reduce((a,s)=>a+s.v,0);let cum=0;return(<svg width={sz} height={sz} viewBox="0 0 42 42"><circle cx="21" cy="21" r="15.9" fill="none" stroke={D.chrome} strokeWidth="4.5"/>{segs.map((s,i)=>{const p=(s.v/tot)*100;const o=100-cum+25;cum+=p;return(<circle key={i} cx="21" cy="21" r="15.9" fill="none" stroke={s.c} strokeWidth="4.5" strokeDasharray={`${p} ${100-p}`} strokeDashoffset={o}/>);})}</svg>);}

// ══════════ SIDEBAR ══════════
const NAV=[{id:"dash",ic:"📊",lb:"Performance"},{id:"comp",ic:"📦",lb:"Compras"},{id:"prod",ic:"🏷️",lb:"Produtos"},{id:"ofer",ic:"🎯",lb:"Ofertas"},{id:"prec",ic:"💲",lb:"Pricing"},{id:"forn",ic:"🤝",lb:"Fornecedores"},{id:"fin",ic:"💰",lb:"Financeiro"},{id:"ai",ic:"🧠",lb:"IA"},{id:"cfg",ic:"⚙️",lb:"Config"}];

function Side({a,set,connected,syncing}){
  return(
    <div style={{width:66,background:D.chrome,borderRight:`1px solid ${D.bd}`,display:"flex",flexDirection:"column",alignItems:"center",paddingTop:12,gap:2,flexShrink:0}}>
      <div style={{width:38,height:38,borderRadius:10,marginBottom:8,background:`linear-gradient(135deg,${D.goldSoft},${D.gold})`,display:"flex",alignItems:"center",justifyContent:"center",fontSize:15,fontWeight:900,color:D.chrome,fontFamily:F,boxShadow:`0 2px 8px ${D.goldSoft}40`}}>M</div>
      {/* Connection indicator */}
      <div style={{width:36,padding:"4px 0",marginBottom:8,borderRadius:6,background:connected?D.greenBgD:syncing?D.orangeBg+"15":D.redBgD,display:"flex",flexDirection:"column",alignItems:"center",gap:2}}>
        <div style={{width:6,height:6,borderRadius:"50%",background:connected?D.greenSoft:syncing?D.orange:D.redSoft,boxShadow:connected?`0 0 4px ${D.greenSoft}`:"none",...(syncing?{animation:"pulse 1s infinite"}:{})}}/>
        <span style={{fontSize:6,fontWeight:700,color:connected?D.greenSoft:syncing?D.orange:D.redSoft,letterSpacing:.2}}>{connected?"ON":syncing?"...":"OFF"}</span>
      </div>
      {NAV.map(n=>(
        <button key={n.id} onClick={()=>set(n.id)} title={n.lb} style={{width:50,height:48,borderRadius:10,border:"none",cursor:"pointer",display:"flex",flexDirection:"column",alignItems:"center",justifyContent:"center",gap:2,background:a===n.id?D.goldBg:"transparent",color:a===n.id?D.goldSoft:D.txLightDim,transition:"all .15s",position:"relative"}}>
          {a===n.id&&<div style={{position:"absolute",left:0,top:"20%",bottom:"20%",width:3,borderRadius:"0 4px 4px 0",background:D.goldSoft}}/>}
          <span style={{fontSize:17,lineHeight:1}}>{n.ic}</span>
          <span style={{fontSize:7,fontWeight:700,letterSpacing:.2}}>{n.lb}</span>
        </button>
      ))}
    </div>
  );
}

// ══════════ DETAIL PANEL ══════════
function DetailPanel({item,type,onClose}){
  if(!item)return null;
  return(
    <div style={{position:"fixed",inset:0,zIndex:1000,display:"flex",justifyContent:"flex-end"}} onClick={onClose}>
      <div style={{position:"absolute",inset:0,background:"rgba(0,0,0,.5)",backdropFilter:"blur(3px)"}}/>
      <div onClick={e=>e.stopPropagation()} style={{position:"relative",width:460,maxWidth:"92vw",height:"100vh",background:D.chrome2,borderLeft:`1px solid ${D.bd}`,overflowY:"auto",padding:24,display:"flex",flexDirection:"column",gap:16}}>
        <div style={{display:"flex",justifyContent:"space-between",alignItems:"flex-start"}}>
          <div>
            <Tag text={type==="produto"?`Curva ${item.curva}`:type==="setor"?"Setor":"Fornecedor"} color={type==="produto"?(item.mg<0?D.red:D.green):D.goldSoft}/>
            <h2 style={{fontSize:18,fontWeight:800,color:D.txLight,margin:"8px 0 2px",fontFamily:F}}>{item.nome||item.n}</h2>
            {type==="produto"&&<p style={{fontSize:11,color:D.txLightSec}}>{item.grupo} &rarr; {item.sub} &middot; {item.marca}</p>}
          </div>
          <button onClick={onClose} style={{background:D.panel,border:`1px solid ${D.bd}`,color:D.txLightSec,width:30,height:30,borderRadius:8,cursor:"pointer",fontSize:13,display:"flex",alignItems:"center",justifyContent:"center"}}>&#215;</button>
        </div>
        {type==="produto"&&(
          <>
            <div style={{display:"grid",gridTemplateColumns:"1fr 1fr",gap:8}}>
              <KPI icon="💵" title="Preço" value={item.preco} pfx="R$ " color={D.blue}/>
              <KPI icon="📋" title="Custo" value={item.custo} pfx="R$ " color={D.orange}/>
              <KPI icon="📊" title="Margem" value={item.mg} sfx="%" meta={item.meta_mg} color={item.mg<0?D.red:D.green}/>
              <KPI icon="💰" title="Lucro" value={item.lucro} pfx="R$ " color={item.lucro<0?D.red:D.green}/>
              <KPI icon="📦" title="Estoque" value={item.est} color={item.est<50?D.red:D.green}/>
              <KPI icon="🧮" title="Qtd Vendida" value={item.qtd} color={D.blue}/>
            </div>
            <div style={{background:D.card,borderRadius:10,padding:16,border:`1px solid ${D.cardBd}`}}>
              <div style={{fontSize:11,fontWeight:800,color:D.goldSoft,marginBottom:10}}>🧠 DIAGNÓSTICO IA</div>
              {item.mg<0?(
                <div style={{fontSize:12,color:D.tx,lineHeight:1.7}}>
                  <span style={{color:D.red,fontWeight:700}}>&#9888; Margem Negativa</span> — Prejuízo de <b style={{color:D.red}}>R$ {Math.abs(item.lucro).toLocaleString("pt-BR")}/mês</b>.
                  <br/><br/><b style={{color:D.goldSoft}}>Preço sugerido:</b> R$ {(item.custo*(1+item.meta_mg/100)).toFixed(2).replace(".",",")} (margem {item.meta_mg}%)
                  <br/><b style={{color:D.goldSoft}}>Impacto:</b> +R$ {Math.floor(item.qtd*(item.custo*(1+item.meta_mg/100)-item.preco)).toLocaleString("pt-BR")}/mês
                </div>
              ):(
                <div style={{fontSize:12,color:D.tx,lineHeight:1.7}}>
                  <span style={{color:D.green,fontWeight:700}}>&#10003; Saudável</span> — Gerando <b style={{color:D.green}}>R$ {item.lucro.toLocaleString("pt-BR")}/mês</b>. {item.est<50?"&#9888; Estoque baixo!":"Estoque OK."}
                </div>
              )}
            </div>
          </>
        )}
        {type==="setor"&&(
          <>
            <div style={{display:"grid",gridTemplateColumns:"1fr 1fr",gap:8}}>
              <KPI icon="💵" title="Venda" value={item.vd} pfx="R$ " meta={item.mv} color={D.green}/>
              <KPI icon="📦" title="Compra" value={item.cp} pfx="R$ " color={D.red}/>
              <KPI icon="📊" title="Margem" value={item.mg} sfx="%" meta={item.mm} color={item.mg>=item.mm?D.green:D.red}/>
              <KPI icon="⚖️" title="RCV" value={item.rcv} sfx="%" color={item.rcv>85?D.red:D.green}/>
            </div>
            <div style={{background:D.card,borderRadius:10,padding:14,border:`1px solid ${D.cardBd}`}}>
              <div style={{fontSize:11,fontWeight:800,color:D.goldSoft,marginBottom:8}}>Produtos do Setor</div>
              {PRODUTOS.filter(p=>p.grupo===item.n||(item.n==="Frios/Latic."&&(p.grupo==="Frios"||p.grupo==="Laticínios"))).map((p,i)=>(
                <div key={i} style={{display:"flex",alignItems:"center",gap:8,padding:"6px 0",borderBottom:`1px solid ${D.cardBd}`,fontSize:11}}>
                  <Tag text={p.curva} color={p.mg<0?D.red:D.green}/>
                  <span style={{flex:1,color:D.tx,fontWeight:600}}>{p.nome}</span>
                  <span style={{color:p.mg<0?D.red:D.green,fontFamily:FM,fontWeight:700}}>{p.mg.toFixed(1)}%</span>
                  <span style={{color:D.txSec,fontFamily:FM,fontSize:10}}>{fR(p.vd)}</span>
                </div>
              ))}
            </div>
          </>
        )}
        {type==="fornecedor"&&(
          <>
            <div style={{display:"grid",gridTemplateColumns:"1fr 1fr",gap:8}}>
              <KPI icon="💵" title="Vol. Compras" value={item.cp} pfx="R$ " color={D.orange}/>
              <KPI icon="📦" title="Produtos" value={item.pr} color={D.blue}/>
            </div>
            <div style={{background:D.card,borderRadius:10,padding:14,border:`1px solid ${D.cardBd}`}}>
              {[["Lead Time",item.lt+" dia(s)"],["Condição",item.cd],["Últ. Compra",item.uc]].map(([k,v],i)=>(
                <div key={i} style={{display:"flex",justifyContent:"space-between",padding:"7px 0",borderBottom:`1px solid ${D.cardBd}`,fontSize:11}}>
                  <span style={{color:D.txSec}}>{k}</span><span style={{color:D.tx,fontWeight:600}}>{v}</span>
                </div>
              ))}
            </div>
            <div style={{background:D.card,borderRadius:10,padding:14,border:`1px solid ${D.cardBd}`}}>
              <div style={{fontSize:11,fontWeight:800,color:D.goldSoft,marginBottom:8}}>Produtos</div>
              {PRODUTOS.filter(p=>p.forn===item.n).map((p,i)=>(
                <div key={i} style={{display:"flex",alignItems:"center",gap:8,padding:"6px 0",borderBottom:`1px solid ${D.cardBd}`,fontSize:11}}>
                  <span style={{flex:1,color:D.tx,fontWeight:600}}>{p.nome}</span>
                  <span style={{color:p.mg<0?D.red:D.green,fontFamily:FM,fontWeight:700}}>{p.mg.toFixed(1)}%</span>
                </div>
              ))}
            </div>
          </>
        )}
      </div>
    </div>
  );
}

// ══════════ DASHBOARD PAGE — FULL ══════════
function DashPage({openDetail}){
  const [period,setPeriod]=useState("Mensal");
  const totalVd=SETORES.reduce((a,s)=>a+s.vd,0);
  const totalCp=SETORES.reduce((a,s)=>a+s.cp,0);
  const totalQtd=PRODUTOS.reduce((a,p)=>a+p.qtd,0);
  const totalEst=PRODUTOS.reduce((a,p)=>a+p.est,0);
  const ruptura=PRODUTOS.filter(p=>p.est===0).length;
  const estBaixo=PRODUTOS.filter(p=>p.est>0&&p.est<50).length;
  const func=35;const area=500;const cupons=25189;

  return(
    <div style={{display:"flex",flexDirection:"column",gap:0}}>
      <Hdr title="Painel de Performance" sub="Principais indicadores consolidados">
        <PeriodFilter period={period} setPeriod={setPeriod}/>
      </Hdr>
      <div style={{padding:"20px 24px 28px",display:"flex",flexDirection:"column",gap:20}}>
        
        {/* BLOCK 1: RECEITA & MARGEM */}
        <Section icon="💰" title="Receita & Margem">
          <div style={{display:"grid",gridTemplateColumns:"repeat(4,1fr)",gap:10}}>
            <KPI size="big" icon="💰" title="Receita Bruta (R$)" value={2910452} meta={2946185} yoy={12.7} pfx="R$ " color={D.green} spark={[2.1,2.3,2.2,2.5,2.7,2.9]}/>
            <KPI size="big" icon="📈" title="Margem Sem Oferta" value={27.09} meta={30} yoy={2.7} sfx="%" color={D.green} spark={[28,27,26,27.5,27,27.09]}/>
            <KPI size="big" icon="📉" title="Margem Com Oferta" value={8.29} meta={15} yoy={-9.65} sfx="%" color={D.red} spark={[14,12,10,9,8.5,8.29]}/>
            <KPI size="big" icon="🏆" title="Lucro Bruto (R$)" value={764141} meta={751009} yoy={2.6} pfx="R$ " color={D.goldSoft} spark={[720,740,735,750,760,764]}/>
          </div>
        </Section>

        {/* BLOCK 2: COMPRAS & RCV */}
        <Section icon="📦" title="Compras & Relação Compra/Venda">
          <div style={{display:"grid",gridTemplateColumns:"repeat(4,1fr)",gap:10}}>
            <KPI size="big" icon="🛒" title="Compras (R$)" value={2460333} meta={2194426} yoy={13.98} pfx="R$ " color={D.red}/>
            <KPI size="big" icon="⚖️" title="Compra x Venda (RCV)" value={84.83} meta={75.66} yoy={1.15} sfx="%" color={D.blue}/>
            <KPI size="big" icon="💵" title="Venda Sem Oferta (R$)" value={2476505} yoy={17.83} pfx="R$ " color={D.green}/>
            <KPI size="big" icon="🏷️" title="Venda Com Oferta (R$)" value={423947} yoy={-10.2} pfx="R$ " color={D.orange}/>
          </div>
        </Section>

        {/* BLOCK 3: VENDAS & PRODUTIVIDADE */}
        <Section icon="🧮" title="Vendas & Produtividade">
          <div style={{display:"grid",gridTemplateColumns:"repeat(5,1fr)",gap:10}}>
            <KPI icon="📊" title="Margem s/Venda" value={24.34} meta={25} yoy={6.18} sfx="%" color={D.blue}/>
            <KPI icon="🎫" title="Ticket Médio (R$)" value={78.12} meta={81.10} pfx="R$ " color={D.purple}/>
            <KPI icon="🧮" title="Qtd. Vendida" value={totalQtd} meta={256792} color={D.goldSoft}/>
            <KPI icon="🧺" title="Cesta Média (R$)" value={7.73} meta={8.28} pfx="R$ " color={D.cyan}/>
            <KPI icon="🎟️" title="Cupons" value={cupons} meta={25016} color={D.txSec}/>
          </div>
        </Section>

        {/* BLOCK 4: PRODUTIVIDADE POR M² E FUNCIONÁRIO */}
        <Section icon="👥" title="Produtividade & Operação">
          <div style={{display:"grid",gridTemplateColumns:"repeat(5,1fr)",gap:10}}>
            <KPI icon="📐" title="Venda/M² (R$)" value={Number((totalVd/area).toFixed(2))} meta={3000} pfx="R$ " color={D.green} yoy={5.39}/>
            <KPI icon="📏" title="Itens Vendidos/M²" value={Number((totalQtd/area).toFixed(2))} meta={10} color={D.blue} yoy={-2.65}/>
            <KPI icon="👤" title="Venda/Funcionário (R$)" value={Number((totalVd/func).toFixed(0))} meta={35000} pfx="R$ " color={D.purple}/>
            <KPI icon="🎫" title="Ticket Médio/Func." value={Number((78.12*cupons/func).toFixed(0))} pfx="R$ " color={D.cyan}/>
            <KPI icon="📦" title="Itens/Funcionário" value={Number((totalQtd/func).toFixed(0))} meta={7000} color={D.orange}/>
          </div>
        </Section>

        {/* BLOCK 5: ESTOQUE */}
        <Section icon="📦" title="Estoque & Cobertura">
          <div style={{display:"grid",gridTemplateColumns:"repeat(4,1fr)",gap:10}}>
            <KPI icon="📦" title="Estoque Total (un.)" value={totalEst} color={D.blue}/>
            <KPI icon="📅" title="Cobertura Estoque (dias)" value={31.25} meta={30} sfx=" dias" color={D.green}/>
            <KPI icon="🚨" title="Ruptura de Estoque" value={ruptura} color={D.red}/>
            <KPI icon="⚠️" title="Estoque Baixo (<50)" value={estBaixo} color={D.orange}/>
          </div>
        </Section>

        {/* CHARTS ROW */}
        <div style={{display:"grid",gridTemplateColumns:"5fr 3fr",gap:12}}>
          <div style={{background:D.panel,borderRadius:12,padding:20,border:`1px solid ${D.bd}`}}>
            <div style={{display:"flex",alignItems:"center",gap:6,marginBottom:14}}>
              <span style={{fontSize:15}}>📈</span>
              <span style={{fontSize:12,fontWeight:700,color:D.txLight}}>Evolução de Vendas — Semana</span>
            </div>
            <BarChart data={VD7} h={130}/>
            <div style={{display:"flex",gap:14,marginTop:10}}>
              <div style={{display:"flex",alignItems:"center",gap:5,fontSize:9,color:D.txLightSec}}><div style={{width:10,height:3,borderRadius:1,background:D.goldSoft}}/>Realizado</div>
              <div style={{display:"flex",alignItems:"center",gap:5,fontSize:9,color:D.txLightSec}}><div style={{width:10,height:3,borderRadius:1,background:D.chrome3,opacity:.4}}/>Meta</div>
            </div>
          </div>
          <div style={{background:D.panel,borderRadius:12,padding:20,border:`1px solid ${D.bd}`}}>
            <div style={{display:"flex",alignItems:"center",gap:6,marginBottom:14}}>
              <span style={{fontSize:15}}>🥧</span>
              <span style={{fontSize:12,fontWeight:700,color:D.txLight}}>Curva ABC</span>
            </div>
            <div style={{display:"flex",justifyContent:"center",marginBottom:12}}>
              <Donut segs={[{v:380822,c:D.green},{v:94770,c:D.blue},{v:27122,c:D.orange},{v:6635,c:D.red}]} sz={95}/>
            </div>
            {[{c:"A",mg:28.8,mx:698,cl:D.green},{c:"B",mg:36.95,mx:1430,cl:D.blue},{c:"C",mg:39.21,mx:1333,cl:D.orange},{c:"D",mg:41.4,mx:1072,cl:D.red}].map((r,i)=>(
              <div key={i} style={{display:"flex",alignItems:"center",gap:8,fontSize:10,padding:"5px 0",borderBottom:`1px solid ${D.bd}`}}>
                <div style={{width:8,height:8,borderRadius:2,background:r.cl}}/><span style={{color:D.txLight,fontWeight:700,width:14}}>{r.c}</span>
                <span style={{color:D.txLightSec,flex:1}}>{r.mg}%</span><span style={{color:D.txLightDim,fontFamily:FM,fontSize:9}}>{r.mx} SKUs</span>
              </div>
            ))}
          </div>
        </div>

        {/* SETORES TABLE */}
        <div style={{background:D.panel,borderRadius:12,border:`1px solid ${D.bd}`,overflow:"hidden"}}>
          <div style={{padding:"14px 18px",borderBottom:`1px solid ${D.bd}`,display:"flex",alignItems:"center",gap:6}}>
            <span style={{fontSize:15}}>🏬</span>
            <span style={{fontSize:12,fontWeight:700,color:D.txLight}}>Performance por Setor</span>
            <span style={{fontSize:10,color:D.txLightDim,marginLeft:4}}>clique para detalhar</span>
          </div>
          <table style={{width:"100%",borderCollapse:"collapse",fontSize:11}}>
            <thead><tr style={{background:D.chrome3}}>{["Setor","Venda","Meta","Compra","Margem","Meta","Part.","RCV","SKUs"].map(h=>(<th key={h} style={{padding:"9px 14px",textAlign:"left",color:D.txLightDim,fontWeight:600,fontSize:9,letterSpacing:.5,borderBottom:`1px solid ${D.bd}`}}>{h}</th>))}</tr></thead>
            <tbody>{SETORES.map((s,i)=>(
              <tr key={i} onClick={()=>openDetail(s,"setor")} style={{borderBottom:`1px solid ${D.bd}`,cursor:"pointer",transition:"background .1s"}} onMouseEnter={e=>e.currentTarget.style.background=D.panelHover} onMouseLeave={e=>e.currentTarget.style.background=""}>
                <td style={{padding:"9px 14px",color:D.txLight,fontWeight:700}}>{s.n}</td>
                <td style={{padding:"9px 14px",color:D.txLightSec,fontFamily:FM}}>{fR(s.vd)}</td>
                <td style={{padding:"9px 14px",color:D.txLightDim,fontFamily:FM,fontSize:10}}>{fR(s.mv)}</td>
                <td style={{padding:"9px 14px",color:D.txLightSec,fontFamily:FM}}>{fR(s.cp)}</td>
                <td style={{padding:"9px 14px"}}><span style={{padding:"2px 7px",borderRadius:4,fontWeight:700,fontFamily:FM,fontSize:10,background:s.mg>=s.mm?D.greenBgD:D.redBgD,color:s.mg>=s.mm?D.greenSoft:D.redSoft}}>{s.mg.toFixed(1)}%</span></td>
                <td style={{padding:"9px 14px",color:D.txLightDim,fontFamily:FM,fontSize:10}}>{s.mm}%</td>
                <td style={{padding:"9px 14px",color:D.txLightSec,fontFamily:FM}}>{s.pt}%</td>
                <td style={{padding:"9px 14px"}}><span style={{padding:"2px 7px",borderRadius:4,fontWeight:700,fontFamily:FM,fontSize:10,background:s.rcv>85?D.redBgD:s.rcv>75?D.orangeBg+"20":D.greenBgD,color:s.rcv>85?D.redSoft:s.rcv>75?D.orange:D.greenSoft}}>{s.rcv}%</span></td>
                <td style={{padding:"9px 14px",color:D.txLightDim,fontFamily:FM}}>{s.sk}</td>
              </tr>
            ))}</tbody>
          </table>
        </div>
      </div>
    </div>
  );
}

// ══════════ PRODUTOS PAGE ══════════
function ProdPage({openDetail}){
  const [q,setQ]=useState("");const [fl,setFl]=useState({});const [period,setPeriod]=useState("Mensal");
  const grupos=[...new Set(PRODUTOS.map(p=>p.grupo))];
  const filtered=useMemo(()=>PRODUTOS.filter(p=>{if(q&&!p.nome.toLowerCase().includes(q.toLowerCase())&&!p.marca.toLowerCase().includes(q.toLowerCase())&&!p.forn.toLowerCase().includes(q.toLowerCase()))return false;if(fl.grupo&&p.grupo!==fl.grupo)return false;if(fl.curva&&p.curva!==fl.curva)return false;if(fl.mg==="Negativa"&&p.mg>=0)return false;if(fl.mg==="Positiva"&&p.mg<0)return false;return true}),[q,fl]);
  const [sort,setSort]=useState({k:"vd",d:-1});
  const sorted=useMemo(()=>[...filtered].sort((a,b)=>(a[sort.k]>b[sort.k]?1:-1)*sort.d),[filtered,sort]);

  return(
    <div style={{display:"flex",flexDirection:"column",gap:0}}>
      <Hdr title="Análise de Produtos" sub={`${filtered.length} produtos`}><PeriodFilter period={period} setPeriod={setPeriod}/></Hdr>
      <div style={{padding:"20px 24px 28px",display:"flex",flexDirection:"column",gap:16}}>
        <div style={{display:"flex",gap:8,alignItems:"center",flexWrap:"wrap"}}>
          <div style={{flex:1,minWidth:200,display:"flex",alignItems:"center",background:D.panel,border:`1px solid ${D.bd}`,borderRadius:8,padding:"0 12px"}}>
            <span style={{color:D.txLightDim,fontSize:14,marginRight:8}}>&#x1F50D;</span>
            <input value={q} onChange={e=>setQ(e.target.value)} placeholder="Buscar produto, marca, fornecedor..." style={{flex:1,border:"none",outline:"none",background:"transparent",color:D.txLight,fontSize:12,fontFamily:F,padding:"10px 0"}}/>
          </div>
          {[{k:"grupo",l:"Setor",o:grupos},{k:"curva",l:"Curva",o:["A","B","C","D"]},{k:"mg",l:"Margem",o:["Positiva","Negativa"]}].map(f=>(
            <select key={f.k} value={fl[f.k]||""} onChange={e=>setFl(p=>({...p,[f.k]:e.target.value||undefined}))} style={{padding:"9px 12px",borderRadius:8,border:`1px solid ${D.bd}`,background:D.panel,color:fl[f.k]?D.goldSoft:D.txLightSec,fontSize:11,fontWeight:600,fontFamily:F,outline:"none",cursor:"pointer"}}>
              <option value="">{f.l}: Todos</option>{f.o.map(o=>(<option key={o} value={o}>{o}</option>))}
            </select>
          ))}
        </div>
        <div style={{display:"grid",gridTemplateColumns:"repeat(4,1fr)",gap:10}}>
          <KPI icon="🏷️" title="Total Produtos" value={filtered.length} color={D.blue}/>
          <KPI icon="💵" title="Venda Total" value={filtered.reduce((a,p)=>a+p.vd,0)} pfx="R$ " color={D.green}/>
          <KPI icon="📊" title="Margem Média" value={filtered.length?Number((filtered.reduce((a,p)=>a+p.mg,0)/filtered.length).toFixed(2)):0} sfx="%" color={D.goldSoft}/>
          <KPI icon="🚨" title="Margem Negativa" value={filtered.filter(p=>p.mg<0).length} color={D.red}/>
        </div>
        <div style={{background:D.panel,borderRadius:12,border:`1px solid ${D.bd}`,overflow:"hidden"}}>
          <table style={{width:"100%",borderCollapse:"collapse",fontSize:11}}>
            <thead><tr style={{background:D.chrome3}}>
              {[{k:"nome",l:"Produto"},{k:"grupo",l:"Setor"},{k:"curva",l:"Curva"},{k:"preco",l:"Preço"},{k:"custo",l:"Custo"},{k:"mg",l:"Margem"},{k:"vd",l:"Venda"},{k:"lucro",l:"Lucro"},{k:"est",l:"Estoque"}].map(h=>(
                <th key={h.k} onClick={()=>setSort(p=>({k:h.k,d:p.k===h.k?-p.d:-1}))} style={{padding:"9px 12px",textAlign:"left",color:sort.k===h.k?D.goldSoft:D.txLightDim,fontWeight:600,fontSize:9,borderBottom:`1px solid ${D.bd}`,cursor:"pointer",userSelect:"none"}}>{h.l}{sort.k===h.k?(sort.d>0?" ▲":" ▼"):""}</th>
              ))}
            </tr></thead>
            <tbody>{sorted.map(p=>(
              <tr key={p.id} onClick={()=>openDetail(p,"produto")} style={{borderBottom:`1px solid ${D.bd}`,cursor:"pointer"}} onMouseEnter={e=>e.currentTarget.style.background=D.panelHover} onMouseLeave={e=>e.currentTarget.style.background=""}>
                <td style={{padding:"9px 12px",color:D.txLight,fontWeight:600,maxWidth:180,overflow:"hidden",textOverflow:"ellipsis",whiteSpace:"nowrap"}}>{p.nome}</td>
                <td style={{padding:"9px 12px",color:D.txLightSec,fontSize:10}}>{p.grupo}</td>
                <td style={{padding:"9px 12px"}}><Tag text={p.curva} color={p.curva==="A"?D.green:p.curva==="B"?D.blue:p.curva==="C"?D.orange:D.red}/></td>
                <td style={{padding:"9px 12px",color:D.txLightSec,fontFamily:FM}}>R$ {p.preco.toFixed(2)}</td>
                <td style={{padding:"9px 12px",color:D.txLightDim,fontFamily:FM}}>R$ {p.custo.toFixed(2)}</td>
                <td style={{padding:"9px 12px"}}><span style={{padding:"2px 7px",borderRadius:4,fontWeight:700,fontFamily:FM,fontSize:10,background:p.mg<0?D.redBgD:p.mg>=25?D.greenBgD:D.goldBg,color:p.mg<0?D.redSoft:p.mg>=25?D.greenSoft:D.goldSoft}}>{p.mg.toFixed(1)}%</span></td>
                <td style={{padding:"9px 12px",color:D.txLightSec,fontFamily:FM}}>{fR(p.vd)}</td>
                <td style={{padding:"9px 12px"}}><span style={{color:p.lucro<0?D.redSoft:D.greenSoft,fontFamily:FM,fontWeight:700}}>{fR(p.lucro)}</span></td>
                <td style={{padding:"9px 12px"}}><span style={{padding:"2px 7px",borderRadius:4,fontWeight:700,fontFamily:FM,fontSize:10,background:p.est<50?D.redBgD:D.greenBgD,color:p.est<50?D.redSoft:D.greenSoft}}>{p.est}</span></td>
              </tr>
            ))}</tbody>
          </table>
        </div>
      </div>
    </div>
  );
}

// ══════════ SIMPLE PAGES (keep shorter) ══════════
function FornPage({openDetail}){const [q,setQ]=useState("");const f=FORN.filter(x=>!q||x.n.toLowerCase().includes(q.toLowerCase()));return(<div><Hdr title="Fornecedores" sub={`${f.length} ativos`}/><div style={{padding:"20px 24px",display:"flex",flexDirection:"column",gap:12}}><div style={{display:"flex",alignItems:"center",background:D.panel,border:`1px solid ${D.bd}`,borderRadius:8,padding:"0 12px"}}><span style={{color:D.txLightDim,marginRight:8}}>&#x1F50D;</span><input value={q} onChange={e=>setQ(e.target.value)} placeholder="Buscar..." style={{flex:1,border:"none",outline:"none",background:"transparent",color:D.txLight,fontSize:12,fontFamily:F,padding:"10px 0"}}/></div><div style={{display:"grid",gridTemplateColumns:"repeat(4,1fr)",gap:10}}><KPI icon="🤝" title="Fornecedores" value={f.length} color={D.blue}/><KPI icon="💵" title="Vol. Compras" value={f.reduce((a,x)=>a+x.cp,0)} pfx="R$ " color={D.orange}/><KPI icon="📦" title="SKUs" value={f.reduce((a,x)=>a+x.pr,0)} color={D.green}/><KPI icon="⏱️" title="Lead Time Méd." value={Number((f.reduce((a,x)=>a+x.lt,0)/f.length).toFixed(1))} sfx=" dias" color={D.cyan}/></div>{f.map((x,i)=>(<div key={i} onClick={()=>openDetail(x,"fornecedor")} style={{background:D.panel,border:`1px solid ${D.bd}`,borderRadius:10,padding:"14px 18px",cursor:"pointer",display:"flex",alignItems:"center",gap:14}}><div style={{width:40,height:40,borderRadius:10,background:D.goldBg,border:`1px solid ${D.goldSoft}20`,display:"flex",alignItems:"center",justifyContent:"center",fontSize:16,fontWeight:800,color:D.goldSoft}}>{x.n[0]}</div><div style={{flex:1}}><div style={{fontSize:13,fontWeight:700,color:D.txLight}}>{x.n}</div><div style={{fontSize:10,color:D.txLightDim}}>{x.pr} SKUs &middot; {x.lt}d &middot; {x.cd}</div></div><div style={{textAlign:"right"}}><div style={{fontSize:14,fontWeight:800,color:D.orange,fontFamily:FM}}>{fR(x.cp)}</div></div></div>))}</div></div>);}

function CompPage(){return(<div><Hdr title="Gestão de Compras" sub="Compras, estoque, ruptura"/><div style={{padding:"20px 24px",display:"flex",flexDirection:"column",gap:14}}><div style={{display:"grid",gridTemplateColumns:"repeat(4,1fr)",gap:10}}><KPI icon="💵" title="Valor Venda" value={303199} pfx="R$ " color={D.green}/><KPI icon="📋" title="CMV" value={186259} pfx="R$ " color={D.blue}/><KPI icon="📊" title="Margem" value={38.57} sfx="%" color={D.goldSoft}/><KPI icon="🚨" title="Valor Compra" value={258449} pfx="R$ " color={D.red}/></div><div style={{background:D.panel,borderRadius:12,border:`1px solid ${D.bd}`,padding:18}}><div style={{display:"inline-flex",padding:"6px 12px",borderRadius:6,background:D.redBgD,marginBottom:14}}><span style={{fontSize:11,color:D.redSoft,fontWeight:700}}>&#9888; Compra &gt; Venda — RCV: 85.3%</span></div><table style={{width:"100%",borderCollapse:"collapse",fontSize:11}}><thead><tr style={{background:D.chrome3}}>{["Produto","Venda","Compra","Saldo","RCV%"].map(h=>(<th key={h} style={{padding:"8px 12px",textAlign:"left",color:D.txLightDim,fontWeight:600,fontSize:9,borderBottom:`1px solid ${D.bd}`}}>{h}</th>))}</tr></thead><tbody>{[{p:"Acém KG",v:69159,c:11858,s:43362,r:9.17},{p:"Costela Bovina KG",v:24698,c:6339,s:12817,r:0},{p:"Músculo Traseiro",v:31631,c:17347,s:9185,r:0},{p:"Contra Filé KG",v:17378,c:4591,s:8624,r:14.52},{p:"Patinho KG",v:11847,c:7648,s:8436,r:0}].map((r,i)=>(<tr key={i} style={{borderBottom:`1px solid ${D.bd}`}}><td style={{padding:"8px 12px",color:D.txLight,fontWeight:600}}>{r.p}</td><td style={{padding:"8px 12px",color:D.txLightSec,fontFamily:FM}}>{fmt(r.v)}</td><td style={{padding:"8px 12px",color:D.txLightSec,fontFamily:FM}}>{fmt(r.c)}</td><td style={{padding:"8px 12px",color:r.s>10000?D.redSoft:D.txLightSec,fontFamily:FM,fontWeight:700}}>{fmt(r.s)}</td><td style={{padding:"8px 12px",color:r.r>0?D.greenSoft:D.txLightDim,fontFamily:FM}}>{r.r}%</td></tr>))}</tbody></table></div></div></div>);}

function OferPage(){return(<div><Hdr title="Ofertas & Promoções" sub="Impacto na margem"/><div style={{padding:"20px 24px",display:"flex",flexDirection:"column",gap:14}}><div style={{display:"grid",gridTemplateColumns:"repeat(3,1fr)",gap:10}}><KPI icon="🏷️" title="Com Oferta" value={968360} pfx="R$ " color={D.orange}/><KPI icon="📊" title="Margem Oferta" value={17.1} sfx="%" meta={20} color={D.orange}/><KPI icon="📈" title="Participação" value={25.8} sfx="%" color={D.goldSoft}/></div><div style={{background:D.panel,borderRadius:12,padding:18,border:`1px solid ${D.bd}`}}><div style={{display:"inline-flex",padding:"5px 10px",borderRadius:5,background:D.greenBgD,marginBottom:12}}><span style={{fontSize:10,color:D.greenSoft,fontWeight:700}}>Massa de margem fora da oferta sustenta o lucro bruto</span></div><div style={{fontSize:11,color:D.txLightSec,lineHeight:1.7}}>Margem oferta 17,1% (meta 20%) mas margem final batida. 75% do mix sem oferta com 27-41% compensa.</div></div></div></div>);}

function PrecPage({openDetail}){const neg=PRODUTOS.filter(p=>p.mg<0).sort((a,b)=>a.lucro-b.lucro);return(<div><Hdr title="Precificação Inteligente" sub="Diagnóstico e simulador"/><div style={{padding:"20px 24px",display:"flex",flexDirection:"column",gap:14}}><div style={{display:"grid",gridTemplateColumns:"3fr 1fr",gap:12}}><div style={{background:D.panel,borderRadius:12,border:`1px solid ${D.bd}`,overflow:"hidden"}}><div style={{padding:"14px 18px",borderBottom:`1px solid ${D.bd}`,fontSize:12,fontWeight:700,color:D.txLight}}>🚨 Margem Negativa ({neg.length})</div><table style={{width:"100%",borderCollapse:"collapse",fontSize:11}}><thead><tr style={{background:D.chrome3}}>{["Produto","Custo","Preço","Margem","Lucro","Sugerido"].map(h=>(<th key={h} style={{padding:"8px 12px",textAlign:"left",color:D.txLightDim,fontWeight:600,fontSize:9,borderBottom:`1px solid ${D.bd}`}}>{h}</th>))}</tr></thead><tbody>{neg.map((p,i)=>(<tr key={i} onClick={()=>openDetail(p,"produto")} style={{borderBottom:`1px solid ${D.bd}`,cursor:"pointer"}}><td style={{padding:"8px 12px",color:D.txLight,fontWeight:600}}>{p.nome}</td><td style={{padding:"8px 12px",color:D.txLightSec,fontFamily:FM}}>R$ {p.custo.toFixed(2)}</td><td style={{padding:"8px 12px",color:D.redSoft,fontFamily:FM,fontWeight:700}}>R$ {p.preco.toFixed(2)}</td><td style={{padding:"8px 12px"}}><span style={{padding:"2px 7px",borderRadius:4,background:D.redBgD,color:D.redSoft,fontFamily:FM,fontWeight:700,fontSize:10}}>{p.mg.toFixed(1)}%</span></td><td style={{padding:"8px 12px",color:D.redSoft,fontFamily:FM,fontWeight:700}}>{fR(p.lucro)}</td><td style={{padding:"8px 12px",color:D.greenSoft,fontFamily:FM,fontWeight:700}}>R$ {(p.custo*(1+p.meta_mg/100)).toFixed(2)}</td></tr>))}</tbody></table></div><div style={{background:D.panel,borderRadius:12,border:`1px solid ${D.bd}`,padding:18}}><div style={{fontSize:12,fontWeight:700,color:D.txLight,marginBottom:14}}>Resumo</div><div style={{fontSize:28,fontWeight:900,color:D.redSoft,fontFamily:FM}}>R$ {Math.abs(neg.reduce((a,p)=>a+p.lucro,0)).toLocaleString("pt-BR")}</div><div style={{fontSize:10,color:D.redSoft,marginBottom:16}}>prejuízo/mês</div><div style={{padding:12,background:D.greenBgD,borderRadius:8}}><div style={{fontSize:10,color:D.txLightDim}}>Se corrigir preços:</div><div style={{fontSize:20,fontWeight:800,color:D.greenSoft,fontFamily:FM}}>+R$ {Math.abs(neg.reduce((a,p)=>a+Math.floor(p.qtd*(p.custo*(1+p.meta_mg/100)-p.preco)),0)).toLocaleString("pt-BR")}</div><div style={{fontSize:10,color:D.greenSoft}}>lucro adicional/mês</div></div></div></div></div></div>);}

function FinPage(){return(<div><Hdr title="Financeiro" sub="DRE e fluxo de caixa"/><div style={{padding:"20px 24px",display:"flex",flexDirection:"column",gap:14}}><div style={{display:"grid",gridTemplateColumns:"repeat(4,1fr)",gap:10}}><KPI icon="📥" title="Contas Receber" value={342890} pfx="R$ " color={D.green}/><KPI icon="📤" title="Contas Pagar" value={518320} pfx="R$ " color={D.red}/><KPI icon="⚖️" title="Saldo" value={-175430} pfx="R$ " color={D.red}/><KPI icon="💸" title="Despesas" value={89450} pfx="R$ " color={D.orange}/></div><div style={{background:D.panel,borderRadius:12,border:`1px solid ${D.bd}`,padding:18}}><div style={{display:"flex",alignItems:"center",gap:6,marginBottom:14}}><span>📋</span><span style={{fontSize:12,fontWeight:700,color:D.txLight}}>DRE Simplificado</span></div>{[{l:"Receita Bruta",v:"R$ 2.910.452",p:"100%",c:D.txLight,b:true},{l:"(-) Deduções",v:"R$ -145.523",p:"-5,0%",c:D.redSoft,b:false},{l:"= Receita Líquida",v:"R$ 2.764.929",p:"95,0%",c:D.txLight,b:true},{l:"(-) CMV",v:"R$ -2.094.234",p:"-72,0%",c:D.redSoft,b:false},{l:"= Lucro Bruto",v:"R$ 670.695",p:"23,0%",c:D.greenSoft,b:true},{l:"(-) Despesas",v:"R$ -89.450",p:"-3,1%",c:D.redSoft,b:false},{l:"(-) Folha",v:"R$ -312.000",p:"-10,7%",c:D.redSoft,b:false},{l:"= EBITDA",v:"R$ 269.245",p:"9,3%",c:D.goldSoft,b:true}].map((r,i)=>(<div key={i} style={{display:"flex",justifyContent:"space-between",alignItems:"center",padding:r.b?"9px 18px":"7px 0",borderBottom:`1px solid ${D.bd}`,...(r.b?{background:D.chrome3,margin:"0 -18px"}:{})}}><span style={{fontSize:11,color:r.b?D.txLight:D.txLightSec,fontWeight:r.b?700:400}}>{r.l}</span><div style={{display:"flex",gap:14}}><span style={{fontSize:12,color:r.c,fontFamily:FM,fontWeight:r.b?700:400}}>{r.v}</span><span style={{fontSize:10,color:D.txLightDim,fontFamily:FM,width:40,textAlign:"right"}}>{r.p}</span></div></div>))}</div></div></div>);}

function AIPage(){const [msgs,setMsgs]=useState([{r:"ai",t:"MarketSUP IA pronta. Pergunte qualquer coisa sobre seus dados."}]);const [inp,setInp]=useState("");const [prov,setProv]=useState("claude");const [cfg,setCfg]=useState(false);const [train,setTrain]=useState(true);const ref=useRef(null);useEffect(()=>{ref.current?.scrollIntoView({behavior:"smooth"})},[msgs]);const send=()=>{if(!inp.trim())return;setMsgs(p=>[...p,{r:"user",t:inp}]);const q=inp.toLowerCase();setInp("");setTimeout(()=>{let r="";if(q.includes("margem")&&q.includes("negativ")){const neg=PRODUTOS.filter(p=>p.mg<0).sort((a,b)=>a.mg-b.mg);r=`${neg.length} produtos com margem negativa:\n\n${neg.map((p,i)=>`${i+1}. ${p.nome}: ${p.mg.toFixed(1)}% | R$ ${Math.abs(p.lucro).toLocaleString("pt-BR")}/mês`).join("\n")}\n\nPrejuízo total: R$ ${Math.abs(neg.reduce((a,p)=>a+p.lucro,0)).toLocaleString("pt-BR")}/mês`}else if(q.includes("top")){const t=[...PRODUTOS].sort((a,b)=>b.vd-a.vd).slice(0,5);r=`Top 5:\n\n${t.map((p,i)=>`${i+1}. ${p.nome}: R$ ${p.vd.toLocaleString("pt-BR")} | ${p.mg.toFixed(1)}%`).join("\n")}`}else if(q.includes("rcv")){r=`RCV por Setor:\n\n${[...SETORES].sort((a,b)=>b.rcv-a.rcv).map(s=>`${s.n}: ${s.rcv}% ${s.rcv>85?"CRÍTICO":s.rcv>75?"ATENÇÃO":"OK"}`).join("\n")}`}else{r=`Tenho ${PRODUTOS.length} produtos, ${SETORES.length} setores, ${FORN.length} fornecedores.\n\nTente: "margem negativa", "top 5", "rcv setor"`}setMsgs(p=>[...p,{r:"ai",t:r}])},500)};return(<div style={{display:"flex",flexDirection:"column",height:"100%"}}><Hdr title="🧠 IA Assistant" sub="Consulte qualquer dado"/><div style={{flex:1,display:"flex",overflow:"hidden"}}><div style={{flex:1,display:"flex",flexDirection:"column"}}><div style={{flex:1,overflowY:"auto",padding:"16px 24px",display:"flex",flexDirection:"column",gap:10}}>{msgs.map((m,i)=>(<div key={i} style={{maxWidth:"85%",alignSelf:m.r==="user"?"flex-end":"flex-start",padding:"12px 16px",borderRadius:m.r==="user"?"12px 12px 3px 12px":"12px 12px 12px 3px",background:m.r==="user"?D.goldBg:D.panel,border:`1px solid ${m.r==="user"?D.goldSoft+"25":D.bd}`}}>{m.r==="ai"&&<div style={{fontSize:9,color:D.goldSoft,fontWeight:700,marginBottom:5}}>🧠 MARKETSUP IA</div>}<div style={{fontSize:12,color:D.txLight,lineHeight:1.7,whiteSpace:"pre-wrap"}}>{m.t}</div></div>))}<div ref={ref}/></div><div style={{padding:"6px 24px",display:"flex",gap:5,flexWrap:"wrap"}}>{["Margem negativa?","Top 5 venda","RCV por setor","Estoque baixo"].map(q=>(<button key={q} onClick={()=>setInp(q)} style={{padding:"4px 11px",borderRadius:16,border:`1px solid ${D.bd}`,background:"transparent",color:D.txLightDim,fontSize:9,cursor:"pointer",fontFamily:F}}>{q}</button>))}</div><div style={{padding:"10px 24px 16px",display:"flex",gap:6}}><div style={{flex:1,display:"flex",alignItems:"center",background:D.panel,border:`1px solid ${D.bd}`,borderRadius:9,padding:"0 14px"}}><input value={inp} onChange={e=>setInp(e.target.value)} onKeyDown={e=>e.key==="Enter"&&send()} placeholder="Pergunte..." style={{flex:1,border:"none",outline:"none",background:"transparent",color:D.txLight,fontSize:12,fontFamily:F,padding:"11px 0"}}/></div><button onClick={send} style={{padding:"0 20px",borderRadius:9,border:"none",cursor:"pointer",background:`linear-gradient(135deg,${D.goldSoft},${D.gold})`,color:D.chrome,fontWeight:700,fontSize:13}}>&#8594;</button><button onClick={()=>setCfg(!cfg)} style={{width:40,borderRadius:9,border:`1px solid ${cfg?D.goldSoft+"40":D.bd}`,background:cfg?D.goldBg:D.panel,color:cfg?D.goldSoft:D.txLightDim,fontSize:16,cursor:"pointer",display:"flex",alignItems:"center",justifyContent:"center"}}>&#9881;</button></div></div>{cfg&&<div style={{width:300,borderLeft:`1px solid ${D.bd}`,background:D.chrome2,overflowY:"auto",padding:20,display:"flex",flexDirection:"column",gap:14}}><div style={{fontSize:13,fontWeight:800,color:D.txLight}}>Config IA</div><div style={{fontSize:9,color:D.txLightDim,fontWeight:700,letterSpacing:1,marginBottom:4}}>PROVEDOR LLM</div>{[{id:"claude",n:"Claude",d:"Sonnet 4"},{id:"gpt",n:"ChatGPT",d:"GPT-4o"},{id:"gemini",n:"Gemini",d:"2.0 Pro"},{id:"llama",n:"LLaMA",d:"Self-hosted"},{id:"custom",n:"Custom",d:"Endpoint"}].map(p=>(<button key={p.id} onClick={()=>setProv(p.id)} style={{display:"flex",alignItems:"center",gap:8,padding:"8px 12px",width:"100%",marginBottom:3,borderRadius:7,border:`1px solid ${prov===p.id?D.goldSoft+"50":D.bd}`,background:prov===p.id?D.goldBg:D.panel,cursor:"pointer",textAlign:"left"}}><div style={{width:7,height:7,borderRadius:"50%",background:prov===p.id?D.goldSoft:D.txLightDim}}/><div><div style={{fontSize:11,color:prov===p.id?D.goldSoft:D.txLight,fontWeight:600}}>{p.n}</div><div style={{fontSize:9,color:D.txLightDim}}>{p.d}</div></div></button>))}<div style={{fontSize:9,color:D.txLightDim,fontWeight:700,letterSpacing:1}}>API KEY</div><input type="password" placeholder="Cole sua key..." style={{width:"100%",padding:"8px 12px",borderRadius:7,border:`1px solid ${D.bd}`,background:D.panel,color:D.txLight,fontSize:11,fontFamily:FM,outline:"none",boxSizing:"border-box"}}/><button onClick={()=>setTrain(!train)} style={{display:"flex",alignItems:"center",gap:8,padding:"10px 12px",width:"100%",borderRadius:7,border:`1px solid ${train?D.greenSoft+"30":D.bd}`,background:train?D.greenBgD:D.panel,cursor:"pointer",textAlign:"left"}}><div style={{width:30,height:16,borderRadius:8,background:train?D.greenSoft:D.chrome3,position:"relative",flexShrink:0}}><div style={{width:12,height:12,borderRadius:6,background:D.wh,position:"absolute",top:2,left:train?16:2,transition:"all .2s"}}/></div><div><div style={{fontSize:10,color:train?D.greenSoft:D.txLightSec,fontWeight:600}}>Auto-Treinamento {train?"ON":"OFF"}</div><div style={{fontSize:8,color:D.txLightDim}}>Aprende com cada pergunta</div></div></button></div>}</div></div>);}

function CfgPage({apiState,setApiState,setRealData}){const [tab,setTab]=useState("api");const [ac,setAc]=useState(0);const [apiUser,setApiUser]=useState("");const [apiPass,setApiPass]=useState("");const [syncLog,setSyncLog]=useState([]);const url=apiState.url;const conn=apiState.connected;const sync=apiState.syncing;const sp=apiState.syncProgress;const setUrl=v=>setApiState(p=>({...p,url:v}));const doConnect=async()=>{setApiState(p=>({...p,syncing:true,connected:false,error:null}));setSyncLog(l=>[...l,{t:new Date().toLocaleTimeString(),m:"Autenticando...",s:"info"}]);try{const authRes=await authenticate(url,apiUser,apiPass);if(!authRes.success){setApiState(p=>({...p,syncing:false,error:authRes.error}));setSyncLog(l=>[...l,{t:new Date().toLocaleTimeString(),m:"Falha: "+authRes.error,s:"error"}]);return}const token=authRes.token;setApiState(p=>({...p,token}));setSyncLog(l=>[...l,{t:new Date().toLocaleTimeString(),m:"Token obtido! Sincronizando dados...",s:"ok"}]);let pg={};API_EPS.forEach(c=>c.eps.forEach(e=>{pg[e]="pending"}));setApiState(p=>({...p,syncProgress:pg}));const syncRes=await syncAll(url,token);if(!syncRes.success){setApiState(p=>({...p,syncing:false,error:syncRes.error}));setSyncLog(l=>[...l,{t:new Date().toLocaleTimeString(),m:"Erro sync: "+syncRes.error,s:"error"}]);return}Object.entries(syncRes.report||{}).forEach(([key,val])=>{const ep=val.endpoint;if(ep){setApiState(p=>({...p,syncProgress:{...p.syncProgress,[ep]:val.success?"done":"error"}}))}setSyncLog(l=>[...l,{t:new Date().toLocaleTimeString(),m:`${key}: ${val.success?val.count+" registros":"FALHOU"}`,s:val.success?"ok":"error"}])});const dashboard=buildDashboard(syncRes.data);setRealData(dashboard);setApiState(p=>({...p,syncing:false,connected:true,syncedAt:syncRes.syncedAt,stats:syncRes.stats}));setSyncLog(l=>[...l,{t:new Date().toLocaleTimeString(),m:`Sincronização completa! ${syncRes.stats.success}/${syncRes.stats.total} endpoints OK`,s:"ok"}])}catch(err){setApiState(p=>({...p,syncing:false,error:err.message}));setSyncLog(l=>[...l,{t:new Date().toLocaleTimeString(),m:"Erro: "+err.message,s:"error"}])}};return(<div style={{display:"flex",flexDirection:"column",height:"100%"}}><Hdr title="Configurações" sub="API, PDF, Loja, Metas"/><div style={{display:"flex",flex:1,overflow:"hidden"}}><div style={{width:170,borderRight:`1px solid ${D.bd}`,padding:12,display:"flex",flexDirection:"column",gap:3}}>{[["api","🔌","API"],["pdf","📄","PDF"],["loja","🏪","Loja"],["metas","🎯","Metas"],["users","👥","Usuários"]].map(([id,ic,lb])=>(<button key={id} onClick={()=>setTab(id)} style={{display:"flex",alignItems:"center",gap:8,padding:"9px 12px",borderRadius:7,border:"none",cursor:"pointer",textAlign:"left",background:tab===id?D.goldBg:"transparent",color:tab===id?D.goldSoft:D.txLightDim,fontSize:11,fontWeight:600}}><span>{ic}</span>{lb}</button>))}</div><div style={{flex:1,overflowY:"auto",padding:24}}>{tab==="api"&&<div style={{display:"flex",flexDirection:"column",gap:16,maxWidth:800}}><div style={{fontSize:15,fontWeight:800,color:D.txLight}}>🔌 Integração com ERP</div><div style={{background:D.panel,borderRadius:12,padding:22,border:`1px solid ${D.bd}`}}><div style={{display:"flex",alignItems:"center",gap:8,marginBottom:18}}><div style={{width:9,height:9,borderRadius:"50%",background:conn?D.greenSoft:sync?D.orange:D.redSoft,boxShadow:conn?`0 0 8px ${D.greenSoft}`:"none"}}/><span style={{fontSize:12,color:conn?D.greenSoft:D.txLightSec,fontWeight:700}}>{conn?"Conectado":sync?"Sincronizando...":"Desconectado"}</span></div><div style={{marginBottom:14}}><label style={{fontSize:9,color:D.txLightDim,fontWeight:700,marginBottom:5,display:"block"}}>URL BASE</label><input value={url} onChange={e=>setUrl(e.target.value)} style={{width:"100%",padding:"11px 14px",borderRadius:8,border:`1px solid ${D.bd}`,background:D.chrome3,color:D.cyan,fontSize:12,fontFamily:FM,outline:"none",boxSizing:"border-box"}}/></div><div style={{display:"grid",gridTemplateColumns:"1fr 1fr",gap:10,marginBottom:14}}><div><label style={{fontSize:9,color:D.txLightDim,fontWeight:700,marginBottom:5,display:"block"}}>USUÁRIO</label><input value={apiUser} onChange={e=>setApiUser(e.target.value)} placeholder="admin@mercado.com" style={{width:"100%",padding:"9px 12px",borderRadius:7,border:`1px solid ${D.bd}`,background:D.chrome3,color:D.txLight,fontSize:11,outline:"none",boxSizing:"border-box"}}/></div><div><label style={{fontSize:9,color:D.txLightDim,fontWeight:700,marginBottom:5,display:"block"}}>SENHA</label><input value={apiPass} onChange={e=>setApiPass(e.target.value)} type="password" placeholder="********" style={{width:"100%",padding:"9px 12px",borderRadius:7,border:`1px solid ${D.bd}`,background:D.chrome3,color:D.txLight,fontSize:11,outline:"none",boxSizing:"border-box"}}/></div></div><div style={{marginBottom:18}}><label style={{fontSize:9,color:D.txLightDim,fontWeight:700,marginBottom:5,display:"block"}}>TOKEN</label><div style={{padding:"9px 12px",borderRadius:7,fontFamily:FM,fontSize:9,wordBreak:"break-all",background:conn?D.greenBgD:D.chrome3,color:conn?D.greenSoft:D.txLightDim}}>{apiState.token?apiState.token.substring(0,80)+"...":"Aguardando conexão..."}</div></div>{apiState.error&&<div style={{padding:"10px 14px",borderRadius:7,background:D.redBgD,border:`1px solid ${D.redSoft}20`,fontSize:11,color:D.redSoft,fontWeight:600}}>&#9888; {apiState.error}</div>}<button onClick={doConnect} disabled={sync||!apiUser||!apiPass} style={{padding:"11px 28px",borderRadius:9,border:"none",cursor:sync?"wait":"pointer",background:sync?D.chrome3:`linear-gradient(135deg,${D.goldSoft},${D.gold})`,color:sync?D.txLightDim:D.chrome,fontWeight:800,fontSize:13,fontFamily:F}}>{sync?"Sincronizando...":conn?"Re-sincronizar":"Conectar"}</button></div><div style={{display:"flex",gap:5,flexWrap:"wrap"}}>{API_EPS.map((cat,i)=>(<button key={i} onClick={()=>setAc(i)} style={{padding:"5px 12px",borderRadius:6,fontSize:10,fontWeight:600,cursor:"pointer",border:`1px solid ${ac===i?cat.c+"50":D.bd}`,background:ac===i?cat.c+"10":"transparent",color:ac===i?cat.c:D.txLightDim}}>{cat.cat} ({cat.eps.length})</button>))}</div><div style={{display:"flex",flexDirection:"column",gap:3}}>{API_EPS[ac].eps.map((ep,i)=>{const s=sp[ep];return(<div key={i} style={{display:"flex",alignItems:"center",gap:10,padding:"9px 14px",background:D.panel,border:`1px solid ${D.bd}`,borderRadius:7}}><div style={{width:7,height:7,borderRadius:"50%",background:s==="done"?D.greenSoft:s==="sync"?D.orange:s==="pending"?D.txLightDim:D.chrome3}}/><code style={{fontSize:11,color:API_EPS[ac].c,fontFamily:FM,flex:1}}>{ep}</code><span style={{fontSize:9,color:s==="done"?D.greenSoft:s==="sync"?D.orange:D.txLightDim}}>{s==="done"?"OK":s==="sync"?"...":"—"}</span></div>)})}</div></div>}{tab==="pdf"&&<div style={{display:"flex",flexDirection:"column",gap:16}}><div style={{fontSize:15,fontWeight:800,color:D.txLight}}>📄 Extração de PDF</div><div style={{border:`2px dashed ${D.bd}`,borderRadius:12,padding:"40px 20px",textAlign:"center",background:D.panel,cursor:"pointer"}}><div style={{fontSize:32,opacity:.3}}>📄</div><div style={{fontSize:13,fontWeight:700,color:D.txLight}}>Arraste PDFs aqui</div><div style={{fontSize:11,color:D.txLightDim}}>NFs, tabelas de preço, relatórios</div></div></div>}{tab==="metas"&&<div style={{display:"flex",flexDirection:"column",gap:12}}><div style={{fontSize:15,fontWeight:800,color:D.txLight}}>🎯 Metas</div>{[["Receita Bruta","R$ 2.946.185"],["Margem Sem Oferta","30,00%"],["Margem Com Oferta","15,00%"],["RCV","75,66%"],["Ticket Médio","R$ 81,10"],["Cobertura Estoque","30 dias"]].map(([i,m],k)=>(<div key={k} style={{display:"flex",alignItems:"center",gap:12,padding:"12px 16px",background:D.panel,border:`1px solid ${D.bd}`,borderRadius:8}}><span style={{flex:1,fontSize:12,color:D.txLight,fontWeight:600}}>{i}</span><input defaultValue={m} style={{width:140,padding:"7px 10px",borderRadius:6,border:`1px solid ${D.bd}`,background:D.chrome3,color:D.goldSoft,fontSize:12,fontFamily:FM,fontWeight:700,outline:"none",textAlign:"right"}}/></div>))}</div>}{tab==="loja"&&<div style={{display:"flex",flexDirection:"column",gap:12}}><div style={{fontSize:15,fontWeight:800,color:D.txLight}}>🏪 Dados da Loja</div>{[["Nome","Supermercado Exemplo"],["CNPJ","12.345.678/0001-90"],["Área (m²)","500"],["Funcionários","35"],["Checkouts","8"],["Cidade","Terra Rica - PR"]].map(([l,p],i)=>(<div key={i}><label style={{fontSize:9,color:D.txLightDim,fontWeight:700,marginBottom:4,display:"block"}}>{l}</label><input placeholder={p} style={{width:"100%",maxWidth:400,padding:"9px 12px",borderRadius:7,border:`1px solid ${D.bd}`,background:D.panel,color:D.txLight,fontSize:12,outline:"none",boxSizing:"border-box"}}/></div>))}</div>}{tab==="users"&&<div style={{display:"flex",flexDirection:"column",gap:10}}><div style={{fontSize:15,fontWeight:800,color:D.txLight}}>👥 Usuários</div>{[{n:"Admin",e:"admin@mercado.com",r:"Admin"},{n:"Compras",e:"compras@mercado.com",r:"Comprador"},{n:"Gerente",e:"gerente@mercado.com",r:"Gerente"}].map((u,i)=>(<div key={i} style={{display:"flex",alignItems:"center",gap:12,padding:"12px 16px",background:D.panel,border:`1px solid ${D.bd}`,borderRadius:9}}><div style={{width:34,height:34,borderRadius:8,background:D.goldBg,display:"flex",alignItems:"center",justifyContent:"center",fontSize:13,fontWeight:800,color:D.goldSoft}}>{u.n[0]}</div><div style={{flex:1}}><div style={{fontSize:12,fontWeight:700,color:D.txLight}}>{u.n}</div><div style={{fontSize:10,color:D.txLightDim}}>{u.e}</div></div><Tag text={u.r} color={D.goldSoft}/></div>))}</div>}</div></div></div>);}

// ══════════ MAIN ══════════
const pages={dash:DashPage,comp:CompPage,prod:ProdPage,ofer:OferPage,prec:PrecPage,forn:FornPage,fin:FinPage,ai:AIPage,cfg:CfgPage};

export default function App(){
  const [pg,setPg]=useState("dash");
  const [detail,setDetail]=useState(null);
  const [detailType,setDetailType]=useState(null);
  const [realData,setRealData]=useState(null);
  const [apiState,setApiState]=useState({
    url:"http://177.73.209.174:8059/integracao/sgsistemas/v1",
    connected:false,
    syncing:false,
    syncProgress:{},
    user:"",
    pass:"",
    token:"",
    error:null,
    syncedAt:null,
    stats:null,
  });

  // Use real data if available, otherwise fall back to demo data
  const activeProdutos = realData?.produtos?.length > 0 ? realData.produtos : PRODUTOS;
  const activeSetores = realData?.setores?.length > 0 ? realData.setores : SETORES;
  const activeForn = realData?.fornecedores?.length > 0 ? realData.fornecedores : FORN;
  const activeVd7 = realData?.vendasDiarias || VD7;
  const activeKpis = realData?.kpis || null;

  const openDetail=(item,type)=>{setDetail(item);setDetailType(type)};
  const pageProps={openDetail,data:{produtos:activeProdutos,setores:activeSetores,fornecedores:activeForn,vd7:activeVd7,kpis:activeKpis,isReal:!!realData}};
  
  const renderPage=()=>{
    if(pg==="cfg")return <CfgPage apiState={apiState} setApiState={setApiState} setRealData={setRealData} openDetail={openDetail}/>;
    const Page=pages[pg];
    return <Page {...pageProps}/>;
  };

  return(
    <div style={{display:"flex",height:"100vh",background:D.chrome,color:D.txLight,fontFamily:F,overflow:"hidden"}}>
      <style>{`@import url('https://fonts.googleapis.com/css2?family=Manrope:wght@300;400;500;600;700;800&display=swap');@import url('https://fonts.googleapis.com/css2?family=IBM+Plex+Mono:wght@400;500;600;700&display=swap');*{margin:0;padding:0;box-sizing:border-box}::-webkit-scrollbar{width:5px}::-webkit-scrollbar-track{background:${D.chrome}}::-webkit-scrollbar-thumb{background:${D.chrome3};border-radius:3px}input::placeholder{color:${D.txLightDim}}select{font-family:${F}}`}</style>
      <Side a={pg} set={setPg} connected={apiState.connected} syncing={apiState.syncing}/>
      <div style={{flex:1,display:"flex",flexDirection:"column",overflow:"hidden"}}>
        {/* Global connection bar */}
        {apiState.connected&&(
          <div style={{padding:"6px 24px",background:D.greenBgD,borderBottom:`1px solid ${D.greenSoft}20`,display:"flex",alignItems:"center",gap:8}}>
            <div style={{width:7,height:7,borderRadius:"50%",background:D.greenSoft,boxShadow:`0 0 6px ${D.greenSoft}`}}/>
            <span style={{fontSize:10,color:D.greenSoft,fontWeight:700}}>API Conectada — Dados Reais</span>
            <span style={{fontSize:9,color:D.txLightDim}}>{apiState.url}</span>
            <div style={{flex:1}}/>
            {apiState.stats&&<span style={{fontSize:9,color:D.greenSoft,fontFamily:FM}}>{apiState.stats.success}/{apiState.stats.total} endpoints</span>}
            {realData?.syncedAt&&<span style={{fontSize:9,color:D.txLightDim,fontFamily:FM}}>Sync: {new Date(realData.syncedAt).toLocaleTimeString("pt-BR")}</span>}
          </div>
        )}
        {apiState.syncing&&(
          <div style={{padding:"6px 24px",background:D.orangeBg+"15",borderBottom:`1px solid ${D.orange}20`,display:"flex",alignItems:"center",gap:8}}>
            <div style={{width:7,height:7,borderRadius:"50%",background:D.orange,animation:"pulse 1s infinite"}}/>
            <span style={{fontSize:10,color:D.orange,fontWeight:700}}>Sincronizando dados reais da API...</span>
            <style>{`@keyframes pulse{0%,100%{opacity:1}50%{opacity:.3}}`}</style>
          </div>
        )}
        {!apiState.connected&&!apiState.syncing&&(
          <div style={{padding:"6px 24px",background:D.redBgD,borderBottom:`1px solid ${D.redSoft}15`,display:"flex",alignItems:"center",gap:8,cursor:"pointer"}} onClick={()=>setPg("cfg")}>
            <div style={{width:7,height:7,borderRadius:"50%",background:D.redSoft}}/>
            <span style={{fontSize:10,color:D.redSoft,fontWeight:700}}>API Desconectada</span>
            <span style={{fontSize:9,color:D.txLightDim}}>Exibindo dados de demonstração &middot; Clique para configurar</span>
          </div>
        )}
        <div style={{flex:1,overflowY:"auto"}}>{renderPage()}</div>
      </div>
      {detail&&<DetailPanel item={detail} type={detailType} onClose={()=>setDetail(null)}/>}
    </div>
  );
}
