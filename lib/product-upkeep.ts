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
  assertAuthorized(user: SessionUser, command: BasicProductCommand): void | Promise<void>;
  publish(
    user: SessionUser,
    command: BasicProductCommand,
    stagedImage: StagedProductImage | null,
    payloadHash: string,
    stagedGallery?: StagedProductImage[],
  ): ProductUpkeepResult | Promise<ProductUpkeepResult>;
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
  stagedGallery: StagedProductImage[] = [],
): Promise<ProductUpkeepResult> {
  try {
    const command = parseBasicProductCommand(rawCommand);
    await port.assertAuthorized(user, command);
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
    const result = await port.publish(
      user,
      command,
      stagedImage,
      commandHash({...command, ...(command.media ? {media:command.media.map(item=>({...item,ref:stagedGallery.find(image=>image.imageRef===item.ref)?.digest || item.ref}))} : {})}, [stagedImage?.digest || "",...stagedGallery.map(image=>image.digest)].join(":")),
      stagedGallery,
    );
    if (result.duplicate) {await stagedImage?.discard(); await Promise.all(stagedGallery.map(image=>image.discard()));}
    return result;
  } catch (error) {
    await stagedImage?.discard();
    await Promise.all(stagedGallery.map(image=>image.discard()));
    throw error;
  }
}
