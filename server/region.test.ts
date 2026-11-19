import { describe, expect, it } from "vitest";
import { SOCAL_COUNTIES, getCountyForCity, isSoCalCity, isSoCalZip } from "../shared/region";

describe("Southern California service region", () => {
  it("covers the eight Southern California counties", () => {
    expect(SOCAL_COUNTIES.map((c) => c.slug)).toHaveLength(8);
  });

  it("maps cities to their county case-insensitively", () => {
    expect(getCountyForCity("pasadena")?.name).toBe("Los Angeles County");
    expect(getCountyForCity("IRVINE")?.name).toBe("Orange County");
    expect(getCountyForCity("El Centro")?.name).toBe("Imperial County");
  });

  it("rejects cities outside Southern California", () => {
    expect(isSoCalCity("San Francisco")).toBe(false);
    expect(isSoCalCity("Sacramento")).toBe(false);
    expect(isSoCalCity("Austin")).toBe(false);
  });

  it("only treats unambiguous SoCal ZIP prefixes as in-region", () => {
    expect(isSoCalZip("90012")).toBe(true);
    expect(isSoCalZip("92101")).toBe(true);
    expect(isSoCalZip("93101")).toBe(true);
    expect(isSoCalZip("94103")).toBe(false);
    expect(isSoCalZip("93401")).toBe(false);
  });
});
