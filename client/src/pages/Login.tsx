import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuthStore } from '../store/authStore';
import InputField from '../components/InputField';
import PrimaryButton from '../components/PrimaryButton';
import { getErrorMessage } from '../services/api';

export default function Login() {
  const navigate = useNavigate();
  const login = useAuthStore((s) => s.login);
  const [form, setForm] = useState({ email: '', password: '' });
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [serverError, setServerError] = useState('');
  const [isLoading, setIsLoading] = useState(false);

  function validate() {
    const e: Record<string, string> = {};
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(form.email)) e.email = 'Enter a valid email.';
    if (!form.password) e.password = 'Password is required.';
    setErrors(e);
    return Object.keys(e).length === 0;
  }

  async function handleSubmit(ev: React.FormEvent) {
    ev.preventDefault();
    setServerError('');
    if (!validate()) return;
    setIsLoading(true);
    try {
      await login(form.email, form.password);
      navigate('/');
    } catch (err) {
      setServerError(getErrorMessage(err));
    } finally {
      setIsLoading(false);
    }
  }

  return (
    <div className="mx-auto flex min-h-screen max-w-sm flex-col justify-center px-6 py-10">
      <h1 className="font-display text-2xl font-semibold text-ink">Welcome back</h1>
      <p className="mt-1 text-sm text-ink/60">Log in to discover and book events.</p>

      <form onSubmit={handleSubmit} className="mt-8 flex flex-col gap-4">
        <InputField
          label="Email"
          type="email"
          value={form.email}
          onChange={(e) => setForm({ ...form, email: e.target.value })}
          error={errors.email}
          placeholder="you@example.com"
        />
        <InputField
          label="Password"
          type="password"
          value={form.password}
          onChange={(e) => setForm({ ...form, password: e.target.value })}
          error={errors.password}
          placeholder="••••••••"
        />
        {serverError && <p className="text-sm font-medium text-ember">{serverError}</p>}
        <PrimaryButton type="submit" isLoading={isLoading} fullWidth>
          Log in
        </PrimaryButton>
      </form>

      <p className="mt-6 text-center text-sm text-ink/60">
        New here?{' '}
        <Link to="/register" className="font-medium text-teal">
          Create an account
        </Link>
      </p>

      <p className="mt-4 rounded-card bg-sand/60 px-4 py-3 text-center text-xs text-ink/50">
        Demo accounts — user@demo.com / organizer@demo.com, password: Password123
      </p>
    </div>
  );
}
