import { UserDetails } from '../../../types/schemas/user-details';

export function isContributor({ user, sites, currentSiteId }: UserDetails) {
  if (user.role === 'global_admin') {
    return true;
  }

  const site = sites.find(s => s.id === currentSiteId);

  if (!site) {
    return false;
  }

  return (
    site.role === 'admin' ||
    site.role === 'reviewer' ||
    site.role === 'limited_reviewer' ||
    site.role === 'transcriber' ||
    site.role === 'limited_transcriber'
  );
}

export function isAdmin({ user, sites, currentSiteId }: UserDetails) {
  if (user.role === 'global_admin') {
    return true;
  }

  const site = sites.find(s => s.id === currentSiteId);

  if (!site) {
    return false;
  }

  return site.role === 'admin';
}

export function isReviewer({ user, sites, currentSiteId }: UserDetails) {
  if (user.role === 'global_admin') {
    return true;
  }

  const site = sites.find(s => s.id === currentSiteId);

  if (!site) {
    return false;
  }

  return site.role === 'admin' || site.role === 'reviewer' || site.role === 'limited_reviewer';
}
