import { ModalButton } from '@/frontend/shared/components/Modal';
import { Button, ButtonRow } from '@/frontend/shared/navigation/Button';
import { HrefLink } from '@/frontend/shared/utility/href-link';

type ContributionSuccessModalProps = {
  mode: 'saved' | 'submitted';
  nextImageHref?: string;
  continueLabel?: string;
  onContinueWorking?: () => void;
  onClose: () => void;
};

export function ContributionSuccessModal({
  mode,
  nextImageHref,
  continueLabel,
  onContinueWorking,
  onClose,
}: ContributionSuccessModalProps) {
  const title = mode === 'submitted' ? 'Contribution submitted' : 'Saved successfully';

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
              <p>Keep working on this image or move on to the next image.</p>
            </>
          ) : (
            <>
              <p>Your latest changes have been saved.</p>
              <p>Keep working on this image or move on to the next image.</p>
            </>
          )}
        </div>
      )}
      renderFooter={({ close }) => (
        <ButtonRow $noMargin>
          <Button
            onClick={() => {
              onContinueWorking?.();
              close();
            }}
          >
            {continueLabel || 'Continue working'}
          </Button>
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
