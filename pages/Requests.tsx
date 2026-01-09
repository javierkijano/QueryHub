import React, { useState } from 'react';
import { REQUESTS, USERS } from '../data';
import { MessageCircle, Plus, Search, X, AlertCircle, Coins, Clock } from 'lucide-react';
import { Request } from '../types';

const Requests: React.FC = () => {
  // Local state to manage list of requests so we can add to it
  const [requestsList, setRequestsList] = useState<Request[]>(REQUESTS);
  
  // Modal state
  const [isModalOpen, setIsModalOpen] = useState(false);
  
  // Form state
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [urgency, setUrgency] = useState<'Low' | 'Medium' | 'High'>('Medium');
  const [bounty, setBounty] = useState(50);

  const handleOpenModal = () => setIsModalOpen(true);
  const handleCloseModal = () => setIsModalOpen(false);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!title.trim() || !description.trim()) return;

    const newRequest: Request = {
      id: `r-${Date.now()}`,
      title: title,
      description: description,
      requester: USERS[0], // Mocking the current user (Alex)
      urgency: urgency,
      status: 'Open',
      bounty: bounty,
      createdAt: 'Just now',
      responses: 0,
    };

    setRequestsList([newRequest, ...requestsList]);
    
    // Reset form
    setTitle('');
    setDescription('');
    setUrgency('Medium');
    setBounty(50);
    setIsModalOpen(false);
  };

  return (
    <div className="max-w-6xl mx-auto py-8 px-6">
      <header className="flex justify-between items-end mb-8">
        <div>
           <h1 className="text-3xl font-bold text-white mb-2">Requests & Q&A</h1>
           <p className="text-gray-400">Don't write SQL from scratch. Ask the hive mind.</p>
        </div>
        <button 
          onClick={handleOpenModal}
          className="bg-primary-600 hover:bg-primary-500 text-white px-4 py-2 rounded-md font-medium flex items-center gap-2 transition-colors shadow-lg shadow-primary-900/20"
        >
          <Plus size={18} /> Request a Query
        </button>
      </header>

      {/* Filter Bar */}
      <div className="flex gap-4 mb-6 overflow-x-auto pb-2 scrollbar-hide">
        <div className="relative flex-1 min-w-[200px]">
          <Search className="absolute left-3 top-2.5 text-gray-500" size={16} />
          <input 
            type="text" 
            placeholder="Filter requests..." 
            className="w-full bg-dark-800 border border-dark-600 rounded-full pl-9 pr-4 py-2 text-sm text-white focus:border-primary-500 outline-none"
          />
        </div>
        {['All', 'My Department', 'High Urgency', 'High Bounty'].map((filter) => (
          <button key={filter} className="whitespace-nowrap px-4 py-2 rounded-full bg-dark-800 border border-dark-600 text-sm text-gray-300 hover:bg-dark-700 hover:text-white transition-colors">
            {filter}
          </button>
        ))}
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {/* New Request Card */}
        <div 
          onClick={handleOpenModal}
          className="border-2 border-dashed border-dark-600 rounded-xl p-6 flex flex-col items-center justify-center text-center cursor-pointer hover:border-primary-500/50 hover:bg-dark-800/50 transition-all group min-h-[200px]"
        >
           <div className="w-12 h-12 bg-dark-700 rounded-full flex items-center justify-center mb-4 group-hover:bg-primary-500/20 group-hover:text-primary-400 transition-colors">
             <Plus size={24} className="text-gray-400 group-hover:text-primary-400" />
           </div>
           <h3 className="font-bold text-gray-200 group-hover:text-white transition-colors">New Request</h3>
           <p className="text-sm text-gray-500 mt-2">Can't find it? Offer points for help.</p>
        </div>

        {requestsList.map((req) => (
          <div key={req.id} className="bg-dark-800 rounded-xl border border-dark-600 p-5 flex flex-col hover:border-primary-500/30 transition-colors relative overflow-hidden group">
            {req.urgency === 'High' && (
              <div className="absolute top-0 right-0 w-16 h-16 pointer-events-none">
                 <div className="absolute transform rotate-45 bg-red-500 text-white text-[10px] font-bold py-1 right-[-35px] top-[12px] w-[120px] text-center shadow-lg">
                   URGENT
                 </div>
              </div>
            )}
            
            <div className="flex justify-between items-start mb-3">
              <span className={`px-2 py-0.5 rounded text-xs font-bold border ${
                req.status === 'Open' ? 'bg-green-500/10 text-green-400 border-green-500/20' : 'bg-blue-500/10 text-blue-400 border-blue-500/20'
              }`}>
                {req.status}
              </span>
              <span className="flex items-center gap-1 text-xs font-bold text-yellow-400 bg-yellow-400/10 px-2 py-1 rounded-full border border-yellow-400/20">
                 <Coins size={10} /> {req.bounty} pts
              </span>
            </div>
            
            <h3 className="font-bold text-lg text-white mb-2 leading-tight group-hover:text-primary-400 transition-colors">{req.title}</h3>
            <p className="text-sm text-gray-400 line-clamp-3 mb-4 flex-1">{req.description}</p>
            
            <div className="flex items-center justify-between pt-4 border-t border-dark-700 mt-auto">
               <div className="flex items-center gap-2">
                 <img src={req.requester.avatar} className="w-6 h-6 rounded-full ring-2 ring-dark-800" />
                 <span className="text-xs text-gray-300">{req.requester.name}</span>
               </div>
               <div className="flex items-center gap-4 text-xs text-gray-500">
                 <span className="flex items-center gap-1"><Clock size={12} /> {req.createdAt}</span>
                 <span className="flex items-center gap-1 hover:text-white cursor-pointer transition-colors">
                   <MessageCircle size={14} /> {req.responses}
                 </span>
               </div>
            </div>
            
            <button className="mt-4 w-full py-2 bg-dark-700 hover:bg-dark-600 text-gray-200 text-sm font-medium rounded transition-colors group-hover:bg-primary-600 group-hover:text-white">
              Submit Solution
            </button>
          </div>
        ))}
      </div>

      {/* CREATE REQUEST MODAL */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          <div className="absolute inset-0 bg-black/60 backdrop-blur-sm" onClick={handleCloseModal}></div>
          <div className="bg-dark-800 border border-dark-600 rounded-xl w-full max-w-lg shadow-2xl relative z-10 animate-in fade-in zoom-in-95 duration-200 flex flex-col max-h-[90vh]">
             
             {/* Header */}
             <div className="flex justify-between items-center p-6 border-b border-dark-700">
               <h2 className="text-xl font-bold text-white flex items-center gap-2">
                 <AlertCircle className="text-primary-500" />
                 Request a Query
               </h2>
               <button onClick={handleCloseModal} className="text-gray-400 hover:text-white rounded-full p-1 hover:bg-dark-700 transition-colors">
                 <X size={20}/>
               </button>
             </div>
             
             {/* Form */}
             <form onSubmit={handleSubmit} className="p-6 space-y-5 overflow-y-auto">
               <div>
                 <label className="block text-sm font-medium text-gray-300 mb-1.5">What are you looking for?</label>
                 <input 
                   type="text" 
                   autoFocus
                   value={title}
                   onChange={(e) => setTitle(e.target.value)}
                   placeholder="e.g. Monthly Active Users by Platform" 
                   className="w-full bg-dark-900 border border-dark-600 rounded-lg px-4 py-2.5 text-white focus:border-primary-500 focus:ring-1 focus:ring-primary-500 outline-none transition-all placeholder:text-gray-600"
                   required
                 />
               </div>

               <div>
                 <label className="block text-sm font-medium text-gray-300 mb-1.5">Context & Requirements</label>
                 <textarea 
                   value={description}
                   onChange={(e) => setDescription(e.target.value)}
                   placeholder="Describe what you need. E.g. 'Need to filter out internal users and exclude demo accounts...'" 
                   className="w-full bg-dark-900 border border-dark-600 rounded-lg px-4 py-3 text-white h-32 resize-none focus:border-primary-500 focus:ring-1 focus:ring-primary-500 outline-none transition-all placeholder:text-gray-600 leading-relaxed"
                   required
                 />
               </div>

               <div className="grid grid-cols-2 gap-4">
                 <div>
                   <label className="block text-sm font-medium text-gray-300 mb-1.5">Urgency</label>
                   <select 
                     value={urgency}
                     onChange={(e) => setUrgency(e.target.value as any)}
                     className="w-full bg-dark-900 border border-dark-600 rounded-lg px-4 py-2.5 text-white focus:border-primary-500 outline-none appearance-none cursor-pointer"
                   >
                     <option value="Low">Low (Whenever)</option>
                     <option value="Medium">Medium (This week)</option>
                     <option value="High">High (ASAP)</option>
                   </select>
                 </div>
                 
                 <div>
                   <label className="block text-sm font-medium text-gray-300 mb-1.5">Bounty (Points)</label>
                   <div className="relative">
                     <Coins size={16} className="absolute left-3 top-3 text-yellow-500" />
                     <input 
                       type="number" 
                       min="10" 
                       max="1000" 
                       step="10"
                       value={bounty}
                       onChange={(e) => setBounty(parseInt(e.target.value))}
                       className="w-full bg-dark-900 border border-dark-600 rounded-lg pl-10 pr-4 py-2.5 text-white focus:border-primary-500 outline-none transition-all"
                     />
                   </div>
                 </div>
               </div>

               <div className="bg-primary-500/10 border border-primary-500/20 rounded-lg p-3 text-xs text-primary-300 flex gap-2">
                 <AlertCircle size={14} className="shrink-0 mt-0.5" />
                 <p>Requests with higher bounties usually get solved within 4 hours. You have 1,250 points available.</p>
               </div>
             </form>
             
             {/* Footer */}
             <div className="p-6 border-t border-dark-700 flex justify-end gap-3 bg-dark-800 rounded-b-xl">
               <button 
                 type="button" 
                 onClick={handleCloseModal}
                 className="px-4 py-2 text-gray-300 hover:text-white font-medium transition-colors"
               >
                 Cancel
               </button>
               <button 
                 onClick={handleSubmit}
                 className="px-6 py-2 bg-primary-600 hover:bg-primary-500 text-white rounded-lg font-medium shadow-lg shadow-primary-900/20 transition-all transform active:scale-95"
               >
                 Post Request
               </button>
             </div>

          </div>
        </div>
      )}
    </div>
  );
};

export default Requests;