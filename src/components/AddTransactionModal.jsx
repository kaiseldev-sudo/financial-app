import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { supabase } from '../services/supabaseClient';
import { useUser } from '../contexts/UserContext';
import { format } from 'date-fns';

const CATEGORIES = {
  expense: [
    'Food & Dining',
    'Transportation',
    'Housing',
    'Utilities',
    'Healthcare',
    'Entertainment',
    'Shopping',
    'Other'
  ],
  income: [
    'Salary',
    'Freelance',
    'Investments',
    'Rental',
    'Other'
  ]
};

export default function AddTransactionModal({ 
  isOpen, 
  onClose, 
  onSuccess,
  successModalDuration = 2000 // Default 2 seconds
}) {
  const { user } = useUser();
  const [formData, setFormData] = useState({
    description: '',
    amount: '',
    type: 'expense',
    category: '',
    date: new Date().toISOString().split('T')[0]
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [showSuccessModal, setShowSuccessModal] = useState(false);
  const [successDetails, setSuccessDetails] = useState(null);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError('');

    try {
      // Validate amount
      const amount = parseFloat(formData.amount);
      if (isNaN(amount) || amount <= 0) {
        throw new Error('Please enter a valid amount greater than 0');
      }

      // Get current balance if it's an expense
      if (formData.type === 'expense') {
        const { data: transactions, error: balanceError } = await supabase
          .from('transactions')
          .select('type, amount')
          .eq('user_id', user.id);
        
        if (balanceError) throw balanceError;

        const balance = transactions.reduce((sum, t) => 
          t.type === 'income' ? sum + t.amount : sum - t.amount, 0
        );

        if (balance < amount) {
          throw new Error('Insufficient balance for this expense');
        }
      }

      const { data, error } = await supabase
        .from('transactions')
        .insert([
          {
            ...formData,
            amount: parseFloat(formData.amount),
            user_id: user.id
          }
        ]);

      if (error) throw error;

      // Set success details
      setSuccessDetails({
        type: formData.type,
        amount: parseFloat(formData.amount),
        category: formData.category,
        description: formData.description,
        date: formData.date
      });

      // Show success modal
      setShowSuccessModal(true);

      // Reset form
      setFormData({
        description: '',
        amount: '',
        type: 'expense',
        category: '',
        date: new Date().toISOString().split('T')[0]
      });

      // Call onSuccess after a delay
      setTimeout(() => {
        if (typeof onSuccess === 'function') {
          onSuccess();
        }
        setShowSuccessModal(false);
        setSuccessDetails(null);
        onClose();
      }, successModalDuration);

    } catch (err) {
      console.error('Transaction error:', err);
      setError(err.message || 'Error adding transaction. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <AnimatePresence>
      {isOpen && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50"
        >
          <motion.div
            initial={{ scale: 0.95, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            exit={{ scale: 0.95, opacity: 0 }}
            className="bg-white rounded-xl p-6 w-full max-w-md relative"
          >
            {showSuccessModal && successDetails ? (
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                className="text-center py-6"
              >
                <div className="w-16 h-16 bg-emerald-100 rounded-full flex items-center justify-center mx-auto mb-4">
                  <svg className="w-8 h-8 text-emerald-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                  </svg>
                </div>
                <h3 className="text-lg font-semibold text-gray-900 mb-2">
                  Transaction Added Successfully!
                </h3>
                <div className="space-y-2 text-gray-600">
                  <p className="text-lg font-semibold">
                    <span className={successDetails.type === 'expense' ? 'text-red-600' : 'text-emerald-600'}>
                      {successDetails.type === 'expense' ? '-' : '+'}₱{successDetails.amount.toLocaleString()}
                    </span>
                  </p>
                  <p>{successDetails.description}</p>
                  <p className="text-sm">Category: {successDetails.category}</p>
                  <p className="text-sm">Date: {format(new Date(successDetails.date), 'MMM d, yyyy')}</p>
                </div>
              </motion.div>
            ) : (
              <>
                <h2 className="text-xl font-bold text-gray-800 mb-4">Add Transaction</h2>
                
                {error && (
                  <motion.div
                    initial={{ opacity: 0, y: -10 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="bg-red-50 text-red-500 p-3 rounded-lg text-sm mb-4"
                  >
                    {error}
                  </motion.div>
                )}

                <form onSubmit={handleSubmit} className="space-y-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700">Type</label>
                    <select
                      value={formData.type}
                      onChange={(e) => setFormData(prev => ({ ...prev, type: e.target.value }))}
                      className="mt-1 block w-full rounded-lg border-gray-300 shadow-sm focus:ring-emerald-500 focus:border-emerald-500"
                    >
                      <option value="expense">Expense</option>
                      <option value="income">Income</option>
                    </select>
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700">Description</label>
                    <input
                      type="text"
                      required
                      value={formData.description}
                      onChange={(e) => setFormData(prev => ({ ...prev, description: e.target.value }))}
                      className="mt-1 block w-full rounded-lg border-gray-300 shadow-sm focus:ring-emerald-500 focus:border-emerald-500"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700">Amount</label>
                    <input
                      type="number"
                      step="0.01"
                      required
                      value={formData.amount}
                      onChange={(e) => setFormData(prev => ({ ...prev, amount: e.target.value }))}
                      className="mt-1 block w-full rounded-lg border-gray-300 shadow-sm focus:ring-emerald-500 focus:border-emerald-500"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700">Category</label>
                    <select
                      required
                      value={formData.category}
                      onChange={(e) => setFormData(prev => ({ ...prev, category: e.target.value }))}
                      className="mt-1 block w-full rounded-lg border-gray-300 shadow-sm focus:ring-emerald-500 focus:border-emerald-500"
                    >
                      <option value="">Select a category</option>
                      {CATEGORIES[formData.type].map(category => (
                        <option key={category} value={category}>{category}</option>
                      ))}
                    </select>
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700">Date</label>
                    <input
                      type="date"
                      required
                      value={formData.date}
                      onChange={(e) => setFormData(prev => ({ ...prev, date: e.target.value }))}
                      className="mt-1 block w-full rounded-lg border-gray-300 shadow-sm focus:ring-emerald-500 focus:border-emerald-500"
                    />
                  </div>

                  <div className="flex gap-3 justify-end mt-6">
                    <button
                      type="button"
                      onClick={onClose}
                      className="px-4 py-2 text-sm font-medium text-gray-700 hover:text-gray-800"
                    >
                      Cancel
                    </button>
                    <button
                      type="submit"
                      disabled={loading}
                      className={`px-4 py-2 text-sm font-medium text-white bg-emerald-600 rounded-lg
                               hover:bg-emerald-700 focus:outline-none focus:ring-2 focus:ring-offset-2
                               focus:ring-emerald-500 ${loading ? 'opacity-70 cursor-not-allowed' : ''}`}
                    >
                      {loading ? 'Adding...' : 'Add Transaction'}
                    </button>
                  </div>
                </form>
              </>
            )}
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
} 