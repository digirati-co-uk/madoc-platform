import { useEffect, useMemo, useRef, useState } from 'react';
import { useLocation } from 'react-router-dom';
import { ApiClient, ApiDebugRequestLog } from '../../../gateway/api';

const colors = {
  client: '#64748b',
  request: '#2563eb',
  middleware: '#f59e0b',
  steps: '#16a34a',
};

function formatMs(value?: number) {
  if (typeof value !== 'number' || Number.isNaN(value)) {
    return '-';
  }
  return `${value.toFixed(2)}ms`;
}

function getMiddlewareTime(request: ApiDebugRequestLog) {
  return (request.debug?.middleware || []).reduce((total, middleware) => total + middleware.selfMs, 0);
}

function getStepTime(request: ApiDebugRequestLog) {
  return (request.debug?.steps || []).reduce((total, step) => total + step.durationMs, 0);
}

function trimEndpoint(endpoint: string) {
  if (endpoint.length <= 70) {
    return endpoint;
  }
  return `${endpoint.slice(0, 67)}...`;
}

export function DevApiDebugPanel({ api }: { api: ApiClient }) {
  const location = useLocation();
  const routeKey = `${location.pathname}${location.search}${location.hash}`;
  const routeRef = useRef('');
  const pageStartRef = useRef(Date.now());
  const [isOpen, setIsOpen] = useState(false);
  const [requests, setRequests] = useState<ApiDebugRequestLog[]>([]);
  const [selectedRequestId, setSelectedRequestId] = useState<number | null>(null);

  useEffect(() => {
    routeRef.current = `${window.location.pathname}${window.location.search}`;
    pageStartRef.current = Date.now();
    api.clearDebugRequests();
    setRequests([]);
    setSelectedRequestId(null);
  }, [api, routeKey]);

  useEffect(() => {
    return api.onDebugRequest(request => {
      if (request.pagePath && request.pagePath !== routeRef.current) {
        return;
      }

      setRequests(current => [...current, request]);
    });
  }, [api]);

  const sortedRequests = useMemo(() => {
    return [...requests].sort((a, b) => a.startedAt - b.startedAt);
  }, [requests]);

  const selectedRequest = useMemo(() => {
    if (!sortedRequests.length) {
      return null;
    }

    if (selectedRequestId === null) {
      return sortedRequests[sortedRequests.length - 1];
    }

    return sortedRequests.find(request => request.id === selectedRequestId) || null;
  }, [selectedRequestId, sortedRequests]);

  const timelineEnd = useMemo(() => {
    return sortedRequests.reduce((maxValue, request) => Math.max(maxValue, request.endedAt), pageStartRef.current);
  }, [sortedRequests]);

  const timelineSpan = Math.max(timelineEnd - pageStartRef.current, 1);
  const totalClientTime = useMemo(() => {
    return sortedRequests.reduce((total, request) => total + request.durationMs, 0);
  }, [sortedRequests]);

  if (!isOpen) {
    return (
      <button
        type="button"
        onClick={() => setIsOpen(true)}
        style={{
          position: 'fixed',
          right: 16,
          bottom: 16,
          zIndex: 9999,
          border: '1px solid #334155',
          background: '#0f172a',
          color: '#e2e8f0',
          borderRadius: 8,
          fontSize: 12,
          fontWeight: 600,
          padding: '10px 12px',
          cursor: 'pointer',
        }}
      >
        API Debug ({sortedRequests.length})
      </button>
    );
  }

  return (
    <aside
      style={{
        position: 'fixed',
        right: 16,
        bottom: 16,
        zIndex: 9999,
        width: 'min(94vw, 980px)',
        height: 'min(78vh, 640px)',
        border: '1px solid #1e293b',
        borderRadius: 12,
        background: '#020617',
        color: '#e2e8f0',
        display: 'grid',
        gridTemplateRows: 'auto auto 1fr',
        boxShadow: '0 20px 45px rgba(2, 6, 23, 0.55)',
        overflow: 'hidden',
      }}
    >
      <div
        style={{
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
          borderBottom: '1px solid #1e293b',
          padding: '10px 12px',
        }}
      >
        <strong style={{ fontSize: 13 }}>API Debug Timeline</strong>
        <div style={{ display: 'flex', gap: 8 }}>
          <button
            type="button"
            onClick={() => {
              api.clearDebugRequests();
              pageStartRef.current = Date.now();
              setRequests([]);
              setSelectedRequestId(null);
            }}
            style={{
              background: '#0f172a',
              border: '1px solid #334155',
              color: '#cbd5e1',
              borderRadius: 6,
              fontSize: 11,
              padding: '4px 8px',
              cursor: 'pointer',
            }}
          >
            Clear
          </button>
          <button
            type="button"
            onClick={() => setIsOpen(false)}
            style={{
              background: '#0f172a',
              border: '1px solid #334155',
              color: '#cbd5e1',
              borderRadius: 6,
              fontSize: 11,
              padding: '4px 8px',
              cursor: 'pointer',
            }}
          >
            Close
          </button>
        </div>
      </div>

      <div
        style={{
          borderBottom: '1px solid #1e293b',
          padding: '8px 12px',
          fontSize: 11,
          color: '#94a3b8',
          display: 'flex',
          flexWrap: 'wrap',
          gap: 14,
        }}
      >
        <span>Requests: {sortedRequests.length}</span>
        <span>Total client time: {formatMs(totalClientTime)}</span>
        <span style={{ display: 'inline-flex', alignItems: 'center', gap: 6 }}>
          <span style={{ width: 8, height: 8, borderRadius: '50%', background: colors.client }} /> client
        </span>
        <span style={{ display: 'inline-flex', alignItems: 'center', gap: 6 }}>
          <span style={{ width: 8, height: 8, borderRadius: '50%', background: colors.request }} /> request
        </span>
        <span style={{ display: 'inline-flex', alignItems: 'center', gap: 6 }}>
          <span style={{ width: 8, height: 8, borderRadius: '50%', background: colors.middleware }} /> middleware
        </span>
        <span style={{ display: 'inline-flex', alignItems: 'center', gap: 6 }}>
          <span style={{ width: 8, height: 8, borderRadius: '50%', background: colors.steps }} /> steps
        </span>
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: '1.15fr 0.85fr', minHeight: 0 }}>
        <div style={{ overflow: 'auto', borderRight: '1px solid #1e293b' }}>
          {sortedRequests.map(request => {
            const requestTotal = request.debug?.request?.totalMs || 0;
            const middlewareTotal = getMiddlewareTime(request);
            const stepTotal = getStepTime(request);
            const startOffset = ((request.startedAt - pageStartRef.current) / timelineSpan) * 100;
            const clientWidth = Math.max((request.durationMs / timelineSpan) * 100, 0.9);
            const requestWidth = Math.min((requestTotal / timelineSpan) * 100, clientWidth);
            const middlewareWidth = Math.min((middlewareTotal / timelineSpan) * 100, clientWidth);
            const stepsWidth = Math.min((stepTotal / timelineSpan) * 100, clientWidth);
            const selected = selectedRequestId === request.id;

            return (
              <button
                type="button"
                key={request.id}
                onClick={() => setSelectedRequestId(request.id)}
                style={{
                  width: '100%',
                  border: 0,
                  borderBottom: '1px solid #0f172a',
                  background: selected ? '#0f172a' : 'transparent',
                  color: 'inherit',
                  textAlign: 'left',
                  padding: '10px 12px',
                  cursor: 'pointer',
                }}
              >
                <div style={{ display: 'flex', justifyContent: 'space-between', gap: 12, marginBottom: 6 }}>
                  <strong style={{ fontSize: 11, color: '#f8fafc' }}>
                    {request.method} {trimEndpoint(request.endpoint)}
                  </strong>
                  <span style={{ fontSize: 11, color: '#94a3b8' }}>status {request.status}</span>
                </div>

                <div style={{ display: 'flex', gap: 10, marginBottom: 7, fontSize: 10, color: '#94a3b8' }}>
                  <span>client {formatMs(request.durationMs)}</span>
                  <span>request {formatMs(requestTotal)}</span>
                  <span>middleware {formatMs(middlewareTotal)}</span>
                  <span>steps {formatMs(stepTotal)}</span>
                </div>

                <div style={{ position: 'relative', height: 28, background: '#020617', borderRadius: 6 }}>
                  <div
                    style={{
                      position: 'absolute',
                      left: `${startOffset}%`,
                      top: 5,
                      height: 6,
                      width: `${clientWidth}%`,
                      background: colors.client,
                      borderRadius: 999,
                      opacity: 0.7,
                    }}
                  />
                  <div
                    style={{
                      position: 'absolute',
                      left: `${startOffset}%`,
                      top: 12,
                      height: 6,
                      width: `${requestWidth}%`,
                      background: colors.request,
                      borderRadius: 999,
                    }}
                  />
                  <div
                    style={{
                      position: 'absolute',
                      left: `${startOffset}%`,
                      top: 19,
                      height: 6,
                      width: `${middlewareWidth}%`,
                      background: colors.middleware,
                      borderRadius: 999,
                    }}
                  />
                  {stepsWidth > 0 ? (
                    <div
                      style={{
                        position: 'absolute',
                        left: `${startOffset}%`,
                        top: 19,
                        height: 6,
                        width: `${stepsWidth}%`,
                        background: colors.steps,
                        borderRadius: 999,
                        opacity: 0.9,
                      }}
                    />
                  ) : null}
                </div>
              </button>
            );
          })}
          {!sortedRequests.length ? (
            <div style={{ padding: 12, fontSize: 12, color: '#64748b' }}>No requests captured for this route yet.</div>
          ) : null}
        </div>

        <div style={{ overflow: 'auto', padding: 12 }}>
          <strong style={{ fontSize: 12 }}>Details</strong>
          {selectedRequest ? (
            <div style={{ display: 'grid', gap: 10, marginTop: 8 }}>
              <div style={{ fontSize: 11, color: '#cbd5e1' }}>
                <div>
                  <strong>{selectedRequest.method}</strong> {selectedRequest.endpointWithDebug}
                </div>
                <div style={{ marginTop: 4, color: '#94a3b8' }}>
                  status {selectedRequest.status}, client {formatMs(selectedRequest.durationMs)}
                </div>
              </div>

              <div style={{ border: '1px solid #1e293b', borderRadius: 8, padding: 10 }}>
                <div style={{ fontSize: 11, marginBottom: 8, color: '#e2e8f0' }}>Request summary</div>
                <div style={{ fontSize: 11, color: '#94a3b8' }}>
                  server route: {selectedRequest.debug?.request?.route || '-'}
                </div>
                <div style={{ fontSize: 11, color: '#94a3b8' }}>
                  server total: {formatMs(selectedRequest.debug?.request?.totalMs)}
                </div>
                <div style={{ fontSize: 11, color: '#94a3b8' }}>
                  step total: {formatMs(getStepTime(selectedRequest))}
                </div>
              </div>

              <div style={{ border: '1px solid #1e293b', borderRadius: 8, padding: 10 }}>
                <div style={{ fontSize: 11, marginBottom: 8, color: '#e2e8f0' }}>Middleware breakdown</div>
                {(selectedRequest.debug?.middleware || []).length ? (
                  <div style={{ display: 'grid', gap: 6 }}>
                    {[...(selectedRequest.debug?.middleware || [])]
                      .sort((a, b) => b.selfMs - a.selfMs)
                      .map(middleware => (
                        <div
                          key={`${selectedRequest.id}-${middleware.name}`}
                          style={{ display: 'flex', justifyContent: 'space-between', fontSize: 11, color: '#94a3b8' }}
                        >
                          <span>{middleware.name}</span>
                          <span>{formatMs(middleware.selfMs)}</span>
                        </div>
                      ))}
                  </div>
                ) : (
                  <div style={{ fontSize: 11, color: '#64748b' }}>No middleware data.</div>
                )}
              </div>

              <div style={{ border: '1px solid #1e293b', borderRadius: 8, padding: 10 }}>
                <div style={{ fontSize: 11, marginBottom: 8, color: '#e2e8f0' }}>Route step breakdown</div>
                {(selectedRequest.debug?.steps || []).length ? (
                  <div style={{ display: 'grid', gap: 6 }}>
                    {(selectedRequest.debug?.steps || []).map(step => (
                      <div
                        key={`${selectedRequest.id}-${step.step}`}
                        style={{ display: 'flex', justifyContent: 'space-between', fontSize: 11, color: '#94a3b8' }}
                      >
                        <span>{step.step}</span>
                        <span>{formatMs(step.durationMs)}</span>
                      </div>
                    ))}
                  </div>
                ) : (
                  <div style={{ fontSize: 11, color: '#64748b' }}>No route steps available.</div>
                )}
              </div>
            </div>
          ) : (
            <div style={{ marginTop: 8, fontSize: 11, color: '#64748b' }}>Select a request to inspect details.</div>
          )}
        </div>
      </div>
    </aside>
  );
}
