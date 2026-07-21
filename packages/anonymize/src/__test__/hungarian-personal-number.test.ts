import { describe, expect, test } from "bun:test";

import type { NativePipelineEntity } from "../native";
import type { PipelineConfig } from "../types";
import { detectNative } from "./native-detect";

const TRIGGERS_ONLY_CONFIG: PipelineConfig = {
  threshold: 0.5,
  enableTriggerPhrases: true,
  enableRegex: false,
  enableLegalForms: false,
  enableNameCorpus: false,
  enableDenyList: false,
  enableGazetteer: false,
  enableConfidenceBoost: false,
  enableCoreference: false,
  labels: ["national identification number"],
  workspaceId: "hungarian-personal-number-test",
};

const detect = (fullText: string): Promise<NativePipelineEntity[]> =>
  detectNative(TRIGGERS_ONLY_CONFIG, fullText);

describe("Hungarian personal-number trigger", () => {
  test("detects a value matching the personal-number shape", async () => {
    const entities = await detect("személyi szám: 123456AB");

    expect(entities).toEqual(
      expect.arrayContaining([
        expect.objectContaining({
          label: "national identification number",
          text: "123456AB",
        }),
      ]),
    );
  });

  test.each(["123456A", "123456ab", "ABCDEF12"])(
    "rejects invalid value %s",
    async (value) => {
      const entities = await detect(`személyi szám: ${value}`);

      expect(entities).toEqual([]);
    },
  );
});
