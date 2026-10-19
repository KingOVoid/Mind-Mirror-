/**
 * Grades a submitted answer against a question's correct answer, handling
 * the shape differences between question types.
 */
export function gradeAnswer(type: string, correctAnswer: any, selectedAnswer: any): boolean {
  if (selectedAnswer === null || selectedAnswer === undefined) return false;

  switch (type) {
    case 'MULTIPLE_CHOICE':
      return String(selectedAnswer) === String(correctAnswer);

    case 'TRUE_FALSE':
      return Boolean(selectedAnswer) === Boolean(correctAnswer);

    case 'MULTIPLE_SELECT': {
      const correctSet = new Set((Array.isArray(correctAnswer) ? correctAnswer : []).map(String));
      const selectedSet = new Set((Array.isArray(selectedAnswer) ? selectedAnswer : []).map(String));
      if (correctSet.size !== selectedSet.size) return false;
      for (const v of correctSet) if (!selectedSet.has(v)) return false;
      return true;
    }

    case 'FILL_IN_BLANK': {
      const normalize = (s: any) => String(s).trim().toLowerCase().replace(/\s+/g, ' ');
      return normalize(selectedAnswer) === normalize(correctAnswer);
    }

    default:
      return false;
  }
}
