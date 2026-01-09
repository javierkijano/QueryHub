import React from 'react';
import { 
  Home, 
  Search, 
  PlusSquare, 
  HelpCircle, 
  User, 
  BarChart2, 
  Hash,
  MessageSquare
} from 'lucide-react';
import { User as UserType } from '../types';

interface NavigationProps {
  currentUser: UserType;
  activePage: string;
  setActivePage: (page: string) => void;
}

const Navigation: React.FC<NavigationProps> = ({ currentUser, activePage, setActivePage }) => {
  const navItems = [
    { id: 'home', label: 'Home', icon: Home },
    { id: 'search', label: 'Discovery', icon: Search },
    { id: 'upload', label: 'Ingest Query', icon: PlusSquare },
    { id: 'requests', label: 'Requests & Q&A', icon: HelpCircle },
    { id: 'radar', label: 'Debt Radar', icon: BarChart2 },
  ];

  return (
    <div className="w-64 bg-dark-800 h-screen flex flex-col border-r border-dark-600 fixed left-0 top-0">
      <div className="p-6 flex items-center gap-3">
        <div className="w-8 h-8 bg-gradient-to-br from-primary-500 to-accent-500 rounded-lg flex items-center justify-center">
          <Hash className="text-white w-5 h-5" />
        </div>
        <span className="font-bold text-xl tracking-tight text-white">QueryHub</span>
      </div>

      <div className="flex-1 px-4 space-y-2">
        <div className="text-xs font-semibold text-gray-500 uppercase tracking-wider mb-2 px-2">Menu</div>
        {navItems.map((item) => (
          <button
            key={item.id}
            onClick={() => setActivePage(item.id)}
            className={`w-full flex items-center gap-3 px-3 py-2 rounded-md transition-all ${
              activePage === item.id 
                ? 'bg-primary-500/10 text-primary-500' 
                : 'text-gray-400 hover:bg-dark-700 hover:text-gray-200'
            }`}
          >
            <item.icon size={18} />
            <span className="font-medium">{item.label}</span>
          </button>
        ))}
      </div>

      {/* Simulated Slack Integration Preview */}
      <div className="px-4 py-4">
        <div className="bg-dark-700/50 rounded-lg p-3 border border-dark-600">
          <div className="flex items-center gap-2 mb-2 text-gray-400">
            <MessageSquare size={14} />
            <span className="text-xs font-mono">#data-queries</span>
          </div>
          <div className="space-y-2">
            <div className="flex gap-2">
              <div className="w-1 h-full bg-primary-500 rounded-full"></div>
              <p className="text-[10px] text-gray-300">
                <span className="font-bold text-white">QueryBot</span>: New Request from Sarah: "Prime funnel..."
              </p>
            </div>
          </div>
        </div>
      </div>

      <div className="p-4 border-t border-dark-600">
        <button 
          onClick={() => setActivePage('profile')}
          className={`flex items-center gap-3 w-full p-2 rounded-md hover:bg-dark-700 transition-colors ${activePage === 'profile' ? 'bg-dark-700' : ''}`}
        >
          <img src={currentUser.avatar} alt="Me" className="w-8 h-8 rounded-full border border-dark-600" />
          <div className="flex flex-col items-start">
            <span className="text-sm font-medium text-gray-200">{currentUser.name}</span>
            <span className="text-xs text-primary-500 font-mono">{currentUser.reputation} pts</span>
          </div>
        </button>
      </div>
    </div>
  );
};

export default Navigation;
