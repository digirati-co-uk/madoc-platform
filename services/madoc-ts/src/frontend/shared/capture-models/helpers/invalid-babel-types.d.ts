import { CaptureModel } from '../types/capture-model';

type IsEntity = (entity: any) => entity is CaptureModel['document'];
type IsEntityList = (entity: any) => entity is CaptureModel['document'][];
