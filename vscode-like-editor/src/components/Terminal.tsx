import React, { useState } from 'react';
import '../styles/Terminal.css';
import { Folder } from './types'; // Ensure you import the Folder type

interface TerminalProps {
  defaultCommand?: string; // Add a prop for the default command
  folders: Folder[]; // Pass folders to update installed packages
  setFolders: React.Dispatch<React.SetStateAction<Folder[]>>; // Function to update folders
}

const Terminal: React.FC<TerminalProps> = ({ defaultCommand, folders, setFolders }) => {
  const [activeTab, setActiveTab] = useState<string>('TERMINAL');
  const [input, setInput] = useState<string>(defaultCommand || ''); // Set default input
  const [output, setOutput] = useState<string[]>([]);
  const [currentPath, setCurrentPath] = useState<string>(''); // Current directory path

  const tabs = ['PROBLEMS', 'OUTPUT', 'DEBUG CONSOLE', 'TERMINAL', 'PORTS'];

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setInput(e.target.value);
  };

  const handleInputSubmit = async (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Enter') {
      const command = input.trim();
      setOutput(prev => [...prev, `$ ${command}`]);
      setInput('');

      // Handle commands
      if (command.startsWith('cd ')) {
        const folderName = command.split(' ')[1];
        if (folderName) {
          const folderExists = folders.some(folder => folder.name === folderName);
          if (folderExists) {
            setCurrentPath(prev => (prev ? `${prev}/${folderName}` : folderName));
            setOutput(prev => [...prev, `Changed directory to ${folderName}`]);
          } else {
            setOutput(prev => [...prev, `Folder not found: ${folderName}`]);
          }
        }
      } else if (command.startsWith('mkdir ')) {
        const folderName = command.split(' ')[1];
        if (folderName) {
          const newFolder = { name: folderName, files: [], folders: [] };
          const updatedFolders = [...folders, newFolder];
          setFolders(updatedFolders);
          setOutput(prev => [...prev, `Created directory: ${folderName}`]);
        } else {
          setOutput(prev => [...prev, `Usage: mkdir <folder_name>`]);
        }
      } else if (command.startsWith('npm install ')) {
        const packageName = command.split(' ')[2];
        if (packageName) {
          const updatedFolders = folders.map(folder => {
            if (folder.name === currentPath.split('/').pop()) {
              return {
                ...folder,
                files: [...folder.files, { id: Date.now().toString(), name: packageName, content: '' }]
              };
            }
            return folder;
          });
          setFolders(updatedFolders);
          setOutput(prev => [...prev, `Installed package ${packageName}`]);
        } else {
          setOutput(prev => [...prev, `Usage: npm install <package_name>`]);
        }
      } else if (command.startsWith('npx create-react-app ')) {
        const parts = command.split(' ');
        if (parts.length === 4) { // Ensure the command has the correct number of parts
          const appName = parts[3]; // Get the app name
          // Simulate creating a React app
          const newFolder = { 
            name: appName, 
            files: [
              { id: Date.now().toString(), name: 'index.js', content: '// Entry point for React app' },
              { id: Date.now().toString(), name: 'App.js', content: '// Main App component' },
              { id: Date.now().toString(), name: 'index.html', content: '<!DOCTYPE html>' },
              { id: Date.now().toString(), name: 'styles.css', content: '/* Styles for the app */' },
              { id: Date.now().toString(), name: 'package.json', content: JSON.stringify({ name: appName, version: "1.0.0", dependencies: {} }, null, 2) },
            ], 
            folders: [] 
          };

          // Simulate node_modules folder
          const nodeModulesFolder = { name: 'node_modules', files: [], folders: [] };

          const updatedFolders = folders.map(folder => {
            if (folder.name === currentPath.split('/').pop()) {
              return {
                ...folder,
                folders: [...folder.folders, newFolder, nodeModulesFolder] // Add both the app folder and node_modules
              };
            }
            return folder;
          });

          setFolders(updatedFolders); // Update the folders state
          setOutput(prev => [...prev, `Created React app: ${appName}`]);
        } else {
          setOutput(prev => [...prev, `Usage: npx create-react-app <app_name>`]);
        }
      } else if (command.startsWith('java ')) {
        const javaFileName = command.split(' ')[1];
        if (javaFileName) {
          // Simulate running a Java file
          const fileExists = folders.some(folder => 
            folder.files.some(file => file.name === javaFileName && file.name.endsWith('.java'))
          );
          if (fileExists) {
            setOutput(prev => [...prev, `Running ${javaFileName}...`]);
            // Simulate output of the Java program
            setOutput(prev => [...prev, `Output of ${javaFileName}: Hello World!`]);
          } else {
            setOutput(prev => [...prev, `File not found: ${javaFileName}`]);
          }
        } else {
          setOutput(prev => [...prev, `Usage: java <file_name>`]);
        }
      } else {
        setOutput(prev => [...prev, `Command not recognized: ${command}`]);
      }
    }
  };

  return (
    <div className="terminal-container">
      <div className="terminal-tabs">
        {tabs.map((tab) => (
          <div
            key={tab}
            className={`terminal-tab ${activeTab === tab ? 'active' : ''}`}
            onClick={() => setActiveTab(tab)}
          >
            {tab}
          </div>
        ))}
      </div>
      <div className="terminal-content">
        {activeTab === 'TERMINAL' && (
          <div className="terminal-output">
            {output.map((line, index) => (
              <div key={index} className="terminal-line">{line}</div>
            ))}
            <input
              type="text"
              value={input}
              onChange={handleInputChange}
              onKeyPress={handleInputSubmit}
              placeholder={`Current directory: ${currentPath} >`}
            />
          </div>
        )}
        {activeTab !== 'TERMINAL' && (
          <div className="terminal-placeholder">
            {activeTab} content goes here
          </div>
        )}
      </div>
    </div>
  );
};

export default Terminal;