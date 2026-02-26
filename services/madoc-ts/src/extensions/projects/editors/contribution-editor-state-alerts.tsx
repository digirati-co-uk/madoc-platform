import { Button, ButtonRow } from '../../../frontend/shared/navigation/Button';

type ContributionEditorStateAlertsProps = {
  isLoading: boolean;
  isError: boolean;
  lastErrorMessage?: string;
  isBlocked: boolean;
  blockedReason?: string;
  showTableUnavailable: boolean;
  tableErrors: string[];
  needsRevisionSelection: boolean;
  onRetry: () => void;
  onEnsureRevision: () => void;
};

export function ContributionEditorStateAlerts({
  isLoading,
  isError,
  lastErrorMessage,
  isBlocked,
  blockedReason,
  showTableUnavailable,
  tableErrors,
  needsRevisionSelection,
  onRetry,
  onEnsureRevision,
}: ContributionEditorStateAlertsProps) {
  return (
    <>
      {isLoading ? <div>Loading contribution data...</div> : null}

      {isError ? (
        <div>
          <p>Something went wrong while preparing this contribution.</p>
          {lastErrorMessage ? <pre className="whitespace-pre-wrap">{lastErrorMessage}</pre> : null}
          <ButtonRow>
            <Button onClick={onRetry}>Retry</Button>
          </ButtonRow>
        </div>
      ) : null}

      {isBlocked && blockedReason ? <div>{blockedReason}</div> : null}

      {showTableUnavailable ? (
        <div>
          <p>Table configuration is unavailable.</p>
          {tableErrors.length ? <pre className="whitespace-pre-wrap">{tableErrors.join('\n')}</pre> : null}
          {needsRevisionSelection ? <Button onClick={onEnsureRevision}>Try selecting revision</Button> : null}
        </div>
      ) : null}
    </>
  );
}
