import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { supabase } from '../services/supabaseClient';
import { useUser } from '../contexts/UserContext';
import LoadingSpinner from '../components/LoadingSpinner';
import CollaboratorsModal from '../components/CollaboratorsModal';
import { 
  Users, 
  UserPlus, 
  LogOut, 
  Settings, 
  Mail, 
  User,
  Save,
  Upload
} from 'lucide-react';
import Avatar from '../components/Avatar';
import AccountSettings from '../components/AccountSettings';

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
  const [uploading, setUploading] = useState(false);

  useEffect(() => {
    fetchProfile();
  }, [user]);

  async function fetchProfile() {
    try {
      const { data, error } = await supabase
        .from('profiles')
        .select('full_name, avatar_url')
        .eq('id', user.id)
        .single();

      if (error) throw error;
      
      if (data) {
        setProfile({
          full_name: data.full_name || '',
          avatar_url: data.avatar_url || user.user_metadata?.avatar_url || null
        });
      }
    } catch (error) {
      console.error('Error fetching profile:', error);
      setError('Failed to load profile');
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

  async function handleAvatarUpload(event) {
    try {
      setUploading(true);
      setError('');
      
      const file = event.target.files?.[0];
      if (!file) return;

      // Validate file type
      const fileExt = file.name.split('.').pop();
      const allowedTypes = ['jpg', 'jpeg', 'png', 'gif'];
      if (!allowedTypes.includes(fileExt.toLowerCase())) {
        throw new Error('Invalid file type. Please upload an image file.');
      }

      // Create unique file name
      const fileName = `${user.id}.${fileExt}`;
      const filePath = `${fileName}`;

      // Upload to Supabase Storage
      const { error: uploadError } = await supabase.storage
        .from('avatars')
        .upload(filePath, file, { 
          upsert: true,
          contentType: file.type 
        });

      if (uploadError) throw uploadError;

      // Get public URL
      const { data: { publicUrl } } = supabase.storage
        .from('avatars')
        .getPublicUrl(filePath);

      // Update both auth metadata and profiles table
      const { error: updateAuthError } = await supabase.auth.updateUser({
        data: { avatar_url: publicUrl }
      });

      if (updateAuthError) throw updateAuthError;

      const { error: updateProfileError } = await supabase
        .from('profiles')
        .update({ avatar_url: publicUrl })
        .eq('id', user.id);

      if (updateProfileError) throw updateProfileError;

      // Update local state
      setProfile(prev => ({ ...prev, avatar_url: publicUrl }));
      setSuccess('Avatar updated successfully!');
    } catch (error) {
      console.error('Error uploading avatar:', error);
      setError(error.message || 'Failed to upload avatar');
    } finally {
      setUploading(false);
    }
  }

  return (
    <div className="max-w-2xl mx-auto space-y-6">
      <h1 className="text-2xl font-bold text-gray-800 flex items-center gap-2">
        <Settings className="h-7 w-7 text-emerald-600" />
        Profile Settings
      </h1>

      <div className="bg-white rounded-xl shadow-sm p-6">
        <form onSubmit={updateProfile} className="space-y-6">
          {error && (
            <div className="bg-red-50 text-red-500 p-3 rounded-lg text-sm">{error}</div>
          )}
          {success && (
            <div className="bg-green-50 text-green-500 p-3 rounded-lg text-sm">{success}</div>
          )}

          <div className="flex flex-col items-center gap-4">
            <Avatar 
              url={profile.avatar_url} 
              name={profile.full_name || user.email}
              size="lg"
            />
            <label className="flex items-center gap-2 px-4 py-2 bg-gray-100 rounded-lg
                           hover:bg-gray-200 cursor-pointer transition-colors">
              <Upload className="h-4 w-4" />
              <span className="text-sm font-medium">Upload Photo</span>
              <input
                type="file"
                accept="image/*"
                onChange={handleAvatarUpload}
                disabled={uploading}
                className="hidden"
              />
            </label>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 flex items-center gap-2">
              <Mail className="h-4 w-4 text-gray-400" />
              Email
            </label>
            <input
              type="email"
              disabled
              value={user?.email}
              className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-lg 
                       bg-gray-50 text-gray-500"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 flex items-center gap-2">
              <User className="h-4 w-4 text-gray-400" />
              Full Name
            </label>
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
                       focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-emerald-500
                       flex items-center gap-2"
            >
              <Save className="h-5 w-5" />
              {loading ? 'Saving...' : 'Save Changes'}
            </button>

            <button
              type="button"
              onClick={signOut}
              className="px-4 py-2 text-gray-700 hover:text-gray-900 flex items-center gap-2"
            >
              <LogOut className="h-5 w-5" />
              Sign Out
            </button>
          </div>
        </form>
      </div>

      <AccountSettings />

      <div className="bg-white rounded-xl shadow-sm p-6 mt-6">
        <h2 className="text-lg font-semibold text-gray-800 mb-4 flex items-center gap-2">
          <Users className="h-6 w-6 text-emerald-600" />
          Collaboration
        </h2>
        <button
          onClick={() => setIsCollaboratorsModalOpen(true)}
          className="px-4 py-2 bg-emerald-600 text-white rounded-lg hover:bg-emerald-700
                    transition-colors flex items-center gap-2"
        >
          <UserPlus className="h-5 w-5" />
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