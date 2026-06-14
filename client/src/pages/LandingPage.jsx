import { useEffect, useRef, useState } from 'react';
import { useNavigate } from 'react-router-dom';

const FEATURES = [
  {
    icon: '🎓',
    title: 'Smart Attendance',
    desc: 'Mark attendance in seconds. Students get instant alerts. Automatic warnings when below 75%.',
    color: '#00C9A7',
  },
  {
    icon: '📊',
    title: 'Grade Analytics',
    desc: 'Auto-compute grades, CGPA, and grade points. Publish with one click — students notified instantly.',
    color: '#845EF7',
  },
  {
    icon: '💬',
    title: 'Real-Time Messaging',
    desc: 'Direct and group chats across all roles. Typing indicators, read receipts, and live presence.',
    color: '#FF6B6B',
  },
  {
    icon: '📚',
    title: 'Course Management',
    desc: 'Upload PDFs, videos, and links. Post assignments with deadlines. Track submissions seamlessly.',
    color: '#339AF0',
  },
  {
    icon: '🔔',
    title: 'Live Notifications',
    desc: 'Socket.IO-powered alerts for every action — grades, attendance, assignments, and announcements.',
    color: '#F59F00',
  },
  {
    icon: '🏫',
    title: 'Role-Based Portals',
    desc: 'Admin, HOD, Teacher, Student — each with a tailored dashboard, permissions, and workflows.',
    color: '#20C997',
  },
];

const ROLES = [
  { role: 'Admin',   color: '#845EF7', bg: 'rgba(132,94,247,0.12)', desc: 'Full system control. Manage users, departments, courses, and broadcast announcements.' },
  { role: 'HOD',     color: '#339AF0', bg: 'rgba(51,154,240,0.12)', desc: 'Department oversight. Monitor teachers, review grade reports, and track course performance.' },
  { role: 'Teacher', color: '#00C9A7', bg: 'rgba(0,201,167,0.12)', desc: 'Course management. Mark attendance, enter grades, upload materials, assign homework.' },
  { role: 'Student', color: '#F59F00', bg: 'rgba(245,159,0,0.12)', desc: 'Learning hub. View courses, track attendance, check grades, submit assignments.' },
];

const STATS = [
  { value: '47', label: 'REST APIs', suffix: '+' },
  { value: '4',  label: 'Role Portals', suffix: '' },
  { value: '100', label: 'Real-time Events', suffix: '%' },
  { value: '14', label: 'Build Phases', suffix: '' },
];

export default function LandingPage() {
  const navigate  = useNavigate();
  const heroRef   = useRef(null);
  const [scrollY, setScrollY] = useState(0);
  const [visible, setVisible] = useState({});

  useEffect(() => {
    const onScroll = () => setScrollY(window.scrollY);
    window.addEventListener('scroll', onScroll, { passive: true });
    return () => window.removeEventListener('scroll', onScroll);
  }, []);

  useEffect(() => {
    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach(e => {
          if (e.isIntersecting) setVisible(v => ({ ...v, [e.target.id]: true }));
        });
      },
      { threshold: 0.15 }
    );
    document.querySelectorAll('[data-animate]').forEach(el => observer.observe(el));
    return () => observer.disconnect();
  }, []);

  return (
    <div style={{ fontFamily: "'Sora', sans-serif", background: '#080B14', color: '#E8EAF0', overflowX: 'hidden' }}>
      <link href="https://fonts.googleapis.com/css2?family=Sora:wght@300;400;500;600;700;800&family=Space+Mono:wght@400;700&display=swap" rel="stylesheet"/>

      <style>{`
        * { box-sizing: border-box; margin: 0; padding: 0; }
        ::selection { background: #845EF7; color: white; }
        ::-webkit-scrollbar { width: 4px; }
        ::-webkit-scrollbar-track { background: #080B14; }
        ::-webkit-scrollbar-thumb { background: #845EF7; border-radius: 2px; }

        @keyframes float { 0%,100%{transform:translateY(0)} 50%{transform:translateY(-18px)} }
        @keyframes pulse-ring { 0%{transform:scale(1);opacity:0.4} 100%{transform:scale(1.6);opacity:0} }
        @keyframes slide-up { from{opacity:0;transform:translateY(40px)} to{opacity:1;transform:translateY(0)} }
        @keyframes fade-in { from{opacity:0} to{opacity:1} }
        @keyframes spin-slow { from{transform:rotate(0deg)} to{transform:rotate(360deg)} }
        @keyframes counter { from{opacity:0;transform:translateY(20px)} to{opacity:1;transform:translateY(0)} }
        @keyframes beam { 0%,100%{opacity:0.3} 50%{opacity:1} }

        .hero-text { animation: slide-up 0.9s cubic-bezier(0.16,1,0.3,1) both; }
        .hero-sub  { animation: slide-up 0.9s 0.15s cubic-bezier(0.16,1,0.3,1) both; }
        .hero-cta  { animation: slide-up 0.9s 0.3s  cubic-bezier(0.16,1,0.3,1) both; }

        .reveal { opacity:0; transform:translateY(32px); transition: opacity 0.7s ease, transform 0.7s ease; }
        .reveal.visible { opacity:1; transform:translateY(0); }

        .card-hover {
          transition: transform 0.3s ease, box-shadow 0.3s ease, border-color 0.3s ease;
          cursor: default;
        }
        .card-hover:hover {
          transform: translateY(-6px);
          box-shadow: 0 20px 60px rgba(0,0,0,0.4);
        }

        .btn-primary {
          background: linear-gradient(135deg, #845EF7, #5C7CFA);
          border: none;
          color: white;
          padding: 16px 36px;
          border-radius: 12px;
          font-size: 16px;
          font-weight: 600;
          font-family: 'Sora', sans-serif;
          cursor: pointer;
          transition: all 0.25s ease;
          position: relative;
          overflow: hidden;
        }
        .btn-primary::after {
          content: '';
          position: absolute;
          inset: 0;
          background: white;
          opacity: 0;
          transition: opacity 0.2s;
        }
        .btn-primary:hover { transform: translateY(-2px); box-shadow: 0 12px 40px rgba(132,94,247,0.5); }
        .btn-primary:hover::after { opacity: 0.08; }
        .btn-primary:active { transform: translateY(0); }

        .btn-secondary {
          background: transparent;
          border: 1.5px solid rgba(232,234,240,0.2);
          color: #E8EAF0;
          padding: 15px 36px;
          border-radius: 12px;
          font-size: 16px;
          font-weight: 500;
          font-family: 'Sora', sans-serif;
          cursor: pointer;
          transition: all 0.25s ease;
        }
        .btn-secondary:hover { border-color: rgba(232,234,240,0.5); background: rgba(255,255,255,0.05); }

        .grid-bg {
          background-image: linear-gradient(rgba(132,94,247,0.06) 1px, transparent 1px),
                            linear-gradient(90deg, rgba(132,94,247,0.06) 1px, transparent 1px);
          background-size: 60px 60px;
        }

        .noise::before {
          content: '';
          position: fixed;
          inset: 0;
          background-image: url("data:image/svg+xml,%3Csvg viewBox='0 0 256 256' xmlns='http://www.w3.org/2000/svg'%3E%3Cfilter id='noise'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.9' numOctaves='4' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23noise)' opacity='0.03'/%3E%3C/svg%3E");
          pointer-events: none;
          z-index: 0;
          opacity: 0.4;
        }

        nav { position: fixed; top: 0; left: 0; right: 0; z-index: 100; padding: 20px 60px;
              display: flex; align-items: center; justify-content: space-between;
              backdrop-filter: blur(20px); background: rgba(8,11,20,0.8);
              border-bottom: 1px solid rgba(255,255,255,0.05); }

        .nav-logo { font-size: 20px; font-weight: 700; letter-spacing: -0.5px;
                    background: linear-gradient(135deg, #845EF7, #00C9A7);
                    -webkit-background-clip: text; -webkit-text-fill-color: transparent; }

        .tag { display: inline-flex; align-items: center; gap: 8px;
               background: rgba(132,94,247,0.12); border: 1px solid rgba(132,94,247,0.3);
               color: #B197FC; padding: 6px 16px; border-radius: 100px;
               font-size: 12px; font-weight: 600; letter-spacing: 1px; text-transform: uppercase;
               margin-bottom: 24px; }

        .glow-orb {
          position: absolute;
          border-radius: 50%;
          filter: blur(80px);
          pointer-events: none;
        }

        @media (max-width: 768px) {
          nav { padding: 16px 20px; }
          .hero-title { font-size: clamp(36px, 10vw, 72px) !important; }
        }
      `}</style>

      {/* Navbar */}
      <nav>
        <div className="nav-logo">🎓 EduTrackPro</div>
        <div style={{ display: 'flex', gap: 12 }}>
          <button className="btn-secondary" style={{ padding: '10px 24px', fontSize: 14 }}
            onClick={() => navigate('/login')}>
            Sign In
          </button>
          <button className="btn-primary" style={{ padding: '10px 24px', fontSize: 14 }}
            onClick={() => navigate('/login')}>
            Get Started →
          </button>
        </div>
      </nav>

      {/* Hero */}
      <section className="grid-bg" style={{
        minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center',
        padding: '120px 20px 80px', position: 'relative', textAlign: 'center',
      }}>
        {/* Orbs */}
        <div className="glow-orb" style={{ width: 500, height: 500, background: 'radial-gradient(circle, rgba(132,94,247,0.25), transparent 70%)', top: '10%', left: '20%' }}/>
        <div className="glow-orb" style={{ width: 400, height: 400, background: 'radial-gradient(circle, rgba(0,201,167,0.15), transparent 70%)', bottom: '10%', right: '15%' }}/>

        <div style={{ position: 'relative', zIndex: 1, maxWidth: 820 }}>
          <div className="tag hero-text">
            <span style={{ width: 6, height: 6, borderRadius: '50%', background: '#00C9A7', display: 'inline-block', animation: 'beam 2s ease-in-out infinite' }}/>
            Full-Stack Learning Management System
          </div>

          <h1 className="hero-text" style={{
            fontSize: 'clamp(44px, 7vw, 88px)',
            fontWeight: 800,
            lineHeight: 1.05,
            letterSpacing: '-3px',
            marginBottom: 28,
          }}>
            Education{' '}
            <span style={{
              background: 'linear-gradient(135deg, #845EF7 0%, #5C7CFA 50%, #00C9A7 100%)',
              WebkitBackgroundClip: 'text',
              WebkitTextFillColor: 'transparent',
            }}>reimagined</span>
            {' '}for the modern campus
          </h1>

          <p className="hero-sub" style={{
            fontSize: 18, color: 'rgba(232,234,240,0.6)', lineHeight: 1.7,
            marginBottom: 44, maxWidth: 580, margin: '0 auto 44px',
          }}>
            One platform. Four portals. Real-time everything.
            Built with MERN stack, Socket.IO, and designed for institutions that move fast.
          </p>

          <div className="hero-cta" style={{ display: 'flex', gap: 16, justifyContent: 'center', flexWrap: 'wrap' }}>
            <button className="btn-primary" style={{ fontSize: 16, padding: '16px 40px' }}
              onClick={() => navigate('/login')}>
              Launch App 🚀
            </button>
            <button className="btn-secondary" onClick={() => document.getElementById('features').scrollIntoView({ behavior: 'smooth' })}>
              Explore Features
            </button>
          </div>

          {/* Role pills */}
          <div style={{ display: 'flex', gap: 10, justifyContent: 'center', flexWrap: 'wrap', marginTop: 56 }}>
            {ROLES.map(r => (
              <div key={r.role} style={{
                background: r.bg,
                border: `1px solid ${r.color}30`,
                color: r.color,
                padding: '8px 20px',
                borderRadius: 100,
                fontSize: 13,
                fontWeight: 600,
              }}>
                {r.role} Portal
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Stats */}
      <section style={{ padding: '80px 60px', borderTop: '1px solid rgba(255,255,255,0.05)', borderBottom: '1px solid rgba(255,255,255,0.05)' }}>
        <div style={{ maxWidth: 1000, margin: '0 auto', display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: 40, textAlign: 'center' }}>
          {STATS.map((s, i) => (
            <div key={i} id={`stat-${i}`} data-animate
              className={`reveal${visible[`stat-${i}`] ? ' visible' : ''}`}
              style={{ transitionDelay: `${i * 0.1}s` }}>
              <div style={{ fontSize: 56, fontWeight: 800, letterSpacing: -2, fontFamily: "'Space Mono', monospace",
                background: 'linear-gradient(135deg, #845EF7, #00C9A7)',
                WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent' }}>
                {s.value}{s.suffix}
              </div>
              <div style={{ color: 'rgba(232,234,240,0.5)', fontSize: 14, fontWeight: 500, marginTop: 6, textTransform: 'uppercase', letterSpacing: 1 }}>{s.label}</div>
            </div>
          ))}
        </div>
      </section>

      {/* Features */}
      <section id="features" style={{ padding: '100px 60px' }}>
        <div style={{ maxWidth: 1100, margin: '0 auto' }}>
          <div style={{ textAlign: 'center', marginBottom: 64 }}>
            <div className="tag">Features</div>
            <h2 style={{ fontSize: 44, fontWeight: 800, letterSpacing: -2, lineHeight: 1.1 }}>
              Everything your institution needs
            </h2>
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))', gap: 20 }}>
            {FEATURES.map((f, i) => (
              <div key={i} id={`feat-${i}`} data-animate
                className={`card-hover reveal${visible[`feat-${i}`] ? ' visible' : ''}`}
                style={{
                  background: 'rgba(255,255,255,0.03)',
                  border: '1px solid rgba(255,255,255,0.07)',
                  borderRadius: 20,
                  padding: '32px',
                  transitionDelay: `${i * 0.08}s`,
                }}>
                <div style={{
                  width: 52, height: 52, borderRadius: 14,
                  background: `${f.color}18`,
                  border: `1px solid ${f.color}30`,
                  display: 'flex', alignItems: 'center', justifyContent: 'center',
                  fontSize: 24, marginBottom: 20,
                }}>
                  {f.icon}
                </div>
                <h3 style={{ fontSize: 18, fontWeight: 700, marginBottom: 10, color: '#E8EAF0' }}>{f.title}</h3>
                <p style={{ fontSize: 14, color: 'rgba(232,234,240,0.5)', lineHeight: 1.7 }}>{f.desc}</p>
                <div style={{ width: 32, height: 2, background: f.color, borderRadius: 2, marginTop: 20, opacity: 0.6 }}/>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Roles */}
      <section style={{ padding: '100px 60px', background: 'rgba(255,255,255,0.02)' }}>
        <div style={{ maxWidth: 1100, margin: '0 auto' }}>
          <div style={{ textAlign: 'center', marginBottom: 64 }}>
            <div className="tag">Portals</div>
            <h2 style={{ fontSize: 44, fontWeight: 800, letterSpacing: -2, lineHeight: 1.1 }}>
              Tailored for every role
            </h2>
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(240px, 1fr))', gap: 20 }}>
            {ROLES.map((r, i) => (
              <div key={i} id={`role-${i}`} data-animate
                className={`card-hover reveal${visible[`role-${i}`] ? ' visible' : ''}`}
                style={{
                  background: r.bg,
                  border: `1px solid ${r.color}25`,
                  borderRadius: 20, padding: '36px 28px',
                  transitionDelay: `${i * 0.1}s`,
                }}>
                <div style={{
                  width: 48, height: 48, borderRadius: 12,
                  background: r.color,
                  display: 'flex', alignItems: 'center', justifyContent: 'center',
                  fontSize: 20, fontWeight: 700, color: '#080B14', marginBottom: 20,
                }}>
                  {r.role.charAt(0)}
                </div>
                <h3 style={{ fontSize: 20, fontWeight: 700, color: r.color, marginBottom: 12 }}>{r.role}</h3>
                <p style={{ fontSize: 14, color: 'rgba(232,234,240,0.55)', lineHeight: 1.7 }}>{r.desc}</p>
                <button
                  onClick={() => navigate('/login')}
                  style={{
                    marginTop: 24, background: 'transparent',
                    border: `1px solid ${r.color}50`, color: r.color,
                    padding: '10px 20px', borderRadius: 10, fontSize: 13,
                    fontWeight: 600, fontFamily: "'Sora', sans-serif",
                    cursor: 'pointer', transition: 'all 0.2s ease',
                  }}
                  onMouseEnter={e => { e.target.style.background = `${r.color}18`; }}
                  onMouseLeave={e => { e.target.style.background = 'transparent'; }}>
                  Enter Portal →
                </button>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Tech Stack */}
      <section style={{ padding: '100px 60px' }}>
        <div style={{ maxWidth: 900, margin: '0 auto', textAlign: 'center' }}>
          <div className="tag">Tech Stack</div>
          <h2 style={{ fontSize: 44, fontWeight: 800, letterSpacing: -2, marginBottom: 16 }}>
            Built with modern technologies
          </h2>
          <p style={{ color: 'rgba(232,234,240,0.5)', fontSize: 16, marginBottom: 56 }}>
            Production-grade tools chosen for performance, scalability, and developer experience.
          </p>

          <div style={{ display: 'flex', flexWrap: 'wrap', gap: 12, justifyContent: 'center' }}>
            {[
              { name: 'React 18',    color: '#61DAFB' },
              { name: 'Node.js',     color: '#68A063' },
              { name: 'Express',     color: '#999' },
              { name: 'MongoDB',     color: '#00ED64' },
              { name: 'Socket.IO',   color: '#010101', bg: '#fff' },
              { name: 'Redux',       color: '#764ABC' },
              { name: 'Tailwind',    color: '#38BDF8' },
              { name: 'JWT',         color: '#FB015B' },
              { name: 'Cloudinary',  color: '#3448C5' },
              { name: 'Nodemailer',  color: '#22B573' },
              { name: 'Vite',        color: '#BD34FE' },
              { name: 'React Query', color: '#FF4154' },
            ].map((t, i) => (
              <div key={i} id={`tech-${i}`} data-animate
                className={`reveal${visible[`tech-${i}`] ? ' visible' : ''}`}
                style={{
                  background: `${t.color}12`,
                  border: `1px solid ${t.color}30`,
                  color: t.color,
                  padding: '10px 22px',
                  borderRadius: 100,
                  fontSize: 14,
                  fontWeight: 600,
                  transitionDelay: `${i * 0.04}s`,
                }}>
                {t.name}
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA */}
      <section style={{
        padding: '100px 60px',
        background: 'linear-gradient(135deg, rgba(132,94,247,0.12), rgba(0,201,167,0.08))',
        borderTop: '1px solid rgba(132,94,247,0.2)',
        borderBottom: '1px solid rgba(0,201,167,0.1)',
        textAlign: 'center',
        position: 'relative',
        overflow: 'hidden',
      }}>
        <div className="glow-orb" style={{ width: 600, height: 600, background: 'radial-gradient(circle, rgba(132,94,247,0.15), transparent 70%)', top: '-30%', left: '30%' }}/>
        <div style={{ position: 'relative', zIndex: 1 }}>
          <h2 style={{ fontSize: 52, fontWeight: 800, letterSpacing: -2, marginBottom: 20, lineHeight: 1.1 }}>
            Ready to transform<br/>your institution?
          </h2>
          <p style={{ color: 'rgba(232,234,240,0.55)', fontSize: 18, marginBottom: 44 }}>
            Login with your credentials and experience EduTrackPro today.
          </p>
          <button className="btn-primary" style={{ fontSize: 18, padding: '18px 52px' }}
            onClick={() => navigate('/login')}>
            Get Started Now 🚀
          </button>
        </div>
      </section>

      {/* Footer */}
      <footer style={{ padding: '40px 60px', borderTop: '1px solid rgba(255,255,255,0.05)', display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: 16 }}>
        <div className="nav-logo">🎓 EduTrackPro</div>
        <p style={{ color: 'rgba(232,234,240,0.3)', fontSize: 13 }}>
          © 2026 EduTrackPro. Built with the MERN stack.
        </p>
        <button className="btn-primary" style={{ padding: '10px 24px', fontSize: 14 }}
          onClick={() => navigate('/login')}>
          Sign In →
        </button>
      </footer>
    </div>
  );
}