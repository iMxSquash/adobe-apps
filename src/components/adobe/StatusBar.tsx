interface StatusBarProps {
  zoom: number;
  width?: number;
  height?: number;
}

export function StatusBar({ zoom, width, height }: StatusBarProps) {
  return (
    <>
      <span>{Math.round(zoom)}%</span>
      {width != null && height != null && (
        <span>
          {width} x {height} px
        </span>
      )}
    </>
  );
}
