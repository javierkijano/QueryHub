import React from 'react';
import { 
  BarChart, 
  Bar, 
  XAxis, 
  YAxis, 
  CartesianGrid, 
  Tooltip, 
  ResponsiveContainer,
  Radar, 
  RadarChart, 
  PolarGrid, 
  PolarAngleAxis, 
  PolarRadiusAxis 
} from 'recharts';
import { AlertTriangle, HelpCircle, Layers } from 'lucide-react';

const DEBT_DATA = [
  { name: 'Marketing', debt: 65, coverage: 80 },
  { name: 'Engineering', debt: 30, coverage: 95 },
  { name: 'Sales', debt: 85, coverage: 40 },
  { name: 'Product', debt: 45, coverage: 70 },
  { name: 'Finance', debt: 20, coverage: 90 },
];

const REQUESTS_DATA = [
  { subject: 'Churn', A: 120, fullMark: 150 },
  { subject: 'Revenue', A: 98, fullMark: 150 },
  { subject: 'Traffic', A: 86, fullMark: 150 },
  { subject: 'Attribution', A: 40, fullMark: 150 }, // Low coverage
  { subject: 'Inventory', A: 65, fullMark: 150 },
  { subject: 'Costs', A: 85, fullMark: 150 },
];

const AdminRadar: React.FC = () => {
  return (
    <div className="max-w-6xl mx-auto py-8 px-6">
      <header className="mb-8">
        <h1 className="text-3xl font-bold text-white mb-2">Analytic Debt Radar</h1>
        <p className="text-gray-400">Where are we missing queries? Where are the bottlenecks?</p>
      </header>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mb-8">
        <StatCard 
          title="Orphaned Tables" 
          value="142" 
          desc="Tables with no documented queries" 
          icon={<Layers className="text-red-400" />}
          trend="+12% this month"
          trendColor="text-red-400"
        />
        <StatCard 
          title="Unanswered Requests" 
          value="28" 
          desc="Open questions > 7 days old" 
          icon={<HelpCircle className="text-orange-400" />}
          trend="-5% this month"
          trendColor="text-green-400"
        />
        <StatCard 
          title="Heavy Queries" 
          value="15" 
          desc="Scanning > 1TB per run" 
          icon={<AlertTriangle className="text-yellow-400" />}
          trend="Stable"
          trendColor="text-gray-400"
        />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        {/* Knowledge Coverage Radar */}
        <div className="bg-dark-800 p-6 rounded-lg border border-dark-600">
          <h2 className="text-lg font-semibold text-white mb-6">Knowledge Coverage by Domain</h2>
          <div className="h-[300px] w-full">
            <ResponsiveContainer width="100%" height="100%">
              <RadarChart cx="50%" cy="50%" outerRadius="80%" data={REQUESTS_DATA}>
                <PolarGrid stroke="#374151" />
                <PolarAngleAxis dataKey="subject" tick={{ fill: '#9CA3AF', fontSize: 12 }} />
                <PolarRadiusAxis angle={30} domain={[0, 150]} tick={false} axisLine={false} />
                <Radar
                  name="Query Coverage"
                  dataKey="A"
                  stroke="#8b5cf6"
                  strokeWidth={3}
                  fill="#8b5cf6"
                  fillOpacity={0.3}
                />
                <Tooltip 
                  contentStyle={{ backgroundColor: '#1f2937', borderColor: '#374151', color: '#fff' }} 
                  itemStyle={{ color: '#a78bfa' }}
                />
              </RadarChart>
            </ResponsiveContainer>
          </div>
          <p className="text-center text-sm text-gray-400 mt-2">
            Low coverage in <span className="text-white font-bold">Attribution</span> indicating documentation gap.
          </p>
        </div>

        {/* Debt by Department Bar Chart */}
        <div className="bg-dark-800 p-6 rounded-lg border border-dark-600">
           <h2 className="text-lg font-semibold text-white mb-6">Analytic Debt vs Coverage</h2>
           <div className="h-[300px] w-full">
             <ResponsiveContainer width="100%" height="100%">
               <BarChart
                 data={DEBT_DATA}
                 layout="vertical"
                 margin={{ top: 5, right: 30, left: 40, bottom: 5 }}
               >
                 <CartesianGrid strokeDasharray="3 3" horizontal={false} stroke="#374151" />
                 <XAxis type="number" stroke="#6B7280" />
                 <YAxis dataKey="name" type="category" stroke="#9CA3AF" width={80} />
                 <Tooltip cursor={{fill: '#1f2937'}} contentStyle={{ backgroundColor: '#111827', borderColor: '#374151', color: '#fff' }} />
                 <Bar dataKey="debt" name="Debt Score" fill="#ef4444" radius={[0, 4, 4, 0]} barSize={20} />
                 <Bar dataKey="coverage" name="Query Coverage" fill="#10b981" radius={[0, 4, 4, 0]} barSize={20} />
               </BarChart>
             </ResponsiveContainer>
           </div>
           <p className="text-center text-sm text-gray-400 mt-2">
             <span className="text-red-400">Sales</span> has high debt (many unanswered requests).
           </p>
        </div>
      </div>
    </div>
  );
};

const StatCard = ({ title, value, desc, icon, trend, trendColor }: any) => (
  <div className="bg-dark-800 p-6 rounded-lg border border-dark-600">
    <div className="flex justify-between items-start mb-4">
      <div>
        <p className="text-gray-400 text-sm font-medium uppercase tracking-wider">{title}</p>
        <h3 className="text-3xl font-bold text-white mt-1">{value}</h3>
      </div>
      <div className="bg-dark-700 p-2 rounded-lg">
        {icon}
      </div>
    </div>
    <div className="flex items-center justify-between">
      <p className="text-xs text-gray-500">{desc}</p>
      <span className={`text-xs font-bold ${trendColor}`}>{trend}</span>
    </div>
  </div>
);

export default AdminRadar;
