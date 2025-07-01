
export interface PasswordStrength {
  score: number; // 0-4 (weak to very strong)
  feedback: string[];
  isValid: boolean;
}

export class PasswordService {
  private static readonly MIN_LENGTH = 12;
  private static readonly MIN_SCORE = 3;

  static validatePassword(password: string): PasswordStrength {
    const feedback: string[] = [];
    let score = 0;

    // Length check
    if (password.length < this.MIN_LENGTH) {
      feedback.push(`Password must be at least ${this.MIN_LENGTH} characters long`);
    } else {
      score += 1;
    }

    // Character variety checks
    const hasLowercase = /[a-z]/.test(password);
    const hasUppercase = /[A-Z]/.test(password);
    const hasNumbers = /\d/.test(password);
    const hasSpecialChars = /[!@#$%^&*()_+\-=\[\]{};':"\\|,.<>\/?]/.test(password);

    if (!hasLowercase) feedback.push('Include lowercase letters');
    if (!hasUppercase) feedback.push('Include uppercase letters');
    if (!hasNumbers) feedback.push('Include numbers');
    if (!hasSpecialChars) feedback.push('Include special characters');

    // Score based on character variety
    const varietyCount = [hasLowercase, hasUppercase, hasNumbers, hasSpecialChars].filter(Boolean).length;
    score += Math.min(varietyCount, 3);

    // Common patterns check
    const commonPatterns = [
      /123/,
      /abc/i,
      /password/i,
      /qwerty/i,
      /admin/i,
      /(\w)\1{2,}/i, // Repeated characters
    ];

    const hasCommonPattern = commonPatterns.some(pattern => pattern.test(password));
    if (hasCommonPattern) {
      feedback.push('Avoid common patterns and repeated characters');
      score = Math.max(0, score - 1);
    }

    // Sequential characters check
    if (this.hasSequentialChars(password)) {
      feedback.push('Avoid sequential characters');
      score = Math.max(0, score - 1);
    }

    const isValid = score >= this.MIN_SCORE && password.length >= this.MIN_LENGTH;

    return {
      score: Math.min(score, 4),
      feedback,
      isValid
    };
  }

  private static hasSequentialChars(password: string): boolean {
    for (let i = 0; i < password.length - 2; i++) {
      const char1 = password.charCodeAt(i);
      const char2 = password.charCodeAt(i + 1);
      const char3 = password.charCodeAt(i + 2);
      
      if (char2 === char1 + 1 && char3 === char2 + 1) {
        return true;
      }
    }
    return false;
  }

  static getStrengthLabel(score: number): string {
    switch (score) {
      case 0: return 'Very Weak';
      case 1: return 'Weak';
      case 2: return 'Fair';
      case 3: return 'Good';
      case 4: return 'Very Strong';
      default: return 'Unknown';
    }
  }

  static getStrengthColor(score: number): string {
    switch (score) {
      case 0: return 'bg-red-500';
      case 1: return 'bg-red-400';
      case 2: return 'bg-yellow-500';
      case 3: return 'bg-blue-500';
      case 4: return 'bg-green-500';
      default: return 'bg-gray-300';
    }
  }
}
