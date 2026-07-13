export function getMidpoint(prev, next) {
  const minChar = 'a';
  const maxChar = 'z';

  if (!prev) {
    if (!next) {
      return 'm';
    }
    // Find something before next
    let i = 0;
    while (i < next.length && next[i] === minChar) {
      i++;
    }
    if (i === next.length) {
      return next + minChar; 
    }
    const charCode = next.charCodeAt(i);
    const midCharCode = Math.floor((minChar.charCodeAt(0) + charCode) / 2);
    return next.slice(0, i) + String.fromCharCode(midCharCode);
  }

  if (!next) {
    // Find something after prev
    const lastChar = prev[prev.length - 1];
    if (lastChar < maxChar) {
      const nextChar = String.fromCharCode(lastChar.charCodeAt(0) + 1);
      return prev.slice(0, -1) + nextChar;
    }
    return prev + 'm';
  }

  // Find the first index where they differ
  let i = 0;
  while (i < prev.length && i < next.length && prev[i] === next[i]) {
    i++;
  }

  // Check if prev is a prefix of next
  if (i === prev.length) {
    const nextChar = next[i];
    if (nextChar > minChar) {
      const pCode = minChar.charCodeAt(0);
      const nCode = nextChar.charCodeAt(0);
      if (nCode - pCode > 1) {
        const midCode = Math.floor((pCode + nCode) / 2);
        return prev + String.fromCharCode(midCode);
      } else {
        return prev + minChar;
      }
    } else {
      return prev + minChar + 'm';
    }
  }

  // Normal case: they differ at index i
  const pCode = prev.charCodeAt(i);
  const nCode = next.charCodeAt(i);

  if (nCode - pCode > 1) {
    const midCode = Math.floor((pCode + nCode) / 2);
    return prev.slice(0, i) + String.fromCharCode(midCode);
  } else {
    return prev + 'm';
  }
}
