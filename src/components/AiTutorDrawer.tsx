import React from 'react';
import { useApp } from '../context/AppContext';
import { AiWorkspaceModal } from './ai-workspace/AiWorkspaceModal';

export const AiTutorDrawer: React.FC = () => {
  const { isAiTutorOpen, setIsAiTutorOpen, selectedSubject } = useApp();

  return (
    <AiWorkspaceModal
      isOpen={isAiTutorOpen}
      onClose={() => setIsAiTutorOpen(false)}
      initialSubject={selectedSubject?.title || 'General'}
    />
  );
};

