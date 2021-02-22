import { CaptureModel } from '@capture-models/types';
import { InternationalString } from '@hyperion-framework/types/iiif/descriptive';
import React, { JSXElementConstructor } from 'react';
import ReactDOM from 'react-dom';
import { ApiClient } from '../../gateway/api';
import {
  CreateNormalPageRequest,
  CreateSlotRequest,
  EditorialContext,
  SiteBlock,
  SiteBlockRequest,
  SiteSlot,
} from '../../types/schemas/site-page';
import { SitePage } from '../../types/site-pages-recursive';
import { BaseExtension } from '../extension-manager';
import { reactBlockEmitter } from './block-editor-react';

export type PageBlockEditor = JSXElementConstructor<{
  block: SiteBlock;
  onChange: (block: SiteBlock) => void;
  onSave: (block: SiteBlock) => void;
  preview: any;
}>;

export type PageBlockDefinition<
  Data extends any,
  Type extends string,
  Return,
  RequiredContext extends keyof EditorialContext = never
> = {
  label: string;
  type: string;
  renderType: Type;
  model: CaptureModel['document'];
  defaultData: Data;
  requiredContext?: RequiredContext[];
  anyContext?: RequiredContext[];
  internal?: boolean;
  customEditor?: PageBlockEditor;
  render: (data: Data, context: EditorialContext, api: ApiClient) => Return;
};

export type ReactPageBlockDefinition<
  Data,
  RequiredContext extends keyof EditorialContext = never
> = PageBlockDefinition<Data, 'react', JSX.Element | null, RequiredContext>;
export type HTMLPageBlockDefinition<Data, RequiredContext extends keyof EditorialContext = never> = PageBlockDefinition<
  Data,
  'html',
  string,
  RequiredContext
>;

export class PageBlockExtension implements BaseExtension {
  api: ApiClient;
  definitionMap: {
    [type: string]: PageBlockDefinition<any, any, any, any>;
  };

  constructor(api: ApiClient, definitions: PageBlockDefinition<any, any, any, any>[]) {
    this.api = api;
    this.definitionMap = {};
    for (const definition of definitions) {
      this.definitionMap[definition.type] = definition;
    }

    reactBlockEmitter.on('block', block => {
      this.definitionMap[block.type] = block;
    });
  }

  createBlankBlock(type: string): SiteBlockRequest {
    const definition = this.definitionMap[type];

    if (!definition) {
      throw new Error('Invalid block');
    }

    return {
      static_data: { ...definition.defaultData },
      type: definition.type,
      name: '',
      lazy: false,
    };
  }

  getDefinition(type: string) {
    return this.definitionMap[type];
  }

  getDefinitions(context: EditorialContext = {}) {
    // Configuration blocks.
    const definitions = Object.values(this.definitionMap);

    const currentCtxKeys = Object.keys(context).filter((key: any) => {
      return !!(context as any)[key];
    });

    return definitions.filter(definition => {
      // if (definition.internal) {
      //   return false;
      // }
      if (!definition.requiredContext && !definition.anyContext) {
        return true;
      }
      if (definition.requiredContext) {
        for (const ctx of definition.requiredContext) {
          if (currentCtxKeys.indexOf(ctx) === -1) {
            return false;
          }
        }
      }
      if (definition.anyContext) {
        for (const ctx of definition.anyContext) {
          if (currentCtxKeys.indexOf(ctx) !== -1) {
            return true;
          }
        }
      }
      return true;
    });
  }

  renderBlockToReact(block: SiteBlock | SiteBlockRequest, context: EditorialContext): JSX.Element | null {
    // @todo check required context.
    const definition = this.definitionMap[block.type];
    if (!definition) {
      return null;
    }

    if (definition.renderType === 'html') {
      return React.createElement('div', {
        dangerouslySetInnerHTML: { __html: definition.render(block.static_data, context, this.api) },
      });
    }

    if (definition.renderType === 'react') {
      return definition.render(block.static_data, context, this.api) as JSX.Element;
    }

    return null;
  }

  renderBlockToHTML(block: SiteBlock, context: EditorialContext) {
    const definition = this.definitionMap[block.type];
    if (!definition) {
      return null;
    }

    if (definition.renderType === 'html') {
      return definition.render(block.static_data, context, this.api) as string;
    }

    if (definition.renderType === 'react') {
      if (this.api.getIsServer()) {
        const reactDomServer = require('react-dom/server');
        return reactDomServer.renderToString(definition.render(block.static_data, context, this.api));
      } else {
        const tempElement = document.createElement('div');
        ReactDOM.render(definition.render(block.static_data, context, this.api), tempElement);
        return tempElement.innerHTML;
      }
    }

    return null;
  }

  getAllPages() {
    return this.api.request<{ pages: SitePage[] }>(`/api/madoc/pages`);
  }

  async getPageNavigation(pagePath = '/') {
    const slug = pagePath && pagePath !== '/' ? `/${pagePath}` : '';
    return this.api.request<{ navigation: SitePage[] }>(`/api/madoc/pages/navigation${slug}`);
  }

  async getPage(pagePath: string) {
    return this.api.request<{
      page: SitePage;
      navigation: SitePage[];
      root?: {
        id: number;
        title: InternationalString;
        parent_page?: number;
        is_navigation_root: true;
        depth: number;
        path: string;
        findPath: string[];
      };
    }>(`/api/madoc/pages/root/${pagePath}`);
  }

  async getSlot(slotId: number) {
    return this.api.request<SitePage>(`/api/madoc/slots/${slotId}`);
  }

  async getBlock(blockId: number) {
    return this.api.request<SitePage>(`/api/madoc/blocks/${blockId}`);
  }

  async getPublicPage(pagePath: string) {
    // @todo.
    throw new Error('Not implemented');
  }

  async createPage(page: CreateNormalPageRequest) {
    return this.api.request<SitePage>(`/api/madoc/pages`, {
      body: page,
      method: 'POST',
    });
  }

  async createSlot(slot: CreateSlotRequest) {
    return this.api.request<SiteSlot>(`/api/madoc/slots`, {
      body: slot,
      method: 'POST',
    });
  }

  async createBlock(block: SiteBlockRequest) {
    return this.api.request<SiteBlock>(`/api/madoc/blocks`, {
      body: block,
      method: 'POST',
    });
  }

  async updatePage(pagePath: string, page: CreateNormalPageRequest) {
    return this.api.request<{ page: SitePage }>(`/api/madoc/pages/root/${pagePath}`, {
      body: page,
      method: 'PUT',
    });
  }

  async updateSlot(slotId: number, slot: CreateSlotRequest) {
    return this.api.request<SiteSlot>(`/api/madoc/slots/${slotId}`, {
      body: slot,
      method: 'PUT',
    });
  }

  async updateSlotStructure(slotId: number, blocks: number[]) {
    return this.api.request<{ blocks: number[] }>(`/api/madoc/slots/${slotId}/structure`, {
      body: { blocks },
      method: 'PUT',
    });
  }

  async updateBlock(blockId: number, block: SiteBlockRequest) {
    return this.api.request<SiteBlock>(`/api/madoc/blocks/${blockId}`, {
      body: block,
      method: 'PUT',
    });
  }

  async deleteSlot(slotId: number) {
    return this.api.request(`/api/madoc/slots/${slotId}`, {
      method: 'DELETE',
    });
  }

  async deletePage(pagePath: string) {
    return this.api.request(`/api/madoc/pages/root/${pagePath}`, {
      method: 'DELETE',
    });
  }
}
