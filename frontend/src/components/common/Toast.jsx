import toast, { Toaster } from 'react-hot-toast';

export const showToast = {
    success: (msg) => toast.success(msg, {
        style: { background: '#10B981', color: '#fff', borderRadius: '10px' },
        iconTheme: { primary: '#fff', secondary: '#10B981' }
    }),
    error: (msg) => toast.error(msg, {
        style: { background: '#EF4444', color: '#fff', borderRadius: '10px' },
        iconTheme: { primary: '#fff', secondary: '#EF4444' }
    }),
    loading: (msg) => toast.loading(msg, {
        style: { background: '#3B82F6', color: '#fff', borderRadius: '10px' }
    })
};

const CustomToaster = () => {
    return (
        <Toaster
            position="top-right"
            toastOptions={{
                className: 'font-sans text-sm shadow-glass',
                duration: 3000,
            }}
        />
    );
};

export default CustomToaster;
