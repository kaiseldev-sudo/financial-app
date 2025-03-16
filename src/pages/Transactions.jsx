import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { useUser } from '../contexts/UserContext';
import { supabase } from '../services/supabaseClient';
import TransactionsTable from '../components/TransactionsTable';
import AddTransactionModal from '../components/AddTransactionModal';
import LoadingSpinner from '../components/LoadingSpinner';
import { format, startOfMonth, endOfMonth, subMonths } from 'date-fns';
import { ArrowUpDown, Plus, Search } from 'lucide-react';

export default function Transactions() {
  const { user } = useUser();
  const [transactions, setTransactions] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [filter, setFilter] = useState('all');
  const [searchTerm, setSearchTerm] = useState('');
  const [sortOrder, setSortOrder] = useState('desc');
  const [dateFilter, setDateFilter] = useState('all');
  const [customDateRange, setCustomDateRange] = useState({
    start: format(startOfMonth(new Date()), 'yyyy-MM-dd'),
    end: format(endOfMonth(new Date()), 'yyyy-MM-dd')
  });

  useEffect(() => {
    if (user) {
      fetchTransactions();
    }
  }, [user, dateFilter, sortOrder]);

  async function fetchTransactions() {
    try {
      setLoading(true);
      setError('');

      let query = supabase
        .from('transactions')
        .select('*')
        .eq('user_id', user.id);

      // Apply date filtering
      if (dateFilter !== 'all') {
        let startDate, endDate;
        
        switch (dateFilter) {
          case 'this_month':
            startDate = startOfMonth(new Date());
            endDate = endOfMonth(new Date());
            break;
          case 'last_month':
            startDate = startOfMonth(subMonths(new Date(), 1));
            endDate = endOfMonth(subMonths(new Date(), 1));
            break;
          case 'custom':
            startDate = new Date(customDateRange.start);
            endDate = new Date(customDateRange.end);
            break;
        }

        if (startDate && endDate) {
          query = query
            .gte('date', format(startDate, 'yyyy-MM-dd'))
            .lte('date', format(endDate, 'yyyy-MM-dd'));
        }
      }

      // Apply sorting
      query = query
        .order('date', { ascending: sortOrder === 'asc' })
        .order('created_at', { ascending: sortOrder === 'asc' });

      const { data, error } = await query;

      if (error) throw error;
      setTransactions(data || []);
    } catch (err) {
      console.error('Error fetching transactions:', err);
      setError('Failed to load transactions');
    } finally {
      setLoading(false);
    }
  }

  const filteredTransactions = transactions
    .filter(t => filter === 'all' || t.type === filter)
    .filter(t => 
      t.description.toLowerCase().includes(searchTerm.toLowerCase()) ||
      t.category.toLowerCase().includes(searchTerm.toLowerCase())
    );

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <LoadingSpinner />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h1 className="text-2xl font-bold text-gray-800 flex items-center gap-2">
          <ArrowUpDown className="h-7 w-7 text-emerald-600" />
          Transactions
        </h1>
        <button 
          onClick={() => setIsModalOpen(true)}
          className="bg-emerald-600 text-white px-4 py-2 rounded-lg hover:bg-emerald-700 
                   transition-colors flex items-center gap-2"
        >
          <Plus className="h-5 w-5" />
          <span>Add Transaction</span>
        </button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <input
          type="text"
          placeholder="Search transactions..."
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          className="w-full px-4 py-2 rounded-lg border border-gray-300 focus:ring-2 
                   focus:ring-emerald-500 focus:border-emerald-500"
        />
        
        <select
          value={filter}
          onChange={(e) => setFilter(e.target.value)}
          className="px-4 py-2 rounded-lg border border-gray-300 focus:ring-2 
                   focus:ring-emerald-500 focus:border-emerald-500"
        >
          <option value="all">All Types</option>
          <option value="income">Income</option>
          <option value="expense">Expenses</option>
        </select>

        <select
          value={dateFilter}
          onChange={(e) => setDateFilter(e.target.value)}
          className="px-4 py-2 rounded-lg border border-gray-300 focus:ring-2 
                   focus:ring-emerald-500 focus:border-emerald-500"
        >
          <option value="all">All Time</option>
          <option value="this_month">This Month</option>
          <option value="last_month">Last Month</option>
          <option value="custom">Custom Range</option>
        </select>

        <button
          onClick={() => setSortOrder(prev => prev === 'desc' ? 'asc' : 'desc')}
          className="px-4 py-2 rounded-lg border border-gray-300 hover:bg-gray-50
                   flex items-center justify-center gap-2"
        >
          <span>Sort by Date</span>
          {sortOrder === 'desc' ? '↓' : '↑'}
        </button>
      </div>

      {dateFilter === 'custom' && (
        <div className="flex gap-4">
          <div className="flex-1">
            <label className="block text-sm text-gray-600 mb-1">Start Date</label>
            <input
              type="date"
              value={customDateRange.start}
              onChange={(e) => setCustomDateRange(prev => ({ ...prev, start: e.target.value }))}
              className="w-full px-4 py-2 rounded-lg border border-gray-300 focus:ring-2 
                       focus:ring-emerald-500 focus:border-emerald-500"
            />
          </div>
          <div className="flex-1">
            <label className="block text-sm text-gray-600 mb-1">End Date</label>
            <input
              type="date"
              value={customDateRange.end}
              onChange={(e) => setCustomDateRange(prev => ({ ...prev, end: e.target.value }))}
              className="w-full px-4 py-2 rounded-lg border border-gray-300 focus:ring-2 
                       focus:ring-emerald-500 focus:border-emerald-500"
            />
          </div>
          <button
            onClick={fetchTransactions}
            className="self-end px-4 py-2 bg-emerald-600 text-white rounded-lg 
                     hover:bg-emerald-700 transition-colors"
          >
            Apply
          </button>
        </div>
      )}

      <TransactionsTable 
        transactions={filteredTransactions} 
        loading={loading}
        sortOrder={sortOrder}
      />

      <AddTransactionModal 
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        onSuccess={() => {
          fetchTransactions();
          setIsModalOpen(false);
        }}
      />
    </div>
  );
} 