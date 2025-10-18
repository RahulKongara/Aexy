import { useState, useEffect } from "react";
import api from "../services/api";
import type { ConversationLimit } from "../types";

export const useConversationLimit = () => {
    const [limit, setLimit] = useState<ConversationLimit | null>(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);

    const fetchLimit = async () => {
        try {
            setLoading(true);
            const data = await api.checkLimit();
            setLimit(data);
            setError(null);
        } catch (e) {
            setError('Failed to fech limit');
            console.error(e);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchLimit();
    }, []);

    return { limit, loading, error, refetch: fetchLimit };
};

