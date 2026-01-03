import { describe, it, expect } from "vitest";
import { render, screen } from "@testing-library/react";
import { ToolCallMessage } from "../ToolCallMessage";

describe("ToolCallMessage", () => {
  describe("str_replace_editor tool", () => {
    it("formats create command correctly", () => {
      render(
        <ToolCallMessage
          toolName="str_replace_editor"
          args={{ command: "create", path: "/App.jsx" }}
        />
      );
      expect(screen.getByText("Creating App.jsx")).toBeDefined();
    });

    it("formats str_replace command correctly", () => {
      render(
        <ToolCallMessage
          toolName="str_replace_editor"
          args={{ command: "str_replace", path: "/components/Button.tsx" }}
        />
      );
      expect(screen.getByText("Editing Button.tsx")).toBeDefined();
    });

    it("formats insert command correctly", () => {
      render(
        <ToolCallMessage
          toolName="str_replace_editor"
          args={{ command: "insert", path: "/styles/main.css" }}
        />
      );
      expect(screen.getByText("Editing main.css")).toBeDefined();
    });

    it("formats view command correctly", () => {
      render(
        <ToolCallMessage
          toolName="str_replace_editor"
          args={{ command: "view", path: "/README.md" }}
        />
      );
      expect(screen.getByText("Viewing README.md")).toBeDefined();
    });

    it("formats undo_edit command correctly", () => {
      render(
        <ToolCallMessage
          toolName="str_replace_editor"
          args={{ command: "undo_edit", path: "/config.json" }}
        />
      );
      expect(
        screen.getByText("Reverting changes to config.json")
      ).toBeDefined();
    });

    it("handles unknown command", () => {
      render(
        <ToolCallMessage
          toolName="str_replace_editor"
          args={{ command: "unknown", path: "/test.js" }}
        />
      );
      expect(screen.getByText("Editing test.js")).toBeDefined();
    });

    it("handles missing args", () => {
      render(<ToolCallMessage toolName="str_replace_editor" />);
      expect(screen.getByText("Editing file")).toBeDefined();
    });

    it("handles missing path", () => {
      render(
        <ToolCallMessage
          toolName="str_replace_editor"
          args={{ command: "create" }}
        />
      );
      expect(screen.getByText("Creating file")).toBeDefined();
    });

    it("extracts filename from nested path", () => {
      render(
        <ToolCallMessage
          toolName="str_replace_editor"
          args={{
            command: "create",
            path: "/src/components/ui/Button.tsx",
          }}
        />
      );
      expect(screen.getByText("Creating Button.tsx")).toBeDefined();
    });

    it("handles Windows-style paths", () => {
      render(
        <ToolCallMessage
          toolName="str_replace_editor"
          args={{
            command: "create",
            path: "C:\\Users\\test\\file.js",
          }}
        />
      );
      expect(screen.getByText("Creating file.js")).toBeDefined();
    });
  });

  describe("file_manager tool", () => {
    it("formats delete command correctly", () => {
      render(
        <ToolCallMessage
          toolName="file_manager"
          args={{ command: "delete", path: "/old-file.js" }}
        />
      );
      expect(screen.getByText("Deleting old-file.js")).toBeDefined();
    });

    it("formats rename command with new_path", () => {
      render(
        <ToolCallMessage
          toolName="file_manager"
          args={{
            command: "rename",
            path: "/old-name.ts",
            new_path: "/new-name.ts",
          }}
        />
      );
      expect(
        screen.getByText("Renaming old-name.ts to new-name.ts")
      ).toBeDefined();
    });

    it("formats rename command without new_path", () => {
      render(
        <ToolCallMessage
          toolName="file_manager"
          args={{ command: "rename", path: "/file.js" }}
        />
      );
      expect(screen.getByText("Renaming file.js")).toBeDefined();
    });

    it("handles unknown command", () => {
      render(
        <ToolCallMessage
          toolName="file_manager"
          args={{ command: "unknown", path: "/test.js" }}
        />
      );
      expect(screen.getByText("Managing test.js")).toBeDefined();
    });

    it("handles missing args", () => {
      render(<ToolCallMessage toolName="file_manager" />);
      expect(screen.getByText("Managing file")).toBeDefined();
    });

    it("extracts filename from path with directories", () => {
      render(
        <ToolCallMessage
          toolName="file_manager"
          args={{
            command: "delete",
            path: "/src/components/Header.tsx",
          }}
        />
      );
      expect(screen.getByText("Deleting Header.tsx")).toBeDefined();
    });
  });

  describe("unknown tools", () => {
    it("displays the tool name as-is for unknown tools", () => {
      render(<ToolCallMessage toolName="unknown_tool" />);
      expect(screen.getByText("unknown_tool")).toBeDefined();
    });

    it("ignores args for unknown tools", () => {
      const { container } = render(
        <ToolCallMessage
          toolName="unknown_tool"
          args={{ command: "test", path: "/test.js" }}
        />
      );
      expect(container.textContent).toContain("unknown_tool");
    });
  });

  describe("styling", () => {
    it("applies correct CSS classes", () => {
      const { container } = render(
        <ToolCallMessage
          toolName="str_replace_editor"
          args={{ command: "create", path: "/App.jsx" }}
        />
      );
      const span = container.querySelector("span");
      expect(span?.className).toContain("text-neutral-700");
    });
  });
});
