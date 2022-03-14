import React from 'react';

type TreeProps = {
  id: string;
  label: string;
  nodeData: any;
  childNodes?: TreeProps[];
  disabled?: boolean;
};

export const Tree: React.FC<{ tree: TreeProps; onClick: (t: any, tree: TreeProps) => void }> = ({ tree, onClick }) => {
  return (
    <div style={{ fontSize: '1.2rem' }}>
      {tree.nodeData && !tree.disabled ? (
        <a style={{ cursor: 'pointer' }} onClick={() => onClick(tree.nodeData, tree)}>
          {tree.label}
        </a>
      ) : (
        <div style={{ color: tree.disabled ? '#999' : '#000' }}>{tree.label}</div>
      )}
      {tree.childNodes ? (
        <div style={{ paddingLeft: 20, borderLeft: '1px solid #ddd', marginLeft: 10, marginBottom: 10 }}>
          {tree.childNodes.map(node => (
            <Tree key={node.id} tree={node} onClick={onClick} />
          ))}
        </div>
      ) : null}
    </div>
  );
};
