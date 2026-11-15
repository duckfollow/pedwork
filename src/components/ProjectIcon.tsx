import Image from "next/image";
import { AudioLines } from "lucide-react";

export default function ProjectIcon({ id, size, className }: {
  id: string;
  size: number;
  className?: string;
}) {
  if (id === "lyla") {
    return (
      <span
        className={className}
        aria-hidden="true"
        style={{
          display: "inline-grid", placeItems: "center", flexShrink: 0,
          width: size, height: size, borderRadius: size / 4,
          color: "#ffb55e", background: "#37241a",
        }}
      >
        <AudioLines size={Math.round(size / 2)} />
      </span>
    );
  }

  return <Image src={`/projects/${id}.png`} alt="" width={size} height={size} className={className} />;
}
