import React, { useState } from 'react';
import Header from './components/Header';
import Sidebar from './components/Sidebar';
import Courses from "./components/Courses";
import Terminal from './components/Terminal'; // Your existing terminal component
import XTermTerminal from './components/XTermTerminal'; // Import the XTermTerminal component
import { File, Folder } from './components/types'; // Import types
import './App.css';

const App: React.FC = () => {
  const [selectedCourse, setSelectedCourse] = useState<string | null>(null);
  const [folders, setFolders] = useState<Folder[]>([]);
  const [currentFile, setCurrentFile] = useState<File | null>(null);
  const [isTerminalVisible, setIsTerminalVisible] = useState<boolean>(false); // State to control terminal visibility
  const [useXTerm, setUseXTerm] = useState<boolean>(true); // State to choose which terminal to use
  const [isMinimized, setIsMinimized] = useState<boolean>(false); // State to control minimize
  const [isMaximized, setIsMaximized] = useState<boolean>(false); // State to control maximize

  const handleSelectCourse = (courseName: string) => {
    setSelectedCourse(courseName);
    if (!folders.find(folder => folder.name === courseName)) {
      setFolders([...folders, { name: courseName, files: [], folders: [] }]);
    }
  };

  const toggleTerminal = () => {
    setIsTerminalVisible(prev => !prev);
  };

  const handleCreateFolder = (parentFolderName: string, folderName: string) => {
    const updateFolders = (folders: Folder[]): Folder[] => {
      return folders.map(folder => {
        if (folder.name === parentFolderName) {
          return { ...folder, folders: [...folder.folders, { name: folderName, files: [], folders: [] }] };
        }
        return { ...folder, folders: updateFolders(folder.folders) };
      });
    };

    setFolders(updateFolders(folders));
  };

  const handleCreateFile = (parentFolderName: string, fileName: string) => {
    const newFile = { id: Date.now().toString(), name: fileName, content: '' };

    const updateFolders = (folders: Folder[]): Folder[] => {
      return folders.map(folder => {
        if (folder.name === parentFolderName) {
          return { ...folder, files: [...folder.files, newFile] };
        }
        return { ...folder, folders: updateFolders(folder.folders) };
      });
    };

    setFolders(updateFolders(folders));
  };

  const handleOpenFile = (file: File) => {
    setCurrentFile(file);
  };

  const handleUpdateFileContent = (fileId: string, newContent: string) => {
    const updatedFiles = folders.flatMap(folder => folder.files).map(file => {
      if (file.id === fileId) {
        return { ...file, content: newContent };
      }
      return file;
    });

    setFolders(prevFolders => {
      return prevFolders.map(folder => ({
        ...folder,
        files: updatedFiles.filter(file => !folder.files.some(f => f.id === file.id)),
      }));
    });
  };

  const handleMinimize = () => {
    setIsMinimized(true);
    setIsMaximized(false);
  };

  const handleMaximize = () => {
    setIsMaximized(!isMaximized);
    setIsMinimized(false);
  };

  const handleClose = () => {
    setIsMinimized(false);
    setIsMaximized(false);
    setSelectedCourse(null); // Optionally reset the selected course
  };

  return (
    <div className="app">
      <Header 
        onNewFile={() => {}} 
        onSaveFile={() => {}} 
        onCloseWindow={handleClose} 
        onMinimize={handleMinimize} 
        onMaximize={handleMaximize} 
        onToggleTerminal={toggleTerminal} // Pass the toggle function
      />
      <div className={`main ${isMinimized ? 'minimized' : ''} ${isMaximized ? 'maximized' : ''}`}>
        <Sidebar 
          folders={folders} 
          onCreateFolder={handleCreateFolder}
          onCreateFile={handleCreateFile}
          onOpenFile={handleOpenFile} // Pass the open file handler
        />
        <div className="content">
          {!selectedCourse ? (
            <Courses onSelectCourse={handleSelectCourse} />
          ) : (
            <div className="editor-layout">
              {currentFile && (
                <div className="editor">
                  <textarea
                    value={currentFile.content}
                    onChange={(e) => handleUpdateFileContent(currentFile.id, e.target.value)}
                  />
                </div>
              )}
            </div>
          )}
        </div>
      </div>
      <div className="footer">
        {isTerminalVisible && (useXTerm ? <XTermTerminal /> : <Terminal defaultCommand={selectedCourse || ''} folders={folders} setFolders={setFolders} />)}
      </div>
    </div>
  );
};

export default App;