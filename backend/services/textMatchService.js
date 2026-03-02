import { distance } from 'fastest-levenshtein';

export function normalize(str) {
    return str
        .toLowerCase()
        .replace(/[^a-z0-9]/g, '');  // Remove special chars AND completely strip spaces
}

export function similarityScore(a, b) {
    const na = normalize(a);
    const nb = normalize(b);

    if (!na || !nb) return 0;
    if (na === nb) return 100;

    const maxLen = Math.max(na.length, nb.length);
    const editDist = distance(na, nb);
    return Math.round(((maxLen - editDist) / maxLen) * 100);
}

export function calculateTextMatchScore(enteredName, enteredRegNo, extractedName, extractedRegNo) {

    // Name match — 40 points max (flexible, allows typos)
    const nameRaw = similarityScore(enteredName, extractedName);

    // Partial match bonus: check if entered name CONTAINS extracted or vice versa
    const nameNorm = normalize(enteredName);
    const extrNorm = normalize(extractedName);
    const containsBonus = (nameNorm.includes(extrNorm) || extrNorm.includes(nameNorm)) ? 15 : 0;

    const nameFinalRaw = Math.min(100, nameRaw + containsBonus);
    const namePoints = (nameFinalRaw / 100) * 40;

    // Register number match — 60 points max (strict)
    const regRaw = similarityScore(enteredRegNo, extractedRegNo);
    const regPoints = (regRaw / 100) * 60;

    return {
        textMatchScore: Math.round(namePoints + regPoints),  // 0–100
        nameMatchScore: Math.round(nameFinalRaw),
        regMatchScore: Math.round(regRaw),
        namePoints: Math.round(namePoints),
        regPoints: Math.round(regPoints),
        extracted: {
            name: extractedName,
            regNo: extractedRegNo
        }
    };
}
