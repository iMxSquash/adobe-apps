import { describe, expect, it } from "vitest";

import { isValidDuration, readPositiveInt, readText } from "./fields";

describe("isValidDuration", () => {
  it("accepts mm:ss", () => {
    expect(isValidDuration("3:07")).toBe(true);
    expect(isValidDuration("125:00")).toBe(true);
  });

  it("rejects out-of-range seconds and free text", () => {
    expect(isValidDuration("3:75")).toBe(false);
    expect(isValidDuration("3 min")).toBe(false);
    expect(isValidDuration("")).toBe(false);
  });
});

describe("readText", () => {
  it("trims strings and ignores missing or file fields", () => {
    const form = new FormData();
    form.set("title", "  Poster  ");
    form.set("file", new Blob(["x"]), "x.png");
    expect(readText(form, "title")).toBe("Poster");
    expect(readText(form, "missing")).toBe("");
    expect(readText(form, "file")).toBe("");
  });
});

describe("readPositiveInt", () => {
  it("parses positive integers only", () => {
    const form = new FormData();
    form.set("a", "1080");
    form.set("b", "0");
    form.set("c", "12.5");
    form.set("d", "abc");
    expect(readPositiveInt(form, "a")).toBe(1080);
    expect(readPositiveInt(form, "b")).toBeNull();
    expect(readPositiveInt(form, "c")).toBeNull();
    expect(readPositiveInt(form, "d")).toBeNull();
    expect(readPositiveInt(form, "missing")).toBeNull();
  });
});
