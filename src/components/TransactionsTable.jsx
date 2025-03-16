import { motion } from 'framer-motion';
import { format } from 'date-fns';
import LoadingSpinner from './LoadingSpinner';
import * as XLSX from 'xlsx';

export default function TransactionsTable({ transactions, loading, sortOrder }) {
  const handleExport = () => {
    // Prepare data for export
    const exportData = transactions.map(transaction => ({
      'Date & Time': format(new Date(transaction.created_at), 'MMM d, yyyy h:mm a'),
      'Description': transaction.description,
      'Category': transaction.category,
      'Amount': transaction.amount,
      'Type': transaction.type.charAt(0).toUpperCase() + transaction.type.slice(1),
      'Balance Impact': `${transaction.type === 'expense' ? '-' : '+'}₱${transaction.amount.toLocaleString()}`
    }));

    // Create worksheet
    const ws = XLSX.utils.json_to_sheet(exportData);

    // Set column widths
    const colWidths = [
      { wch: 20 }, // Date & Time
      { wch: 30 }, // Description
      { wch: 15 }, // Category
      { wch: 12 }, // Amount
      { wch: 10 }, // Type
      { wch: 15 }, // Balance Impact
    ];
    ws['!cols'] = colWidths;

    // Create workbook
    const wb = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(wb, ws, 'Transactions');

    // Generate filename with current date
    const fileName = `transactions_${format(new Date(), 'yyyy-MM-dd')}.xlsx`;

    // Save file
    XLSX.writeFile(wb, fileName);
  };

  if (loading) {
    return (
      <div className="bg-white rounded-xl shadow-sm p-8 flex justify-center">
        <LoadingSpinner />
      </div>
    );
  }

  if (!transactions.length) {
    return (
      <div className="bg-white rounded-xl shadow-sm p-8 text-center text-gray-500">
        No transactions found
      </div>
    );
  }

  // Group transactions by date
  const groupedTransactions = transactions.reduce((groups, transaction) => {
    const date = format(new Date(transaction.date), 'MMM d, yyyy');
    if (!groups[date]) {
      groups[date] = [];
    }
    groups[date].push(transaction);
    return groups;
  }, {});

  return (
    <div className="space-y-4">
      {transactions.length > 0 && (
        <div className="flex justify-end">
          <button
            onClick={handleExport}
            className="px-4 py-2 text-sm font-medium text-emerald-700 bg-emerald-50 
                     rounded-lg hover:bg-emerald-100 transition-colors flex items-center gap-2"
          >
            <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" viewBox="0 0 20 20" fill="currentColor">
              <path fillRule="evenodd" d="M3 17a1 1 0 011-1h12a1 1 0 110 2H4a1 1 0 01-1-1zm3.293-7.707a1 1 0 011.414 0L9 10.586V3a1 1 0 112 0v7.586l1.293-1.293a1 1 0 111.414 1.414l-3 3a1 1 0 01-1.414 0l-3-3a1 1 0 010-1.414z" clipRule="evenodd" />
            </svg>
            Export to Excel
          </button>
        </div>
      )}

      <div className="space-y-6">
        {Object.entries(groupedTransactions).map(([date, dateTransactions]) => (
          <div key={date} className="bg-white rounded-xl shadow-sm overflow-hidden">
            <table className="min-w-full divide-y divide-gray-200">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Date & Time
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Description
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Category
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Amount
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Type
                  </th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {dateTransactions.map((transaction, index) => (
                  <motion.tr
                    key={transaction.id}
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: index * 0.05 }}
                  >
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                      {format(new Date(transaction.created_at), 'MMM d, yyyy h:mm a')}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-800">
                      {transaction.description}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                      {transaction.category}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                      <span className={transaction.type === 'expense' ? 'text-red-600' : 'text-emerald-600'}>
                        {transaction.type === 'expense' ? '-' : '+'}₱{transaction.amount.toLocaleString()}
                      </span>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm">
                      <span className={`px-2 py-1 rounded-full text-xs font-medium ${
                        transaction.type === 'expense' 
                          ? 'bg-red-100 text-red-800' 
                          : 'bg-emerald-100 text-emerald-800'
                      }`}>
                        {transaction.type}
                      </span>
                    </td>
                  </motion.tr>
                ))}
              </tbody>
            </table>
          </div>
        ))}
      </div>
    </div>
  );
} 