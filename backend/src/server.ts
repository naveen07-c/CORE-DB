import { createApp } from './app';
import { ENV } from './config/env';

const app = createApp();

const server = app.listen(ENV.PORT, '0.0.0.0', () => {
  console.log('================================================================');
  console.log(`🚀 VORTEX Enterprise Commerce API Server running on port ${ENV.PORT}`);
  console.log(`📡 Bound Interface: 0.0.0.0 (Accepts Localhost & Local WiFi Devices)`);
  console.log(`🗄️  Data Source: ${ENV.DATA_SOURCE.toUpperCase()} (Repository Pattern Active)`);
  console.log(`🛡️  ACID Atomic Checkout & Price Snapshot Immutability Enabled`);
  console.log('================================================================');
});

// Graceful shutdown handling
process.on('SIGINT', () => {
  console.log('\nGracefully shutting down VORTEX API server...');
  server.close(() => {
    console.log('Server terminated cleanly.');
    process.exit(0);
  });
});
