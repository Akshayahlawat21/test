import { Toaster } from 'react-hot-toast';

export default function Toast() {
  return (
    <Toaster
      position="top-right"
      gutter={8}
      toastOptions={{
        duration: 4000,
        style: {
          background: '#fff',
          color: '#1f2937',
          borderRadius: '12px',
          padding: '12px 16px',
          fontSize: '14px',
          boxShadow: '0 4px 12px rgba(0,0,0,0.1)',
        },
        success: {
          iconTheme: {
            primary: '#22c55e',
            secondary: '#fff',
          },
        },
        error: {
          iconTheme: {
            primary: '#dc5f4e',
            secondary: '#fff',
          },
        },
      }}
    />
  );
}
