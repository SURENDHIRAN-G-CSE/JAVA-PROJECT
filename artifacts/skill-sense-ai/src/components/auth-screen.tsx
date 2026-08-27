import { useState, type FormEvent } from 'react';
import { AlertCircle, ArrowRight, Eye, EyeOff, LockKeyhole, Mail, Radar, UserRound } from 'lucide-react';
import { SiGoogle } from 'react-icons/si';
import {
  isFirebaseConfigured,
  signInWithEmail,
  signInWithGoogle,
  signUpWithEmail,
} from '@/lib/firebase';

type AuthMode = 'signin' | 'signup';

function friendlyAuthError(error: unknown) {
  const code = error instanceof Error ? error.message : '';
  if (code.includes('auth/email-already-in-use')) return 'An account already exists for this email.';
  if (code.includes('auth/invalid-credential') || code.includes('auth/wrong-password')) return 'That email or password is not correct.';
  if (code.includes('auth/weak-password')) return 'Use a password with at least six characters.';
  if (code.includes('auth/popup-closed-by-user')) return 'The Google sign-in window was closed before finishing.';
  return 'Something went wrong. Please try again.';
}

export default function AuthScreen({ onPreview }: { onPreview: () => void }) {
  const [mode, setMode] = useState<AuthMode>('signup');
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [pending, setPending] = useState(false);
  const [error, setError] = useState('');

  const submit = async (event: FormEvent) => {
    event.preventDefault();
    setError('');
    setPending(true);
    try {
      if (mode === 'signup') await signUpWithEmail(email, password);
      else await signInWithEmail(email, password);
    } catch (authError) {
      setError(friendlyAuthError(authError));
    } finally {
      setPending(false);
    }
  };

  const googleAuth = async () => {
    setError('');
    setPending(true);
    try {
      await signInWithGoogle();
    } catch (authError) {
      setError(friendlyAuthError(authError));
    } finally {
      setPending(false);
    }
  };

  return (
    <main className="auth-page min-h-[100dvh] bg-background text-foreground">
      <div className="auth-glow pointer-events-none absolute inset-0" />
      <div className="relative mx-auto grid min-h-[100dvh] max-w-7xl items-center gap-10 px-5 py-8 lg:grid-cols-[1.1fr_.9fr] lg:px-10">
        <section className="hidden min-h-[620px] flex-col justify-between rounded-[28px] bg-sidebar p-8 text-sidebar-foreground lg:flex xl:p-12" data-testid="auth-brand-panel">
          <div>
            <div className="flex items-center gap-3">
              <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-accent text-foreground">
                <Radar size={20} />
              </div>
              <div>
                <div className="text-sm font-bold tracking-tight">skill sense</div>
                <div className="font-mono-ui text-[9px] uppercase tracking-[.22em] text-sidebar-foreground/45">career intelligence</div>
              </div>
            </div>
            <div className="mt-24 max-w-lg">
              <div className="font-mono-ui text-[10px] uppercase tracking-[.22em] text-sidebar-primary">Your next signal starts here</div>
              <h1 className="mt-5 text-5xl leading-[1.05] tracking-[-.06em] xl:text-6xl">
                Build a career that feels <span className="font-display italic text-sidebar-primary">intentional.</span>
              </h1>
              <p className="mt-6 max-w-md text-sm leading-7 text-sidebar-foreground/60">
                Know where you stand, understand what to practice, and turn your progress into proof that opens doors.
              </p>
            </div>
          </div>
          <div className="grid grid-cols-3 gap-3">
            {[
              ['72', 'current signal'],
              ['18.6%', 'skill momentum'],
              ['06', 'weeks to focus'],
            ].map(([value, label]) => (
              <div className="rounded-2xl border border-sidebar-border bg-sidebar-accent/55 p-4" key={label}>
                <div className="font-mono-ui text-xl text-sidebar-primary">{value}</div>
                <div className="mt-2 font-mono-ui text-[9px] uppercase tracking-wider text-sidebar-foreground/40">{label}</div>
              </div>
            ))}
          </div>
        </section>

        <section className="mx-auto w-full max-w-[480px]" data-testid="auth-form-panel">
          <div className="mb-8 flex items-center gap-3 lg:hidden">
            <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-accent text-foreground"><Radar size={20} /></div>
            <div><div className="text-sm font-bold">skill sense</div><div className="font-mono-ui text-[9px] uppercase tracking-[.2em] text-muted-foreground">career intelligence</div></div>
          </div>
          <div className="mb-8">
            <div className="font-mono-ui text-[10px] uppercase tracking-[.22em] text-primary">Welcome to your workspace</div>
            <h2 className="mt-3 text-4xl tracking-[-.05em]">{mode === 'signup' ? 'Start with a clear signal.' : 'Welcome back, builder.'}</h2>
            <p className="mt-3 text-sm leading-6 text-muted-foreground">{mode === 'signup' ? 'Create your account and make your next move feel measurable.' : 'Pick up where your career momentum left off.'}</p>
          </div>

          {!isFirebaseConfigured && (
            <div className="mb-5 flex gap-3 rounded-xl border border-accent/40 bg-accent/15 p-4 text-xs leading-5" data-testid="status-firebase-config">
              <AlertCircle size={16} className="mt-0.5 shrink-0 text-accent" />
              <div><span className="font-bold">Firebase setup is almost ready.</span> Add your Firebase web configuration in the project environment to enable live accounts. Preview access stays available below.</div>
            </div>
          )}

          <button onClick={googleAuth} disabled={pending || !isFirebaseConfigured} className="flex h-12 w-full items-center justify-center gap-3 rounded-xl border border-border bg-card text-sm font-semibold transition hover:border-primary hover:bg-muted disabled:cursor-not-allowed disabled:opacity-50" data-testid="button-google-auth">
            <SiGoogle size={16} /> Continue with Google
          </button>
          <div className="my-6 flex items-center gap-3"><div className="h-px flex-1 bg-border" /><span className="font-mono-ui text-[9px] uppercase tracking-widest text-muted-foreground">or email</span><div className="h-px flex-1 bg-border" /></div>

          <form onSubmit={submit} className="space-y-4">
            {mode === 'signup' && <label className="block text-xs font-semibold">Your name<div className="relative mt-2"><UserRound size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground" /><input value={name} onChange={e => setName(e.target.value)} placeholder="Ananya Sharma" className="h-12 w-full rounded-xl border border-input bg-card pl-10 pr-3 text-sm outline-none focus:border-primary focus:ring-2 focus:ring-primary/15" data-testid="input-auth-name" /></div></label>}
            <label className="block text-xs font-semibold">Email address<div className="relative mt-2"><Mail size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground" /><input required type="email" value={email} onChange={e => setEmail(e.target.value)} placeholder="you@example.com" className="h-12 w-full rounded-xl border border-input bg-card pl-10 pr-3 text-sm outline-none focus:border-primary focus:ring-2 focus:ring-primary/15" data-testid="input-auth-email" /></div></label>
            <label className="block text-xs font-semibold">Password<div className="relative mt-2"><LockKeyhole size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground" /><input required minLength={6} type={showPassword ? 'text' : 'password'} value={password} onChange={e => setPassword(e.target.value)} placeholder="At least 6 characters" className="h-12 w-full rounded-xl border border-input bg-card pl-10 pr-11 text-sm outline-none focus:border-primary focus:ring-2 focus:ring-primary/15" data-testid="input-auth-password" /><button type="button" onClick={() => setShowPassword(v => !v)} className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground" data-testid="button-toggle-password" aria-label={showPassword ? 'Hide password' : 'Show password'}>{showPassword ? <EyeOff size={16} /> : <Eye size={16} />}</button></div></label>
            {error && <div className="rounded-xl border border-destructive/30 bg-destructive/10 p-3 text-xs text-destructive" data-testid="status-auth-error">{error}</div>}
            <button type="submit" disabled={pending || !isFirebaseConfigured} className="flex h-12 w-full items-center justify-center gap-2 rounded-xl bg-primary text-sm font-bold text-primary-foreground shadow-[0_8px_20px_hsl(var(--primary)/.18)] transition hover:brightness-105 disabled:cursor-not-allowed disabled:opacity-50" data-testid="button-submit-auth">
              {pending ? 'Connecting…' : mode === 'signup' ? 'Create my workspace' : 'Sign in'} <ArrowRight size={16} />
            </button>
          </form>

          <div className="mt-6 text-center text-sm text-muted-foreground">
            {mode === 'signup' ? 'Already have an account?' : 'New to Skill Sense?'}{' '}
            <button onClick={() => { setMode(mode === 'signup' ? 'signin' : 'signup'); setError(''); }} className="font-bold text-primary hover:underline" data-testid="button-toggle-auth-mode">{mode === 'signup' ? 'Sign in' : 'Create an account'}</button>
          </div>
          <button onClick={onPreview} className="mt-8 flex w-full items-center justify-center gap-2 rounded-xl border border-dashed border-border py-3 text-xs font-semibold text-muted-foreground transition hover:border-primary hover:text-primary" data-testid="button-preview-workspace">Explore the preview workspace <ArrowRight size={14} /></button>
          <p className="mt-6 text-center font-mono-ui text-[9px] uppercase tracking-wider text-muted-foreground/65">Private by design · Your career data stays yours</p>
        </section>
      </div>
    </main>
  );
}