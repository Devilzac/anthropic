import { render, screen } from '@testing-library/react';
import { userEvent } from '@testing-library/user-event';
import { MainContent } from '../main-content';
import { describe, it, expect, vi } from 'vitest';

// Mock the child components
vi.mock('@/components/chat/ChatInterface', () => ({
  ChatInterface: () => <div data-testid="chat-interface">Chat</div>,
}));

vi.mock('@/components/editor/FileTree', () => ({
  FileTree: () => <div data-testid="file-tree">File Tree</div>,
}));

vi.mock('@/components/editor/CodeEditor', () => ({
  CodeEditor: () => <div data-testid="code-editor">Code Editor</div>,
}));

vi.mock('@/components/preview/PreviewFrame', () => ({
  PreviewFrame: () => <div data-testid="preview-frame">Preview Frame</div>,
}));

vi.mock('@/components/HeaderActions', () => ({
  HeaderActions: () => <div data-testid="header-actions">Header Actions</div>,
}));

describe('Toggle Buttons Functionality', () => {
  it('should toggle from preview to code when clicking Code button', async () => {
    const user = userEvent.setup();
    const { container } = render(<MainContent />);

    // Initially preview should be visible
    expect(screen.getByTestId('preview-frame')).toBeTruthy();
    expect(screen.queryByTestId('code-editor')).toBeFalsy();

    // Find and click the Code button
    const codeButtons = container.querySelectorAll('button[role="tab"]');
    const codeButton = Array.from(codeButtons).find(
      (btn) => btn.textContent === 'Code'
    );

    expect(codeButton).toBeTruthy();

    if (codeButton) {
      await user.click(codeButton);

      // After clicking, code editor should be visible
      expect(screen.getByTestId('code-editor')).toBeTruthy();
      expect(screen.getByTestId('file-tree')).toBeTruthy();
      expect(screen.queryByTestId('preview-frame')).toBeFalsy();
    }
  });

  it('should toggle from code back to preview when clicking Preview button', async () => {
    const user = userEvent.setup();
    const { container } = render(<MainContent />);

    // Find buttons
    const buttons = container.querySelectorAll('button[role="tab"]');
    const codeButton = Array.from(buttons).find(
      (btn) => btn.textContent === 'Code'
    );
    const previewButton = Array.from(buttons).find(
      (btn) => btn.textContent === 'Preview'
    );

    expect(codeButton).toBeTruthy();
    expect(previewButton).toBeTruthy();

    if (codeButton && previewButton) {
      // Switch to code
      await user.click(codeButton);
      expect(screen.getByTestId('code-editor')).toBeTruthy();

      // Switch back to preview
      await user.click(previewButton);
      expect(screen.getByTestId('preview-frame')).toBeTruthy();
      expect(screen.queryByTestId('code-editor')).toBeFalsy();
    }
  });

  it('should handle multiple rapid clicks correctly', async () => {
    const user = userEvent.setup();
    const { container } = render(<MainContent />);

    const buttons = container.querySelectorAll('button[role="tab"]');
    const codeButton = Array.from(buttons).find(
      (btn) => btn.textContent === 'Code'
    );
    const previewButton = Array.from(buttons).find(
      (btn) => btn.textContent === 'Preview'
    );

    if (codeButton && previewButton) {
      // Rapidly toggle between views
      await user.click(codeButton);
      await user.click(previewButton);
      await user.click(codeButton);
      await user.click(previewButton);
      await user.click(codeButton);

      // Should end up on code view
      expect(screen.getByTestId('code-editor')).toBeTruthy();
      expect(screen.queryByTestId('preview-frame')).toBeFalsy();
    }
  });

  it('should not break when clicking the same button multiple times', async () => {
    const user = userEvent.setup();
    const { container } = render(<MainContent />);

    const buttons = container.querySelectorAll('button[role="tab"]');
    const previewButton = Array.from(buttons).find(
      (btn) => btn.textContent === 'Preview'
    );

    if (previewButton) {
      // Click the already-active preview button multiple times
      await user.click(previewButton);
      await user.click(previewButton);
      await user.click(previewButton);

      // Should still show preview
      expect(screen.getByTestId('preview-frame')).toBeTruthy();
      expect(screen.queryByTestId('code-editor')).toBeFalsy();
    }
  });
});
