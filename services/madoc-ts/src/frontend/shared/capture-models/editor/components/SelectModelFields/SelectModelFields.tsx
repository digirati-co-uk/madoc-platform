import produce, { Draft } from 'immer';
import React, { useState } from 'react';
import { CaptureModel } from '../../../types/capture-model';
import { Tree } from '../Tree/Tree';
import { useTranslation } from 'react-i18next';

type Props = {
  document: CaptureModel['document'];
  selected: string[][];
  onSave: (newFields: string[]) => void;
};

export const SelectModelFields: React.FC<Props> = ({ document, selected = [], onSave }) => {
  const { t } = useTranslation();

  const processDoc = (doc: CaptureModel['document'], keyAcc: string[]): any[] => {
    const idx = selected.map(s => s.join('--HASH--'));
    return Object.keys(doc.properties)
      .map(key => {
        const props = doc.properties[key];
        if (props.length === 0) return null;
        const prop = props[0];
        if (!prop) return null;
        if (prop.type === 'entity') {
          return {
            id: 0,
            hasCaret: true,
            icon: 'layers',
            label: prop.label,
            nodeData: [...keyAcc, key],
            secondaryLabel: <div color="yellow">{t('entity')}</div>,
            childNodes: processDoc(prop as CaptureModel['document'], [...keyAcc, key]),
          };
        }
        return {
          id: key,
          icon: 'cube',
          label: prop.label,
          secondaryLabel: <div color="blue">{prop.type}</div>,
          disabled: idx.indexOf([...keyAcc, key].join('--HASH--')) !== -1,
          nodeData: [...keyAcc, key],
        };
      })
      .filter(Boolean) as any[];
  };

  const [nodes, setNodes] = useState<any[]>(() => processDoc(document, []));

  const mutatePoint = ([i, ...path]: number[], mutation: (node: Draft<any>) => void) => {
    setNodes(
      produce(nodesDraft => {
        mutation(
          path.reduce((acc: any, next: number) => {
            if (!acc.childNodes) return acc;
            return acc.childNodes[next];
          }, nodesDraft[i])
        );
      })(nodes)
    );
  };

  const onNodeClick = (node: any, tree: any) => {
    if (node) {
      if (tree.childNodes) {
        for (const childNode of tree.childNodes) {
          onNodeClick(childNode.nodeData as string[], childNode);
        }
      } else {
        // @todo change this to accept ALL fields in the model.
        onSave(node as string[]);
      }
    }
  };

  const handleNodeExpand = (_: any, path: number[]) => {
    mutatePoint(path, node => {
      node.isExpanded = true;
    });
  };

  const handleNodeCollapse = (_: any, path: number[]) => {
    mutatePoint(path, node => {
      node.isExpanded = false;
    });
  };

  return (
    <Tree tree={{ id: 'root', label: t('Document root'), nodeData: null, childNodes: nodes }} onClick={onNodeClick} />
  );
};
