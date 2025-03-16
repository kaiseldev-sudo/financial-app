import { useState, useEffect } from 'react';
import { supabase } from '../services/supabaseClient';
import { useUser } from '../contexts/UserContext';
import { PieChart, Pie, Cell, ResponsiveContainer, Tooltip } from 'recharts';
import { AlertCircle, Plus, Wallet, TrendingUp } from 'lucide-react';

const COLORS = ['#059669', '#10B981', '#34D399', '#6EE7B7'];

export default function BudgetManager() {
  const { user } = useUser();
  const [budgets, setBudgets] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [newBudget, setNewBudget] = useState({
    category: '',
    amount: '',
    period: 'monthly'
  });

  useEffect(() => {
    fetchBudgets();
  }, [user]);

  async function fetchBudgets() {
    try {
      setLoading(true);
      const { data, error } = await supabase
        .from('budgets')
        .select(`
          *,
          transactions:transactions(
            amount,
            type,
            category,
            created_at
          )
        `)
        .eq('user_id', user.id);

      if (error) throw error;

      // Calculate spending for each budget
      const processedBudgets = data.map(budget => {
        const transactions = budget.transactions || [];
        const totalSpent = transactions.reduce((sum, t) => 
          t.type === 'expense' ? sum + t.amount : sum, 0
        );
        
        return {
          ...budget,
          spent: totalSpent,
          remaining: budget.amount - totalSpent,
          percentage: Math.round((totalSpent / budget.amount) * 100)
        };
      });

      setBudgets(processedBudgets);
    } catch (error) {
      console.error('Error fetching budgets:', error);
      setError('Failed to load budgets');
    } finally {
      setLoading(false);
    }
  }

  async function addBudget(e) {
    e.preventDefault();
    try {
      setLoading(true);
      setError('');

      const { error } = await supabase
        .from('budgets')
        .insert([
          {
            user_id: user.id,
            category: newBudget.category,
            amount: parseFloat(newBudget.amount),
            period: newBudget.period
          }
        ]);

      if (error) throw error;

      setNewBudget({ category: '', amount: '', period: 'monthly' });
      fetchBudgets();
    } catch (error) {
      console.error('Error adding budget:', error);
      setError('Failed to add budget');
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="bg-white rounded-xl shadow-sm p-6">
      <h2 className="text-lg font-semibold text-gray-800 mb-4 flex items-center gap-2">
        <Wallet className="h-6 w-6 text-emerald-600" />
        Budget Management
      </h2>

      {error && (
        <div className="bg-red-50 text-red-500 p-3 rounded-lg mb-4 flex items-center gap-2">
          <AlertCircle className="h-5 w-5" />
          {error}
        </div>
      )}

      <div className="grid md:grid-cols-2 gap-6">
        {/* Budget Overview */}
        <div>
          <h3 className="text-md font-medium text-gray-700 mb-3">Budget Overview</h3>
          <div className="space-y-4">
            {budgets.map(budget => (
              <div 
                key={budget.id} 
                className="p-4 border border-gray-200 rounded-lg"
              >
                <div className="flex justify-between items-center mb-2">
                  <span className="font-medium">{budget.category}</span>
                  <span className={`text-sm ${
                    budget.percentage > 90 ? 'text-red-500' : 
                    budget.percentage > 70 ? 'text-yellow-500' : 
                    'text-emerald-500'
                  }`}>
                    {budget.percentage}%
                  </span>
                </div>
                <div className="w-full bg-gray-200 rounded-full h-2.5">
                  <div 
                    className={`h-2.5 rounded-full ${
                      budget.percentage > 90 ? 'bg-red-500' : 
                      budget.percentage > 70 ? 'bg-yellow-500' : 
                      'bg-emerald-500'
                    }`}
                    style={{ width: `${Math.min(budget.percentage, 100)}%` }}
                  />
                </div>
                <div className="flex justify-between text-sm text-gray-500 mt-2">
                  <span>Spent: ${budget.spent.toFixed(2)}</span>
                  <span>Budget: ${budget.amount.toFixed(2)}</span>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Add New Budget */}
        <div>
          <h3 className="text-md font-medium text-gray-700 mb-3">Add New Budget</h3>
          <form onSubmit={addBudget} className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700">Category</label>
              <select
                value={newBudget.category}
                onChange={(e) => setNewBudget({ ...newBudget, category: e.target.value })}
                className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-lg
                         focus:ring-emerald-500 focus:border-emerald-500"
                required
              >
                <option value="">Select a category</option>
                <option value="Food & Dining">Food & Dining</option>
                <option value="Transportation">Transportation</option>
                <option value="Housing">Housing</option>
                <option value="Utilities">Utilities</option>
                <option value="Entertainment">Entertainment</option>
                <option value="Shopping">Shopping</option>
                <option value="Healthcare">Healthcare</option>
                <option value="Other">Other</option>
              </select>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700">Amount</label>
              <input
                type="number"
                min="0"
                step="0.01"
                value={newBudget.amount}
                onChange={(e) => setNewBudget({ ...newBudget, amount: e.target.value })}
                className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-lg
                         focus:ring-emerald-500 focus:border-emerald-500"
                required
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700">Period</label>
              <select
                value={newBudget.period}
                onChange={(e) => setNewBudget({ ...newBudget, period: e.target.value })}
                className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-lg
                         focus:ring-emerald-500 focus:border-emerald-500"
              >
                <option value="monthly">Monthly</option>
                <option value="weekly">Weekly</option>
                <option value="yearly">Yearly</option>
              </select>
            </div>

            <button
              type="submit"
              disabled={loading}
              className="w-full flex items-center justify-center gap-2 px-4 py-2 
                       bg-emerald-600 text-white rounded-lg hover:bg-emerald-700
                       focus:outline-none focus:ring-2 focus:ring-offset-2 
                       focus:ring-emerald-500"
            >
              <Plus className="h-5 w-5" />
              {loading ? 'Adding...' : 'Add Budget'}
            </button>
          </form>
        </div>
      </div>
    </div>
  );
} 