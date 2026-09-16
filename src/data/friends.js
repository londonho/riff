import { normalize } from '../lib/ranking';

let counter = 0;
function entry(sentiment, title, artist, album, genre) {
    counter += 1;
    return {
        id: `seed_${counter}`,
        song: { id: `seed_song_${counter}`, title, artist, album, genre },
        sentiment,
        note: '',
        addedAt: '2026-01-01T00:00:00.000Z',
    };
}

export const FRIENDS = [
    {
        id: 'u_maya',
        name: 'Maya',
        handle: '@mayaplays',
        avatar: '🌙',
        bio: 'Rap, R&B, and one country song she will not explain.',
        entries: normalize([
            entry('liked', 'Nights', 'Frank Ocean', 'Blonde', 'R&B/Soul'),
            entry('liked', 'DNA.', 'Kendrick Lamar', 'DAMN.', 'Hip-Hop/Rap'),
            entry('liked', 'Ivy', 'Frank Ocean', 'Blonde', 'R&B/Soul'),
            entry('liked', 'Alright', 'Kendrick Lamar', 'To Pimp a Butterfly', 'Hip-Hop/Rap'),
            entry('fine', 'Redbone', 'Childish Gambino', 'Awaken, My Love!', 'R&B/Soul'),
            entry('fine', 'Sunflower', 'Post Malone', 'Spider-Man', 'Hip-Hop/Rap'),
            entry('fine', 'Jolene', 'Dolly Parton', 'Jolene', 'Country'),
            entry('disliked', 'Shape of You', 'Ed Sheeran', 'Divide', 'Pop'),
        ]),
    },
    {
        id: 'u_theo',
        name: 'Theo',
        handle: '@theolistens',
        avatar: '🎸',
        bio: 'Guitars, mostly. Rates everything too highly.',
        entries: normalize([
            entry('liked', 'Everlong', 'Foo Fighters', 'The Colour and the Shape', 'Rock'),
            entry('liked', 'Karma Police', 'Radiohead', 'OK Computer', 'Alternative'),
            entry('liked', 'Nights', 'Frank Ocean', 'Blonde', 'R&B/Soul'),
            entry('liked', 'Black', 'Pearl Jam', 'Ten', 'Rock'),
            entry('fine', 'Creep', 'Radiohead', 'Pablo Honey', 'Alternative'),
            entry('fine', 'Mr. Brightside', 'The Killers', 'Hot Fuss', 'Rock'),
            entry('disliked', 'Shape of You', 'Ed Sheeran', 'Divide', 'Pop'),
            entry('disliked', 'Sunflower', 'Post Malone', 'Spider-Man', 'Hip-Hop/Rap'),
        ]),
    },
    {
        id: 'u_priya',
        name: 'Priya',
        handle: '@priyainc',
        avatar: '✨',
        bio: 'Pop, unapologetically.',
        entries: normalize([
            entry('liked', 'Shape of You', 'Ed Sheeran', 'Divide', 'Pop'),
            entry('liked', 'Blinding Lights', 'The Weeknd', 'After Hours', 'Pop'),
            entry('liked', 'Levitating', 'Dua Lipa', 'Future Nostalgia', 'Pop'),
            entry('liked', 'As It Was', 'Harry Styles', "Harry's House", 'Pop'),
            entry('fine', 'Sunflower', 'Post Malone', 'Spider-Man', 'Hip-Hop/Rap'),
            entry('fine', 'Save Your Tears', 'The Weeknd', 'After Hours', 'Pop'),
            entry('disliked', 'Creep', 'Radiohead', 'Pablo Honey', 'Alternative'),
        ]),
    },
];

export function findFriend(id) {
    return FRIENDS.find((f) => f.id === id) || null;
}