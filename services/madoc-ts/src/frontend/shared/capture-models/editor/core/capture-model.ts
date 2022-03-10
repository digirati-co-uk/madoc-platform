import { UseCaptureModel } from '../../types/to-be-removed';
import { useContext } from './context';

/**
 * @deprecated
 */
export function useCaptureModel(): UseCaptureModel {
  return useContext();
}
