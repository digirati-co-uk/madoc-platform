import { InternationalString } from '@iiif/presentation-3';
import { CrowdsourcingTask } from '../../../gateway/tasks/crowdsourcing-task';

type CrowdsourcingTaskMetadata = {
  thumbnail: string;
  manifestLabel: InternationalString;
  projectName: InternationalString;
};
