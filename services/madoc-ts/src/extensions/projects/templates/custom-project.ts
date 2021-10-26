import { ProjectTemplate } from '../types';

export const customProject: ProjectTemplate = {
  type: 'custom',
  metadata: {
    label: 'Custom project',
    description: `
      Take control with all advanced options of projects to build your own Capture model.
    `,
    thumbnail: `<svg width="109" height="109" xmlns="http://www.w3.org/2000/svg">
        <g fill="none" fill-rule="evenodd">
        <rect stroke="#E7E9EC" stroke-width="2" x="1" y="1" width="107" height="107" rx="5"/>
          <g fill-rule="nonzero">
            <path fill-opacity=".5" fill="#9DAEF0" d="m73.5 47.1 3.3-7.3 7.2-3.3-7.2-3.2-3.3-7.3-3.3 7.3-7.3 3.2 7.3 3.3z"/>
            <path fill="#5B78E5" d="m53.7 48.4-6.6-14.5-6.6 14.5L26 55l14.5 6.6 6.6 14.5 6.6-14.5L68.2 55z"/>
            <path fill-opacity=".6" fill="#5B78E5" d="m73.5 62.9-3.3 7.3-7.3 3.3 7.3 3.3 3.3 7.2 3.3-7.2 7.2-3.3-7.2-3.3z"/>
          </g>
        </g>
      </svg>
    `,
  },
};
