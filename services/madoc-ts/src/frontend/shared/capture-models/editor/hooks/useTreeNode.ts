import produce, { Draft } from 'immer';
import { useState } from 'react';

type ITreeNode = any;

export const useTreeNode = (createInitial: () => ITreeNode[]) => {
  const [nodes, setNodes] = useState<ITreeNode[]>(createInitial);

  const mutateAllPoints = (mutation: (node: Draft<ITreeNode>) => void) => {
    setNodes(
      produce(nodesDraft => {
        const handleNode = (node: Draft<ITreeNode>) => {
          mutation(node);
          if (node.childNodes) {
            node.childNodes.forEach((childNode: any) => {
              handleNode(childNode);
            });
          }
        };
        handleNode(nodesDraft);
      })
    );
  };

  const mutatePoint = ([i, ...path]: number[], mutation: (node: Draft<ITreeNode>) => void) => {
    setNodes(
      produce(nodesDraft => {
        mutation(
          path.reduce((acc: ITreeNode, next: number) => {
            if (!acc.childNodes) return acc;
            return acc.childNodes[next];
          }, nodesDraft[i])
        );
      })(nodes)
    );
  };

  return { nodes, setNodes, mutatePoint, mutateAllPoints };
};
