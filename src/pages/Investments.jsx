import { useState } from 'react';
import { motion } from 'framer-motion';
import InvestmentPortfolio from '../components/InvestmentPortfolio';
import { TrendingUp } from 'lucide-react';

export default function Investments() {
  return (
    <div className="container mx-auto px-4 py-8">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-2xl font-bold text-gray-800 flex items-center gap-2">
          <TrendingUp className="h-7 w-7 text-emerald-600" />
          Investment Portfolio
        </h1>
      </div>
      
      <InvestmentPortfolio />
    </div>
  );
} 