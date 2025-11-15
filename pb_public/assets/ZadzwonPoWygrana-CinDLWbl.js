import{p as t}from"./chunk-UH6JLGW7-oKmrXizJ.js";import{C as o}from"./pocketbase.es-DDFA3sFr.js";import"./i18nInstance-CHFDjdcJ.js";const n="/assets/Better%20VCR%209.0.1-4WD-hZkv.ttf",a=new o("http://127.0.0.1:8090");await a.collection("_superusers").authWithPassword("adminadmin@gmail.com","adminadmin");function f({active:e}){const r=e.parameters?.kwota??"69 zł";e.parameters?.telefon;const l=e.parameters?.zadanie??"Wyrizzuj sigmę",s=a.files.getURL(e,e.image);return console.log("url:",s),t.jsxs(t.Fragment,{children:[t.jsx("div",{className:"w-screen h-screen flex items-center justify-center",children:t.jsx("img",{src:s,alt:e.short_description,className:"max-w-full max-h-full object-contain"})}),t.jsx("style",{children:`
              @font-face {
                font-family: 'Better VCR';
                src: url(${n}) format('truetype');
                font-weight: normal;
                font-style: normal;
                font-display: swap;
              }
              .better-vcr { font-family: 'Better VCR', monospace; }
            `}),t.jsxs("p",{className:"better-vcr absolute bottom-18 right-31 text-7xl italic text-white",children:[r," Pkt."]}),t.jsx("p",{className:"better-vcr absolute bottom-66 left-8 text-4xl italic text-[#534E7C]",children:"tel. 123 456 789 (7)"}),t.jsx("p",{className:"better-vcr absolute bottom-22 left-10 text-6xl italic text-white font-light",children:l})]})}export{f as default};
