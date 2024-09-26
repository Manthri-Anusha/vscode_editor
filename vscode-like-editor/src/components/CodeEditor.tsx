import React, { useState } from 'react';

interface CodeEditorProps {
  fileName: string;
  initialContent?: string;
  onSave: (content: string) => void;
}

const CodeEditor: React.FC<CodeEditorProps> = ({ fileName, initialContent = '', onSave }) => {
  const [content, setContent] = useState<string>(initialContent);

  const handleSave = () => {
    onSave(content);
  };

  return (
    <div className="code-editor">
      <div className="code-editor-header">
        <span>{fileName}</span>
        <button onClick={handleSave}>Save</button>
      </div>
      <textarea
        value={content}
        onChange={(e) => setContent(e.target.value)}
        className="code-editor-textarea"
      />
    </div>
  );
};

export default CodeEditor;