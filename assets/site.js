
const DATA_URL = "/data/projects.json";
const esc = (s="") => String(s).replace(/[&<>"']/g,m=>({"&":"&amp;","<":"&lt;",">":"&gt;",'"':"&quot;","'":"&#39;"}[m]));
const media = (p,label="project media") => `<div class="placeholder" style="--accent:${p.accent};--secondary:${p.secondary}"><span class="label">${esc(label)}</span></div>`;
const header = () => `<header class="site-header"><div class="shell"><a class="brand" href="/">Iris Wang</a><nav class="nav" aria-label="Primary"><a href="/work/">Work</a><a href="/about/">About</a><a href="mailto:iriswangsh@gmail.com">Contact</a></nav></div></header>`;
const footer = () => `<footer><div class="shell"><p class="footer-big">Systems<br>meet atmosphere.</p><div class="footer-row"><div><a href="mailto:iriswangsh@gmail.com">iriswangsh@gmail.com</a><br>Melbourne, Australia</div><div>Graphic + UX designer<br>© 2026 Iris Wang</div></div></div></footer>`;

async function getProjects(){
  const r=await fetch(DATA_URL);
  if(!r.ok) throw new Error("Project data unavailable");
  return r.json();
}

function shortStatus(s=""){
  return s.split("·")[0].trim();
}

function card(p,cls=""){
  return `<a class="project-card ${cls}" href="/work/${p.slug}/" data-project="${p.slug}" data-accent="${p.accent}" data-disciplines="${p.disciplines.join(" ").toLowerCase()}" aria-label="${esc(p.title)} case study">
    <div class="project-media">${media(p,`${p.title} — media placeholder`)}</div>
    <div class="project-info">
      <span class="project-num">${p.number}</span>
      <div>
        <h3 class="project-title">${esc(p.title)}</h3>
        <p class="project-summary">${esc(p.summary)}</p>
        <p class="meta-mono">${esc(p.disciplines.slice(0,2).join(" · "))} · ${esc(shortStatus(p.status))}</p>
      </div>
      <span class="project-year meta-mono">${p.year}</span>
    </div>
  </a>`;
}

const filterCopy = {
  all: "Systems and atmosphere across identity, interface and motion.",
  graphic: "Visual systems that stay recognisable across formats.",
  ux: "Research translated into clearer digital decisions.",
  motion: "Time, interaction and sequencing as design material."
};

function filterProjects(kind){
  document.querySelectorAll(".filter").forEach(b=>b.setAttribute("aria-pressed",String(b.dataset.filter===kind)));
  document.querySelectorAll(".project-card").forEach(c=>{
    const d=c.dataset.disciplines||"";
    const show=kind==="all"
      || (kind==="graphic" && /(brand|packaging|campaign|editorial|print|typography|exhibition|bookmaking)/.test(d))
      || (kind==="ux" && /(ui\/ux|ux research|product design|e-commerce|front-end|ui design|interaction)/.test(d))
      || (kind==="motion" && /(motion|filmmaking|interaction|front-end)/.test(d));
    c.classList.toggle("hidden-card",!show);
  });
  const copy=document.querySelector("#focus-slogan");
  if(copy) copy.textContent=filterCopy[kind]||filterCopy.all;
}

function setupHeroMotion(projects){
  const hero=document.querySelector(".hero");
  const layer=document.querySelector("#hero-windows");
  if(!hero||!layer||matchMedia("(prefers-reduced-motion: reduce)").matches||matchMedia("(pointer: coarse)").matches) return;

  const pool=Array.from({length:6},(_,i)=>{
    const p=projects[i%projects.length];
    const el=document.createElement("div");
    el.className="motion-trail";
    el.innerHTML=media(p,p.title);
    layer.appendChild(el);
    return el;
  });

  let index=0,lastX=-999,lastY=-999;
  hero.addEventListener("pointermove",e=>{
    const r=hero.getBoundingClientRect();
    const x=e.clientX-r.left,y=e.clientY-r.top;
    if(Math.hypot(x-lastX,y-lastY)<82) return;
    lastX=x;lastY=y;
    const el=pool[index%pool.length];
    const p=projects[(index+1)%projects.length];
    el.innerHTML=media(p,p.title);
    el.style.left=`${x}px`;el.style.top=`${y}px`;
    el.classList.remove("is-visible");
    requestAnimationFrame(()=>el.classList.add("is-visible"));
    setTimeout(()=>el.classList.remove("is-visible"),1450);
    document.documentElement.style.setProperty("--hero-accent",p.accent);
    index++;
  });

  hero.addEventListener("pointerleave",()=>{
    pool.forEach(el=>el.classList.remove("is-visible"));
    document.documentElement.style.setProperty("--hero-accent","#F5F3EE");
  });
}

function setupHomeCardSlogans(){
  document.querySelectorAll(".project-card").forEach(card=>{
    card.addEventListener("pointerenter",()=>{
      document.documentElement.style.setProperty("--accent",card.dataset.accent||"#CFDD2C");
    });
  });
}

function setupHeaderState(){
  const workNav=document.querySelector(".work-nav");
  const headerEl=document.querySelector(".site-header");
  if(!workNav || !headerEl) return;

  const sentinelTop=()=>workNav.getBoundingClientRect().top;
  const update=()=>{
    const active=sentinelTop()<=0;
    document.body.classList.toggle("work-nav-active",active);
  };

  update();
  addEventListener("scroll",update,{passive:true});
  addEventListener("resize",update);
}

async function renderHome(){
  const projects=await getProjects();
  document.body.insertAdjacentHTML("afterbegin",header());
  const featured=projects.filter(p=>p.featured), more=projects.filter(p=>!p.featured);
  const classes=["wide","narrow","medium","large","large","medium"];
  document.querySelector("#featured-grid").innerHTML=featured.map((p,i)=>card(p,classes[i]||"")).join("");
  document.querySelector("#more-grid").innerHTML=more.map(p=>card(p)).join("");
  document.querySelectorAll(".filter").forEach(b=>b.addEventListener("click",()=>filterProjects(b.dataset.filter)));

  const windows=[projects[0],projects[1],projects[2],projects[4]];
  document.querySelector("#hero-windows").innerHTML=windows.map((p,i)=>`<div class="hero-window" style="--accent:${p.accent};--secondary:${p.secondary}">${media(p,i===0?"interface":i===1?"identity":i===2?"prototype":"motion")}</div>`).join("");

  setupHeroMotion(projects);
  setupHomeCardSlogans();
  setupHeaderState();
  document.body.insertAdjacentHTML("beforeend",footer());
}

async function renderWork(){
  const projects=await getProjects();
  document.querySelector("#work-grid").innerHTML=projects.map(p=>card(p)).join("");
  document.querySelectorAll(".filter").forEach(b=>b.addEventListener("click",()=>filterProjects(b.dataset.filter)));
  setupHomeCardSlogans();
  document.body.insertAdjacentHTML("beforeend",footer());
}

const flowModes=["full","split","offset","left","tall","band"];

function mediaLabel(title,index){
  if(/research|finding|synthesis|testing|method/i.test(title)) return "research / evidence";
  if(/solution|prototype|application|outcome|final|implementation/i.test(title)) return "final outcome";
  if(/identity|system|concept/i.test(title)) return "visual system";
  return index%2 ? "process detail" : "project media";
}

function projectMeta(p){
  return [
    ["Discipline",p.disciplines.join(", ")],
    ["Year",p.year],
    ["Status",p.status],
    ["Role",p.role],
    ["Tools",p.tools]
  ].filter(x=>x[1]);
}

function createChapterRail(p){
  return `<nav class="chapter-rail" aria-label="Project chapters">
    ${p.sections.map((s,i)=>`<a href="#section-${i+1}" data-label="${esc(s[0])}" aria-label="${esc(s[0])}"></a>`).join("")}
  </nav><div class="chapter-tip" id="chapter-tip"></div>`;
}

function setupChapterRail(){
  const links=[...document.querySelectorAll(".chapter-rail a")];
  const tip=document.querySelector("#chapter-tip");
  const sections=[...document.querySelectorAll(".flow-item")];
  if(!links.length) return;

  links.forEach(a=>{
    a.addEventListener("mouseenter",()=>{
      tip.textContent=a.dataset.label||"";
      tip.classList.add("visible");
    });
    a.addEventListener("mouseleave",()=>tip.classList.remove("visible"));
    a.addEventListener("focus",()=>{
      tip.textContent=a.dataset.label||"";
      tip.classList.add("visible");
    });
    a.addEventListener("blur",()=>tip.classList.remove("visible"));
  });

  const io=new IntersectionObserver(entries=>{
    entries.forEach(entry=>{
      if(entry.isIntersecting){
        const i=sections.indexOf(entry.target);
        links.forEach((a,j)=>a.classList.toggle("active",i===j));
      }
    });
  },{rootMargin:"-42% 0px -48% 0px",threshold:0});
  sections.forEach(s=>io.observe(s));
}




function render60BPM(p,projects){
  const A="/public/projects/60-bpm";
  const pic=(src,alt,cls="")=>`<img class="${cls}" src="${A}/${src}" alt="${esc(alt)}" loading="lazy">`;
  const next=projects[(projects.indexOf(p)+1)%projects.length];

  document.body.classList.add("compact-brand","project-60");
  document.documentElement.style.setProperty("--project-accent","#CFDD2C");
  document.title="60 BPM — Iris Wang";
  document.body.insertAdjacentHTML("afterbegin",header()+`<div class="reading-progress" id="progress"></div>`);

  document.querySelector("#project-root").innerHTML=`
  <article class="bpm4">
    <nav class="bpm4-rail" aria-label="60 BPM sections">
      ${["Intro","System","Logo","Character","Gradients","Applications","Campaign","Website"].map((x,i)=>`<a href="#bpm4-${i+1}" data-label="${x}"><i></i><span>0${i+1}</span></a>`).join("")}
    </nav>
    <div class="bpm4-tip" id="bpm4-tip"></div>

    <section class="bpm4-hero" id="bpm4-1">
      ${pic("hero.jpg","60 BPM final brand collateral","bpm4-hero-img")}
      <div class="bpm4-shade"></div>
      <div class="shell bpm4-hero-copy">
        <span class="bpm4-meta">Brand identity · Packaging · Campaign · 2024</span>
        <h1>60<br>BPM</h1>
        <p>A café identity translating a 60-BPM tempo into a calm, rechargeable brand world.</p>
      </div>
    </section>

    <section class="bpm4-system" id="bpm4-2">
      <div class="shell bpm4-system-grid">
        <div class="bpm4-system-left">
          <span class="bpm4-meta">02 — Visual system</span>
          <div class="bpm4-font-label"><span>Yorkmade</span><span>Brand display type</span></div><div class="bpm4-yorkmade"><span>THE</span><span>SLOWER</span><span>THE</span><span>HUMAN-ER</span></div>
          <p>The brand slows the pace through soft rounded display forms, compact information and one memorable acid-green accent.</p>
        </div>

        <div class="bpm4-system-right" aria-label="60 BPM typography and colour system">
          <div class="bpm4-type-card">
            <div class="top"><b>Montserrat<br>Black</b><span>Bigger Text</span></div>
            <div class="sample black">Bpm</div>
          </div>
          <div class="bpm4-type-card">
            <div class="top"><b>Montserrat<br>Bold</b><span>Big Text</span></div>
            <div class="sample bold">Bpm</div>
          </div>
          <div class="bpm4-type-card">
            <div class="top"><b>Montserrat<br>Regular</b><span>Body Text</span></div>
            <div class="sample regular">Bpm</div>
          </div>

          <div class="bpm4-swatch green">
            <b>60 BPM Green</b>
            <div><span>Hex: #CFDD2C</span><span>CMYK: 6, 0, 80, 13</span><span>RGB: 207, 221, 44</span></div>
          </div>
          <div class="bpm4-swatch signature">
            <b>Signature</b>
            <div><span>Hex: #E4A3C9</span><span>CMYK: 0, 29, 12, 11</span><span>RGB: 228, 163, 201</span></div>
          </div>

          <div class="bpm4-swatch black">
            <b>60 BPM Black</b>
            <div><span>Hex: #020402</span><span>CMYK: 50, 0, 50, 98</span><span>RGB: 2, 4, 2</span></div>
          </div>
          <div class="bpm4-swatch cream">
            <b>60 BPM Cream</b>
            <div><span>Hex: #FEFEFA</span><span>CMYK: 0, 0, 2, 0</span><span>RGB: 254, 254, 250</span></div>
          </div>
        </div>
      </div>
    </section>

    <section class="bpm4-logo" id="bpm4-3">
      <div class="shell">
        <div class="bpm4-head"><span>03 — Logo</span><p></p></div>
        <div class="bpm4-logo-flow">
          <div class="bpm4-logo-copy">
            <h2>Refresh.<br>Recharge.<br>Rejuvenate.</h2>
            <p>The positive-dark logo combines a black coffee-bean form with the chartreuse battery top and positive cross, linking coffee with the idea of recharging.</p>
            <p class="note">The mark stays simple enough to carry across packaging, cups, bags, campaign graphics and digital touchpoints.</p>
          </div>
          <div class="bpm4-logo-main">
            ${pic("svg/60 BPM Black X.svg","Primary 60 BPM positive-dark logo")}
            <span>Primary · positive dark</span>
          </div>
          <div class="bpm4-logo-variants">
            <figure>${pic("svg/60 BPM Black -.svg","60 BPM negative-dark logo")}<figcaption>Negative dark</figcaption></figure>
            <figure>${pic("svg/60 BPM Green X.svg","60 BPM positive green logo")}<figcaption>Positive green</figcaption></figure>
            <figure>${pic("svg/60 BPM Green -.svg","60 BPM negative green logo")}<figcaption>Negative green</figcaption></figure>
          </div>
        </div>
      </div>
    </section>

    <section class="bpm4-dagee-intro" id="bpm4-4">
      <div class="bpm4-character-stage">
        <img src="${A}/character/CHARACTER_FULL.png" alt="THE SLOWER THE HUMAN-ER — Dagee character introduction" class="bpm4-character-full">
      </div>
    </section>

    <section class="bpm4-dagee">
      <div class="shell">
        <span class="bpm4-meta">04 — Character</span>
        <h2 class="bpm4-dagee-sub">Dagee, the creation of tempo</h2>
        <p class="bpm4-dagee-copy">The character’s name Dagee stems from the musical term “Adagio”, referring to a tempo of 60 BPM. Two stages of Dagee show a shift from a monster-like baby to a more human-like figure, echoing the idea of slowing down and keeping calm in daily life.</p>
        <div class="bpm4-dagee-cards">
          <figure>
            <div class="bpm4-dagee-panel young">${pic("character/dagee_1.svg","Young Dagee character")}</div>
            <figcaption><b>Young Dagee</b><span>open · energetic · recharged</span></figcaption>
          </figure>
          <figure>
            <div class="bpm4-dagee-panel grown">${pic("character/dagee_2.svg","Grown Dagee character")}</div>
            <figcaption><b>Grown Dagee</b><span>slower · softer · restored</span></figcaption>
          </figure>
        </div>
      </div>
    </section>

    <section class="bpm4-gradients-section" id="bpm4-5">
      <div class="shell">
        <div class="bpm4-head light"><span>05 — Tempo gradients</span><p>Three tempo states translate the same visual language from Adagio through Moderato to Presto.</p></div>
        <div class="bpm4-gradients">
          <figure><img src="${A}/svg/60 BPM Pattern.svg" alt="60 BPM Adagio gradient pattern"><figcaption><b>60 BPM</b><span>Adagio</span></figcaption></figure>
          <figure><img src="${A}/svg/120 BPM Pattern.svg" alt="120 BPM Moderato gradient pattern"><figcaption><b>120 BPM</b><span>Moderato</span></figcaption></figure>
          <figure><img src="${A}/svg/180 BPM Pattern.svg" alt="180 BPM Presto gradient pattern"><figcaption><b>180 BPM</b><span>Presto</span></figcaption></figure>
        </div>
      </div>
    </section>

    <section class="bpm4-pack" id="bpm4-6">
      <div class="shell">
        <div class="bpm4-head light"><span>06 — Packaging + applications</span><p>The identity moves through description cards, printed pieces, coffee packaging and carry-bag applications as one connected café system.</p></div>

        <div class="bpm4-subhead"><h3>Description cards</h3></div>
        <div class="bpm4-desc-cards" aria-label="Interactive description cards">
          <button class="bpm4-flip-card" type="button" aria-pressed="false" aria-label="Flip Adagio description card">
            <span class="bpm4-flip-inner">
              <span class="bpm4-flip-face bpm4-flip-front"><img src="${A}/digital/Description Card_01.svg" alt="Adagio description card front"></span>
              <span class="bpm4-flip-face bpm4-flip-back"><img src="${A}/digital/Description Card Refinement2.png" alt="Adagio description card back"></span>
            </span>
          </button>
          <button class="bpm4-flip-card" type="button" aria-pressed="false" aria-label="Flip Moderato description card">
            <span class="bpm4-flip-inner">
              <span class="bpm4-flip-face bpm4-flip-front"><img src="${A}/digital/Description Card_02.svg" alt="Moderato description card front"></span>
              <span class="bpm4-flip-face bpm4-flip-back"><img src="${A}/digital/Description Card Refinement4.png" alt="Moderato description card back"></span>
            </span>
          </button>
          <button class="bpm4-flip-card" type="button" aria-pressed="false" aria-label="Flip Presto description card">
            <span class="bpm4-flip-inner">
              <span class="bpm4-flip-face bpm4-flip-front"><img src="${A}/digital/Description Card_03.svg" alt="Presto description card front"></span>
              <span class="bpm4-flip-face bpm4-flip-back"><img src="${A}/digital/Description Card Refinement6.png" alt="Presto description card back"></span>
            </span>
          </button>
        </div>
      </div>

      <div class="bpm4-merch-flow" aria-label="60 BPM paper and printed merchandise">
        <div class="bpm4-merch-flow-track">
          ${["1","6","2","11","10","8","7","9","12","1","6","2","11","10","8","7","9","12"].map((n,i)=>`<img src="${A}/merch/merch_${n}.jpg" alt="${i<9?`60 BPM printed merchandise ${n}`:""}" ${i>=9?'aria-hidden="true"':''} loading="lazy">`).join("")}
        </div>
      </div>

      <div class="shell">
        <div class="bpm4-bags-subsection">
          <div class="bpm4-subhead"><h3>Coffee bags + carry bags</h3></div>
          <div class="bpm4-mockup-layout">
            <div class="coffee-row">
              ${pic("mockup/Coffee Bag PSD Mockup black Adagio.jpg","Adagio coffee bag")}
              ${pic("mockup/Coffee Bag PSD Mockup black moderato.jpg","Moderato coffee bag")}
              ${pic("mockup/Coffee Bag PSD Mockup black.jpg","Presto coffee bag")}
            </div>
            <div class="bag-row">
              <div class="tote-stack">
                ${pic("mockup/Canvas Tote Bag Mockup 1.jpg","60 BPM canvas tote bag")}
                ${pic("mockup/Canvas Tote Bag Mockup white.jpg","White 60 BPM canvas tote bag")}
              </div>
              <div class="shopping-bag">
                ${pic("mockup/Shopping Paper Bag PSD Mockup.jpg","60 BPM shopping paper bag")}
              </div>
            </div>
          </div>
        </div>

        <div class="bpm4-merch-full">
          ${pic("merch/merch_5.jpg","60 BPM menu and identity applications")}
        </div>
      </div>
    </section>

    <section class="bpm4-campaign" id="bpm4-7">
      <div class="shell">
        <div class="bpm4-head"><span>07 — Campaign posters</span><p>Three character-led posters extend the slower-tempo language into direct campaign messages.</p></div>
        <div class="bpm4-posters">
          <div>${pic("digital/POSTER_01_A4_P.png","More Espresso campaign poster")}</div>
          <div>${pic("digital/POSTER_02_A4_P.png","Yes Desserts campaign poster")}</div>
          <div>${pic("digital/STAND POSTER_A4_P.png","60 BPM standing campaign poster")}</div>
        </div>
      </div>
    </section>

    <section class="bpm4-digital" id="bpm4-8">
      <div class="shell">
        <div class="bpm4-head light"><span>08 — Interactive website</span><p>Dagee becomes an icebreaker and “mind teller”, translating the same tone into a lightweight mobile interaction.</p></div>
      </div>
      <div class="bpm4-phone-field">
        <div class="bpm4-phone-track" id="bpm4-track">
          ${["WEB_60 BPM_INTRO.svg","WEB_60 BPM_CHAT-1.svg","WEB_60 BPM_CHAT-2.svg","WEB_60 BPM_CHAT-3.svg","WEB_60 BPM_CHAT-4.svg","WEB_60 BPM_CHAT.svg","WEB_60 BPM_INTRO.svg","WEB_60 BPM_CHAT-1.svg","WEB_60 BPM_CHAT-2.svg","WEB_60 BPM_CHAT-3.svg","WEB_60 BPM_CHAT-4.svg","WEB_60 BPM_CHAT.svg"].map((f,i)=>`<div class="phone" ${i>=6?'aria-hidden="true"':''}><img src="${A}/website/${f}" alt="${i<6?`60 BPM mobile interface screen ${i+1}`:""}" loading="lazy"></div>`).join("")}
        </div>
      </div>
      <div class="shell bpm4-digital-note"><p>Visitors move from the introduction into a short emotional check-in and receive suggestions connected to menu choices and ways to rest.</p></div>
    </section>

    <section class="bpm4-finale" aria-label="60 BPM closing statement">
      <img class="bpm4-finale-bg" src="${A}/merch/merch_4.jpg" alt="60 BPM final branded merchandise and café application">
      <img class="bpm4-finale-logo" src="${A}/svg/Secondary Logo 4.svg" alt="60 BPM secondary logo 4">
    </section>

    <a class="next-project bpm4-next" href="/work/${next.slug}/"><span class="meta-mono">NEXT PROJECT</span><br>${esc(next.title)} →</a>
  </article>`;

  document.body.insertAdjacentHTML("beforeend",footer());

  const progress=document.querySelector("#progress");
  addEventListener("scroll",()=>{
    const h=document.documentElement.scrollHeight-innerHeight;
    progress.style.width=`${h?scrollY/h*100:0}%`;
  },{passive:true});

  const rail=[...document.querySelectorAll(".bpm4-rail a")];
  const sections=rail.map(a=>document.querySelector(a.getAttribute("href")));
  const tip=document.querySelector("#bpm4-tip");
  rail.forEach(a=>{
    a.addEventListener("mouseenter",()=>{tip.textContent=a.dataset.label;tip.classList.add("show")});
    a.addEventListener("mouseleave",()=>tip.classList.remove("visible"));
  });
  const obs=new IntersectionObserver(es=>es.forEach(e=>{
    if(e.isIntersecting){
      const i=sections.indexOf(e.target);
      rail.forEach((a,j)=>a.classList.toggle("active",i===j));
    }
  }),{rootMargin:"-42% 0px -48% 0px"});
  sections.forEach(s=>obs.observe(s));

  const flipCards=[...document.querySelectorAll(".bpm4-flip-card")];
  flipCards.forEach(card=>{
    let locked=false;
    const setFlip=(on)=>{
      card.classList.toggle("is-flipped",on);
      card.setAttribute("aria-pressed",on?"true":"false");
    };
    card.addEventListener("click",()=>{
      locked=!locked;
      setFlip(locked);
    });
    if(matchMedia("(hover:hover) and (pointer:fine)").matches){
      card.addEventListener("mouseenter",()=>{ if(!locked) setFlip(true); });
      card.addEventListener("mouseleave",()=>{ if(!locked) setFlip(false); });
    }
  });

  const gradientSection=document.querySelector(".bpm4-gradients");
  if(gradientSection){
    const gio=new IntersectionObserver(([entry])=>{
      gradientSection.classList.toggle("is-offscreen",!entry.isIntersecting);
    },{rootMargin:"100px"});
    gio.observe(gradientSection);
  }

  const track=document.querySelector("#bpm4-track");
  if(track && innerWidth>768 && !matchMedia("(prefers-reduced-motion: reduce)").matches){
    let x=0,raf;
    const move=()=>{
      x-=.62;
      const half=track.scrollWidth/2;
      if(-x>=half)x=0;
      track.style.transform=`translate3d(${x}px,0,0)`;
      raf=requestAnimationFrame(move);
    };
    raf=requestAnimationFrame(move);
    track.addEventListener("mouseenter",()=>cancelAnimationFrame(raf));
    track.addEventListener("mouseleave",()=>raf=requestAnimationFrame(move));
  }

  const cards=[...document.querySelectorAll(".dagee-card")];
  if(cards.length && !matchMedia("(prefers-reduced-motion: reduce)").matches){
    cards.forEach((card,i)=>{
      card.animate(
        [{transform:"translateY(0) rotate(0deg)"},{transform:`translateY(-10px) rotate(${i?1.4:-1.4}deg)`},{transform:"translateY(0) rotate(0deg)"}],
        {duration:3200+i*500,iterations:Infinity,easing:"ease-in-out"}
      );
    });
  }
}




function renderEtherealRealm(p,projects){
  const A="/public/projects/ethereal-realm";
  const enc=s=>s.split("/").map(encodeURIComponent).join("/");
  const img=(src,alt,cls="")=>`<img class="${cls}" src="${A}/${enc(src)}" alt="${esc(alt)}" loading="lazy">`;
  const frame=(name,alt="Realm app interface",cls="")=>img(`app/App Frames/${name}`,alt,`er2-phone-img ${cls}`);
  const homeAsset=(candidates,alt,cls="")=>{
    const urls=candidates.map(s=>`${A}/${enc(`app/homepage/${s}`)}`);
    const fallback=`${A}/${enc("app/App Frames/APP_ETH_RR_ForYou.png")}`;
    const first=urls.shift()||fallback;
    const list=[...urls,fallback].map(u=>u.replace(/"/g,"&quot;")).join("|");
    return `<img class="${cls}" src="${first}" data-fallbacks="${list}" alt="${esc(alt)}" loading="lazy">`;
  };
  const appFolderImg=(folder,name,alt,cls="")=>img(`app/${folder}/${name}`,alt,cls);
  const flowFrames=(folder,names,altPrefix="Realm app flow")=>names.map((name,i)=>appFolderImg(folder,name,`${altPrefix} ${i+1}`,"er4-flow-frame")).join("");
  const svgAsset=(candidates,alt,cls="")=>{
    const urls=candidates.map(s=>`${A}/${enc(`svg/${s}`)}`);
    const first=urls.shift()||"";
    const list=urls.map(u=>u.replace(/"/g,"&quot;")).join("|");
    return `<img class="${cls}" src="${first}" data-fallbacks="${list}" alt="${esc(alt)}" loading="lazy">`;
  };
  const next=projects[(projects.indexOf(p)+1)%projects.length];

  const members=[
    {n:"AeRi",native:"『애리』",role:"Leader · Lead Rapper",dob:"15 Mar 2004",mbti:"INFP",nationality:"Korean",colour:"Daffodil",emojiSvg:"AeRi.svg",interest:"Visual arts · graphic design · virtual fashion",fact:"Has a dog named Hima.",img:"aeri.png",intro:"aeri_intro.svg",swatch:"#ECEBB8"},
    {n:"Lin",native:"『시림 / 施霖』",role:"Main Vocalist",dob:"05 May 2004",mbti:"INFJ",nationality:"Chinese",colour:"Lavender",emojiSvg:"Lin.svg",interest:"Photography · guitar",fact:"Loves lavender scent, ice cream and rainy days.",img:"lin.png",intro:"lin_intro.svg",swatch:"#C4ADEB"},
    {n:"Shira",native:"『시라 / 白姫』",role:"Main Rapper",dob:"10 Aug 2004",mbti:"ESFP",nationality:"Japanese",colour:"Cherry Pink",emojiSvg:"Shira.svg",interest:"Video games · films",fact:"Enjoys watching cooking videos.",img:"shira.png",intro:"shira_intro.svg",swatch:"#FFCAE9"},
    {n:"JinSoo",native:"『진수』",role:"Main Dancer",dob:"22 Oct 2004",mbti:"ENTP",nationality:"Korean",colour:"Sky Blue",emojiSvg:"JinSoo.svg",interest:"Swimming · gymnastics",fact:"Confident, passionate and competitive.",img:"jinsoo.png",intro:"jinsoo_intro.svg",swatch:"#C2FCFF"},
    {n:"Navi",native:"『나비 / 娜比 / ナビ』",role:"Center · Visual",dob:"Debut date",mbti:"INTJ",nationality:"Virtual",colour:"Silver",emojiSvg:"Navi.svg",interest:"Composing · writing beats",fact:"Speaks three languages and has high affinity.",img:"navi.png",intro:"navi_intro.svg",swatch:"#C6C5C6"}
  ];

  document.body.classList.add("compact-brand","project-ethereal","ethereal-v2","ethereal-v3","ethereal-v4","ethereal-v5","ethereal-v6","ethereal-v7");
  document.documentElement.style.setProperty("--project-accent","#6044FF");
  document.title="EtheReal / Realm — Iris Wang";
  document.body.insertAdjacentHTML("afterbegin",header()+`<div class="reading-progress er2-progress" id="progress"></div>`);

  document.querySelector("#project-root").innerHTML=`
  <article class="er2">
    <nav class="er2-rail" aria-label="EtheReal sections">
      ${["World","Identity","Members","Album","Campaign","Realm","System","Flows","Prototype"].map((x,i)=>`<a href="#er2-${i+1}" aria-label="${x}"><i></i><span>${String(i+1).padStart(2,"0")}</span></a>`).join("")}
    </nav>

    <section class="er2-hero" id="er2-1">
      <video
        class="er2-hero-art er2-hero-video"
        src="/public/projects/ethereal-realm/hero.mp4"
        autoplay
        muted
        loop
        playsinline
        preload="auto"
        aria-hidden="true"
      ></video>
      <div class="er2-hero-overlay"></div>
      <div class="shell er2-hero-inner">
        <div class="er2-kicker">Brand identity · AI-assisted art direction · UI/UX · 2024</div>
        <h1 class="er2-pixel">ETHEREAL</h1>
        <div class="er2-hero-lower">
          <p>A virtual K-pop girl group living entirely in a pixelated world — and Realm, the digital home built to bring that world closer to its fandom.</p>
        </div>
      </div>
    </section>

    <section class="er2-world" id="er2-2">
      <div class="shell er2-world-grid">
        <div class="er2-heading-block">
          <span class="er2-label">02 — Brand world</span>
          ${img("svg/hero.svg","EtheReal hero identity mark","er5-world-hero")}
        </div>
        <div class="er2-world-copy">
          <p>EtheReal is a K-pop virtual girl group produced by RR Official. Five members appear only in the digital world, each with distinct personalities, specialties and cultural backgrounds.</p>
          <p>The logo uses pixelation and enclosing brackets to suggest another world outside reality. A pixelated star becomes the main favicon — a reference to the glow of idols and the brief illumination of a screen.</p>
          <aside><b>AI-assisted image making</b><span>Character and atmospheric static imagery were generated with AI as part of the visual world-building process. The brand identity, graphic system, Realm UI/UX, compositions and promotional material were designed and developed by Iris Wang.</span></aside>
        </div>
      </div>

      <div class="er2-identity shell">
        <div class="er2-type-card">
          <span>Pixeloid Sans Bold</span>
          <strong class="er2-pixel">ETHEREAL</strong>
          <em>Brand / logo display</em>
        </div>
        <div class="er2-type-card">
          <span>TT Octosquares Trl Cnd XBd</span>
          <strong class="er2-octo">ELECTRONIC BUTTERFLY</strong>
          <em>Album display</em>
        </div>
      </div>

      <div class="shell er5-colour-svg-display">
        ${svgAsset(["colour_01.svg","Colour_01.svg","colour 01.svg"],"EtheReal brand colour system 01","er5-colour-svg")}
        ${svgAsset(["colour_02.svg","Colour_02.svg","colour 02.svg"],"EtheReal brand colour system 02","er5-colour-svg")}
      </div>
    </section>

    <section class="er2-members" id="er2-3">
      <div class="shell">
        <div class="er2-section-head">
          <span class="er2-label">03 — Members</span>
          <h2>Five signals. One realm.</h2>
          <p>EtheReal is composed of five members from multicultural backgrounds, one of whom is fully virtual. Hover or focus a member to reveal the profile system.</p>
        </div>
        <div class="er2-member-grid">
          ${members.map((m,i)=>`<article class="er2-member" tabindex="0" style="--member:${m.swatch}">
            <div class="er2-member-image">${img(`character/${m.img}`,`${m.n} character`)}</div>
            <div class="er2-member-basic"><div><b>${m.n} <small>${m.native}</small></b><span>${m.role}</span><i>${m.colour}</i></div>${img(`svg/${m.emojiSvg}`,`${m.n} pixel symbol`,"er3-member-emoji")}</div>
            <div class="er2-member-detail"><span><b>Birthday</b>${m.dob}</span><span><b>MBTI</b>${m.mbti}</span><span><b>Nationality</b>${m.nationality}</span><span><b>Interest</b>${m.interest}</span><span class="wide"><b>Fun fact</b>${m.fact}</span></div>
          </article>`).join("")}
        </div>
        <div class="er2-member-colours">${members.map(m=>`<div style="--member:${m.swatch}"><span>${m.n}</span><i></i><b>${m.colour}</b></div>`).join("")}</div>
      </div>
    </section>

    <section class="er2-album" id="er2-4">
      <div class="shell er2-album-intro er3-album-intro">
        <span class="er2-label">04 — 1st Mini Album</span>
        ${img("svg/electronic butterfly.svg","Electronic Butterfly","er2-album-logo")}
        <p>The central concept of Electronic Butterfly stems from a Chinese term “电子蝴蝶“. It reveals the instantaneous nature of all idols’ appearance, that once the screen is turned off, they are untouchable most of the time. This leads to the main idea of the album that compares EtheReal to electronic butterflies, whose fluttered wings is heart-stirring for all fans, yet can never be found once all phones are shut down, as if the dream ends.</p>
      </div>

      <div class="er2-static-flow" aria-label="AI-assisted visual-world imagery">
        <div class="er2-static-track">
          ${[1,2,3,4,5,6,1,2,3,4,5,6].map((n,i)=>img(`ai statics/static_${n}.${n===1?"png":"jpg"}`,`Electronic Butterfly visual ${n}`,i>=6?"dup":"")).join("")}
        </div>
      </div>

      <div class="shell er2-album-outcomes">
        <div class="er2-subhead"><span>Album applications</span><p>Dark-version packaging is shown as the resolved album family.</p></div>
        <div class="er2-album-pair">
          ${img("promotion/Album Mockup Dark Op1.png","Electronic Butterfly dark album mockup option 1")}
          ${img("promotion/Album Mockup Dark Op2.png","Electronic Butterfly dark album mockup option 2")}
        </div>
      </div>
    </section>

    <section class="er2-campaign" id="er2-5">
      <div class="shell">
        <div class="er2-section-head">
          <span class="er2-label">05 — Promotion system</span>
          <h2>Welcome to EtheReal's Realm!</h2>
          <p>The campaign translates the pixel-and-butterfly system across track-list graphics, social media, YouTube, teasers and launch communication.</p>
        </div>
        <div class="er2-youtube">
          <div><span class="er2-label">YouTube channel</span><h3>EtheReal on YouTube</h3></div>
          <a href="https://www.youtube.com/@EtheReal-itsreal" target="_blank" rel="noreferrer">Visit @EtheReal-itsreal ↗</a>
        </div>
      </div>

      <div class="er2-motion-pair shell">
        <figure><video autoplay muted loop playsinline preload="metadata"><source src="${A}/web-video/Logo_1.mp4" type="video/mp4"></video><figcaption>Logo motion</figcaption></figure>
        <figure><video autoplay muted loop playsinline preload="metadata"><source src="${A}/web-video/Date_1.mp4" type="video/mp4"></video><figcaption>Date / launch motion</figcaption></figure>
      </div>
    </section>

    <section class="er2-realm" id="er2-6">
      <div class="shell er2-realm-header">
        <div class="er2-realm-brand">
          ${img("app/App Icon.png","Realm app icon")}
          <div><span class="er2-label">06 — Realm App</span><strong class="er2-pixel">REALM</strong></div>
        </div>
        <div><h2>The ultimate home for the fans.</h2><p>Realm gathers social posts, merchandise, album collection and artist-to-fan communication into one mobile experience. Unlike a single-purpose fan network, the concept connects fan community, member interaction, commerce and collection inside one branded system.</p></div>
      </div>

      
    </section>

    <section class="er2-system er3-system" id="er2-7">
      <div class="er3-dark-process">
        <div class="shell">
          <div class="er2-app-colour er5-app-colour er6-app-colour">
            <span class="er2-label">App colour</span>

            <div class="er6-app-colour-svg">
              ${svgAsset(
                [
                  "app colour.svg",
                  "App Colour.svg",
                  "app_colour.svg",
                  "App_Colour.svg"
                ],
                "Realm app colour system",
                "er6-app-colour-img"
              )}
            </div>
          </div>

          <div class="er2-ia">
            <span class="er2-label">Information architecture</span>
            <div class="root">HOME</div><div class="stem"></div>
            <div class="nodes"><div><b>REAL'S REALM</b><small>Social community</small></div><div><b>SHOP</b><small>Merchandise</small></div><div><b>ALBUM</b><small>Music + cards</small></div><div><b>CHAT</b><small>Message + live</small></div><div><b>PROFILE</b><small>ReaLv + settings</small></div></div>
          </div>

          <div class="shell er5-navigation er6-navigation er7-navigation">

      <div class="er5-nav-copy">
        <span class="er2-label">Navigation</span>
        

        <p>
          Five persistent destinations create a consistent navigation
          system across Realm, connecting community, shopping, albums,
          EtheReal and the user's profile.
        </p>
      </div>

      <div class="er8-nav-showcase">

        <div class="er8-nav-item">
          <div class="er8-nav-icon-wrap">
            ${img("svg/rrealm_white.svg","Realm navigation default","er8-nav-icon er8-nav-default")}
            ${img("svg/rrealm.svg","Realm navigation hover","er8-nav-icon er8-nav-hover")}
          </div>
          <span>RRealm</span>
        </div>

        <div class="er8-nav-item">
          <div class="er8-nav-icon-wrap">
            ${img("svg/shop_white.svg","Shop navigation default","er8-nav-icon er8-nav-default")}
            ${img("svg/shop.svg","Shop navigation hover","er8-nav-icon er8-nav-hover")}
          </div>
          <span>Shop</span>
        </div>

        <div class="er8-nav-item">
          <div class="er8-nav-icon-wrap">
            ${img("svg/album_white.svg","Album navigation default","er8-nav-icon er8-nav-default")}
            ${img("svg/album.svg","Album navigation hover","er8-nav-icon er8-nav-hover")}
          </div>
          <span>Album</span>
        </div>

        <div class="er8-nav-item">
          <div class="er8-nav-icon-wrap">
            ${img("svg/erealM_white.svg","EtheReal navigation default","er8-nav-icon er8-nav-default")}
            ${img("svg/erealM.svg","EtheReal navigation hover","er8-nav-icon er8-nav-hover")}
          </div>
          <span>ERealM</span>
        </div>

        <div class="er8-nav-item">
          <div class="er8-nav-icon-wrap">
            ${img("svg/profile_white.svg","Profile navigation default","er8-nav-icon er8-nav-default")}
            ${img("svg/profile.svg","Profile navigation hover","er8-nav-icon er8-nav-hover")}
          </div>
          <span>Profile</span>
        </div>

      </div>

    </div>

    </div>

    <div class="shell er3-homepage er5-homepage er6-homepage">
            <div class="er5-home-title">
              <span class="er2-label">Home page</span>
              
            </div>

            <div class="er6-home-diagram">

              <div class="er6-info-box er6-wireframe-label">
                Wireframe
              </div>

              <div class="er6-home-phone">
                ${appFolderImg(
                  "homepage",
                  "APP_ETH_Home_01.png",
                  "Realm home wireframe",
                  "er6-home-img"
                )}
              </div>

              <div class="er6-home-arrow">→</div>

              <div class="er6-home-phone">
                ${appFolderImg(
                  "homepage",
                  "APP_ETH_Home.png",
                  "Realm home interface",
                  "er6-home-img"
                )}
              </div>

              <div class="er6-home-actions">
                <div class="er6-info-box">
                  <b>Swipe</b>
                  <small>To next panel</small>
                </div>

                <div class="er6-info-box">
                  <b>Click</b>
                  <small>To check in</small>
                </div>
              </div>

              <div class="er6-home-phone">
                ${appFolderImg(
                  "homepage",
                  "APP_ETH_Home-1.png",
                  "Realm checked state",
                  "er6-home-img"
                )}
              </div>

              <div class="er6-home-features">
                <div class="er6-info-box">
                  <b>Chat box</b>
                  <small>A shortcut to Message page</small>
                </div>

                <div class="er6-info-box">
                  <b>Information Panel</b>
                  <small>Latest news updated for users</small>
                </div>

                <div class="er6-info-box">
                  <b>D-day</b>
                  <small>Count of checked days</small>
                </div>

                <div class="er6-info-box">
                  <b>Schedule</b>
                  <small>EtheReal's daily activities</small>
                </div>
              </div>

            </div>
          </div>
        </div>
      </div>
    </section>

    <section class="er2-flows" id="er2-8">
      <div class="shell">
        <div class="er2-section-head">
          <span class="er2-label">08 — Interface flows</span>
          <h2>One app. Multiple relationships.</h2>
          <p>Final frames are grouped by task so the progression from feed interaction to commerce, collection and profile management remains visible.</p>
        </div>

        <article class="er2-flow">
          <div class="copy"><span>01 / Social community</span><h3>Realm + For You</h3><p>Fans posts, member posts and personalised content sit inside the same community system, supported by comments and translation.</p><b>Feed → post → comments</b></div>
          <div class="phones">${frame("APP_ETH_RealsRealm_Realm.png")}${frame("APP_ETH_RR_ForYou.png")}${frame("APP_ETH_Profile_Comments.png")}</div>
        </article>

        <article class="er2-flow">
          <div class="copy"><span>02 / Shopping flow</span><h3>Discover → product → cart → order</h3><p>Merchandise, albums and photo cards use a connected purchase path with visible order-state feedback.</p><b>Browse → detail → checkout → order state</b></div>
          <div class="phones four">${frame("APP_ETH_Shop_Photocards.png")}${frame("APP_ETH_Shop_Product_PC.png")}${frame("APP_ETH_Shop_ShoppingCart.png")}${frame("APP_ETH_Shop_MyOrders.png")}</div>
        </article>

        <article class="er2-flow">
          <div class="copy"><span>03 / Album collection</span><h3>Music becomes collectible.</h3><p>Playback, music video and digital photo cards extend the mini album beyond conventional streaming.</p><b>Album → cards → flip state → player</b></div>
          <div class="phones four">${frame("APP_ETH_Album_Home.png")}${frame("APP_ETH_Album_Cards_01.png")}${frame("APP_ETH_Album_Cards_03.png")}${frame("APP_ETH_Album_Player.png")}</div>
        </article>

        <article class="er2-flow">
          <div class="copy"><span>04 / Profile + ReaLv</span><h3>Participation has a visible rhythm.</h3><p>ReaLv represents purchase and app activity, while posts, comments and settings give each fan a persistent identity.</p><b>Profile → comments → settings</b></div>
          <div class="phones">${frame("APP_ETH_Profile_Posts.png")}${frame("APP_ETH_Profile_Comments.png")}${frame("APP_ETH_Profile_Settings.png")}</div>
        </article>

        <article class="er2-flow er6-realm-flow">
          <div class="copy">
            <span>05 / Realm communication</span>

            <h3>
              Messages, subscription and live.
            </h3>

            <p>
              Realm extends the fan relationship through member profiles,
              subscription states, direct chat and live communication.
            </p>
          </div>

          <div class="phones er6-realm-flow-phones">

            ${appFolderImg(
              "realm flow",
              "APP_ETH_ER_01.png",
              "Realm communication frame 1",
              "er4-flow-frame"
            )}

            ${appFolderImg(
              "realm flow",
              "APP_ETH_ER_02.png",
              "Realm communication frame 2",
              "er4-flow-frame"
            )}

            ${appFolderImg(
              "realm flow",
              "APP_ETH_ER_Chat_02.png",
              "Realm chat interface",
              "er4-flow-frame"
            )}

            ${appFolderImg(
              "realm flow",
              "APP_ETH_ER_Chat_Navi.png",
              "Navi chat interface",
              "er4-flow-frame"
            )}

            ${appFolderImg(
              "realm flow",
              "APP_ETH_ER_Chat_Live.png",
              "Realm live interface",
              "er4-flow-frame"
            )}

          </div>
        </article>
      </div>
    </section>

    <section class="er2-prototype er3-prototype" id="er2-9">
      <div class="shell er2-proto-copy">
        <span class="er2-label">09 — Final prototype</span>
        <h2>A complete route through Realm.</h2>
        <p>The final prototype links onboarding and home to community, shop, album, communication and profile flows as one connected fan ecosystem.</p>
        <a href="https://www.figma.com/proto/d1Gr3gDRCKigTX1UVpodvi/ETHEREAL-Branding-2024--Community-?node-id=1593-54443&t=fZNlTHgpmb8kezNI-1" target="_blank" rel="noreferrer">Open interactive prototype ↗</a>
      </div>
            </div>
    

      <div class="shell er7-prototype-animation">

        <div class="er7-prototype-animation-heading">
          
          
        </div>

        <div class="er7-animation-track">

          ${appFolderImg(
            "animation flow_01",
            "APP_ETH_Intro.png",
            "Realm prototype frame",
            "er7-animation-frame"
          )}

          ${appFolderImg(
            "animation flow_01",
            "APP_ETH_Login.png",
            "Realm prototype frame",
            "er7-animation-frame"
          )}

          ${appFolderImg(
            "animation flow_01",
            "APP_ETH_Home.png",
            "Realm prototype frame",
            "er7-animation-frame"
          )}

          ${appFolderImg(
            "animation flow_01",
            "APP_ETH_Profile_Posts.png",
            "Realm prototype frame",
            "er7-animation-frame"
          )}

          ${appFolderImg(
            "animation flow_01",
            "APP_ETH_ER_Chat_Navi.png",
            "Realm prototype frame",
            "er7-animation-frame"
          )}

          ${appFolderImg(
            "animation flow_01",
            "APP_ETH_EtheRealRealm_Sub.png",
            "Realm subscription prototype frame",
            "er7-animation-frame"
          )}

          ${appFolderImg(
            "animation flow_01",
            "APP_ETH_Album_Cards_02.png",
            "Realm album prototype frame",
            "er7-animation-frame"
          )}

          ${appFolderImg(
            "animation flow_01",
            "APP_ETH_Album_Player.png",
            "Realm album player prototype frame",
            "er7-animation-frame"
          )}

          ${appFolderImg(
            "animation flow_01",
            "APP_ETH_Shop_Album.png",
            "Realm shop prototype frame",
            "er7-animation-frame"
          )}

        </div>

      </div>

    </section>

    <section class="er2-finale">
      <div class="er2-finale-bg">${img("pattern/Screenshot 2024-07-16 at 5.10.44 pm 3.jpeg","EtheReal pattern artwork")}</div>
      <div class="shell er-final-background"><span>WHEN THE SCREEN GOES DARK</span><strong>THE DREAM<br>DISAPPEARS.</strong></div>
    </section>

    <a class="next-project er2-next" href="/work/${next.slug}/"><span class="meta-mono">NEXT PROJECT</span><br>${esc(next.title)} →</a>
  </article>`;

  document.body.insertAdjacentHTML("beforeend",footer());

  const progress=document.querySelector("#progress");
  addEventListener("scroll",()=>{
    const h=document.documentElement.scrollHeight-innerHeight;
    progress.style.width=`${h?scrollY/h*100:0}%`;
  },{passive:true});

  const rail=[...document.querySelectorAll(".er2-rail a")];
  const sections=rail.map(a=>document.querySelector(a.getAttribute("href")));
  const obs=new IntersectionObserver(es=>es.forEach(e=>{
    if(e.isIntersecting){
      const i=sections.indexOf(e.target);
      rail.forEach((a,j)=>a.classList.toggle("active",i===j));
    }
  }),{rootMargin:"-42% 0px -48% 0px"});
  sections.forEach(s=>s&&obs.observe(s));

  const staticTrack=document.querySelector(".er2-static-track");
  if(staticTrack && !matchMedia("(prefers-reduced-motion: reduce)").matches){
    let x=0,paused=false;
    const tick=()=>{
      if(!paused){
        x-=.35;
        const half=staticTrack.scrollWidth/2;
        if(-x>=half)x=0;
        staticTrack.style.transform=`translate3d(${x}px,0,0)`;
      }
      requestAnimationFrame(tick);
    };
    staticTrack.addEventListener("mouseenter",()=>paused=true);
    staticTrack.addEventListener("mouseleave",()=>paused=false);
    requestAnimationFrame(tick);
  }


  document.querySelectorAll("img[data-fallbacks]").forEach(el=>{
    const fallbacks=(el.dataset.fallbacks||"").split("|").filter(Boolean);
    el.addEventListener("error",()=>{
      const next=fallbacks.shift();
      if(next){ el.dataset.fallbacks=fallbacks.join("|"); el.src=next; }
    });
  });

  const startLoop=(track,speed=.38)=>{
    if(!track || matchMedia("(prefers-reduced-motion: reduce)").matches) return;
    let x=0,paused=false;
    const tick=()=>{
      if(!paused){
        x-=speed;
        const half=track.scrollWidth/2;
        if(half && -x>=half)x=0;
        track.style.transform=`translate3d(${x}px,0,0)`;
      }
      requestAnimationFrame(tick);
    };
    track.addEventListener("mouseenter",()=>paused=true);
    track.addEventListener("mouseleave",()=>paused=false);
    requestAnimationFrame(tick);
  };
  startLoop(document.querySelector(".er3-realm-track"),.42);
  

  document.querySelectorAll(".er2-motion-pair video").forEach(v=>{
    v.muted=true;
    const tryPlay=()=>v.play().catch(()=>{});
    v.addEventListener("canplay",tryPlay,{once:true});
    tryPlay();
  });
}



function renderGreenGridV1(p,projects){
  const A="/public/projects/green-grid";
  const enc=s=>s.split("/").map(encodeURIComponent).join("/");
  const img=(path,alt="",cls="")=>`<img class="${cls}" src="${A}/${enc(path)}" alt="${esc(alt)}" loading="lazy">`;
  const phone=(name,alt)=>img(`app frame/${name}`,alt,"gg-phone");
  const next=projects[(projects.indexOf(p)+1)%projects.length];

  document.body.classList.add("compact-brand","project-green-grid","gg-v1");
  document.documentElement.style.setProperty("--project-accent","#DAE436");
  document.documentElement.style.setProperty("--project-secondary","#6C4BFF");
  document.title="Green Grid — Iris Wang";

  document.body.insertAdjacentHTML(
    "afterbegin",
    header()+`<div class="reading-progress" id="progress"></div>`
  );

  document.querySelector("#project-root").innerHTML=`
  <article class="gg-case">

    <nav class="gg-rail" aria-label="Green Grid chapters">
      ${[
        "Overview",
        "Research",
        "Synthesis",
        "Product logic",
        "Paper prototype",
        "Evaluation",
        "Iteration",
        "Final flows",
        "Reflection"
      ].map((x,i)=>`
        <a href="#gg-${i+1}" aria-label="${x}">
          <i></i><span>${String(i+1).padStart(2,"0")}</span>
        </a>
      `).join("")}
    </nav>

    <!-- ==================================================
         01 HERO / OVERVIEW
         ================================================== -->

    <section class="gg-hero" id="gg-1">
      <div class="shell gg-hero-grid">

        <div class="gg-hero-copy">
          <div class="gg-hero-kicker">
      <span>UI/UX · RESEARCH · PRODUCT DESIGN</span>
      <span>2025</span>
    </div>

          <h1>GREEN<br>GRID</h1>

          <p class="gg-lead">
            A research-led mobile product for community-garden members,
            designed to support plot management, plant knowledge,
            coordination and social connection.
          </p>

          
        </div>

        <div class="gg-hero-mark">
          ${img("App Icon.svg","Green Grid app icon","gg-app-icon")}
          <div class="gg-hero-word">
            <span>GREEN</span>
            <span>GRID</span>
          </div>
        </div>

      </div>

<div class="gg-meta">
            <div>
              <b>Context</b>
              <span>Academic · Team of 4</span>
            </div>

            <div>
              <b>Role</b>
              <span>Design + prototyping, research synthesis, personas and user-flow contribution</span>
            </div>

            <div>
              <b>Tools</b>
              <span>Figma · FigJam · Photoshop</span>
            </div>

            <div>
              <b>Year</b>
              <span>2025</span>
            </div>
          </div>





      
    </section>


    <!-- ==================================================
         02 RESEARCH QUESTION + ROLE
         ================================================== -->

    <section class="gg-research" id="gg-2">
      <div class="shell">

        <span class="gg-label">02 — RESEARCH QUESTION</span>

        <blockquote class="gg-question">
          How might digital tools support organisation,
          information sharing and social cohesion within
          community gardens?
        </blockquote>

        <div class="gg-scope-grid">

          <div class="gg-scope-intro">
            <h2>Start with people,<br>not screens.</h2>

            <p>
              The team investigated how gardeners participate, coordinate
              voluntary work and look for plant information before defining
              the final feature set.
            </p>
          </div>

          <div class="gg-role-card">
            <span>IRIS'S CONTRIBUTION</span>

            <ul>
              <li>Helped construct the semi-structured interview flow.</li>
              <li>Asked follow-up questions during an interview.</li>
              <li>Colour-coded and reviewed interview material.</li>
              <li>Identified recurring themes across transcripts.</li>
              <li>Helped consolidate findings into two personas.</li>
              <li>Designed the persona template in Figma.</li>
              <li>Mapped app functions, pages and user pathways.</li>
              <li>Translated requirements into interface concepts.</li>
              <li>Contributed to prototype design and linking.</li>
            </ul>
          </div>

        </div>

      </div>
    </section>


    <!-- ==================================================
         03 SYNTHESIS
         ================================================== -->

    <section class="gg-synthesis" id="gg-3">
      <div class="shell">

        <div class="gg-section-head">
          <span class="gg-label">03 — SYNTHESIS</span>
          <h2>Patterns emerged across the interviews.</h2>
        </div>

        <div class="gg-synthesis-board">

          <section class="gg-synth-column">
            <h3>Motivations</h3>

            <div class="gg-synth-notes">
              <article class="gg-note note-yellow">
                <p>Reasons for growing plants</p>
                <small>Interview synthesis</small>
              </article>

              <article class="gg-note note-mint">
                <p>Views and experiences of community gardening and co-planting</p>
                <small>Interview synthesis</small>
              </article>

              <article class="gg-note note-white">
                <p>Helping others or receiving help with plant care</p>
                <small>Interview synthesis</small>
              </article>

              <article class="gg-note note-grey">
                <p>Struggles, deterrents and reflections on joining community gardens</p>
                <small>Interview synthesis</small>
              </article>
            </div>
          </section>

          <section class="gg-synth-column">
            <h3>Coordination</h3>

            <div class="gg-synth-notes">
              <article class="gg-note note-purple">
                <p>Techniques and approaches used to organise group work</p>
                <small>Interview synthesis</small>
              </article>

              <article class="gg-note note-green">
                <p>Features that remind members about tasks and responsibilities</p>
                <small>Interview synthesis</small>
              </article>

              <article class="gg-note note-blue">
                <p>Applications already used to organise group work</p>
                <small>Interview synthesis</small>
              </article>
            </div>
          </section>

          <section class="gg-synth-column">
            <h3>Information Sharing</h3>

            <div class="gg-synth-notes">
              <article class="gg-note note-pink">
                <p>Information people need or seek regarding plants</p>
                <small>Interview synthesis</small>
              </article>

              <article class="gg-note note-orange">
                <p>Perceived reasons for plant death or harm</p>
                <small>Interview synthesis</small>
              </article>

              <article class="gg-note note-coral">
                <p>How participants currently seek information about plants</p>
                <small>Interview synthesis</small>
              </article>
            </div>
          </section>

        </div>

        <div class="gg-synthesis-outcome">
          <span>RESEARCH SYNTHESIS</span>
          <p>
            These themes reframed the app around three connected needs:
            managing shared responsibilities, finding relevant plant knowledge,
            and maintaining communication within the garden community.
          </p>
        </div>

      </div>
    </section>


    <!-- ==================================================
         04 PRODUCT LOGIC
         ================================================== -->

    <section class="gg-product-logic" id="gg-4">
      <div class="shell">

        <div class="gg-section-head">
          <span class="gg-label">04 — PRODUCT LOGIC</span>
          <h2>A garden is both a place<br>and a social system.</h2>
        </div>

        <div class="gg-feature-map">

          <article>
            <b>MAP</b>
            <span>Find plots</span>
            <span>See ownership</span>
            <span>Apply for space</span>
          </article>

          <article>
            <b>PLOTS</b>
            <span>Add plants</span>
            <span>Track current plants</span>
            <span>Manage available space</span>
          </article>

          <article>
            <b>PLANT INFO</b>
            <span>Soil pH</span>
            <span>Seasonal guidance</span>
            <span>Plant records</span>
          </article>

          <article>
            <b>COMMUNITY</b>
            <span>Share updates</span>
            <span>Like + comment</span>
            <span>Garden announcements</span>
          </article>

          <article>
            <b>CHAT</b>
            <span>Private messages</span>
            <span>Share a plot</span>
            <span>Share a plant</span>
          </article>

          <article>
            <b>PROFILE</b>
            <span>Current plants</span>
            <span>Past plants</span>
            <span>Settings</span>
          </article>

        </div>

        <div class="gg-hive-note">
          <div class="gg-hive-shape">
            <i></i><i></i><i></i><i></i><i></i><i></i><i></i>
          </div>

          <p>
            The identity compares the community to a beehive:
            individual members maintain their own responsibilities
            while contributing to the health of a larger shared system.
          </p>
        </div>

      </div>
    </section>


    <!-- ==================================================
         05 PAPER PROTOTYPE
         ================================================== -->

    
    
    <section class="gg-personas" id="gg-personas">
      <div class="shell">

        <div class="gg-section-head gg-persona-intro">
          <span class="gg-label">04 — PERSONAS</span>

          <h2>Different gardeners,<br>shared infrastructure.</h2>

          <p>
            Interview findings were consolidated into two contrasting user
            profiles. Rather than treating the personas as finished artefacts,
            they are presented here as design inputs that helped define what
            Green Grid needed to support.
          </p>
        </div>


        <div class="gg-persona-system">

          <!-- TOBY -->
          <article class="gg-persona-row">

            <div class="gg-persona-identity">

              <div class="gg-persona-name">
                <span>01</span>
                <h3>Toby</h3>
              </div>

              <dl>
                <div>
                  <dt>Age</dt>
                  <dd>19</dd>
                </div>

                <div>
                  <dt>Location</dt>
                  <dd>Melbourne CBD</dd>
                </div>

                <div>
                  <dt>Occupation</dt>
                  <dd>University student</dd>
                </div>
              </dl>
            </div>


            <div class="gg-persona-story">
              <span class="gg-persona-eyebrow">PROFILE</span>

              <p class="gg-persona-summary">
                A young urban resident interested in locally growing fruit,
                but constrained by apartment living, limited cultivation
                space and the demands of university life.
              </p>

              <blockquote>
                “I’d love to have a garden space of my own, imagine there
                I can actually grow and eat the fruit I’ve nurtured myself.”
              </blockquote>

              <div class="gg-persona-signals">
                <div>
                  <span>Garden knowledge</span>
                  <b><i style="--level:41%"></i></b>
                </div>

                <div>
                  <span>Food sustainability</span>
                  <b><i style="--level:82%"></i></b>
                </div>

                <div>
                  <span>Social belonging</span>
                  <b><i style="--level:66%"></i></b>
                </div>
              </div>
            </div>


            <div class="gg-persona-needs">

              <section>
                <span>FRICTION</span>

                <p>Limited access to suitable urban growing space.</p>
                <p>Plant information can be difficult to retrieve quickly.</p>
                <p>Care routines compete with study and examination periods.</p>
              </section>

              <section>
                <span>NEEDS</span>

                <p>Scheduling and plant-care reminders.</p>
                <p>Guidance appropriate to urban growing conditions.</p>
                <p>A simple path from information to practical action.</p>
              </section>

            </div>

            <section class="gg-persona-design-response gg-persona-response-wide">
              <span>DESIGN RESPONSE</span>

              <strong>
                Make garden space, plant knowledge and reminders accessible
                through one connected system.
              </strong>
            </section>

          </article>


          <!-- VERONICA -->
          <article class="gg-persona-row">

            <div class="gg-persona-identity">

              <div class="gg-persona-name">
                <span>02</span>
                <h3>Veronica</h3>
              </div>

              <dl>
                <div>
                  <dt>Age</dt>
                  <dd>56</dd>
                </div>

                <div>
                  <dt>Location</dt>
                  <dd>East Malvern, Victoria</dd>
                </div>

                <div>
                  <dt>Occupation</dt>
                  <dd>English teacher</dd>
                </div>
              </dl>
            </div>


            <div class="gg-persona-story">
              <span class="gg-persona-eyebrow">PROFILE</span>

              <p class="gg-persona-summary">
                An experienced home gardener who values the wellbeing,
                knowledge-sharing and shared responsibility that can emerge
                through communal gardening.
              </p>

              <blockquote>
                “Apart from being able to harvest and eat some of them,
                seeing the growth process itself is also meaningful and
                enjoyable to me.”
              </blockquote>

              <div class="gg-persona-signals">
                <div>
                  <span>Garden knowledge</span>
                  <b><i style="--level:79%"></i></b>
                </div>

                <div>
                  <span>Food sustainability</span>
                  <b><i style="--level:76%"></i></b>
                </div>

                <div>
                  <span>Social belonging</span>
                  <b><i style="--level:35%"></i></b>
                </div>
              </div>
            </div>


            <div class="gg-persona-needs">

              <section>
                <span>FRICTION</span>

                <p>Professional gardening knowledge is not always accessible.</p>
                <p>Plant maintenance requires ongoing monitoring.</p>
                <p>Workdays limit the time available for garden care.</p>
              </section>

              <section>
                <span>NEEDS</span>

                <p>Reliable gardening advice and plant information.</p>
                <p>A community space for exchanging experience.</p>
                <p>Notifications relevant to plants and climate.</p>
              </section>

            </div>

            <section class="gg-persona-design-response gg-persona-response-wide">
              <span>DESIGN RESPONSE</span>

              <strong>
                Support experienced gardeners with useful information,
                communication and lightweight monitoring tools.
              </strong>
            </section>

          </article>

        </div>

      </div>
    </section>

<section class="gg-paper" id="gg-5">

      <div class="gg-paper-reference shell">

        <div class="gg-paper-section-head">
          <span class="gg-label">05 — PAPER PROTOTYPE</span>
        </div>

        <div class="gg-paper-reference-row">

          <div class="gg-sketch-phone">
            <div class="gg-sketch-tabs">
              <span>Community</span><span>Chat</span>
            </div>
            <div class="gg-sketch-user"></div>
            <i class="gg-sketch-line long"></i>
            <i class="gg-sketch-line mid"></i>

            <div class="gg-sketch-photo-row">
              <b></b><b></b><b></b>
            </div>

            <div class="gg-sketch-actions">♡ No.　○ No.</div>

            <div class="gg-sketch-user small"></div>
            <i class="gg-sketch-line long"></i>
            <i class="gg-sketch-line mid"></i>

            <div class="gg-sketch-nav">⌂　◇　◯　♙</div>
          </div>


          <div class="gg-sketch-phone">
            <div class="gg-sketch-tabs">
              <span>Community</span><span class="under">Chat</span>
            </div>

            <div class="gg-chat-list">
              <div><i></i><span>Name<br><small>Text</small></span><b>Date</b></div>
              <div><i></i><span>Name<br><small>Text</small></span><b>Date</b></div>
              <div><i></i><span>Name<br><small>Text</small></span><b>Date</b></div>
              <div><i></i><span>Name<br><small>Text</small></span><b>Date</b></div>
              <div><i></i><span>Name<br><small>Text</small></span><b>Date</b></div>
            </div>

            <div class="gg-sketch-nav">⌂　◇　◯　♙</div>
          </div>


          <div class="gg-sketch-phone">
            <div class="gg-message-head">‹ Name　⋮</div>

            <div class="gg-message-flow">
              <p class="left"></p>
              <p class="right short"></p>
              <span>Time</span>
              <p class="left tiny"></p>
              <p class="left"></p>
              <span>Time</span>
              <p class="right long"></p>
              <p class="right mid"></p>
              <p class="right short"></p>
            </div>

            <div class="gg-message-tools">
              <i></i><i></i><i></i><i></i>
            </div>
          </div>


          <div class="gg-sketch-phone">
            <div class="gg-message-head">‹ Name　◉</div>

            <div class="gg-message-flow">
              <span>Time</span>
              <p class="left tiny"></p>
              <p class="left short"></p>
              <span>Time</span>
              <p class="right long"></p>
              <p class="right mid"></p>
              <p class="right short"></p>
            </div>

            <div class="gg-shared-plot">
              <b></b>
              <span>Plot Name<br><small>Description</small></span>
            </div>

            <div class="gg-message-tools compact">
              <i></i><i></i>
            </div>
          </div>


          <div class="gg-sketch-phone">
            <div class="gg-profile-banner"></div>

            <div class="gg-profile-avatar"></div>

            <div class="gg-month-strip">
              <span>Sep 2025</span>
              <div>○ ○ ○ ○ ○ ○ ○</div>
            </div>

            <small class="gg-history-label">Plant History</small>

            <div class="gg-honey-grid">
              <i></i><i></i><i></i><i></i><i></i><i></i><i></i>
            </div>

            <div class="gg-sketch-nav">⌂　◇　◯　♙</div>
          </div>


          <div class="gg-sketch-phone">
            <div class="gg-message-head">‹ Plot</div>

            <div class="gg-search-bar">⌕ Search plants...</div>

            <div class="gg-plot-list">
              <div><i></i><span>Plot Name<br><small>Description</small></span></div>
              <div><i></i><span>Plot Name<br><small>Description</small></span></div>
              <div><i></i><span>Plot Name<br><small>Description</small></span></div>
              <div><i></i><span>Plot Name<br><small>Description</small></span></div>
              <div><i></i><span>Plot Name<br><small>Description</small></span></div>
            </div>
          </div>

        </div>

      </div>

    </section>


    <!-- ==================================================
         06 USABILITY TESTING
         ================================================== -->

    <section class="gg-testing" id="gg-6">
      <div class="shell">

        <div class="gg-section-head">
          <span class="gg-label">06 — USABILITY EVALUATION</span>
          <h2>Eight participants.<br>Two kinds of evidence.</h2>
        </div>

        <div class="gg-test-grid">

          <article class="gg-test-type">
            <span>QUANTITATIVE</span>

            <p>
              Participants completed structured navigation and task prompts
              across home, map, chat and profile functions.
            </p>

            <div class="gg-task-list">
              <b>Example tasks</b>
              <span>Navigate to the garden map</span>
              <span>Apply for an unowned plot</span>
              <span>Add a carrot plant</span>
              <span>Check soil pH guidance</span>
              <span>Check the latest message</span>
              <span>Change profile settings</span>
            </div>
          </article>

          <article class="gg-test-type">
            <span>QUALITATIVE</span>

            <p>
              Open-ended prompts were used to understand first impressions,
              navigation logic and how participants interpreted key features.
            </p>

            <div class="gg-task-list">
              <b>Example prompts</b>
              <span>First impression of the homepage</span>
              <span>Review promotional events</span>
              <span>Inspect current plot plants</span>
              <span>Remove a harvested plant</span>
              <span>Like and comment on a post</span>
              <span>Share a plant through chat</span>
            </div>
          </article>

        </div>

        
        <div class="gg-participants">
          <span class="gg-mini-title">EVALUATION PARTICIPANTS</span>

          <div class="gg-participant-grid">
            ${[
              ["01","27","PhD student"],
              ["02","19","Undergraduate"],
              ["03","50","Human resources"],
              ["04","27","PhD student"],
              ["05","19","Undergraduate"],
              ["06","23","Postgraduate"],
              ["07","18","Undergraduate"],
              ["08","19","Undergraduate"]
            ].map(x=>`
              <div>
                <b>${x[0]}</b>
                <span>${x[1]} yrs</span>
                <small>${x[2]}</small>
              </div>
            `).join("")}
          </div>
        </div>

        <div class="gg-findings">

          <article class="positive">
            <span>WHAT WORKED</span>

            <ul>
              <li>Pages had clear individual purposes.</li>
              <li>Simple actions could be completed quickly.</li>
              <li>The overall structure felt logical once understood.</li>
              <li>Participants liked the organisation of garden plots.</li>
              <li>The overall garden-management concept was valued.</li>
            </ul>
          </article>

          <article class="negative">
            <span>FRICTION FOUND</span>

            <ul>
              <li>Homepage information density felt overwhelming.</li>
              <li>Some arrows were unclear or non-functional.</li>
              <li>The community like button was poorly positioned.</li>
              <li>Owned and unowned plots were difficult to distinguish.</li>
              <li>Plot-application feedback lacked clarity.</li>
              <li>Banner arrows disappeared against imagery.</li>
            </ul>
          </article>

        </div>

      </div>
    </section>


    <!-- ==================================================
         07 ITERATION
         ================================================== -->

    <section class="gg-iteration" id="gg-7">
      <div class="shell">

        <div class="gg-section-head">
          <span class="gg-label">07 — EVIDENCE-LED ITERATION</span>
          <h2>Findings became<br>interface changes.</h2>
        </div>

        <div class="gg-change-list">

          ${[
            ["01","Homepage density",
             "Removed the latest-message panel, Today’s Progress and What’s New; weather advice became a compact expandable strip."],

            ["02","Plot ownership",
             "Added the user’s profile image to owned plots and changed unowned plots to a lighter grey."],

            ["03","Application feedback",
             "Expanded the confirmation state to explain that further information would arrive by email within seven days."],

            ["04","Banner visibility",
             "Added a vignette behind navigation arrows so controls remain visible across promotional imagery."],

            ["05","Plant history",
             "Separated current and previous plants using darker grey treatment and a dashed divider."],

            ["06","Community actions",
             "Removed the duplicated like button beside the comment-entry field."],

            ["07","Interaction cues",
             "Used purple selectively for selected states and controls requiring stronger clickability."]
          ].map(x=>`
            <article>
              <span>${x[0]}</span>
              <h3>${x[1]}</h3>
              <p>${x[2]}</p>
            </article>
          `).join("")}

        </div>

      </div>
    </section>


    <!-- ==================================================
         08 FINAL FLOWS
         ================================================== -->

    <section class="gg-final" id="gg-8">
      <div class="shell">

        <div class="gg-section-head">
          <span class="gg-label">08 — FINAL PRODUCT</span>
          <h2>Research resolved<br>into connected flows.</h2>
        </div>

        <article class="gg-flow">
          <div class="gg-flow-copy">
            <span>01 / GARDEN MAP</span>
            <h3>Find, understand and apply.</h3>
            <p>
              The map distinguishes garden plots and supports the transition
              from viewing available space to submitting an application.
            </p>
          </div>

          <div class="gg-flow-phones">
            ${phone("APP_CG_Map.png","Garden map")}
            ${phone("APP_CG_Map_Apply.png","Plot application")}
            ${phone("APP_CG_Map_Application Sent.png","Plot application confirmation")}
          </div>
        </article>

        <article class="gg-flow">
          <div class="gg-flow-copy">
            <span>02 / PLANT MANAGEMENT</span>
            <h3>Knowledge in context.</h3>
            <p>
              Plant records combine plot management with soil-pH guidance,
              planting information and ongoing garden care.
            </p>
          </div>

          <div class="gg-flow-phones">
            ${phone("APP_CG_Map_AddPlant.png","Add plant")}
            ${phone("APP_CG_plant_info.png","Plant information")}
            ${phone("APP_CG_plant_PH.png","Plant soil pH information")}
          </div>
        </article>

        <article class="gg-flow">
          <div class="gg-flow-copy">
            <span>03 / COMMUNITY</span>
            <h3>Share knowledge publicly.</h3>
            <p>
              The community feed supports garden updates, posts,
              comments and peer-to-peer knowledge sharing.
            </p>
          </div>

          <div class="gg-flow-phones">
            ${phone("APP_CG_Community.png","Community feed")}
            ${phone("APP_CG_Community_Post.png","Community post")}
            ${phone("APP_CG_Community_Comment.png","Community comments")}
          </div>
        </article>

        <article class="gg-flow">
          <div class="gg-flow-copy">
            <span>04 / CHAT + PROFILE</span>
            <h3>Coordinate privately.</h3>
            <p>
              Direct messaging supports plot and plant references while
              profiles preserve each member’s personal garden history.
            </p>
          </div>

          <div class="gg-flow-phones">
            ${phone("APP_CG_Chat.png","Green Grid chat")}
            ${img("app frame/APP_CG_Chat page.png","Green Grid chat page","gg-phone")}
            ${phone("APP_CG_Profile_MyPlants.png","Profile plant gallery")}
          </div>
        </article>

      </div>
    </section>


    <!-- ==================================================
         09 REFLECTION
         ================================================== -->

    <section class="gg-reflection" id="gg-9">
      <div class="shell gg-reflection-final">

        <div class="gg-reflection-brand">
          <span class="gg-label">09 — REFLECTION</span>

          ${img("green grid.svg","Green Grid","gg-final-logo")}
        </div>

        <div class="gg-reflection-copy">

          <p class="gg-reflection-lead">
            Green Grid demonstrates a complete research-to-iteration loop:
            qualitative evidence informed the product structure, usability
            testing exposed friction, and the final interface changed in
            response to those findings.
          </p>

          <div class="gg-limitations">
            <span>Future considerations</span>
            <p>Configurable garden maps for different sites.</p>
            <p>Clearer non-colour ownership labels and accessibility support.</p>
            <p>Help content for users with lower digital confidence.</p>
            <p>Privacy, moderation and transparent plot-allocation systems.</p>
          </div>

          <a class="gg-proto-link"
             href="https://www.figma.com/proto/GbshUdcmS4aRtFtdbxM3d7/Community-Garden?node-id=199-864&starting-point-node-id=199%3A864"
             target="_blank"
             rel="noreferrer">
            Open Figma prototype ↗
          </a>

        </div>

      </div>
    </section>

    <a class="next-project gg-next" href="/work/${next.slug}/">
      <span class="meta-mono">NEXT PROJECT</span><br>
      ${esc(next.title)} →
    </a>

  </article>
  `;

  document.body.insertAdjacentHTML("beforeend",footer());

  const progress=document.querySelector("#progress");

  addEventListener("scroll",()=>{
    const h=document.documentElement.scrollHeight-innerHeight;
    progress.style.width=`${h?scrollY/h*100:0}%`;
  },{passive:true});

  const links=[...document.querySelectorAll(".gg-rail a")];
  const sections=links.map(a=>document.querySelector(a.getAttribute("href")));

  const io=new IntersectionObserver(entries=>{
    entries.forEach(entry=>{
      if(entry.isIntersecting){
        const i=sections.indexOf(entry.target);
        links.forEach((a,j)=>a.classList.toggle("active",i===j));
      }
    });
  },{rootMargin:"-42% 0px -48% 0px"});

  sections.forEach(s=>s&&io.observe(s));
}



function renderNExhibitionV1(p,projects){
  const A="/public/projects/n-exhibition";
  const enc=s=>s.split("/").map(encodeURIComponent).join("/");
  const img=(path,alt="",cls="")=>`<img class="${cls}" src="${A}/${enc(path)}" alt="${esc(alt)}" loading="lazy">`;

  const next=projects[(projects.indexOf(p)+1)%projects.length];

  document.body.classList.add("compact-brand","project-n-exhibition","nx-v1");
  document.documentElement.style.setProperty("--project-accent","#B1B1C0");
  document.title="N Exhibition — Iris Wang";

  document.body.insertAdjacentHTML(
    "afterbegin",
    header()+`<div class="reading-progress" id="progress"></div>`
  );

  document.querySelector("#project-root").innerHTML=`
  <article class="nx-case">

    <nav class="nx-rail" aria-label="N Exhibition sections">
      ${[
        "Introduction",
        "Concept",
        "Identity",
        "Colour",
        "Tickets",
        "Printed matter",
            "Environment"
      ].map((x,i)=>`
        <a href="#nx-${i+1}" aria-label="${x}">
          <i></i><span>${String(i+1).padStart(2,"0")}</span>
        </a>
      `).join("")}
    </nav>


    <!-- ==================================================
         01 HERO
         ================================================== -->

    
    
    <section class="nx-hero nx-hero-60style" id="nx-1">
  <div class="nxh-exhibition-space" aria-hidden="true">

    <div class="nxh-projection nxh-projection-a">
      <span>01</span>
    </div>

    <div class="nxh-projection nxh-projection-b">
      <span>02</span>
    </div>

    <div class="nxh-projection nxh-projection-c">
      <span>03</span>
    </div>

    <div class="nxh-guide-line nxh-guide-line-a"></div>
    <div class="nxh-guide-line nxh-guide-line-b"></div>

    <div class="nxh-room-code">
      N / DREAM HOUSE / 2024
    </div>

  </div>


      ${img("hero.svg","N Exhibition hero artwork","nx-hero-art")}
      <div class="nx-hero-overlay"></div>

      <div class="shell nx-hero-inner">

        <div class="nx-hero-meta">
          <span>EXHIBITION IDENTITY · ART DIRECTION · PRINT · 2024</span>
        </div>

        <div class="nx-hero-copy">

          
<div class="nx-hero-logo-final">
  ${img("logo/logo.svg","N Exhibition logo")}
</div>


          

        </div>

      </div>

    
  <div class="nxh-final">

    <div class="nxh-meta">
      EXHIBITION IDENTITY · ART DIRECTION · PRINT · 2024
    </div>

    <div class="nxh-logo">
      ${img("logo/logo.svg","N Exhibition logo")}
    </div>

    <p class="nxh-summary">
      An interactive exhibition where dream and reality overlap,
      inviting visitors to enter experiences they desire but may
      never encounter in everyday life.
    </p>

  </div>

</section>


    <section class="nx-concept nx-concept-refined" id="nx-2">

      <div class="shell">

        <div class="nx-section-head nx-section-label-only">
          <span class="nx-label">02 — CONCEPT + IDENTITY</span>
        </div>

        <div class="nx-concept-identity-layout">

          <div class="nx-identity-logo">
            ${img("logo/logo.svg","N Exhibition logo")}
          </div>

          <div class="nx-concept-identity-copy">

            <div class="nx-concept-detail">
              <span class="nx-mini-label">CONCEPT</span>

              <p>
                Visitors are invited to manually fall into dreams and experience
                what they wish for or love, but which may never happen in reality.
                Dream and reality are treated as interconnected states rather than
                complete opposites.
              </p>
            </div>

            <div class="nx-concept-detail">
              <span class="nx-mini-label">THE LETTER N</span>

              <p>
                The letter N refers to “intuitive” from the 16 personality types,
                describing people who favour imagination, ideas and possibilities
                beyond what is immediately visible.
              </p>
            </div>

            <div class="nx-concept-detail">
              <span class="nx-mini-label">FOUR PARTS</span>

              <p>
                Derived from the four-quadrant structure, the letter N is divided
                into four fragments in two groups to represent the relationship
                between dream and reality.
              </p>
            </div>

            <div class="nx-concept-detail">
              <span class="nx-mini-label">RADIAL BLUR</span>

              <p>
                The diagonal sections are distorted through radial blur to suggest
                the hazy and unstable boundary between dream and reality.
              </p>
            </div>

          </div>

        </div>

      </div>

    </section>




    <section class="nx-colour nx-colour-refined" id="nx-4">

      <div class="shell nx-colour-heading">
        <span class="nx-label">04 — COLOUR SYSTEM</span>
      </div>

      <div class="nx-colour-board nx-colour-board-full">
        ${img("figma/COLOUR_1440x600.png","N Exhibition colour system")}
      </div>

    </section>


    <section class="nx-tickets nx-tickets-refined" id="nx-5">

      <div class="shell">

        <div class="nx-ticket-topline">

          <span class="nx-label">05 — TICKET SYSTEM</span>

          <p>
            Each ticket is divided into four parts. The exhibition entry and room
            passes form a collectible system, while pieces of the N can be torn away
            and assembled onto a dedicated postcard.
          </p>

        </div>


        <div class="nx-ticket-presentation">

          <div class="nx-ticket-main-grid">
            ${img("print/Ticket/Tickets-01.png","Exhibition ticket")}
            ${img("print/Ticket/Tickets-02.png","Exhibition ticket")}
            ${img("print/Ticket/Tickets-03.png","Exhibition ticket")}
            ${img("print/Ticket/Tickets-04.png","Exhibition ticket")}
          </div>


          <div class="nx-collective-heading nx-collective-heading-right">

            <div class="nx-collective-copy">
              

              <p>
                The four ticket pieces can be collected and assembled,
                turning admission material into a physical extension of the identity.
              </p>
            </div>

          </div>


          <div class="nx-collective-row">

            <figure>
              ${img("print/Ticket/Ticket Collect.png","Collective N pieces — filled")}
              <figcaption>Front Filled ver.</figcaption>
            </figure>

            <figure>
              ${img("print/Ticket/Ticket Collect-06.png","Collective N pieces — empty")}
              <figcaption>Front Empty ver.</figcaption>
            </figure>

            <figure>
              ${img("print/Ticket/Ticket Collect-07.png","Collective N postcard — back")}
              <figcaption>Back</figcaption>
            </figure>

          </div>

        </div>

      </div>

    </section>


    
    
    
    
    
    






<section
  class="nxpmf-section"
  id="nx-6"
>

  <div class="shell nxpmf-head">

    <span class="nx-label">
      06 — PRINTED MATTER
    </span>

    <div class="nxpmf-head-main">

      <h3>
        Printed Matter
      </h3>

      <p>
        Printed applications are presented as a continuous moving display.
        Drag to explore, hover for details, and click to view each complete
        design at its original proportion.
      </p>

    </div>

  </div>


  <div
    class="nxpmf-viewport"
    id="nxpmf-viewport"
  >

    <div
      class="nxpmf-track"
      id="nxpmf-track"
    >

      <div class="nxpmf-set">
        
    <article
      class="nxpmf-item"
      data-nxpmf="1"
    >

      <div class="nxpmf-art">

        ${img("thumbnail/Billboard Poster.jpeg","Billboard Poster")}

        <div class="nxpmf-overlay">

          <span>
            01
          </span>

          <div>
            <strong>Billboard Poster</strong>
            <small>Click to view full design</small>
          </div>

        </div>

      </div>

      
        <template class="nxpmf-template">

          <figure class="nxpmf-full">

            ${img("thumbnail/Billboard Poster.jpeg","Billboard Poster")}

            <figcaption>
              Billboard Poster
            </figcaption>

          </figure>

        </template>
        

    </article>
    

    <article
      class="nxpmf-item"
      data-nxpmf="2"
    >

      <div class="nxpmf-art">

        ${img("thumbnail/Brochre.jpeg","Brochure")}

        <div class="nxpmf-overlay">

          <span>
            02
          </span>

          <div>
            <strong>Brochure</strong>
            <small>Click to view full design</small>
          </div>

        </div>

      </div>

      
        <template class="nxpmf-template">

          <div class="nxpmf-pair">

            <figure>
              ${img("print/Brochre/Brochre Refinement.png","Brochure front")}
              <figcaption>Front</figcaption>
            </figure>

            <figure>
              ${img("print/Brochre/Brochre Refinement3.png","Brochure back")}
              <figcaption>Back</figcaption>
            </figure>

          </div>

        </template>
        

    </article>
    

    <article
      class="nxpmf-item"
      data-nxpmf="3"
    >

      <div class="nxpmf-art">

        ${img("thumbnail/Filter Holder Mockup P.jpeg","Filter Holder")}

        <div class="nxpmf-overlay">

          <span>
            03
          </span>

          <div>
            <strong>Filter Holder</strong>
            <small>Click to view full design</small>
          </div>

        </div>

      </div>

      
        <template class="nxpmf-template">

          <div class="nxpmf-pair">

            <figure>
              ${img("print/Filter Holder/Filter Holder-05.png","Filter Holder 05")}
              <figcaption>Filter Holder</figcaption>
            </figure>

            <figure>
              ${img("print/Filter Holder/Filter Holder-06.png","Filter Holder 06")}
              <figcaption>Polaroid Filter</figcaption>
            </figure>

          </div>

        </template>
        

    </article>
    

    <article
      class="nxpmf-item"
      data-nxpmf="4"
    >

      <div class="nxpmf-art">

        ${img("thumbnail/Poster_04.jpeg","Poster 01")}

        <div class="nxpmf-overlay">

          <span>
            04
          </span>

          <div>
            <strong>Poster 01</strong>
            <small>Click to view full design</small>
          </div>

        </div>

      </div>

      
        <template class="nxpmf-template">

          <figure class="nxpmf-full nxpmf-full-poster">

            ${img("print/Poster/Poster-04.png","Poster 01")}

            <figcaption>
              Poster 01
            </figcaption>

          </figure>

        </template>
        

    </article>
    

    <article
      class="nxpmf-item"
      data-nxpmf="5"
    >

      <div class="nxpmf-art">

        ${img("thumbnail/Poster_05.jpeg","Poster 02")}

        <div class="nxpmf-overlay">

          <span>
            05
          </span>

          <div>
            <strong>Poster 02</strong>
            <small>Click to view full design</small>
          </div>

        </div>

      </div>

      
        <template class="nxpmf-template">

          <figure class="nxpmf-full nxpmf-full-poster">

            ${img("print/Poster/Poster-05.png","Poster 02")}

            <figcaption>
              Poster 02
            </figcaption>

          </figure>

        </template>
        

    </article>
    

    <article
      class="nxpmf-item"
      data-nxpmf="6"
    >

      <div class="nxpmf-art">

        ${img("thumbnail/Poster_06.jpeg","Poster 03")}

        <div class="nxpmf-overlay">

          <span>
            06
          </span>

          <div>
            <strong>Poster 03</strong>
            <small>Click to view full design</small>
          </div>

        </div>

      </div>

      
        <template class="nxpmf-template">

          <figure class="nxpmf-full nxpmf-full-poster">

            ${img("print/Poster/Poster-06.png","Poster 03")}

            <figcaption>
              Poster 03
            </figcaption>

          </figure>

        </template>
        

    </article>
    
      </div>

      <div class="nxpmf-set">
        
    <article
      class="nxpmf-item"
      data-nxpmf="1"
    >

      <div class="nxpmf-art">

        ${img("thumbnail/Billboard Poster.jpeg","Billboard Poster")}

        <div class="nxpmf-overlay">

          <span>
            01
          </span>

          <div>
            <strong>Billboard Poster</strong>
            <small>Click to view full design</small>
          </div>

        </div>

      </div>

      
        <template class="nxpmf-template">

          <figure class="nxpmf-full">

            ${img("thumbnail/Billboard Poster.jpeg","Billboard Poster")}

            <figcaption>
              Billboard Poster
            </figcaption>

          </figure>

        </template>
        

    </article>
    

    <article
      class="nxpmf-item"
      data-nxpmf="2"
    >

      <div class="nxpmf-art">

        ${img("thumbnail/Brochre.jpeg","Brochure")}

        <div class="nxpmf-overlay">

          <span>
            02
          </span>

          <div>
            <strong>Brochure</strong>
            <small>Click to view full design</small>
          </div>

        </div>

      </div>

      
        <template class="nxpmf-template">

          <div class="nxpmf-pair">

            <figure>
              ${img("print/Brochre/Brochre Refinement.png","Brochure front")}
              <figcaption>Front</figcaption>
            </figure>

            <figure>
              ${img("print/Brochre/Brochre Refinement3.png","Brochure back")}
              <figcaption>Back</figcaption>
            </figure>

          </div>

        </template>
        

    </article>
    

    <article
      class="nxpmf-item"
      data-nxpmf="3"
    >

      <div class="nxpmf-art">

        ${img("thumbnail/Filter Holder Mockup P.jpeg","Filter Holder")}

        <div class="nxpmf-overlay">

          <span>
            03
          </span>

          <div>
            <strong>Filter Holder</strong>
            <small>Click to view full design</small>
          </div>

        </div>

      </div>

      
        <template class="nxpmf-template">

          <div class="nxpmf-pair">

            <figure>
              ${img("print/Filter Holder/Filter Holder-05.png","Filter Holder 05")}
              <figcaption>Filter Holder</figcaption>
            </figure>

            <figure>
              ${img("print/Filter Holder/Filter Holder-06.png","Filter Holder 06")}
              <figcaption>Polaroid Filter</figcaption>
            </figure>

          </div>

        </template>
        

    </article>
    

    <article
      class="nxpmf-item"
      data-nxpmf="4"
    >

      <div class="nxpmf-art">

        ${img("thumbnail/Poster_04.jpeg","Poster 01")}

        <div class="nxpmf-overlay">

          <span>
            04
          </span>

          <div>
            <strong>Poster 01</strong>
            <small>Click to view full design</small>
          </div>

        </div>

      </div>

      
        <template class="nxpmf-template">

          <figure class="nxpmf-full nxpmf-full-poster">

            ${img("print/Poster/Poster-04.png","Poster 01")}

            <figcaption>
              Poster 01
            </figcaption>

          </figure>

        </template>
        

    </article>
    

    <article
      class="nxpmf-item"
      data-nxpmf="5"
    >

      <div class="nxpmf-art">

        ${img("thumbnail/Poster_05.jpeg","Poster 02")}

        <div class="nxpmf-overlay">

          <span>
            05
          </span>

          <div>
            <strong>Poster 02</strong>
            <small>Click to view full design</small>
          </div>

        </div>

      </div>

      
        <template class="nxpmf-template">

          <figure class="nxpmf-full nxpmf-full-poster">

            ${img("print/Poster/Poster-05.png","Poster 02")}

            <figcaption>
              Poster 02
            </figcaption>

          </figure>

        </template>
        

    </article>
    

    <article
      class="nxpmf-item"
      data-nxpmf="6"
    >

      <div class="nxpmf-art">

        ${img("thumbnail/Poster_06.jpeg","Poster 03")}

        <div class="nxpmf-overlay">

          <span>
            06
          </span>

          <div>
            <strong>Poster 03</strong>
            <small>Click to view full design</small>
          </div>

        </div>

      </div>

      
        <template class="nxpmf-template">

          <figure class="nxpmf-full nxpmf-full-poster">

            ${img("print/Poster/Poster-06.png","Poster 03")}

            <figcaption>
              Poster 03
            </figcaption>

          </figure>

        </template>
        

    </article>
    
      </div>

      <div class="nxpmf-set">
        
    <article
      class="nxpmf-item"
      data-nxpmf="1"
    >

      <div class="nxpmf-art">

        ${img("thumbnail/Billboard Poster.jpeg","Billboard Poster")}

        <div class="nxpmf-overlay">

          <span>
            01
          </span>

          <div>
            <strong>Billboard Poster</strong>
            <small>Click to view full design</small>
          </div>

        </div>

      </div>

      
        <template class="nxpmf-template">

          <figure class="nxpmf-full">

            ${img("thumbnail/Billboard Poster.jpeg","Billboard Poster")}

            <figcaption>
              Billboard Poster
            </figcaption>

          </figure>

        </template>
        

    </article>
    

    <article
      class="nxpmf-item"
      data-nxpmf="2"
    >

      <div class="nxpmf-art">

        ${img("thumbnail/Brochre.jpeg","Brochure")}

        <div class="nxpmf-overlay">

          <span>
            02
          </span>

          <div>
            <strong>Brochure</strong>
            <small>Click to view full design</small>
          </div>

        </div>

      </div>

      
        <template class="nxpmf-template">

          <div class="nxpmf-pair">

            <figure>
              ${img("print/Brochre/Brochre Refinement.png","Brochure front")}
              <figcaption>Front</figcaption>
            </figure>

            <figure>
              ${img("print/Brochre/Brochre Refinement3.png","Brochure back")}
              <figcaption>Back</figcaption>
            </figure>

          </div>

        </template>
        

    </article>
    

    <article
      class="nxpmf-item"
      data-nxpmf="3"
    >

      <div class="nxpmf-art">

        ${img("thumbnail/Filter Holder Mockup P.jpeg","Filter Holder")}

        <div class="nxpmf-overlay">

          <span>
            03
          </span>

          <div>
            <strong>Filter Holder</strong>
            <small>Click to view full design</small>
          </div>

        </div>

      </div>

      
        <template class="nxpmf-template">

          <div class="nxpmf-pair">

            <figure>
              ${img("print/Filter Holder/Filter Holder-05.png","Filter Holder 05")}
              <figcaption>Filter Holder</figcaption>
            </figure>

            <figure>
              ${img("print/Filter Holder/Filter Holder-06.png","Filter Holder 06")}
              <figcaption>Polaroid Filter</figcaption>
            </figure>

          </div>

        </template>
        

    </article>
    

    <article
      class="nxpmf-item"
      data-nxpmf="4"
    >

      <div class="nxpmf-art">

        ${img("thumbnail/Poster_04.jpeg","Poster 01")}

        <div class="nxpmf-overlay">

          <span>
            04
          </span>

          <div>
            <strong>Poster 01</strong>
            <small>Click to view full design</small>
          </div>

        </div>

      </div>

      
        <template class="nxpmf-template">

          <figure class="nxpmf-full nxpmf-full-poster">

            ${img("print/Poster/Poster-04.png","Poster 01")}

            <figcaption>
              Poster 01
            </figcaption>

          </figure>

        </template>
        

    </article>
    

    <article
      class="nxpmf-item"
      data-nxpmf="5"
    >

      <div class="nxpmf-art">

        ${img("thumbnail/Poster_05.jpeg","Poster 02")}

        <div class="nxpmf-overlay">

          <span>
            05
          </span>

          <div>
            <strong>Poster 02</strong>
            <small>Click to view full design</small>
          </div>

        </div>

      </div>

      
        <template class="nxpmf-template">

          <figure class="nxpmf-full nxpmf-full-poster">

            ${img("print/Poster/Poster-05.png","Poster 02")}

            <figcaption>
              Poster 02
            </figcaption>

          </figure>

        </template>
        

    </article>
    

    <article
      class="nxpmf-item"
      data-nxpmf="6"
    >

      <div class="nxpmf-art">

        ${img("thumbnail/Poster_06.jpeg","Poster 03")}

        <div class="nxpmf-overlay">

          <span>
            06
          </span>

          <div>
            <strong>Poster 03</strong>
            <small>Click to view full design</small>
          </div>

        </div>

      </div>

      
        <template class="nxpmf-template">

          <figure class="nxpmf-full nxpmf-full-poster">

            ${img("print/Poster/Poster-06.png","Poster 03")}

            <figcaption>
              Poster 03
            </figcaption>

          </figure>

        </template>
        

    </article>
    
      </div>

    </div>

  </div>


  <div
    class="nxpmf-modal"
    id="nxpmf-modal"
    aria-hidden="true"
  >

    <button
      class="nxpmf-backdrop"
      type="button"
      aria-label="Close"
    ></button>

    <div class="nxpmf-modal-inner">

      <button
        class="nxpmf-close"
        type="button"
        aria-label="Close"
      >
        ×
      </button>

      <div
        id="nxpmf-modal-body"
      ></div>

    </div>

  </div>

</section>










<section class="nx-campaign-space nx-campaign-final" id="nx-8">

  <div class="shell nx-campaign-space-head">

    <span class="nx-label">
      07 — CAMPAIGN + SPACE
    </span>

    <h2>Campaign + Space</h2>

    <p>
      The exhibition identity expands across campaign and environmental
      applications, from billboard scale to poster installations and
      spatial graphics.
    </p>

  </div>


  <div class="shell nx-mockup-showcase">

    <figure class="nx-mockup-landscape">
      ${img("mockup/Billboard Mockup L.png","Billboard application")}
      <figcaption>
        Billboard Campaign
      </figcaption>
    </figure>


    <figure class="nx-mockup-landscape">
      ${img("mockup/Poster Mockup 3.png","Three poster campaign")}
      <figcaption>
        Three-Poster Campaign
      </figcaption>
    </figure>


    <div class="nx-mockup-portrait-row">

      <figure>
        ${img("mockup/Billboard Mockup P 2.jpeg","Campaign application")}
        <figcaption>
          Environmental Application
        </figcaption>
      </figure>

      <figure>
        ${img("mockup/Poster Mockup 1.png","Campaign application")}
        <figcaption>
          Exhibition Application
        </figcaption>
      </figure>

    </div>

  </div>

</section>


<section class="nx-project-ending">

  <div class="nx-project-ending-bg">
    ${img("print/Poster/Billboard Poster.png","N Exhibition billboard poster")}
  </div>

  <div class="nx-project-ending-shade"></div>

  </section>






<a class="next-project nx-next" href="/work/${next.slug}/">
      <span class="meta-mono">NEXT PROJECT</span><br>
      ${esc(next.title)} →
    </a>

  </article>
  `;

  document.body.insertAdjacentHTML("beforeend",footer());

  requestAnimationFrame(initNxFilmRibbon);

  

  const progress=document.querySelector("#progress");

  addEventListener("scroll",()=>{
    const h=document.documentElement.scrollHeight-innerHeight;
    progress.style.width=`${h?scrollY/h*100:0}%`;
  },{passive:true});

  const links=[...document.querySelectorAll(".nx-rail a")];
  const sections=links.map(a=>document.querySelector(a.getAttribute("href")));

  const io=new IntersectionObserver(entries=>{
    entries.forEach(entry=>{
      if(entry.isIntersecting){
        const i=sections.indexOf(entry.target);
        links.forEach((a,j)=>a.classList.toggle("active",i===j));
      }
    });
  },{rootMargin:"-42% 0px -48% 0px"});

  sections.forEach(s=>s&&io.observe(s));
}







document.addEventListener("keydown",e=>{
  if(e.key==="Escape") nxClosePrint();
});



















document.addEventListener(
  "keydown",
  e=>{
    if(e.key === "Escape"){
      nxCloseFilmDesign();
    }
  }
);










/*
 * Robust route/render watcher.
 * This fixes the previous bug where the film engine
 * sometimes never initialized after renderProject().
 */
(function watchNxFilm(){

  const boot = ()=>{
    if(
      document.querySelector(
        "#nx-film-viewport"
      )
    ){
      initNxFilmCinema();
    }
  };

  if(
    document.readyState ===
    "loading"
  ){
    document.addEventListener(
      "DOMContentLoaded",
      boot
    );
  }else{
    boot();
  }

  const observer =
    new MutationObserver(
      boot
    );

  observer.observe(
    document.documentElement,
    {
      childList:true,
      subtree:true
    }
  );

})();



function initNxCinemaWall(){

  const viewport =
    document.querySelector("#nx-cinema-viewport");

  const track =
    document.querySelector("#nx-cinema-track");
const modal =
    document.querySelector("#nx-cinema-modal");

  const modalBody =
    document.querySelector("#nx-cinema-modal-body");

  if(
    !viewport ||
    !track ||
    viewport.dataset.cinemaReady === "1"
  ){
    return;
  }

  viewport.dataset.cinemaReady = "1";


  let dragging = false;
  let dragged = false;

  let lastX = 0;
  let lastTime = 0;

  let velocity = .46;
  const autoSpeed = .46;

  let resumeAt = 0;
function halfWidth(){
    return track.scrollWidth / 2;
  }


  function wrap(){

    const half = halfWidth();

    if(!half) return;

    while(viewport.scrollLeft >= half){
      viewport.scrollLeft -= half;
    }

    while(viewport.scrollLeft < 0){
      viewport.scrollLeft += half;
    }
  }


  /*
   * Strong curved cinema-wall geometry.
   *
   * Centre faces user.
   * Outer frames rotate strongly inward and shrink,
   * creating the panoramic wall seen in the reference.
   */
  function curve(){

    const viewportWidth =
      viewport.clientWidth;

    const viewportCenter =
      viewportWidth / 2;

    const cards =
      viewport.querySelectorAll(
        ".nx-cinema-card"
      );

    cards.forEach(card=>{

      /*
       * IMPORTANT:
       * use the card's ORIGINAL flow position,
       * not getBoundingClientRect() after transform.
       *
       * This keeps the whole wall stable and continuous.
       */
      const cardCenter =
        card.offsetLeft
        - viewport.scrollLeft
        + card.offsetWidth / 2;

      let n =
        (cardCenter - viewportCenter)
        /
        (viewportWidth * .54);

      n =
        Math.max(
          -1.35,
          Math.min(1.35,n)
        );

      const abs =
        Math.abs(n);


      /*
       * Continuous concave cinema wall.
       *
       * centre:
       *   flat / close / largest
       *
       * sides:
       *   rotate inward / travel backward
       */
      const y =
        -58 * abs * abs;

      const z =
        -210 * abs * abs;

      const rotateY =
        -n * 38;

      const rotateZ =
        n * 1.4;

      /*
       * Small horizontal compensation helps
       * neighbouring panels visually connect.
       */
      const x =
        -n * 15;

      const scale =
        1.035 -
        abs * .045;

      const opacity =
        1 -
        Math.min(
          abs * .18,
          .18
        );


      card.style.setProperty(
        "--cinema-x",
        `${x}px`
      );

      card.style.setProperty(
        "--cinema-y",
        `${y}px`
      );

      card.style.setProperty(
        "--cinema-z",
        `${z}px`
      );

      card.style.setProperty(
        "--cinema-ry",
        `${rotateY}deg`
      );

      card.style.setProperty(
        "--cinema-rz",
        `${rotateZ}deg`
      );

      card.style.setProperty(
        "--cinema-scale",
        scale.toFixed(3)
      );

      card.style.setProperty(
        "--cinema-opacity",
        opacity.toFixed(3)
      );

    });

  }


  function pause(ms=800){
    resumeAt =
      performance.now() + ms;
  }


  let previous =
    performance.now();


  function animate(now){

    const dt =
      Math.min(
        (now-previous)/16.667,
        3
      );

    previous = now;

    if(!dragging){

      if(now > resumeAt){

        velocity +=
          (autoSpeed-velocity)
          *.026;

      }else{

        velocity *= .96;

      }

      viewport.scrollLeft +=
        velocity*dt;
    }

    wrap();
    curve();

    requestAnimationFrame(
      animate
    );
  }


  /* ------------------------------------------------------
     DRAG
     ------------------------------------------------------ */

  viewport.addEventListener(
    "pointerdown",
    e=>{

      dragging = true;
      dragged = false;

      lastX = e.clientX;
      lastTime = performance.now();

      velocity = 0;

      viewport.classList.add(
        "is-dragging"
      );

      viewport.setPointerCapture?.(
        e.pointerId
      );
    }
  );


  viewport.addEventListener(
    "pointermove",
    e=>{

      if(!dragging) return;

      const now =
        performance.now();

      const dx =
        e.clientX-lastX;

      if(Math.abs(dx)>3){
        dragged = true;
      }

      viewport.scrollLeft -= dx;

      const elapsed =
        Math.max(
          now-lastTime,
          1
        );

      velocity =
        -(dx/elapsed)*15;

      lastX = e.clientX;
      lastTime = now;

      wrap();
    }
  );


  function release(){

    if(!dragging) return;

    dragging = false;

    viewport.classList.remove(
      "is-dragging"
    );

    pause(550);
  }

  viewport.addEventListener(
    "pointerup",
    release
  );

  viewport.addEventListener(
    "pointercancel",
    release
  );


  viewport.addEventListener(
    "wheel",
    e=>{

      const delta =
        Math.abs(e.deltaX)
        >
        Math.abs(e.deltaY)
          ? e.deltaX
          : e.deltaY;

      viewport.scrollLeft += delta;

      velocity =
        delta*.025;

      pause(900);

      e.preventDefault();
    },
    {passive:false}
  );


  /* ------------------------------------------------------
     FULL-PAGE HOVER
     ------------------------------------------------------ */

  


  


  


  


  /* ------------------------------------------------------
     CLICK = PIN FULL VIEW
     ------------------------------------------------------ */

  viewport.addEventListener(
    "click",
    e=>{

      const card =
        e.target.closest(
          ".nx-cinema-card"
        );

      if(!card || dragged) return;

      const template =
        card.querySelector(
          ".nx-cinema-click-template"
        );

      if(
        !template ||
        !modal ||
        !modalBody
      ){
        return;
      }

      modalBody.innerHTML = "";

      modalBody.appendChild(
        template.content.cloneNode(true)
      );

      modal.classList.add(
        "is-open"
      );

      modal.setAttribute(
        "aria-hidden",
        "false"
      );

      document.body.classList.add(
        "nx-cinema-open"
      );
    }
  );


  function closeModal(){

    modal?.classList.remove(
      "is-open"
    );

    modal?.setAttribute(
      "aria-hidden",
      "true"
    );

    document.body.classList.remove(
      "nx-cinema-open"
    );
  }


  modal
    ?.querySelector(
      ".nx-cinema-modal-bg"
    )
    ?.addEventListener(
      "click",
      closeModal
    );


  modal
    ?.querySelector(
      ".nx-cinema-modal-close"
    )
    ?.addEventListener(
      "click",
      closeModal
    );


  document.addEventListener(
    "keydown",
    e=>{
      if(e.key==="Escape"){
        closeModal();
      }
    }
  );


  curve();

  requestAnimationFrame(
    animate
  );
}


/*
 * Initialize even when renderProject injects the page later.
 */
(function nxCinemaBoot(){

  const boot = ()=>{
    if(
      document.querySelector(
        "#nx-cinema-viewport"
      )
    ){
      initNxCinemaWall();
    }
  };

  if(document.readyState==="loading"){
    document.addEventListener(
      "DOMContentLoaded",
      boot
    );
  }else{
    boot();
  }

  const observer =
    new MutationObserver(boot);

  observer.observe(
    document.documentElement,
    {
      childList:true,
      subtree:true
    }
  );

})();




function initNxBandWall(){

  const viewport =
    document.getElementById("nxb-viewport");

  const track =
    document.getElementById("nxb-track");

  const modal =
    document.getElementById("nxb-modal");

  const modalBody =
    document.getElementById("nxb-modal-body");

  if(
    !viewport ||
    !track ||
    viewport.dataset.nxbReady === "1"
  ){
    return;
  }

  viewport.dataset.nxbReady = "1";


  const sets =
    [...track.querySelectorAll(".nxb-set")];

  if(sets.length < 3){
    console.warn("N Exhibition loop requires 3 sets");
    return;
  }


  let pressed = false;
  let moved = false;

  let startX = 0;
  let lastX = 0;
  let lastTime = 0;

  let activePanel = null;

  /*
   * positive scrollLeft = artwork moves left.
   */
  let velocity = .42;
  const autoSpeed = .42;

  let resumeTime = 0;

  let setWidth = 0;


  /* ======================================================
     MEASURE + START IN MIDDLE COPY
     ====================================================== */

  function measure(){

    setWidth =
      sets[1].getBoundingClientRect().width;

    if(!setWidth){
      return;
    }

    /*
     * Main copy begins after previous copy.
     */
    viewport.scrollLeft = setWidth;

    updatePanels();
  }


  /*
   * Wait until images/layout have real dimensions.
   */
  requestAnimationFrame(()=>{
    requestAnimationFrame(measure);
  });

  window.addEventListener(
    "resize",
    ()=>{
      const oldWidth = setWidth;

      setWidth =
        sets[1].getBoundingClientRect().width;

      if(oldWidth && setWidth){
        const local =
          viewport.scrollLeft - oldWidth;

        viewport.scrollLeft =
          setWidth + local;
      }
    }
  );


  /* ======================================================
     SEAMLESS WRAP
     ====================================================== */

  function wrap(){

    if(!setWidth) return;

    /*
     * We live around the middle copy:
     *
     * 0           setWidth        setWidth*2
     * [ PREVIOUS ][   MAIN   ][    NEXT    ]
     *
     * Crossing into either outside copy instantly shifts
     * by one complete set, preserving the exact visual
     * position.
     */

    while(viewport.scrollLeft < setWidth * .5){
      viewport.scrollLeft += setWidth;
    }

    while(viewport.scrollLeft >= setWidth * 1.5){
      viewport.scrollLeft -= setWidth;
    }
  }


  /* ======================================================
     CURVED WALL
     ====================================================== */

  function updatePanels(){

    const width =
      viewport.clientWidth;

    const centre =
      width / 2;

    const radius =
      width * .78;

    viewport
      .querySelectorAll(".nxb-panel")
      .forEach(panel=>{

        const linearX =
          panel.offsetLeft
          - viewport.scrollLeft
          + panel.offsetWidth / 2
          - centre;

        let angle =
          linearX / radius;

        const maxAngle = 1.02;

        angle =
          Math.max(
            -maxAngle,
            Math.min(maxAngle,angle)
          );

        const curvedX =
          Math.sin(angle) * radius;

        const curvedZ =
          Math.cos(angle) * radius - radius;

        const correctionX =
          curvedX - linearX;

        const rotateY =
          -angle * (180 / Math.PI);

        const amount =
          Math.abs(angle) / maxAngle;

        const y =
          -20 * amount * amount;

        panel.style.setProperty(
          "--nxb-x",
          correctionX+"px"
        );

        panel.style.setProperty(
          "--nxb-y",
          y+"px"
        );

        panel.style.setProperty(
          "--nxb-z",
          curvedZ+"px"
        );

        panel.style.setProperty(
          "--nxb-ry",
          rotateY+"deg"
        );

        panel.style.setProperty(
          "--nxb-scale",
          "1"
        );

        panel.style.setProperty(
          "--nxb-opacity",
          (1-amount*.16).toFixed(3)
        );

      });
  }


  function pause(ms=700){
    resumeTime =
      performance.now()+ms;
  }


  /* ======================================================
     DRAG
     ====================================================== */

  viewport.addEventListener(
    "pointerdown",
    e=>{

      if(
        e.button !== undefined &&
        e.button !== 0
      ){
        return;
      }

      pressed = true;
      moved = false;

      startX = e.clientX;
      lastX = e.clientX;

      lastTime =
        performance.now();

      activePanel =
        e.target.closest(".nxb-panel");

      velocity = 0;

      viewport.classList.add(
        "is-dragging"
      );

      viewport.setPointerCapture?.(
        e.pointerId
      );
    }
  );


  viewport.addEventListener(
    "pointermove",
    e=>{

      if(!pressed) return;

      const total =
        e.clientX-startX;

      if(Math.abs(total)>9){
        moved = true;
      }

      if(!moved) return;

      const now =
        performance.now();

      const dx =
        e.clientX-lastX;

      viewport.scrollLeft -= dx;

      const elapsed =
        Math.max(now-lastTime,1);

      velocity =
        -(dx/elapsed)*14;

      lastX = e.clientX;
      lastTime = now;

      wrap();
      updatePanels();
    }
  );


  viewport.addEventListener(
    "pointerup",
    ()=>{

      if(!pressed) return;

      const shouldOpen =
        !moved && activePanel;

      pressed = false;

      viewport.classList.remove(
        "is-dragging"
      );

      pause(500);


      /*
       * CLICK — unchanged
       */
      if(shouldOpen){

        const template =
          activePanel.querySelector(
            ".nxb-full-template"
          );

        if(
          template &&
          modal &&
          modalBody
        ){

          modalBody.innerHTML = "";

          modalBody.appendChild(
            template.content.cloneNode(true)
          );

          modal.classList.add(
            "is-open"
          );

          modal.setAttribute(
            "aria-hidden",
            "false"
          );

          document.body.classList.add(
            "nxb-open"
          );
        }
      }


      activePanel = null;
      moved = false;
    }
  );


  viewport.addEventListener(
    "pointercancel",
    ()=>{

      pressed = false;
      moved = false;
      activePanel = null;

      viewport.classList.remove(
        "is-dragging"
      );
    }
  );


  /* ======================================================
     TRACKPAD / WHEEL
     ====================================================== */

  viewport.addEventListener(
    "wheel",
    e=>{

      const delta =
        Math.abs(e.deltaX) >
        Math.abs(e.deltaY)
          ? e.deltaX
          : e.deltaY;

      viewport.scrollLeft += delta;

      velocity =
        delta*.022;

      wrap();
      updatePanels();

      pause(850);

      e.preventDefault();
    },
    {passive:false}
  );


  /* ======================================================
     MODAL
     ====================================================== */

  function closeModal(){

    modal?.classList.remove(
      "is-open"
    );

    modal?.setAttribute(
      "aria-hidden",
      "true"
    );

    document.body.classList.remove(
      "nxb-open"
    );
  }


  modal
    ?.querySelector(".nxb-modal-backdrop")
    ?.addEventListener(
      "click",
      closeModal
    );


  modal
    ?.querySelector(".nxb-modal-close")
    ?.addEventListener(
      "click",
      closeModal
    );


  document.addEventListener(
    "keydown",
    e=>{
      if(e.key==="Escape"){
        closeModal();
      }
    }
  );


  /* ======================================================
     ANIMATION
     ====================================================== */

  let lastFrame =
    performance.now();


  function loop(now){

    const dt =
      Math.min(
        (now-lastFrame)/16.667,
        3
      );

    lastFrame = now;


    if(!pressed && setWidth){

      if(now > resumeTime){

        velocity +=
          (autoSpeed-velocity)
          *.028;

      }else{

        velocity *= .96;

      }

      viewport.scrollLeft +=
        velocity*dt;
    }


    wrap();
    updatePanels();

    requestAnimationFrame(loop);
  }


  requestAnimationFrame(loop);
}



/*
 * Robust boot for dynamically-rendered project page.
 */
(function bootNxBandWall(){

  const boot = ()=>{

    if(
      document.getElementById(
        "nxb-viewport"
      )
    ){
      initNxBandWall();
    }

  };


  if(
    document.readyState ===
    "loading"
  ){

    document.addEventListener(
      "DOMContentLoaded",
      boot
    );

  }else{

    boot();

  }


  new MutationObserver(
    boot
  ).observe(
    document.documentElement,
    {
      childList:true,
      subtree:true
    }
  );

})();



function initNxPrintedMatterFinal(){

  const viewport =
    document.getElementById("nxpmf-viewport");

  const track =
    document.getElementById("nxpmf-track");

  const modal =
    document.getElementById("nxpmf-modal");

  const modalBody =
    document.getElementById("nxpmf-modal-body");

  if(
    !viewport ||
    !track ||
    viewport.dataset.nxpmfReady==="1"
  ){
    return;
  }

  viewport.dataset.nxpmfReady="1";


  const sets =
    [...track.querySelectorAll(".nxpmf-set")];

  if(sets.length !== 3){
    return;
  }


  let setWidth = 0;

  let dragging = false;
  let moved = false;

  let startX = 0;
  let lastX = 0;
  let lastTime = 0;

  let currentItem = null;

  let velocity = .48;
  const autoSpeed = .48;

  let resumeAt = 0;


  function measure(){

    const middle =
      sets[1];

    setWidth =
      middle.getBoundingClientRect().width;

    if(setWidth){
      viewport.scrollLeft =
        setWidth;
    }

  }


  function wrap(){

    if(!setWidth){
      return;
    }

    if(
      viewport.scrollLeft <
      setWidth*.5
    ){
      viewport.scrollLeft +=
        setWidth;
    }

    if(
      viewport.scrollLeft >=
      setWidth*1.5
    ){
      viewport.scrollLeft -=
        setWidth;
    }

  }


  function pause(ms=700){
    resumeAt =
      performance.now()+ms;
  }


  /*
   * Wait until images establish their intrinsic widths.
   */
  const images =
    [...track.querySelectorAll("img")];

  Promise.all(
    images.map(image=>{

      if(image.complete){
        return Promise.resolve();
      }

      return new Promise(resolve=>{

        image.addEventListener(
          "load",
          resolve,
          {once:true}
        );

        image.addEventListener(
          "error",
          resolve,
          {once:true}
        );

      });

    })
  ).then(()=>{

    requestAnimationFrame(()=>{
      requestAnimationFrame(measure);
    });

  });


  /* ======================================================
     DRAG
     ====================================================== */

  viewport.addEventListener(
    "pointerdown",
    e=>{

      if(
        e.button !== undefined &&
        e.button !== 0
      ){
        return;
      }

      dragging = true;
      moved = false;

      startX = e.clientX;
      lastX = e.clientX;
      lastTime = performance.now();

      currentItem =
        e.target.closest(".nxpmf-item");

      velocity = 0;

      viewport.classList.add(
        "is-dragging"
      );

      viewport.setPointerCapture?.(
        e.pointerId
      );

    }
  );


  viewport.addEventListener(
    "pointermove",
    e=>{

      if(!dragging){
        return;
      }

      const total =
        e.clientX-startX;

      if(Math.abs(total)>8){
        moved = true;
      }

      if(!moved){
        return;
      }

      const now =
        performance.now();

      const dx =
        e.clientX-lastX;

      viewport.scrollLeft -= dx;

      const elapsed =
        Math.max(now-lastTime,1);

      velocity =
        -(dx/elapsed)*13;

      lastX = e.clientX;
      lastTime = now;

      wrap();

    }
  );


  viewport.addEventListener(
    "pointerup",
    ()=>{

      if(!dragging){
        return;
      }

      const open =
        !moved && currentItem;

      dragging = false;

      viewport.classList.remove(
        "is-dragging"
      );

      pause(500);


      if(open){

        const template =
          currentItem.querySelector(
            ".nxpmf-template"
          );

        if(
          template &&
          modal &&
          modalBody
        ){

          modalBody.innerHTML = "";

          modalBody.appendChild(
            template.content.cloneNode(true)
          );

          modal.classList.add(
            "is-open"
          );

          modal.setAttribute(
            "aria-hidden",
            "false"
          );

          document.body.classList.add(
            "nxpmf-open"
          );

        }

      }


      currentItem = null;
      moved = false;

    }
  );


  viewport.addEventListener(
    "pointercancel",
    ()=>{

      dragging = false;
      moved = false;
      currentItem = null;

      viewport.classList.remove(
        "is-dragging"
      );

    }
  );


  /* ======================================================
     TRACKPAD
     ====================================================== */

  viewport.addEventListener(
    "wheel",
    e=>{

      const d =
        Math.abs(e.deltaX) >
        Math.abs(e.deltaY)
          ? e.deltaX
          : e.deltaY;

      viewport.scrollLeft += d;

      velocity =
        d*.018;

      pause(850);
      wrap();

      e.preventDefault();

    },
    {passive:false}
  );


  /* ======================================================
     MODAL
     ====================================================== */

  function close(){

    modal?.classList.remove(
      "is-open"
    );

    modal?.setAttribute(
      "aria-hidden",
      "true"
    );

    document.body.classList.remove(
      "nxpmf-open"
    );

  }


  modal
    ?.querySelector(".nxpmf-backdrop")
    ?.addEventListener(
      "click",
      close
    );


  modal
    ?.querySelector(".nxpmf-close")
    ?.addEventListener(
      "click",
      close
    );


  document.addEventListener(
    "keydown",
    e=>{

      if(e.key==="Escape"){
        close();
      }

    }
  );


  /* ======================================================
     LOOP
     ====================================================== */

  let previous =
    performance.now();


  function loop(now){

    const dt =
      Math.min(
        (now-previous)/16.667,
        3
      );

    previous = now;


    if(
      !dragging &&
      setWidth
    ){

      if(now>resumeAt){

        velocity +=
          (autoSpeed-velocity)
          *.025;

      }else{

        velocity *= .96;

      }

      viewport.scrollLeft +=
        velocity*dt;

    }


    wrap();

    requestAnimationFrame(loop);

  }


  requestAnimationFrame(loop);

}


/*
 * Start after dynamic project renderer inserts #nx-6.
 */
(function bootNxPrintedMatterFinal(){

  const boot = ()=>{

    if(
      document.getElementById(
        "nxpmf-viewport"
      )
    ){
      initNxPrintedMatterFinal();
    }

  };


  if(
    document.readyState==="loading"
  ){

    document.addEventListener(
      "DOMContentLoaded",
      boot
    );

  }else{

    boot();

  }


  new MutationObserver(
    boot
  ).observe(
    document.documentElement,
    {
      childList:true,
      subtree:true
    }
  );

})();



function initNExhibitionHeroSpace(){

  const hero =
    document.querySelector(".nx-v1 #nx-1");

  const space =
    hero?.querySelector(".nxh-exhibition-space");

  if(
    !hero ||
    !space ||
    hero.dataset.spaceReady === "1"
  ){
    return;
  }

  hero.dataset.spaceReady = "1";

  let targetX = 0;
  let targetY = 0;

  let currentX = 0;
  let currentY = 0;


  hero.addEventListener(
    "pointermove",
    e=>{

      const rect =
        hero.getBoundingClientRect();

      targetX =
        (
          (e.clientX - rect.left)
          /
          rect.width
          -.5
        );

      targetY =
        (
          (e.clientY - rect.top)
          /
          rect.height
          -.5
        );

    }
  );


  hero.addEventListener(
    "pointerleave",
    ()=>{
      targetX = 0;
      targetY = 0;
    }
  );


  function loop(){

    currentX +=
      (targetX-currentX)
      *.045;

    currentY +=
      (targetY-currentY)
      *.045;

    space.style.setProperty(
      "--space-x",
      currentX
    );

    space.style.setProperty(
      "--space-y",
      currentY
    );

    requestAnimationFrame(loop);
  }

  requestAnimationFrame(loop);
}


(function bootNExhibitionHeroSpace(){

  const boot = ()=>{
    initNExhibitionHeroSpace();
  };

  if(document.readyState==="loading"){
    document.addEventListener(
      "DOMContentLoaded",
      boot
    );
  }else{
    boot();
  }

  new MutationObserver(
    boot
  ).observe(
    document.documentElement,
    {
      childList:true,
      subtree:true
    }
  );

})();



/* =========================================================
   MODULAR TYPEFACE V2
   ========================================================= */


function renderStepMotion(project) {
  const base = "/public/projects/step-motion";

  return `
    <article class="sm-page">

      <!-- HERO -->
      <section class="sm-hero">
        <video
          class="sm-hero-video"
          src="${base}/Film_Final.mp4"
          autoplay
          muted
          loop
          playsinline
          preload="metadata"
        ></video>

        <div class="sm-hero-shade"></div>

        <div class="sm-hero-montage" aria-hidden="true">

          <div class="sm-hero-panel sm-hero-panel-a">
            <img src="${base}/film/2.png" alt="">
          </div>

          <div class="sm-hero-panel sm-hero-panel-b">
            <img src="${base}/film/4.png" alt="">
          </div>

          <div class="sm-hero-panel sm-hero-panel-c">
            <img src="${base}/film/3.png" alt="">
          </div>

        </div>


        <div class="shell sm-hero-inner">
          <div class="sm-kicker">
  <span>FILM · SOUND · PRINT · BOOK · 2026</span>
</div>

          <div class="sm-title">
            <span class="sm-title-step">STEP</span>
            <span class="sm-title-slash">/</span>
            <span class="sm-title-motion">MOTION</span>
          </div>

          <div class="sm-hero-foot">
            <p>
              A cross-media study of fragmented time, translating
              stairs, elevators and repeated human movement from
              moving image into a physical book.
            </p>

            <span>FILM · SOUND · PRINT · BOOK</span>
          </div>
        </div>
      </section>


      <!-- CONCEPT -->
      <section class="sm-paper sm-concept">
        <div class="shell">
          <div class="sm-section-head sm-case-head">
            <span>01</span>
            <h2>TIME AS SPACE</h2>
          </div>

          <div class="sm-concept-grid">
            <div class="sm-concept-copy">
              <p class="sm-lead">
                Step / Motion explores the passage of time through
                spaces designed for movement.
              </p>

              <p>
                Staircases represent bodily rhythm and memory,
                while elevators and escalators introduce mechanical,
                continuous motion. Repetition, montage, blur and
                spatial distortion allow different moments to appear
                to coexist within the same frame.
              </p>
            </div>

            <figure class="sm-concept-image sm-concept-a">
              <img
                src="${base}/film/1.png"
                alt="People moving across a staircase"
              >
            </figure>

            <figure class="sm-concept-image sm-concept-b">
              <img
                src="${base}/film/2.png"
                alt="People travelling through an escalator"
              >
            </figure>
          </div>
        </div>
      </section>


      <!-- FILM -->
      <section class="sm-dark sm-film" id="sm-film">

        <div class="shell">

          <div class="sm-section-head sm-section-head-light">
            <span>02</span>
            <h2>CONSTRUCTING THE FILM</h2>
          </div>

          <div class="sm-film-swipe-intro">

            <p>
              Five frames trace the film's movement from bodily rhythm
              through mechanical repetition, spatial disruption and
              layered temporal space.
            </p>

            <div class="sm-film-swipe-controls">

              <button
                type="button"
                data-sm-swipe-prev
                aria-label="Previous frame"
              >←</button>

              <span>SWIPE / DRAG</span>

              <button
                type="button"
                data-sm-swipe-next
                aria-label="Next frame"
              >→</button>

            </div>

          </div>

        </div>


        <div class="sm-film-swipe" data-sm-swipe>


          <!-- 01 -->
          <article class="sm-film-slide">

            <figure>
              <img
                src="${base}/film/1.png"
                alt="People moving across a staircase"
              >
            </figure>

            <div class="sm-film-slide-caption">

              <span>01</span>

              <div>
                <h3>HUMAN RHYTHM</h3>

                <p>
                  The staircase records movement at a human pace.
                  Different bodies cross the same structure independently,
                  creating uneven rhythms of arrival and departure.
                </p>

                <small>
                  STAIRCASE / BODY / DURATION
                </small>
              </div>

            </div>

          </article>


          <!-- 02 -->
          <article class="sm-film-slide">

            <figure>
              <img
                src="${base}/film/2.png"
                alt="People travelling on an escalator"
              >
            </figure>

            <div class="sm-film-slide-caption">

              <span>02</span>

              <div>
                <h3>MECHANICAL RHYTHM</h3>

                <p>
                  The escalator replaces individual pacing with continuous
                  mechanical movement. Figures blur while the architecture
                  carries them steadily through the frame.
                </p>

                <small>
                  ESCALATOR / CONTINUITY / REPETITION
                </small>
              </div>

            </div>

          </article>


          <!-- 03 -->
          <article class="sm-film-slide">

            <figure>
              <img
                src="${base}/film/3.png"
                alt="Rotated escalator structure with diagonal yellow lines"
              >
            </figure>

            <div class="sm-film-slide-caption">

              <span>03</span>

              <div>
                <h3>SHIFTED SPACE</h3>

                <p>
                  Rotation breaks the expected direction of the escalator.
                  Rails, steps and yellow markings become graphic lines,
                  making the familiar space feel unstable.
                </p>

                <small>
                  ROTATION / ANGLE / DISORIENTATION
                </small>
              </div>

            </div>

          </article>


          <!-- 04 -->
          <article class="sm-film-slide">

            <figure>
              <img
                src="${base}/film/4.png"
                alt="Multiple escalator structures layered across the frame"
              >
            </figure>

            <div class="sm-film-slide-caption">

              <span>04</span>

              <div>
                <h3>LAYERED TIME</h3>

                <p>
                  Multiple escalator planes overlap within one image.
                  Separate moments are compressed together, allowing
                  movement and architecture to coexist simultaneously.
                </p>

                <small>
                  OVERLAP / MONTAGE / TEMPORAL LAYERS
                </small>
              </div>

            </div>

          </article>


          <!-- 05 -->
          <article class="sm-film-slide">

            <figure>
              <img
                src="${base}/film/5.png"
                alt="Dark staircase crossed by a diagonal handrail"
              >
            </figure>

            <div class="sm-film-slide-caption">

              <span>05</span>

              <div>
                <h3>PAUSE</h3>

                <p>
                  The final frame returns to the staircase in darkness.
                  The diagonal handrail holds the direction of movement
                  while the sequence slows into a quieter pause.
                </p>

                <small>
                  STAIRCASE / SHADOW / STILLNESS
                </small>
              </div>

            </div>

          </article>


        </div>


        <div class="shell sm-film-swipe-bottom">

          <div class="sm-film-swipe-progress" aria-hidden="true">
            <span class="is-active"></span>
            <span></span>
            <span></span>
            <span></span>
            <span></span>
          </div>

          <span class="sm-film-slide-count">
            <b data-sm-current-slide>01</b> / 05
          </span>

        </div>

      </section>


      <!-- AFTER EFFECTS PROCESS -->
      
<section class="sm-refine-temporal">

  <div class="sm-rf-head">
    <div class="sm-rf-number">03</div>

    <div class="sm-rf-heading">
      <h2>TEMPORAL COMPOSITING</h2>
    </div>
  </div>

  <div class="sm-rf-rule"></div>

  <div class="sm-rf-intro">
    <p class="sm-rf-lead">
      Motion is constructed through temporal layering,
      keyframes and controlled distortion.
    </p>

    <p class="sm-rf-copy">
      The process moves between footage treatment and structural editing:
      long-exposure trails stretch a single moment, while rotation, scale
      and spatial transforms destabilise the strict verticality of escalators.
    </p>
  </div>


  <div class="sm-rf-feature">

    <figure class="sm-rf-feature-media">
      <img
        src="${base}/film process/Comp 1495.png"
        alt="Temporal compositing experiment showing overlapping traces of movement"
      >
    </figure>

    <div class="sm-rf-feature-note">
      <span>AFTER EFFECTS</span>

      <h3>CC WIDE TIME</h3>

      <p>
        Temporal accumulation turns individual bodies
        into overlapping traces of movement.
      </p>
    </div>

  </div>


  <div class="sm-rf-process-grid">

    <figure class="sm-rf-process-card">
      <figcaption>
        <span>LONG EXPOSURE TRAIL</span>
        <span>TIME / LAYERS / COMPOSITING</span>
      </figcaption>

      <img
        src="${base}/film process/Film footage timeline_Long Exposure Trail.png"
        alt="After Effects timeline showing long exposure trail process"
      >
    </figure>


    <figure class="sm-rf-process-card">
      <figcaption>
        <span>ROLL MOVEMENT</span>
        <span>POSITION / SCALE / ROTATION</span>
      </figcaption>

      <img
        src="${base}/film process/Film footage timeline_Tilt Effect.png"
        alt="After Effects interface showing position scale and rotation transforms"
      >
    </figure>

  </div>

</section>



      <!-- SOUND -->
      
<section class="sm-refine-sound">

  <div class="sm-sound-head">

    <div class="sm-rf-number">04</div>

    <div class="sm-rf-heading">
      <h2>SOUND AS TIME</h2>
    </div>

  </div>

  <div class="sm-sound-rule"></div>


  <div class="sm-sound-intro">

    <div class="sm-sound-words" aria-label="Sound sources">
      <span>WHITE NOISE</span>
      <span>STEP</span>
      <span>FLASHBACK</span>
    </div>


    <div class="sm-sound-copy">

      <div class="sm-sound-small">SOUND COMPOSITION</div>

      <p>
        Environmental recordings, mechanical white noise and recurring
        sound motifs are layered rather than treated as continuous
        background music.
      </p>

      <p>
        Changes in volume and density become part of the film's
        temporal structure.
      </p>

    </div>

  </div>


  <figure class="sm-sound-timeline">

    <figcaption>
      <span>PREMIERE PRO</span>
      <span>VOLUME / DENSITY / REPETITION</span>
    </figcaption>

    <img
      src="${base}/film process/Sound file timeline.png"
      alt="Premiere Pro audio timeline showing layered environmental sound"
    >

  </figure>

</section>



      <!-- FINAL FILM -->
      <section class="sm-final-film">
        <div class="shell">

          <div class="sm-section-head sm-section-head-light">
            <span>05</span>
            <h2>FINAL FILM</h2>
          </div>

          <div class="sm-video-stage">
            <video
              src="${base}/Film_Final.mp4"
              controls
              playsinline
              preload="metadata"
              poster="${base}/Cover.png"
            ></video>

            <div class="sm-video-meta">
              <span>STEP / MOTION</span>
              <span>FILM · 2026</span>
            </div>
          </div>

        </div>
      </section>


      <!-- TRANSITION -->
      <section class="sm-transition">
        <div class="shell sm-transition-inner">
          <span></span>

          <div>
            <strong>FILM</strong>
            <i>→</i>
            <strong>BOOK</strong>
          </div>

          <p>
            
          </p>
        </div>
      </section>


      <!-- SEQUENCE -->
      
<section class="sm-sequence-section sm-case-section" data-sm-book-sequence>

  <div class="sm-sequence-head sm-case-head">
    <span class="sm-sequence-number">06</span>

    <h2 class="sm-case-title">MOVEMENT BECOMES SEQUENCE</h2>
  </div>

  <div class="sm-sequence-rule sm-case-rule"></div>

  <div class="sm-sequence-intro sm-case-content">
    <p class="sm-sequence-lead">
      A moving body becomes a series of stills.
      A series of stills becomes a page rhythm.
    </p>

    <span class="sm-sequence-meta">
      FRAME / TRACE / REPEAT
    </span>
  </div>


  <div class="sm-stopmotion">

    <div class="sm-stopmotion-stage">

      <button
        class="sm-stopmotion-arrow sm-stopmotion-prev"
        type="button"
        data-sm-book-prev
        aria-label="Previous frame">
        ←
      </button>

      <div class="sm-stopmotion-frame">

        <img
          data-sm-book-frame
          src="${base}/book-sequence-fixed/Still_010000.png"
          alt="Sequential human movement study"
        >

      </div>

      <button
        class="sm-stopmotion-arrow sm-stopmotion-next"
        type="button"
        data-sm-book-next
        aria-label="Next frame">
        →
      </button>

    </div>


    <div class="sm-stopmotion-controls">

      <button
        class="sm-stopmotion-play"
        type="button"
        data-sm-book-play
        aria-label="Pause animation">
        II
      </button>

      <div class="sm-stopmotion-progress">
        <div class="sm-stopmotion-track">
          <span data-sm-book-progress></span>
        </div>

        <span class="sm-stopmotion-count">
          <span data-sm-book-current>01</span>
          /
          <span data-sm-book-total>11</span>
        </span>
      </div>

    </div>


    <div class="sm-stopmotion-caption">

      <span>PAGE SEQUENCE</span>

      <p>
        The figure moves through the book one frame at a time.
        Turning the page becomes an act of movement.
      </p>

    </div>

  </div>

</section>

<section class="sm-material-digital sm-material">

  <div class="sm-di-shell">

    <!-- ===================================================
         HEADER
         =================================================== -->

    <header class="sm-di-header">

      <div class="sm-di-title">

        <span class="sm-di-number">
          07
        </span>

        <div>
          <span class="sm-di-kicker">
            MATERIAL → IMAGE
          </span>

          <h2>
            DIGITAL IMAGING
          </h2>
        </div>

      </div>

    </header>


    <div class="sm-di-rule"></div>



    <!-- ===================================================
         SOURCE / BASE IMAGE
         =================================================== -->

    



    <!-- ===================================================
         SIX DIGITAL STUDIES
         =================================================== -->

    <div class="sm-di-study-head">

      <span>
        DIGITAL TRANSFORMATIONS
      </span>

      <p>
        Six treatments test how the same architectural image
        can shift between photographic detail, tonal field,
        edge, texture and printable graphic form.
      </p>

    </div>


    <div class="sm-di-grid">

      


      


      


      


      


      

    
<figure class="sm-di-frame">
        <div class="sm-di-image">
          <img
            src="${base}/book%20process/colour_01.png"
            alt="Digital staircase study 01"
            loading="lazy"
          >
        </div>

        <figcaption>
          <span>01</span>
          <span>PRINT</span>
        </figcaption>
      </figure>
<figure class="sm-di-frame">
        <div class="sm-di-image">
          <img
            src="${base}/book%20process/colour_02.png"
            alt="Digital staircase study 02"
            loading="lazy"
          >
        </div>

        <figcaption>
          <span>02</span>
          <span>THRESHOLD</span>
        </figcaption>
      </figure>
<figure class="sm-di-frame">
        <div class="sm-di-image">
          <img
            src="${base}/book%20process/colour_03.png"
            alt="Digital staircase study 03"
            loading="lazy"
          >
        </div>

        <figcaption>
          <span>03</span>
          <span>TONAL FIELD</span>
        </figcaption>
      </figure>
<figure class="sm-di-frame">
        <div class="sm-di-image">
          <img
            src="${base}/book%20process/colour_05.png"
            alt="Digital staircase study 05"
            loading="lazy"
          >
        </div>

        <figcaption>
          <span>04</span>
          <span>SEPARATION</span>
        </figcaption>
      </figure>
<figure class="sm-di-frame">
        <div class="sm-di-image">
          <img
            src="${base}/book%20process/colour_06.png"
            alt="Digital staircase study 06"
            loading="lazy"
          >
        </div>

        <figcaption>
          <span>05</span>
          <span>RELIEF</span>
        </figcaption>
      </figure>
<figure class="sm-di-frame">
        <div class="sm-di-image">
          <img
            src="${base}/book%20process/colour_04.png"
            alt="Digital staircase study 04"
            loading="lazy"
          >
        </div>

        <figcaption>
          <span>06</span>
          <span>CONTRAST</span>
        </figcaption>
      </figure>
</div>



    <!-- ===================================================
         PRINT CONNECTION
         =================================================== -->
</div>

  </div>

</section>






      <!-- BOOK INTRO -->
      <section class="sm-book-intro sm-case-section">
        <div class="shell">

          <div class="sm-section-head">
            <span>08</span>
            <h2 class="sm-case-title">STEP / MOTION</h2>
          </div>

          <div class="sm-case-rule"></div>
<div class="sm-book-intro-grid sm-case-content">
            <div>
              <h3>STEP</h3>
              <p>
                Old staircases, bodily movement and the physical
                cadence of ascending and descending.
              </p>
            </div>

            <figure>
              <img
                src="${base}/book/IMG_2116%202.png"
                alt="Step Motion book open"
              >
            </figure>

            <div>
              <h3>MOTION</h3>
              <p>
                Elevators, escalators and mechanical movement
                translated through repetition and sequential pages.
              </p>
            </div>
          </div>

        </div>
      </section>


      <!-- TRANSPARENCY -->
      
<section class="sm-chapter-flow" data-sm-chapter-flow>

  <div class="sm-chapter-flow-head">

    <div>
      <span class="sm-chapter-flow-kicker">
        BOOK SEQUENCE
      </span>

      <h3>
        Two books.<br>
        Six chapters.
      </h3>
    </div>

    <p>
      STEP and MOTION develop in parallel. Each chapter shifts
      the rhythm of image, transparency and sequence, translating
      movement into a physical reading experience.
    </p>

  </div>


  <div class="sm-chapter-flow-rule"></div>


  <div class="sm-chapter-flow-stage">

    <!-- STEP -->
    <article class="sm-chapter-volume sm-chapter-step">

      <header>
        <span>STEP</span>

        <small data-sm-step-count>
          01 / 03
        </small>
      </header>


      <div class="sm-chapter-viewport">

        <figure
          class="sm-chapter-frame is-active"
          data-sm-step-frame>

          <img
            src="${base}/book/IMG_1902.png"
            alt="STEP book chapter 1">

          <figcaption>
            CHAPTER 01
          </figcaption>

        </figure>

      </div>


      <div class="sm-chapter-progress"
           aria-hidden="true">

        <button class="is-active"
                data-sm-step-dot="0"></button>

        <button data-sm-step-dot="1"></button>

        <button data-sm-step-dot="2"></button>

      </div>

    </article>



    <div class="sm-chapter-divider"
         aria-hidden="true">
      <span></span>
    </div>



    <!-- MOTION -->
    <article class="sm-chapter-volume sm-chapter-motion">

      <header>
        <span>MOTION</span>

        <small data-sm-motion-count>
          01 / 03
        </small>
      </header>


      <div class="sm-chapter-viewport">

        <figure
          class="sm-chapter-frame is-active"
          data-sm-motion-frame>

          <img
            src="${base}/book/IMG_1927.png"
            alt="MOTION book chapter 1">

          <figcaption>
            CHAPTER 01
          </figcaption>

        </figure>

      </div>


      <div class="sm-chapter-progress"
           aria-hidden="true">

        <button class="is-active"
                data-sm-motion-dot="0"></button>

        <button data-sm-motion-dot="1"></button>

        <button data-sm-motion-dot="2"></button>

      </div>

    </article>

  </div>


  <div class="sm-chapter-flow-controls">

    <button type="button"
            data-sm-chapter-prev
            aria-label="Previous chapter">
      ←
    </button>

    <span>
      CHAPTER
      <strong data-sm-chapter-current>01</strong>
      / 03
    </span>

    <button type="button"
            data-sm-chapter-next
            aria-label="Next chapter">
      →
    </button>

  </div>

</section>



      <!-- MATERIAL -->
      


      <!-- CAPABILITIES -->
      <section class="sm-capability-section">
        <div class="shell">

          <div class="sm-section-head sm-section-head-light">
            <span>09</span>
            <h2>PROCESS / TOOLS</h2>
          </div>

          <div class="sm-capability-grid">

            <div>
              <span>01</span>
              <h3>AFTER EFFECTS</h3>
              <p>
                CC Wide Time<br>
                Masking &amp; compositing<br>
                Position / scale / rotation<br>
                Temporal distortion
              </p>
            </div>

            <div>
              <span>02</span>
              <h3>EDITING / SOUND</h3>
              <p>
                Montage<br>
                Multi-layer sequencing<br>
                Environmental recording<br>
                Volume transitions
              </p>
            </div>

            <div>
              <span>03</span>
              <h3>PHOTOSHOP</h3>
              <p>
                Scanned image treatment<br>
                Tonal adjustment<br>
                Texture variation<br>
                Frame preparation
              </p>
            </div>

            <div>
              <span>04</span>
              <h3>EDITORIAL / BOOK</h3>
              <p>
                Page sequencing<br>
                Transparent overlays<br>
                Physical binding<br>
                Print production
              </p>
            </div>

          </div>

        </div>
      </section>


      <!-- END -->
      <section class="sm-ending">
        <figure class="sm-ending-image">
          <img
            src="${base}/book/IMG_1987.jpg"
            alt="Final Step Motion book"
          >
        </figure>

        <div class="sm-ending-shade"></div>

        <div class="shell sm-ending-inner">
          <div class="sm-ending-title">
            <span>STEP</span>
            <span>/ MOTION</span>
          </div>

          <div class="sm-ending-foot">
            <p>
              A movement becomes an image.<br>
              An image becomes a sequence.
            </p>

            <span>2026</span>
          </div>
        </div>
      </section>

    </article>
  `;
}


function renderModularTypefaceV2(p,projects){

  const A="/public/projects/modular-typeface";

  const src=path=>
    `${A}/${path.split("/").map(encodeURIComponent).join("/")}`;

  const pic=(path,alt="",cls="")=>
    `<img
      ${cls ? `class="${cls}"` : ""}
      src="${src(path)}"
      alt="${esc(alt)}"
      loading="lazy"
      decoding="async"
    >`;

  const next=
    projects[(projects.indexOf(p)+1)%projects.length];

  const letters=
    "ABCDEFGHIJKLMNOPQRSTUVWXYZ".split("");

  const numbers=
    "0123456789".split("");

  const modules=
    ["01","02","03","04","05","06"];

  const heroWord=word=>
    `<div class="mt2-word mt2-word-${word.toLowerCase()}">
      ${word.split("").map((ch,i)=>`
        <span class="mt2-hero-glyph" style="--i:${i}">
          ${pic(`alphabet/${ch}.svg`,ch)}
        </span>
      `).join("")}
    </div>`;

  const glyph=ch=>
    `<button class="mt2-glyph" type="button" data-char="${ch}">
      <span class="mt2-glyph-char">
        ${pic(`alphabet/${ch}.svg`,ch)}
      </span>
      <span class="mt2-glyph-label">${ch}</span>
    </button>`;

  document.body.classList.add(
    "compact-brand",
    "project-modular-typeface"
  );

  document.documentElement.style.setProperty(
    "--project-accent",
    "#E93D9A"
  );

  document.documentElement.style.setProperty(
    "--project-secondary",
    "#F5F3EE"
  );

  document.title="Modular Typeface — Iris Wang";

  document.body.insertAdjacentHTML(
    "afterbegin",
    header()+
    `<div class="reading-progress" id="progress"></div>`
  );

  document.querySelector("#project-root").innerHTML=`

    <article class="mt2">

      <!-- HERO -->
      <section class="mt2-hero" id="mt2-1">

        <div class="mt2-grid" aria-hidden="true"></div>

        <div class="shell mt2-hero-inner">

          <div class="mt2-meta">
            TYPE DESIGN · MODULAR SYSTEM · 2025
          </div>

          <div class="mt2-hero-type"
               aria-label="Modular Typeface">

            ${heroWord("MODULAR")}
            ${heroWord("TYPEFACE")}

          </div>

          <div class="mt2-hero-foot">

            <p>
              A modular display typeface constructed from six
              repeatable forms, expanding a restricted geometric
              system into a complete alphabet, numerals and
              graphic applications.
            </p>

            <span>A–Z / 0–9</span>

          </div>

        </div>

        <div class="mt2-module-cloud"
             aria-hidden="true">

          ${modules.map((n,i)=>`
            <div class="mt2-float mt2-float-${i+1}">
              ${pic(`modulars/${n}.svg`,"")}
            </div>
          `).join("")}

        </div>

      </section>


      <!-- 01 SYSTEM -->
      <section class="mt2-section mt2-system"
               id="mt2-2">

        <div class="shell">

          <header class="mt2-head">

            <div>
              <span class="mt2-label">
                01 — MODULAR SYSTEM
              </span>

              <h2>
                Six modules.<br>
                One language.
              </h2>
            </div>

            <p>
              The alphabet begins with six curved and pointed
              components. Rotation, reflection and combination
              allow the same limited toolkit to generate
              recognisable but expressive letterforms.
            </p>

          </header>

          <div class="mt2-modules">

            ${modules.map((n,i)=>`
              <article class="mt2-module">

                <span>
                  ${String(i+1).padStart(2,"0")}
                </span>

                <div>
                  ${pic(
                    `modulars/${n}.svg`,
                    `Modular component ${i+1}`
                  )}
                </div>

                <small>
                  MODULE ${String(i+1).padStart(2,"0")}
                </small>

              </article>
            `).join("")}

            </div>

          </div>

        </div>

      </section>


      <!-- 02 DEVELOPMENT -->
      <section class="mt2-section mt2-development"
               id="mt2-3">

        <div class="shell">

          <header class="mt2-head">

            <div>
              <span class="mt2-label">
                02 — LETTER DEVELOPMENT
              </span>

              <h2>
                Built on<br>
                a grid.
              </h2>
            </div>

            <p>
              Early graph-paper studies established the
              proportions of the system. The modules are then
              assembled across different widths while retaining
              a consistent visual rhythm.
            </p>

          </header>

          <div class="mt2-dev-intro">

            <figure>
              ${pic(
                "development/development_01.png",
                "Early modular typeface development"
              )}
            </figure>

            <figure>
              ${pic(
                "development/development_02.png",
                "Modular typeface development"
              )}
            </figure>

          </div>

          <div class="mt2-dev-letters">

            ${["I","K","M","U"].map((ch,i)=>`
              <figure class="mt2-dev-card">

                <div class="mt2-dev-img">
                  ${pic(
                    `development/development_${ch}.png`,
                    `${ch} letter construction`
                  )}
                </div>

                <figcaption>
                  <span>
                    ${String(i+1).padStart(2,"0")}
                  </span>
                  <strong>${ch}</strong>
                </figcaption>

              </figure>
            `).join("")}

          </div>

        </div>

      </section>


      <!-- 03 ALPHABET -->
      <section class="mt2-alphabet"
               id="mt2-4">

        <div class="shell">

          <header class="mt2-alpha-head">

            <span class="mt2-label">
              03 — ALPHABET
            </span>

            <span class="mt2-label">
              26 LETTERS · 10 NUMERALS
            </span>

          </header>

          <div class="mt2-alpha-grid">
            ${letters.map(glyph).join("")}
          </div>

          <div class="mt2-number-grid">
            ${numbers.map(glyph).join("")}
          </div>

        </div>

      </section>


      <!-- 04 SPECIMEN -->
      <section class="mt2-specimen"
               id="mt2-5">

        <div class="mt2-specimen-head shell">

          <span class="mt2-label">
            04 — TYPE SPECIMEN
          </span>

          <p>
            Repetition reveals the rhythm of the system.
          </p>

        </div>

        <div class="mt2-strip">
          <div class="mt2-strip-track">
            ${["CYBERPUNK","MATRIX","SMOOTH","JAZZ"].map(
              word=>`
                <div class="mt2-strip-word">
                  ${word.split("").map(ch=>
                    pic(`alphabet/${ch}.svg`,ch)
                  ).join("")}
                </div>
              `
            ).join("")}

            ${["CYBERPUNK","MATRIX","SMOOTH","JAZZ"].map(
              word=>`
                <div class="mt2-strip-word"
                     aria-hidden="true">
                  ${word.split("").map(ch=>
                    pic(`alphabet/${ch}.svg`,"")
                  ).join("")}
                </div>
              `
            ).join("")}
          </div>
        </div>

      </section>


      <!-- 05 APPLICATION -->
      <section class="mt2-section mt2-apps"
               id="mt2-6">

        <div class="shell">

          <header class="mt2-head">

            <div>
              <span class="mt2-label">
                05 — APPLICATION
              </span>

              <h2>
                From screen<br>
                to object.
              </h2>
            </div>

            <p>
              The modular system extends beyond the alphabet
              into film titles, skateboard graphics, album
              artwork and metallic objects.
            </p>

          </header>


          <div class="mt2-film">

            <figure>
              ${pic(
                "application/film_1.png",
                "Film title application"
              )}
              <figcaption>
                FILM TITLE / 01
              </figcaption>
            </figure>

            <figure>
              ${pic(
                "application/film_2.png",
                "Film title application"
              )}
              <figcaption>
                FILM TITLE / 02
              </figcaption>
            </figure>

          </div>


          <div class="mt2-feature">

            <figure>
              ${pic(
                "application/Skateboard Mockup.png",
                "Skateboard typography application"
              )}
              <figcaption>
                SKATEBOARD APPLICATION
              </figcaption>
            </figure>

            <figure>
              ${pic(
                "application/Skateboard Zoom 1.png",
                "Skateboard typography detail"
              )}
              <figcaption>
                DETAIL / MODULAR LETTERFORMS
              </figcaption>
            </figure>

          </div>


          <div class="mt2-album">

            <figure class="mt2-album-hero">

              <div class="mt2-album-stage">

                ${pic(
                  "application/Album Background Image.png",
                  "Album cover background",
                  "mt2-album-bg"
                )}

                ${pic(
                  "application/Album Modular.png",
                  "3D modular album typography",
                  "mt2-album-modular"
                )}

                <div class="mt2-album-modular-layer" aria-hidden="true"></div>

              <div class="mt2-album-ui" aria-hidden="true">
                  <span>ALBUM COVER</span>
                  <span>3D INFLATE / MODULAR TYPE</span>
                </div>

              </div>

              <figcaption>
                ALBUM COVER / 3D INFLATE
              </figcaption>

            </figure>

            <div class="mt2-album-covers">

              ${[1,2,3,4].map(n=>`
                <figure>
                  ${pic(
                    `application/Artboard ${n}.png`,
                    `Album cover variation ${n}`
                  )}
                  <figcaption>
                    VERSION ${String(n).padStart(2,"0")}
                  </figcaption>
                </figure>
              `).join("")}

            </div>

          </div>



          <div class="mt2-jewelry-wrap">

            <div class="mt2-jewelry-head">
              <span class="mt2-label">
                LETTER JEWELLERY
              </span>

              <span class="mt2-label">
                TYPE IN THREE DIMENSIONS.
              </span>
            </div>

            <div class="mt2-jewelry">

            ${["01","02","03"].map((n,i)=>`
              <figure>

                ${pic(
                  `application/Necklace mockup_${n}.png`,
                  `Letter jewelry application ${i+1}`
                )}

                <figcaption>
                  LETTER JEWELRY /
                  ${String(i+1).padStart(2,"0")}
                </figcaption>

              </figure>
            `).join("")}

          </div>

        </div>

      </section>


      <!-- ENDING -->
      <section class="mt2-ending"
               id="mt2-7">

        <div class="mt2-grid"
             aria-hidden="true"></div>

        <div class="shell mt2-ending-inner">

          <span class="mt2-label">
            MODULAR TYPEFACE · 2025
          </span>

          <div class="mt2-ending-glyphs">
            ${pic("alphabet/M.svg","M")}
            ${pic("alphabet/T.svg","T")}
          </div>

        </div>

      </section>


      <!-- SIDE NAV -->
      <nav class="chapter-rail mt2-rail"
           aria-label="Modular Typeface sections">

        ${[
          ["mt2-1","Hero"],
          ["mt2-2","Modular system"],
          ["mt2-3","Letter development"],
          ["mt2-4","Alphabet"],
          ["mt2-5","Type specimen"],
          ["mt2-6","Applications"],
          ["mt2-7","Final"]
        ].map(([id,label])=>`
          <a href="#${id}"
             data-label="${label}"
             aria-label="${label}">
          </a>
        `).join("")}

      </nav>

      <div class="chapter-tip mt2-tip"
           id="mt2-tip"></div>


      <!-- SHARED NEXT PROJECT -->
      <a class="next-project mt2-next"
         href="/work/${next.slug}/">

        <span class="meta-mono">NEXT PROJECT</span>

        <br>

        ${esc(next.title)} →

      </a>

    </article>
  `;

  document.body.insertAdjacentHTML(
    "beforeend",
    footer()
  );


  /* progress */
  const progress=
    document.querySelector("#progress");

  const updateProgress=()=>{

    const h=
      document.documentElement.scrollHeight-innerHeight;

    progress.style.width=
      `${h ? scrollY/h*100 : 0}%`;
  };

  updateProgress();

  addEventListener(
    "scroll",
    updateProgress,
    {passive:true}
  );


  /* rail */
  const rail=[
    ...document.querySelectorAll(".mt2-rail a")
  ];

  const sections=
    rail.map(a=>
      document.querySelector(
        a.getAttribute("href")
      )
    );

  const tip=
    document.querySelector("#mt2-tip");

  rail.forEach(a=>{

    a.addEventListener(
      "mouseenter",
      ()=>{
        tip.textContent=a.dataset.label;
        tip.classList.add("visible");
      }
    );

    a.addEventListener(
      "mouseleave",
      ()=>tip.classList.remove("visible")
    );

  });

  const observer=
    new IntersectionObserver(
      entries=>{

        entries.forEach(entry=>{

          if(!entry.isIntersecting) return;

          const index=
            sections.indexOf(entry.target);

          rail.forEach(
            (a,i)=>
              a.classList.toggle(
                "active",
                i===index
              )
          );

        });

      },
      {
        rootMargin:
          "-42% 0px -48% 0px"
      }
    );

  sections.forEach(section=>{
    if(section) observer.observe(section);
  });


  /* album modular DOM animation */
  const mt2AlbumDomAnimation=
    document.querySelector(".mt2-album-modular-layer");

  if(
    mt2AlbumDomAnimation &&
    !matchMedia("(prefers-reduced-motion: reduce)").matches
  ){

    mt2AlbumDomAnimation.animate(
      [
        {
          transform:
            "translate(-50%, -50%) rotate(-3deg) scale(1)"
        },
        {
          transform:
            "translate(-47%, -55%) rotate(1.5deg) scale(1.07)"
        },
        {
          transform:
            "translate(-52%, -51%) rotate(3deg) scale(1.11)"
        },
        {
          transform:
            "translate(-49%, -54%) rotate(-1deg) scale(1.05)"
        },
        {
          transform:
            "translate(-50%, -50%) rotate(-3deg) scale(1)"
        }
      ],
      {
        duration:6500,
        iterations:Infinity,
        easing:"ease-in-out"
      }
    );

  }


  /* album parallax */
  const albumStage=
    document.querySelector(".mt2-album-stage");

  if(albumStage){

    albumStage.dataset.mt2AlbumParallaxReady="1";

    albumStage.addEventListener(
      "pointermove",
      e=>{

        const r=
          albumStage.getBoundingClientRect();

        albumStage.style.setProperty(
          "--album-x",
          ((e.clientX-r.left)/r.width)-.5
        );

        albumStage.style.setProperty(
          "--album-y",
          ((e.clientY-r.top)/r.height)-.5
        );

      }
    );

    albumStage.addEventListener(
      "pointerleave",
      ()=>{

        albumStage.style.setProperty("--album-x",0);
        albumStage.style.setProperty("--album-y",0);

      }
    );

  }

  const mt2AlbumParallaxReady=true;


  /* hero parallax */
  const hero=
    document.querySelector(".mt2-hero");

  if(hero){

    hero.addEventListener(
      "pointermove",
      e=>{

        const r=
          hero.getBoundingClientRect();

        hero.style.setProperty(
          "--mx",
          ((e.clientX-r.left)/r.width-.5)
        );

        hero.style.setProperty(
          "--my",
          ((e.clientY-r.top)/r.height-.5)
        );

      }
    );

    hero.addEventListener(
      "pointerleave",
      ()=>{
        hero.style.setProperty("--mx",0);
        hero.style.setProperty("--my",0);
      }
    );

  }

}






/* STEP MOTION HERO CAPTION BALANCE START */

function initStepMotionHeroCaptionBalance(){

  const hero =
    document.querySelector(".sm-hero");

  if(!hero) return;


  const kicker =
    hero.querySelector(".sm-kicker");

  const copy =
    hero.querySelector(".sm-hero-copy");


  /*
    Use the REAL title classes from the markup.
    Fall back to spans only if necessary.
  */

  const step =
    hero.querySelector(".sm-title-step") ||
    hero.querySelector(".sm-title > span:first-child");

  const motion =
    hero.querySelector(".sm-title-motion") ||
    hero.querySelector(".sm-title > span:last-child");


  if(
    !kicker ||
    !copy ||
    !step ||
    !motion
  ){
    console.warn(
      "[Step Motion] hero caption balance: elements missing"
    );

    return;
  }


  let raf = null;


  const sync = ()=>{

    cancelAnimationFrame(raf);

    raf = requestAnimationFrame(()=>{

      const heroRect =
        hero.getBoundingClientRect();

      const stepRect =
        step.getBoundingClientRect();

      const motionRect =
        motion.getBoundingClientRect();


      /*
        Same REAL visual gap above STEP
        and below MOTION.
      */

      const gap =
        window.innerWidth <= 760
          ? 18
          : 28;


      /*
        Kicker:
        bottom edge = STEP top - gap
      */

      const kickerTop =
        stepRect.top
        - heroRect.top
        - gap
        - kicker.offsetHeight;


      /*
        Description:
        top edge = MOTION bottom + gap
      */

      const copyTop =
        motionRect.bottom
        - heroRect.top
        + gap;


      kicker.style.top =
        `${Math.round(kickerTop)}px`;

      copy.style.top =
        `${Math.round(copyTop)}px`;

    });

  };


  sync();


  /*
    Video itself does not affect text geometry,
    but fonts + viewport width do.
  */

  if(document.fonts?.ready){
    document.fonts.ready.then(sync);
  }


  if("ResizeObserver" in window){

    const observer =
      new ResizeObserver(sync);

    observer.observe(hero);

  }
  else{

    window.addEventListener(
      "resize",
      sync,
      { passive:true }
    );

  }


  window.addEventListener(
    "resize",
    sync,
    { passive:true }
  );

}

/* STEP MOTION HERO CAPTION BALANCE END */


/* =========================================================
   STEP / MOTION — SHARED PROJECT CHROME
   chapter rail / next project / global footer
   ========================================================= */

function initStepMotionProjectChrome(){
  /*
   * Legacy controller disabled.
   * Step / Motion chrome is handled by CHROME V2 below.
   */
  return;
}


function ensureStepMotionEndMatter(p, projects){

  const article = document.querySelector(".sm-page");
  if(!article) return;


  /* -------------------------------------------------------
     NEXT PROJECT
     ------------------------------------------------------- */

  if(!article.querySelector(".sm-next-project")){

    const currentIndex = projects.findIndex(
      project => project.slug === p.slug
    );

    const nextProject =
      projects[(currentIndex + 1) % projects.length];

    if(nextProject){

      article.insertAdjacentHTML(
        "beforeend",
        `
        <a
          class="next-project sm-next-project"
          href="/work/${nextProject.slug}/">

          <span class="meta-mono next-project-label">
            NEXT PROJECT
          </span>

          <span class="sm-next-project-title next-project-title">
            ${esc(nextProject.title)}
          </span>

          <span class="sm-next-project-arrow next-project-arrow">
            →
          </span>

        </a>
        `
      );

    }
  }


  /* -------------------------------------------------------
     SHARED SITE FOOTER
     ------------------------------------------------------- */

  const alreadyHasFooter =
    document.querySelector(
      "body > footer, body > .site-footer, .sm-page + footer"
    );

  if(!alreadyHasFooter){

    if(typeof footer === "function"){

      document.body.insertAdjacentHTML(
        "beforeend",
        footer()
      );

    }

  }
}



/* =========================================================
   AUSTRALIAN LIGHT
   ========================================================= */

function renderAustralianLight(project){

  const base = "/public/projects/australian-light";

  return `
    <article class="al-page">

      <!-- HERO -->
      <section class="al-hero" id="al-hero">
        <div class="al-shell al-hero-inner">

          <div class="al-hero-copy">
            <div class="al-hero-kicker">
              UI/UX · E-COMMERCE · FRONT-END · 2026
            </div>

            <h1>
              AUSTRALIAN<br>
              LIGHT
            </h1>

            <p class="al-hero-lead">
              Transforming a static Australian landscape photography gallery
              into a responsive, structured and functional e-commerce experience.
            </p>
          </div>

          <div class="al-hero-visual">
            <div class="al-hero-frame">
              <img
                src="${base}/hero/hero-desktop.png"
                alt="Australian Light final website homepage"
              >
            </div>
          </div>

        </div>

        <div class="al-meta">
          <div>
            <b>Context</b>
            <span>Academic · UI Development</span>
          </div>

          <div>
            <b>Role</b>
            <span>UX research · UI design · prototyping · front-end implementation</span>
          </div>

          <div>
            <b>Tools</b>
            <span>Figma · HTML · CSS · JavaScript</span>
          </div>

          <div>
            <b>Year</b>
            <span>2026</span>
          </div>
        </div>
      </section>


      <!-- 01 PROBLEM -->
      <section class="al-section al-problem" id="al-section-1">
        <div class="al-shell">

          <div class="al-section-head">
            <span class="al-section-no">01</span>
            <h2>FROM GALLERY<br>TO COMMERCE</h2>
          </div>

          <div class="al-rule"></div>

          <div class="al-problem-intro">
            <p class="al-copy">
              Strong photography was already present.
              The missing layer was a clear path from
              discovery to purchase.
            </p>

            <p>
              The original Australian Light website behaved primarily
              as a static photography gallery. The redesign reframed it
              as a responsive commerce experience without losing the
              atmosphere of the photographic work.
            </p>
          </div>

          <div class="al-issues">

            <article class="al-issue">
              <span>01 / DISCOVERY</span>
              <h3>Fragmented browsing</h3>
              <p>
                Limited search, filtering and category guidance made it
                difficult to move efficiently through the photography archive.
              </p>
            </article>

            <article class="al-issue">
              <span>02 / PRODUCT</span>
              <h3>Hidden purchase intent</h3>
              <p>
                Product information and primary actions lacked a clear
                hierarchy, weakening the transition from viewing to buying.
              </p>
            </article>

            <article class="al-issue">
              <span>03 / RESPONSIVE</span>
              <h3>Desktop-first structure</h3>
              <p>
                Smaller screens inherited rigid desktop layouts, creating
                cropping, overflow and inconsistent reading order.
              </p>
            </article>

          </div>

          <div class="al-audit">
            <div class="al-audit-head">
              <span class="al-eyebrow">ORIGINAL WEBSITE / AUDIT</span>

              <p>
                The visual material was strong, but the interface offered
                limited support for product discovery, comparison and purchase.
              </p>
            </div>

            <div class="al-audit-viewer" data-al-audit>

              <div class="al-audit-tabs">

                ${[
                  ["01","HOMEPAGE",
                    "research/screencapture-australianlight-au-2026-03-11-13_15_47.png"],

                  ["02","PRODUCT DISCOVERY",
                    "research/screencapture-australianlight-au-galleries-latest-releases-2026-03-11-13_16_52.png"],

                  ["03","PRODUCT DETAIL",
                    "research/screencapture-australianlight-au-galleries-latest-releases-fire-and-rain-2026-03-11-13_17_16.png"],

                  ["04","CART",
                    "research/screencapture-australianlight-au-cart-2026-03-11-13_18_26.png"]
                ].map((item,index)=>`
                  <button
                    class="al-audit-tab ${index===0 ? "is-active" : ""}"
                    type="button"
                    data-al-audit-src="${base}/${item[2]}"
                    data-al-audit-number="${item[0]}"
                    data-al-audit-label="${item[1]}">

                    <span>${item[0]}</span>
                    <span>${item[1]}</span>

                  </button>
                `).join("")}

              </div>

              <div
                class="al-audit-stage"
                data-al-audit-stage>

                <img
                  src="${base}/research/screencapture-australianlight-au-2026-03-11-13_15_47.png"
                  alt="Original Australian Light website"
                  data-al-audit-image
                >

                <div class="al-audit-stage-label">
                  <span data-al-audit-number>01</span>
                  <span data-al-audit-label>HOMEPAGE</span>
                </div>

              </div>

            </div>

          </div>

        </div>
      </section>


      <!-- 02 RESEARCH -->
      <section class="al-section al-research" id="al-section-2">
        <div class="al-shell">

          <div class="al-section-head">
            <span class="al-section-no">02</span>
            <h2>RESEARCH<br>SETS THE SYSTEM</h2>
          </div>

          <div class="al-rule"></div>

          <div class="al-research-grid">

            <p class="al-research-statement">
              Competitor analysis shifted the project from
              “make it more beautiful” to “make every action clearer”.
            </p>

            <div class="al-findings">

              <div class="al-finding">
                <b>Navigation</b>
                <span>Persistent pathways and visible hierarchy reduce uncertainty.</span>
              </div>

              <div class="al-finding">
                <b>Discovery</b>
                <span>Search, category, filter and sort controls need to work together.</span>
              </div>

              <div class="al-finding">
                <b>Product</b>
                <span>Photography stays dominant while price, format and CTA remain immediately legible.</span>
              </div>

              <div class="al-finding">
                <b>Responsive</b>
                <span>Content should recompose rather than simply shrink.</span>
              </div>

            </div>

          </div>

        </div>
      </section>


      <!-- 03 PROCESS -->
      <section class="al-section al-process" id="al-section-3">
        <div class="al-shell">

          <div class="al-section-head">
            <span class="al-section-no">03</span>
            <h2>FROM SKETCH<br>TO INTERFACE</h2>
          </div>

          <div class="al-rule"></div>

          <div class="al-process-track">
            <div class="al-process-step">
              <strong>Sketch</strong>
              <span>01 / divergent layouts</span>
            </div>

            <div class="al-process-step">
              <strong>Low fidelity</strong>
              <span>02 / structure + flow</span>
            </div>

            <div class="al-process-step">
              <strong>Art direction</strong>
              <span>03 / visual identity</span>
            </div>

            <div class="al-process-step">
              <strong>High fidelity</strong>
              <span>04 / responsive product</span>
            </div>
          </div>

          <div class="al-process-ui" data-al-process>

            <div class="al-process-nav">

              ${[
                ["01","SKETCH / HOMEPAGE","process/sketch_1.PNG"],
                ["02","SKETCH / SEARCH","process/sketch_2.PNG"],
                ["03","SKETCH / PRODUCT","process/sketch_3.PNG"],
                ["04","SKETCH / CHECKOUT","process/sketch_4.PNG"],

                ["05","LOW-FI / HOMEPAGE","process/lowfi-Homepage.svg"],
                ["06","LOW-FI / SIDE NAV","process/lowfi-Homepage_Side Navigation.svg"],
                ["07","LOW-FI / SEARCH","process/lowfi-Search Engine.svg"],
                ["08","LOW-FI / RESULTS","process/lowfi-Search Result.svg"],
                ["09","LOW-FI / PRODUCT LIST","process/lowfi-Product List_Filter.svg"],
                ["10","LOW-FI / PRODUCT DETAIL","process/lowfi-Product Detail.svg"],
                ["11","LOW-FI / CART","process/lowfi-Cart.svg"],
                ["12","LOW-FI / CHECKOUT","process/lowfi-Cart_Info.svg"],
                ["13","LOW-FI / PAYMENT","process/lowfi-Cart_Pay_01.svg"]
              ].map((item,index)=>`
                <button
                  type="button"
                  class="al-process-button ${index===0 ? "is-active" : ""}"
                  data-al-process-src="${base}/${item[2]}"
                  data-al-process-index="${item[0]}"
                  data-al-process-label="${item[1]}">

                  <small>${item[0]}</small>
                  <span>${item[1]}</span>

                </button>
              `).join("")}

            </div>

            <div class="al-process-stage-wrap">

              <div class="al-process-stage-meta">
                <span data-al-process-index>01</span>
                <span data-al-process-label>SKETCH / HOMEPAGE</span>
              </div>

              <div class="al-process-stage">

                <img
                  src="${base}/process/sketch_1.PNG"
                  alt="Australian Light design process"
                  data-al-process-image
                >

              </div>

              <div class="al-process-thumbs">

                ${[
                  ["01","process/sketch_1.PNG"],
                  ["02","process/sketch_2.PNG"],
                  ["03","process/sketch_3.PNG"],
                  ["04","process/sketch_4.PNG"],
                  ["05","process/lowfi-Homepage.svg"],
                  ["06","process/lowfi-Search Engine.svg"]
                ].map((item,index)=>`
                  <button
                    type="button"
                    class="al-process-thumb ${index===0 ? "is-active" : ""}"
                    data-al-process-thumb="${item[0]}">

                    <img
                      src="${base}/${item[1]}"
                      alt=""
                    >

                  </button>
                `).join("")}

              </div>

            </div>

          </div>

        </div>
      </section>


      <!-- 04 DIRECTION -->
      <section class="al-section al-direction" id="al-section-4">
        <div class="al-shell">

          <div class="al-section-head">
            <span class="al-section-no">04</span>
            <h2>SIGNATURE<br>VISUAL SYSTEM</h2>
          </div>

          <div class="al-rule"></div>

          <div class="al-direction-layout">

            <div>
              <span class="al-eyebrow">
                SELECTED DIRECTION / FINAL
              </span>

              <p class="al-copy">
                A restrained black, warm-white and muted-gold palette
                gives the photography visual authority while creating
                a premium e-commerce atmosphere.
              </p>

              <div class="al-palette">
                <div class="al-swatch" style="background:#F8F6F0">#F8F6F0</div>
                <div class="al-swatch" style="background:#A48F6E;color:white">#A48F6E</div>
                <div class="al-swatch" style="background:#2C2C2C;color:white">#2C2C2C</div>
                <div class="al-swatch" style="background:#111112;color:white">#111112</div>
              </div>

              <div class="al-type-sample">
                <p class="al-type-display">Australian Light</p>
                <p class="al-type-body">Canela + Avenir</p>
              </div>
            </div>

            <div class="al-direction-media">



            
            <figure class="al-direction-mobile">

              <div class="al-direction-phone-screen">

                <div
                  class="al-mobile-browser-bar"
                  aria-hidden="true"
                >
                  <div class="al-mobile-browser-controls">
                    <span></span>
                    <span></span>
                    <span></span>
                  </div>

                  <div class="al-mobile-browser-url">
                    australianlight
                  </div>

                  <div class="al-mobile-browser-menu">
                    ⋯
                  </div>
                </div>

                <div class="al-mobile-scroll">
                  <img
                    src="${base}/final/Mobile - Homepage_01.png"
                  alt="Scrollable Australian Light mobile homepage"
                  >
                </div>

              </div>

            </figure>

            <figcaption class="al-direction-mobile-caption">
              MOBILE HOMEPAGE · SCROLL TO EXPLORE
            </figcaption>


          </div>

        </div>
      </section>


      <!-- 05 FLOW -->
      <section class="al-section al-flow" id="al-section-5">
        <div class="al-shell">

          <div class="al-section-head">
            <span class="al-section-no">05</span>
            <h2>ONE CONTINUOUS<br>SHOPPING FLOW</h2>
          </div>

          <div class="al-rule"></div>

          <div class="al-flow-rail">

            ${[
              [
                "01",
                "SEARCH",
                "Search history + suggested products",
                "final/Desktop - Search_02.png"
              ],
              [
                "02",
                "DISCOVER",
                "Filtering, sorting and responsive product grids",
                "final/Desktop - Product List_02.png"
              ],
              [
                "03",
                "SELECT",
                "Style, size, pricing and product information",
                "final/Desktop - Product Detail_02.png"
              ],
              [
                "04",
                "CART",
                "Persistent products and editable quantity",
                "final/Desktop - Cart.png"
              ],
              [
                "05",
                "CHECKOUT",
                "Validated contact, shipping and payment progression",
                "final/Desktop - Cart_Pay.png"
              ],
              [
                "06",
                "CONFIRM",
                "Order number, arrival information and purchase summary",
                "final/Desktop - Cart_Confirmation.png"
              ]
            ].map(item => `
              <article class="al-flow-card">

                <figure>
                  <img
                    src="${base}/${item[3]}"
                    alt="Australian Light ${item[1].toLowerCase()} interface"
                    loading="lazy"
                  >
                </figure>

                <div class="al-flow-card-meta">
                  <span>${item[0]}</span>

                  <div>
                    <strong>${item[1]}</strong>
                    <p>${item[2]}</p>
                  </div>
                </div>

              </article>
            `).join("")}

          </div>

        </div>
      </section>


      <!-- 06 CODE -->
      <section class="al-section al-code" id="al-section-6">
        <div class="al-shell">

          <div class="al-section-head">
            <span class="al-section-no">06</span>
            <h2>DESIGN<br>BECOMES SYSTEM</h2>
          </div>

          <div class="al-rule"></div>

          <div class="al-code-grid">

            <p class="al-code-lead">
              The coded product goes beyond the Figma prototype.
            </p>

            <div class="al-capabilities">

              <article class="al-capability">
                <span>CSS</span>
                <div>
                  <h3>Responsive overlay architecture</h3>
                  <p>
                    Search and cart panels adapt to viewport height
                    rather than relying on fixed prototype dimensions.
                  </p>
                </div>
              </article>

              <article class="al-capability">
                <span>JAVASCRIPT</span>
                <div>
                  <h3>Persistent shopping cart</h3>
                  <p>
                    localStorage preserves product, style, size,
                    price and quantity while users navigate between pages.
                  </p>
                </div>
              </article>

              <article class="al-capability">
                <span>FORM LOGIC</span>
                <div>
                  <h3>Validated checkout progression</h3>
                  <p>
                    Required information is checked before progression
                    while order totals, shipping and confirmation data
                    are carried across the flow.
                  </p>
                </div>
              </article>

            </div>

          </div>

        </div>
      </section>


      <!-- 07 LIVE PRODUCT -->
      <section class="al-section al-live" id="al-section-7">
        <div class="al-shell">

          <div class="al-section-head">
            <span class="al-section-no">07</span>
            <h2>DON'T JUST<br>LOOK AT IT. USE IT.</h2>
          </div>

          <div class="al-rule"></div>

          <div class="al-live-intro">
            <span class="al-eyebrow">
              LIVE FRONT-END PROTOTYPE
            </span>

            <p>
              The final interface is embedded directly into the case study.
              Browse collections, open product pages, add an item to the cart
              and move through the checkout experience.
            </p>
          </div>

          <div class="al-laptop-wrap">
            <div class="al-laptop">

              <div class="al-laptop-screen">

                <div class="al-browser">

                  <div class="al-browser-bar">
                    <span class="al-browser-dots">
                      <i></i><i></i><i></i>
                    </span>

                    <span class="al-browser-address">
                      australianlight
                    </span>

                    <span></span>
                  </div>

                  <iframe
                    src="https://iccc619.github.io/UI-Implementation/"
                    title="Australian Light interactive website"
                    loading="lazy">
                  </iframe>

                </div>

              </div>

              <div class="al-laptop-base"></div>

            </div>
          </div>

          <div class="al-live-links">
            <a
              href="https://iccc619.github.io/UI-Implementation/"
              target="_blank"
              rel="noopener">
              Open live site ↗
            </a>

            <a
              href="https://github.com/iccc619/UI-Implementation"
              target="_blank"
              rel="noopener">
              View repository ↗
            </a>
          </div>

        </div>
      </section>


      <!-- 08 ITERATION -->
      <section class="al-section al-iteration" id="al-section-8">
        <div class="al-shell">

          <div class="al-section-head">
            <span class="al-section-no">08</span>
            <h2>TEST.<br>REFINE. REPEAT.</h2>
          </div>

          <div class="al-rule"></div>

          <div class="al-iteration-grid">

            <article class="al-iteration-item">

              <div class="al-iteration-compare">
                <figure>
                  <img
                    src="${base}/iteration/hero-before.png"
                    alt="Australian Light hero before iteration"
                    loading="lazy"
                  >
                  <figcaption>BEFORE</figcaption>
                </figure>

                <figure>
                  <img
                    src="${base}/iteration/hero-after.png"
                    alt="Australian Light hero after iteration"
                    loading="lazy"
                  >
                  <figcaption>AFTER</figcaption>
                </figure>
              </div>

              <span>01</span>
              <h3>Clearer first impression</h3>
              <p>
                Hero copy was refined so the purpose of the photography
                platform becomes easier to understand immediately.
              </p>
            </article>

            <article class="al-iteration-item">

              <div class="al-iteration-compare">
                <figure>
                  <img
                    src="${base}/iteration/checkout-before.png"
                    alt="Australian Light checkout before iteration"
                    loading="lazy"
                  >
                  <figcaption>BEFORE</figcaption>
                </figure>

                <figure>
                  <img
                    src="${base}/iteration/checkout-after.png"
                    alt="Australian Light checkout after iteration"
                    loading="lazy"
                  >
                  <figcaption>AFTER</figcaption>
                </figure>
              </div>

              <span>02</span>
              <h3>Checkout validation</h3>
              <p>
                Required inputs now control CTA availability so users
                cannot progress through an incomplete checkout.
              </p>
            </article>

            <article class="al-iteration-item">

              <div class="al-iteration-compare">
                <figure>
                  <img
                    src="${base}/iteration/recommendation-before.png"
                    alt="Australian Light recommendations before iteration"
                    loading="lazy"
                  >
                  <figcaption>BEFORE</figcaption>
                </figure>

                <figure>
                  <img
                    src="${base}/iteration/recommendation-after.png"
                    alt="Australian Light recommendations after iteration"
                    loading="lazy"
                  >
                  <figcaption>AFTER</figcaption>
                </figure>
              </div>

              <span>03</span>
              <h3>Contextual recommendations</h3>
              <p>
                Recommendation content was corrected to respond more
                appropriately to the selected photography product.
              </p>
            </article>

          </div>

        </div>
      </section>

    </article>
  `;
}


async function renderProject(){
  const projects=await getProjects();
  const slug=location.pathname.split("/").filter(Boolean).pop();
  const p=projects.find(x=>x.slug===slug);
  if(!p){
    document.body.innerHTML="<main class='shell section'><h1>Project not found.</h1><a href='/work/'>Back to work</a></main>";
    return;
  }

  if(p.slug==="60-bpm"){ render60BPM(p,projects); return; }
  if(p.slug==="ethereal-realm"){
    document.body.classList.add("project-ethereal-realm"); renderEtherealRealm(p,projects); return; }
  if(p.slug==="australian-light"){
    document.body.classList.add("project-australian-light");
    document.title=`${p.title} — Iris Wang`;

    document.body.insertAdjacentHTML("afterbegin",header());

    document.querySelector("#project-root").innerHTML=
      renderAustralianLight(p);

    requestAnimationFrame(()=>{
      initAustralianLightMotion();
      initAustralianLightFlowProgress();
    });

    return;
  }

  if(p.slug==="green-grid"){ renderGreenGridV1(p,projects); return; }
  if(p.slug==="n-exhibition"){ renderNExhibitionV1(p,projects); return; }
  
if(p.slug==="step-motion"){
  document.body.classList.add("project-step-motion");

  document.documentElement.style.setProperty(
    "--project-accent",
    "#d5bc2b"
  );

  document.title=`${p.title} — Iris Wang`;

  document.body.insertAdjacentHTML(
    "afterbegin",
    header()+`<div class="reading-progress" id="progress"></div>`
  );

  document.querySelector("#project-root").innerHTML=renderStepMotion(p);

  requestAnimationFrame(() => initStepMotionHeroCaptionBalance());

  requestAnimationFrame(() => {
    initStepMotionChapterFlow();
  });


  const article=document.querySelector(".sm-page");

  const stepSections=[
    ["sm-section-1","TIME AS SPACE"],
    ["sm-section-2","CONSTRUCTING THE FILM"],
    ["sm-section-3","TEMPORAL COMPOSITING"],
    ["sm-section-4","SOUND AS TIME"],
    ["sm-section-5","FINAL FILM"],
    ["sm-section-6","MOVEMENT BECOMES SEQUENCE"],
    ["sm-section-7","FILM TO BOOK"],
    ["sm-section-8","PROCESS / TOOLS"]
  ];

  if(article){
    article.insertAdjacentHTML(
      "beforeend",
      `
      <nav class="chapter-rail sm-rail"
           aria-label="Step Motion sections">

        ${stepSections.map(([id,label])=>`
          <a href="#${id}"
             data-label="${label}"
             aria-label="${label}">
          </a>
        `).join("")}

      </nav>

      <div class="chapter-tip sm-tip"
           id="sm-tip"></div>
      `
    );

    const currentIndex=projects.indexOf(p);
    const next=projects[(currentIndex+1)%projects.length];

    if(next){
      article.insertAdjacentHTML(
        "beforeend",
        `
        <a class="next-project sm-next"
           href="/work/${next.slug}/">

          <span class="meta-mono">NEXT PROJECT</span>

          <br>

          ${esc(next.title)} →

        </a>
        `
      );
    }
  }

  document.body.insertAdjacentHTML(
    "beforeend",
    footer()
  );

  const progress=document.querySelector("#progress");

  const updateProgress=()=>{
    const h=document.documentElement.scrollHeight-innerHeight;

    if(progress){
      progress.style.width=
        `${h ? scrollY/h*100 : 0}%`;
    }
  };

  updateProgress();

  addEventListener(
    "scroll",
    updateProgress,
    {passive:true}
  );

  const rail=[
    ...document.querySelectorAll(".sm-rail a")
  ];

  const sections=rail.map(a=>
    document.querySelector(
      a.getAttribute("href")
    )
  );

  const tip=document.querySelector("#sm-tip");

  rail.forEach(a=>{

    const showTip=()=>{
      if(!tip) return;
      tip.textContent=a.dataset.label || "";
      tip.classList.add("visible");
    };

    const hideTip=()=>{
      if(!tip) return;
      tip.classList.remove("visible");
    };

    a.addEventListener("mouseenter",showTip);
    a.addEventListener("mouseleave",hideTip);
    a.addEventListener("focus",showTip);
    a.addEventListener("blur",hideTip);
  });

  const observer=new IntersectionObserver(
    entries=>{
      entries.forEach(entry=>{
        if(!entry.isIntersecting) return;

        const i=sections.indexOf(entry.target);

        rail.forEach((a,j)=>
          a.classList.toggle("active",i===j)
        );
      });
    },
    {
      rootMargin:"-42% 0px -48% 0px",
      threshold:0
    }
  );

  sections.forEach(section=>{
    if(section) observer.observe(section);
  });

  requestAnimationFrame(()=>{
    initStepMotionBookSequence();
    initStepMotionSwipe();
  });

  return;
}

if(p.slug==="modular-typeface"){ renderModularTypefaceV2(p,projects); return; }

  document.body.classList.add("compact-brand");
  document.documentElement.style.setProperty("--project-accent",p.accent);
  document.documentElement.style.setProperty("--project-secondary",p.secondary);
  document.title=`${p.title} — Iris Wang`;
  document.body.insertAdjacentHTML("afterbegin",header()+`<div class="reading-progress" id="progress"></div>`);

  const next=projects[(projects.indexOf(p)+1)%projects.length];
  const meta=projectMeta(p);
  const theme=p.theme==="dark"?"theme-dark":"theme-light";

  const flow=p.sections.map((s,i)=>{
    const mode=flowModes[i%flowModes.length];
    return `<section class="flow-item ${mode}" id="section-${i+1}">
      <div class="flow-copy">
        <span class="flow-label">${String(i+1).padStart(2,"0")} / ${esc(s[0])}</span>
        <p>${esc(s[1])}</p>
      </div>
      <div class="flow-media">${media(p,mediaLabel(s[0],i))}</div>
    </section>`;
  }).join("");

  document.querySelector("#project-root").innerHTML=`
    <article class="project-page ${theme} p-${p.slug}">
      <header class="project-hero shell">
        <div class="project-kicker meta-mono"><span>${p.number} / 11</span><span>${esc(shortStatus(p.status))}</span></div>
        <h1>${esc(p.title)}</h1>
        <p class="project-summary-big">${esc(p.summary)}</p>
        <div class="meta-grid">${meta.map(m=>`<div class="meta-item"><b>${m[0]}</b><span>${esc(m[1])}</span></div>`).join("")}</div>
        <div class="hero-media">
${media(p,"hero media — asset to confirm")}</div>
      </header>
      <section class="demonstrates"><div class="inner"><span class="meta-mono">What this demonstrates</span><p>${esc(p.demonstrates)}</p></div></section>
      <div class="shell case-flow">${flow}</div>
      ${createChapterRail(p)}
      <a class="next-project" href="/work/${next.slug}/">
        <span class="meta-mono next-project-label">NEXT PROJECT</span>
        <span class="next-project-title">${esc(next.title)}</span>
        <span class="next-project-arrow">→</span>
      </a>
    </article>`;

  document.body.insertAdjacentHTML("beforeend",footer());
  const prog=document.querySelector("#progress");
  addEventListener("scroll",()=>{
    const h=document.documentElement.scrollHeight-innerHeight;
    prog.style.width=`${h?scrollY/h*100:0}%`;
  },{passive:true});
  setupChapterRail();
}

function renderAbout(){
  document.body.insertAdjacentHTML("afterbegin",header());
  document.body.insertAdjacentHTML("beforeend",footer());
}

document.addEventListener("DOMContentLoaded",()=>{
  const page=document.body.dataset.page;
  if(page==="home")renderHome().catch(console.error);
  if(page==="work")renderWork().catch(console.error);
  if(page==="project")renderProject().catch(console.error);
  if(page==="about")renderAbout();
});






function initStepMotionChapterFlow(){

  const root =
    document.querySelector("[data-sm-chapter-flow]");

  if(!root) return;


  /* prevent duplicate mounting from safe-boot + render boot */
  if(root.dataset.chapterController === "1"){
    return;
  }

  root.dataset.chapterController = "1";
  root.dataset.ready = "true";
  root.dataset.chapterFlowMounted = "true";


  /* --------------------------------------------------------
     REAL DOM
     one figure on STEP side
     one figure on MOTION side
     images are swapped dynamically
     -------------------------------------------------------- */

  const stepFigure =
    root.querySelector("[data-sm-step-frame]");

  const motionFigure =
    root.querySelector("[data-sm-motion-frame]");

  if(!stepFigure || !motionFigure){
    console.warn(
      "[Step Motion] chapter flow: figures missing"
    );
    return;
  }


  const stepImg =
    stepFigure.querySelector("img");

  const motionImg =
    motionFigure.querySelector("img");

  const stepCaption =
    stepFigure.querySelector("figcaption");

  const motionCaption =
    motionFigure.querySelector("figcaption");


  if(!stepImg || !motionImg){
    console.warn(
      "[Step Motion] chapter flow: images missing"
    );
    return;
  }


  const stepCount =
    root.querySelector("[data-sm-step-count]");

  const motionCount =
    root.querySelector("[data-sm-motion-count]");

  const current =
    root.querySelector("[data-sm-chapter-current]");

  const prev =
    root.querySelector("[data-sm-chapter-prev]");

  const next =
    root.querySelector("[data-sm-chapter-next]");


  const stepDots = [
    ...root.querySelectorAll("[data-sm-step-dot]")
  ];

  const motionDots = [
    ...root.querySelectorAll("[data-sm-motion-dot]")
  ];


  /* --------------------------------------------------------
     Correct chapter images
     -------------------------------------------------------- */

  const base =
    "/public/projects/step-motion/book";


  const stepFrames = [
    "IMG_1902.png",
    "IMG_1911.png",
    "IMG_1925.png"
  ];


  const motionFrames = [
    "IMG_1940%202.png",
    "IMG_1943%202.png",
    "IMG_1954%202.png"
  ];


  const total = 3;

  let index = 0;
  let timer = null;
  let swapTimer = null;

  const AUTOPLAY_MS = 3200;
  const TRANSITION_MS = 180;


  /* --------------------------------------------------------
     Preload all six images
     -------------------------------------------------------- */

  [
    ...stepFrames,
    ...motionFrames
  ].forEach(file => {

    const img = new Image();

    img.src =
      `${base}/${file}`;

  });


  function pad(value){
    return String(value).padStart(2,"0");
  }


  /* --------------------------------------------------------
     UI state
     -------------------------------------------------------- */

  function updateUI(){

    const number =
      pad(index + 1);

    const countLabel =
      `${number} / ${pad(total)}`;


    if(stepCaption){
      stepCaption.textContent =
        `CHAPTER ${number}`;
    }

    if(motionCaption){
      motionCaption.textContent =
        `CHAPTER ${number}`;
    }


    if(stepCount){
      stepCount.textContent =
        countLabel;
    }

    if(motionCount){
      motionCount.textContent =
        countLabel;
    }


    if(current){
      current.textContent =
        number;
    }


    stepDots.forEach((dot,i)=>{

      const active =
        i === index;

      dot.classList.toggle(
        "is-active",
        active
      );

      dot.setAttribute(
        "aria-current",
        active ? "true" : "false"
      );

    });


    motionDots.forEach((dot,i)=>{

      const active =
        i === index;

      dot.classList.toggle(
        "is-active",
        active
      );

      dot.setAttribute(
        "aria-current",
        active ? "true" : "false"
      );

    });

  }


  /* --------------------------------------------------------
     Image transition
     -------------------------------------------------------- */

  function renderFrame(direction = 1){

    if(swapTimer){
      clearTimeout(swapTimer);
      swapTimer = null;
    }


    stepFigure.classList.toggle(
      "is-reverse",
      direction < 0
    );

    motionFigure.classList.toggle(
      "is-reverse",
      direction < 0
    );


    /*
      Trigger existing CSS transition.
      Even if animation CSS is unavailable,
      src still changes after 180ms.
    */

    stepFigure.classList.remove(
      "is-active"
    );

    motionFigure.classList.remove(
      "is-active"
    );


    swapTimer = window.setTimeout(()=>{

      stepImg.src =
        `${base}/${stepFrames[index]}`;

      motionImg.src =
        `${base}/${motionFrames[index]}`;


      stepImg.alt =
        `STEP book chapter ${index + 1}`;

      motionImg.alt =
        `MOTION book chapter ${index + 1}`;


      updateUI();


      requestAnimationFrame(()=>{

        requestAnimationFrame(()=>{

          stepFigure.classList.add(
            "is-active"
          );

          motionFigure.classList.add(
            "is-active"
          );

        });

      });

    }, TRANSITION_MS);

  }


  /* --------------------------------------------------------
     Autoplay
     -------------------------------------------------------- */

  function stop(){

    if(timer){
      clearInterval(timer);
      timer = null;
    }

  }


  function start(){

    stop();

    if(
      window.matchMedia(
        "(prefers-reduced-motion: reduce)"
      ).matches
    ){
      return;
    }


    timer = window.setInterval(()=>{

      index =
        (index + 1) % total;

      renderFrame(1);

    }, AUTOPLAY_MS);

  }


  function go(nextIndex, direction){

    index =
      (
        nextIndex % total
        + total
      ) % total;

    renderFrame(direction);

    start();

  }


  /* --------------------------------------------------------
     Buttons
     -------------------------------------------------------- */

  prev?.addEventListener(
    "click",
    event => {

      event.preventDefault();

      go(
        index - 1,
        -1
      );

    }
  );


  next?.addEventListener(
    "click",
    event => {

      event.preventDefault();

      go(
        index + 1,
        1
      );

    }
  );


  /* --------------------------------------------------------
     Progress controls
     -------------------------------------------------------- */

  stepDots.forEach((dot,i)=>{

    dot.addEventListener(
      "click",
      event => {

        event.preventDefault();

        go(
          i,
          i < index ? -1 : 1
        );

      }
    );

  });


  motionDots.forEach((dot,i)=>{

    dot.addEventListener(
      "click",
      event => {

        event.preventDefault();

        go(
          i,
          i < index ? -1 : 1
        );

      }
    );

  });


  /* --------------------------------------------------------
     Pause during intentional interaction
     -------------------------------------------------------- */

  root.addEventListener(
    "mouseenter",
    stop
  );


  root.addEventListener(
    "mouseleave",
    start
  );


  document.addEventListener(
    "visibilitychange",
    ()=>{

      if(document.hidden){
        stop();
      }
      else{
        start();
      }

    }
  );


  /* --------------------------------------------------------
     INITIALISE
     -------------------------------------------------------- */

  index = 0;

  stepImg.src =
    `${base}/${stepFrames[0]}`;

  motionImg.src =
    `${base}/${motionFrames[0]}`;

  updateUI();

  stepFigure.classList.add(
    "is-active"
  );

  motionFigure.classList.add(
    "is-active"
  );

  start();


  console.log(
    "[Step Motion] chapter flow mounted",
    {
      total,
      stepFrames,
      motionFrames
    }
  );

}


function initStepMotionBookSequence(){

  const root = document.querySelector("[data-sm-book-sequence]");
  if(!root || root.dataset.ready === "true") return;

  root.dataset.ready = "true";

  const base = "/public/projects/step-motion/book-sequence-fixed";

  const frames = [
    "Still_010000.png",
    "Still_010100.png",
    "Still_010200.png",
    "Still_010300.png",
    "Still_010400.png",
    "Still_010500.png",
    "Still_010600.png",
    "Still_010700.png",
    "Still_010800.png",
    "Still_010900.png",
    "Still_011000.png"
  ];

  const image = root.querySelector("[data-sm-book-frame]");
  const prev = root.querySelector("[data-sm-book-prev]");
  const next = root.querySelector("[data-sm-book-next]");
  const play = root.querySelector("[data-sm-book-play]");
  const current = root.querySelector("[data-sm-book-current]");
  const total = root.querySelector("[data-sm-book-total]");
  const progress = root.querySelector("[data-sm-book-progress]");

  if(!image) return;

  let index = 0;
  let playing = true;
  let timer = null;

  total.textContent = String(frames.length).padStart(2,"0");


  // Preload every actual project frame
  frames.forEach(name => {
    const preload = new Image();
    preload.src = `${base}/${name}`;
  });


  function render(){

    image.src = `${base}/${frames[index]}`;

    current.textContent =
      String(index + 1).padStart(2,"0");

    progress.style.width =
      `${((index + 1) / frames.length) * 100}%`;
  }


  function step(direction = 1){

    index =
      (index + direction + frames.length) %
      frames.length;

    render();
  }


  function start(){

    clearInterval(timer);

    timer = setInterval(() => {
      step(1);
    }, 190);

    playing = true;
    play.textContent = "II";
    play.setAttribute("aria-label","Pause animation");
  }


  function stop(){

    clearInterval(timer);

    playing = false;
    play.textContent = "▶";
    play.setAttribute("aria-label","Play animation");
  }


  play?.addEventListener("click", () => {
    playing ? stop() : start();
  });


  prev?.addEventListener("click", () => {
    stop();
    step(-1);
  });


  next?.addEventListener("click", () => {
    stop();
    step(1);
  });


  // Pause while the tab isn't visible
  document.addEventListener("visibilitychange", () => {

    if(document.hidden){
      clearInterval(timer);
      return;
    }

    if(playing){
      start();
    }

  });


  render();
  start();
}


function initStepMotionSwipe(){
  const rail = document.querySelector("[data-sm-swipe]");
  if(!rail) return false;

  /* prevent duplicate listeners */
  if(rail.dataset.swipeReady === "1"){
    return true;
  }

  rail.dataset.swipeReady = "1";

  const slides = [...rail.querySelectorAll(".sm-film-slide")];
  const bars = [...document.querySelectorAll(".sm-film-swipe-progress span")];
  const counter = document.querySelector("[data-sm-current-slide]");
  const prev = document.querySelector("[data-sm-swipe-prev]");
  const next = document.querySelector("[data-sm-swipe-next]");

  if(!slides.length) return false;

  let active = 0;
  let raf = null;

  const setActive = (index) => {
    index = Math.max(0, Math.min(slides.length - 1, index));
    active = index;

    bars.forEach((bar, i) => {
      bar.classList.toggle("is-active", i === index);
      bar.setAttribute("aria-current", i === index ? "true" : "false");
    });

    slides.forEach((slide, i) => {
      slide.classList.toggle("is-active", i === index);
    });

    if(counter){
      counter.textContent = String(index + 1).padStart(2, "0");
    }
  };

  const getActiveIndex = () => {
    /*
      Slides all share the same width.
      offsetLeft difference gives the REAL carousel step,
      including its gap.
    */
    if(slides.length > 1){
      const step = slides[1].offsetLeft - slides[0].offsetLeft;

      if(step > 0){
        return Math.round(rail.scrollLeft / step);
      }
    }

    /* fallback */
    let closest = 0;
    let distance = Infinity;

    slides.forEach((slide, i) => {
      const d = Math.abs(slide.offsetLeft - rail.scrollLeft);

      if(d < distance){
        distance = d;
        closest = i;
      }
    });

    return closest;
  };

  const sync = () => {
    raf = null;
    setActive(getActiveIndex());
  };

  const requestSync = () => {
    if(raf !== null) return;
    raf = requestAnimationFrame(sync);
  };

  const goTo = (index) => {
    index = Math.max(0, Math.min(slides.length - 1, index));

    rail.scrollTo({
      left: slides[index].offsetLeft,
      behavior: "smooth"
    });

    setActive(index);

    setTimeout(sync, 120);
    setTimeout(sync, 350);
    setTimeout(sync, 650);
  };


  /* manual swipe / trackpad / scrollbar */
  rail.addEventListener("scroll", requestSync, {
    passive: true
  });

  rail.addEventListener("touchmove", requestSync, {
    passive: true
  });

  rail.addEventListener("touchend", sync, {
    passive: true
  });

  rail.addEventListener("pointerup", sync);


  /* arrow buttons */
  prev?.addEventListener("click", () => {
    goTo(active - 1);
  });

  next?.addEventListener("click", () => {
    goTo(active + 1);
  });


  /* progress bars = navigation too */
  bars.forEach((bar, i) => {
    bar.addEventListener("click", () => {
      goTo(i);
    });

    bar.setAttribute("role", "button");
    bar.setAttribute("tabindex", "0");

    bar.addEventListener("keydown", e => {
      if(e.key === "Enter" || e.key === " "){
        e.preventDefault();
        goTo(i);
      }
    });
  });


  /* sync after image sizes settle */
  const images = [...rail.querySelectorAll("img")];

  images.forEach(img => {
    if(!img.complete){
      img.addEventListener("load", requestSync, {
        once: true
      });
    }
  });

  window.addEventListener("resize", requestSync, {
    passive: true
  });

  setActive(0);

  requestAnimationFrame(sync);
  setTimeout(sync, 100);
  setTimeout(sync, 500);

  console.log(
    "[Step Motion] swipe ready:",
    slides.length,
    "slides"
  );

  return true;
}




/* =========================================================
   STEP / MOTION — SELF INITIALISING SWIPE
   ========================================================= */

(() => {

  const bootStepMotionSwipe = () => {
    const rail = document.querySelector("[data-sm-swipe]");

    if(
      rail &&
      rail.dataset.swipeReady !== "1" &&
      typeof initStepMotionSwipe === "function"
    ){
      initStepMotionSwipe();
    }
  };


  /* try immediately */
  bootStepMotionSwipe();


  /* try when DOM is ready */
  if(document.readyState === "loading"){
    document.addEventListener(
      "DOMContentLoaded",
      bootStepMotionSwipe,
      { once:true }
    );
  }


  /*
    Project content is rendered dynamically.
    Watch until the Step / Motion carousel appears.
  */
  const observer = new MutationObserver(() => {
    bootStepMotionSwipe();
  });

  observer.observe(document.documentElement, {
    childList:true,
    subtree:true
  });


  /* final fallback for delayed route rendering */
  let attempts = 0;

  const timer = setInterval(() => {
    attempts += 1;

    bootStepMotionSwipe();

    const rail = document.querySelector("[data-sm-swipe]");

    if(
      rail?.dataset.swipeReady === "1" ||
      attempts > 20
    ){
      clearInterval(timer);
    }
  }, 250);

})();

/* =========================================================
   STEP / MOTION — BOOK SECTION REFINEMENT HOOKS
   ========================================================= */

function refineStepMotionBookLayout(){
  if(!document.body.classList.contains("project-step-motion")) return;

  const sections=[...document.querySelectorAll(".sm-page section")];

  sections.forEach(section=>{
    const h2=section.querySelector("h2");
    if(!h2) return;

    const title=h2.textContent.replace(/\s+/g," ").trim();

    if(title==="STEP / MOTION"){
      section.classList.add("sm-book-editorial");
    }

    if(title==="MATERIAL → IMAGE" || title==="MATERIAL → IMAGE"){
      section.classList.add("sm-material-editorial");
    }
  });
}

requestAnimationFrame(refineStepMotionBookLayout);
setTimeout(refineStepMotionBookLayout,300);



/* =========================================================
   STEP / MOTION — Section 07 explicit heading hook
   ========================================================= */

function initStepMotionBookHeading(){
  if(!document.body.classList.contains("project-step-motion")) return;

  const headings = [
    ...document.querySelectorAll(".sm-page h1, .sm-page h2, .sm-page h3")
  ];

  const heading = headings.find(el =>
    el.textContent.replace(/\s+/g, " ").trim() === "STEP / MOTION"
  );

  if(!heading) return;

  heading.classList.add("sm-book-section-title");

  const section = heading.closest("section");

  if(section){
    section.classList.add("sm-book-section-final");
  }
}

requestAnimationFrame(initStepMotionBookHeading);
setTimeout(initStepMotionBookHeading, 200);

/* STEP / MOTION — use the same rule system as sequence section */
function syncStepMotionSectionHeader(){
  const title = document.querySelector(
    ".project-step-motion .sm-book-section-title"
  );

  if(!title) return;

  const section = title.closest("section");
  if(!section) return;

  const rule = section.querySelector(
    "hr, .sm-rule, .section-rule"
  );

  if(rule) rule.classList.add("sm-sequence-rule");
}

requestAnimationFrame(syncStepMotionSectionHeader);

/* =========================================================
   GREEN GRID — HERO SVG
   mounted inside the actual hero grid
   ========================================================= */

(() => {
  if (!location.pathname.includes("/work/green-grid")) return;

  const mountGreenGridHeroSvg = () => {
    const root = document.querySelector("#project-root");
    if (!root) return;

    const grid = root.querySelector(".gg-hero-grid");
    if (!grid) return;

    const hero = grid.closest(".gg-hero");

    /*
      Metadata belongs BELOW the two-column hero grid,
      not inside the left text column.
    */
    const meta = grid.querySelector(".gg-meta");

    if (hero && meta) {
      if (meta.parentElement !== hero) {
        hero.appendChild(meta);
      }

      meta.classList.add("gg-hero-meta-row");
    }

    let img = root.querySelector(".gg-hero-svg-overlay");

    /*
      If an older version mounted the SVG directly in the
      section, move that exact node into the grid.
    */
    if (img) {
      if (img.parentElement !== grid) {
        grid.appendChild(img);
      }

      return;
    }

    img = document.createElement("img");

    img.className = "gg-hero-svg-overlay";
    img.src = "/public/projects/green-grid/hero.svg";
    img.alt = "";
    img.setAttribute("aria-hidden", "true");

    grid.appendChild(img);
  };

  mountGreenGridHeroSvg();

  const observer = new MutationObserver(mountGreenGridHeroSvg);

  observer.observe(document.body, {
    childList: true,
    subtree: true
  });
})();



/* =========================================================
   AUSTRALIAN LIGHT — REVEAL MOTION
   ========================================================= */

function initAustralianLightMotion(){

  if(!document.body.classList.contains("project-australian-light")){
    return;
  }

  const groups = [
    ".al-problem-intro",
    ".al-issues",
    ".al-audit-head",
    ".al-audit-grid",
    ".al-research-grid",
    ".al-process-track",
    ".al-process-sketch",
    ".al-lowfi-stack",
    ".al-direction-layout",
    ".al-flow-rail",
    ".al-code-grid",
    ".al-live-intro",
    ".al-laptop-wrap",
    ".al-iteration-grid"
  ];

  const items = [
    ...document.querySelectorAll(groups.join(","))
  ];

  if(!items.length) return;

  items.forEach((el,index)=>{

    if(el.dataset.alRevealReady === "1") return;

    el.dataset.alRevealReady = "1";

    el.classList.add("al-reveal");

    if(index % 4){
      el.dataset.alDelay = String(index % 4);
    }

  });


  if(
    window.matchMedia(
      "(prefers-reduced-motion: reduce)"
    ).matches
  ){
    items.forEach(el=>el.classList.add("is-visible"));
    return;
  }


  const observer = new IntersectionObserver(
    entries=>{

      entries.forEach(entry=>{

        if(!entry.isIntersecting) return;

        entry.target.classList.add("is-visible");

        observer.unobserve(entry.target);

      });

    },
    {
      threshold:.12,
      rootMargin:"0px 0px -6% 0px"
    }
  );


  items.forEach(el=>observer.observe(el));

}


/* =========================================================
   AUSTRALIAN LIGHT — FLOW PROGRESS
   ========================================================= */

function initAustralianLightFlowProgress(){

  if(!document.body.classList.contains("project-australian-light")){
    return;
  }

  const rail =
    document.querySelector(".al-flow-rail");

  const bar =
    document.querySelector(".al-flow-progress span");

  if(!rail || !bar) return;

  if(rail.dataset.progressReady === "1") return;

  rail.dataset.progressReady = "1";


  const update = ()=>{

    const max =
      rail.scrollWidth - rail.clientWidth;

    const ratio =
      max > 0
        ? rail.scrollLeft / max
        : 0;

    const available = 78;

    bar.style.transform =
      `translateX(${ratio * available * 4.545}%)`;

  };


  rail.addEventListener(
    "scroll",
    update,
    {passive:true}
  );

  window.addEventListener(
    "resize",
    update,
    {passive:true}
  );

  update();

}


/* =========================================================
   AUSTRALIAN LIGHT — INTERACTION SYSTEM
   ========================================================= */

function initAustralianLightInteractions(){

  if(!document.body.classList.contains(
    "project-australian-light"
  )){
    return;
  }


  /* =======================================================
     01 — ORIGINAL SITE AUDIT
     ======================================================= */

  const audit =
    document.querySelector("[data-al-audit]");

  if(audit && audit.dataset.ready !== "1"){

    audit.dataset.ready = "1";

    const tabs =
      [...audit.querySelectorAll(".al-audit-tab")];

    const image =
      audit.querySelector("[data-al-audit-image]");

    const number =
      audit.querySelector("[data-al-audit-number]");

    const label =
      audit.querySelector("[data-al-audit-label]");

    const stage =
      audit.querySelector("[data-al-audit-stage]");


    tabs.forEach(tab=>{

      tab.addEventListener("click",()=>{

        tabs.forEach(item=>
          item.classList.remove("is-active")
        );

        tab.classList.add("is-active");

        image.src =
          tab.dataset.alAuditSrc;

        number.textContent =
          tab.dataset.alAuditNumber;

        label.textContent =
          tab.dataset.alAuditLabel;

        stage.scrollTop = 0;

      });

    });

  }


  /* =======================================================
     03 — PROCESS VIEWER
     ======================================================= */

  const process =
    document.querySelector("[data-al-process]");

  if(process && process.dataset.ready !== "1"){

    process.dataset.ready = "1";

    const buttons =
      [...process.querySelectorAll(
        ".al-process-button"
      )];

    const thumbs =
      [...process.querySelectorAll(
        ".al-process-thumb"
      )];

    const image =
      process.querySelector(
        "[data-al-process-image]"
      );

    const number =
      process.querySelector(
        "[data-al-process-index]"
      );

    const label =
      process.querySelector(
        "[data-al-process-label]"
      );


    const activate = button=>{

      if(!button) return;

      buttons.forEach(item=>
        item.classList.remove("is-active")
      );

      button.classList.add("is-active");

      image.src =
        button.dataset.alProcessSrc;

      number.textContent =
        button.dataset.alProcessIndex;

      label.textContent =
        button.dataset.alProcessLabel;

      thumbs.forEach(thumb=>{
        thumb.classList.toggle(
          "is-active",
          thumb.dataset.alProcessThumb ===
          button.dataset.alProcessIndex
        );
      });

    };


    buttons.forEach(button=>{

      button.addEventListener(
        "click",
        ()=>activate(button)
      );

    });


    thumbs.forEach(thumb=>{

      thumb.addEventListener("click",()=>{

        const target =
          buttons.find(
            button =>
              button.dataset.alProcessIndex ===
              thumb.dataset.alProcessThumb
          );

        activate(target);

      });

    });

  }


  /* =======================================================
     05 — SHOPPING FLOW
     ======================================================= */

  const rail =
    document.querySelector(".al-flow-rail");

  if(rail && rail.dataset.flowReady !== "1"){

    rail.dataset.flowReady = "1";

    const cards =
      [...rail.querySelectorAll(".al-flow-card")];

    const prev =
      document.querySelector("[data-al-flow-prev]");

    const next =
      document.querySelector("[data-al-flow-next]");

    const current =
      document.querySelector("[data-al-flow-current]");

    const progress =
      document.querySelector(".al-flow-progress span");

    let active = 0;


    const update = ()=>{

      const railBox =
        rail.getBoundingClientRect();

      const centre =
        railBox.left + railBox.width / 2;

      let closestIndex = 0;
      let closestDistance = Infinity;


      cards.forEach((card,index)=>{

        const box =
          card.getBoundingClientRect();

        const cardCentre =
          box.left + box.width / 2;

        const distance =
          Math.abs(cardCentre - centre);

        if(distance < closestDistance){

          closestDistance = distance;
          closestIndex = index;

        }

      });


      active = closestIndex;


      if(current){

        current.textContent =
          String(active + 1).padStart(2,"0");

      }


      if(progress){

        const max =
          rail.scrollWidth -
          rail.clientWidth;

        const ratio =
          max > 0
            ? rail.scrollLeft / max
            : 0;

        progress.style.transform =
          `scaleX(${Math.max(.04, ratio)})`;

      }

    };


    const goTo = index=>{

      active =
        Math.max(
          0,
          Math.min(cards.length - 1,index)
        );

      cards[active].scrollIntoView({
        behavior:"smooth",
        block:"nearest",
        inline:"start"
      });

    };


    prev?.addEventListener(
      "click",
      ()=>goTo(active - 1)
    );

    next?.addEventListener(
      "click",
      ()=>goTo(active + 1)
    );


    rail.addEventListener(
      "scroll",
      update,
      {passive:true}
    );


    /* mouse drag */

    let dragging = false;
    let startX = 0;
    let startScroll = 0;


    rail.addEventListener(
      "pointerdown",
      event=>{

        dragging = true;

        startX = event.clientX;
        startScroll = rail.scrollLeft;

        rail.setPointerCapture(
          event.pointerId
        );

        rail.style.cursor =
          "grabbing";

      }
    );


    rail.addEventListener(
      "pointermove",
      event=>{

        if(!dragging) return;

        const delta =
          event.clientX - startX;

        rail.scrollLeft =
          startScroll - delta;

      }
    );


    const release = ()=>{

      dragging = false;

      rail.style.cursor =
        "grab";

    };


    rail.addEventListener(
      "pointerup",
      release
    );

    rail.addEventListener(
      "pointercancel",
      release
    );


    rail.style.cursor =
      "grab";

    update();

  }

}


/* =========================================================
   AUSTRALIAN LIGHT — SHARED PROJECT CHROME
   ========================================================= */

function initAustralianLightChrome(project,projects){

  const article =
    document.querySelector(".al-page");

  if(!article) return;


  const chapters = [
    ["al-section-1","FROM GALLERY TO COMMERCE"],
    ["al-section-2","RESEARCH"],
    ["al-section-3","PROCESS"],
    ["al-section-4","VISUAL SYSTEM"],
    ["al-section-5","SHOPPING FLOW"],
    ["al-section-6","FIGMA TO CODE"],
    ["al-section-7","LIVE PRODUCT"],
    ["al-section-8","ITERATION"]
  ];


  if(!article.querySelector(".chapter-rail")){

    article.insertAdjacentHTML(
      "beforeend",
      `
      <nav
        class="chapter-rail al-chapter-rail"
        aria-label="Australian Light sections">

        ${chapters.map(([id,label])=>`
          <a
            href="#${id}"
            data-label="${label}"
            aria-label="${label}">
          </a>
        `).join("")}

      </nav>

      <div
        class="chapter-tip"
        id="al-chapter-tip">
      </div>
      `
    );

  }


  /* next project */

  if(!article.querySelector(
    ".al-next-project"
  )){

    const index =
      projects.findIndex(
        item =>
          item.slug === project.slug
      );

    const next =
      projects[
        (index + 1) %
        projects.length
      ];


    if(next){

      article.insertAdjacentHTML(
        "beforeend",
        `
        <a
          class="next-project al-next-project"
          href="/work/${next.slug}/">

          <span class="meta-mono">
            NEXT PROJECT
          </span>

          <span class="al-next-title">
            ${esc(next.title)} →
          </span>

        </a>
        `
      );

    }

  }


  /* shared footer */

  const hasFooter =
    document.querySelector(
      "body > footer, body > .site-footer"
    );

  if(
    !hasFooter &&
    typeof footer === "function"
  ){

    document.body.insertAdjacentHTML(
      "beforeend",
      footer()
    );

  }


  if(typeof setupChapterRail === "function"){
    setupChapterRail();
  }

}


/* =========================================================
   AUSTRALIAN LIGHT — ROBUST INTERACTION PATCH 06
   Delegated events survive async project rendering.
   ========================================================= */

(function(){

  if(window.__alRefine06Bound) return;

  window.__alRefine06Bound = true;


  /* -------------------------------------------------------
     CLICK DELEGATION
     ------------------------------------------------------- */

  document.addEventListener("click", event=>{

    if(
      !document.body.classList.contains(
        "project-australian-light"
      )
    ){
      return;
    }


    /* =====================================================
       01 — AUDIT
       ===================================================== */

    const auditButton =
      event.target.closest(
        ".al-audit-tab[data-al-audit-src]"
      );

    if(auditButton){

      event.preventDefault();

      const audit =
        auditButton.closest("[data-al-audit]");

      if(!audit) return;


      const tabs =
        [...audit.querySelectorAll(
          ".al-audit-tab"
        )];

      const image =
        audit.querySelector(
          "[data-al-audit-image]"
        );

      const number =
        audit.querySelector(
          ".al-audit-stage-label " +
          "[data-al-audit-number]"
        );

      const label =
        audit.querySelector(
          ".al-audit-stage-label " +
          "[data-al-audit-label]"
        );

      const stage =
        audit.querySelector(
          "[data-al-audit-stage]"
        );


      tabs.forEach(item=>
        item.classList.remove("is-active")
      );

      auditButton.classList.add(
        "is-active"
      );


      if(image){

        image.src =
          auditButton.dataset.alAuditSrc;

      }


      if(number){

        number.textContent =
          auditButton.dataset.alAuditNumber ||
          "";

      }


      if(label){

        label.textContent =
          auditButton.dataset.alAuditLabel ||
          "";

      }


      if(stage){

        stage.scrollTo({
          top:0,
          behavior:"smooth"
        });

      }

      return;
    }


    /* =====================================================
       03 — PROCESS MAIN CTA
       ===================================================== */

    const processButton =
      event.target.closest(
        ".al-process-button[data-al-process-src]"
      );

    if(processButton){

      event.preventDefault();

      const process =
        processButton.closest(
          "[data-al-process]"
        );

      if(!process) return;


      const buttons =
        [...process.querySelectorAll(
          ".al-process-button"
        )];

      const image =
        process.querySelector(
          "[data-al-process-image]"
        );


      /*
        Use stage-meta specifically.
        Avoid accidentally selecting the button itself,
        because buttons also carry data-al-process-index.
      */

      const stageMeta =
        process.querySelector(
          ".al-process-stage-meta"
        );

      const number =
        stageMeta?.querySelector(
          "[data-al-process-index]"
        );

      const label =
        stageMeta?.querySelector(
          "[data-al-process-label]"
        );


      buttons.forEach(item=>
        item.classList.remove("is-active")
      );

      processButton.classList.add(
        "is-active"
      );


      if(image){

        image.src =
          processButton.dataset.alProcessSrc;

        image.alt =
          processButton.dataset.alProcessLabel ||
          "Australian Light design process";

      }


      if(number){

        number.textContent =
          processButton.dataset.alProcessIndex ||
          "";

      }


      if(label){

        label.textContent =
          processButton.dataset.alProcessLabel ||
          "";

      }


      process
        .querySelectorAll(
          ".al-process-thumb"
        )
        .forEach(thumb=>{

          thumb.classList.toggle(
            "is-active",
            thumb.dataset.alProcessThumb ===
              processButton.dataset.alProcessIndex
          );

        });


      return;
    }


    /* =====================================================
       03 — PROCESS THUMB
       ===================================================== */

    const processThumb =
      event.target.closest(
        ".al-process-thumb[data-al-process-thumb]"
      );

    if(processThumb){

      event.preventDefault();

      const process =
        processThumb.closest(
          "[data-al-process]"
        );

      if(!process) return;


      const index =
        processThumb.dataset.alProcessThumb;


      const target =
        [...process.querySelectorAll(
          ".al-process-button"
        )].find(
          button =>
            button.dataset.alProcessIndex ===
            index
        );


      if(target){

        target.click();

      }

    }

  });


  /* -------------------------------------------------------
     PROCESS NAV GROUPING
     Sketch ≠ Low-Fi
     ------------------------------------------------------- */

  const organiseProcess = root=>{

    const process =
      root.querySelector?.(
        "[data-al-process]"
      );

    if(!process) return;


    const nav =
      process.querySelector(
        ".al-process-nav"
      );

    if(
      !nav ||
      nav.dataset.alGrouped === "1"
    ){
      return;
    }


    const buttons =
      [...nav.querySelectorAll(
        ":scope > .al-process-button"
      )];


    if(!buttons.length) return;


    nav.dataset.alGrouped = "1";


    const sketchButtons =
      buttons.filter(button=>
        (
          button.dataset.alProcessLabel ||
          ""
        )
        .toUpperCase()
        .startsWith("SKETCH")
      );


    const lowfiButtons =
      buttons.filter(button=>
        (
          button.dataset.alProcessLabel ||
          ""
        )
        .toUpperCase()
        .startsWith("LOW-FI")
      );


    const createGroup = (
      name,
      countLabel,
      buttonsToMove
    )=>{

      if(!buttonsToMove.length){
        return;
      }


      const group =
        document.createElement("div");


      group.className =
        "al-process-group";


      group.dataset.processGroup =
        name.toLowerCase();


      group.innerHTML = `
        <div class="al-process-group-title">
          <span>${name}</span>
          <span>${countLabel}</span>
        </div>

        <div class="al-process-group-buttons">
        </div>
      `;


      const holder =
        group.querySelector(
          ".al-process-group-buttons"
        );


      buttonsToMove.forEach(button=>
        holder.appendChild(button)
      );


      nav.appendChild(group);

    };


    createGroup(
      "SKETCH",
      `${sketchButtons.length} STUDIES`,
      sketchButtons
    );


    createGroup(
      "LOW-FI",
      `${lowfiButtons.length} SCREENS`,
      lowfiButtons
    );

  };


  /* -------------------------------------------------------
     Boot now + after async project render
     ------------------------------------------------------- */

  const boot = ()=>{

    if(
      !document.body.classList.contains(
        "project-australian-light"
      )
    ){
      return;
    }

    organiseProcess(document);

  };


  boot();


  const observer =
    new MutationObserver(()=>{

      boot();

    });


  observer.observe(
    document.body,
    {
      childList:true,
      subtree:true
    }
  );

})();


/* Australian Light — prevent nested screenshot wheel from
   immediately escaping into the portfolio page */

document.addEventListener(
  "wheel",
  event=>{

    if(
      !document.body.classList.contains(
        "project-australian-light"
      )
    ){
      return;
    }


    const frame =
      event.target.closest(
        ".al-flow-card figure"
      );


    if(!frame) return;


    const max =
      frame.scrollHeight -
      frame.clientHeight;


    if(max <= 2){
      return;
    }


    const goingDown =
      event.deltaY > 0;


    const atTop =
      frame.scrollTop <= 0;


    const atBottom =
      frame.scrollTop >= max - 1;


    if(
      (goingDown && !atBottom) ||
      (!goingDown && !atTop)
    ){
      event.stopPropagation();
    }

  },
  {
    passive:true
  }
);


/* ===== AUSTRALIAN LIGHT — SECTION 03 EDITORIAL PROCESS ===== */

function rebuildAustralianLightProcess(){
  if(!document.body.classList.contains("project-australian-light")) return;

  const process = document.querySelector(".al-process-ui");
  if(!process || process.dataset.editorialProcess === "true") return;

  process.dataset.editorialProcess = "true";

  process.innerHTML = `
    <div class="al-process-editorial">

      <!-- SKETCHES -->
      <section class="al-process-chapter al-process-sketches">

        <header class="al-process-chapter-head">
          <div class="al-process-chapter-index">03.1</div>

          <div class="al-process-chapter-title">
            <span>SKETCH</span>
            <h3>Divergent exploration</h3>
          </div>

          <p>
            Four early directions tested different relationships between
            imagery, navigation and commerce before committing to a
            digital structure.
          </p>
        </header>

        <div class="al-sketch-grid">

          <figure class="al-sketch-card al-sketch-card--large">
            <div class="al-process-image">
              <img
                src="/public/projects/australian-light/process/homepage.png"
                alt="Australian Light early homepage sketch"
                loading="lazy"
              >
            </div>
            <figcaption>
              <span>01</span>
              <strong>Homepage</strong>
            </figcaption>
          </figure>

          <figure class="al-sketch-card">
            <div class="al-process-image">
              <img
                src="/public/projects/australian-light/process/search.png"
                alt="Australian Light search interface sketch"
                loading="lazy"
              >
            </div>
            <figcaption>
              <span>02</span>
              <strong>Search</strong>
            </figcaption>
          </figure>

          <figure class="al-sketch-card">
            <div class="al-process-image">
              <img
                src="/public/projects/australian-light/process/product.png"
                alt="Australian Light product interface sketch"
                loading="lazy"
              >
            </div>
            <figcaption>
              <span>03</span>
              <strong>Product</strong>
            </figcaption>
          </figure>

          <figure class="al-sketch-card">
            <div class="al-process-image">
              <img
                src="/public/projects/australian-light/process/purchase.png"
                alt="Australian Light checkout interface sketch"
                loading="lazy"
              >
            </div>
            <figcaption>
              <span>04</span>
              <strong>Purchase</strong>
            </figcaption>
          </figure>

        </div>
      </section>


      <!-- LOW-FIDELITY -->
      <section class="al-process-chapter al-process-lowfi">

        <header class="al-process-chapter-head">
          <div class="al-process-chapter-index">03.2</div>

          <div class="al-process-chapter-title">
            <span>LOW-FIDELITY</span>
            <h3>One continuous mobile flow</h3>
          </div>

          <p>
            The selected direction was translated into a complete
            wireframe journey. At this stage the focus shifted from
            visual styling to navigation, hierarchy and purchase logic.
          </p>
        </header>


        <div class="al-lowfi-flow">

          <!-- DISCOVER -->
          <section class="al-lowfi-group">

            <div class="al-lowfi-group-head">
              <span>01</span>
              <h4>Discover</h4>
              <p>Home, navigation and search.</p>
            </div>

            <div class="al-lowfi-grid al-lowfi-grid--discover">

              <figure>
                <div class="al-lowfi-frame">
                  <img
                    src="/public/projects/australian-light/process/lowfi-Homepage.svg"
                    alt="Low fidelity homepage"
                    loading="lazy"
                  >
                </div>
                <figcaption>Homepage</figcaption>
              </figure>

              <figure>
                <div class="al-lowfi-frame">
                  <img
                    src="/public/projects/australian-light/process/lowfi-Homepage_Side Navigation.svg"
                    alt="Low fidelity side navigation"
                    loading="lazy"
                  >
                </div>
                <figcaption>Side Navigation</figcaption>
              </figure>

              <figure>
                <div class="al-lowfi-frame">
                  <img
                    src="/public/projects/australian-light/process/lowfi-Search Result.svg"
                    alt="Low fidelity search results"
                    loading="lazy"
                  >
                </div>
                <figcaption>Search Results</figcaption>
              </figure>

            </div>
          </section>


          <!-- BROWSE -->
          <section class="al-lowfi-group">

            <div class="al-lowfi-group-head">
              <span>02</span>
              <h4>Browse</h4>
              <p>Filter, compare and inspect a print.</p>
            </div>

            
<div class="al-lowfi-grid al-lowfi-grid--browse">

  <figure>
    <div class="al-lowfi-frame">
      <img
        src="/public/projects/australian-light/process/lowfi-Product List.svg"
        alt="Low fidelity product list"
        loading="lazy"
      >
    </div>
    <figcaption>Product list</figcaption>
  </figure>

  <figure>
    <div class="al-lowfi-frame">
      <img
        src="/public/projects/australian-light/process/lowfi-Product List_Filter.svg"
        alt="Low fidelity product list filter"
        loading="lazy"
      >
    </div>
    <figcaption>Product list filter</figcaption>
  </figure>

  <figure>
    <div class="al-lowfi-frame">
      <img
        src="/public/projects/australian-light/process/lowfi-Product Detail.svg"
        alt="Low fidelity product detail"
        loading="lazy"
      >
    </div>
    <figcaption>Product detail</figcaption>
  </figure>

</div>
</section>



          <!-- PURCHASE -->
          <section class="al-lowfi-group">

            <div class="al-lowfi-group-head">
              <span>03</span>
              <h4>Purchase</h4>
              <p>Cart, delivery information and payment.</p>
            </div>

            <div class="al-lowfi-grid al-lowfi-grid--purchase">

              <figure>
                <div class="al-lowfi-frame">
                  <img
                    src="/public/projects/australian-light/process/lowfi-Cart.svg"
                    alt="Low fidelity shopping cart"
                    loading="lazy"
                  >
                </div>
                <figcaption>Cart</figcaption>
              </figure>

              <figure>
                <div class="al-lowfi-frame">
                  <img
                    src="/public/projects/australian-light/process/lowfi-Cart_Info.svg"
                    alt="Low fidelity checkout information"
                    loading="lazy"
                  >
                </div>
                <figcaption>Information</figcaption>
              </figure>

              <figure>
                <div class="al-lowfi-frame">
                  <img
                    src="/public/projects/australian-light/process/lowfi-Cart_Pay_01.svg"
                    alt="Low fidelity payment interface"
                    loading="lazy"
                  >
                </div>
                <figcaption>Payment</figcaption>
              </figure>

            </div>
          </section>

        </div>
      </section>

    </div>
  `;
}


/*
  renderAustralianLight() may insert its content after this file loads,
  so run once immediately and once after DOM mutations.
*/

rebuildAustralianLightProcess();

const alProcessObserver = new MutationObserver(() => {
  rebuildAustralianLightProcess();
});

alProcessObserver.observe(document.documentElement, {
  childList:true,
  subtree:true
});

/* ===== END AUSTRALIAN LIGHT — SECTION 03 EDITORIAL PROCESS ===== */


/* ===== AUSTRALIAN LIGHT — COMPACT SKETCH VIEWER ===== */

(()=>{
  const sketchDescriptions = [
    "Exploring the homepage hierarchy, image-led entry point and how collections and editorial content are introduced.",
    "Testing search, discovery and filtering so users can move from browsing to relevant photography more efficiently.",
    "Exploring how products are grouped, compared and understood before moving into a detailed product view.",
    "Testing the transition from product selection into cart and purchase, with a clearer path toward checkout."
  ];

  const enhanceSketchViewer = ()=>{
    if(
      !document.body.classList.contains("project-australian-light")
    ){
      return false;
    }

    const grid = document.querySelector(".al-sketch-grid");

    if(
      !grid ||
      grid.dataset.compactViewer === "1"
    ){
      return !!grid;
    }

    const cards = [...grid.querySelectorAll(".al-sketch-card")];

    if(cards.length < 2){
      return false;
    }

    const items = cards.map((card,index)=>{
      const img = card.querySelector("img");
      const title =
        card.querySelector("figcaption strong")?.textContent?.trim() ||
        `Sketch ${index + 1}`;

      return {
        src:img?.getAttribute("src") || "",
        alt:img?.getAttribute("alt") || title,
        title,
        description:
          sketchDescriptions[index] ||
          "Early interface exploration for Australian Light."
      };
    });

    grid.dataset.compactViewer = "1";

    grid.innerHTML = `
      <div class="al-sketch-viewer">

        <nav
          class="al-sketch-nav"
          aria-label="Sketch studies"
        >
          ${items.map((item,index)=>`
            <button
              class="al-sketch-nav-item ${index === 0 ? "is-active" : ""}"
              type="button"
              data-al-sketch-index="${index}"
            >
              <span class="al-sketch-nav-no">
                ${String(index + 1).padStart(2,"0")}
              </span>

              <span class="al-sketch-nav-title">
                ${item.title}
              </span>
            </button>
          `).join("")}
        </nav>


        <figure class="al-sketch-stage">

          <div class="al-sketch-stage-media">
            <img
              src="${items[0].src}"
              alt="${items[0].alt}"
              data-al-sketch-main-image
            >
          </div>

        </figure>


        <aside class="al-sketch-detail">

          <div class="al-sketch-detail-count">
            <span data-al-sketch-current>01</span>
            <span>/</span>
            <span>${String(items.length).padStart(2,"0")}</span>
          </div>

          <div class="al-sketch-detail-copy">
            <span
              class="al-sketch-detail-index"
              data-al-sketch-detail-index
            >
              01
            </span>

            <h4 data-al-sketch-title>
              ${items[0].title}
            </h4>

            <p data-al-sketch-description>
              ${items[0].description}
            </p>
          </div>

          <div class="al-sketch-arrows">

            <button
              type="button"
              aria-label="Previous sketch"
              data-al-sketch-prev
            >
              ←
            </button>

            <button
              type="button"
              aria-label="Next sketch"
              data-al-sketch-next
            >
              →
            </button>

          </div>

        </aside>

      </div>
    `;


    let activeIndex = 0;

    const image =
      grid.querySelector("[data-al-sketch-main-image]");

    const current =
      grid.querySelector("[data-al-sketch-current]");

    const detailIndex =
      grid.querySelector("[data-al-sketch-detail-index]");

    const title =
      grid.querySelector("[data-al-sketch-title]");

    const description =
      grid.querySelector("[data-al-sketch-description]");

    const buttons =
      [...grid.querySelectorAll("[data-al-sketch-index]")];


    const activate = index=>{

      activeIndex =
        (index + items.length) %
        items.length;

      const item =
        items[activeIndex];

      buttons.forEach((button,i)=>{
        button.classList.toggle(
          "is-active",
          i === activeIndex
        );
      });

      image.classList.add("is-changing");

      window.setTimeout(()=>{
        image.src = item.src;
        image.alt = item.alt;

        current.textContent =
          String(activeIndex + 1).padStart(2,"0");

        detailIndex.textContent =
          String(activeIndex + 1).padStart(2,"0");

        title.textContent =
          item.title;

        description.textContent =
          item.description;

        image.classList.remove("is-changing");
      },120);

    };


    buttons.forEach(button=>{

      button.addEventListener("click",()=>{

        activate(
          Number(button.dataset.alSketchIndex)
        );

      });

    });


    grid
      .querySelector("[data-al-sketch-prev]")
      ?.addEventListener(
        "click",
        ()=>activate(activeIndex - 1)
      );


    grid
      .querySelector("[data-al-sketch-next]")
      ?.addEventListener(
        "click",
        ()=>activate(activeIndex + 1)
      );


    return true;
  };


  if(!enhanceSketchViewer()){

    const observer =
      new MutationObserver(()=>{

        if(enhanceSketchViewer()){
          observer.disconnect();
        }

      });

    observer.observe(
      document.body,
      {
        childList:true,
        subtree:true
      }
    );

  }

})();

/* ===== END AUSTRALIAN LIGHT — COMPACT SKETCH VIEWER ===== */


/* ===== AUSTRALIAN LIGHT — LOWFI FLOW TABS ===== */

(()=>{
  const enhanceLowfiFlow = ()=>{

    if(
      !document.body.classList.contains(
        "project-australian-light"
      )
    ){
      return false;
    }

    const section =
      document.querySelector(".al-process-lowfi");

    const flow =
      section?.querySelector(".al-lowfi-flow");

    if(
      !section ||
      !flow ||
      flow.dataset.flowTabs === "1"
    ){
      return !!flow;
    }

    const groups =
      [...flow.querySelectorAll(".al-lowfi-group")];

    if(!groups.length){
      return false;
    }

    flow.dataset.flowTabs = "1";


    const items = groups.map((group,index)=>{

      const title =
        group.querySelector(
          ".al-lowfi-group-head h4"
        )?.textContent?.trim()
        || `Flow ${index + 1}`;

      const description =
        group.querySelector(
          ".al-lowfi-group-head p"
        )?.textContent?.trim()
        || "";

      const grid =
        group.querySelector(".al-lowfi-grid");

      return {
        title,
        description,
        html:grid?.outerHTML || ""
      };

    });


    flow.innerHTML = `
      <div class="al-lowfi-tabs">

        <div
          class="al-lowfi-tablist"
          role="tablist"
          aria-label="Low fidelity flows"
        >
          ${items.map((item,index)=>`
            <button
              type="button"
              role="tab"
              class="al-lowfi-tab ${index === 0 ? "is-active" : ""}"
              aria-selected="${index === 0 ? "true" : "false"}"
              data-al-lowfi-tab="${index}"
            >
              <span>
                ${String(index + 1).padStart(2,"0")}
              </span>

              <strong>
                ${item.title}
              </strong>
            </button>
          `).join("")}
        </div>


        <div class="al-lowfi-active">

          <div class="al-lowfi-active-meta">

            <div>
              <span
                class="al-lowfi-active-number"
                data-al-lowfi-number
              >
                01
              </span>

              <h4 data-al-lowfi-title>
                ${items[0].title}
              </h4>
            </div>

            <p data-al-lowfi-description>
              ${items[0].description}
            </p>

          </div>


          <div
            class="al-lowfi-active-stage"
            data-al-lowfi-stage
          >
            ${items[0].html}
          </div>

        </div>

      </div>
    `;


    const tabs =
      [...flow.querySelectorAll(
        "[data-al-lowfi-tab]"
      )];

    const number =
      flow.querySelector(
        "[data-al-lowfi-number]"
      );

    const title =
      flow.querySelector(
        "[data-al-lowfi-title]"
      );

    const description =
      flow.querySelector(
        "[data-al-lowfi-description]"
      );

    const stage =
      flow.querySelector(
        "[data-al-lowfi-stage]"
      );


    const activate = index=>{

      const item = items[index];

      if(!item) return;

      tabs.forEach((tab,i)=>{

        const active =
          i === index;

        tab.classList.toggle(
          "is-active",
          active
        );

        tab.setAttribute(
          "aria-selected",
          String(active)
        );

      });

      number.textContent =
        String(index + 1).padStart(2,"0");

      title.textContent =
        item.title;

      description.textContent =
        item.description;

      stage.classList.add("is-changing");

      window.setTimeout(()=>{

        stage.innerHTML =
          item.html;

        stage.classList.remove(
          "is-changing"
        );

      },120);

    };


    tabs.forEach(tab=>{

      tab.addEventListener(
        "click",
        ()=>{

          activate(
            Number(
              tab.dataset.alLowfiTab
            )
          );

        }
      );

    });


    return true;

  };


  if(!enhanceLowfiFlow()){

    const observer =
      new MutationObserver(()=>{

        if(enhanceLowfiFlow()){
          observer.disconnect();
        }

      });

    observer.observe(
      document.body,
      {
        childList:true,
        subtree:true
      }
    );

  }

})();

/* ===== END AUSTRALIAN LIGHT — LOWFI FLOW TABS ===== */


/* ===== AUSTRALIAN LIGHT — SECTION 04 TYPE SYSTEM ===== */

(()=>{
  const enhanceDirectionType = ()=>{

    if(
      !document.body.classList.contains(
        "project-australian-light"
      )
    ){
      return false;
    }

    const direction =
      document.querySelector(".al-direction");

    const left =
      direction?.querySelector(
        ".al-direction-layout > :first-child"
      );

    if(
      !left ||
      left.dataset.typeSystemReady === "1"
    ){
      return !!left;
    }

    const palette =
      left.querySelector(".al-palette");

    if(!palette){
      return false;
    }

    left.dataset.typeSystemReady = "1";


    /*
      Keep existing intro copy and palette.
      Replace only the old oversized type specimen.
    */

    const oldType =
      left.querySelector(".al-type");

    const oldDisplay =
      left.querySelector(".al-type-display");


    const typeSystem =
      document.createElement("div");

    typeSystem.className =
      "al-type al-type-system";

    typeSystem.innerHTML = `
      <div class="al-type-row">
        <span class="al-type-row-label">
          Headline
        </span>

        <span class="
          al-type-row-sample
          al-type-row-sample--headline
        ">
          AUSTRALIAN LIGHT
        </span>

        <span class="al-type-row-family">
          Canela Text
        </span>
      </div>

      <div class="al-type-row">
        <span class="al-type-row-label">
          Body
        </span>

        <span class="
          al-type-row-sample
          al-type-row-sample--body
        ">
          Welcome to AustralianLight Landscape Photography
        </span>

        <span class="al-type-row-family">
          Avenir
        </span>
      </div>
    `;


    if(oldType){

      oldType.replaceWith(typeSystem);

    }else if(oldDisplay){

      oldDisplay.replaceWith(typeSystem);

    }else{

      palette.insertAdjacentElement(
        "afterend",
        typeSystem
      );

    }


    return true;

  };


  if(!enhanceDirectionType()){

    const observer =
      new MutationObserver(()=>{

        if(enhanceDirectionType()){
          observer.disconnect();
        }

      });

    observer.observe(
      document.body,
      {
        childList:true,
        subtree:true
      }
    );

  }

})();

/* ===== END AUSTRALIAN LIGHT — SECTION 04 TYPE SYSTEM ===== */


/* ===== AUSTRALIAN LIGHT — SECTION 04 LEGACY LABEL CLEANUP ===== */

(()=>{
  const cleanupDirectionTypeLabel = ()=>{

    const left =
      document.querySelector(
        ".project-australian-light .al-direction-layout > :first-child"
      );

    if(!left) return false;

    [...left.children].forEach(el=>{

      const text =
        el.textContent
          ?.replace(/\s+/g," ")
          .trim();

      if(
        text === "Canela + Avenir" ||
        text === "Canela + Avenir."
      ){
        el.remove();
      }

    });

    return true;

  };


  if(!cleanupDirectionTypeLabel()){

    const observer =
      new MutationObserver(()=>{

        if(cleanupDirectionTypeLabel()){
          observer.disconnect();
        }

      });

    observer.observe(
      document.body,
      {
        childList:true,
        subtree:true
      }
    );

  }

})();

/* ===== END AUSTRALIAN LIGHT — SECTION 04 LEGACY LABEL CLEANUP ===== */


/* ===== AUSTRALIAN LIGHT — REMOVE LEGACY TYPE LABEL ===== */

(()=>{
  const removeLegacyDirectionLabel = ()=>{

    const left =
      document.querySelector(
        "body.project-australian-light .al-direction-layout > :first-child"
      );

    if(!left){
      return false;
    }

    const nodes =
      [...left.querySelectorAll("*")];

    nodes
      .filter(el=>{

        const text =
          el.textContent
            ?.replace(/\s+/g," ")
            .trim();

        if(text !== "Canela + Avenir"){
          return false;
        }

        /* remove deepest matching node only */
        return ![...el.children].some(child=>
          child.textContent
            ?.replace(/\s+/g," ")
            .trim() === "Canela + Avenir"
        );

      })
      .forEach(el=>el.remove());

    return true;
  };


  if(!removeLegacyDirectionLabel()){

    const observer =
      new MutationObserver(()=>{

        if(removeLegacyDirectionLabel()){
          observer.disconnect();
        }

      });

    observer.observe(
      document.body,
      {
        childList:true,
        subtree:true
      }
    );

  }

})();

/* ===== END AUSTRALIAN LIGHT — REMOVE LEGACY TYPE LABEL ===== */


/* ===== AUSTRALIAN LIGHT — SECTION 04 RATIONALE ===== */

(()=>{
  const enhanceDirectionRationale = ()=>{

    const left =
      document.querySelector(
        "body.project-australian-light .al-direction-layout > :first-child"
      );

    if(!left){
      return false;
    }

    if(left.querySelector(".al-direction-rationale")){
      return true;
    }

    const typeSystem =
      left.querySelector(
        ".al-type-system, .al-type"
      );

    if(!typeSystem){
      return false;
    }


    const rationale =
      document.createElement("div");

    rationale.className =
      "al-direction-rationale";

    rationale.innerHTML = `
      <div class="al-direction-rationale-item">
        <span>Colour</span>
        <p>
          Warm neutrals keep the interface restrained,
          allowing the photography to remain the focus.
        </p>
      </div>

      <div class="al-direction-rationale-item">
        <span>Typography</span>
        <p>
          Canela Text adds an editorial tone, while Avenir
          keeps interface content clear and functional.
        </p>
      </div>
    `;

    typeSystem.insertAdjacentElement(
      "afterend",
      rationale
    );

    return true;

  };


  if(!enhanceDirectionRationale()){

    const observer =
      new MutationObserver(()=>{

        if(enhanceDirectionRationale()){
          observer.disconnect();
        }

      });

    observer.observe(
      document.body,
      {
        childList:true,
        subtree:true
      }
    );

  }

})();

/* ===== END AUSTRALIAN LIGHT — SECTION 04 RATIONALE ===== */


/* ===== AUSTRALIAN LIGHT — SECTION 05 FLOW CONTROLS ===== */

(()=>{
  const initAustralianLightFlow = ()=>{

    if(
      !document.body.classList.contains(
        "project-australian-light"
      )
    ){
      return false;
    }


    const flow =
      document.querySelector(
        ".al-flow"
      );

    const rail =
      flow?.querySelector(
        ".al-flow-rail"
      );

    if(!flow || !rail){
      return false;
    }


    if(flow.dataset.flowNavReady === "1"){
      return true;
    }


    const cards =
      [...rail.querySelectorAll(
        ".al-flow-card"
      )];

    if(!cards.length){
      return false;
    }


    flow.dataset.flowNavReady = "1";


    /* -----------------------------------------------
       Create controls
       ----------------------------------------------- */

    const nav =
      document.createElement("div");

    nav.className =
      "al-flow-nav";

    nav.innerHTML = `
      <div class="al-flow-counter">
        <span data-flow-current>01</span>
        <span> / </span>
        <span data-flow-total>
          ${String(cards.length).padStart(2,"0")}
        </span>
      </div>

      <div class="al-flow-nav-buttons">
        <button
          class="al-flow-nav-button"
          type="button"
          data-flow-prev
          aria-label="Previous shopping flow stage"
        >
          ←
        </button>

        <button
          class="al-flow-nav-button"
          type="button"
          data-flow-next
          aria-label="Next shopping flow stage"
        >
          →
        </button>
      </div>
    `;


    rail.insertAdjacentElement(
      "beforebegin",
      nav
    );


    const prev =
      nav.querySelector(
        "[data-flow-prev]"
      );

    const next =
      nav.querySelector(
        "[data-flow-next]"
      );

    const current =
      nav.querySelector(
        "[data-flow-current]"
      );


    let activeIndex = 0;


    /* -----------------------------------------------
       Calculate the exact card position.

       We use rail.scrollLeft rather than
       scrollIntoView() so the main webpage does not
       move vertically.
       ----------------------------------------------- */

    const scrollToCard = index=>{

      activeIndex =
        Math.max(
          0,
          Math.min(
            cards.length - 1,
            index
          )
        );


      const card =
        cards[activeIndex];


      const railStyle =
        getComputedStyle(rail);


      const leftPadding =
        parseFloat(
          railStyle.paddingLeft
        ) || 0;


      rail.scrollTo({
        left:
          card.offsetLeft -
          leftPadding,

        behavior:"smooth"
      });


      updateControls();

    };


    const updateControls = ()=>{

      current.textContent =
        String(
          activeIndex + 1
        ).padStart(2,"0");


      prev.disabled =
        activeIndex === 0;


      next.disabled =
        activeIndex ===
        cards.length - 1;

    };


    prev.addEventListener(
      "click",
      ()=>scrollToCard(
        activeIndex - 1
      )
    );


    next.addEventListener(
      "click",
      ()=>scrollToCard(
        activeIndex + 1
      )
    );


    /* -----------------------------------------------
       Keep counter synced when user swipes manually.
       ----------------------------------------------- */

    let ticking = false;


    rail.addEventListener(
      "scroll",
      ()=>{

        if(ticking){
          return;
        }


        ticking = true;


        requestAnimationFrame(()=>{

          const railRect =
            rail.getBoundingClientRect();


          const railStyle =
            getComputedStyle(rail);


          const padding =
            parseFloat(
              railStyle.paddingLeft
            ) || 0;


          const targetX =
            railRect.left +
            padding;


          let nearest = 0;
          let nearestDistance =
            Infinity;


          cards.forEach(
            (card,index)=>{

              const rect =
                card.getBoundingClientRect();


              const distance =
                Math.abs(
                  rect.left -
                  targetX
                );


              if(
                distance <
                nearestDistance
              ){
                nearestDistance =
                  distance;

                nearest =
                  index;
              }

            }
          );


          if(
            nearest !==
            activeIndex
          ){
            activeIndex =
              nearest;

            updateControls();
          }


          ticking = false;

        });

      },
      {
        passive:true
      }
    );


    /* -----------------------------------------------
       Keyboard support when rail is focused.
       ----------------------------------------------- */

    rail.tabIndex = 0;


    rail.addEventListener(
      "keydown",
      event=>{

        if(
          event.key ===
          "ArrowRight"
        ){
          event.preventDefault();

          scrollToCard(
            activeIndex + 1
          );
        }


        if(
          event.key ===
          "ArrowLeft"
        ){
          event.preventDefault();

          scrollToCard(
            activeIndex - 1
          );
        }

      }
    );


    updateControls();


    /*
      Ensure initial state really starts from the
      content margin rather than a previously retained
      horizontal scroll position.
    */

    requestAnimationFrame(()=>{

      rail.scrollLeft = 0;

    });


    return true;

  };


  if(!initAustralianLightFlow()){

    const observer =
      new MutationObserver(()=>{

        if(initAustralianLightFlow()){
          observer.disconnect();
        }

      });


    observer.observe(
      document.body,
      {
        childList:true,
        subtree:true
      }
    );

  }

})();

/* ===== END AUSTRALIAN LIGHT — SECTION 05 FLOW CONTROLS ===== */

