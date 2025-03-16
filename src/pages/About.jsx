import { motion } from 'framer-motion';
import { Shield, Users, LineChart, Clock, Award, Heart } from 'lucide-react';

export default function About() {
  return (
    <div className="space-y-16 py-12">
      {/* Hero Section */}
      <section className="text-center max-w-4xl mx-auto px-4">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
        >
          <h1 className="text-4xl md:text-5xl font-bold text-gray-900 mb-6">
            Your Journey to
            <span className="text-emerald-600 block mt-2">Financial Freedom</span>
          </h1>
          <p className="text-lg text-gray-600 leading-relaxed">
            We believe everyone deserves financial clarity and peace of mind. 
            Our platform combines powerful technology with intuitive design to help you 
            make smarter financial decisions.
          </p>
        </motion.div>
      </section>

      {/* Stats Section */}
      <section className="bg-emerald-50 py-12">
        <div className="max-w-6xl mx-auto px-4">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.2 }}
            className="grid grid-cols-1 md:grid-cols-3 gap-8"
          >
            {stats.map((stat, index) => (
              <div 
                key={index}
                className="text-center p-6 bg-white rounded-xl shadow-sm"
              >
                <p className="text-3xl font-bold text-emerald-600 mb-2">{stat.value}</p>
                <p className="text-gray-600">{stat.label}</p>
              </div>
            ))}
          </motion.div>
        </div>
      </section>

      {/* Core Values Section */}
      <section className="max-w-6xl mx-auto px-4">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.4 }}
        >
          <h2 className="text-3xl font-bold text-center text-gray-900 mb-12">Our Core Values</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {values.map((value, index) => (
              <div 
                key={index}
                className="p-6 bg-white rounded-xl shadow-sm hover:shadow-md transition-shadow"
              >
                <div className="w-12 h-12 bg-emerald-100 rounded-lg flex items-center justify-center mb-4">
                  <value.icon className="h-6 w-6 text-emerald-600" />
                </div>
                <h3 className="text-xl font-semibold text-gray-900 mb-2">{value.title}</h3>
                <p className="text-gray-600 leading-relaxed">{value.description}</p>
              </div>
            ))}
          </div>
        </motion.div>
      </section>

      {/* Team Section */}
      <section className="bg-gray-50 py-16">
        <div className="max-w-6xl mx-auto px-4">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.6 }}
          >
            <h2 className="text-3xl font-bold text-center text-gray-900 mb-12">Meet Our Team</h2>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
              {team.map((member, index) => (
                <div 
                  key={index}
                  className="bg-white rounded-xl shadow-sm overflow-hidden"
                >
                  <img 
                    src={member.image} 
                    alt={member.name}
                    className="w-full h-48 object-cover"
                  />
                  <div className="p-6">
                    <h3 className="text-xl font-semibold text-gray-900 mb-1">{member.name}</h3>
                    <p className="text-emerald-600 mb-3">{member.role}</p>
                    <p className="text-gray-600">{member.bio}</p>
                  </div>
                </div>
              ))}
            </div>
          </motion.div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="text-center max-w-4xl mx-auto px-4 pb-8">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.8 }}
        >
          <h2 className="text-3xl font-bold text-gray-900 mb-6">
            Ready to Start Your Financial Journey?
          </h2>
          <p className="text-lg text-gray-600 mb-8">
            Join thousands of users who are already managing their finances smarter with FinanceTracker.
          </p>
          <button className="bg-emerald-600 text-white px-8 py-4 rounded-lg font-medium hover:bg-emerald-700 transition-colors">
            Get Started Now
          </button>
        </motion.div>
      </section>
    </div>
  );
}

const stats = [
  { value: '50,000+', label: 'Active Users' },
  { value: '$2.5M+', label: 'Tracked Monthly' },
  { value: '98%', label: 'User Satisfaction' }
];

const values = [
  {
    icon: Shield,
    title: 'Security First',
    description: 'Your financial data is protected with enterprise-grade encryption and security measures.'
  },
  {
    icon: Users,
    title: 'User-Centric',
    description: 'Every feature is designed with our users in mind, making financial management intuitive.'
  },
  {
    icon: LineChart,
    title: 'Data-Driven',
    description: 'Make informed decisions with comprehensive analytics and insights.'
  },
  {
    icon: Clock,
    title: 'Real-Time Updates',
    description: 'Stay on top of your finances with instant synchronization and updates.'
  },
  {
    icon: Award,
    title: 'Excellence',
    description: 'We strive for excellence in every aspect of our service.'
  },
  {
    icon: Heart,
    title: 'Community',
    description: 'Join a community of users committed to financial wellness.'
  }
];

const team = [
  {
    name: 'Sarah Chen',
    role: 'CEO & Founder',
    bio: 'Former fintech executive with 15 years of experience in financial services.',
    image: 'https://images.unsplash.com/photo-1494790108377-be9c29b29330?ixlib=rb-1.2.1&auto=format&fit=crop&w=500&q=60'
  },
  {
    name: 'Michael Rodriguez',
    role: 'Chief Technology Officer',
    bio: 'Tech veteran with expertise in building secure financial platforms.',
    image: 'https://images.unsplash.com/photo-1519085360753-af0119f7cbe7?ixlib=rb-1.2.1&auto=format&fit=crop&w=500&q=60'
  },
  {
    name: 'Emily Taylor',
    role: 'Head of Product',
    bio: 'Product strategist focused on creating intuitive user experiences.',
    image: 'https://images.unsplash.com/photo-1517841905240-472988babdf9?ixlib=rb-1.2.1&auto=format&fit=crop&w=500&q=60'
  }
]; 