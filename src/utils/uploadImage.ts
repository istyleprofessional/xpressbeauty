import sharp from "sharp";
import { S3 } from "@aws-sdk/client-s3";

export const uploadImages = async (formData: any, isResize?: boolean) => {
  try {
    const awsS3 = new S3({
      credentials: {
        accessKeyId: import.meta.env.VITE_AWS_ACCESS_KEY_ID ?? "",
        secretAccessKey: import.meta.env.VITE_AWS_SECRET_KEY ?? "",
      },
      region: "ca-central-1",
    });
    const fileContent = await formData?.image?.arrayBuffer();
    const fileBuffer = Buffer.from(fileContent);
    let resizedImageBuffer: any;
    if (!isResize ?? true) {
      resizedImageBuffer = await sharp(fileBuffer)
        .jpeg({ quality: 80 })
        .png({ quality: 80 })
        .webp({ quality: 80 })
        .toFormat("webp")
        .toBuffer();
    }
    const params = {
      Bucket: import.meta.env.VITE_AWS_BUCKET_NAME ?? "",
      Key: `products-images-2/${formData.name}`,
      Body: resizedImageBuffer ? resizedImageBuffer : fileBuffer,
      ContentType: "image/webp",
      ACL: "public-read",
    };
    const result = await awsS3.putObject(params);
    return result;
  } catch (error) {
    console.log(error);
  }
};
