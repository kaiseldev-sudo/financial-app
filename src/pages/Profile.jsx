import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { supabase } from '../services/supabaseClient';
import { useUser } from '../contexts/UserContext';
import LoadingSpinner from '../components/LoadingSpinner';
import CollaboratorsModal from '../components/CollaboratorsModal';

export default function Profile() {
  const { user, signOut } = useUser();
  const [loading, setLoading] = useState(false);
  const [profile, setProfile] = useState({
    full_name: '',
    avatar_url: null
  });
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [isCollaboratorsModalOpen, setIsCollaboratorsModalOpen] = useState(false);

  useEffect(() => {
    fetchProfile();
  }, [user]);

  async function fetchProfile() {
    try {
      const { data, error } = await supabase
        .from('profiles')
        .select('*')
        .eq('id', user.id)
        .single();

      if (error) throw error;
      if (data) setProfile(data);
    } catch (error) {
      console.error('Error fetching profile:', error);
    }
  }

  async function updateProfile(e) {
    e.preventDefault();
    setLoading(true);
    setError('');
    setSuccess('');

    try {
      const { error } = await supabase
        .from('profiles')
        .upsert({
          id: user.id,
          full_name: profile.full_name,
          updated_at: new Date()
        });

      if (error) throw error;
      setSuccess('Profile updated successfully!');
    } catch (error) {
      setError('Error updating profile');
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="max-w-2xl mx-auto space-y-6">
      <h1 className="text-2xl font-bold text-gray-800">Profile Settings</h1>

      <div className="bg-white rounded-xl shadow-sm p-6">
        <form onSubmit={updateProfile} className="space-y-6">
          {error && (
            <div className="bg-red-50 text-red-500 p-3 rounded-lg text-sm">{error}</div>
          )}
          {success && (
            <div className="bg-green-50 text-green-500 p-3 rounded-lg text-sm">{success}</div>
          )}

          <div>
            <label className="block text-sm font-medium text-gray-700">Email</label>
            <input
              type="email"
              disabled
              value={user?.email}
              className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-lg 
                       bg-gray-50 text-gray-500"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700">Full Name</label>
            <input
              type="text"
              value={profile.full_name || ''}
              onChange={(e) => setProfile({ ...profile, full_name: e.target.value })}
              className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-lg
                       focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500"
            />
          </div>

          <div className="flex justify-between items-center pt-4">
            <button
              type="submit"
              disabled={loading}
              className="px-4 py-2 bg-emerald-600 text-white rounded-lg hover:bg-emerald-700
                       focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-emerald-500"
            >
              {loading ? 'Saving...' : 'Save Changes'}
            </button>

            <button
              type="button"
              onClick={signOut}
              className="px-4 py-2 text-gray-700 hover:text-gray-900"
            >
              Sign Out
            </button>
          </div>
        </form>
      </div>

      <div className="bg-white rounded-xl shadow-sm p-6 mt-6">
        <h2 className="text-lg font-semibold text-gray-800 mb-4">Collaboration</h2>
        <button
          onClick={() => setIsCollaboratorsModalOpen(true)}
          className="px-4 py-2 bg-emerald-600 text-white rounded-lg hover:bg-emerald-700
                    transition-colors flex items-center gap-2"
        >
          Manage Collaborators
        </button>
      </div>

      {isCollaboratorsModalOpen && (
        <CollaboratorsModal
          isOpen={isCollaboratorsModalOpen}
          onClose={() => setIsCollaboratorsModalOpen(false)}
        />
      )}
    </div>
  );
} 