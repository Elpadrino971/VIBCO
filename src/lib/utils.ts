import { type ClassValue, clsx } from 'clsx';
import { twMerge } from 'tailwind-merge';

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

export function formatDate(date: Date | string): string {
  const d = typeof date === 'string' ? new Date(date) : date;
  return d.toLocaleDateString('fr-FR', {
    year: 'numeric',
    month: 'long',
    day: 'numeric',
  });
}

export function formatDateTime(date: Date | string): string {
  const d = typeof date === 'string' ? new Date(date) : date;
  return d.toLocaleString('fr-FR', {
    year: 'numeric',
    month: 'long',
    day: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
  });
}

export function truncate(str: string, length: number): string {
  if (str.length <= length) return str;
  return str.slice(0, length) + '...';
}

export function sleep(ms: number): Promise<void> {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

export function generateId(): string {
  return Math.random().toString(36).substring(2, 15) + Math.random().toString(36).substring(2, 15);
}

export function estimateReadingTime(text: string): number {
  const wordsPerMinute = 200;
  const words = text.split(/\s+/).length;
  return Math.ceil(words / wordsPerMinute);
}

export function calculateProjectComplexity(config: any): 'simple' | 'medium' | 'complex' | 'very-complex' {
  let score = 0;

  // Type de projet
  if (config.type === 'game') score += 3;
  else if (config.type === 'mobile-app') score += 2;
  else if (config.type === 'web-app') score += 2;
  else score += 1;

  // Features
  if (config.questionnaire.needsAuth) score += 1;
  if (config.questionnaire.needsPayment) score += 2;
  if (config.questionnaire.needsRealtime) score += 2;
  if (config.questionnaire.needsFileUpload) score += 1;

  // Nombre d'agents activés
  score += Math.floor(config.enabledAgents.length / 3);

  if (score <= 3) return 'simple';
  if (score <= 6) return 'medium';
  if (score <= 9) return 'complex';
  return 'very-complex';
}

export function estimateProjectTime(complexity: string): number {
  // Retourne le temps estimé en minutes
  switch (complexity) {
    case 'simple':
      return 30;
    case 'medium':
      return 60;
    case 'complex':
      return 120;
    case 'very-complex':
      return 240;
    default:
      return 60;
  }
}
