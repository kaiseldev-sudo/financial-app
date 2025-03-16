import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { supabase } from '../services/supabaseClient';
import { useUser } from '../contexts/UserContext';
import { PulseLoader } from 'react-spinners';

export default function CollaboratorsModal({ isOpen, onClose }) {
  const { user } = useUser();
  const [loading, setLoading] = useState(false);
  const [collaborators, setCollaborators] = useState([]);
  const [newCollaborator, setNewCollaborator] = useState({ email: '', permissions: {
    can_add: true,
    can_edit: false,
    can_delete: false
  }});
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');

  useEffect(() => {
    if (isOpen) {
      fetchCollaborators();
    }
  }, [isOpen]);

  async function fetchCollaborators() {
    try {
      setLoading(true);
      const { data, error } = await supabase
        .from('collaborators')
        .select('*')
        .eq('account_owner_id', user.id);

      if (error) throw error;
      setCollaborators(data || []);
    } catch (err) {
      console.error('Error fetching collaborators:', err);
      setError('Failed to load collaborators');
    } finally {
      setLoading(false);
    }
  }

  async function addCollaborator(e) {
    e.preventDefault();
    setLoading(true);
    setError('');
    setSuccess('');

    try {
      // Validate email
      if (!newCollaborator.email) {
        throw new Error('Email is required');
      }

      // Add collaborator to database with invitation token
      const invitation_token = crypto.randomUUID();
      const { data: collaboratorData, error: collaboratorError } = await supabase
        .from('collaborators')
        .insert({
          account_owner_id: user.id,
          email: newCollaborator.email,
          permissions: newCollaborator.permissions,
          status: 'pending',
          invitation_token: invitation_token
        })
        .select()
        .single();

      if (collaboratorError) throw collaboratorError;

      console.log('Sending invitation email...');
      const { data: sessionData, error: sessionError } = await supabase.auth.getSession();
      if (sessionError) throw new Error('Failed to get session');

      const { data, error: emailError } = await supabase.functions.invoke('send-invite-email', {
        body: {
          to: newCollaborator.email,
          inviterEmail: user.email,
          invitationToken: invitation_token
        },
        headers: {
          'Authorization': `Bearer ${sessionData.session.access_token}`,
        },
      });

      if (emailError) {
        console.error('Email error:', emailError);
        throw new Error(`Failed to send invitation email: ${emailError.message}`);
      }

      if (!data?.success) {
        throw new Error(data?.error || 'Failed to send invitation email');
      }

      setSuccess('Invitation sent successfully!');
      setCollaborators([...collaborators, collaboratorData]);
      setNewCollaborator({ 
        email: '', 
        permissions: {
          can_add: true,
          can_edit: false,
          can_delete: false
        }
      });
    } catch (err) {
      console.error('Error adding collaborator:', err);
      setError(err.message || 'Failed to add collaborator');
      
      // If we failed to send the email, clean up the collaborator record
      if (err.message.includes('Failed to send invitation email')) {
        try {
          await supabase
            .from('collaborators')
            .delete()
            .eq('email', newCollaborator.email)
            .eq('account_owner_id', user.id);
        } catch (cleanupError) {
          console.error('Failed to clean up collaborator record:', cleanupError);
        }
      }
    } finally {
      setLoading(false);
    }
  }

  async function updatePermissions(collaboratorId, newPermissions) {
    try {
      setLoading(true);
      const { error } = await supabase
        .from('collaborators')
        .update({ permissions: newPermissions })
        .eq('id', collaboratorId);

      if (error) throw error;

      setCollaborators(collaborators.map(c => 
        c.id === collaboratorId ? { ...c, permissions: newPermissions } : c
      ));
    } catch (err) {
      console.error('Error updating permissions:', err);
      setError('Failed to update permissions');
    } finally {
      setLoading(false);
    }
  }

  async function removeCollaborator(collaboratorId) {
    try {
      setLoading(true);
      const { error } = await supabase
        .from('collaborators')
        .delete()
        .eq('id', collaboratorId);

      if (error) throw error;
      
      setCollaborators(collaborators.filter(c => c.id !== collaboratorId));
      setSuccess('Collaborator removed successfully!');
    } catch (err) {
      console.error('Error removing collaborator:', err);
      setError('Failed to remove collaborator');
    } finally {
      setLoading(false);
    }
  }

  return (
    <AnimatePresence>
      {isOpen && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4"
        >
          <motion.div
            initial={{ scale: 0.95 }}
            animate={{ scale: 1 }}
            exit={{ scale: 0.95 }}
            className="bg-white rounded-xl shadow-lg p-6 w-full max-w-lg"
          >
            <h2 className="text-xl font-bold text-gray-800 mb-4">Manage Collaborators</h2>
            
            {error && (
              <div className="mb-4 p-3 bg-red-50 text-red-500 rounded-lg">{error}</div>
            )}
            {success && (
              <div className="mb-4 p-3 bg-green-50 text-green-500 rounded-lg">{success}</div>
            )}

            <form onSubmit={addCollaborator} className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Invite by Email
                </label>
                <input
                  type="email"
                  value={newCollaborator.email}
                  onChange={(e) => setNewCollaborator({
                    ...newCollaborator,
                    email: e.target.value
                  })}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg
                            focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500"
                  placeholder="Enter email address"
                />
              </div>

              <div className="space-y-2">
                <label className="block text-sm font-medium text-gray-700">
                  Permissions
                </label>
                <div className="space-y-2">
                  <label className="flex items-center">
                    <input
                      type="checkbox"
                      checked={newCollaborator.permissions.can_add}
                      onChange={(e) => setNewCollaborator({
                        ...newCollaborator,
                        permissions: {
                          ...newCollaborator.permissions,
                          can_add: e.target.checked
                        }
                      })}
                      className="rounded text-emerald-600 focus:ring-emerald-500"
                    />
                    <span className="ml-2 text-sm text-gray-700">Can add transactions</span>
                  </label>
                  <label className="flex items-center">
                    <input
                      type="checkbox"
                      checked={newCollaborator.permissions.can_edit}
                      onChange={(e) => setNewCollaborator({
                        ...newCollaborator,
                        permissions: {
                          ...newCollaborator.permissions,
                          can_edit: e.target.checked
                        }
                      })}
                      className="rounded text-emerald-600 focus:ring-emerald-500"
                    />
                    <span className="ml-2 text-sm text-gray-700">Can edit transactions</span>
                  </label>
                  <label className="flex items-center">
                    <input
                      type="checkbox"
                      checked={newCollaborator.permissions.can_delete}
                      onChange={(e) => setNewCollaborator({
                        ...newCollaborator,
                        permissions: {
                          ...newCollaborator.permissions,
                          can_delete: e.target.checked
                        }
                      })}
                      className="rounded text-emerald-600 focus:ring-emerald-500"
                    />
                    <span className="ml-2 text-sm text-gray-700">Can delete transactions</span>
                  </label>
                </div>
              </div>

              <button
                type="submit"
                disabled={loading}
                className="w-full px-4 py-2 bg-emerald-600 text-white rounded-lg 
                         hover:bg-emerald-700 disabled:opacity-50"
              >
                {loading ? 'Sending Invitation...' : 'Send Invitation'}
              </button>
            </form>

            <div className="space-y-4 mt-6">
              {collaborators.map(collaborator => (
                <div 
                  key={collaborator.id}
                  className="p-4 border border-gray-200 rounded-lg"
                >
                  <div className="flex justify-between items-start mb-3">
                    <div>
                      <p className="font-medium text-gray-800">{collaborator.email}</p>
                      <p className="text-sm text-gray-500">
                        Status: {collaborator.status}
                      </p>
                    </div>
                    <button
                      onClick={() => removeCollaborator(collaborator.id)}
                      className="text-red-600 hover:text-red-700 text-sm"
                    >
                      Remove
                    </button>
                  </div>

                  <div className="space-y-2">
                    <label className="flex items-center">
                      <input
                        type="checkbox"
                        checked={collaborator.permissions.can_add}
                        onChange={(e) => updatePermissions(collaborator.id, {
                          ...collaborator.permissions,
                          can_add: e.target.checked
                        })}
                        className="rounded text-emerald-600 focus:ring-emerald-500"
                      />
                      <span className="ml-2 text-sm text-gray-700">Can add transactions</span>
                    </label>
                    <label className="flex items-center">
                      <input
                        type="checkbox"
                        checked={collaborator.permissions.can_edit}
                        onChange={(e) => updatePermissions(collaborator.id, {
                          ...collaborator.permissions,
                          can_edit: e.target.checked
                        })}
                        className="rounded text-emerald-600 focus:ring-emerald-500"
                      />
                      <span className="ml-2 text-sm text-gray-700">Can edit transactions</span>
                    </label>
                    <label className="flex items-center">
                      <input
                        type="checkbox"
                        checked={collaborator.permissions.can_delete}
                        onChange={(e) => updatePermissions(collaborator.id, {
                          ...collaborator.permissions,
                          can_delete: e.target.checked
                        })}
                        className="rounded text-emerald-600 focus:ring-emerald-500"
                      />
                      <span className="ml-2 text-sm text-gray-700">Can delete transactions</span>
                    </label>
                  </div>
                </div>
              ))}
            </div>

            <div className="mt-6 flex justify-end">
              <button
                onClick={onClose}
                className="px-4 py-2 text-gray-600 hover:text-gray-800"
              >
                Close
              </button>
            </div>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
} 