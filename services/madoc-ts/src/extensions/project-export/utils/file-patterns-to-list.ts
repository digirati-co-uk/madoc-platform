import { parseUrn } from '../../../utility/parse-urn';
import { ExportConfig, SupportedExportResource } from '../types';

export function filePatternsToList(
  selected: ExportConfig<any>,
  options: {
    subject: SupportedExportResource;
    subjectParent?: SupportedExportResource;
    context?: SupportedExportResource;
    config?: any;
    allProjects?: number[];
  }
): Array<{ subject: SupportedExportResource; path: string }> {
  const subject = options.subject;
  const files: Array<{ subject: SupportedExportResource; path: string }> = [];

  if (selected.metadata.filePatterns) {
    for (const file of selected.metadata.filePatterns) {
      const manifest =
        subject.type === 'manifest'
          ? subject.id
          : options.subjectParent?.type === 'manifest'
          ? options.subjectParent.id
          : options.context?.type === 'manifest'
          ? options.context.id
          : null;
      const canvas = subject.type === 'canvas' ? subject.id : null;
      const project =
        options.context?.type === 'project'
          ? options.context.id
          : options.config && options.config.project_id
          ? parseUrn(options.config.project_id.uri)?.id
          : undefined;

      let fileName = file.replace(/\{manifest}/g, `${manifest}`).replace(/\{canvas}/g, `${canvas}`);

      const config = {
        ...(selected.configuration?.defaultValues || {}),
        ...(options.config || {}),
      };

      for (const key of Object.keys(config)) {
        if (key === 'project_id') {
          // keyword!
          continue;
        }
        fileName = fileName.replace(`{${key}}`, config[key]);
      }

      if (fileName.indexOf('{project_id}') !== -1) {
        if (project) {
          fileName = fileName.replace(/\{project_id}/, `${project}`);
        } else {
          if (options.allProjects && selected.configuration?.filePerProject) {
            // Apply all projects.
            for (const singleProject of options.allProjects) {
              files.push({
                subject,
                path: fileName.replace(/\{project_id}/, `${singleProject}`),
              });
            }
          } else {
            files.push({
              subject,
              path: fileName.replace(/\{project_id}/, `unknown`),
            });
          }

          continue;
        }
      }

      files.push({
        subject,
        path: fileName,
      });
    }
  }

  return files;
}
