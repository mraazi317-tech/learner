import React, { useState } from 'react';
import { useMessenger } from './useMessenger';
import { MessengerSidebar } from './MessengerSidebar';
import { MessengerChat } from './MessengerChat';
import { MessengerInfo } from './MessengerInfo';
import { MessageSquare } from 'lucide-react';

export const MessengerApp: React.FC = () => {
  const { chats, connectionRequests, loading, activeChatId, setActiveChatId } = useMessenger();
  const [showInfo, setShowInfo] = useState(true);

  if (loading) {
    return (
      <div className="w-full h-[calc(100vh-140px)] bg-white rounded-3xl border border-gray-200 flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-[#2952CC]"></div>
      </div>
    );
  }

  const activeChat = chats.find(c => c.id === activeChatId);

  return (
    <div className="w-full h-[calc(100vh-140px)] bg-white rounded-3xl border border-gray-200 overflow-hidden flex shadow-sm">
      <MessengerSidebar 
        chats={chats} 
        requests={connectionRequests} 
        activeChatId={activeChatId}
        onSelectChat={setActiveChatId}
      />
      
      {activeChat ? (
        <>
          <MessengerChat chat={activeChat} />
          {showInfo && <MessengerInfo chat={activeChat} />}
        </>
      ) : (
        <div className="flex-1 bg-[#F0F2F5] flex flex-col items-center justify-center text-center p-6">
           <div className="w-24 h-24 bg-white rounded-full flex items-center justify-center shadow-sm mb-6">
             <MessageSquare className="w-10 h-10 text-gray-400" />
           </div>
           <h2 className="text-2xl font-light text-gray-600">EasiaLearn Messenger</h2>
           <p className="text-sm text-gray-500 mt-2 max-w-sm">
             Select a chat to start messaging or connect with new students and teachers using their EasiaCode.
           </p>
           <p className="text-xs text-gray-400 mt-8 flex items-center gap-1">
             End-to-end encrypted for academic privacy.
           </p>
        </div>
      )}
    </div>
  );
};
