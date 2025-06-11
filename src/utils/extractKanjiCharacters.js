const extractKanjiCharacters = (text) => {
    const kanjiRegex = /[\u4E00-\u9FAF]/g; 
    const kanjiCharacters = text.match(kanjiRegex); 

    return kanjiCharacters ? kanjiCharacters : [];
};

export default extractKanjiCharacters;