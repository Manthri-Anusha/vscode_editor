import React, { useEffect, useRef } from 'react';
import { Terminal } from 'xterm';
import 'xterm/css/xterm.css';
import axios from 'axios';

const XTermTerminal: React.FC = () => {
  const terminalRef = useRef<HTMLDivElement>(null);
  const xterm = useRef<Terminal | null>(null);
  const commandBuffer = useRef<string>(''); // Buffer to store the command

  useEffect(() => {
    if (terminalRef.current) {
      xterm.current = new Terminal();
      xterm.current.open(terminalRef.current);
      xterm.current.write('Welcome to the terminal!\r\n');

      xterm.current.onData((data) => {
        // Handle input data
        if (data === '\u0003') { // Ctrl+C
          xterm.current?.write('\r\n');
          commandBuffer.current = ''; // Clear command buffer
          return;
        }

        if (data === '\r') { // Enter key
          xterm.current?.write('\r\n'); // Move to the next line
          const command = commandBuffer.current.trim();
          if (command) {
            xterm.current?.write(`$ ${command}\r\n`); // Echo the command
            // Send command to the backend
            axios.post('http://localhost:5000/execute', { command })
              .then(response => {
                xterm.current?.write(response.data.output + '\r\n');
              })
              .catch(error => {
                xterm.current?.write(`Error: ${error.response?.data?.error || 'Unknown error'}\r\n`);
              });
          }
          commandBuffer.current = ''; // Clear command buffer
          xterm.current?.write('> '); // Prompt for the next command
        } else if (data === '\u007F') { // Handle backspace
          commandBuffer.current = commandBuffer.current.slice(0, -1);
          xterm.current?.write('\b \b'); // Remove last character from terminal
        } else {
          commandBuffer.current += data; // Append data to command buffer
          xterm.current?.write(data); // Echo the character
        }
      });
    }
  }, []);

  return <div ref={terminalRef} style={{ height: '400px', width: '100%' }} />;
};

export default XTermTerminal;