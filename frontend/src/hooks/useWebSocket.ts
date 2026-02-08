import { useEffect, useRef, useCallback, useState } from 'react';
import { io, Socket } from 'socket.io-client';
import type { AptitudeQuestion, AptitudeEvaluation } from '@/types';

interface UseWebSocketOptions {
    sessionId: string;
    onQuestion?: (question: AptitudeQuestion) => void;
    onEvaluation?: (evaluation: AptitudeEvaluation) => void;
    onAnalysis?: (analysis: any) => void;
    onError?: (error: string) => void;
}

export function useAptitudeSocket({
    sessionId,
    onQuestion,
    onEvaluation,
    onAnalysis,
    onError,
}: UseWebSocketOptions) {
    const socketRef = useRef<Socket | null>(null);
    const [isConnected, setIsConnected] = useState(false);

    useEffect(() => {
        const wsUrl = import.meta.env.VITE_WS_URL || 'http://localhost:5000';

        socketRef.current = io(wsUrl, {
            query: { sessionId },
            transports: ['websocket'],
        });

        const socket = socketRef.current;

        socket.on('connect', () => {
            setIsConnected(true);
            console.log('Connected to aptitude session');
        });

        socket.on('disconnect', () => {
            setIsConnected(false);
            console.log('Disconnected from aptitude session');
        });

        socket.on('question', (data: AptitudeQuestion) => {
            onQuestion?.(data);
        });

        socket.on('evaluation', (data: AptitudeEvaluation) => {
            onEvaluation?.(data);
        });

        socket.on('analysis', (data: any) => {
            onAnalysis?.(data);
        });

        socket.on('error', (data: { message: string }) => {
            onError?.(data.message);
        });

        return () => {
            socket.disconnect();
        };
    }, [sessionId, onQuestion, onEvaluation, onAnalysis, onError]);

    const submitResponse = useCallback((questionId: string, response: string, code?: string) => {
        if (socketRef.current?.connected) {
            socketRef.current.emit('submit_response', {
                questionId,
                response,
                code,
                timestamp: new Date().toISOString(),
            });
        }
    }, []);

    const requestHint = useCallback((questionId: string) => {
        if (socketRef.current?.connected) {
            socketRef.current.emit('request_hint', { questionId });
        }
    }, []);

    const endSession = useCallback(() => {
        if (socketRef.current?.connected) {
            socketRef.current.emit('end_session');
        }
    }, []);

    return {
        isConnected,
        submitResponse,
        requestHint,
        endSession,
    };
}

// Hook for XP and badge updates
export function useUserUpdates(userId: string, onXpGain?: (xp: number) => void, onBadge?: (badge: any) => void) {
    const socketRef = useRef<Socket | null>(null);

    useEffect(() => {
        const wsUrl = import.meta.env.VITE_WS_URL || 'http://localhost:5000';

        socketRef.current = io(`${wsUrl}/user`, {
            query: { userId },
            transports: ['websocket'],
        });

        const socket = socketRef.current;

        socket.on('xp_gained', (data: { amount: number; total: number }) => {
            onXpGain?.(data.amount);
        });

        socket.on('badge_earned', (badge: any) => {
            onBadge?.(badge);
        });

        return () => {
            socket.disconnect();
        };
    }, [userId, onXpGain, onBadge]);
}
