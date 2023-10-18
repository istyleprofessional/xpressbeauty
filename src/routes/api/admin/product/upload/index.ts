import type { RequestHandler } from "@builder.io/qwik-city";
import { uploadImages } from "~/utils/uploadImage";

export const onPost: RequestHandler = async ({ parseBody, json }) => {
  const data = await parseBody();
  const upload: any = await uploadImages(data as FormData);
  json(200, { message: upload["$metadata"].httpStatusCode });
};
