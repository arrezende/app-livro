import React from 'react';
import ReactDOM from 'react-dom/client';
import App from './App';

// Robust suppression of ResizeObserver errors
// These errors are benign in the context of epub.js and often cause unnecessary noise or crashes in dev mode
const RO_ERROR_SUBSTRINGS = [
  'ResizeObserver loop completed with undelivered notifications',
  'ResizeObserver loop limit exceeded'
];

const isResizeObserverError = (message: string) => {
  if (!message) return false;
  // Convert to lowercase to be safe against browser capitalization differences
  const msg = message.toLowerCase();
  return RO_ERROR_SUBSTRINGS.some(substring => msg.includes(substring.toLowerCase()));
};

// 1. Handler for global error events
const globalErrorHandler = (event: ErrorEvent) => {
  if (isResizeObserverError(event.message)) {
    event.stopImmediatePropagation();
    event.preventDefault();
    return true;
  }
};

// 2. Handler for unhandled promise rejections (rare for RO, but good safety)
const unhandledRejectionHandler = (event: PromiseRejectionEvent) => {
  const reason = event.reason;
  const message = reason instanceof Error ? reason.message : String(reason);
  if (isResizeObserverError(message)) {
    event.stopImmediatePropagation();
    event.preventDefault();
  }
};

window.addEventListener('error', globalErrorHandler);
window.addEventListener('unhandledrejection', unhandledRejectionHandler);

// 3. Override console.error to prevent logging to the console
const originalConsoleError = console.error;
console.error = (...args: any[]) => {
  const firstArg = args[0];
  let message = '';
  
  if (firstArg instanceof Error) {
    message = firstArg.message;
  } else if (typeof firstArg === 'string') {
    message = firstArg;
  }

  if (isResizeObserverError(message)) {
    return;
  }

  originalConsoleError(...args);
};

const rootElement = document.getElementById('root');
if (!rootElement) {
  throw new Error("Could not find root element to mount to");
}

const root = ReactDOM.createRoot(rootElement);
root.render(
  <React.StrictMode>
    <App />
  </React.StrictMode>
);