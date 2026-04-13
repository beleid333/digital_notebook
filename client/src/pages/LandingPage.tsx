/**
 * LandingPage — "The Leather-Bound Journal"
 * Design: Tactile Realism Brutalist Skeuomorphism
 */

// ✅ IMPORTS MUST BE AT THE VERY TOP
import { useState, useRef } from "react";
import { useLocation } from "wouter";
import { useAuth } from "@/contexts/AuthContext"; // ✅ Add this import

const VELO_LOGO = "/velo-notes-logo.png";

const DESK_BG =
  "https://d2xsxph8kpxj0f.cloudfront.net/100546762/oVX8wu43y9wQaUoReJ9f4a/desk-bg-9pwG7TCBTXFx4DuRWiXBs4.webp";
const LEATHER_COVER =
  "https://d2xsxph8kpxj0f.cloudfront.net/100546762/oVX8wu43y9wQaUoReJ9f4a/leather-cover-8xMKojobBJTdMr2ndjSNSC.webp";

// ── SVG Icons ────────────────────────────────────────────────────────
function UserIcon() {
  return (
    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
      <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2"/>
      <circle cx="12" cy="7" r="4"/>
    </svg>
  );
}

function KeyIcon() {
  return (
    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
      <circle cx="7.5" cy="15.5" r="5.5"/>
      <path d="M21 2l-9.6 9.6"/>
      <path d="M15.5 7.5l3 3L22 7l-3-3"/>
    </svg>
  );
}

function MailIcon() {
  return (
    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
      <rect width="20" height="16" x="2" y="4" rx="2"/>
      <path d="m22 7-8.97 5.7a1.94 1.94 0 0 1-2.06 0L2 7"/>
    </svg>
  );
}

function BookOpenIcon() {
  return (
    <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
      <path d="M2 3h6a4 4 0 0 1 4 4v14a3 3 0 0 0-3-3H2z"/>
      <path d="M22 3h-6a4 4 0 0 0-4 4v14a3 3 0 0 1 3-3h7z"/>
    </svg>
  );
}

function LockIcon() {
  return (
    <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
      <rect width="18" height="11" x="3" y="11" rx="2" ry="2"/>
      <path d="M7 11V7a5 5 0 0 1 10 0v4"/>
    </svg>
  );
}

// ── Component ─────────────────────────────────────────────────────────────────
type AuthMode = "login" | "register";

export default function LandingPage() {
  const [, setLocation] = useLocation();
  const { login, register, error, clearError } = useAuth(); // ✅ Auth hook
  
  const [mode, setMode] = useState<AuthMode>("login");
  const [isFlipping, setIsFlipping] = useState(false);

  // Form state
  const [username, setUsername] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirm, setConfirm] = useState("");
  const [sealPressed, setSealPressed] = useState(false);
  const [inkVisible, setInkVisible] = useState(false);

  const isLogin = mode === "login";

  const switchMode = (next: AuthMode) => {
  alert(`🔄 Switching mode: ${mode} → ${next}`);
  
  if (next === mode || isFlipping) return;
  setIsFlipping(true);
  setTimeout(() => {
    setMode(next);
    setIsFlipping(false);
    setUsername(""); 
    setEmail(""); 
    setPassword(""); 
    setConfirm("");
    alert(`✅ Mode changed to: ${next}`);
  }, 500);
};

const handleSubmit = async (e: React.FormEvent) => {
  e.preventDefault();
  
  try {
    const API_URL = 'https://digital-notebook-ypfo.onrender.com/api';
    
    if (mode === "login") {
      // ✅ Simple alert to confirm values
      alert(`Login: "${username.trim()}" / "${password ? '***' : ''}"`);
      
      const response = await fetch(`${API_URL}/auth/login`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ 
          emailOrUsername: username.trim(), 
          password: password.trim() 
        }),
      });
      
      const data = await response.json();
      
      if (!response.ok) {
        alert(`❌ ${data.error || 'Login failed'}`);
        throw new Error(data.error || 'Login failed');
      }
      
      // ✅ Save auth to localStorage
      localStorage.setItem('auth_token', data.token);
      localStorage.setItem('auth_user', JSON.stringify(data.user));
      
      alert("✅ Success! Opening notebook...");
      setLocation('/notebook');
      
    } else {
      // ✅ Registration mode
      if (password !== confirm) {
        alert("❌ Passwords don't match!");
        return;
      }
      
      alert(`Register: "${email.trim()}" / "${username.trim()}"`);
      
      const response = await fetch(`${API_URL}/auth/register`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ 
          email: email.trim(), 
          username: username.trim(), 
          password: password.trim() 
        }),
      });
      
      const data = await response.json();
      
      if (!response.ok) {
        alert(`❌ ${data.error || 'Registration failed'}`);
        throw new Error(data.error || 'Registration failed');
      }
      
      localStorage.setItem('auth_token', data.token);
      localStorage.setItem('auth_user', JSON.stringify(data.user));
      
      alert("✅ Account created! Opening notebook...");
      setLocation('/notebook');
    }
    
  } catch (err: any) {
    console.error("Auth error:", err);
    // Error already shown via alert above
  }

};
  
  return (
    <div className="landing-desk" style={{ backgroundImage: `url(${DESK_BG})` }}>
      <div className="landing-vignette" />

      {/* Ambient dust particles */}
      <div className="landing-particles" aria-hidden="true">
        {Array.from({ length: 12 }).map((_, i) => (
          <div key={i} className="landing-particle" style={{
            left: `${8 + i * 7.5}%`,
            animationDelay: `${i * 0.7}s`,
            animationDuration: `${6 + (i % 4) * 2}s`,
          }} />
        ))}
      </div>

      {/* ── The Journal ──────────────────────────────────────────────────── */}
      <div className={`journal-wrapper ${isFlipping ? "journal-flipping" : ""}`} role="main" aria-label="Authentication journal">
        <div className="journal-pages-right" />
        <div className="journal-pages-bottom" />

        <div className="journal-cover" style={{ backgroundImage: `url(${LEATHER_COVER})` }}>
          <div className="journal-leather-overlay" />
          <div className="journal-stitching" aria-hidden="true" />
          <div className="journal-corner journal-corner-tl" />
          <div className="journal-corner journal-corner-tr" />
          <div className="journal-corner journal-corner-bl" />
          <div className="journal-corner journal-corner-br" />

          {/* ── Velo Notes Title Plate ─────────────────────────────────── */}
          <div className="journal-title-plate">
            <div className="journal-title-plate-inner" style={{
              background: "linear-gradient(135deg, rgba(212, 175, 55, 0.15) 0%, rgba(184, 134, 11, 0.1) 100%)",
              border: "1px solid rgba(212, 175, 55, 0.3)",
              borderRadius: "8px",
              padding: "20px 24px",
              textAlign: "center",
              boxShadow: "0 4px 12px rgba(0,0,0,0.3), inset 0 1px 0 rgba(255,255,255,0.2)"
            }}>
              <div className="journal-logo-icon" style={{ marginBottom: 12 }}>
                <img src={VELO_LOGO} alt="Velo Notes" style={{ width: 100, height: "auto", maxWidth: "100%", display: "inline-block", filter: "drop-shadow(0 2px 4px rgba(0,0,0,0.4))" }} />
              </div>
              <p className="journal-subtitle" style={{ marginTop: 8, fontSize: 9, letterSpacing: "0.12em", color: "rgba(220, 190, 110, 0.6)", textShadow: "0 1px 2px rgba(0,0,0,0.6)" }}>
                {isLogin ? "PRIVATE NOTES — MEMBERS ONLY" : "BEGIN YOUR JOURNEY"}
              </p>
            </div>
          </div>

          {/* ✅ ERROR DISPLAY - Added here, above the form */}
          {error && (
            <div style={{
              position: "absolute",
              top: "15%",
              left: "50%",
              transform: "translateX(-50%)",
              background: "rgba(180, 30, 30, 0.95)",
              color: "white",
              padding: "10px 20px",
              borderRadius: "6px",
              fontSize: "12px",
              fontFamily: "'Courier Prime', monospace",
              boxShadow: "0 4px 12px rgba(0,0,0,0.4)",
              zIndex: 100,
              display: "flex",
              alignItems: "center",
              gap: "12px",
              maxWidth: "80%",
              textAlign: "center"
            }}>
              <span>⚠️ {error}</span>
              <button onClick={clearError} style={{ background: "none", border: "none", color: "white", cursor: "pointer", fontSize: "18px", lineHeight: 1, padding: 0 }}>×</button>
            </div>
          )}

{/* ── Auth Form ────────────────────────────────────────────── */}
<div className={`journal-form-area ${isFlipping ? "journal-form-fading" : ""}`}>
  <div className={`journal-paper-label ${!isLogin ? "journal-paper-label-open" : ""}`}>
    
    {/* Register: Name field */}
    {!isLogin && (
      <div className="journal-field-group" style={{ animationDelay: "0.05s" }}>
        <label className="journal-field-label">Full Name</label>
        <div className="journal-input-wrapper">
          <span className="journal-input-icon"><UserIcon /></span>
          <input
            type="text"
            className="journal-input"
            placeholder="Your name..."
            value={username}
            onChange={e => setUsername(e.target.value)}
            autoComplete="name"
          />
        </div>
      </div>
    )}

    {/* Login: Username / Register: Email */}
    <div className="journal-field-group" style={{ animationDelay: isLogin ? "0s" : "0.1s" }}>
      <label className="journal-field-label">
        {isLogin ? "Username or Email" : "Email Address"}
      </label>
      <div className="journal-input-wrapper">
        <span className="journal-input-icon">
          {isLogin ? <UserIcon /> : <MailIcon />}
        </span>
        <input
          type={isLogin ? "text" : "email"}
          className="journal-input"
          placeholder={isLogin ? "Enter your name..." : "your@email.com"}
          value={isLogin ? username : email}
          onChange={e => isLogin ? setUsername(e.target.value) : setEmail(e.target.value)}
          autoComplete={isLogin ? "username" : "email"}
        />
      </div>
    </div>

    {/* ✅ ADD THIS: Password field */}
    <div className="journal-field-group" style={{ animationDelay: isLogin ? "0.05s" : "0.15s" }}>
      <label className="journal-field-label">Secret Passphrase</label>
      <div className="journal-input-wrapper">
        <span className="journal-input-icon"><KeyIcon /></span>
        <input
          type="password"
          className="journal-input"
          placeholder="••••••••"
          value={password}
          onChange={e => {
            console.log("🔑 Password:", e.target.value);
            setPassword(e.target.value);
          }}
          autoComplete={isLogin ? "current-password" : "new-password"}
        />
      </div>
    </div>

    {/* Register: Confirm password */}
    {!isLogin && (
      <div className="journal-field-group" style={{ animationDelay: "0.2s" }}>
        <label className="journal-field-label">Confirm Passphrase</label>
        <div className="journal-input-wrapper">
          <span className="journal-input-icon"><KeyIcon /></span>
          <input
            type="password"
            className="journal-input"
            placeholder="••••••••"
            value={confirm}
            onChange={e => {
              console.log("📝 Confirm:", e.target.value);
              setConfirm(e.target.value);
            }}
            autoComplete="new-password"
          />
        </div>
      </div>
    )}
  
            </div>

            {/* ── Wax Seal Submit ──────────────────────────────────── */}
            <div className="journal-seal-area">
              <button className={`journal-wax-seal ${sealPressed ? "journal-wax-seal-pressed" : ""} ${inkVisible ? "journal-wax-seal-inked" : ""}`} onClick={handleSubmit} type="button" aria-label={isLogin ? "Sign In" : "Create Account"}>
                <div className="journal-seal-outer">
                  <div className="journal-seal-inner">
                    <div className="journal-seal-emblem"><LockIcon /></div>
                    <span className="journal-seal-text">{isLogin ? "OPEN" : "SEAL"}</span>
                  </div>
                </div>
                {inkVisible && <div className="journal-seal-ink-ring" />}
              </button>
              <p className="journal-seal-label">{isLogin ? "Press seal to enter" : "Press to bind your account"}</p>
            </div>

            {/* ── Clasp / Lock ornament ────────────────────────────── */}
            <div className="journal-clasp" aria-hidden="true">
              <div className="journal-clasp-strap-left" />
              <div className="journal-clasp-buckle">
                <div className="journal-clasp-buckle-inner">
                  <div className="journal-clasp-prong" />
                </div>
              </div>
              <div className="journal-clasp-strap-right" />
            </div>
          </div>

          {/* ── Mode toggle ──────────────────────────────────────── */}
          <div className="journal-toggle-area">
            {isLogin ? (
              <p className="journal-toggle-text">
                Don't have a notebook?{" "}
                <button className="journal-toggle-link" onClick={() => switchMode("register")} type="button">Register here</button>
              </p>
            ) : (
              <p className="journal-toggle-text">
                Already a member?{" "}
                <button className="journal-toggle-link" onClick={() => switchMode("login")} type="button">Sign in instead</button>
              </p>
            )}
          </div>
        </div>
      </div>

      {/* ── Desk accessories ─────────────────────────────────────────────── */}
      <div className="landing-quill" aria-hidden="true">
        <svg viewBox="0 0 80 200" fill="none" xmlns="http://www.w3.org/2000/svg">
          <path d="M40 190 C38 150, 20 80, 5 10 C25 40, 55 40, 75 10 C60 80, 42 150, 40 190Z" fill="rgba(245,235,200,0.7)" stroke="rgba(180,150,80,0.5)" strokeWidth="0.5"/>
          <path d="M40 190 L40 120" stroke="rgba(120,90,40,0.6)" strokeWidth="1.5"/>
        </svg>
      </div>
      <div className="landing-candle-glow" aria-hidden="true" />
    </div>
  );
}