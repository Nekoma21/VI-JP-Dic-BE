export const isKanji = (char) => {
    const code = char.charCodeAt(0);
    return (code >= 0x4E00 && code <= 0x9FBF); // Phạm vi Unicode cho Kanji
};