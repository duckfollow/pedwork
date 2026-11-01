import { ImageResponse } from "next/og";
import { readFile } from "node:fs/promises";
import { join } from "node:path";

export const dynamic = "force-static";
const tools = [
  { id: "edith", name: "EDITH", label: "DEBUGGING", color: "#9ed5bc" },
  { id: "ultron", name: "Ultron", label: "TERMINAL & SSH", color: "#d58b91" },
  { id: "dum-e", name: "Dum-E", label: "DATABASES", color: "#d9b86f" },
  { id: "u", name: "u", label: "API & FLOWS", color: "#b5a4df" },
];
export async function GET() {
  const icons = await Promise.all(
    tools.map(async (tool) => {
      const data = await readFile(
        join(process.cwd(), "public", "projects", `${tool.id}.png`),
      );
      return `data:image/png;base64,${data.toString("base64")}`;
    }),
  );
  return new ImageResponse(
    <div
      style={{
        width: "100%",
        height: "100%",
        display: "flex",
        flexDirection: "column",
        background: "#111613",
        color: "#e8ede6",
        padding: "44px 56px",
        fontFamily: "sans-serif",
      }}
    >
      <div
        style={{
          display: "flex",
          alignItems: "center",
          justifyContent: "space-between",
          borderBottom: "1px solid #334137",
          paddingBottom: 22,
        }}
      >
        <div
          style={{
            display: "flex",
            alignItems: "center",
            fontSize: 26,
            fontWeight: 700,
          }}
        >
          <span style={{ color: "#a3d3b2", marginRight: 12 }}>{">_"}</span>
          pedwork<span style={{ color: "#e6a06d" }}>.</span>
        </div>
        <div
          style={{
            display: "flex",
            color: "#a3b1a5",
            fontSize: 16,
            letterSpacing: 3,
          }}
        >
          DEVELOPER / OPEN SOURCE
        </div>
      </div>
      <div
        style={{
          display: "flex",
          flex: 1,
          alignItems: "center",
          justifyContent: "space-between",
          padding: "24px 0",
        }}
      >
        <div style={{ display: "flex", flexDirection: "column" }}>
          <span
            style={{
              color: "#a3d3b2",
              fontSize: 17,
              letterSpacing: 2,
              marginBottom: 14,
            }}
          >
            @TANKPS / DUCKFOLLOW
          </span>
          <span
            style={{
              fontSize: 64,
              fontWeight: 700,
              lineHeight: 1.06,
              letterSpacing: -3,
            }}
          >
            Prasit Suphancho
          </span>
          <div
            style={{
              display: "flex",
              fontSize: 32,
              marginTop: 18,
              letterSpacing: -1,
            }}
          >
            Less friction.
            <span style={{ color: "#e6a06d", marginLeft: 9 }}>
              More building.
            </span>
          </div>
          <span style={{ color: "#a3b1a5", fontSize: 20, marginTop: 15 }}>
            Developer tools. Built for my workshop. Shared for yours.
          </span>
        </div>
      </div>
      <div style={{ display: "flex", gap: 14 }}>
        {tools.map((tool, index) => (
          <div
            key={tool.id}
            style={{
              display: "flex",
              alignItems: "center",
              gap: 14,
              width: 261,
              padding: "20px 16px",
              border: "1px solid #334137",
              borderRadius: 10,
              background: "#181e1a",
            }}
          >
            {/* eslint-disable-next-line @next/next/no-img-element -- ImageResponse requires embedded image sources. */}
            <img
              src={icons[index]}
              alt=""
              width={52}
              height={52}
              style={{ borderRadius: 12 }}
            />
            <div style={{ display: "flex", flexDirection: "column" }}>
              <span style={{ fontSize: 24, fontWeight: 700 }}>{tool.name}</span>
              <span
                style={{
                  color: tool.color,
                  fontSize: 10,
                  letterSpacing: 1,
                  marginTop: 6,
                }}
              >
                {tool.label}
              </span>
            </div>
          </div>
        ))}
      </div>
      <div
        style={{
          display: "flex",
          justifyContent: "space-between",
          color: "#95a397",
          fontSize: 14,
          marginTop: 23,
        }}
      >
        <span>Inspect. Connect. Query. Automate.</span>
        <span>github.com/duckfollow</span>
      </div>
    </div>,
    {
      width: 1200,
      height: 630,
      headers: { "Cache-Control": "public, max-age=3600, s-maxage=86400" },
    },
  );
}
