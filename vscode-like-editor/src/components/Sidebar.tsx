import React, { useState } from 'react';
import { FaFile, FaFolder, FaFolderPlus, FaFileMedical } from 'react-icons/fa';
import { File, Folder } from './types';
import '../styles/Sidebar.css';

interface SidebarProps {
  folders: Folder[];
  onCreateFolder: (parentFolderName: string, folderName: string) => void;
  onCreateFile: (parentFolderName: string, fileName: string) => void;
  onOpenFile: (file: File) => void;
}

const Sidebar: React.FC<SidebarProps> = ({ folders, onCreateFolder, onCreateFile, onOpenFile }) => {
  const [expandedFolders, setExpandedFolders] = useState<Set<string>>(new Set());

  const toggleFolder = (folderName: string) => {
    setExpandedFolders(prev => {
      const newSet = new Set(prev);
      if (newSet.has(folderName)) {
        newSet.delete(folderName);
      } else {
        newSet.add(folderName);
      }
      return newSet;
    });
  };
  const handleCreateFolder = async (parentFolderName: string) => {
    const folderName = prompt('Enter new folder name:');
    if (folderName) {
      try {
        const response = await fetch('http://localhost:5000/create-folder', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({ parentPath: parentFolderName, folderName }),
        });
        if (response.ok) {
          onCreateFolder(parentFolderName, folderName);
        } else {
          const error = await response.json();
          console.error('Failed to create folder:', error.error);
        }
      } catch (error) {
        console.error('Error creating folder:', error);
      }
    }
  };

  const handleCreateFile = async (parentFolderName: string) => {
    const fileName = prompt('Enter new file name:');
    if (fileName) {
      try {
        const response = await fetch('http://localhost:5000/create-file', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({ parentPath: parentFolderName, fileName }),
        });
        if (response.ok) {
          onCreateFile(parentFolderName, fileName);
        } else {
          const error = await response.json();
          console.error('Failed to create file:', error.error);
        }
      } catch (error) {
        console.error('Error creating file:', error);
      }
    }
  };

  const handleFileClick = (file: File) => {
    onOpenFile(file); // Call the function to open the file in the editor
  };

  const renderFolders = (folders: Folder[], depth = 0) => {
    return folders.map((folder) => (
      <div key={folder.name} style={{ marginLeft: `${depth * 20}px` }}>
        <div className="folder-item">
          <span onClick={() => toggleFolder(folder.name)}>
            <FaFolder /> {folder.name}
          </span>
          <div className="folder-actions">
            <span onClick={() => onCreateFolder(folder.name)}><FaFolderPlus /></span>
            <span onClick={() => handleCreateFile(folder.name)}><FaFileMedical /></span>
          </div>
        </div>
        {expandedFolders.has(folder.name) && (
          <>
            <ul>
              {folder.files.map((file) => (
                <li key={file.id} className="file-item" onClick={() => handleFileClick(file)}>
                  <FaFile /> {file.name}
                </li>
              ))}
            </ul>
            {renderFolders(folder.folders, depth + 1)} {/* Render subfolders recursively */}
          </>
        )}
      </div>
    ));
  };

  return (
    <div className="sidebar">
      <div className="folders">
        {renderFolders(folders)}
      </div>
    </div>
  );
};

export default Sidebar;