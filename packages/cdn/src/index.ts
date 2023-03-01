import cloudinary from "cloudinary";
import { serverConfig } from "env-config";
import { makeImgUrl } from "./utils/makeImgUrl";
export { makeImgUrl } from "./utils/makeImgUrl";

const client = cloudinary.v2;

client.config({
  cloud_name: serverConfig.CLOUDINARY_CLOUD_NAME,
  api_key: serverConfig.CLOUDINARY_API_KEY,
  api_secret: serverConfig.CLOUDINARY_API_SECRET,
});

export const cdnClient = client;

export const uploadBase64Image = async (name: string, b64: string) => {
  const response = await cdnClient.uploader.upload(makeImgUrl(b64), {
    public_id: encodeURIComponent(name),
    resource_type: "image",
  });

  return {
    url: response.secure_url,
    response,
  };
};
