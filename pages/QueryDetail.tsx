import React, { useState } from 'react';
import { 
  Copy, 
  GitFork, 
  MessageSquare, 
  ThumbsUp, 
  Shield, 
  Database,
  Bot,
  History,
  AlertCircle,
  Loader,
  ChevronUp,
  Lightbulb,
  Heart
} from 'lucide-react';
import { Query } from '../types';

interface QueryDetailProps {
  query: Query;
  onBack: () => void;
}

const QueryDetail: React.FC<QueryDetailProps> = ({ query, onBack }) => {
  const [activeTab, setActiveTab] = useState<'sql' | 'metadata' | 'lineage'>('sql');
  const [showAIExplanation, setShowAIExplanation] = useState(false);
  const [isGeneratingExplanation, setIsGeneratingExplanation] = useState(false);

  const handleToggleExplanation = () => {
    if (!showAIExplanation) {
      setIsGeneratingExplanation(true);
      setShowAIExplanation(true);
      // Simulate API call
      setTimeout(() => {
        setIsGeneratingExplanation(false);
      }, 1500);
    } else {
      setShowAIExplanation(false);
    }
  };

  return (
    <div className="max-w-6xl mx-auto py-6 px-6 h-full flex flex-col">
      <button onClick={onBack} className="text-gray-400 hover:text-white mb-4 text-sm flex items-center gap-1">
        ← Back to Search
      </button>

      {/* Header */}
      <div className="flex justify-between items-start mb-6">
        <div>
          <h1 className="text-2xl font-bold text-white mb-2 flex items-center gap-3">
            {query.title}
            {query.metadata.hasPII && (
               <span className="px-2 py-0.5 rounded-full bg-red-500/20 text-red-400 text-xs border border-red-500/30 flex items-center gap-1">
                 <Shield size={10} /> PII
               </span>
            )}
            {query.tags.includes('prime') && (
               <span className="px-2 py-0.5 rounded-full bg-purple-500/20 text-purple-400 text-xs border border-purple-500/30 flex items-center gap-1">
                 Prime Tier
               </span>
            )}
          </h1>
          <p className="text-gray-400 max-w-2xl">{query.description}</p>
          <div className="flex items-center gap-4 mt-3">
            <div className="flex items-center gap-2">
              <img src={query.author.avatar} className="w-6 h-6 rounded-full" />
              <span className="text-sm text-gray-300">{query.author.name}</span>
            </div>
            <span className="text-gray-600 text-sm">|</span>
            <span className="text-sm text-gray-400">v{query.version}</span>
            <span className="text-gray-600 text-sm">|</span>
            <span className="text-sm text-gray-400">Updated {query.createdAt}</span>
          </div>
        </div>
        <div className="flex gap-2">
           <button className="flex flex-col items-center justify-center w-16 h-14 bg-dark-800 rounded border border-dark-600 hover:bg-dark-700 transition-colors">
             <ThumbsUp size={18} className="text-gray-400 mb-1" />
             <span className="text-xs font-bold text-gray-300">{query.likes}</span>
           </button>
           <button className="flex flex-col items-center justify-center w-16 h-14 bg-dark-800 rounded border border-dark-600 hover:bg-dark-700 transition-colors">
             <GitFork size={18} className="text-gray-400 mb-1" />
             <span className="text-xs font-bold text-gray-300">{query.forks}</span>
           </button>
        </div>
      </div>

      {/* Main Content */}
      <div className="flex-1 flex flex-col md:flex-row gap-6 min-h-0">
        
        {/* Left Panel: Tabs & Content */}
        <div className="flex-1 flex flex-col bg-dark-800 rounded-lg border border-dark-600 overflow-hidden">
          <div className="flex border-b border-dark-600">
            <TabButton 
              active={activeTab === 'sql'} 
              onClick={() => setActiveTab('sql')} 
              icon={<Database size={16} />} 
              label="SQL" 
            />
            <TabButton 
              active={activeTab === 'metadata'} 
              onClick={() => setActiveTab('metadata')} 
              icon={<AlertCircle size={16} />} 
              label="Metadata & Rules" 
            />
            <TabButton 
              active={activeTab === 'lineage'} 
              onClick={() => setActiveTab('lineage')} 
              icon={<History size={16} />} 
              label="History & Lineage" 
            />
          </div>

          <div className="flex-1 overflow-auto relative bg-dark-900 group">
             {activeTab === 'sql' && (
               <>
                 <pre className="p-6 font-mono text-sm text-blue-100 whitespace-pre-wrap leading-relaxed">
                   {query.sql}
                 </pre>
                 <div className="absolute top-4 right-4 opacity-0 group-hover:opacity-100 transition-opacity">
                    <button className="bg-dark-700 hover:bg-dark-600 text-white px-3 py-1.5 rounded text-xs flex items-center gap-2 border border-dark-500 shadow-lg">
                      <Copy size={12} /> Copy
                    </button>
                 </div>
               </>
             )}
             
             {activeTab === 'metadata' && (
               <div className="p-6 space-y-6">
                 <div>
                   <h3 className="text-sm font-bold text-gray-400 uppercase tracking-wider mb-2">Projects & Datasets</h3>
                   <div className="flex flex-wrap gap-2">
                     {query.metadata.projects.map(p => <span key={p} className="bg-dark-700 px-2 py-1 rounded text-sm font-mono text-primary-300">{p}</span>)}
                     {query.metadata.datasets.map(d => <span key={d} className="bg-dark-700 px-2 py-1 rounded text-sm font-mono text-accent-300">{d}</span>)}
                   </div>
                 </div>
                 <div className="grid grid-cols-2 gap-4">
                   <div className="bg-dark-800 border border-dark-700 p-3 rounded">
                     <span className="text-gray-500 text-xs block mb-1">Estimated Cost</span>
                     <span className="text-white font-mono">{query.metadata.costEstimate}</span>
                   </div>
                   <div className="bg-dark-800 border border-dark-700 p-3 rounded">
                     <span className="text-gray-500 text-xs block mb-1">Last Succesful Run</span>
                     <span className="text-white font-mono">{query.metadata.lastRun}</span>
                   </div>
                 </div>
               </div>
             )}

             {activeTab === 'lineage' && (
               <div className="p-6 flex flex-col items-center justify-center h-full text-gray-500">
                 <GitFork size={48} className="mb-4 opacity-20" />
                 <p>Forked from <span className="text-primary-400 cursor-pointer hover:underline">Revenue Q2 Base</span> by <span className="text-white">Marcus</span></p>
                 <div className="h-8 w-0.5 bg-dark-600 my-2"></div>
                 <div className="bg-primary-500/10 border border-primary-500/50 text-primary-300 px-4 py-2 rounded-full text-sm font-medium">
                   Current Version (v{query.version})
                 </div>
                 <div className="h-8 w-0.5 bg-dark-600 my-2"></div>
                 <p className="text-sm italic">2 derived versions exist</p>
               </div>
             )}
          </div>

          {/* AI Explanation Bar */}
          <div className="bg-dark-800 border-t border-dark-600 p-4">
            {!showAIExplanation ? (
              <button 
                onClick={handleToggleExplanation}
                className="flex items-center gap-2 text-sm text-accent-400 hover:text-accent-300 transition-colors"
              >
                <Bot size={16} /> Explain this query to me (Plain English)
              </button>
            ) : (
               <div className="animate-in fade-in slide-in-from-bottom-2 duration-300">
                 <div className="flex justify-between items-start mb-2">
                   <div className="flex items-center gap-2 text-sm text-accent-400">
                      <Bot size={16} /> 
                      <span className="font-bold">AI Explanation</span>
                   </div>
                   <button 
                     onClick={handleToggleExplanation}
                     className="text-gray-500 hover:text-white"
                   >
                     <ChevronUp size={16} />
                   </button>
                 </div>
                 
                 {isGeneratingExplanation ? (
                   <div className="flex items-center gap-2 text-sm text-gray-500 py-2">
                     <Loader className="animate-spin" size={14} /> Generating explanation...
                   </div>
                 ) : (
                   <p className="text-sm text-gray-300 leading-relaxed">
                     This query calculates the total monthly revenue for Q3 2023. It specifically filters for 'completed' transactions and excludes any internal testing accounts (is_internal = false). It groups the results by month and sorts them descending.
                   </p>
                 )}
               </div>
            )}
          </div>
        </div>

        {/* Right Panel: Context & Actions */}
        <div className="w-full md:w-80 flex flex-col gap-4">
           {/* Actions */}
           <button className="w-full bg-primary-600 hover:bg-primary-500 text-white py-2 rounded font-medium transition-colors shadow-lg shadow-primary-900/20">
             Run in BigQuery
           </button>
           
           {/* Comments */}
           <div className="bg-dark-800 rounded-lg border border-dark-600 flex-1 flex flex-col">
             <div className="p-3 border-b border-dark-600 flex justify-between items-center">
               <h3 className="font-semibold text-sm text-gray-300">Discussion</h3>
               <span className="bg-dark-700 text-xs px-2 py-0.5 rounded text-gray-400">3</span>
             </div>
             <div className="p-4 space-y-4 overflow-y-auto flex-1 max-h-[400px]">
               <div className="flex gap-3">
                 <div className="w-8 h-8 rounded-full bg-purple-500 flex items-center justify-center text-xs text-white font-bold">JD</div>
                 <div>
                   <p className="text-xs font-bold text-gray-300 mb-1">Jane Doe <span className="text-dark-500 font-normal">• 2d ago</span></p>
                   <p className="text-sm text-gray-400">Should we be filtering out `status='pending'`? The revenue numbers seem slightly high.</p>
                   {/* Reaction Buttons */}
                   <div className="flex items-center gap-3 mt-2">
                      <button className="text-gray-500 hover:text-primary-400 flex items-center gap-1 transition-colors group">
                         <ThumbsUp size={14} className="group-hover:scale-110 transition-transform"/> <span className="text-xs">2</span>
                      </button>
                      <button className="text-gray-500 hover:text-yellow-400 flex items-center gap-1 transition-colors group">
                         <Lightbulb size={14} className="group-hover:scale-110 transition-transform"/>
                      </button>
                   </div>
                 </div>
               </div>
               <div className="flex gap-3 pl-4 border-l-2 border-dark-600">
                 <img src={query.author.avatar} className="w-6 h-6 rounded-full" />
                 <div>
                   <p className="text-xs font-bold text-gray-300 mb-1">{query.author.name} <span className="text-xs bg-accent-500/20 text-accent-400 px-1 rounded ml-1">Author</span></p>
                   <p className="text-sm text-gray-400">Good catch. Pending are excluded in the upstream table, but I can add it explicitly.</p>
                   {/* Reaction Buttons */}
                   <div className="flex items-center gap-3 mt-2">
                      <button className="text-gray-500 hover:text-primary-400 flex items-center gap-1 transition-colors group">
                         <ThumbsUp size={14} className="group-hover:scale-110 transition-transform"/> <span className="text-xs">4</span>
                      </button>
                      <button className="text-gray-500 hover:text-pink-400 flex items-center gap-1 transition-colors group">
                         <Heart size={14} className="group-hover:scale-110 transition-transform"/> <span className="text-xs">1</span>
                      </button>
                   </div>
                 </div>
               </div>
             </div>
             <div className="p-3 border-t border-dark-600">
                <div className="relative">
                  <input 
                    type="text" 
                    placeholder="Add a comment..." 
                    className="w-full bg-dark-900 border border-dark-700 rounded pl-3 pr-10 py-2 text-sm text-white focus:border-primary-500 outline-none"
                  />
                  <button className="absolute right-2 top-2 text-primary-500 hover:text-primary-400">
                    <MessageSquare size={16} />
                  </button>
                </div>
             </div>
           </div>
        </div>

      </div>
    </div>
  );
};

const TabButton = ({ active, onClick, icon, label }: any) => (
  <button 
    onClick={onClick}
    className={`flex items-center gap-2 px-4 py-3 text-sm font-medium border-b-2 transition-colors ${
      active 
        ? 'border-primary-500 text-white bg-dark-700/50' 
        : 'border-transparent text-gray-400 hover:text-gray-200 hover:bg-dark-700/30'
    }`}
  >
    {icon}
    {label}
  </button>
);

export default QueryDetail;