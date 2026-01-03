import { render, screen, fireEvent, waitFor } from '@testing-library/react';
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

describe('MainContent - Toggle Buttons', () => {
  it('should render with preview active by default', () => {
    render(<MainContent />);

    const previewButton = screen.getByRole('tab', { name: /preview/i });
    const codeButton = screen.getByRole('tab', { name: /code/i });

    expect(previewButton).toHaveAttribute('data-state', 'active');
    expect(codeButton).toHaveAttribute('data-state', 'inactive');
    expect(screen.getByTestId('preview-frame')).toBeInTheDocument();
  });

  it('should switch to code view when code button is clicked', async () => {
    render(<MainContent />);

    const codeButton = screen.getByRole('tab', { name: /code/i });

    fireEvent.click(codeButton);

    await waitFor(() => {
      expect(codeButton).toHaveAttribute('data-state', 'active');
      expect(screen.getByTestId('code-editor')).toBeInTheDocument();
      expect(screen.getByTestId('file-tree')).toBeInTheDocument();
    });
  });

  it('should switch back to preview view when preview button is clicked', async () => {
    render(<MainContent />);

    const codeButton = screen.getByRole('tab', { name: /code/i });
    const previewButton = screen.getByRole('tab', { name: /preview/i });

    // Switch to code
    fireEvent.click(codeButton);
    await waitFor(() => {
      expect(codeButton).toHaveAttribute('data-state', 'active');
    });

    // Switch back to preview
    fireEvent.click(previewButton);
    await waitFor(() => {
      expect(previewButton).toHaveAttribute('data-state', 'active');
      expect(screen.getByTestId('preview-frame')).toBeInTheDocument();
    });
  });

  it('should not cause issues when clicking the same tab multiple times', async () => {
    const consoleSpy = vi.spyOn(console, 'error').mockImplementation(() => {});

    render(<MainContent />);

    const previewButton = screen.getByRole('tab', { name: /preview/i });

    // Click the already active tab multiple times
    fireEvent.click(previewButton);
    fireEvent.click(previewButton);
    fireEvent.click(previewButton);

    await waitFor(() => {
      expect(previewButton).toHaveAttribute('data-state', 'active');
    });

    // No console errors should be logged
    expect(consoleSpy).not.toHaveBeenCalled();

    consoleSpy.mockRestore();
  });

  it('should toggle between views multiple times without issues', async () => {
    render(<MainContent />);

    const previewButton = screen.getByRole('tab', { name: /preview/i });
    const codeButton = screen.getByRole('tab', { name: /code/i });

    // Toggle multiple times
    for (let i = 0; i < 5; i++) {
      fireEvent.click(codeButton);
      await waitFor(() => {
        expect(codeButton).toHaveAttribute('data-state', 'active');
      });

      fireEvent.click(previewButton);
      await waitFor(() => {
        expect(previewButton).toHaveAttribute('data-state', 'active');
      });
    }

    // Should end on preview
    expect(previewButton).toHaveAttribute('data-state', 'active');
    expect(screen.getByTestId('preview-frame')).toBeInTheDocument();
  });
});
