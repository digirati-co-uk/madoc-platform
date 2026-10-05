import type { Server } from 'http';

export function registerGracefulServerShutdown(
  server: Server,
  stopJobs: () => void,
  closeResources: () => Promise<void>
) {
  let stopping = false;
  const shutdown = () => {
    if (stopping) return;
    stopping = true;
    stopJobs();
    // Leave PM2 ten seconds to clean up after our drain deadline.
    const deadline = setTimeout(() => {
      console.error('Server shutdown exceeded the request drain deadline');
      server.closeAllConnections();
      process.exit(1);
    }, 110000);
    deadline.unref();
    server.close(error => {
      void (async () => {
        if (error) throw error;
        await closeResources();
        clearTimeout(deadline);
        process.exit(0);
      })().catch(shutdownError => {
        console.error('Server shutdown failed', shutdownError);
        process.exit(1);
      });
    });
    server.closeIdleConnections();
  };
  process.once('SIGINT', shutdown);
  process.once('SIGTERM', shutdown);
}
