export function incrementLabel(label: string): string {
    if (!label) return label;

    // Split into prefix (non-numeric or some alphanumeric) and suffix (numeric or alphabetic to increment)
    // Case 1: Pure numeric with optional padding
    if (/^\d+$/.test(label)) {
        const num = parseInt(label, 10) + 1;
        const strNum = num.toString();
        if (label.startsWith('0') && strNum.length < label.length) {
            return strNum.padStart(label.length, '0');
        }
        return strNum;
    }

    // Case 2: Alphanumeric ending in numbers (e.g., abc99)
    const alphaNumMatch = label.match(/^([^0-9]*)(\d+)$/);
    if (alphaNumMatch) {
        const prefix = alphaNumMatch[1];
        const numPart = alphaNumMatch[2];
        const num = parseInt(numPart, 10) + 1;
        const strNum = num.toString();
        let paddedNum = strNum;
        if (numPart.startsWith('0') && strNum.length < numPart.length) {
            paddedNum = strNum.padStart(numPart.length, '0');
        }
        return prefix + paddedNum;
    }

    // Case 3: Pure alphabetic sequence (e.g., aa -> ab, z -> aa, az -> ba)
    if (/^[a-zA-Z]+$/.test(label)) {
        return incrementAlphabetic(label);
    }

    // If it doesn't match any known pattern, just return it or attempt basic append
    return label;
}

function incrementAlphabetic(label: string): string {
    const chars = label.split('');
    let carry = true;

    for (let i = chars.length - 1; i >= 0; i--) {
        if (!carry) break;

        const charCode = chars[i].charCodeAt(0);
        const isLower = charCode >= 97 && charCode <= 122;
        const isUpper = charCode >= 65 && charCode <= 90;

        if (isLower) {
            if (charCode === 122) { // 'z'
                chars[i] = 'a';
                carry = true;
            } else {
                chars[i] = String.fromCharCode(charCode + 1);
                carry = false;
            }
        } else if (isUpper) {
            if (charCode === 90) { // 'Z'
                chars[i] = 'A';
                carry = true;
            } else {
                chars[i] = String.fromCharCode(charCode + 1);
                carry = false;
            }
        }
    }

    if (carry) {
        // If we still have carry (e.g., 'z' -> 'aa' or 'Z' -> 'AA')
        const firstChar = chars[0];
        const isLower = firstChar >= 'a' && firstChar <= 'z';
        chars.unshift(isLower ? 'a' : 'A');
    }

    return chars.join('');
}

export function matchesSequencePattern(label: string, previousLabel: string): boolean {
    // Determine if `label` is the logical next step or same format as `previousLabel`
    // For simplicity, we check if they have the same type of suffix

    if (/^\d+$/.test(label) && /^\d+$/.test(previousLabel)) {
        // Both are purely numeric, maybe check if padding length is same?
        // Let's just say they match the pattern if both are numeric
        return true;
    }

    const m1 = label.match(/^([^0-9]*)(\d+)$/);
    const m2 = previousLabel.match(/^([^0-9]*)(\d+)$/);
    if (m1 && m2) {
        return m1[1] === m2[1]; // Same prefix before numbers
    }

    if (/^[a-zA-Z]+$/.test(label) && /^[a-zA-Z]+$/.test(previousLabel)) {
        return true;
    }

    return false;
}

export function decrementLabel(label: string): string | null {
    if (!label) return null;

    if (/^\d+$/.test(label)) {
        const num = parseInt(label, 10) - 1;
        if (num < 0) return null;
        const strNum = num.toString();
        if (label.startsWith('0') && strNum.length < label.length) {
            return strNum.padStart(label.length, '0');
        }
        return strNum;
    }

    const alphaNumMatch = label.match(/^([^0-9]*)(\d+)$/);
    if (alphaNumMatch) {
        const prefix = alphaNumMatch[1];
        const numPart = alphaNumMatch[2];
        const num = parseInt(numPart, 10) - 1;
        if (num < 0) return null;
        const strNum = num.toString();
        let paddedNum = strNum;
        if (numPart.startsWith('0') && strNum.length < numPart.length) {
            paddedNum = strNum.padStart(numPart.length, '0');
        }
        return prefix + paddedNum;
    }

    if (/^[a-zA-Z]+$/.test(label)) {
        return decrementAlphabetic(label);
    }

    return null;
}

function decrementAlphabetic(label: string): string | null {
    const chars = label.split('');
    let borrow = true;

    for (let i = chars.length - 1; i >= 0; i--) {
        if (!borrow) break;

        const charCode = chars[i].charCodeAt(0);
        const isLower = charCode >= 97 && charCode <= 122;
        const isUpper = charCode >= 65 && charCode <= 90;

        if (isLower) {
            if (charCode === 97) { // 'a'
                chars[i] = 'z';
                borrow = true;
            } else {
                chars[i] = String.fromCharCode(charCode - 1);
                borrow = false;
            }
        } else if (isUpper) {
            if (charCode === 65) { // 'A'
                chars[i] = 'Z';
                borrow = true;
            } else {
                chars[i] = String.fromCharCode(charCode - 1);
                borrow = false;
            }
        }
    }

    if (borrow) {
        if (chars.length > 1) {
            chars.shift();
        } else {
            return null;
        }
    }

    return chars.join('');
}
