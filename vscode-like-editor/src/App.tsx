import React, { useState, useEffect, useRef } from 'react';
import Header from './components/Header';
import Sidebar from './components/Sidebar';
import Courses from "./components/Courses";
import 'xterm/css/xterm.css';
import './App.css';
import { File, Folder } from './components/types'; // Import types
import XTermTerminal from './components/XTermTerminal'; // Import the terminal component

const App: React.FC = () => {
  const [selectedCourse, setSelectedCourse] = useState<string | null>(null);
  const [isTerminalVisible, setIsTerminalVisible] = useState<boolean>(false); // State to control terminal visibility
  const [folders, setFolders] = useState<Folder[]>([]); // State to manage folders
  const terminalRef = useRef<HTMLDivElement>(null);
  const xterm = useRef<typeof XTermTerminal | null>(null);
  const currentInput = useRef<string>(''); // Store current input

  const toggleTerminal = () => {
    setIsTerminalVisible(prev => !prev);
  };

  const handleSelectCourse = (courseName: string) => {
    setSelectedCourse(courseName);
    // Check if the course already exists to avoid duplicates
    if (!folders.some(folder => folder.name === courseName)) {
      setFolders(prevFolders => [...prevFolders, { name: courseName, files: [], folders: [] }]); // Add selected course as a folder
    }
  };
  
  const refreshFolderStructure = async () => {
    try {
      const response = await fetch('http://localhost:5000/folder-structure');
      if (response.ok) {
        const structure = await response.json();
        setFolders(structure);
      } else {
        console.error('Failed to fetch folder structure');
      }
    } catch (error) {
      console.error('Error fetching folder structure:', error);
    }
  };

  const handleCreateFolder = async (parentFolderName: string, folderName: string) => {
    try {
      const response = await fetch('http://localhost:5000/create-folder', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ parentPath: parentFolderName, folderName }),
      });
      if (response.ok) {
        await refreshFolderStructure(); // Refresh the folder structure after creating a folder
      } else {
        console.error('Failed to create folder');
      }
    } catch (error) {
      console.error('Error creating folder:', error);
    }
  };
  const handleCreateFile = async (parentFolderName: string, fileName: string) => {
    setFolders(prevFolders => {
      const newFolders = [...prevFolders];
      const parentFolder = findFolder(newFolders, parentFolderName);
      if (parentFolder && !parentFolder.files.some(file => file.name === fileName)) {
        parentFolder.files.push({ id: fileName, name: fileName, content: '' }); // Add new file to the correct parent
      }
      return newFolders;
    });
    await refreshFolderStructure();
  };

  const findFolder = (folders: Folder[], folderName: string): Folder | undefined => {
    for (const folder of folders) {
      if (folder.name === folderName) {
        return folder;
      }
      const found = findFolder(folder.folders, folderName);
      if (found) {
        return found;
      }
    }
    return undefined;
  };

  const handleCreateReactApp = (appName: string) => {
    setFolders(prevFolders => {
      const newFolders = [...prevFolders];
      newFolders.push({ name: appName, files: [], folders: [] }); // Add new React app folder
      return newFolders;
    });
  };

  return (
    <div className="app">
      <Header 
        onNewFile={() => {}} 
        onSaveFile={() => {}} 
        onCloseWindow={() => {}} 
        onMinimize={() => {}} 
        onMaximize={() => {}} 
        onToggleTerminal={toggleTerminal} // Pass the toggle function
      />
      <div className="main">
        <Sidebar 
          folders={folders} // Pass the folders state to Sidebar
          onCreateFolder={handleCreateFolder} 
          onCreateFile={handleCreateFile} 
          onOpenFile={() => {}} 
        />
        <div className="content">
          {!selectedCourse ? (
            <Courses onSelectCourse={handleSelectCourse} /> // Pass the updated handler
          ) : (
            <div className="editor-layout">
              {/* Your editor layout here */}
            </div>
          )}
        </div>
      </div>
      {isTerminalVisible && ( // Conditionally render the terminal
        <XTermTerminal 
          onUpdateSidebar={(path: string) => {
            // Update sidebar logic here
            // For example, you might want to refresh the folder structure
            // or select a specific file/folder based on the path
          }}
        />
      )}
    </div>
  );
};

export default App;