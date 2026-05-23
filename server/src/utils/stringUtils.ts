export function levenshteinDistance(a: string, b: string): number {
    const matrix = [];

    // Increment along the first column of each row
    let i;
    for (i = 0; i <= b.length; i++) {
        matrix[i] = [i];
    }

    // Increment each column in the first row
    let j;
    for (j = 0; j <= a.length; j++) {
        matrix[0][j] = j;
    }

    // Fill in the rest of the matrix
    for (i = 1; i <= b.length; i++) {
        for (j = 1; j <= a.length; j++) {
            if (b.charAt(i - 1) == a.charAt(j - 1)) {
                matrix[i][j] = matrix[i - 1][j - 1];
            } else {
                matrix[i][j] = Math.min(matrix[i - 1][j - 1] + 1, // substitution
                                        Math.min(matrix[i][j - 1] + 1, // insertion
                                                 matrix[i - 1][j] + 1)); // deletion
            }
        }
    }

    return matrix[b.length][a.length];
}

export function findClosestMatch(target: string, candidates: string[], maxDistance: number = 3): string | null {
    let closestMatch = null;
    let minDistance = maxDistance + 1; // +1 so it strictly needs to be <= maxDistance

    for (const candidate of candidates) {
        const distance = levenshteinDistance(target.toLowerCase(), candidate.toLowerCase());
        if (distance < minDistance) {
            minDistance = distance;
            closestMatch = candidate;
        }
    }

    return closestMatch;
}
