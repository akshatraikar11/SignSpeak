// Expanded ASL Sign Library - 16 Signs (including Namaste)
// Combines MediaPipe AI + Custom Heuristic Detection

export const SIGN_LIBRARY = {
    // ===== NUMBERS (5 signs) =====
    ONE: {
        name: '1',
        description: 'Index finger pointing up',
        category: 'number',
        pattern: 'one_finger'
    },
    TWO: {
        name: '2',
        description: 'Index and middle fingers up (together)',
        category: 'number',
        pattern: 'two_fingers'
    },
    THREE: {
        name: '3',
        description: 'Thumb, index, and middle fingers extended',
        category: 'number',
        pattern: 'three_fingers'
    },
    FOUR: {
        name: '4',
        description: 'Four fingers up (no thumb)',
        category: 'number',
        pattern: 'four_fingers'
    },
    FIVE: {
        name: '5',
        description: 'All five fingers extended (open hand)',
        category: 'number',
        pattern: 'open_hand'
    },

    // ===== COMMON GESTURES (7 signs) =====
    YES: {
        name: 'Yes',
        description: 'Thumbs up gesture',
        category: 'gesture',
        pattern: 'thumbs_up'
    },
    HELLO: {
        name: 'Hello',
        description: 'Open hand raised (all fingers extended)',
        category: 'gesture',
        pattern: 'hand_wave'
    },
    STOP: {
        name: 'Stop',
        description: 'Closed fist',
        category: 'gesture',
        pattern: 'fist'
    },
    PEACE: {
        name: 'Peace',
        description: 'Index and middle fingers separated in V shape',
        category: 'gesture',
        pattern: 'peace_sign'
    },
    LOVE: {
        name: 'Love',
        description: 'Thumb, index finger and pinky extended (I Love You)',
        category: 'gesture',
        pattern: 'i_love_you'
    },
    L: {
        name: 'L',
        description: 'Thumb and index finger form L shape',
        category: 'gesture',
        pattern: 'l_shape'
    },
    Y: {
        name: 'Y',
        description: 'Thumb and pinky extended (shaka/hang loose)',
        category: 'gesture',
        pattern: 'shaka'
    },
    NO: {
        name: 'No',
        description: 'Thumbs down gesture',
        category: 'gesture',
        pattern: 'thumbs_down'
    }
};

// Sign categories
export const CATEGORIES = {
    number: 'Numbers (1-5)',
    gesture: 'Common Gestures'
};

// Get all signs as array
export const getAllSigns = () => Object.values(SIGN_LIBRARY);

// Get signs by category
export const getSignsByCategory = (category) =>
    getAllSigns().filter(sign => sign.category === category);

// Search signs by name
export const searchSigns = (query) =>
    getAllSigns().filter(sign =>
        sign.name.toLowerCase().includes(query.toLowerCase())
    );

// Get total count
export const getSignCount = () => Object.keys(SIGN_LIBRARY).length;
