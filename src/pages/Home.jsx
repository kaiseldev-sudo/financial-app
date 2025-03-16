import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { useInView } from 'react-intersection-observer';

export default function Home() {
  const [featureRef, featureInView] = useInView({
    triggerOnce: true,
    threshold: 0.1
  });

  const [ctaRef, ctaInView] = useInView({
    triggerOnce: true,
    threshold: 0.1
  });

  return (
    <div className="space-y-20 overflow-hidden">
      {/* Hero Section */}
      <section className="text-center py-16 px-4 sm:py-24">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8 }}
        >
          <h1 className="text-4xl sm:text-5xl md:text-6xl font-bold text-emerald-800 mb-6">
            Smart Finance Management
            <span className="block text-emerald-600 mt-2">Made Simple</span>
          </h1>
          <p className="text-gray-600 max-w-2xl mx-auto text-base sm:text-lg mb-8 px-4">
            Take control of your financial future with our comprehensive tracking and management tools.
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center items-center">
            <Link 
              to="/register"
              className="w-full sm:w-auto inline-block px-8 py-4 bg-emerald-600 text-white rounded-lg 
                       hover:bg-emerald-700 transition-all duration-200 
                       transform hover:scale-105 active:scale-95
                       shadow-md hover:shadow-lg text-lg font-medium
                       group"
            >
              Get Started
              <motion.span 
                className="inline-block ml-2"
                animate={{ x: [0, 4, 0] }}
                transition={{ repeat: Infinity, duration: 1.5 }}
              >
                →
              </motion.span>
            </Link>
            <button 
              className="w-full sm:w-auto inline-block px-8 py-4 bg-emerald-50 text-emerald-700 rounded-lg
                       hover:bg-emerald-100 transition-all duration-200
                       border-2 border-emerald-200 hover:border-emerald-300
                       text-lg font-medium"
              onClick={() => document.getElementById('features').scrollIntoView({ behavior: 'smooth' })}
            >
              Learn More ↓
            </button>
          </div>
        </motion.div>
      </section>

      {/* Features Section */}
      <section id="features" className="py-16 bg-emerald-50 rounded-3xl px-4" ref={featureRef}>
        <div className="container mx-auto">
          <motion.div
            initial={{ opacity: 0, y: 40 }}
            animate={featureInView ? { opacity: 1, y: 0 } : {}}
            transition={{ duration: 0.8 }}
          >
            <h2 className="text-3xl font-bold text-center text-emerald-800 mb-12">
              Why Choose FinanceTracker?
            </h2>
            <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8 max-w-5xl mx-auto">
              {features.map((feature, index) => (
                <motion.div
                  key={feature.title}
                  className="bg-white p-6 rounded-xl shadow-md hover:shadow-xl transition-all duration-300
                           transform hover:-translate-y-1 cursor-pointer"
                  initial={{ opacity: 0, y: 20 }}
                  animate={featureInView ? { opacity: 1, y: 0 } : {}}
                  transition={{ duration: 0.5, delay: index * 0.2 }}
                >
                  <div className="text-emerald-600 text-4xl mb-4">{feature.icon}</div>
                  <h3 className="text-xl font-semibold text-emerald-800 mb-2">
                    {feature.title}
                  </h3>
                  <p className="text-gray-600">
                    {feature.description}
                  </p>
                </motion.div>
              ))}
            </div>
          </motion.div>
        </div>
      </section>

      {/* Call to Action Section */}
      <section className="py-16 text-center px-4" ref={ctaRef}>
        <motion.div
          className="max-w-3xl mx-auto"
          initial={{ opacity: 0, y: 40 }}
          animate={ctaInView ? { opacity: 1, y: 0 } : {}}
          transition={{ duration: 0.8 }}
        >
          <h2 className="text-2xl sm:text-3xl font-bold text-emerald-800 mb-6">
            Ready to Take Control of Your Finances?
          </h2>
          <p className="text-gray-600 mb-8 px-4">
            Join thousands of users who are already managing their finances smarter with FinanceTracker.
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center items-center">
            <Link
              to="/dashboard"
              className="w-full sm:w-auto inline-block px-8 py-4 bg-emerald-600 text-white rounded-lg 
                        hover:bg-emerald-700 transition-all duration-200 
                        shadow-md hover:shadow-lg font-medium
                        group"
            >
              Start Now
              <span className="ml-2 group-hover:translate-x-1 transition-transform inline-block">→</span>
            </Link>
            <Link
              to="/about"
              className="w-full sm:w-auto inline-block px-8 py-4 bg-white text-emerald-600 rounded-lg 
                        border-2 border-emerald-600 hover:bg-emerald-50 
                        transition-all duration-200 font-medium"
            >
              Learn More
            </Link>
          </div>
        </motion.div>
      </section>
    </div>
  );
}

const features = [
  {
    icon: "📊",
    title: "Smart Analytics",
    description: "Visualize your spending patterns and track your financial progress with intuitive charts."
  },
  {
    icon: "🎯",
    title: "Goal Setting",
    description: "Set and achieve your financial goals with our targeted tracking system."
  },
  {
    icon: "🔒",
    title: "Secure & Private",
    description: "Your financial data is protected with enterprise-grade security measures."
  },
  {
    icon: "📱",
    title: "Mobile Ready",
    description: "Access your finances anywhere, anytime with our responsive mobile design."
  },
  {
    icon: "🔄",
    title: "Auto Sync",
    description: "Automatically sync your transactions and accounts in real-time."
  },
  {
    icon: "📈",
    title: "Investment Tracking",
    description: "Monitor your investments and portfolio performance in one place."
  }
]; 