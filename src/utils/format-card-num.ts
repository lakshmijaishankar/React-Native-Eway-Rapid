export const formatCardNumber = (raw: string, gaps: number[] = []) => {
  const digits = raw.replace(/\D/g, '');
  let result = '';
  for (let i = 0; i < digits.length; i++) {
    result += digits[i];
    if (gaps.includes(i + 1)) {
      result += ' ';
    }
  }
  return result.trim();
};
