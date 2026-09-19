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

export const PHOTOSHOP_TOOLS: ToolbarTool[] = [
  {
    id: "move",
    label: "Déplacement",
    icon: <ToolIcon path="M8 1v14M1 8h14M8 1L5.5 3.5M8 1l2.5 2.5M8 15l-2.5-2.5M8 15l2.5-2.5" />,
  },
  { id: "lasso", label: "Lasso", icon: <ToolIcon path="M3 6c0-3 10-3 10 0s-6 5-8 5-2 3 0 4" /> },
  { id: "crop", label: "Recadrage", icon: <ToolIcon path="M4 1v11h11M1 4h11v11" /> },
  { id: "type", label: "Texte", icon: <ToolIcon path="M3 3h10M8 3v10M6 13h4" /> },
  {
    id: "hand",
    label: "Main",
    icon: (
      <ToolIcon path="M5 8V3.5a1 1 0 012 0V7m0-3.5a1 1 0 012 0V7m0-2.5a1 1 0 012 0V9c0 3-1.5 5-4 5S3 12 3 10V8.5a1 1 0 012 0" />
    ),
  },
];
