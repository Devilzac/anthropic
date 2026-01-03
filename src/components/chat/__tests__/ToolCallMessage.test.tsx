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
      expect(screen.getByText("Creating App.jsx")).toBeInTheDocument();
    });

    it("formats str_replace command correctly", () => {
      render(
        <ToolCallMessage
          toolName="str_replace_editor"
          args={{ command: "str_replace", path: "/components/Button.tsx" }}
        />
      );
      expect(screen.getByText("Editing Button.tsx")).toBeInTheDocument();
    });

    it("formats insert command correctly", () => {
      render(
        <ToolCallMessage
          toolName="str_replace_editor"
          args={{ command: "insert", path: "/styles/main.css" }}
        />
      );
      expect(screen.getByText("Editing main.css")).toBeInTheDocument();
    });

    it("formats view command correctly", () => {
      render(
        <ToolCallMessage
          toolName="str_replace_editor"
          args={{ command: "view", path: "/README.md" }}
        />
      );
      expect(screen.getByText("Viewing README.md")).toBeInTheDocument();
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
      ).toBeInTheDocument();
    });

    it("handles unknown command", () => {
      render(
        <ToolCallMessage
          toolName="str_replace_editor"
          args={{ command: "unknown", path: "/test.js" }}
        />
      );
      expect(screen.getByText("Editing test.js")).toBeInTheDocument();
    });

    it("handles missing args", () => {
      render(<ToolCallMessage toolName="str_replace_editor" />);
      expect(screen.getByText("Editing file")).toBeInTheDocument();
    });

    it("handles missing path", () => {
      render(
        <ToolCallMessage
          toolName="str_replace_editor"
          args={{ command: "create" }}
        />
      );
      expect(screen.getByText("Creating file")).toBeInTheDocument();
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
      expect(screen.getByText("Creating Button.tsx")).toBeInTheDocument();
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
      expect(screen.getByText("Creating file.js")).toBeInTheDocument();
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
      expect(screen.getByText("Deleting old-file.js")).toBeInTheDocument();
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
      ).toBeInTheDocument();
    });

    it("formats rename command without new_path", () => {
      render(
        <ToolCallMessage
          toolName="file_manager"
          args={{ command: "rename", path: "/file.js" }}
        />
      );
      expect(screen.getByText("Renaming file.js")).toBeInTheDocument();
    });

    it("handles unknown command", () => {
      render(
        <ToolCallMessage
          toolName="file_manager"
          args={{ command: "unknown", path: "/test.js" }}
        />
      );
      expect(screen.getByText("Managing test.js")).toBeInTheDocument();
    });

    it("handles missing args", () => {
      render(<ToolCallMessage toolName="file_manager" />);
      expect(screen.getByText("Managing file")).toBeInTheDocument();
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
      expect(screen.getByText("Deleting Header.tsx")).toBeInTheDocument();
    });
  });

  describe("unknown tools", () => {
    it("displays the tool name as-is for unknown tools", () => {
      render(<ToolCallMessage toolName="unknown_tool" />);
      expect(screen.getByText("unknown_tool")).toBeInTheDocument();
    });

    it("ignores args for unknown tools", () => {
      render(
        <ToolCallMessage
          toolName="unknown_tool"
          args={{ command: "test", path: "/test.js" }}
        />
      );
      expect(screen.getByText("unknown_tool")).toBeInTheDocument();
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
      expect(span).toHaveClass("text-neutral-700");
    });
  });
});
