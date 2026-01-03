interface ToolCallMessageProps {
  toolName: string;
  args?: Record<string, unknown>;
}

export function ToolCallMessage({ toolName, args }: ToolCallMessageProps) {
  const message = formatToolCallMessage(toolName, args);
  return <span className="text-neutral-700">{message}</span>;
}

function formatToolCallMessage(
  toolName: string,
  args?: Record<string, unknown>
): string {
  if (toolName === "str_replace_editor") {
    return formatStrReplaceMessage(args);
  }

  if (toolName === "file_manager") {
    return formatFileManagerMessage(args);
  }

  return toolName;
}

function formatStrReplaceMessage(args?: Record<string, unknown>): string {
  if (!args) return "Editing file";

  const command = args.command as string | undefined;
  const path = args.path as string | undefined;
  const fileName = path ? getFileName(path) : "file";

  switch (command) {
    case "create":
      return `Creating ${fileName}`;
    case "str_replace":
      return `Editing ${fileName}`;
    case "insert":
      return `Editing ${fileName}`;
    case "view":
      return `Viewing ${fileName}`;
    case "undo_edit":
      return `Reverting changes to ${fileName}`;
    default:
      return `Editing ${fileName}`;
  }
}

function formatFileManagerMessage(args?: Record<string, unknown>): string {
  if (!args) return "Managing file";

  const command = args.command as string | undefined;
  const path = args.path as string | undefined;
  const newPath = args.new_path as string | undefined;
  const fileName = path ? getFileName(path) : "file";

  switch (command) {
    case "delete":
      return `Deleting ${fileName}`;
    case "rename":
      if (newPath) {
        const newFileName = getFileName(newPath);
        return `Renaming ${fileName} to ${newFileName}`;
      }
      return `Renaming ${fileName}`;
    default:
      return `Managing ${fileName}`;
  }
}

function getFileName(path: string): string {
  const normalized = path.replace(/\\/g, "/");
  const segments = normalized.split("/");
  return segments[segments.length - 1] || path;
}
