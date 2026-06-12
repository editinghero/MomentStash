import { describe, it, expect } from 'vitest';
import { renderErrorPage } from './error-page';

describe('renderErrorPage', () => {
  it('should return a non-empty string', () => {
    const result = renderErrorPage();
    expect(typeof result).toBe('string');
    expect(result.length).toBeGreaterThan(0);
  });

  it('should contain expected HTML structure', () => {
    const result = renderErrorPage();

    // Check for doctype and basic HTML structure
    expect(result).toContain('<!doctype html>');
    expect(result).toContain('<html lang="en">');
    expect(result).toContain('<head>');
    expect(result).toContain('<body>');
    expect(result).toContain('</html>');
  });

  it('should contain key content elements', () => {
    const result = renderErrorPage();

    // Check for title and meta tags
    expect(result).toContain('<title>This page didn\'t load</title>');
    expect(result).toContain('<meta charset="utf-8" />');
    expect(result).toContain('<meta name="viewport" content="width=device-width, initial-scale=1" />');

    // Check for the main card container
    expect(result).toContain('<div class="card">');

    // Check for text content
    expect(result).toContain('<h1>This page didn\'t load</h1>');
    expect(result).toContain('Something went wrong on our end.');

    // Check for action buttons
    expect(result).toContain('<button class="primary" onclick="location.reload()">Try again</button>');
    expect(result).toContain('<a class="secondary" href="/">Go home</a>');
  });

  it('should include styling', () => {
    const result = renderErrorPage();
    expect(result).toContain('<style>');
    expect(result).toContain('.card { max-width: 28rem;');
  });
});
