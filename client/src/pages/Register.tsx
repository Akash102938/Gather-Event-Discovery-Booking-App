import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuthStore } from '../store/authStore';
import InputField from '../components/InputField';
import PrimaryButton from '../components/PrimaryButton';
import { getErrorMessage } from '../services/api';

export default function Register() {
  const navigate = useNavigate();
  const register = useAuthStore((s) => s.register);
  const [form, setForm] = useState({
    name: '',
    email: '',
    mobile: '',
    password: '',
    confirmPassword: '',
    role: 'user' as 'user' | 'organizer',
  });
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [serverError, setServerError] = useState('');
  const [isLoading, setIsLoading] = useState(false);

  function validate() {
    const e: Record<string, string> = {};
    if (form.name.trim().length < 2) e.name = 'Full name is required.';
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(form.email)) e.email = 'Enter a valid email.';
    if (!/^[0-9]{10}$/.test(form.mobile)) e.mobile = 'Mobile number must be 10 digits.';
    if (form.password.length < 6) e.password = 'Password must be at least 6 characters.';
    if (form.password !== form.confirmPassword) e.confirmPassword = 'Passwords do not match.';
    setErrors(e);
    return Object.keys(e).length === 0;
  }

  async function handleSubmit(ev: React.FormEvent) {
    ev.preventDefault();
    setServerError('');
    if (!validate()) return;
    setIsLoading(true);
    try {
      await register(form);
      navigate('/');
    } catch (err) {
      setServerError(getErrorMessage(err));
    } finally {
      setIsLoading(false);
    }
  }

  return (
    <div className="mx-auto flex min-h-screen max-w-sm flex-col justify-center px-6 py-10">
      <h1 className="font-display text-2xl font-semibold text-ink">Create your account</h1>
      <p className="mt-1 text-sm text-ink/60">Join Gather to discover and host events.</p>

      <form onSubmit={handleSubmit} className="mt-8 flex flex-col gap-4">
        <InputField label="Full name" value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} error={errors.name} />
        <InputField label="Email" type="email" value={form.email} onChange={(e) => setForm({ ...form, email: e.target.value })} error={errors.email} />
        <InputField label="Mobile number" value={form.mobile} onChange={(e) => setForm({ ...form, mobile: e.target.value })} error={errors.mobile} placeholder="10 digit number" />
        <InputField label="Password" type="password" value={form.password} onChange={(e) => setForm({ ...form, password: e.target.value })} error={errors.password} />
        <InputField label="Confirm password" type="password" value={form.confirmPassword} onChange={(e) => setForm({ ...form, confirmPassword: e.target.value })} error={errors.confirmPassword} />

        <div>
          <label className="mb-1.5 block text-sm font-medium text-ink/80">I am a</label>
          <div className="grid grid-cols-2 gap-3">
            {(['user', 'organizer'] as const).map((role) => (
              <button
                type="button"
                key={role}
                onClick={() => setForm({ ...form, role })}
                className={`focus-ring rounded-card border px-4 py-2.5 text-sm font-medium capitalize ${
                  form.role === role ? 'border-teal bg-teal text-paper' : 'border-ink/15 text-ink'
                }`}
              >
                {role}
              </button>
            ))}
          </div>
        </div>

        {serverError && <p className="text-sm font-medium text-ember">{serverError}</p>}
        <PrimaryButton type="submit" isLoading={isLoading} fullWidth>
          Create account
        </PrimaryButton>
      </form>

      <p className="mt-6 text-center text-sm text-ink/60">
        Already have an account?{' '}
        <Link to="/login" className="font-medium text-teal">
          Log in
        </Link>
      </p>
    </div>
  );
}
