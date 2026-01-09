import React from 'react';
import { User } from '../types';
import { Award, Hexagon, Trophy } from 'lucide-react';

interface ProfileProps {
  user: User;
}

const Profile: React.FC<ProfileProps> = ({ user }) => {
  return (
    <div className="max-w-4xl mx-auto py-12 px-6">
      
      {/* Header Profile */}
      <div className="bg-dark-800 rounded-2xl p-8 border border-dark-600 relative overflow-hidden mb-8">
        <div className="absolute top-0 right-0 p-32 bg-primary-500/10 blur-[80px] rounded-full pointer-events-none"></div>
        
        <div className="flex flex-col md:flex-row items-center gap-8 relative z-10">
          <div className="relative">
            <img src={user.avatar} className="w-32 h-32 rounded-full border-4 border-dark-700 shadow-2xl" />
            <div className="absolute bottom-0 right-0 bg-accent-500 text-white p-2 rounded-full border-4 border-dark-800">
              <Trophy size={20} />
            </div>
          </div>
          
          <div className="text-center md:text-left">
            <h1 className="text-3xl font-bold text-white mb-2">{user.name}</h1>
            <p className="text-gray-400 mb-4">{user.department} Department</p>
            
            <div className="flex flex-wrap justify-center md:justify-start gap-2">
               {user.badges.map(badge => (
                 <span key={badge} className="px-3 py-1 bg-yellow-500/10 text-yellow-400 border border-yellow-500/20 rounded-full text-xs font-bold uppercase tracking-wide flex items-center gap-1">
                   <Award size={12} /> {badge}
                 </span>
               ))}
            </div>
          </div>

          <div className="ml-auto text-center bg-dark-900/50 p-6 rounded-xl border border-dark-600 backdrop-blur-sm">
             <span className="block text-4xl font-black text-white">{user.reputation}</span>
             <span className="text-sm text-primary-400 font-bold uppercase tracking-wider">Karma Points</span>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
        {/* Badges Collection */}
        <div className="bg-dark-800 rounded-xl border border-dark-600 p-6">
          <h2 className="text-lg font-bold text-white mb-6 flex items-center gap-2">
            <Hexagon className="text-accent-400" size={20} /> Badges Unlocked
          </h2>
          <div className="grid grid-cols-3 gap-4">
             <BadgeItem icon="🧙‍♂️" name="Query Wizard" earned />
             <BadgeItem icon="🚑" name="Query Doctor" earned />
             <BadgeItem icon="🤝" name="Connector" earned />
             <BadgeItem icon="🔥" name="Hot Streak" />
             <BadgeItem icon="🛡️" name="Guardian" />
             <BadgeItem icon="🚀" name="Prime Expert" />
          </div>
        </div>

        {/* Leaderboard Snapshot */}
        <div className="bg-dark-800 rounded-xl border border-dark-600 p-6">
           <h2 className="text-lg font-bold text-white mb-6 flex items-center gap-2">
            <Trophy className="text-yellow-400" size={20} /> Top Contributors (This Month)
          </h2>
          <div className="space-y-4">
             <LeaderboardRow rank={1} name="Jordan V." points={340} />
             <LeaderboardRow rank={2} name="Alex Rivera" points={210} isMe />
             <LeaderboardRow rank={3} name="Sarah Chen" points={185} />
             <LeaderboardRow rank={4} name="Marcus D." points={120} />
             <LeaderboardRow rank={5} name="Elena R." points={95} />
          </div>
        </div>
      </div>

    </div>
  );
};

const BadgeItem = ({ icon, name, earned }: any) => (
  <div className={`flex flex-col items-center text-center p-3 rounded-lg border ${earned ? 'bg-dark-700/50 border-primary-500/30' : 'bg-dark-900 border-dark-700 opacity-50 grayscale'}`}>
    <div className="text-2xl mb-2">{icon}</div>
    <span className={`text-xs font-bold ${earned ? 'text-white' : 'text-gray-600'}`}>{name}</span>
  </div>
);

const LeaderboardRow = ({ rank, name, points, isMe }: any) => (
  <div className={`flex items-center justify-between p-3 rounded ${isMe ? 'bg-primary-500/10 border border-primary-500/30' : 'bg-dark-700/30'}`}>
    <div className="flex items-center gap-3">
       <span className={`w-6 h-6 flex items-center justify-center rounded-full text-xs font-bold ${rank <= 3 ? 'bg-yellow-400 text-black' : 'bg-dark-600 text-gray-400'}`}>
         {rank}
       </span>
       <span className={`text-sm font-medium ${isMe ? 'text-primary-300' : 'text-gray-300'}`}>
         {name} {isMe && '(You)'}
       </span>
    </div>
    <span className="font-mono text-sm font-bold text-white">{points} pts</span>
  </div>
);

export default Profile;
