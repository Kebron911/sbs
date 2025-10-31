import React, { useEffect } from 'react';
import { Toast } from '../../types';
import { useGame } from '../../contexts/GameContext';

interface ToastProps {
  toast: Toast;
}

const ToastMessage: React.FC<ToastProps> = ({ toast }) => {
    const { hideToast } = useGame();

    useEffect(() => {
        const timer = setTimeout(() => {
            hideToast(toast.id);
        }, 5000); // 5 seconds

        return () => clearTimeout(timer);
    }, [toast.id, hideToast]);

    const typeStyles = {
        success: 'bg-green-500 border-green-400',
        info: 'bg-blue-500 border-blue-400',
        error: 'bg-red-500 border-red-400',
    };

    return (
        <div
            className={`flex items-center p-3 rounded-lg shadow-lg text-white border-l-4 ${typeStyles[toast.type]} bg-opacity-80 backdrop-blur-sm animate-fade-in`}
        >
            <p className="text-sm font-semibold">{toast.message}</p>
            <button onClick={() => hideToast(toast.id)} className="ml-4 text-xl font-bold opacity-70 hover:opacity-100">&times;</button>
        </div>
    );
};


interface ToastNotificationContainerProps {
  toasts: Toast[];
}

const ToastNotification: React.FC<ToastNotificationContainerProps> = ({ toasts }) => {
    return (
        <div className="fixed bottom-20 md:bottom-5 right-5 z-[100] w-full max-w-xs space-y-2">
            {toasts.map(toast => (
                <ToastMessage key={toast.id} toast={toast} />
            ))}
        </div>
    );
};

export default ToastNotification;
