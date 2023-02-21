import { CompletionItem } from '../../frontend/shared/capture-models/editor/input-types/AutocompleteField/AutocompleteField';
import { RouteMiddleware } from '../../types/route-middleware';
import { ProjectList } from '../../types/schemas/project-list';

function projectsToAutocomplete(resp: ProjectList): { completions: CompletionItem[] } {
  const completions: CompletionItem[] = [];

  for (const project of resp.projects) {
    completions.push({
      label: project.label,
      uri: `urn:madoc:project:${project.id}`,
    });
  }

  return { completions };
}

export const listProjectsAutocomplete: RouteMiddleware<{ slug: string }> = async context => {
  if (context.response.status === 200) {
    context.response.body = projectsToAutocomplete(context.response.body);
  }
};
