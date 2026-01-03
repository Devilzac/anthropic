import { render, screen, fireEvent } from '@testing-library/react';
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

describe('Direct Click Test', () => {
  it('should toggle with fireEvent.click', () => {
    const { container } = render(<MainContent />);

    // Find Code button
    const buttons = container.querySelectorAll('button[role="tab"]');
    const codeButton = Array.from(buttons).find(btn => btn.textContent === 'Code') as HTMLButtonElement;

    expect(codeButton).toBeTruthy();

    console.log('Before click:', codeButton.getAttribute('data-state'));

    // Try fireEvent.click
    fireEvent.click(codeButton);

    console.log('After fireEvent.click:', codeButton.getAttribute('data-state'));

    const codeEditorAfter = screen.queryByTestId('code-editor');
    console.log('Code editor visible:', !!codeEditorAfter);

    expect(!!codeEditorAfter).toBe(true);
  });

  it('should toggle with mouseDown event', () => {
    const { container } = render(<MainContent />);

    const buttons = container.querySelectorAll('button[role="tab"]');
    const codeButton = Array.from(buttons).find(btn => btn.textContent === 'Code') as HTMLButtonElement;

    console.log('\nBefore mouseDown:', codeButton.getAttribute('data-state'));

    // Radix UI tabs respond to mouseDown
    fireEvent.mouseDown(codeButton);

    console.log('After mouseDown:', codeButton.getAttribute('data-state'));

    const codeEditorAfter = screen.queryByTestId('code-editor');
    console.log('Code editor visible:', !!codeEditorAfter);

    expect(!!codeEditorAfter).toBe(true);
  });
});
