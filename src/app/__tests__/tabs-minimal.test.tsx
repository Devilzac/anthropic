import { render, screen } from '@testing-library/react';
import { userEvent } from '@testing-library/user-event';
import { useState } from 'react';
import { Tabs, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { describe, it, expect } from 'vitest';

function MinimalTabsComponent() {
  const [activeView, setActiveView] = useState<"preview" | "code">("preview");

  return (
    <div>
      <Tabs
        value={activeView}
        onValueChange={(v) => {
          console.log('onValueChange called with:', v);
          setActiveView(v as "preview" | "code");
        }}
      >
        <TabsList>
          <TabsTrigger value="preview">Preview</TabsTrigger>
          <TabsTrigger value="code">Code</TabsTrigger>
        </TabsList>
      </Tabs>

      <div data-testid="active-view">{activeView}</div>

      {activeView === "preview" ? (
        <div data-testid="preview-content">Preview Content</div>
      ) : (
        <div data-testid="code-content">Code Content</div>
      )}
    </div>
  );
}

describe('Minimal Tabs Test', () => {
  it('should change state when clicking Code button', async () => {
    const user = userEvent.setup();
    const { container } = render(<MinimalTabsComponent />);

    // Initially should show preview
    expect(screen.getByTestId('active-view').textContent).toBe('preview');
    expect(screen.getByTestId('preview-content')).toBeTruthy();

    // Find and click Code button
    const buttons = container.querySelectorAll('button[role="tab"]');
    const codeButton = Array.from(buttons).find(btn => btn.textContent === 'Code');

    console.log('Found buttons:', buttons.length);
    console.log('Code button:', codeButton);

    if (codeButton) {
      console.log('Code button attributes before click:', {
        'data-state': codeButton.getAttribute('data-state'),
        'aria-selected': codeButton.getAttribute('aria-selected')
      });

      await user.click(codeButton);

      console.log('Code button attributes after click:', {
        'data-state': codeButton.getAttribute('data-state'),
        'aria-selected': codeButton.getAttribute('aria-selected')
      });

      // Check if state changed
      const activeViewText = screen.getByTestId('active-view').textContent;
      console.log('Active view after click:', activeViewText);

      expect(activeViewText).toBe('code');
      expect(screen.getByTestId('code-content')).toBeTruthy();
    } else {
      throw new Error('Code button not found');
    }
  });
});
