import React, { useState } from 'react';
import Navigation from './components/Navigation';
import Home from './pages/Home';
import Upload from './pages/Upload';
import QueryDetail from './pages/QueryDetail';
import AdminRadar from './pages/AdminRadar';
import Requests from './pages/Requests';
import Profile from './pages/Profile';
import { USERS } from './data';
import { Query } from './types';

function App() {
  const [activePage, setActivePage] = useState('home');
  const [selectedQuery, setSelectedQuery] = useState<Query | null>(null);

  // Mock current logged in user
  const currentUser = USERS[0];

  const handleQueryClick = (query: Query) => {
    setSelectedQuery(query);
    setActivePage('detail');
  };

  const renderContent = () => {
    switch (activePage) {
      case 'home':
        return <Home onQueryClick={handleQueryClick} />;
      case 'upload':
        return <Upload />;
      case 'detail':
        return selectedQuery ? (
          <QueryDetail 
            query={selectedQuery} 
            onBack={() => setActivePage('home')} 
          />
        ) : <Home onQueryClick={handleQueryClick} />;
      case 'radar':
        return <AdminRadar />;
      case 'requests':
        return <Requests />;
      case 'profile':
        return <Profile user={currentUser} />;
      default:
        return <Home onQueryClick={handleQueryClick} />;
    }
  };

  return (
    <div className="bg-dark-900 min-h-screen text-gray-100 flex font-sans">
      <Navigation 
        currentUser={currentUser} 
        activePage={activePage} 
        setActivePage={setActivePage} 
      />
      
      <main className="flex-1 ml-64 relative">
        {renderContent()}
      </main>
    </div>
  );
}

export default App;
