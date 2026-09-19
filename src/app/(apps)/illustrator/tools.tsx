import type { ToolbarTool } from "@/components/adobe/Toolbar";

function ToolIcon({ path }: { path: string }) {
  return (
    <svg
      width="16"
      height="16"
      viewBox="0 0 16 16"
      fill="none"
      stroke="currentColor"
      aria-hidden="true"
    >
      <path d={path} />
    </svg>
  );
}

export const ILLUSTRATOR_TOOLS: ToolbarTool[] = [
  { id: "select", label: "Sélection", icon: <ToolIcon path="M3 1l9 7-4 1 2 5-2 1-2-5-3 3z" /> },
  {
    id: "direct-select",
    label: "Sélection directe",
    icon: <ToolIcon path="M3 1l9 7-4 1 2 5-2 1-2-5-3 3z M12 12h3v3h-3z" />,
  },
  { id: "pen", label: "Plume", icon: <ToolIcon path="M2 14l2-6 7-7 3 3-7 7zM4 8l3 3" /> },
  { id: "shape", label: "Forme", icon: <ToolIcon path="M2 2h12v12H2z" /> },
  { id: "type", label: "Texte", icon: <ToolIcon path="M3 3h10M8 3v10M6 13h4" /> },
];
