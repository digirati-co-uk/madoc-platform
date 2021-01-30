import { useStaticData } from '../../shared/hooks/use-data';
import { UserHomepage } from '../pages/user-homepage';

export function useUserHomepage() {
  return useStaticData(UserHomepage, {}, { retry: false });
}
