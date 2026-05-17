import { useState, useEffect, useRef } from "react";

/* ─── Design tokens ─────────────────────────────────── */
const C = {
  ig1: "#405DE6", ig2: "#5851DB", ig3: "#833AB4",
  ig4: "#C13584", ig5: "#E1306C", ig6: "#FD1D1D",
  ig7: "#F56040", ig8: "#F77737", ig9: "#FCAF45", ig10: "#FFDC80",
  bg: "#07070e", bg2: "#0d0d1c",
  t1: "#f0f0f8", t2: "#8888a8", t3: "#50506a",
};
const GRAD = "linear-gradient(135deg,#833AB4 0%,#C13584 28%,#E1306C 52%,#F56040 76%,#FCAF45 100%)";
const FULL = "linear-gradient(45deg,#405DE6,#5851DB,#833AB4,#C13584,#E1306C,#FD1D1D,#F56040,#F77737,#FCAF45,#FFDC80)";
const COOL = "linear-gradient(135deg,#405DE6,#5851DB,#833AB4)";

/* ─── Global styles injected once ───────────────────── */
const CSS = `
@import url('https://fonts.googleapis.com/css2?family=Syne:wght@400;600;700;800&family=DM+Sans:opsz,wght@9..40,300;9..40,400;9..40,500&display=swap');
*,*::before,*::after{box-sizing:border-box;margin:0;padding:0}
html{scroll-behavior:smooth;font-size:16px}
body{background:#07070e;color:#f0f0f8;font-family:'DM Sans',sans-serif;line-height:1.6;overflow-x:hidden}
button{font-family:inherit;cursor:pointer}
a{color:inherit;text-decoration:none}
::selection{background:rgba(193,53,132,0.3)}
::-webkit-scrollbar{width:5px}
::-webkit-scrollbar-track{background:#07070e}
::-webkit-scrollbar-thumb{background:${GRAD};border-radius:99px}
@keyframes floatY{0%,100%{transform:translateY(0)}50%{transform:translateY(-10px)}}
@keyframes floatSm{0%,100%{transform:translateY(0)}50%{transform:translateY(-5px)}}
@keyframes pulseDot{0%,100%{opacity:1}50%{opacity:0.3}}
@keyframes spin{to{transform:rotate(360deg)}}
@keyframes barUp{from{transform:scaleY(0);transform-origin:bottom}to{transform:scaleY(1)}}
@keyframes marquee{to{transform:translateX(-50%)}}
@keyframes bpulse{0%,100%{box-shadow:0 0 0 0 rgba(193,53,132,0)}50%{box-shadow:0 0 0 4px rgba(193,53,132,0.15)}}
@keyframes reveal{from{opacity:0;transform:translateY(26px)}to{opacity:1;transform:none}}
.ig-text{background:${GRAD};-webkit-background-clip:text;-webkit-text-fill-color:transparent;background-clip:text}
.reveal-anim{animation:reveal 0.6s ease both}
`;

/* ─── Pointer Glow ────────────────────────────────── */
function PointerGlow() {
  const glowRef = useRef(null);
  const ringRef = useRef(null);
  const pos = useRef({ x: -300, y: -300 });
  const smooth = useRef({ x: -300, y: -300 });
  const raf = useRef(null);

  useEffect(() => {
    const onMove = e => { pos.current = { x: e.clientX, y: e.clientY }; };
    window.addEventListener("mousemove", onMove, { passive: true });

    const tick = () => {
      const lerpF = 0.12;
      smooth.current.x += (pos.current.x - smooth.current.x) * lerpF;
      smooth.current.y += (pos.current.y - smooth.current.y) * lerpF;
      if (glowRef.current) {
        glowRef.current.style.transform = `translate(${smooth.current.x}px,${smooth.current.y}px) translate(-50%,-50%)`;
      }
      if (ringRef.current) {
        // ring follows cursor directly (no lag) for a layered feel
        ringRef.current.style.transform = `translate(${pos.current.x}px,${pos.current.y}px) translate(-50%,-50%)`;
      }
      raf.current = requestAnimationFrame(tick);
    };
    raf.current = requestAnimationFrame(tick);

    return () => {
      window.removeEventListener("mousemove", onMove);
      cancelAnimationFrame(raf.current);
    };
  }, []);

  return (
    <>
      {/* Soft ambient glow — large, slow, lags behind */}
      <div ref={glowRef} style={{
        position: "fixed", top: 0, left: 0, zIndex: 9998,
        width: 480, height: 480, borderRadius: "50%",
        background: "radial-gradient(circle,rgba(193,53,132,0.13) 0%,rgba(131,58,180,0.07) 40%,transparent 70%)",
        pointerEvents: "none", willChange: "transform",
      }} />
      {/* Crisp ring — snaps to cursor */}
      <div ref={ringRef} style={{
        position: "fixed", top: 0, left: 0, zIndex: 9999,
        width: 28, height: 28, borderRadius: "50%",
        border: "1.5px solid rgba(193,53,132,0.55)",
        boxShadow: "0 0 10px rgba(193,53,132,0.35), inset 0 0 6px rgba(193,53,132,0.15)",
        pointerEvents: "none", willChange: "transform",
        transition: "width 0.2s, height 0.2s, border-color 0.2s",
      }} />
    </>
  );
}

/* ─── Particle canvas ─────────────────────────────── */
const IG_COLS = ["64,93,230","88,81,219","131,58,180","193,53,132","225,48,108","245,96,64","252,175,69"];

function ParticleCanvas() {
  const ref = useRef(null);
  useEffect(() => {
    const canvas = ref.current;
    const ctx = canvas.getContext("2d");
    const resize = () => { canvas.width = window.innerWidth; canvas.height = window.innerHeight; };
    resize();
    window.addEventListener("resize", resize, { passive: true });

    class Particle {
      constructor() { this.reset(true); }
      reset(init = false) {
        this.x = init ? Math.random() * canvas.width : (Math.random() < 0.5 ? -5 : canvas.width + 5);
        this.y = Math.random() * canvas.height;
        this.r = Math.random() * 1.5 + 0.3;
        this.vx = (Math.random() - 0.5) * 0.35;
        this.vy = (Math.random() - 0.5) * 0.35;
        this.op = Math.random() * 0.5 + 0.1;
        this.c = IG_COLS[Math.floor(Math.random() * IG_COLS.length)];
        this.life = 0; this.maxLife = 360 + Math.random() * 400;
      }
      update() {
        this.x += this.vx; this.y += this.vy; this.life++;
        if (this.life > this.maxLife || this.x < -10 || this.x > canvas.width + 10 || this.y < -10 || this.y > canvas.height + 10) this.reset();
      }
      draw() {
        ctx.beginPath(); ctx.arc(this.x, this.y, this.r, 0, Math.PI * 2);
        ctx.fillStyle = `rgba(${this.c},${this.op})`; ctx.fill();
      }
    }

    const PARTS = Array.from({ length: 85 }, () => new Particle());
    const ORBS = [
      { rx: 0.08, ry: 0.12, r: 340, c: "131,58,180", o: 0.12 },
      { rx: 0.88, ry: 0.50, r: 300, c: "193,53,132", o: 0.10 },
      { rx: 0.50, ry: 0.88, r: 260, c: "245,96,64",  o: 0.08 },
      { rx: 0.25, ry: 0.68, r: 200, c: "225,48,108", o: 0.06 },
      { rx: 0.74, ry: 0.20, r: 180, c: "64,93,230",  o: 0.06 },
    ];

    const drawOrbs = () => ORBS.forEach(({ rx, ry, r, c, o }) => {
      const cx = rx * canvas.width, cy = ry * canvas.height;
      const g = ctx.createRadialGradient(cx, cy, 0, cx, cy, r);
      g.addColorStop(0, `rgba(${c},${o})`); g.addColorStop(0.5, `rgba(${c},${o * 0.4})`); g.addColorStop(1, "transparent");
      ctx.beginPath(); ctx.arc(cx, cy, r, 0, Math.PI * 2); ctx.fillStyle = g; ctx.fill();
    });

    const drawLines = () => {
      for (let i = 0; i < PARTS.length; i++) for (let j = i + 1; j < PARTS.length; j++) {
        const dx = PARTS[i].x - PARTS[j].x, dy = PARTS[i].y - PARTS[j].y;
        const d = Math.sqrt(dx * dx + dy * dy);
        if (d < 90) {
          ctx.beginPath(); ctx.strokeStyle = `rgba(193,53,132,${0.07 * (1 - d / 90)})`; ctx.lineWidth = 0.5;
          ctx.moveTo(PARTS[i].x, PARTS[i].y); ctx.lineTo(PARTS[j].x, PARTS[j].y); ctx.stroke();
        }
      }
    };

    let raf;
    const animate = () => {
      ctx.clearRect(0, 0, canvas.width, canvas.height);
      drawOrbs(); drawLines();
      PARTS.forEach(p => { p.update(); p.draw(); });
      raf = requestAnimationFrame(animate);
    };
    animate();
    return () => { window.removeEventListener("resize", resize); cancelAnimationFrame(raf); };
  }, []);
  return <canvas ref={ref} style={{ position: "fixed", inset: 0, width: "100%", height: "100%", pointerEvents: "none", zIndex: 0, opacity: 0.55 }} />;
}

/* ─── Scroll reveal hook ──────────────────────────── */
function useReveal() {
  const ref = useRef(null);
  const [vis, setVis] = useState(false);
  useEffect(() => {
    const obs = new IntersectionObserver(([e]) => { if (e.isIntersecting) setVis(true); }, { threshold: 0.1, rootMargin: "0px 0px -30px 0px" });
    if (ref.current) obs.observe(ref.current);
    return () => obs.disconnect();
  }, []);
  return [ref, vis];
}

function Reveal({ children, delay = 0, style = {}, as: Tag = "div", ...props }) {
  const [ref, vis] = useReveal();
  return (
    <Tag ref={ref} style={{ opacity: vis ? 1 : 0, transform: vis ? "none" : "translateY(26px)", transition: `opacity 0.6s ease ${delay}s, transform 0.6s ease ${delay}s`, ...style }} {...props}>
      {children}
    </Tag>
  );
}

/* ─── Nav ─────────────────────────────────────────── */
function Navbar({ mobOpen, setMobOpen }) {
  const [scrolled, setScrolled] = useState(false);
  useEffect(() => {
    const h = () => setScrolled(window.scrollY > 50);
    window.addEventListener("scroll", h, { passive: true });
    return () => window.removeEventListener("scroll", h);
  }, []);

  const navStyle = {
    position: "fixed", top: 0, left: 0, right: 0, zIndex: 200,
    display: "flex", alignItems: "center", justifyContent: "space-between",
    padding: "14px clamp(18px,5vw,80px)",
    background: scrolled ? "rgba(7,7,14,0.96)" : "rgba(7,7,14,0.55)",
    backdropFilter: "blur(24px) saturate(180%)",
    borderBottom: `1px solid ${scrolled ? "rgba(255,255,255,0.13)" : "rgba(255,255,255,0.07)"}`,
    transition: "background 0.3s, border-color 0.3s",
  };

  return (
    <nav style={navStyle}>
      <div style={{ display: "flex", alignItems: "center", gap: 9 }}>
        <div style={{ width: 30, height: 30, borderRadius: 8, background: GRAD, padding: 3, display: "flex", alignItems: "center", justifyContent: "center" }}>
          <svg viewBox="0 0 24 24" fill="none" width="100%" height="100%">
            <rect x="2" y="2" width="20" height="20" rx="5.5" stroke="white" strokeWidth="1.6"/>
            <circle cx="12" cy="12" r="4" stroke="white" strokeWidth="1.6"/>
            <circle cx="17.5" cy="6.5" r="1.2" fill="white"/>
          </svg>
        </div>
        <span className="ig-text" style={{ fontFamily: "'Syne',sans-serif", fontSize: "clamp(1rem,2.5vw,1.3rem)", fontWeight: 800, letterSpacing: "-0.03em" }}>InstaPost</span>
      </div>

      <ul style={{ display: "flex", gap: "clamp(14px,2.5vw,30px)", listStyle: "none", ["@media(max-width:900px)"]: { display: "none" } }} className="nav-links-desktop">
        {["Features","How it Works","Templates","Benefits"].map(l => (
          <li key={l}><a href={`#${l.toLowerCase().replace(/ /g,"-")}`} style={{ color: C.t2, fontSize: "0.875rem", transition: "color 0.2s" }}>{l}</a></li>
        ))}
      </ul>

      <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
        <button style={{ background: GRAD, color: "#fff", border: "none", padding: "9px 20px", borderRadius: 99, fontSize: "0.84rem", fontWeight: 600, boxShadow: "0 0 18px rgba(193,53,132,0.3)", whiteSpace: "nowrap" }} className="nav-cta-desktop">
          Get Started Free
        </button>
        <button onClick={() => setMobOpen(o => !o)} style={{ display: "flex", flexDirection: "column", gap: 4, padding: 7, borderRadius: 8, background: "rgba(255,255,255,0.07)", border: "1px solid rgba(255,255,255,0.13)" }} aria-label="Menu">
          {[0,1,2].map(i => (
            <span key={i} style={{ display: "block", width: 20, height: 2, background: mobOpen && i === 1 ? "transparent" : mobOpen ? C.ig4 : C.t2, borderRadius: 2, transform: mobOpen ? (i===0?"translateY(6px) rotate(45deg)":i===2?"translateY(-6px) rotate(-45deg)":"none") : "none", transition: "transform 0.3s, opacity 0.3s, background 0.3s" }} />
          ))}
        </button>
      </div>

      <style>{`
        @media(min-width:901px){.nav-links-desktop{display:flex!important}.nav-cta-desktop{display:block!important}}
        @media(max-width:900px){.nav-links-desktop{display:none!important}.nav-cta-desktop{display:none!important}}
      `}</style>
    </nav>
  );
}

/* ─── Mobile Overlay ──────────────────────────────── */
function MobOverlay({ open, onClose }) {
  useEffect(() => { document.body.style.overflow = open ? "hidden" : ""; return () => { document.body.style.overflow = ""; }; }, [open]);
  useEffect(() => { const h = e => e.key === "Escape" && onClose(); document.addEventListener("keydown", h); return () => document.removeEventListener("keydown", h); }, [onClose]);
  return (
    <div style={{ position: "fixed", inset: 0, background: "rgba(7,7,14,0.98)", backdropFilter: "blur(28px)", zIndex: 190, display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", gap: 20, transform: open ? "none" : "translateY(-100%)", transition: "transform 0.4s cubic-bezier(0.4,0,0.2,1)" }}>
      {["Features","How it Works","Templates","Benefits"].map(l => (
        <a key={l} href={`#${l.toLowerCase().replace(/ /g,"-")}`} onClick={onClose} style={{ fontFamily: "'Syne',sans-serif", fontSize: "clamp(1.6rem,7vw,2.2rem)", fontWeight: 700, color: C.t2 }}>{l}</a>
      ))}
      <div style={{ width: 36, height: 2, borderRadius: 2, background: GRAD }} />
      <button onClick={onClose} style={{ background: GRAD, color: "#fff", border: "none", padding: "14px 40px", borderRadius: 99, fontFamily: "'Syne',sans-serif", fontSize: "1rem", fontWeight: 700, boxShadow: "0 0 24px rgba(193,53,132,0.4)" }}>
        Get Started Free →
      </button>
    </div>
  );
}

/* ─── Hero Section ────────────────────────────────── */
function HeroSection() {
  const [url, setUrl] = useState("");
  const [btnState, setBtnState] = useState("idle"); // idle | analyzing | generating | done
  const inputRef = useRef(null);
  const boxRef = useRef(null);

  const handleGenerate = () => {
    if (!url.trim()) {
      boxRef.current.style.borderColor = "rgba(225,48,108,0.55)";
      boxRef.current.style.boxShadow = "0 0 0 3px rgba(225,48,108,0.12)";
      inputRef.current.placeholder = "⚠️ Please enter an article URL first…";
      inputRef.current.focus();
      setTimeout(() => {
        if (boxRef.current) { boxRef.current.style.borderColor = ""; boxRef.current.style.boxShadow = ""; }
        if (inputRef.current) inputRef.current.placeholder = "https://paste-any-news-article-url.com…";
      }, 2600);
      return;
    }
    setBtnState("analyzing");
    setTimeout(() => setBtnState("generating"), 1500);
    setTimeout(() => { setBtnState("done"); setTimeout(() => setBtnState("idle"), 2800); }, 3000);
  };

  const btnContent = {
    idle: <><svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" width="13" height="13"><polygon points="5 3 19 12 5 21 5 3"/></svg> Generate Post</>,
    analyzing: <><span style={{ display: "inline-block", animation: "spin .7s linear infinite" }}>◌</span> Analyzing…</>,
    generating: <><span style={{ display: "inline-block", animation: "spin .7s linear infinite" }}>◌</span> Generating…</>,
    done: "✓ Post Ready!",
  };
  const btnBg = { idle: GRAD, analyzing: COOL, generating: "linear-gradient(135deg,#833AB4,#C13584)", done: "linear-gradient(135deg,#10b981,#059669)" };

  return (
    <section id="hero" style={{ position: "relative", zIndex: 1, minHeight: "100vh", display: "grid", gridTemplateColumns: "1fr 1fr", alignItems: "center", gap: "clamp(32px,5vw,64px)", padding: "clamp(100px,13vw,148px) clamp(18px,5vw,80px) clamp(60px,7vw,90px)" }}>
      <style>{`
        @media(max-width:900px){#hero{grid-template-columns:1fr!important;text-align:center!important;padding-top:clamp(90px,15vw,130px)!important}
        #hero-content{order:2!important}#hero-visual{order:1!important}
        .hero-badge{margin:0 auto 20px!important}.hero-sub{margin-left:auto!important;margin-right:auto!important}.hero-stats{justify-content:center!important}}
      `}</style>

      {/* Deco ring */}
      <div style={{ position: "absolute", pointerEvents: "none", width: "clamp(300px,45vw,620px)", height: "clamp(300px,45vw,620px)", borderRadius: "50%", background: "conic-gradient(from 0deg,#405DE6,#833AB4,#E1306C,#F56040,#FCAF45,#405DE6)", opacity: 0.06, right: "-6%", top: "50%", transform: "translateY(-50%)" }} />

      {/* Left */}
      <div id="hero-content" style={{ position: "relative", zIndex: 2 }}>
        <div className="hero-badge" style={{ display: "inline-flex", alignItems: "center", gap: 8, background: "rgba(193,53,132,0.1)", border: "1px solid rgba(193,53,132,0.3)", borderRadius: 99, padding: "5px 14px", fontSize: "0.73rem", fontWeight: 600, color: C.ig4, marginBottom: 20 }}>
          <span style={{ width: 6, height: 6, borderRadius: "50%", background: C.ig4, animation: "pulseDot 2s infinite", flexShrink: 0 }} />
          Powered by Advanced AI ✦
        </div>

        <h1 style={{ fontFamily: "'Syne',sans-serif", fontSize: "clamp(2rem,4.6vw,3.9rem)", fontWeight: 800, lineHeight: 1.06, letterSpacing: "-0.04em" }}>
          Turn News Articles<br/>
          Into <span className="ig-text">Instagram Posts</span><br/>
          Using AI
        </h1>

        <p className="hero-sub" style={{ color: C.t2, marginTop: 18, fontSize: "clamp(0.9rem,1.5vw,1.05rem)", fontWeight: 300, lineHeight: 1.72, maxWidth: 475 }}>
          Generate professional, eye-catching Instagram news posts instantly from any article URL. Paste, generate, post — in under 10 seconds.
        </p>

        <div style={{ marginTop: 32 }}>
          <div ref={boxRef} style={{ display: "flex", alignItems: "center", background: "rgba(255,255,255,0.07)", border: "1px solid rgba(255,255,255,0.13)", borderRadius: 99, padding: "5px 5px 5px 18px", transition: "border-color 0.25s, box-shadow 0.25s" }}>
            <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="#50506a" strokeWidth="2" style={{ flexShrink: 0, marginRight: 6, opacity: 0.5 }}>
              <circle cx="11" cy="11" r="8"/><path d="m21 21-4.35-4.35"/>
            </svg>
            <input ref={inputRef} type="url" value={url} onChange={e => setUrl(e.target.value)} onKeyDown={e => e.key === "Enter" && handleGenerate()}
              placeholder="https://paste-any-news-article-url.com…"
              style={{ flex: 1, minWidth: 0, background: "transparent", border: "none", outline: "none", color: C.t1, fontFamily: "'DM Sans',sans-serif", fontSize: "clamp(0.78rem,1.4vw,0.9rem)", padding: "8px 0" }} />
            <button onClick={handleGenerate} disabled={btnState !== "idle"}
              style={{ background: btnBg[btnState], color: "#fff", border: "none", padding: "clamp(10px,2vw,13px) clamp(14px,2.2vw,24px)", borderRadius: 99, fontFamily: "'Syne',sans-serif", fontSize: "clamp(0.76rem,1.3vw,0.88rem)", fontWeight: 700, display: "flex", alignItems: "center", gap: 6, whiteSpace: "nowrap", flexShrink: 0, boxShadow: "0 0 20px rgba(193,53,132,0.4)", transition: "transform 0.2s, box-shadow 0.2s, opacity 0.2s", opacity: btnState !== "idle" ? 0.75 : 1 }}>
              {btnContent[btnState]}
            </button>
          </div>
          <p style={{ marginTop: 10, fontSize: "0.71rem", color: C.t3, paddingLeft: 5 }}>✦ Works with CNN, BBC, Reuters, TechCrunch &amp; more</p>
        </div>

        <div className="hero-stats" style={{ display: "flex", alignItems: "center", gap: "clamp(16px,3.5vw,32px)", marginTop: 34, flexWrap: "wrap" }}>
          {[["50K+","Posts Generated"],["8.2s","Avg. Generate Time"],["98%","Satisfaction Rate"]].map(([val, lbl], i) => (
            <div key={val} style={{ display: "flex", alignItems: "center", gap: "clamp(16px,3.5vw,32px)" }}>
              {i > 0 && <div style={{ width: 1, alignSelf: "stretch", background: "rgba(255,255,255,0.13)" }} />}
              <div>
                <div className="ig-text" style={{ fontFamily: "'Syne',sans-serif", fontSize: "clamp(1.1rem,2.3vw,1.5rem)", fontWeight: 800 }}>{val}</div>
                <div style={{ fontSize: "0.7rem", color: C.t3, marginTop: 2 }}>{lbl}</div>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Right: Phone */}
      <div id="hero-visual" style={{ position: "relative", zIndex: 2, display: "flex", justifyContent: "center", alignItems: "center", padding: "24px 40px" }}>
        <div style={{ position: "absolute", width: 280, height: 280, borderRadius: "50%", background: "radial-gradient(circle,rgba(193,53,132,0.3) 0%,rgba(131,58,180,0.14) 50%,transparent 70%)", pointerEvents: "none", zIndex: 0 }} />

        <div style={{ position: "relative", zIndex: 1, borderRadius: 30, padding: 3, background: FULL, boxShadow: "0 0 50px rgba(193,53,132,0.25),0 0 100px rgba(131,58,180,0.12),0 40px 80px rgba(0,0,0,0.7)", animation: "floatY 5s ease-in-out infinite" }}>
          <div style={{ width: "clamp(210px,26vw,280px)", background: "#0d0d1c", borderRadius: 28, overflow: "hidden" }}>
            {/* Header */}
            <div style={{ background: "linear-gradient(135deg,#14082a,#070820)", padding: "11px 13px", display: "flex", alignItems: "center", gap: 9, borderBottom: "1px solid rgba(255,255,255,0.06)" }}>
              <div style={{ width: 33, height: 33, borderRadius: "50%", background: GRAD, padding: 2, flexShrink: 0 }}>
                <div style={{ width: "100%", height: "100%", borderRadius: "50%", background: "linear-gradient(135deg,#833AB4,#E1306C)", display: "flex", alignItems: "center", justifyContent: "center", fontSize: "0.62rem", fontWeight: 800, color: "#fff" }}>IP</div>
              </div>
              <div>
                <div style={{ fontSize: "0.73rem", fontWeight: 700 }}>breakingnews.ai <span style={{ display: "inline-flex", alignItems: "center", justifyContent: "center", width: 11, height: 11, borderRadius: "50%", background: C.ig1, fontSize: "0.48rem", color: "#fff", marginLeft: 2 }}>✓</span></div>
                <div style={{ fontSize: "0.6rem", color: C.t3, marginTop: 1 }}>AI Generated · Just now</div>
              </div>
              <div style={{ marginLeft: "auto", color: C.t3, fontSize: "1rem", letterSpacing: 1 }}>···</div>
            </div>

            {/* Image */}
            <div style={{ width: "100%", aspectRatio: "1/1", background: "linear-gradient(145deg,#180828 0%,#2d1060 40%,#180d40 70%,#0c1838 100%)", position: "relative", overflow: "hidden", display: "flex", flexDirection: "column", justifyContent: "flex-end", padding: 14 }}>
              <div style={{ position: "absolute", inset: 0, background: "linear-gradient(to bottom,transparent 35%,rgba(0,0,0,0.75) 100%)" }} />
              <div style={{ position: "absolute", width: 100, height: 100, borderRadius: "50%", background: "radial-gradient(circle,rgba(193,53,132,0.22),transparent)", top: 8, right: 8 }} />
              <div style={{ position: "absolute", width: 60, height: 60, borderRadius: "50%", background: "radial-gradient(circle,rgba(245,96,64,0.18),transparent)", top: 50, left: 15 }} />
              <div style={{ background: "linear-gradient(90deg,#E1306C,#FD1D1D)", color: "#fff", fontSize: "0.52rem", fontWeight: 800, padding: "3px 8px", borderRadius: 4, width: "fit-content", letterSpacing: "0.13em", textTransform: "uppercase", marginBottom: 6, position: "relative", zIndex: 2 }}>🔴 Breaking News</div>
              <div style={{ fontFamily: "'Syne',sans-serif", fontSize: "clamp(0.68rem,1.2vw,0.76rem)", fontWeight: 800, lineHeight: 1.3, color: "#fff", position: "relative", zIndex: 2, textShadow: "0 2px 10px rgba(0,0,0,0.5)" }}>Global AI Summit Reaches Historic Agreement on Ethical Guidelines</div>
              <div style={{ height: 2, borderRadius: 99, background: GRAD, marginTop: 8, position: "relative", zIndex: 2 }} />
            </div>

            {/* Caption */}
            <div style={{ padding: "10px 13px", fontSize: "0.72rem", color: C.t2, lineHeight: 1.55, borderBottom: "1px solid rgba(255,255,255,0.05)" }}>
              World leaders agreed on landmark AI regulations reshaping how tech companies operate globally…<br/><br/>
              <strong style={{ color: C.t1 }}>#AINews</strong> <strong style={{ color: C.t1 }}>#Technology</strong> <strong style={{ color: C.t1 }}>#Breaking</strong>
            </div>

            {/* Actions */}
            <div style={{ padding: "8px 13px", display: "flex", alignItems: "center", gap: 10 }}>
              {["♡","💬","✈️"].map(a => <span key={a} style={{ fontSize: "0.95rem", cursor: "pointer" }}>{a}</span>)}
              <span style={{ marginLeft: "auto", fontSize: "0.65rem", fontWeight: 600, color: C.t1 }}>24.8K likes</span>
            </div>
          </div>
        </div>

        {/* Floating pills */}
        {[
          { style: { top: 0, right: 0, animation: "floatSm 4s ease-in-out infinite" }, content: <><div style={{ width: 7, height: 7, borderRadius: "50%", background: "#10b981" }} /> Generated in <strong style={{ color: "#10b981", marginLeft: 3 }}>7.2s</strong></> },
          { style: { bottom: 16, left: 0, animation: "floatSm 4.5s 1.1s ease-in-out infinite" }, content: <><div style={{ width: 7, height: 7, borderRadius: "50%", background: C.ig4 }} /> <span className="ig-text">✦ Ready to post</span></> },
          { style: { top: "40%", left: "-10px", animation: "floatSm 5s 0.5s ease-in-out infinite" }, content: "📈 +2.4K reach boost" },
        ].map((p, i) => (
          <div key={i} style={{ position: "absolute", zIndex: 3, background: "rgba(10,6,20,0.92)", backdropFilter: "blur(14px)", border: "1px solid rgba(255,255,255,0.13)", borderRadius: 11, padding: "10px 14px", fontSize: "0.71rem", fontWeight: 500, display: "flex", alignItems: "center", gap: 6, ...p.style }}>{p.content}</div>
        ))}
      </div>
    </section>
  );
}

/* ─── Marquee ─────────────────────────────────────── */
const MARQUEE_ITEMS = [
  ["🤖","AI-Powered"],["📰","News to Posts"],["⚡","Instant Export"],["🎨","10+ Templates"],
  ["📱","Instagram Ready"],["✨","Smart Captions"],["🚀","Grow Faster"],["🔗","Any URL Works"],
  ["🌐","50K+ Posts Made"],["🎯","Consistent Brand"],["⏱️","8s Generation"],["📈","3× Audience Growth"],
];

function Marquee() {
  const doubled = [...MARQUEE_ITEMS, ...MARQUEE_ITEMS];
  return (
    <div style={{ overflow: "hidden", borderTop: "1px solid rgba(255,255,255,0.07)", borderBottom: "1px solid rgba(255,255,255,0.07)", background: "rgba(255,255,255,0.02)", position: "relative", zIndex: 1 }} aria-hidden="true">
      <div style={{ display: "flex", animation: "marquee 28s linear infinite", width: "max-content" }}>
        {doubled.map(([icon, label], i) => (
          <div key={i} style={{ display: "inline-flex", alignItems: "center", gap: 8, padding: "12px 20px", whiteSpace: "nowrap", borderRight: "1px solid rgba(255,255,255,0.07)", fontSize: "0.78rem", fontWeight: 500, color: C.t2 }}>
            <span style={{ fontSize: "0.9rem" }}>{icon}</span>{label}
          </div>
        ))}
      </div>
    </div>
  );
}

/* ─── Section wrapper ──────────────────────────────── */
function Section({ id, children, style = {} }) {
  return (
    <section id={id} style={{ padding: "clamp(60px,8vw,110px) clamp(18px,5vw,80px)", position: "relative", zIndex: 1, ...style }}>
      {children}
    </section>
  );
}

function SecLabel({ children }) {
  return (
    <div style={{ display: "inline-flex", alignItems: "center", gap: 8, fontSize: "0.7rem", fontWeight: 700, letterSpacing: "0.18em", textTransform: "uppercase", color: C.ig4, marginBottom: 12 }}>
      <span style={{ width: 18, height: 2, borderRadius: 2, background: GRAD, flexShrink: 0 }} />{children}
    </div>
  );
}

/* ─── Features ─────────────────────────────────────── */
const FEATURES = [
  { icon: "🧠", title: "AI Headline Generation", desc: "Distills complex articles into punchy, scroll-stopping headlines optimized for Instagram engagement and maximum reach.", bg: "rgba(131,58,180,0.15)" },
  { icon: "⚡", title: "Smart Summarization",    desc: "Compresses lengthy news into concise, readable captions that fit perfectly within Instagram's character limits.", bg: "rgba(193,53,132,0.15)" },
  { icon: "🎨", title: "Instagram Templates",    desc: "A growing library of professionally designed templates — breaking news, finance, lifestyle, sports, and many more.", bg: "rgba(225,48,108,0.15)" },
  { icon: "🤖", title: "AI-Powered Design",      desc: "Auto-generates visuals, picks Instagram-branded color palettes, and arranges layouts tailored to your content's tone.", bg: "rgba(245,96,64,0.15)" },
  { icon: "📦", title: "Fast Export",            desc: "Export pixel-perfect PNG or MP4 in seconds. Ready for immediate upload to Instagram or any scheduling tool.", bg: "rgba(247,119,55,0.15)" },
  { icon: "📱", title: "Social Media Ready",     desc: "All outputs pre-optimized for Instagram's dimensions, aspect ratios, and character limits — zero manual work needed.", bg: "rgba(252,175,69,0.15)" },
];

function Features() {
  return (
    <Section id="features">
      <SecLabel>Features</SecLabel>
      <Reveal><h2 style={{ fontFamily: "'Syne',sans-serif", fontSize: "clamp(1.7rem,3.2vw,2.8rem)", fontWeight: 800, lineHeight: 1.1, letterSpacing: "-0.04em" }}>Everything You Need to Go Viral</h2></Reveal>
      <Reveal delay={0.07}><p style={{ color: C.t2, marginTop: 14, fontSize: "clamp(0.88rem,1.5vw,1rem)", fontWeight: 300, lineHeight: 1.72, maxWidth: 520 }}>Six powerful AI-driven tools working in one seamless, lightning-fast workflow.</p></Reveal>

      <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit,minmax(260px,1fr))", gap: 16, marginTop: 40 }}>
        {FEATURES.map((f, i) => (
          <Reveal key={f.title} delay={[0.07,0.14,0.21][i % 3]}>
            <div style={{ position: "relative", overflow: "hidden", background: "rgba(255,255,255,0.04)", border: "1px solid rgba(255,255,255,0.07)", borderRadius: 20, padding: "clamp(18px,2.5vw,26px)", transition: "transform 0.3s, border-color 0.3s, box-shadow 0.3s", cursor: "default" }}
              onMouseEnter={e => { e.currentTarget.style.transform = "translateY(-6px)"; e.currentTarget.style.borderColor = "rgba(193,53,132,0.3)"; e.currentTarget.style.boxShadow = "0 0 40px rgba(193,53,132,0.1)"; }}
              onMouseLeave={e => { e.currentTarget.style.transform = ""; e.currentTarget.style.borderColor = ""; e.currentTarget.style.boxShadow = ""; }}>
              <div style={{ position: "absolute", top: 0, left: 0, right: 0, height: 2, background: GRAD, borderRadius: "20px 20px 0 0" }} />
              <div style={{ width: 46, height: 46, borderRadius: 13, background: f.bg, display: "flex", alignItems: "center", justifyContent: "center", fontSize: "1.2rem", marginBottom: 14, boxShadow: "0 0 18px rgba(193,53,132,0.15)" }}>{f.icon}</div>
              <h3 style={{ fontFamily: "'Syne',sans-serif", fontSize: "clamp(0.9rem,1.5vw,1rem)", fontWeight: 700, marginBottom: 8 }}>{f.title}</h3>
              <p style={{ fontSize: "clamp(0.8rem,1.2vw,0.86rem)", color: C.t2, lineHeight: 1.65 }}>{f.desc}</p>
            </div>
          </Reveal>
        ))}
      </div>
    </Section>
  );
}

/* ─── How It Works ─────────────────────────────────── */
const STEPS = [
  { num: "01", emoji: "🔗", title: "Paste Article URL",     desc: "Copy any news article URL from CNN, BBC, Reuters, or TechCrunch. InstaPost handles scraping and parsing automatically." },
  { num: "02", emoji: "✨", title: "AI Generates Content",  desc: "Advanced AI reads the article, crafts the perfect headline, writes captions, and assembles a stunning post in seconds." },
  { num: "03", emoji: "⬇️", title: "Download & Post",       desc: "Preview, fine-tune if needed, export and share directly to Instagram — or schedule it for peak engagement hours." },
];

function HowItWorks() {
  return (
    <Section id="how-it-works">
      <SecLabel>Process</SecLabel>
      <Reveal><h2 style={{ fontFamily: "'Syne',sans-serif", fontSize: "clamp(1.7rem,3.2vw,2.8rem)", fontWeight: 800, lineHeight: 1.1, letterSpacing: "-0.04em" }}>Three Steps to Your Next Viral Post</h2></Reveal>
      <Reveal delay={0.07}><p style={{ color: C.t2, marginTop: 14, fontSize: "clamp(0.88rem,1.5vw,1rem)", fontWeight: 300, lineHeight: 1.72, maxWidth: 520 }}>From article URL to Instagram-ready post in under 10 seconds. Zero design skills needed.</p></Reveal>

      <div style={{ display: "flex", alignItems: "center", gap: 16, marginTop: 40, flexWrap: "wrap" }}>
        {STEPS.map((s, i) => (
          <>
            <Reveal key={s.num} delay={i * 0.07} style={{ flex: 1, minWidth: 220 }}>
              <div style={{ background: "rgba(255,255,255,0.04)", border: "1px solid rgba(255,255,255,0.07)", borderRadius: 20, padding: "clamp(22px,3vw,30px)", transition: "transform 0.3s, border-color 0.3s", cursor: "default" }}
                onMouseEnter={e => { e.currentTarget.style.transform = "translateY(-4px)"; e.currentTarget.style.borderColor = "rgba(193,53,132,0.25)"; }}
                onMouseLeave={e => { e.currentTarget.style.transform = ""; e.currentTarget.style.borderColor = ""; }}>
                <div className="ig-text" style={{ fontFamily: "'Syne',sans-serif", fontSize: "clamp(1.8rem,3vw,2.2rem)", fontWeight: 800, opacity: 0.4 }}>{s.num}</div>
                <div style={{ fontSize: "2.2rem", margin: "10px 0" }}>{s.emoji}</div>
                <h3 style={{ fontFamily: "'Syne',sans-serif", fontSize: "clamp(0.95rem,1.6vw,1.05rem)", fontWeight: 700, marginBottom: 10 }}>{s.title}</h3>
                <p style={{ fontSize: "clamp(0.8rem,1.2vw,0.86rem)", color: C.t2, lineHeight: 1.65 }}>{s.desc}</p>
              </div>
            </Reveal>
            {i < 2 && <Reveal key={`arrow-${i}`} delay={(i + 0.5) * 0.07}>
              <div className="ig-text" style={{ fontSize: "1.8rem", fontWeight: 700, flexShrink: 0 }}>→</div>
            </Reveal>}
          </>
        ))}
      </div>
      <style>{`@media(max-width:900px){#how-it-works .steps-flex{flex-direction:column!important}}`}</style>
    </Section>
  );
}

/* ─── Templates ────────────────────────────────────── */
const TEMPLATES = [
  { label: "🔴 Breaking News", labelColor: "#fca5a5", title: "World Leaders Sign Historic Climate Deal at Emergency Summit", name: "Breaking News", desc: "Bold red-purple · High urgency · Max impact", bg: "linear-gradient(145deg,#2d0a0a,#4a0e0e,#1a0520)" },
  { label: "📈 Finance",       labelColor: "#6ee7b7", title: "S&P 500 Hits All-Time High as Tech Stocks Surge 12% This Quarter", name: "Finance News", desc: "Emerald green · Data-driven · Professional", bg: "linear-gradient(145deg,#051a10,#093d1f,#041210)" },
  { label: "😂 Meme Style",    labelColor: "#fde68a", title: "Scientists Confirm: Coffee Actually Makes You Significantly Smarter", name: "Meme Style", desc: "Vibrant amber · Playful · High shareability", bg: "linear-gradient(145deg,#1a0e00,#3d2600,#1a1000)" },
  { label: "🌙 Modern Minimal",labelColor: "#c4b5fd", title: "The Future of Remote Work: Insights from 10,000 Professionals", name: "Modern Minimal", desc: "Deep purple · Editorial · Premium feel", bg: "linear-gradient(145deg,#0a0520,#1a0d3d,#070315)" },
];

function Templates() {
  return (
    <Section id="templates">
      <SecLabel>Templates</SecLabel>
      <Reveal><h2 style={{ fontFamily: "'Syne',sans-serif", fontSize: "clamp(1.7rem,3.2vw,2.8rem)", fontWeight: 800, lineHeight: 1.1, letterSpacing: "-0.04em" }}>Post Styles for Every Story</h2></Reveal>
      <Reveal delay={0.07}><p style={{ color: C.t2, marginTop: 14, fontSize: "clamp(0.88rem,1.5vw,1rem)", fontWeight: 300, lineHeight: 1.72, maxWidth: 520 }}>Four distinct visual styles to match any news category. New templates added every week.</p></Reveal>

      <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit,minmax(200px,1fr))", gap: 16, marginTop: 40 }}>
        {TEMPLATES.map((t, i) => (
          <Reveal key={t.name} delay={i * 0.07}>
            <div style={{ background: "rgba(255,255,255,0.04)", border: "1px solid rgba(255,255,255,0.07)", borderRadius: 16, overflow: "hidden", transition: "transform 0.3s, border-color 0.3s, box-shadow 0.3s", cursor: "pointer" }}
              onMouseEnter={e => { e.currentTarget.style.transform = "translateY(-6px)"; e.currentTarget.style.borderColor = "rgba(193,53,132,0.3)"; e.currentTarget.style.boxShadow = "0 20px 40px rgba(0,0,0,0.4)"; }}
              onMouseLeave={e => { e.currentTarget.style.transform = ""; e.currentTarget.style.borderColor = ""; e.currentTarget.style.boxShadow = ""; }}>
              <div style={{ aspectRatio: "1/1", background: t.bg, position: "relative", overflow: "hidden", display: "flex", flexDirection: "column", justifyContent: "flex-end", padding: 14 }}>
                <div style={{ position: "absolute", inset: 0, background: "linear-gradient(to bottom,transparent 30%,rgba(0,0,0,0.7) 100%)" }} />
                <div style={{ position: "absolute", width: 80, height: 80, borderRadius: "50%", background: `radial-gradient(circle,${t.labelColor}22,transparent)`, top: 10, right: 10 }} />
                <div style={{ fontSize: "0.55rem", fontWeight: 800, color: t.labelColor, letterSpacing: "0.12em", textTransform: "uppercase", marginBottom: 6, position: "relative", zIndex: 2 }}>{t.label}</div>
                <div style={{ fontFamily: "'Syne',sans-serif", fontSize: "0.75rem", fontWeight: 800, lineHeight: 1.3, color: "#fff", position: "relative", zIndex: 2, textShadow: "0 2px 10px rgba(0,0,0,0.5)" }}>{t.title}</div>
                <div style={{ height: 2, borderRadius: 99, background: GRAD, marginTop: 8, position: "relative", zIndex: 2 }} />
              </div>
              <div style={{ padding: "12px 14px" }}>
                <div style={{ fontFamily: "'Syne',sans-serif", fontSize: "0.82rem", fontWeight: 700, marginBottom: 3 }}>{t.name}</div>
                <div style={{ fontSize: "0.73rem", color: C.t3 }}>{t.desc}</div>
              </div>
            </div>
          </Reveal>
        ))}
      </div>
    </Section>
  );
}

/* ─── Palette Showcase ─────────────────────────────── */
const SWATCHES = ["#405DE6","#5851DB","#833AB4","#C13584","#E1306C","#FD1D1D","#F56040","#F77737","#FCAF45","#FFDC80"];

function Palette() {
  return (
    <Section id="palette" style={{ textAlign: "center", paddingTop: "clamp(20px,4vw,40px)", paddingBottom: "clamp(20px,4vw,40px)" }}>
      <Reveal><p style={{ fontFamily: "'Syne',sans-serif", fontSize: "clamp(0.8rem,1.5vw,0.9rem)", fontWeight: 700, color: C.t3, letterSpacing: "0.1em", textTransform: "uppercase", marginBottom: 20 }}>Built with Instagram's Official 10-Color Palette</p></Reveal>
      <Reveal delay={0.07}>
        <div style={{ display: "flex", gap: "clamp(8px,2vw,16px)", justifyContent: "center", flexWrap: "wrap", marginBottom: 20 }}>
          {SWATCHES.map(hex => (
            <div key={hex} style={{ textAlign: "center" }}>
              <div style={{ width: "clamp(28px,4vw,40px)", height: "clamp(28px,4vw,40px)", borderRadius: "50%", background: hex, boxShadow: `0 0 16px ${hex}80`, margin: "0 auto 6px" }} />
              <span style={{ fontSize: "0.6rem", color: C.t3, fontFamily: "monospace" }}>{hex}</span>
            </div>
          ))}
        </div>
      </Reveal>
      <Reveal delay={0.14}><div style={{ height: 3, background: FULL, borderRadius: 99, boxShadow: "0 0 18px rgba(193,53,132,0.4),0 0 36px rgba(131,58,180,0.18)" }} /></Reveal>
    </Section>
  );
}

/* ─── Benefits ─────────────────────────────────────── */
const BENEFITS = [
  { icon: "⏱️", title: "Save 4+ Hours Per Day",       desc: "What used to take hours of writing and designing now happens in under 10 seconds. Reclaim your time for strategy and growth." },
  { icon: "🔄", title: "Full Content Automation",     desc: "Set up RSS feeds and let InstaPost auto-generate posts for every new article — hands-free content production at scale." },
  { icon: "🎯", title: "Consistent Brand Identity",   desc: "Every post follows your brand colors, fonts, and tone. A cohesive Instagram feed that builds recognition and trust fast." },
  { icon: "🚀", title: "Grow Your Audience Faster",   desc: "Creators using InstaPost report 3× faster follower growth and 347% higher engagement within the first 30 days." },
];

function Benefits() {
  return (
    <Section id="benefits">
      <SecLabel>Benefits</SecLabel>
      <Reveal><h2 style={{ fontFamily: "'Syne',sans-serif", fontSize: "clamp(1.7rem,3.2vw,2.8rem)", fontWeight: 800, lineHeight: 1.1, letterSpacing: "-0.04em" }}>Why Creators Choose InstaPost</h2></Reveal>

      <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 40, marginTop: 40, alignItems: "center" }}>
        <div style={{ display: "flex", flexDirection: "column", gap: 14 }}>
          {BENEFITS.map((b, i) => (
            <Reveal key={b.title} delay={i * 0.07}>
              <div style={{ display: "flex", gap: 14, alignItems: "flex-start", padding: "clamp(16px,2.5vw,22px)", background: "rgba(255,255,255,0.04)", border: "1px solid rgba(255,255,255,0.07)", borderRadius: 14, transition: "transform 0.3s, border-color 0.3s, box-shadow 0.3s", cursor: "default" }}
                onMouseEnter={e => { e.currentTarget.style.transform = "translateX(6px)"; e.currentTarget.style.borderColor = "rgba(193,53,132,0.25)"; e.currentTarget.style.boxShadow = "-2px 0 0 0 #C13584"; }}
                onMouseLeave={e => { e.currentTarget.style.transform = ""; e.currentTarget.style.borderColor = ""; e.currentTarget.style.boxShadow = ""; }}>
                <div style={{ width: 42, height: 42, minWidth: 42, borderRadius: 11, background: GRAD, display: "flex", alignItems: "center", justifyContent: "center", fontSize: "1.05rem", boxShadow: "0 0 14px rgba(193,53,132,0.28)", flexShrink: 0 }}>{b.icon}</div>
                <div>
                  <div style={{ fontFamily: "'Syne',sans-serif", fontSize: "clamp(0.86rem,1.4vw,0.93rem)", fontWeight: 700, marginBottom: 4 }}>{b.title}</div>
                  <div style={{ fontSize: "clamp(0.77rem,1.2vw,0.83rem)", color: C.t2, lineHeight: 1.62 }}>{b.desc}</div>
                </div>
              </div>
            </Reveal>
          ))}
        </div>

        {/* Dashboard card */}
        <Reveal delay={0.14}>
          <div style={{ position: "relative", display: "flex", justifyContent: "center", alignItems: "center", minHeight: 380, padding: 20 }}>
            <div style={{ position: "absolute", top: 0, right: 0, zIndex: 3, background: "rgba(10,6,20,0.92)", backdropFilter: "blur(14px)", border: "1px solid rgba(255,255,255,0.13)", borderRadius: 11, padding: "10px 14px", fontSize: "0.71rem", fontWeight: 500, animation: "floatSm 4s ease-in-out infinite" }}>
              <strong style={{ fontFamily: "'Syne',sans-serif", fontSize: "1rem", fontWeight: 800, color: "#10b981", display: "block" }}>+347%</strong>Engagement growth
            </div>
            <div style={{ background: "rgba(12,8,24,0.85)", backdropFilter: "blur(22px)", border: "1px solid rgba(255,255,255,0.13)", borderRadius: 20, padding: "clamp(18px,3vw,26px)", width: "clamp(220px,30vw,290px)", boxShadow: "0 20px 56px rgba(0,0,0,0.5),0 0 40px rgba(193,53,132,0.32)", position: "relative", zIndex: 2 }}>
              <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: 18 }}>
                <div style={{ fontFamily: "'Syne',sans-serif", fontSize: "0.78rem", fontWeight: 700, color: C.t2 }}>Monthly Posts Generated</div>
                <div style={{ background: "rgba(193,53,132,0.12)", border: "1px solid rgba(193,53,132,0.22)", borderRadius: 99, padding: "3px 8px", fontSize: "0.62rem", fontWeight: 600, color: C.ig4 }}>+68% ↑</div>
              </div>
              <div className="ig-text" style={{ fontFamily: "'Syne',sans-serif", fontSize: "clamp(1.6rem,3vw,2rem)", fontWeight: 800, lineHeight: 1 }}>2,840</div>
              <div style={{ fontSize: "0.7rem", color: C.t3, marginTop: 3, marginBottom: 16 }}>posts this month · all AI generated</div>
              <div style={{ display: "flex", alignItems: "flex-end", gap: 5, height: 74 }}>
                {[33,50,42,66,80,100].map((h, i) => (
                  <div key={i} style={{ flex: 1, borderRadius: "4px 4px 0 0", background: GRAD, height: `${h}%`, opacity: 0.5 + i * 0.1, animation: `barUp 1.2s ${0.04 + i * 0.05}s ease both` }} />
                ))}
              </div>
              <div style={{ display: "flex", justifyContent: "space-between", marginTop: 6, fontSize: "0.6rem", color: C.t3 }}>
                {["Jan","Feb","Mar","Apr","May","Jun"].map(m => <span key={m}>{m}</span>)}
              </div>
            </div>
            <div style={{ position: "absolute", bottom: 16, left: 0, zIndex: 3, background: "rgba(10,6,20,0.92)", backdropFilter: "blur(14px)", border: "1px solid rgba(255,255,255,0.13)", borderRadius: 11, padding: "10px 14px", fontSize: "0.71rem", fontWeight: 500, animation: "floatSm 4.5s 1.1s ease-in-out infinite" }}>
              <strong className="ig-text" style={{ fontFamily: "'Syne',sans-serif", fontSize: "1rem", fontWeight: 800, display: "block" }}>8.2s</strong>Avg. generate time
            </div>
          </div>
        </Reveal>
      </div>
      <style>{`@media(max-width:900px){#benefits>div:last-child{grid-template-columns:1fr!important}}`}</style>
    </Section>
  );
}

/* ─── CTA ──────────────────────────────────────────── */
function CTA() {
  return (
    <Section id="cta" style={{ paddingTop: "clamp(40px,7vw,76px)", paddingBottom: "clamp(40px,7vw,76px)" }}>
      <Reveal>
        <div style={{ maxWidth: 780, margin: "0 auto", borderRadius: 26, overflow: "hidden", position: "relative", textAlign: "center", background: "linear-gradient(135deg,rgba(131,58,180,0.12),rgba(193,53,132,0.09),rgba(245,96,64,0.07))", padding: "clamp(48px,8vw,80px) clamp(24px,5vw,60px)", border: "1px solid rgba(193,53,132,0.2)", boxShadow: "0 0 80px rgba(193,53,132,0.12),0 0 140px rgba(131,58,180,0.08)" }}>
          <div style={{ position: "absolute", width: 350, height: 350, borderRadius: "50%", background: "radial-gradient(circle,rgba(193,53,132,0.18),transparent 70%)", top: "50%", left: "50%", transform: "translate(-50%,-50%)", pointerEvents: "none" }} />
          <div style={{ fontSize: "clamp(1.6rem,3.5vw,2.3rem)", marginBottom: 14, position: "relative", zIndex: 1 }}>✦</div>
          <h2 style={{ fontFamily: "'Syne',sans-serif", fontSize: "clamp(1.6rem,3.5vw,2.8rem)", fontWeight: 800, letterSpacing: "-0.04em", lineHeight: 1.1, position: "relative", zIndex: 1 }}>
            Start Creating<br/><span className="ig-text">AI-Powered News Posts</span>
          </h2>
          <p style={{ color: C.t2, marginTop: 14, fontSize: "clamp(0.88rem,1.4vw,1rem)", fontWeight: 300, position: "relative", zIndex: 1 }}>
            Join 12,000+ creators already saving time and growing faster. Set up in 60 seconds — no credit card required.
          </p>
          <div style={{ display: "flex", gap: 12, justifyContent: "center", marginTop: 30, flexWrap: "wrap", position: "relative", zIndex: 1 }}>
            <button style={{ background: GRAD, color: "#fff", border: "none", padding: "clamp(12px,2vw,15px) clamp(24px,3.5vw,36px)", borderRadius: 99, fontFamily: "'Syne',sans-serif", fontSize: "clamp(0.86rem,1.4vw,0.98rem)", fontWeight: 700, boxShadow: "0 0 28px rgba(193,53,132,0.4)", transition: "transform 0.2s, box-shadow 0.2s" }}
              onMouseEnter={e => { e.currentTarget.style.transform = "translateY(-3px)"; e.currentTarget.style.boxShadow = "0 0 46px rgba(193,53,132,0.62)"; }}
              onMouseLeave={e => { e.currentTarget.style.transform = ""; e.currentTarget.style.boxShadow = "0 0 28px rgba(193,53,132,0.4)"; }}>
              Try InstaPost Free →
            </button>
            <button style={{ background: "transparent", color: C.t2, border: "1px solid rgba(255,255,255,0.13)", padding: "clamp(12px,2vw,15px) clamp(24px,3.5vw,36px)", borderRadius: 99, fontFamily: "'Syne',sans-serif", fontSize: "clamp(0.86rem,1.4vw,0.98rem)", fontWeight: 600, transition: "border-color 0.2s, color 0.2s" }}
              onMouseEnter={e => { e.currentTarget.style.borderColor = C.ig4; e.currentTarget.style.color = C.t1; }}
              onMouseLeave={e => { e.currentTarget.style.borderColor = "rgba(255,255,255,0.13)"; e.currentTarget.style.color = C.t2; }}>
              Watch Demo
            </button>
          </div>
          <p style={{ fontSize: "0.73rem", color: C.t3, marginTop: 16, position: "relative", zIndex: 1 }}>Free plan · 10 posts/month · No credit card · Cancel anytime</p>
        </div>
      </Reveal>
    </Section>
  );
}

/* ─── Footer ───────────────────────────────────────── */
function Footer() {
  const cols = [
    { title: "Product",  links: ["Features","Templates","Pricing","Changelog","Roadmap"] },
    { title: "Company",  links: ["About Us","Blog","Careers","Press Kit","Contact"] },
    { title: "Legal",    links: ["Privacy Policy","Terms of Service","Cookie Policy","GDPR"] },
  ];
  return (
    <>
      <footer style={{ padding: "clamp(40px,6vw,58px) clamp(18px,5vw,80px) clamp(24px,4vw,40px)", borderTop: "1px solid rgba(255,255,255,0.07)", display: "grid", gridTemplateColumns: "1.6fr 1fr 1fr 1fr", gap: "clamp(24px,4vw,52px)", position: "relative", zIndex: 1 }}>
        <div>
          <div className="ig-text" style={{ fontFamily: "'Syne',sans-serif", fontSize: "1.15rem", fontWeight: 800, marginBottom: 10 }}>InstaPost</div>
          <div style={{ fontSize: "0.8rem", color: C.t3, lineHeight: 1.65, maxWidth: 215 }}>AI-powered platform that transforms any news article into stunning Instagram-ready content in seconds.</div>
          <div style={{ display: "flex", gap: 7, marginTop: 18 }}>
            {[["𝕏","X"],[null,"IG"],["in","LinkedIn"],["🚀","PH"]].map(([icon, title]) => (
              <a key={title} href="#" title={title} style={{ width: 34, height: 34, borderRadius: 9, display: "flex", alignItems: "center", justifyContent: "center", fontSize: "0.82rem", border: "1px solid rgba(255,255,255,0.13)", background: "rgba(255,255,255,0.04)", color: C.t2, transition: "all 0.2s" }}
                onMouseEnter={e => { e.currentTarget.style.background = GRAD; e.currentTarget.style.borderColor = "transparent"; e.currentTarget.style.color = "#fff"; e.currentTarget.style.transform = "translateY(-2px)"; }}
                onMouseLeave={e => { e.currentTarget.style.background = "rgba(255,255,255,0.04)"; e.currentTarget.style.borderColor = "rgba(255,255,255,0.13)"; e.currentTarget.style.color = C.t2; e.currentTarget.style.transform = ""; }}>
                {icon === null ? <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8"><rect x="2" y="2" width="20" height="20" rx="5.5"/><circle cx="12" cy="12" r="4"/><circle cx="17.5" cy="6.5" r="1.2" fill="currentColor"/></svg> : icon}
              </a>
            ))}
          </div>
        </div>
        {cols.map(col => (
          <div key={col.title}>
            <h5 style={{ fontFamily: "'Syne',sans-serif", fontSize: "0.82rem", fontWeight: 700, marginBottom: 14, color: C.t1 }}>{col.title}</h5>
            <ul style={{ listStyle: "none", display: "flex", flexDirection: "column", gap: 9 }}>
              {col.links.map(l => (
                <li key={l}><a href="#" style={{ fontSize: "0.8rem", color: C.t3, transition: "color 0.2s" }} onMouseEnter={e => e.currentTarget.style.color = C.ig4} onMouseLeave={e => e.currentTarget.style.color = C.t3}>{l}</a></li>
              ))}
            </ul>
          </div>
        ))}
        <style>{`@media(max-width:1100px){footer{grid-template-columns:1fr 1fr!important}}@media(max-width:480px){footer{grid-template-columns:1fr!important;gap:22px!important}}`}</style>
      </footer>

      <div style={{ padding: "17px clamp(18px,5vw,80px)", borderTop: "1px solid rgba(255,255,255,0.07)", display: "flex", alignItems: "center", justifyContent: "space-between", flexWrap: "wrap", gap: 8, fontSize: "0.74rem", color: C.t3, position: "relative", zIndex: 1 }}>
        <span>© 2025 InstaPost, Inc. All rights reserved.</span>
        <div style={{ display: "flex", alignItems: "center", gap: 14 }}>
          <span>Built with ✦ AI</span>
          <span style={{ color: "rgba(255,255,255,0.13)" }}>|</span>
          <span>🇮🇳 Made in India</span>
        </div>
      </div>
      <div style={{ height: 3, background: FULL, boxShadow: "0 0 18px rgba(193,53,132,0.4),0 0 36px rgba(131,58,180,0.18)" }} />
    </>
  );
}

/* ─── App ──────────────────────────────────────────── */
export default function InstaPostLanding() {
  const [mobOpen, setMobOpen] = useState(false);

  return (
    <>
      <style>{CSS + `@media(hover:none){.ptr-glow{display:none!important}}`}</style>
      <ParticleCanvas />
      <div className="ptr-glow"><PointerGlow /></div>
      <MobOverlay open={mobOpen} onClose={() => setMobOpen(false)} />
      <Navbar mobOpen={mobOpen} setMobOpen={setMobOpen} />
      <main>
        <HeroSection />
        <Marquee />
        <Features />
        <HowItWorks />
        <Templates />
        <Palette />
        <Benefits />
        <CTA />
      </main>
      <Footer />
    </>
  );
}
