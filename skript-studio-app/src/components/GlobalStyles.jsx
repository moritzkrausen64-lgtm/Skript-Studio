export function GlobalStyles() {
  return (
    <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Anton&family=Schibsted+Grotesk:wght@400;500;600;700&family=Space+Mono:wght@400;700&display=swap');
        .vs-root{--bg:#0a0b0d;--panel:#131519;--panel-2:#1a1d23;--line:#262a32;--ink:#f2f4f3;--muted:#8a9099;--volt:#ccff00;--signal:#ff5a3c;
          background:var(--bg);color:var(--ink);font-family:'Schibsted Grotesk',sans-serif;min-height:100vh;
          background-image:radial-gradient(circle at 85% -10%, rgba(204,255,0,0.07), transparent 45%);}
        .vs-root *{box-sizing:border-box;}
        .block{display:block;} .mb-1{margin-bottom:4px;} .mb-3{margin-bottom:12px;} .mb-4{margin-bottom:16px;}
        .mb-5{margin-bottom:20px;} .mb-7{margin-bottom:28px;} .mt-3{margin-top:12px;}
        .flex{display:flex;} .grid{display:grid;} .items-center{align-items:center;} .items-end{align-items:flex-end;}
        .items-start{align-items:flex-start;} .justify-between{justify-content:space-between;} .justify-end{justify-content:flex-end;}
        .flex-wrap{flex-wrap:wrap;} .text-right{text-align:right;} .text-center{text-align:center;}
        .gap-2{gap:8px;} .gap-3{gap:12px;} .gap-5{gap:20px;} .gap-7{gap:28px;}
        .grid-cols-2{grid-template-columns:repeat(2,1fr);} .gap-x-5{column-gap:20px;} .gap-y-2{row-gap:8px;}
        .space-y-4 > * + *{margin-top:16px;} .space-y-5 > * + *{margin-top:20px;} .space-y-2 > * + *{margin-top:8px;}
        @media(min-width:768px){.md\\:grid-cols-2{grid-template-columns:repeat(2,1fr);}}
        @media(min-width:1024px){.lg\\:grid-cols-\\[380px_1fr\\]{grid-template-columns:380px 1fr;}}
        .mono-label{display:block;font-family:'Space Mono',monospace;font-size:10px;letter-spacing:0.12em;text-transform:uppercase;color:var(--muted);margin-bottom:6px;}
        .vs-input{width:100%;background:var(--panel-2);border:1px solid var(--line);color:var(--ink);border-radius:8px;padding:10px 12px;font-family:inherit;font-size:14px;outline:none;}
        .vs-input:focus{border-color:var(--volt);}
        textarea.vs-input{resize:vertical;line-height:1.5;}
        .vs-panel{background:var(--panel);border:1px solid var(--line);border-radius:14px;}
        .section-head{display:flex;align-items:center;gap:8px;font-family:'Anton';font-size:15px;letter-spacing:0.04em;text-transform:uppercase;color:var(--ink);margin-bottom:12px;}
        .section-head svg{color:var(--volt);}
        .meta-row{font-size:13px;color:var(--muted);line-height:1.45;margin:2px 0;}
        .meta-row b{color:var(--ink);font-weight:600;}
        .beat-row{display:flex;gap:12px;padding:10px 0;border-top:1px solid var(--line);}
        .beat-tag{font-family:'Space Mono';font-size:10px;text-transform:uppercase;color:var(--bg);background:var(--volt);padding:3px 7px;border-radius:5px;height:fit-content;white-space:nowrap;}
        .vs-btn{display:inline-flex;align-items:center;justify-content:center;gap:8px;background:var(--volt);color:var(--bg);font-weight:700;border:none;border-radius:10px;padding:13px 20px;cursor:pointer;font-family:'Anton';letter-spacing:0.04em;text-transform:uppercase;font-size:15px;transition:transform .1s;}
        .vs-btn:hover{transform:translateY(-1px);} .vs-btn:disabled{opacity:.5;cursor:wait;transform:none;}
        .vs-ghost{display:inline-flex;align-items:center;gap:6px;background:var(--panel-2);color:var(--ink);border:1px solid var(--line);border-radius:8px;padding:7px 12px;font-size:12px;cursor:pointer;font-family:'Space Mono';}
        .vs-ghost:hover{border-color:var(--volt);}
        .pill{padding:8px 12px;border-radius:8px;border:1px solid var(--line);background:var(--panel-2);font-size:12px;cursor:pointer;display:flex;align-items:center;gap:6px;}
        .pill.on{border-color:var(--volt);background:rgba(204,255,0,0.1);color:var(--volt);}
        .tab{font-family:'Space Mono';font-size:12px;letter-spacing:.08em;text-transform:uppercase;padding:8px 4px;color:var(--muted);cursor:pointer;border-bottom:2px solid transparent;display:flex;align-items:center;gap:7px;}
        .tab.on{color:var(--ink);border-color:var(--volt);}
        .animate-spin{animation:spin 1s linear infinite;} @keyframes spin{to{transform:rotate(360deg);}}
    `}</style>
  );
}
