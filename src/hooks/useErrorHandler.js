import { useState, useCallback } from 'react';
import { toast } from 'react-toastify';
import { useNavigate } from 'react-router-dom';

export function useErrorHandler() {
    const [error, setError] = useState(null);
    const navigate = useNavigate();

    const handleError = useCallback((error, customMessage = 'An error occurred') => {
        console.error('Error:', error);
        setError(error);

        // Handle specific error types
        if (error?.message?.includes('JWT')) {
            toast.error('Your session has expired. Please log in again.');
            navigate('/login');
            return;
        }

        if (error?.code === 'PGRST116') {
            toast.error('Resource not found');
            return;
        }

        if (error?.code === '23505') {
            toast.error('This record already exists');
            return;
        }

        if (error?.code === '42P01') {
            toast.error('Database error occurred');
            return;
        }

        // Default error message
        toast.error(customMessage);
    }, [navigate]);

    return { error, handleError };
}