export default async function projectOverview({ admin, createProject }) {
  const project = await createProject({
    label: 'Documentation example',
    summary: 'A project created for Madoc documentation.',
    slug: `documentation-example-${Date.now()}`,
  });

  await admin.gotoAdmin(`/projects/${project.id}`);
  await admin.screenshot('project-overview');
}
