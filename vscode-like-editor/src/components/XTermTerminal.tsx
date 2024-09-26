import React, { useEffect, useRef } from 'react';
import { Terminal } from 'xterm';
import 'xterm/css/xterm.css';

const XTermTerminal: React.FC<{
  onUpdateSidebar: () => void;
}> = ({ onUpdateSidebar }) => {
  const terminalRef = useRef<HTMLDivElement>(null);
  const xterm = useRef<Terminal | null>(null);
  const currentInput = useRef<string>('');
  const currentDirectory = useRef<string>('');

  useEffect(() => {
    if (terminalRef.current) {
      xterm.current = new Terminal();
      xterm.current.open(terminalRef.current);
      xterm.current.write('Welcome to the terminal!\r\n$ ');

      xterm.current.onData((data) => {
        if (data.charCodeAt(0) === 13) { // Enter key
          executeCommand(currentInput.current.trim());
          currentInput.current = '';
        } else if (data.charCodeAt(0) === 127) { // Backspace
          if (currentInput.current.length > 0) {
            currentInput.current = currentInput.current.slice(0, -1);
            xterm.current?.write('\b \b');
          }
        } else {
          currentInput.current += data;
          xterm.current?.write(data);
        }
      });
    }

    return () => {
      xterm.current?.dispose();
    };
  }, []);

  const executeCommand = async (command: string) => {
    xterm.current?.writeln('');
    if (!command) {
      xterm.current?.write('$ ');
      return;
    }

    try {
      const response = await fetch('http://localhost:5000/execute', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ 
          command,
          currentDirectory: currentDirectory.current 
        }),
      });
      const data = await response.json();
      
      if (data.error) {
        xterm.current?.writeln(`Error: ${data.error}`);
      } else {
        xterm.current?.writeln(data.output);
        if (data.newDirectory) {
          currentDirectory.current = data.newDirectory;
        }
        onUpdateSidebar(); // Call this after every successful command
      }
    } catch (error: unknown) {
      if (error instanceof Error) {
        xterm.current?.writeln(`Error: ${error.message}`);
      } else {
        xterm.current?.writeln(`An unknown error occurred`);
      }
    }

    xterm.current?.write('$ ');
  };

  return <div ref={terminalRef} style={{ height: '300px', width: '100%' }} />;
};

export default XTermTerminal;