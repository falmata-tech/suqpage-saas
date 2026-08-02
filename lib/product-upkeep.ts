import crypto from "node:crypto";
import {
  parseBasicProductCommand,
  ProductUpkeepError,
  type BasicProductCommand,
} from "./product-upkeep-domain";
import type { SessionUser } from "./types";

export type ProductUpkeepResult = {
  productId: number;
  contentVersion: number;
  duplicate: boolean;
};

export interface StagedProductImage {
  imageRef: string;
  digest: string;
  discard(): Promise<void>;
}

export interface BasicProductUpkeepPort {
  assertAuthorized(user: SessionUser, command: BasicProductCommand): void;
  publish(
    user: SessionUser,
    command: BasicProductCommand,
    stagedImage: StagedProductImage | null,
    payloadHash: string,
  ): ProductUpkeepResult;
}

const commandHash = (
  command: BasicProductCommand,
  imageDigest: string,
) =>
  crypto
    .createHash("sha256")
    .update(JSON.stringify({ ...command, imageDigest }))
    .digest("hex");

export async function executeBasicProductUpkeep(
  port: BasicProductUpkeepPort,
  user: SessionUser,
  rawCommand: Record<string, unknown>,
  stagedImage: StagedProductImage | null,
): Promise<ProductUpkeepResult> {
  try {
    const command = parseBasicProductCommand(rawCommand);
    port.assertAuthorized(user, command);
    if (
      (command.imageAction === "replace" && !stagedImage) ||
      (command.imageAction !== "replace" && stagedImage)
    ) {
      throw new ProductUpkeepError(
        "The image action does not match the uploaded file.",
        400,
        "invalid_image_action",
      );
    }
    const result = port.publish(
      user,
      command,
      stagedImage,
      commandHash(command, stagedImage?.digest || ""),
    );
    if (result.duplicate) await stagedImage?.discard();
    return result;
  } catch (error) {
    await stagedImage?.discard();
    throw error;
  }
}
