import { createContext } from '../../helpers/create-context';
import { CaptureModelContext } from '../../types/to-be-removed';

const [useContext, InternalProvider] = createContext<CaptureModelContext>();

export { useContext, InternalProvider };
