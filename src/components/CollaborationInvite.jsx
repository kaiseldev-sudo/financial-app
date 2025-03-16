import { useState, useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { motion } from 'framer-motion';
import { supabase } from '../services/supabaseClient';
import { useUser } from '../contexts/UserContext';
import LoadingSpinner from './LoadingSpinner';

export default function CollaborationInvite() {
  const { token } = useParams();
  const { user } = useUser();
  const navigate = useNavigate();
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [invitation, setInvitation] = useState(null);

  useEffect(() => {
    if (token) {
      checkInvitation();
    }
  }, [token, user]);

  async function checkInvitation() {
    try {
      setLoading(true);
      const { data, error } = await supabase
        .from('collaborators')
        .select('*, account_owner:account_owner_id(email)')
        .eq('invitation_token', token)
        .single();

      if (error) throw error;
      
      if (data) {
        setInvitation(data);
        if (user && user.email === data.email) {
          await acceptInvitation();
        }
      }
    } catch (err) {
      setError('Invalid or expired invitation');
    } finally {
      setLoading(false);
    }
  }

  async function acceptInvitation() {
    try {
      setLoading(true);
      const { error } = await supabase
        .from('collaborators')
        .update({
          user_id: user.id,
          status: 'active',
          invitation_token: null
        })
        .eq('invitation_token', token);

      if (error) throw error;
      navigate('/dashboard');
    } catch (err) {
      setError('Failed to accept invitation');
    } finally {
      setLoading(false);
    }
  }

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <LoadingSpinner />
      </div>
    );
  }

  return (
    <div className="min-h-screen flex items-center justify-center px-4">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="max-w-md w-full bg-white p-8 rounded-2xl shadow-lg"
      >
        {error ? (
          <div className="text-center text-red-600">{error}</div>
        ) : invitation ? (
          <div className="text-center">
            <h2 className="text-2xl font-bold text-gray-800 mb-4">
              Collaboration Invitation
            </h2>
            <p className="text-gray-600 mb-6">
              You've been invited to collaborate on {invitation.account_owner.email}'s financial tracking
            </p>
            {!user ? (
              <div className="space-y-4">
                <p className="text-sm text-gray-500">
                  Please create an account or sign in with {invitation.email} to accept this invitation
                </p>
                <div className="space-x-4">
                  <button
                    onClick={() => navigate(`/register?email=${invitation.email}&invite=${token}`)}
                    className="px-4 py-2 bg-emerald-600 text-white rounded-lg hover:bg-emerald-700"
                  >
                    Create Account
                  </button>
                  <button
                    onClick={() => navigate(`/login?invite=${token}`)}
                    className="px-4 py-2 text-emerald-600 hover:text-emerald-700"
                  >
                    Sign In
                  </button>
                </div>
              </div>
            ) : user.email === invitation.email ? (
              <button
                onClick={acceptInvitation}
                className="px-4 py-2 bg-emerald-600 text-white rounded-lg hover:bg-emerald-700"
              >
                Accept Invitation
              </button>
            ) : (
              <p className="text-red-600">
                Please sign in with {invitation.email} to accept this invitation
              </p>
            )}
          </div>
        ) : null}
      </motion.div>
    </div>
  );
} 