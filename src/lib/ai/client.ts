import OpenAI from 'openai';
import Anthropic from '@anthropic-ai/sdk';

export interface AIMessage {
  role: 'system' | 'user' | 'assistant';
  content: string;
}

export interface AIGenerationOptions {
  model?: string;
  temperature?: number;
  maxTokens?: number;
  stream?: boolean;
}

export interface AIGenerationResult {
  content: string;
  usage: {
    promptTokens: number;
    completionTokens: number;
    totalTokens: number;
  };
  model: string;
  finishReason: string;
}

/**
 * Client IA unifié qui supporte OpenAI et Anthropic
 * Utilise la meilleure IA selon le type de tâche
 */
export class AIClient {
  private openai: OpenAI | null = null;
  private anthropic: Anthropic | null = null;
  private provider: 'openai' | 'anthropic' | 'both';

  constructor(config: {
    openaiApiKey?: string;
    anthropicApiKey?: string;
    defaultProvider?: 'openai' | 'anthropic' | 'both';
  }) {
    if (config.openaiApiKey) {
      this.openai = new OpenAI({
        apiKey: config.openaiApiKey,
      });
    }

    if (config.anthropicApiKey) {
      this.anthropic = new Anthropic({
        apiKey: config.anthropicApiKey,
      });
    }

    this.provider = config.defaultProvider || 'both';

    if (!this.openai && !this.anthropic) {
      throw new Error('Au moins une clé API (OpenAI ou Anthropic) est requise');
    }
  }

  /**
   * Génère du code avec le meilleur modèle disponible
   */
  async generateCode(
    prompt: string,
    context: AIMessage[] = [],
    options: AIGenerationOptions = {}
  ): Promise<AIGenerationResult> {
    // OpenAI est excellent pour la génération de code
    if (this.openai && (this.provider === 'openai' || this.provider === 'both')) {
      return this.generateWithOpenAI(prompt, context, {
        model: options.model || 'gpt-4-turbo-preview',
        temperature: options.temperature ?? 0.3, // Plus créatif pour le code
        maxTokens: options.maxTokens || 4096,
        ...options,
      });
    }

    // Fallback sur Anthropic
    if (this.anthropic) {
      return this.generateWithAnthropic(prompt, context, {
        model: options.model || 'claude-3-5-sonnet-20241022',
        temperature: options.temperature ?? 0.3,
        maxTokens: options.maxTokens || 4096,
        ...options,
      });
    }

    throw new Error('Aucun provider IA disponible');
  }

  /**
   * Revue de code avec Claude (excellent pour l'analyse)
   */
  async reviewCode(
    code: string,
    context: string,
    options: AIGenerationOptions = {}
  ): Promise<AIGenerationResult> {
    const prompt = `Tu es un expert en revue de code. Analyse ce code et fournis des suggestions d'amélioration.

Contexte: ${context}

Code à analyser:
\`\`\`
${code}
\`\`\`

Fournis:
1. Points forts
2. Problèmes potentiels (bugs, sécurité, performance)
3. Suggestions d'amélioration
4. Score de qualité /10`;

    // Claude est excellent pour la revue de code
    if (this.anthropic && (this.provider === 'anthropic' || this.provider === 'both')) {
      return this.generateWithAnthropic(prompt, [], {
        model: options.model || 'claude-3-5-sonnet-20241022',
        temperature: options.temperature ?? 0.2, // Plus précis pour la revue
        maxTokens: options.maxTokens || 2048,
        ...options,
      });
    }

    // Fallback sur OpenAI
    if (this.openai) {
      return this.generateWithOpenAI(prompt, [], {
        model: options.model || 'gpt-4-turbo-preview',
        temperature: options.temperature ?? 0.2,
        maxTokens: options.maxTokens || 2048,
        ...options,
      });
    }

    throw new Error('Aucun provider IA disponible');
  }

  /**
   * Génération avec OpenAI
   */
  private async generateWithOpenAI(
    prompt: string,
    context: AIMessage[] = [],
    options: AIGenerationOptions = {}
  ): Promise<AIGenerationResult> {
    if (!this.openai) {
      throw new Error('OpenAI client non initialisé');
    }

    const messages: OpenAI.Chat.ChatCompletionMessageParam[] = [
      ...context.map((msg) => ({
        role: msg.role as 'system' | 'user' | 'assistant',
        content: msg.content,
      })),
      {
        role: 'user' as const,
        content: prompt,
      },
    ];

    const response = await this.openai.chat.completions.create({
      model: options.model || 'gpt-4-turbo-preview',
      messages,
      temperature: options.temperature ?? 0.7,
      max_tokens: options.maxTokens || 2048,
      stream: false,
    });

    const choice = response.choices[0];
    const usage = response.usage;

    return {
      content: choice.message.content || '',
      usage: {
        promptTokens: usage?.prompt_tokens || 0,
        completionTokens: usage?.completion_tokens || 0,
        totalTokens: usage?.total_tokens || 0,
      },
      model: response.model,
      finishReason: choice.finish_reason,
    };
  }

  /**
   * Génération avec Anthropic Claude
   */
  private async generateWithAnthropic(
    prompt: string,
    context: AIMessage[] = [],
    options: AIGenerationOptions = {}
  ): Promise<AIGenerationResult> {
    if (!this.anthropic) {
      throw new Error('Anthropic client non initialisé');
    }

    // Séparer le message system des autres
    const systemMessage = context.find((msg) => msg.role === 'system');
    const conversationMessages = context
      .filter((msg) => msg.role !== 'system')
      .map((msg) => ({
        role: msg.role as 'user' | 'assistant',
        content: msg.content,
      }));

    const response = await this.anthropic.messages.create({
      model: options.model || 'claude-3-5-sonnet-20241022',
      max_tokens: options.maxTokens || 2048,
      temperature: options.temperature ?? 0.7,
      system: systemMessage?.content,
      messages: [
        ...conversationMessages,
        {
          role: 'user',
          content: prompt,
        },
      ],
    });

    const textContent = response.content.find((block) => block.type === 'text');

    return {
      content: textContent?.type === 'text' ? textContent.text : '',
      usage: {
        promptTokens: response.usage.input_tokens,
        completionTokens: response.usage.output_tokens,
        totalTokens: response.usage.input_tokens + response.usage.output_tokens,
      },
      model: response.model,
      finishReason: response.stop_reason || 'end_turn',
    };
  }

  /**
   * Génération hybride: utilise les deux IA et combine les résultats
   * Parfait pour les tâches critiques
   */
  async generateHybrid(
    prompt: string,
    context: AIMessage[] = [],
    options: AIGenerationOptions = {}
  ): Promise<{
    openai: AIGenerationResult | null;
    anthropic: AIGenerationResult | null;
    combined: string;
  }> {
    const results = await Promise.allSettled([
      this.openai ? this.generateWithOpenAI(prompt, context, options) : null,
      this.anthropic ? this.generateWithAnthropic(prompt, context, options) : null,
    ]);

    const openaiResult =
      results[0].status === 'fulfilled' ? results[0].value : null;
    const anthropicResult =
      results[1].status === 'fulfilled' ? results[1].value : null;

    // Combiner les résultats intelligemment
    let combined = '';
    if (openaiResult && anthropicResult) {
      combined = `=== OpenAI GPT-4 ===\n${openaiResult.content}\n\n=== Anthropic Claude ===\n${anthropicResult.content}`;
    } else if (openaiResult) {
      combined = openaiResult.content;
    } else if (anthropicResult) {
      combined = anthropicResult.content;
    }

    return {
      openai: openaiResult,
      anthropic: anthropicResult,
      combined,
    };
  }

  /**
   * Stream de génération (pour UX en temps réel)
   */
  async *streamGeneration(
    prompt: string,
    context: AIMessage[] = [],
    options: AIGenerationOptions = {}
  ): AsyncGenerator<string, void, unknown> {
    if (this.openai && (this.provider === 'openai' || this.provider === 'both')) {
      yield* this.streamWithOpenAI(prompt, context, options);
    } else if (this.anthropic) {
      yield* this.streamWithAnthropic(prompt, context, options);
    } else {
      throw new Error('Aucun provider IA disponible');
    }
  }

  private async *streamWithOpenAI(
    prompt: string,
    context: AIMessage[] = [],
    options: AIGenerationOptions = {}
  ): AsyncGenerator<string, void, unknown> {
    if (!this.openai) return;

    const messages: OpenAI.Chat.ChatCompletionMessageParam[] = [
      ...context.map((msg) => ({
        role: msg.role as 'system' | 'user' | 'assistant',
        content: msg.content,
      })),
      {
        role: 'user' as const,
        content: prompt,
      },
    ];

    const stream = await this.openai.chat.completions.create({
      model: options.model || 'gpt-4-turbo-preview',
      messages,
      temperature: options.temperature ?? 0.7,
      max_tokens: options.maxTokens || 2048,
      stream: true,
    });

    for await (const chunk of stream) {
      const content = chunk.choices[0]?.delta?.content;
      if (content) {
        yield content;
      }
    }
  }

  private async *streamWithAnthropic(
    prompt: string,
    context: AIMessage[] = [],
    options: AIGenerationOptions = {}
  ): AsyncGenerator<string, void, unknown> {
    if (!this.anthropic) return;

    const systemMessage = context.find((msg) => msg.role === 'system');
    const conversationMessages = context
      .filter((msg) => msg.role !== 'system')
      .map((msg) => ({
        role: msg.role as 'user' | 'assistant',
        content: msg.content,
      }));

    const stream = await this.anthropic.messages.stream({
      model: options.model || 'claude-3-5-sonnet-20241022',
      max_tokens: options.maxTokens || 2048,
      temperature: options.temperature ?? 0.7,
      system: systemMessage?.content,
      messages: [
        ...conversationMessages,
        {
          role: 'user',
          content: prompt,
        },
      ],
    });

    for await (const chunk of stream) {
      if (
        chunk.type === 'content_block_delta' &&
        chunk.delta.type === 'text_delta'
      ) {
        yield chunk.delta.text;
      }
    }
  }
}

/**
 * Instance singleton du client IA
 */
let aiClientInstance: AIClient | null = null;

export function getAIClient(): AIClient {
  if (!aiClientInstance) {
    aiClientInstance = new AIClient({
      openaiApiKey: process.env.OPENAI_API_KEY,
      anthropicApiKey: process.env.ANTHROPIC_API_KEY,
      defaultProvider: (process.env.AI_PROVIDER as 'openai' | 'anthropic' | 'both') || 'both',
    });
  }
  return aiClientInstance;
}

/**
 * Helper: initialiser le client avec des clés custom
 */
export function initAIClient(config: {
  openaiApiKey?: string;
  anthropicApiKey?: string;
  defaultProvider?: 'openai' | 'anthropic' | 'both';
}): AIClient {
  aiClientInstance = new AIClient(config);
  return aiClientInstance;
}
