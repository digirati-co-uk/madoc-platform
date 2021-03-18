import { InternationalString } from '@hyperion-framework/types/iiif/descriptive';
import { CrowdsourcingTask } from '../../../gateway/tasks/crowdsourcing-task';

type CrowdsourcingTaskMetadata = {
  thumbnail: string;
  manifestLabel: InternationalString;
  projectName: InternationalString;
};
