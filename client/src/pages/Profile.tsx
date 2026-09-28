import { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useAuthStore } from '../store/authStore';
import InputField from '../components/InputField';
import PrimaryButton from '../components/PrimaryButton';
import { getErrorMessage } from '../services/api';

export default function Profile() {
  const navigate = useNavigate();
  const { user, updateProfile, logout } = useAuthStore();
  const [editing, setEditing] = useState(false);
  const [form, setForm] = useState({ name: user?.name || '', mobile: user?.mobile || '' });
  const [error, setError] = useState('');
  const [saving, setSaving] = useState(false);

  if (!user) return null;

  async function handleSave() {
    setError('');
    setSaving(true);
    try {
      await updateProfile(form);
      setEditing(false);
    } catch (err) {
      setError(getErrorMessage(err));
    } finally {
      setSaving(false);
    }
  }

  return (
    <div className="flex flex-col gap-6">
      <div className="flex items-center gap-4">
        <div className="flex h-16 w-16 items-center justify-center rounded-full bg-teal text-2xl font-semibold text-paper">
          {user.name.charAt(0).toUpperCase()}
        </div>
        <div>
          <h1 className="font-display text-xl font-semibold text-ink">{user.name}</h1>
          <p className="text-sm capitalize text-ink/60">{user.role}</p>
        </div>
      </div>

      {!editing ? (
        <div className="flex flex-col gap-3 rounded-card border border-ink/10 bg-white p-4 text-sm">
          <div className="flex justify-between">
            <span className="text-ink/50">Email</span>
            <span className="font-medium text-ink">{user.email}</span>
          </div>
          <div className="flex justify-between">
            <span className="text-ink/50">Mobile</span>
            <span className="font-medium text-ink">{user.mobile}</span>
          </div>
          <div className="flex justify-between">
            <span className="text-ink/50">Role</span>
            <span className="font-medium capitalize text-ink">{user.role}</span>
          </div>
        </div>
      ) : (
        <div className="flex flex-col gap-4 rounded-card border border-ink/10 bg-white p-4">
          <InputField label="Full name" value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} />
          <InputField label="Mobile number" value={form.mobile} onChange={(e) => setForm({ ...form, mobile: e.target.value })} />
          {error && <p className="text-sm font-medium text-ember">{error}</p>}
          <div className="flex gap-3">
            <PrimaryButton variant="secondary" fullWidth onClick={() => setEditing(false)}>
              Cancel
            </PrimaryButton>
            <PrimaryButton fullWidth onClick={handleSave} isLoading={saving}>
              Save changes
            </PrimaryButton>
          </div>
        </div>
      )}

      <div className="flex flex-col gap-2">
        {!editing && (
          <PrimaryButton variant="secondary" onClick={() => setEditing(true)}>
            Edit profile
          </PrimaryButton>
        )}
        {user.role === 'organizer' && (
          <Link to="/organizer/dashboard">
            <PrimaryButton variant="ghost" fullWidth>
              Organizer dashboard
            </PrimaryButton>
          </Link>
        )}
        <PrimaryButton
          variant="danger"
          onClick={() => {
            logout();
            navigate('/login');
          }}
        >
          Log out
        </PrimaryButton>
      </div>
    </div>
  );
}
