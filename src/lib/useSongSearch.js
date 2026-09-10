import { useCallback, useEffect, useRef, useState } from "react";
import { searchSongs } from "../api/itunes";

const DEBOUNCE_MS = 350;

export default function useSongSearch() {
    const [query, setQuery] = useState('');
    const [results, setResults] = useState([]);
    const [status, setStatus] = useState('idle');
    const [error, setError] = useState(null);

    const timerRef = useRef(null);
    const controllerRef = useRef(null);
    const attemptRef = useRef(0);
    const run = useCallback(async (term) => {
        const trimmed = term.trim();

        if (controllerRef.current) {
            controllerRef.current.abort();
            controllerRef.current = null;
        } 

        if (trimmed.length < 2) {
            setResults([]);
            setError(null);
            setStatus('idle');
            return;
        }

        const controller = new AbortController();
        controllerRef.current = controller;
        attemptRef.current += 1;
        const myAttempt = attemptRef.current;
        setStatus('loading');
        setError(null);

        try {
            const songs = await searchSongs(trimmed, { signal: controller.signal });
            if (myAttempt !== attemptRef.current) return;
            setResults(songs);
            setStatus(songs.length ? 'success' : 'empty');
        } catch (err) {
            if (err.name === 'AbortError') return;
            if (myAttempt !== attemptRef.current) return;
            setResults([]);
            setError(err.userMessage || 'Something went wrong. Please try again.');
            setStatus('error');
        }
    }, []);

    useEffect(() => {
        if (timerRef.current) clearTimeout(timerRef.current);
        timerRef.current = setTimeout(() => run(query), DEBOUNCE_MS);

        return () => {
            if (timerRef.current) clearTimeout(timerRef.current);
        };
    }, [query, run]);

    useEffect(() => {
        return () => {
            if (timerRef.current) clearTimeout(timerRef.current);
            if (controllerRef.current) controllerRef.current.abort();
        };
    }, []);

    const retry = useCallback(() => run(query), [run, query]);
    const clear = useCallback(() => {
        setQuery('');
        setResults([]);
        setError(null);
        setStatus('idle');
    }, []);

    return { query, setQuery, results, status, error, retry, clear }
}