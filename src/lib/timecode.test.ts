import { describe, expect, it } from "vitest";

import { durationToSeconds, formatTimecode } from "./timecode";

describe("durationToSeconds", () => {
  it("parses mm:ss", () => {
    expect(durationToSeconds("03:25")).toBe(205);
    expect(durationToSeconds("0:09")).toBe(9);
  });

  it("parses h:mm:ss", () => {
    expect(durationToSeconds("1:02:03")).toBe(3723);
  });

  it("returns null for missing or malformed values", () => {
    expect(durationToSeconds(null)).toBeNull();
    expect(durationToSeconds("")).toBeNull();
    expect(durationToSeconds("abc")).toBeNull();
    expect(durationToSeconds("12")).toBeNull();
    expect(durationToSeconds("01:75")).toBeNull();
  });
});

describe("formatTimecode", () => {
  it("formats zero", () => {
    expect(formatTimecode(0)).toBe("00:00:00:00");
  });

  it("splits seconds and frames", () => {
    expect(formatTimecode(12.16)).toBe("00:00:12:04");
  });

  it("carries minutes and hours", () => {
    expect(formatTimecode(3723)).toBe("01:02:03:00");
  });

  it("clamps negative values to zero", () => {
    expect(formatTimecode(-5)).toBe("00:00:00:00");
  });
});
