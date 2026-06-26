'use client';
import { X, AlertTriangle, CheckCircle, Info, HelpCircle } from 'lucide-react';

export default function CustomModal({
  isOpen,
  title,
  message,
  type = 'info', // 'info' | 'success' | 'error' | 'confirm'
  confirmText = 'Confirm',
  cancelText = 'Cancel',
  onConfirm,
  onClose,
}) {
  if (!isOpen) return null;

  const getIcon = () => {
    switch (type) {
      case 'success':
        return <CheckCircle size={36} color="#10B981" />;
      case 'error':
        return <AlertTriangle size={36} color="#EF4444" />;
      case 'confirm':
        return <HelpCircle size={36} color="#F59E0B" />;
      default:
        return <Info size={36} color="#3B82F6" />;
    }
  };

  const getHeaderColor = () => {
    switch (type) {
      case 'error':
        return '#EF4444';
      case 'confirm':
        return '#F59E0B';
      case 'success':
        return '#10B981';
      default:
        return '#764ABC';
    }
  };

  return (
    <div style={{
      position: 'fixed',
      top: 0,
      left: 0,
      right: 0,
      bottom: 0,
      backgroundColor: 'rgba(0, 0, 0, 0.45)',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      zIndex: 2000,
      backdropFilter: 'blur(5px)',
    }}>
      <div style={{
        background: '#fff',
        borderRadius: '12px',
        width: '100%',
        maxWidth: '400px',
        boxShadow: '0 20px 25px -5px rgba(0, 0, 0, 0.1), 0 10px 10px -5px rgba(0, 0, 0, 0.04)',
        border: '1px solid #e5e7eb',
        overflow: 'hidden',
        display: 'flex',
        flexDirection: 'column',
      }}>
        <div style={{
          height: '4px',
          background: getHeaderColor(),
          width: '100%'
        }} />
        
        <div style={{ padding: '24px', display: 'flex', gap: '16px' }}>
          <div style={{ flexShrink: 0 }}>
            {getIcon()}
          </div>
          <div style={{ flex: 1, display: 'flex', flexDirection: 'column', gap: '6px' }}>
            <h3 style={{ margin: 0, fontSize: '16px', fontWeight: 600, color: '#111827' }}>
              {title}
            </h3>
            <p style={{ margin: 0, fontSize: '14px', color: '#4B5563', lineHeight: 1.5 }}>
              {message}
            </p>
          </div>
        </div>

        <div style={{
          padding: '12px 24px',
          background: '#f9fafb',
          borderTop: '1px solid #f3f4f6',
          display: 'flex',
          justifyContent: 'flex-end',
          gap: '8px'
        }}>
          {type === 'confirm' && (
            <button
              style={{
                padding: '6px 14px',
                background: '#fff',
                color: '#4B5563',
                border: '1px solid #D1D5DB',
                borderRadius: '6px',
                cursor: 'pointer',
                fontSize: '13px',
                fontWeight: 500
              }}
              onClick={onClose}
            >
              {cancelText}
            </button>
          )}
          <button
            style={{
              padding: '6px 14px',
              background: getHeaderColor(),
              color: '#fff',
              border: 'none',
              borderRadius: '6px',
              cursor: 'pointer',
              fontSize: '13px',
              fontWeight: 600
            }}
            onClick={onConfirm || onClose}
          >
            {type === 'confirm' ? confirmText : 'OK'}
          </button>
        </div>
      </div>
    </div>
  );
}
