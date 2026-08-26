import { useState } from 'react';

export default function Login({ onLogin }: { onLogin: (user: any) => void }) {
  const [isLoading, setIsLoading] = useState(false);
  const [mode, setMode] = useState<'signin' | 'signup'>('signup');
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');

  const handleGoogleLogin = () => {
    setIsLoading(true);
    setTimeout(() => {
      onLogin({
        name: name || 'Harshavardhan',
        email: email || 'harshavardhan@gmail.com',
        avatar: ''
      });
      setIsLoading(false);
    }, 1200);
  };

  const handleSignUp = () => {
    if (!name.trim() || !email.trim()) {
      alert('Please fill in all fields');
      return;
    }
    setIsLoading(true);
    setTimeout(() => {
      onLogin({ name: name.trim(), email: email.trim(), avatar: '' });
      setIsLoading(false);
    }, 1200);
  };

  const inputStyle: React.CSSProperties = {
    width: '100%',
    padding: '14px 16px',
    borderRadius: '14px',
    border: '1px solid #e2e8f0',
    fontSize: '15px',
    fontFamily: 'Inter, sans-serif',
    outline: 'none',
    transition: 'border-color 0.2s',
    background: '#f8fafc',
    color: '#0f172a',
    marginBottom: '12px',
    boxSizing: 'border-box' as const
  };

  return (
    <div style={{
      position: 'fixed',
      top: 0, left: 0, right: 0, bottom: 0,
      display: 'flex',
      flexDirection: 'column',
      background: '#0f172a',
      alignItems: 'center',
      justifyContent: 'center',
      padding: 0,
      overflow: 'auto',
      zIndex: 9999
    }}>
      {/* Top gradient decoration */}
      <div style={{
        position: 'absolute', top: 0, left: 0, right: 0, height: '40%',
        background: 'radial-gradient(ellipse at top, rgba(249,115,22,0.15) 0%, transparent 70%)',
        pointerEvents: 'none'
      }} />

      <div style={{
        background: '#ffffff',
        padding: '24px 20px 24px',
        borderRadius: '24px',
        boxShadow: '0 25px 50px -12px rgba(0, 0, 0, 0.5)',
        width: '100%',
        maxWidth: '360px',
        textAlign: 'center',
        position: 'relative',
        zIndex: 1,
        boxSizing: 'border-box'
      }}>
        {/* App Logo - Stylized Road P with target and pothole cracks */}
        <div style={{
          width: '74px',
          height: '74px',
          margin: '0 auto 16px',
          filter: 'drop-shadow(0 4px 12px rgba(0,0,0,0.15))'
        }}>
          <svg width="100%" height="100%" viewBox="0 0 100 100" fill="none" xmlns="http://www.w3.org/2000/svg">
            {/* Rounded Black Background */}
            <rect width="100" height="100" rx="22" fill="#000000" />
            
            {/* Stylized Orange P Shape */}
            <path d="M42 76V28 C42 20, 68 20, 68 44 C68 52, 58 52, 42 52" stroke="url(#orangeGrad)" strokeWidth="13" strokeLinecap="round" strokeLinejoin="round" />
            
            {/* Road lines inside the stem */}
            <path d="M42 58V70" stroke="#ffffff" strokeWidth="2.5" strokeDasharray="3 3" strokeLinecap="round" />
            <path d="M42 34V46" stroke="#ffffff" strokeWidth="2.5" strokeDasharray="3 3" strokeLinecap="round" />
            
            {/* Pothole Crack cutout in the loop */}
            <circle cx="56" cy="38" r="9" fill="#000000" />
            {/* Crack lines radiating out */}
            <path d="M50 32L45 27" stroke="#000000" strokeWidth="2" strokeLinecap="round" />
            <path d="M62 32L67 27" stroke="#000000" strokeWidth="2" strokeLinecap="round" />
            <path d="M50 44L45 49" stroke="#000000" strokeWidth="2" strokeLinecap="round" />
            <path d="M62 44L67 49" stroke="#000000" strokeWidth="2" strokeLinecap="round" />

            {/* Target Reticle Icon in Upper-Right */}
            <circle cx="73" cy="27" r="4.5" fill="#000000" stroke="#ffffff" strokeWidth="1.5" />
            <circle cx="73" cy="27" r="1.5" fill="#ffffff" />
            
            <defs>
              <linearGradient id="orangeGrad" x1="42" y1="20" x2="68" y2="76" gradientUnits="userSpaceOnUse">
                <stop offset="0%" stopColor="#f97316" />
                <stop offset="100%" stopColor="#ea580c" />
              </linearGradient>
            </defs>
          </svg>
        </div>
        
        <h1 style={{fontSize: '22px', fontWeight: 800, color: '#0f172a', marginBottom: '4px', letterSpacing: '-0.5px', fontFamily: 'Outfit, sans-serif'}}>
          Pothole Pulse
        </h1>
        <p style={{fontSize: '13px', color: '#94a3b8', marginBottom: '18px'}}>
          Civic hazard reporting powered by AI
        </p>

        {/* Mode Tabs */}
        <div style={{display: 'flex', background: '#f1f5f9', borderRadius: '12px', padding: '3px', marginBottom: '18px'}}>
          <button
            onClick={() => setMode('signup')}
            style={{
              flex: 1, padding: '8px', borderRadius: '10px', border: 'none', fontSize: '13px', fontWeight: 600, cursor: 'pointer', transition: 'all 0.2s',
              background: mode === 'signup' ? '#ffffff' : 'transparent',
              color: mode === 'signup' ? '#0f172a' : '#94a3b8',
              boxShadow: mode === 'signup' ? '0 1px 3px rgba(0,0,0,0.1)' : 'none'
            }}
          >
            Sign Up
          </button>
          <button
            onClick={() => setMode('signin')}
            style={{
              flex: 1, padding: '8px', borderRadius: '10px', border: 'none', fontSize: '13px', fontWeight: 600, cursor: 'pointer', transition: 'all 0.2s',
              background: mode === 'signin' ? '#ffffff' : 'transparent',
              color: mode === 'signin' ? '#0f172a' : '#94a3b8',
              boxShadow: mode === 'signin' ? '0 1px 3px rgba(0,0,0,0.1)' : 'none'
            }}
          >
            Sign In
          </button>
        </div>

        {mode === 'signin' ? (
          <>
            <button 
              onClick={handleGoogleLogin}
              disabled={isLoading}
              style={{
                display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '12px',
                width: '100%', background: '#ffffff', border: '1px solid #e2e8f0',
                padding: '13px 20px', borderRadius: '14px', fontSize: '15px', fontWeight: 600,
                color: '#334155', cursor: isLoading ? 'not-allowed' : 'pointer', transition: 'all 0.2s',
                boxShadow: '0 2px 4px rgba(0,0,0,0.02)', opacity: isLoading ? 0.7 : 1
              }}
            >
              {isLoading ? (
                <div style={{
                  width: '20px', height: '20px', border: '3px solid #e2e8f0', borderTopColor: '#f97316', borderRadius: '50%', animation: 'spin 1s linear infinite'
                }} />
              ) : (
                <>
                  <svg width="22" height="22" viewBox="0 0 48 48">
                    <path fill="#EA4335" d="M24 9.5c3.54 0 6.71 1.22 9.21 3.6l6.85-6.85C35.9 2.38 30.47 0 24 0 14.62 0 6.51 5.38 2.56 13.22l7.98 6.19C12.43 13.72 17.74 9.5 24 9.5z"></path>
                    <path fill="#4285F4" d="M46.98 24.55c0-1.57-.15-3.09-.38-4.55H24v9.02h12.94c-.58 2.96-2.26 5.48-4.78 7.18l7.73 6c4.51-4.18 7.09-10.36 7.09-17.65z"></path>
                    <path fill="#FBBC05" d="M10.53 28.59c-.48-1.45-.76-2.99-.76-4.59s.27-3.14.76-4.59l-7.98-6.19C.92 16.46 0 20.12 0 24c0 3.88.92 7.54 2.56 10.78l7.97-6.19z"></path>
                    <path fill="#34A853" d="M24 48c6.48 0 11.93-2.13 15.89-5.81l-7.73-6c-2.15 1.45-4.92 2.3-8.16 2.3-6.26 0-11.57-4.22-13.47-9.91l-7.98 6.19C6.51 42.62 14.62 48 24 48z"></path>
                  </svg>
                  <span>Continue with Google</span>
                </>
              )}
            </button>
          </>
        ) : (
          <>
            <input type="text" placeholder="Full Name" value={name} onChange={e => setName(e.target.value)} style={inputStyle} />
            <input type="email" placeholder="Email Address" value={email} onChange={e => setEmail(e.target.value)} style={inputStyle} />
            <button 
              onClick={handleSignUp}
              disabled={isLoading}
              style={{
                width: '100%', background: 'linear-gradient(135deg, #f97316 0%, #ea580c 100%)',
                border: 'none', padding: '13px 20px', borderRadius: '14px', fontSize: '15px', fontWeight: 700,
                color: '#ffffff', cursor: isLoading ? 'not-allowed' : 'pointer', transition: 'all 0.2s',
                boxShadow: '0 4px 12px rgba(249, 115, 22, 0.3)', opacity: isLoading ? 0.7 : 1,
                display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '8px'
              }}
            >
              {isLoading ? (
                <div style={{
                  width: '20px', height: '20px', border: '3px solid rgba(255,255,255,0.3)', borderTopColor: '#fff', borderRadius: '50%', animation: 'spin 1s linear infinite'
                }} />
              ) : 'Create Account'}
            </button>

            <div style={{display: 'flex', alignItems: 'center', gap: '12px', margin: '14px 0'}}>
              <div style={{flex: 1, height: '1px', background: '#e2e8f0'}}></div>
              <span style={{fontSize: '12px', color: '#94a3b8', fontWeight: 500}}>or</span>
              <div style={{flex: 1, height: '1px', background: '#e2e8f0'}}></div>
            </div>

            <button 
              onClick={handleGoogleLogin}
              disabled={isLoading}
              style={{
                display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '10px',
                width: '100%', background: '#ffffff', border: '1px solid #e2e8f0',
                padding: '13px 20px', borderRadius: '14px', fontSize: '14px', fontWeight: 600,
                color: '#334155', cursor: isLoading ? 'not-allowed' : 'pointer', transition: 'all 0.2s',
                boxShadow: '0 2px 4px rgba(0,0,0,0.02)', opacity: isLoading ? 0.7 : 1
              }}
            >
              <svg width="20" height="20" viewBox="0 0 48 48">
                <path fill="#EA4335" d="M24 9.5c3.54 0 6.71 1.22 9.21 3.6l6.85-6.85C35.9 2.38 30.47 0 24 0 14.62 0 6.51 5.38 2.56 13.22l7.98 6.19C12.43 13.72 17.74 9.5 24 9.5z"></path>
                <path fill="#4285F4" d="M46.98 24.55c0-1.57-.15-3.09-.38-4.55H24v9.02h12.94c-.58 2.96-2.26 5.48-4.78 7.18l7.73 6c4.51-4.18 7.09-10.36 7.09-17.65z"></path>
                <path fill="#FBBC05" d="M10.53 28.59c-.48-1.45-.76-2.99-.76-4.59s.27-3.14.76-4.59l-7.98-6.19C.92 16.46 0 20.12 0 24c0 3.88.92 7.54 2.56 10.78l7.97-6.19z"></path>
                <path fill="#34A853" d="M24 48c6.48 0 11.93-2.13 15.89-5.81l-7.73-6c-2.15 1.45-4.92 2.3-8.16 2.3-6.26 0-11.57-4.22-13.47-9.91l-7.98 6.19C6.51 42.62 14.62 48 24 48z"></path>
              </svg>
              <span>Sign up with Google</span>
            </button>
          </>
        )}
      </div>
      
      <p style={{marginTop: '24px', fontSize: '12px', color: '#475569', textAlign: 'center', position: 'relative', zIndex: 1}}>
        By continuing, you agree to our Terms of Service <br /> and Privacy Policy.
      </p>

      <style>{`
        @keyframes spin {
          0% { transform: rotate(0deg); }
          100% { transform: rotate(360deg); }
        }
        input:focus {
          border-color: #f97316 !important;
          background: #ffffff !important;
        }
      `}</style>
    </div>
  );
}
