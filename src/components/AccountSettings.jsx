import { useState, useEffect } from 'react';
import { supabase } from '../services/supabaseClient';
import { useUser } from '../contexts/UserContext';
import { Settings, Bell, Palette } from 'lucide-react';

export default function AccountSettings() {
  const { user } = useUser();
  const [settings, setSettings] = useState({
    currency: 'USD',
    notifications_enabled: true,
    theme: 'light'
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');

  useEffect(() => {
    fetchSettings();
  }, [user]);

  async function fetchSettings() {
    try {
      const { data, error } = await supabase
        .from('account_settings')
        .select('*')
        .eq('user_id', user.id)
        .single();

      if (error) throw error;
      if (data) setSettings(data);
    } catch (error) {
      console.error('Error fetching settings:', error);
    }
  }

  async function updateSettings() {
    try {
      setLoading(true);
      setError('');
      setSuccess('');

      const { error } = await supabase
        .from('account_settings')
        .upsert({
          user_id: user.id,
          ...settings
        });

      if (error) throw error;
      setSuccess('Settings updated successfully!');
    } catch (error) {
      console.error('Error updating settings:', error);
      setError('Failed to update settings');
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="bg-white rounded-xl shadow-sm p-6">
      <h2 className="text-lg font-semibold text-gray-800 mb-4 flex items-center gap-2">
        <Settings className="h-6 w-6 text-emerald-600" />
        Account Settings
      </h2>

      {error && (
        <div className="bg-red-50 text-red-500 p-3 rounded-lg text-sm mb-4">{error}</div>
      )}
      {success && (
        <div className="bg-green-50 text-green-500 p-3 rounded-lg text-sm mb-4">{success}</div>
      )}

      <div className="space-y-4">
        <div>
          <label className="block text-sm font-medium text-gray-700">Currency</label>
          <select
            value={settings.currency}
            onChange={(e) => setSettings({ ...settings, currency: e.target.value })}
            className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-lg
                     focus:ring-emerald-500 focus:border-emerald-500"
          >
            <option value="USD">USD ($)</option>
            <option value="EUR">EUR (€)</option>
            <option value="GBP">GBP (£)</option>
            <option value="JPY">JPY (¥)</option>
          </select>
        </div>

        <div className="flex items-center gap-3">
          <Bell className="h-5 w-5 text-gray-400" />
          <label className="flex items-center">
            <input
              type="checkbox"
              checked={settings.notifications_enabled}
              onChange={(e) => setSettings({ ...settings, notifications_enabled: e.target.checked })}
              className="rounded text-emerald-600 focus:ring-emerald-500 mr-2"
            />
            <span className="text-sm text-gray-700">Enable notifications</span>
          </label>
        </div>

        <div className="flex items-center gap-3">
          <Palette className="h-5 w-5 text-gray-400" />
          <label className="flex items-center">
            <select
              value={settings.theme}
              onChange={(e) => setSettings({ ...settings, theme: e.target.value })}
              className="block w-full px-3 py-2 border border-gray-300 rounded-lg
                       focus:ring-emerald-500 focus:border-emerald-500"
            >
              <option value="light">Light Theme</option>
              <option value="dark">Dark Theme</option>
              <option value="system">System Default</option>
            </select>
          </label>
        </div>

        <button
          onClick={updateSettings}
          disabled={loading}
          className="mt-4 px-4 py-2 bg-emerald-600 text-white rounded-lg hover:bg-emerald-700
                   focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-emerald-500
                   flex items-center gap-2"
        >
          {loading ? 'Saving...' : 'Save Settings'}
        </button>
      </div>
    </div>
  );
} 