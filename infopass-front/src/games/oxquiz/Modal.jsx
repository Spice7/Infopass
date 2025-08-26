import React from 'react';

export function Modal({ open, children }) {
    return open ? (
        <div style={{
            position: 'fixed', left: 0, top: 0, width: '100vw', height: '100vh',
            background: 'rgba(20,30,50,0.75)',
            backdropFilter: 'blur(2.5px)',
            zIndex: 999,
            display: 'flex', alignItems: 'center', justifyContent: 'center',
            animation: 'fadeIn 0.3s',
        }}>
            <div style={{
                minWidth: 400, maxWidth: 520, width: '90vw',
                background: 'linear-gradient(135deg, #22344f 60%, #2b4170 100%)',
                borderRadius: 22,
                boxShadow: '0 8px 32px rgba(0,0,0,0.28)',
                padding: '38px 36px 28px 36px',
                position: 'relative',
                animation: 'modalPop 0.35s',
            }}>
                {children}
            </div>
            <style>{`
                @keyframes fadeIn { from { opacity: 0; } to { opacity: 1; } }
                @keyframes modalPop { 0% { transform: scale(0.85); opacity: 0.5; } 100% { transform: scale(1); opacity: 1; } }
            `}</style>
        </div>
    ) : null;
}