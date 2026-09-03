export default async function roleSpecificUsers({ admin, createUser, login }) {
  const reviewer = await createUser({
    email: 'docs-reviewer@example.com',
    name: 'Documentation Reviewer',
    role: 'reviewer',
    siteRole: 'reviewer',
  });
  await createUser({
    email: 'docs-transcriber@example.com',
    name: 'Documentation Transcriber',
    role: 'researcher',
    siteRole: 'transcriber',
  });

  const reviewerSession = await login(reviewer.credentials);
  await reviewerSession.goto('/profile');
  const reviewerName = reviewerSession.page.locator('#name');
  await reviewerName.waitFor();
  if ((await reviewerName.inputValue()) !== 'Documentation Reviewer') {
    throw new Error('Reviewer profile did not load');
  }
  await reviewerSession.close();

  await admin.gotoAdmin('/global/users?search=Documentation');
  await admin.page.getByRole('heading', { name: 'Manage users' }).waitFor();
  await admin.page.getByText('Documentation Reviewer', { exact: true }).waitFor();
  await admin.page.getByText('Documentation Transcriber', { exact: true }).waitFor();
  await admin.screenshot('madoc-documentation-users', { fullPage: false });
}
