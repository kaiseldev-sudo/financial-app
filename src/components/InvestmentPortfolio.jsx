import { useState, useEffect } from 'react';
import { supabase } from '../services/supabaseClient';
import { useUser } from '../contexts/UserContext';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';
import { TrendingUp, AlertCircle, Plus, RefreshCw } from 'lucide-react';

const INVESTMENT_CATEGORIES = [
  'Stocks',
  'Cryptocurrency',
  'ETFs',
  'Mutual Funds',
  'Bonds',
  'Commodities',
  'Real Estate',
  'Forex',
  'Indices',
  'Other'
];

export default function InvestmentPortfolio() {
  const { user } = useUser();
  const [investments, setInvestments] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [newInvestment, setNewInvestment] = useState({
    symbol: '',
    shares: '',
    purchase_price: '',
    category: ''
  });

  useEffect(() => {
    fetchInvestments();
  }, [user]);

  async function fetchInvestments() {
    try {
      setLoading(true);
      const { data, error } = await supabase
        .from('investments')
        .select('*')
        .eq('user_id', user.id);

      if (error) throw error;

      // Simulate real-time market data (replace with actual API)
      const enrichedData = data.map(investment => ({
        ...investment,
        current_price: (investment.purchase_price * (1 + Math.random() * 0.2 - 0.1)).toFixed(2),
        performance: (Math.random() * 20 - 10).toFixed(2)
      }));

      setInvestments(enrichedData);
    } catch (error) {
      console.error('Error fetching investments:', error);
      setError('Failed to load investment data');
    } finally {
      setLoading(false);
    }
  }

  async function addInvestment(e) {
    e.preventDefault();
    try {
      setLoading(true);
      setError('');

      const { error } = await supabase
        .from('investments')
        .insert([
          {
            user_id: user.id,
            symbol: newInvestment.symbol.toUpperCase(),
            shares: parseFloat(newInvestment.shares),
            purchase_price: parseFloat(newInvestment.purchase_price),
            category: newInvestment.category,
            purchase_date: new Date()
          }
        ]);

      if (error) throw error;

      setNewInvestment({ symbol: '', shares: '', purchase_price: '', category: '' });
      fetchInvestments();
    } catch (error) {
      console.error('Error adding investment:', error);
      setError('Failed to add investment');
    } finally {
      setLoading(false);
    }
  }

  const totalValue = investments.reduce(
    (sum, inv) => sum + (parseFloat(inv.current_price) * inv.shares),
    0
  );

  const totalGain = investments.reduce(
    (sum, inv) => sum + ((parseFloat(inv.current_price) - inv.purchase_price) * inv.shares),
    0
  );

  return (
    <div className="bg-white rounded-xl shadow-sm p-6">
      <div className="flex justify-between items-center mb-6">
        <h2 className="text-lg font-semibold text-gray-800 flex items-center gap-2">
          <TrendingUp className="h-6 w-6 text-emerald-600" />
          Investment Portfolio
        </h2>
        <button
          onClick={fetchInvestments}
          className="text-emerald-600 hover:text-emerald-700"
          title="Refresh data"
        >
          <RefreshCw className="h-5 w-5" />
        </button>
      </div>

      {error && (
        <div className="bg-red-50 text-red-500 p-3 rounded-lg mb-4 flex items-center gap-2">
          <AlertCircle className="h-5 w-5" />
          {error}
        </div>
      )}

      <div className="grid md:grid-cols-2 gap-6">
        {/* Portfolio Overview */}
        <div>
          <div className="grid grid-cols-2 gap-4 mb-6">
            <div className="p-4 bg-gray-50 rounded-lg">
              <p className="text-sm text-gray-500">Total Value</p>
              <p className="text-xl font-semibold text-gray-800">
                ${totalValue.toFixed(2)}
              </p>
            </div>
            <div className="p-4 bg-gray-50 rounded-lg">
              <p className="text-sm text-gray-500">Total Gain/Loss</p>
              <p className={`text-xl font-semibold ${
                totalGain >= 0 ? 'text-emerald-600' : 'text-red-500'
              }`}>
                {totalGain >= 0 ? '+' : ''}{totalGain.toFixed(2)}
              </p>
            </div>
          </div>

          <div className="space-y-4">
            {investments.map(investment => (
              <div 
                key={investment.id} 
                className="p-4 border border-gray-200 rounded-lg"
              >
                <div className="flex justify-between items-center mb-2">
                  <div>
                    <span className="font-medium">{investment.symbol}</span>
                    <span className="ml-2 text-xs text-gray-500 bg-gray-100 px-2 py-1 rounded">
                      {investment.category}
                    </span>
                  </div>
                  <span className={`text-sm ${
                    investment.performance > 0 ? 'text-emerald-500' : 'text-red-500'
                  }`}>
                    {investment.performance > 0 ? '+' : ''}{investment.performance}%
                  </span>
                </div>
                <div className="grid grid-cols-2 gap-4 text-sm text-gray-500">
                  <div>
                    <p>Shares: {investment.shares}</p>
                    <p>Avg Price: ${investment.purchase_price}</p>
                  </div>
                  <div>
                    <p>Current: ${investment.current_price}</p>
                    <p>Value: ${(investment.shares * investment.current_price).toFixed(2)}</p>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Add New Investment */}
        <div>
          <h3 className="text-md font-medium text-gray-700 mb-3">Add New Investment</h3>
          <form onSubmit={addInvestment} className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700">Category</label>
              <select
                value={newInvestment.category}
                onChange={(e) => setNewInvestment({ ...newInvestment, category: e.target.value })}
                className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-lg
                         focus:ring-emerald-500 focus:border-emerald-500"
                required
              >
                <option value="">Select a category</option>
                {INVESTMENT_CATEGORIES.map(category => (
                  <option key={category} value={category}>{category}</option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700">Symbol</label>
              <input
                type="text"
                value={newInvestment.symbol}
                onChange={(e) => setNewInvestment({ ...newInvestment, symbol: e.target.value })}
                className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-lg
                         focus:ring-emerald-500 focus:border-emerald-500"
                required
                placeholder="e.g., AAPL"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700">Shares</label>
              <input
                type="number"
                min="0.0001"
                step="0.0001"
                value={newInvestment.shares}
                onChange={(e) => setNewInvestment({ ...newInvestment, shares: e.target.value })}
                className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-lg
                         focus:ring-emerald-500 focus:border-emerald-500"
                required
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700">Purchase Price</label>
              <input
                type="number"
                min="0.01"
                step="0.01"
                value={newInvestment.purchase_price}
                onChange={(e) => setNewInvestment({ ...newInvestment, purchase_price: e.target.value })}
                className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-lg
                         focus:ring-emerald-500 focus:border-emerald-500"
                required
              />
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
              {loading ? 'Adding...' : 'Add Investment'}
            </button>
          </form>
        </div>
      </div>
    </div>
  );
} 