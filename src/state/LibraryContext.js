import React, { createContext, useContext, useEffect, useMemo, useReducer } from 'react';
import { libraryReducer, initialLibrary, ACTIONS } from './libraryReducer';
import AsyncStorage from '@react-native-async-storage/async-storage';

const STORAGE_KEY = 'riff:library:v1';
const SAVE_DEBOUNCE_MS = 400;
const LibraryContext = createContext(null);

export function makeEntry(song, sentiment) {
    return {
        id: `e_${Date.now()}_${Math.random().toString(36).slice(2, 8)}`,
        song,
        sentiment,
        note: '',
        addedAt: new Date().toISOString(),
    };
}

export function LibraryProvider({ children }) {
    const [state, dispatch] = useReducer(libraryReducer, initialLibrary);

    useEffect(() => {
        let cancelled = false;

        async function load() {
            let saved = [];
            try {
                const raw = await AsyncStorage.getItem(STORAGE_KEY);
                if (raw) {
                    const parsed = JSON.parse(raw);
                    if (parsed && Array.isArray(parsed.entries)) saved = parsed.entries;
                }
            } catch (err) {
                console.warn('[riff] could not read the saved library:', err.message);
            }
            if (!cancelled) {
                dispatch({ type: ACTIONS.HYDRATE, entries: saved });
            }
        }
        load();
        return () => { cancelled = true; };
    }, []);

    useEffect(() => {
        if (!state.ready) return;

        const timer = setTimeout(() => {
            const payload = JSON.stringify({
                version: 1,
                savedAt: new Date().toISOString(),
                entries: state.entries.map(({ id, song, sentiment, note, addedAt }) => ({
                    id,
                    song,
                    sentiment,
                    note,
                    addedAt,
                })),
            });

            AsyncStorage.setItem(STORAGE_KEY, payload).catch((err) => {
                console.warn('[riff] could not save the library:', err.message);
            });
        }, SAVE_DEBOUNCE_MS);

        return () => clearTimeout(timer);
    }, [state.entries, state.ready]);

    const value = useMemo(() => ({
        entries: state.entries,
        ready: state.ready,

        addSong(song, sentiment, insertIndex) {
            dispatch({
                type: ACTIONS.ADD,
                entry: makeEntry(song, sentiment),
                insertIndex,
            });
        },
        remove(entryId) {
            dispatch({ type: ACTIONS.REMOVE, entryId });
        },
        setNote(entryId, note) {
            dispatch({ type: ACTIONS.NOTE, entryId, note });
        },
        clear() {
            dispatch({ type: ACTIONS.CLEAR });
        },
    }), [state.entries, state.ready]);

    return (
        <LibraryContext.Provider value={value}>
            {children}
        </LibraryContext.Provider>
    );
}

export function useLibrary() {
    const value = useContext(LibraryContext);
    if (!value) {
        throw new Error('useLibrary must be used inside <LibraryProvider>');
    }
    return value;
}