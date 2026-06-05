export function slugify(text: string): string {
  return text
    .toLowerCase()
    .normalize('NFD')
    .replace(/[̀-ͯ]/g, '')
    .replace(/[^a-z0-9\s-]/g, '')
    .trim()
    .replace(/\s+/g, '-')
    .replace(/-+/g, '-')
}

export function randomId(length = 6): string {
  return Math.random().toString(36).slice(2, 2 + length)
}

export const SURVEY_TYPE_LABELS: Record<string, string> = {
  CSAT: 'Satisfação (CSAT)',
  NPS: 'Net Promoter Score (NPS)',
  CES: 'Esforço do Cliente (CES)',
  TEXTO_LIVRE: 'Texto Livre',
  MULTIPLA_ESCOLHA: 'Múltipla Escolha',
  SIM_NAO: 'Sim / Não',
  CHECKBOX: 'Checkbox',
  ESCALA: 'Escala Numérica',
  EMOJI: 'Emojis',
}

export const SURVEY_STATUS_LABELS: Record<string, string> = {
  RASCUNHO: 'Rascunho',
  ATIVA: 'Ativa',
  PAUSADA: 'Pausada',
  ENCERRADA: 'Encerrada',
}

export const SURVEY_STATUS_COLORS: Record<string, string> = {
  RASCUNHO: 'bg-gray-100 text-gray-600',
  ATIVA: 'bg-green-100 text-green-700',
  PAUSADA: 'bg-yellow-100 text-yellow-700',
  ENCERRADA: 'bg-red-100 text-red-700',
}

export const DEFAULT_QUESTION_SETTINGS: Record<string, object> = {
  CSAT: { scale: 5, labels: { 1: 'Péssimo', 5: 'Ótimo' } },
  NPS: { scale: 10, labels: { low: 'Não recomendaria', high: 'Recomendaria' } },
  CES: { scale: 7, labels: { low: 'Muito difícil', high: 'Muito fácil' } },
  TEXTO_LIVRE: { placeholder: 'Digite sua resposta...', maxLength: 500 },
  MULTIPLA_ESCOLHA: { options: ['Opção 1', 'Opção 2'], allowOther: false },
  SIM_NAO: { labelSim: 'Sim', labelNao: 'Não' },
  CHECKBOX: { options: ['Opção 1', 'Opção 2'], minSelections: 0, maxSelections: 0 },
  ESCALA: { min: 1, max: 10, step: 1, minLabel: 'Péssimo', maxLabel: 'Ótimo' },
  EMOJI: { options: [{ emoji: '😠', label: 'Péssimo' }, { emoji: '😐', label: 'Regular' }, { emoji: '😊', label: 'Bom' }, { emoji: '😍', label: 'Ótimo' }] },
}
