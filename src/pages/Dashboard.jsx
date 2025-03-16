import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { format } from 'date-fns';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';
import { useUser } from '../contexts/UserContext';
import { supabase } from '../services/supabaseClient';
import LoadingSpinner from '../components/LoadingSpinner';
import AddTransactionModal from '../components/AddTransactionModal';
import { Link } from 'react-router-dom';
import { 
  LayoutDashboard, 
  Plus,
  TrendingUp,
  TrendingDown,
  DollarSign 
} from 'lucide-react';

export default function Dashboard() {
  const { user } = useUser();
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [recentTransactionsPage, setRecentTransactionsPage] = useState(1);
  const TRANSACTIONS_PER_PAGE = 5;
  const [stats, setStats] = useState({
    totalBalance: 0,
    monthlyIncome: 0,
    monthlyExpenses: 0,
    savingsRate: 0
  });
  const [recentTransactions, setRecentTransactions] = useState([]);
  const [spendingTrends, setSpendingTrends] = useState([]);
  const [filter, setFilter] = useState('all');
  const [hoveredTransaction, setHoveredTransaction] = useState(null);

  useEffect(() => {
    if (user) {
      fetchDashboardData();
    }
  }, [user]);

  async function fetchDashboardData() {
    try {
      setLoading(true);
      setError('');

      // Get all transactions for stats calculation
      const { data: allTransactions, error: statsError } = await supabase
        .from('transactions')
        .select('*')
        .eq('user_id', user.id);

      if (statsError) throw statsError;

      // Get recent transactions with proper ordering and pagination
      const { data: recentTransactions, error: recentError } = await supabase
        .from('transactions')
        .select('*')
        .eq('user_id', user.id)
        .order('date', { ascending: false })
        .order('created_at', { ascending: false })
        .limit(TRANSACTIONS_PER_PAGE * recentTransactionsPage);

      if (recentError) throw recentError;

      // Group transactions by date
      const groupedTransactions = recentTransactions?.reduce((groups, transaction) => {
        const date = format(new Date(transaction.date), 'MMM d, yyyy');
        if (!groups[date]) {
          groups[date] = [];
        }
        groups[date].push(transaction);
        return groups;
      }, {}) || {};

      setRecentTransactions(groupedTransactions);
      
      // Calculate real stats from all transactions
      const stats = calculateStats(allTransactions || []);
      setStats(stats);

      // Calculate spending trends from real data
      const spendingTrendsData = calculateSpendingTrends(allTransactions || []);
      setSpendingTrends(spendingTrendsData);

    } catch (err) {
      console.error('Error fetching dashboard data:', err);
      setError('Failed to load dashboard data');
    } finally {
      setLoading(false);
    }
  }

  function calculateStats(transactions) {
    const now = new Date();
    const firstDayOfMonth = new Date(now.getFullYear(), now.getMonth(), 1);
    const firstDayOfLastMonth = new Date(now.getFullYear(), now.getMonth() - 1, 1);
    const lastDayOfLastMonth = new Date(now.getFullYear(), now.getMonth(), 0);
    
    // Current month transactions
    const monthlyTransactions = transactions.filter(t => 
      new Date(t.date) >= firstDayOfMonth
    );

    // Last month transactions
    const lastMonthTransactions = transactions.filter(t => 
      new Date(t.date) >= firstDayOfLastMonth && 
      new Date(t.date) <= lastDayOfLastMonth
    );

    // Current month calculations
    const monthlyIncome = monthlyTransactions
      .filter(t => t.type === 'income')
      .reduce((sum, t) => sum + t.amount, 0);

    const monthlyExpenses = monthlyTransactions
      .filter(t => t.type === 'expense')
      .reduce((sum, t) => sum + t.amount, 0);

    // Last month calculations
    const lastMonthIncome = lastMonthTransactions
      .filter(t => t.type === 'income')
      .reduce((sum, t) => sum + t.amount, 0);

    const lastMonthExpenses = lastMonthTransactions
      .filter(t => t.type === 'expense')
      .reduce((sum, t) => sum + t.amount, 0);

    // Calculate trends
    const incomeTrend = lastMonthIncome > 0
      ? ((monthlyIncome - lastMonthIncome) / lastMonthIncome * 100).toFixed(1)
      : 0;

    const expenseTrend = lastMonthExpenses > 0
      ? ((monthlyExpenses - lastMonthExpenses) / lastMonthExpenses * 100).toFixed(1)
      : 0;

    const totalBalance = transactions
      .reduce((sum, t) => t.type === 'income' ? sum + t.amount : sum - t.amount, 0);

    const savingsRate = monthlyIncome > 0 
      ? ((monthlyIncome - monthlyExpenses) / monthlyIncome * 100).toFixed(1)
      : 0;

    const lastMonthSavingsRate = lastMonthIncome > 0
      ? ((lastMonthIncome - lastMonthExpenses) / lastMonthIncome * 100).toFixed(1)
      : 0;

    const savingsRateTrend = lastMonthSavingsRate > 0
      ? (savingsRate - lastMonthSavingsRate).toFixed(1)
      : 0;

    return {
      totalBalance,
      monthlyIncome,
      monthlyExpenses,
      savingsRate,
      incomeTrend,
      expenseTrend,
      savingsRateTrend
    };
  }

  function calculateSpendingTrends(transactions) {
    const now = new Date();
    const sixMonthsAgo = new Date(now.getFullYear(), now.getMonth() - 5, 1);

    // Create array of last 6 months
    const months = Array.from({ length: 6 }, (_, i) => {
      const date = new Date(now.getFullYear(), now.getMonth() - i, 1);
      return format(date, 'MMM');
    }).reverse();

    // Initialize data for each month
    const monthlyData = months.reduce((acc, month) => {
      acc[month] = { expenses: 0, income: 0, net: 0, expenseChange: 0, incomeChange: 0 };
      return acc;
    }, {});

    // Calculate spending and income for each transaction
    transactions.forEach(transaction => {
      const transactionDate = new Date(transaction.date);
      if (transactionDate >= sixMonthsAgo) {
        const month = format(transactionDate, 'MMM');
        if (transaction.type === 'expense') {
          monthlyData[month].expenses += transaction.amount;
        } else {
          monthlyData[month].income += transaction.amount;
        }
      }
    });

    // Calculate net income and percentage changes
    let previousExpense = null;
    let previousIncome = null;

    months.forEach(month => {
      // Calculate net income
      monthlyData[month].net = monthlyData[month].income - monthlyData[month].expenses;

      // Calculate percentage changes
      if (previousExpense !== null && previousIncome !== null) {
        monthlyData[month].expenseChange = previousExpense > 0 
          ? ((monthlyData[month].expenses - previousExpense) / previousExpense * 100).toFixed(1)
          : 0;
        monthlyData[month].incomeChange = previousIncome > 0
          ? ((monthlyData[month].income - previousIncome) / previousIncome * 100).toFixed(1)
          : 0;
      }

      previousExpense = monthlyData[month].expenses;
      previousIncome = monthlyData[month].income;
    });

    // Convert to array format for chart
    return months.map(month => ({
      month,
      expenses: monthlyData[month].expenses,
      income: monthlyData[month].income,
      net: monthlyData[month].net,
      expenseChange: monthlyData[month].expenseChange,
      incomeChange: monthlyData[month].incomeChange
    }));
  }

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <LoadingSpinner />
      </div>
    );
  }

  return (
    <div className="container mx-auto px-4 py-8">
      {/* Header */}
      <div className="flex justify-between items-center">
        <h1 className="text-2xl font-bold text-gray-800 flex items-center gap-2">
          <LayoutDashboard className="h-7 w-7 text-emerald-600" />
          Dashboard
        </h1>
        <button 
          className="bg-emerald-600 text-white px-4 py-2 rounded-lg hover:bg-emerald-700 
                     transition-colors flex items-center gap-2"
          onClick={() => setIsModalOpen(true)}
        >
          <Plus className="h-5 w-5" />
          <span>Add Transaction</span>
        </button>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <StatsCard
          title="Total Balance"
          value={`₱${stats.totalBalance.toLocaleString()}`}
          trend={`${stats.incomeTrend}%`}
          positive={parseFloat(stats.incomeTrend) >= 0}
        />
        <StatsCard
          title="Monthly Income"
          value={`₱${stats.monthlyIncome.toLocaleString()}`}
          trend={`${stats.incomeTrend}%`}
          positive={parseFloat(stats.incomeTrend) >= 0}
        />
        <StatsCard
          title="Monthly Expenses"
          value={`₱${stats.monthlyExpenses.toLocaleString()}`}
          trend={`${stats.expenseTrend}%`}
          positive={parseFloat(stats.expenseTrend) <= 0}
        />
        <StatsCard
          title="Savings Rate"
          value={`${stats.savingsRate}%`}
          trend={`${stats.savingsRateTrend}%`}
          positive={parseFloat(stats.savingsRateTrend) >= 0}
        />
      </div>

      {/* Charts and Recent Transactions */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Spending & Income Trends Chart */}
        <div className="lg:col-span-2 bg-white p-6 rounded-xl shadow-sm">
          <div className="flex justify-between items-center mb-4">
            <h2 className="text-lg font-semibold text-gray-800">Financial Trends</h2>
            <div className="flex items-center gap-4">
              <div className="flex items-center gap-2">
                <div className="w-3 h-3 rounded-full bg-emerald-500"></div>
                <span className="text-sm text-gray-600">Income</span>
              </div>
              <div className="flex items-center gap-2">
                <div className="w-3 h-3 rounded-full bg-red-500"></div>
                <span className="text-sm text-gray-600">Expenses</span>
              </div>
              <div className="flex items-center gap-2">
                <div className="w-3 h-3 rounded-full bg-blue-500"></div>
                <span className="text-sm text-gray-600">Net Savings</span>
              </div>
            </div>
          </div>
          <div className="h-[300px]">
            <ResponsiveContainer width="100%" height="100%">
              <LineChart data={spendingTrends}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="month" />
                <YAxis />
                <Tooltip 
                  formatter={(value, name) => [
                    `₱${value.toLocaleString()}`,
                    name === 'expenseChange' || name === 'incomeChange' 
                      ? `${name === 'expenseChange' ? 'Expense' : 'Income'} Change` 
                      : name.charAt(0).toUpperCase() + name.slice(1)
                  ]}
                  labelFormatter={(label) => {
                    const data = spendingTrends.find(item => item.month === label);
                    return (
                      `Month: ${label}\n` +
                      `Income Change: ${data.incomeChange}%\n` +
                      `Expense Change: ${data.expenseChange}%`
                    );
                  }}
                />
                <Line 
                  type="monotone" 
                  dataKey="income" 
                  stroke="#059669" 
                  strokeWidth={2}
                  dot={{ fill: '#059669' }}
                  name="Income"
                />
                <Line 
                  type="monotone" 
                  dataKey="expenses" 
                  stroke="#DC2626" 
                  strokeWidth={2}
                  dot={{ fill: '#DC2626' }}
                  name="Expenses"
                />
                <Line 
                  type="monotone" 
                  dataKey="net" 
                  stroke="#3B82F6" 
                  strokeWidth={2}
                  dot={{ fill: '#3B82F6' }}
                  name="Net Savings"
                  strokeDasharray="5 5"
                />
              </LineChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Recent Transactions */}
        <div className="bg-white p-6 rounded-xl shadow-sm">
          <div className="flex justify-between items-center mb-4">
            <h2 className="text-lg font-semibold text-gray-800">Recent Transactions</h2>
            <div className="flex items-center gap-3">
              <Link 
                to="/transactions" 
                className="text-sm text-emerald-600 hover:text-emerald-700 font-medium"
              >
                View All →
              </Link>
            </div>
          </div>
          
          <div className="space-y-6">
            {Object.entries(recentTransactions)
              .filter(([_, transactions]) => 
                filter === 'all' ? true : transactions.some(t => t.type === filter)
              )
              .map(([date, transactions]) => (
                <div key={date} className="space-y-2">
                  <h3 className="text-sm font-medium text-gray-500">{date}</h3>
                  {transactions
                    .filter(t => filter === 'all' || t.type === filter)
                    .map((transaction, index) => (
                      <div key={transaction.id} className="relative">
                        <motion.div
                          onMouseEnter={() => setHoveredTransaction(transaction)}
                          onMouseLeave={() => setHoveredTransaction(null)}
                          initial={{ opacity: 0, y: 20 }}
                          animate={{ opacity: 1, y: 0 }}
                          transition={{ delay: index * 0.1 }}
                          className="flex items-center justify-between p-3 bg-gray-50 rounded-lg
                                   hover:bg-gray-100 transition-colors cursor-pointer"
                        >
                          <div>
                            <p className="font-medium text-gray-800">{transaction.description}</p>
                            <p className="text-sm text-gray-500">
                              {format(new Date(transaction.created_at), 'h:mm a')} • {transaction.category}
                            </p>
                          </div>
                          <p className={`font-medium ${
                            transaction.type === 'expense' ? 'text-red-600' : 'text-emerald-600'
                          }`}>
                            {transaction.type === 'expense' ? '-' : '+'}
                            ₱{transaction.amount.toLocaleString()}
                          </p>
                        </motion.div>

                        <AnimatePresence>
                          {hoveredTransaction?.id === transaction.id && (
                            <motion.div
                              initial={{ opacity: 0, y: 5 }}
                              animate={{ opacity: 1, y: 0 }}
                              exit={{ opacity: 0, y: 5 }}
                              className="absolute z-10 w-72 bg-white rounded-lg shadow-lg p-4 border
                                       border-gray-200 mt-2 right-0"
                            >
                              <div className="space-y-2">
                                <div className="flex justify-between items-center pb-2 border-b border-gray-100">
                                  <span className="text-sm font-medium text-gray-500">Amount</span>
                                  <span className={`font-medium ${
                                    transaction.type === 'expense' ? 'text-red-600' : 'text-emerald-600'
                                  }`}>
                                    {transaction.type === 'expense' ? '-' : '+'}
                                    ₱{transaction.amount.toLocaleString()}
                                  </span>
                                </div>
                                <div className="flex justify-between">
                                  <span className="text-sm text-gray-500">Category</span>
                                  <span className="text-sm font-medium text-gray-700">{transaction.category}</span>
                                </div>
                                <div className="flex justify-between">
                                  <span className="text-sm text-gray-500">Date</span>
                                  <span className="text-sm font-medium text-gray-700">
                                    {format(new Date(transaction.date), 'MMM d, yyyy')}
                                  </span>
                                </div>
                                <div className="flex justify-between">
                                  <span className="text-sm text-gray-500">Time</span>
                                  <span className="text-sm font-medium text-gray-700">
                                    {format(new Date(transaction.created_at), 'h:mm a')}
                                  </span>
                                </div>
                                <div className="flex justify-between pt-2 border-t border-gray-100">
                                  <span className="text-sm text-gray-500">Type</span>
                                  <span className={`px-2 py-1 text-xs font-medium rounded-full ${
                                    transaction.type === 'expense'
                                      ? 'bg-red-100 text-red-800'
                                      : 'bg-emerald-100 text-emerald-800'
                                  }`}>
                                    {transaction.type.charAt(0).toUpperCase() + transaction.type.slice(1)}
                                  </span>
                                </div>
                              </div>
                            </motion.div>
                          )}
                        </AnimatePresence>
                      </div>
                    ))}
                </div>
              ))}
          </div>

          {Object.keys(recentTransactions).length >= TRANSACTIONS_PER_PAGE && (
            <button
              onClick={() => {
                setRecentTransactionsPage(prev => prev + 1);
                fetchDashboardData();
              }}
              className="w-full mt-4 text-sm text-gray-600 hover:text-gray-800 
                       py-2 border border-gray-200 rounded-lg hover:bg-gray-50"
            >
              Load More
            </button>
          )}
        </div>
      </div>

      {isModalOpen && (
        <AddTransactionModal
          isOpen={isModalOpen}
          onClose={() => setIsModalOpen(false)}
          onSuccess={fetchDashboardData}
          successModalDuration={3000}
        />
      )}
    </div>
  );
}

function StatsCard({ title, value, trend, positive }) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="bg-white p-6 rounded-xl shadow-sm"
    >
      <p className="text-sm text-gray-500">{title}</p>
      <p className="text-2xl font-bold text-gray-800 mt-2">{value}</p>
      <p className={`text-sm mt-2 ${positive ? 'text-emerald-600' : 'text-red-600'}`}>
        {trend} from last month
      </p>
    </motion.div>
  );
} 