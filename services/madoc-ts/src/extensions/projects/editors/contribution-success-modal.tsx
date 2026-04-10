import { ModalButton } from '@/frontend/shared/components/Modal';
import { Button, ButtonRow } from '@/frontend/shared/navigation/Button';
import { HrefLink } from '@/frontend/shared/utility/href-link';

type ContributionSuccessModalProps = {
  mode: 'saved' | 'submitted';
  nextImageHref?: string;
  continueLabel?: string;
  showContinueWorking?: boolean;
  onContinueWorking?: () => void;
  onClose: () => void;
};

export function ContributionSuccessModal({
  mode,
  nextImageHref,
  continueLabel,
  showContinueWorking = true,
  onContinueWorking,
  onClose,
}: ContributionSuccessModalProps) {
  const title = mode === 'submitted' ? 'Contribution submitted' : 'Saved successfully';
  const helperMessage =
    mode === 'submitted'
      ? showContinueWorking
        ? 'Keep working on this image or move on to the next image.'
        : nextImageHref
          ? 'Move on to the next image.'
          : 'You can close this message.'
      : 'Keep working on this image or move on to the next image.';

  return (
    <ModalButton
      title={title}
      button
      style={{ display: 'none' }}
      openByDefault
      onClose={onClose}
      modalSize="sm"
      allowResize={false}
      render={() => (
        <div className="space-y-3 text-sm">
          {mode === 'submitted' ? (
            <>
              <p>Your contribution has been submitted.</p>
              <p>{helperMessage}</p>
            </>
          ) : (
            <>
              <p>Your latest changes have been saved.</p>
              <p>{helperMessage}</p>
            </>
          )}
        </div>
      )}
      renderFooter={({ close }) => (
        <ButtonRow $noMargin>
          {showContinueWorking ? (
            <Button
              onClick={() => {
                onContinueWorking?.();
                close();
              }}
            >
              {continueLabel || 'Continue working'}
            </Button>
          ) : null}
          {nextImageHref ? (
            <Button
              $primary
              as={HrefLink}
              href={nextImageHref}
              onClick={() => {
                close();
              }}
            >
              Next image
            </Button>
          ) : null}
        </ButtonRow>
      )}
    />
  );
}
