import type { RequestHandler } from "@builder.io/qwik-city";
import { connect } from "~/express/db.connection";
import { checkDummy } from "~/express/services/dummy.user.service";
import { userRegistration } from "~/express/services/user.service";
import { uuid } from "~/utils/uuid";
import Cryptr from "cryptr";
import { sendVerficationMail } from "~/utils/sendVerficationMail";

export const cryptr = new Cryptr(process.env.SECRET ?? "");

export const onPost: RequestHandler = async ({ parseBody, json, cookie }) => {
  await connect();
  const token = uuid();
  const data: any = await parseBody();
  data.EmailVerifyToken = token;
  const browserId = cookie.get("browserId")?.value;
  if (browserId) {
    data.browserId = browserId;
    const wasDummyUser = await checkDummy(browserId);
    if (wasDummyUser) {
      (data as any).browserId = browserId;
    }
    const encryptedString = cryptr.encrypt(data.password);
    data.password = encryptedString;
    const saveNewUser = await userRegistration(data);
    if (!saveNewUser.err) {
      sendVerficationMail(
        data.email,
        `${data.firstName} ${data.lastName}`,
        token
      );
    }
    cookie.set("verified", "true", { httpOnly: true, path: "/" });
    json(200, saveNewUser as any);
  } else {
    const id = uuid();
    cookie.set("browserId", id, { httpOnly: true, path: "/" });
    data.browserId = id;
    const encryptedString = cryptr.encrypt(data.password);
    data.password = encryptedString;
    const saveNewUser = await userRegistration(data);
    if (!saveNewUser.err) {
      sendVerficationMail(
        data.email,
        `${data.firstName} ${data.lastName}`,
        token
      );
    }
    cookie.set("verified", "true", { httpOnly: true, path: "/" });
    json(200, saveNewUser as any);
  }
};
