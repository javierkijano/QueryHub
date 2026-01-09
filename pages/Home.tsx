import React from 'react';
import { Search, TrendingUp, Clock, Star, Zap } from 'lucide-react';
import { ACTIVITIES, QUERIES } from '../data';
import { Query } from '../types';

interface HomeProps {
  onQueryClick: (query: Query) => void;
}

const Home: React.FC<HomeProps> = ({ onQueryClick }) => {
  return (
    <div className="max-w-4xl mx-auto py-12 px-6">
      {/* Hero Section */}
      <div className="text-center mb-12">
        <h1 className="text-4xl font-bold mb-4 bg-clip-text text-transparent bg-gradient-to-r from-gray-100 to-gray-500">
          What do you need to know?
        </h1>
        <p className="text-gray-400 mb-8">Search 2,400+ queries, metrics, and definitions across Adreens.</p>
        
        <div className="relative max-w-2xl mx-auto group">
          <div className="absolute -inset-0.5 bg-gradient-to-r from-primary-500 to-accent-500 rounded-lg blur opacity-30 group-hover:opacity-75 transition duration-1000 group-hover:duration-200"></div>
          <div className="relative flex items-center bg-dark-800 rounded-lg p-1 border border-dark-600">
            <Search className="ml-4 text-gray-400" size={24} />
            <input 
              type="text" 
              placeholder="Search by metric, author, SQL, or hashtag..." 
              className="w-full bg-transparent border-none p-4 text-lg text-white focus:ring-0 placeholder-gray-500 outline-none"
            />
            <div className="hidden md:flex gap-2 mr-2">
              <span className="px-2 py-1 bg-dark-700 rounded text-xs text-gray-400 border border-dark-600">⌘K</span>
            </div>
          </div>
        </div>

        <div className="flex justify-center gap-4 mt-6">
          <button className="text-sm text-gray-400 hover:text-primary-400 flex items-center gap-1 transition-colors">
            <Zap size={14} /> My Recent
          </button>
          <button className="text-sm text-gray-400 hover:text-primary-400 flex items-center gap-1 transition-colors">
            <TrendingUp size={14} /> Trending
          </button>
          <button className="text-sm text-gray-400 hover:text-primary-400 flex items-center gap-1 transition-colors">
            <Star size={14} /> Favorites
          </button>
        </div>
      </div>

      {/* Recommended Section */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
        <div>
          <h2 className="text-lg font-semibold mb-4 text-gray-200 flex items-center gap-2">
            <Zap className="text-yellow-500" size={18} /> Popular Today
          </h2>
          <div className="space-y-4">
            {QUERIES.map((query) => (
              <div 
                key={query.id} 
                onClick={() => onQueryClick(query)}
                className="bg-dark-800 p-4 rounded-lg border border-dark-700 hover:border-primary-500/50 cursor-pointer transition-all group"
              >
                <div className="flex justify-between items-start mb-2">
                  <h3 className="font-medium text-primary-400 group-hover:underline decoration-primary-500/50 underline-offset-4">
                    {query.title}
                  </h3>
                  <span className="text-xs bg-dark-900 px-2 py-1 rounded text-gray-400 border border-dark-600">
                    {query.dialect}
                  </span>
                </div>
                <p className="text-sm text-gray-400 line-clamp-2 mb-3">{query.description}</p>
                <div className="flex items-center gap-3 text-xs text-gray-500">
                  <span className="flex items-center gap-1">
                    <img src={query.author.avatar} className="w-4 h-4 rounded-full" />
                    {query.author.name}
                  </span>
                  <span>•</span>
                  <span className="flex items-center gap-1">
                     Used {query.likes} times
                  </span>
                </div>
              </div>
            ))}
          </div>
        </div>

        <div>
          <h2 className="text-lg font-semibold mb-4 text-gray-200 flex items-center gap-2">
            <Clock className="text-accent-500" size={18} /> Live Activity
          </h2>
          <div className="bg-dark-800 rounded-lg border border-dark-700 p-4">
            <div className="space-y-6 relative">
              <div className="absolute top-2 left-[19px] h-[80%] w-[1px] bg-dark-600"></div>
              {ACTIVITIES.map((activity) => (
                <div key={activity.id} className="flex gap-4 relative z-10">
                  <img src={activity.user.avatar} className="w-10 h-10 rounded-full border-2 border-dark-800" />
                  <div>
                    <p className="text-sm text-gray-300">
                      <span className="font-semibold text-white">{activity.user.name}</span>
                      {' '}
                      {activity.type === 'publish' && 'published a new query'}
                      {activity.type === 'fork' && 'forked'}
                      {activity.type === 'request' && 'asked for'}
                      {' '}
                      <span className="text-primary-400 cursor-pointer hover:underline">
                        {activity.targetName}
                      </span>
                    </p>
                    <span className="text-xs text-gray-500">{activity.timestamp}</span>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Home;
