import React, { useState, useEffect, useRef } from 'react';
import '../styles/Terminal.css';
import { Folder } from './types';

interface TerminalProps {
  defaultCommand?: string;
  folders: Folder[];
  setFolders: React.Dispatch<React.SetStateAction<Folder[]>>;
}

const Terminal: React.FC<TerminalProps> = ({ defaultCommand, folders, setFolders }) => {
  const [input, setInput] = useState<string>(defaultCommand || '');
  const [output, setOutput] = useState<string[]>([]);
  const inputRef = useRef<HTMLInputElement>(null);

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setInput(e.target.value);
  };

  const handleInputSubmit = async (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Enter') {
      e.preventDefault(); // Prevent default behavior
      const command = input.trim();
      setOutput(prev => [...prev, `$ ${command}`]); // Echo the command
      setInput(''); // Clear input

      // Handle commands here
      if (command.startsWith('cd ')) {
        const folderName = command.split(' ')[1];
        if (folderName) {
          const folderExists = folders.some(folder => folder.name === folderName);
          if (folderExists) {
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
      } else {
        setOutput(prev => [...prev, `Command not recognized: ${command}`]);
      }

      // Focus the input field again
      if (inputRef.current) {
        inputRef.current.focus();
      }
    }
  };

  useEffect(() => {
    if (inputRef.current) {
      inputRef.current.focus(); // Focus the input field on mount
    }
  }, []);

  return (
    <div className="terminal-container">
      <div className="terminal-content">
        {output.map((line, index) => (
          <div key={index} className="terminal-line">{line}</div>
        ))}
        <input
          type="text"
          ref={inputRef}
          value={input}
          onChange={handleInputChange}
          onKeyPress={handleInputSubmit} // Call the function on key press
          placeholder="Current directory: >"
        />
      </div>
    </div>
  );
};

export default Terminal;