import { Accordion, AccordionContainer, AccordionItem } from '../../src/frontend/shared/navigation/Accordion';
import * as React from 'react';
import { InterfaceIcon } from '../../src/frontend/shared/icons/InterfaceIcon';
import { EditShorthandCaptureModel } from '../../src/frontend/shared/capture-models/EditorShorthandCaptureModel';
import {
  ProjectConfigContributions,
  ProjectConfigInterface,
  ProjectConfigOther,
  ProjectConfigReview,
  ProjectConfigSearch,
} from '../../src/frontend/shared/configuration/site-config';
import { SearchIcon } from '../../src/frontend/shared/icons/SearchIcon';
import { ContributionIcon } from '../../src/frontend/shared/icons/ContributionIcon';
import { ReviewIcon } from '../../src/frontend/shared/icons/ReviewIcon';
import { SettingsIcon } from '../../src/frontend/shared/icons/SettingsIcon';

export default { title: 'admin / Project Config NEW', panel: 'right' };
export const defaultStory = () => {
  return (
    <div style={{ flex: 1, marginBottom: '2em' }}>
      <AccordionContainer>
        <AccordionItem
          large
          label="Interface"
          description="With description"
          icon={<InterfaceIcon />}
          maxHeight={false}
        >
          <div style={{ height: '1800px' }}>
            <EditShorthandCaptureModel key={9} data={ProjectConfigInterface} template={ProjectConfigInterface} />
          </div>
        </AccordionItem>

        <AccordionItem
          large
          label="Search & browse"
          description="With description"
          icon={<SearchIcon />}
          maxHeight={false}
        >
          <div style={{ height: '520px' }}>
            <EditShorthandCaptureModel key={1} data={ProjectConfigSearch} template={ProjectConfigSearch} />
          </div>
        </AccordionItem>

        <AccordionItem
          large
          label="Contributions"
          description="With description"
          icon={<ContributionIcon />}
          maxHeight={false}
        >
          <div style={{ height: '2000px' }}>
            <EditShorthandCaptureModel
              key={2}
              data={ProjectConfigContributions}
              template={ProjectConfigContributions}
            />
          </div>
        </AccordionItem>

        <AccordionItem
          large
          label="Review process"
          description="With description"
          icon={<ReviewIcon />}
          maxHeight={false}
        >
          <div style={{ height: '720px' }}>
            <EditShorthandCaptureModel key={3} data={ProjectConfigReview} template={ProjectConfigReview} />
          </div>
        </AccordionItem>

        <AccordionItem large label="Other" description="With description" icon={<SettingsIcon />} maxHeight={false}>
          <div style={{ height: '650px' }}>
            <EditShorthandCaptureModel key={4} data={ProjectConfigOther} template={ProjectConfigOther} />
          </div>
        </AccordionItem>
      </AccordionContainer>
    </div>
  );
};
