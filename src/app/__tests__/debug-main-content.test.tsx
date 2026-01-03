import { render, screen, act } from '@testing-library/react';
import { userEvent } from '@testing-library/user-event';
import { MainContent } from '../main-content';
import { describe, it, expect, vi, beforeEach } from 'vitest';

// Mock the child components with detailed logging
vi.mock('@/components/chat/ChatInterface', () => ({
  ChatInterface: () => {
    console.log('ChatInterface rendered');
    return <div data-testid="chat-interface">Chat</div>;
  },
}));

vi.mock('@/components/editor/FileTree', () => ({
  FileTree: () => {
    console.log('FileTree rendered');
    return <div data-testid="file-tree">File Tree</div>;
  },
}));

vi.mock('@/components/editor/CodeEditor', () => ({
  CodeEditor: () => {
    console.log('CodeEditor rendered');
    return <div data-testid="code-editor">Code Editor</div>;
  },
}));

vi.mock('@/components/preview/PreviewFrame', () => ({
  PreviewFrame: () => {
    console.log('PreviewFrame rendered');
    return <div data-testid="preview-frame">Preview Frame</div>;
  },
}));

vi.mock('@/components/HeaderActions', () => ({
  HeaderActions: () => <div data-testid="header-actions">Header Actions</div>,
}));

describe('MainContent Debug Test', () => {
  beforeEach(() => {
    console.log('\n--- Test starting ---\n');
  });

  it('should debug toggle behavior step by step', async () => {
    const user = userEvent.setup();

    console.log('Step 1: Rendering MainContent');
    const { container, rerender } = render(<MainContent />);

    console.log('Step 2: Checking initial render');
    const previewFrame = screen.queryByTestId('preview-frame');
    const codeEditor = screen.queryByTestId('code-editor');
    console.log('Initial state - Preview visible:', !!previewFrame);
    console.log('Initial state - Code editor visible:', !!codeEditor);

    console.log('\nStep 3: Finding toggle buttons');
    const buttons = container.querySelectorAll('button[role="tab"]');
    console.log('Found', buttons.length, 'tab buttons');

    const previewButton = Array.from(buttons).find(btn => btn.textContent === 'Preview');
    const codeButton = Array.from(buttons).find(btn => btn.textContent === 'Code');

    console.log('Preview button found:', !!previewButton);
    console.log('Code button found:', !!codeButton);

    if (previewButton) {
      console.log('Preview button state:', previewButton.getAttribute('data-state'));
    }
    if (codeButton) {
      console.log('Code button state:', codeButton.getAttribute('data-state'));
    }

    console.log('\nStep 4: Clicking Code button');
    if (codeButton) {
      await act(async () => {
        await user.click(codeButton);
      });

      console.log('\nStep 5: Checking state after click');
      console.log('Code button state after click:', codeButton.getAttribute('data-state'));
      console.log('Preview button state after click:', previewButton?.getAttribute('data-state'));

      // Check what's actually rendered
      const previewFrameAfter = screen.queryByTestId('preview-frame');
      const codeEditorAfter = screen.queryByTestId('code-editor');
      console.log('After click - Preview visible:', !!previewFrameAfter);
      console.log('After click - Code editor visible:', !!codeEditorAfter);

      // This should be true if the toggle works
      expect(!!codeEditorAfter).toBe(true);
    }
  });
});
