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
    site.role === 'limited-reviewer' ||
    site.role === 'transcriber' ||
    site.role === 'limited-transcriber'
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

export function isReviewer({ user, sites, currentSiteId }: UserDetails, excludeLimited = false) {
  if (user.role === 'global_admin') {
    return true;
  }

  const site = sites.find(s => s.id === currentSiteId);

  if (!site) {
    return false;
  }

  return site.role === 'admin' || site.role === 'reviewer' || (!excludeLimited && site.role === 'limited-reviewer');
}
