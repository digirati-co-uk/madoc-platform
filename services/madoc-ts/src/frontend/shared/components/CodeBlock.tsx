import React from 'react';
import SyntaxHighlighter from 'react-syntax-highlighter';
import { githubGist } from 'react-syntax-highlighter/dist/esm/styles/hljs';

const CodeBlock: React.FC = ({ children }) => {
  return (
    <SyntaxHighlighter
      language="javascript"
      style={githubGist}
      customStyle={{ borderRadius: '5px', backgroundColor: '#F4F5F7' }}
    >
      {children}
    </SyntaxHighlighter>
  );
};

export default CodeBlock;
