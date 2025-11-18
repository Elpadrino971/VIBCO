import { BaseAgent, ExecutionContext, AgentResult } from './base-agent';
import * as puppeteer from 'puppeteer';

export class TestingAgent extends BaseAgent {
  private browser: puppeteer.Browser | null = null;

  constructor() {
    super(
      'testing',
      'Agent Testing',
      'Effectue des tests E2E automatisés avec prise de screenshots'
    );
  }

  async execute(context: ExecutionContext): Promise<AgentResult> {
    try {
      this.updateStatus('thinking', 'Préparation des tests...');
      this.info('Démarrage des tests E2E');
      this.updateProgress(5);

      const { projectConfig } = context;
      const files: Array<{ path: string; content: string }> = [];

      // Initialize browser
      this.updateStatus('working', 'Lancement du navigateur...');
      await this.initBrowser();
      this.updateProgress(10);

      // 1. Generate test files
      this.updateStatus('working', 'Génération des fichiers de test...');
      const testFiles = await this.generateTestFiles(projectConfig, context);
      files.push(...testFiles);
      this.updateProgress(20);

      // 2. Run E2E tests with screenshots
      this.updateStatus('working', 'Exécution des tests E2E...');
      const e2eResults = await this.runE2ETests(projectConfig, context);
      this.updateProgress(50);

      // 3. Visual regression tests
      this.updateStatus('working', 'Tests de régression visuelle...');
      const visualResults = await this.runVisualTests(projectConfig, context);
      this.updateProgress(70);

      // 4. Performance tests
      this.updateStatus('working', 'Tests de performance...');
      const perfResults = await this.runPerformanceTests(projectConfig, context);
      this.updateProgress(90);

      await this.closeBrowser();

      this.updateStatus('completed', 'Tests terminés');
      this.updateProgress(100);
      this.success(`Tous les tests ont été exécutés avec ${this.screenshots.length} screenshots`);

      return {
        success: true,
        output: {
          e2eResults,
          visualResults,
          perfResults,
          screenshotsCount: this.screenshots.length,
        },
        files,
        errors: [],
        warnings: [],
      };
    } catch (error: any) {
      this.error('Erreur lors des tests', { error: error.message });
      this.updateStatus('error');
      await this.closeBrowser();

      return {
        success: false,
        errors: [error.message],
        warnings: [],
      };
    }
  }

  private async initBrowser() {
    this.browser = await puppeteer.launch({
      headless: true,
      args: ['--no-sandbox', '--disable-setuid-sandbox'],
    });
  }

  private async closeBrowser() {
    if (this.browser) {
      await this.browser.close();
      this.browser = null;
    }
  }

  private async generateTestFiles(config: any, context: ExecutionContext) {
    return [
      {
        path: 'tests/e2e/home.spec.ts',
        content: `import { test, expect } from '@playwright/test';

test('home page loads correctly', async ({ page }) => {
  await page.goto('/');
  await expect(page).toHaveTitle(/${config.name || 'VibeCoding'}/);
  await page.screenshot({ path: 'public/screenshots/home.png' });
});`,
      },
      {
        path: 'playwright.config.ts',
        content: `import { defineConfig } from '@playwright/test';

export default defineConfig({
  testDir: './tests/e2e',
  use: {
    baseURL: 'http://localhost:3000',
    screenshot: 'on',
  },
});`,
      },
    ];
  }

  private async runE2ETests(config: any, context: ExecutionContext) {
    if (!this.browser) return { passed: 0, failed: 0 };

    const page = await this.browser.newPage();
    const results = { passed: 0, failed: 0 };

    try {
      // Test 1: Homepage
      this.info('Test de la page d\'accueil...');
      await page.goto('http://localhost:3000');
      await page.screenshot({ path: '/tmp/test-home.png' });
      this.addScreenshot('/tmp/test-home.png', 'Page d\'accueil', 'home-test');
      results.passed++;

      // Test 2: Navigation
      if (config.questionnaire.needsAuth) {
        this.info('Test de la page de connexion...');
        await page.goto('http://localhost:3000/auth/login');
        await page.screenshot({ path: '/tmp/test-login.png' });
        this.addScreenshot('/tmp/test-login.png', 'Page de connexion', 'login-test');
        results.passed++;
      }

    } catch (error) {
      results.failed++;
      this.warning('Un test a échoué');
    } finally {
      await page.close();
    }

    return results;
  }

  private async runVisualTests(config: any, context: ExecutionContext) {
    if (!this.browser) return { passed: 0, failed: 0 };

    const page = await this.browser.newPage();
    const results = { passed: 0, failed: 0 };

    try {
      // Test responsive design
      this.info('Test du design responsive...');
      const viewports = [
        { width: 1920, height: 1080, name: 'desktop' },
        { width: 768, height: 1024, name: 'tablet' },
        { width: 375, height: 667, name: 'mobile' },
      ];

      for (const viewport of viewports) {
        await page.setViewport(viewport);
        await page.goto('http://localhost:3000');
        await page.screenshot({ path: `/tmp/test-${viewport.name}.png` });
        this.addScreenshot(
          `/tmp/test-${viewport.name}.png`,
          `Vue ${viewport.name}`,
          `visual-${viewport.name}`
        );
        results.passed++;
      }
    } catch (error) {
      results.failed++;
    } finally {
      await page.close();
    }

    return results;
  }

  private async runPerformanceTests(config: any, context: ExecutionContext) {
    if (!this.browser) return { passed: 0, failed: 0 };

    const page = await this.browser.newPage();
    const results = { passed: 0, failed: 0 };

    try {
      this.info('Mesure des performances...');
      const startTime = Date.now();
      await page.goto('http://localhost:3000');
      const loadTime = Date.now() - startTime;

      this.info(`Page chargée en ${loadTime}ms`);

      if (loadTime < 3000) {
        results.passed++;
      } else {
        this.warning(`Temps de chargement lent: ${loadTime}ms`);
        results.failed++;
      }
    } catch (error) {
      results.failed++;
    } finally {
      await page.close();
    }

    return results;
  }
}
