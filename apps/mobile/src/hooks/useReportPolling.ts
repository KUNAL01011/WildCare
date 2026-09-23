import { useEffect, useRef, useCallback, useState } from 'react';
import { reportsApi } from '../api/reports';
import type { ReportDetail } from '../api/reports';

type PollingStatus =
  | 'polling'
  | 'ready'
  | 'failed'
  | 'timeout';

type UseReportPollingOptions = {
  reportId: string;
  intervalMs?: number;   // default 3000
  timeoutMs?: number;    // default 60000 (60s)
  onReady?: (report: ReportDetail) => void;
  onFailed?: () => void;
  onTimeout?: () => void;
};

export const useReportPolling = ({
  reportId,
  intervalMs = 3000,
  timeoutMs = 60000,
  onReady,
  onFailed,
  onTimeout,
}: UseReportPollingOptions) => {
  const [status, setStatus] = useState<PollingStatus>('polling');
  const [report, setReport] = useState<ReportDetail | null>(null);
  const [attemptCount, setAttemptCount] = useState(0);

  const intervalRef = useRef<ReturnType<typeof setInterval> | null>(null);
  const timeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const isMounted = useRef(true);

  const stop = useCallback(() => {
    if (intervalRef.current) clearInterval(intervalRef.current);
    if (timeoutRef.current) clearTimeout(timeoutRef.current);
  }, []);

  const poll = useCallback(async () => {
    if (!isMounted.current) return;

    try {
      const data = await reportsApi.getById(reportId);

      if (!isMounted.current) return;

      setAttemptCount((c) => c + 1);

      if (data.status === 'READY_FOR_REVIEW') {
        stop();
        setReport(data);
        setStatus('ready');
        onReady?.(data);
        return;
      }

      // AI analysis explicitly failed on backend
      if (data.status === 'DRAFT' && attemptCount > 2) {
        stop();
        setStatus('failed');
        onFailed?.();
        return;
      }

      // Still ANALYZING — keep polling
    } catch {
      // Network error during poll — keep trying until timeout
    }
  }, [reportId, attemptCount, stop, onReady, onFailed]);

  useEffect(() => {
    isMounted.current = true;

    // Start polling immediately
    poll();
    intervalRef.current = setInterval(poll, intervalMs);

    // Hard timeout
    timeoutRef.current = setTimeout(() => {
      if (!isMounted.current) return;
      stop();
      setStatus('timeout');
      onTimeout?.();
    }, timeoutMs);

    return () => {
      isMounted.current = false;
      stop();
    };
  }, [reportId]);

  return { status, report, attemptCount };
};