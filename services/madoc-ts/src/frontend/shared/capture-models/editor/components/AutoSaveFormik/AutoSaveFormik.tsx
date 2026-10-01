import { useFormikContext } from 'formik';
import { useUnmount } from '../../hooks/useUnmount';

export function AutoSaveFormik({ hasChanges = false }: { hasChanges?: boolean }) {
  const { submitForm, dirty } = useFormikContext();

  useUnmount(() => {
    if (dirty || hasChanges) {
      submitForm();
    }
  }, [dirty, hasChanges, submitForm]);

  return null;
}
