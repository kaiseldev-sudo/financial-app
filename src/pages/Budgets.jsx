import { useState } from 'react';
import { motion } from 'framer-motion';
import BudgetManager from '../components/BudgetManager';
import { Wallet } from 'lucide-react';

export default function Budgets() {
  return (
    <div className="container mx-auto px-4 py-8">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-2xl font-bold text-gray-800 flex items-center gap-2">
          <Wallet className="h-7 w-7 text-emerald-600" />
          Budget Management
        </h1>
      </div>
      
      <BudgetManager />
    </div>
  );
} 