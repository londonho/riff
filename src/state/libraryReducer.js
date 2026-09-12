import {
    insertEntry,
    removeEntry,
    normalize,
    findEntryBySongId,
} from '../lib/ranking.js';

export const ACTIONS = {
    HYDRATE: 'library/hydrate',
    ADD: 'library/add',
    REMOVE: 'library/remove',
    NOTE: 'library/note',
    CLEAR: 'library/clear',
};

export const initialLibrary = {
    entries: [],
    ready: false,
};

export function libraryReducer(state = initialLibrary, action = {}) {
    switch (action.type) {
        case ACTIONS.HYDRATE:
            return {
                ...state,
                entries: normalize(Array.isArray(action.entries) ? action.entries : []),
                ready: true,
            };

        case ACTIONS.ADD: {
            const entry = action.entry;
            if (!entry || !entry.song) return state;
            if (findEntryBySongId(state.entries, entry.song.id)) return state;
            return {
                ...state,
                entries: insertEntry(state.entries, entry, action.insertIndex),
            };
        }

        case ACTIONS.REMOVE: {
            const exists = state.entries.some((e) => e.id === action.entryId);
            if (!exists) return state;
            return { ...state, entries: removeEntry(state.entries, action.entryId) };
        }

        case ACTIONS.NOTE: {
            let changed = false;
            const entries = state.entries.map((e) => {
                if (e.id !== action.entryId) return e;
                changed = true;
                return { ...e, note: action.note };
            });
            return changed ? { ...state, entries } : state;
        }

        case ACTIONS.CLEAR:
            return state.entries.length === 0 ? state : { ...state, entries: [] };

        default:
            return state;
    }
}