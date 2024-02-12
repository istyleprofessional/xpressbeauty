import { component$, $ } from "@builder.io/qwik";
import { server$ } from "@builder.io/qwik-city";
import Twilio from "twilio";
import dummyUsers from "~/express/schemas/dummy.user.schema";
import { User } from "~/express/schemas/users.schema";
import nodemailer from "nodemailer";

export const sendTextSer = server$(async function (body: string) {
  try {
    const client = new (Twilio as any).Twilio(
      this.env.get("VITE_TWILIO_ACCOUNT_SID") ?? "",
      this.env.get("VITE_TWILIO_AUTH_TOKEN") ?? ""
    );
    const getGesutsUsersHasPhone = await dummyUsers.find({
      phoneNumber: { $ne: null },
    });
    const users = await User.find({ phoneNumber: { $ne: null } });
    const allUsers = [...getGesutsUsersHasPhone, ...users];
    // get unique phone numbers
    const uniqueUsers = allUsers.filter(
      (v, i, a) =>
        a.findIndex(
          (t) => t.phoneNumber === v.phoneNumber && t.phoneNumber !== null
        ) === i
    );
    for (const user of uniqueUsers) {
      try {
        // without country code and start with +1
        const checkPhonenumberReg = /^\+1\d{10}$/;
        if (!checkPhonenumberReg.test(user.phoneNumber ?? "")) {
          continue;
        }
        await client.messages.create({
          body: body,
          from: "+12134014667",
          to: `${user.phoneNumber}`,
        });
      } catch (err) {
        console.log(err);
        continue;
      }
    }
    return { status: "success" };
  } catch (err) {
    console.log(err);
    return { status: "failed", err: err };
  }
});

export const sendEmailSer = server$(async function (fromName: string, subject: string, body: string) {
  const transporter = nodemailer.createTransport({
    host: "smtp.zoho.com",
    port: 465,
    secure: true, //ssl
    auth: {
      user: import.meta.env.VITE_EMAIL ?? "",
      pass: import.meta.env.VITE_EMAIL_PASS ?? "",
    },
  });
  const getGesutsUsersHasEmail = await dummyUsers.find({
    email: { $ne: null },
  });
  const users
    = await User.find({ email: { $ne: null } });
  const allUsers = [...getGesutsUsersHasEmail, ...users];
  const uniqueUsers = allUsers.filter(
    (v, i, a) =>
      a.findIndex((t) => t.email === v.email && t.email !== null) === i
  );
  for (const user of uniqueUsers) {
    try {
      const mailOptions = {
        from: `${fromName} <${this.env.get("VITE_EMAIL")}>`,
        to: `${user.email}`,
        subject: subject,
        html: body,
      };
      await transporter.sendMail(mailOptions);
    } catch (err) {
      console.log(err);
      continue;
    }
  }
});
export default component$(() => {

  const handleOpenTextDialog = $(() => {
    (document as any).getElementById("my_modal_1")?.showModal();
  });

  const handleOpenEmailDialog = $(() => {
    (document as any).getElementById("my_modal_2")?.showModal();
  });

  const handleSendEmail = $(() => {
    const fromName = (document as any).getElementById("fromName")?.value;
    const subject = (document as any).getElementById("subject")?.value;
    const body = (document as any).getElementById("body")?.value;
    sendEmailSer(fromName, subject, body);
    alert("Sending Email To All Users");
  });

  const handleSendText = $(() => {
    const body = (document as any).getElementById("body-text")?.value;
    sendTextSer(body);
    alert("Sending Text To All Users");
  });

  // template code



  return (
    <div class="flex flex-col items-center justify-center h-screen">
      <h1 class="text-4xl font-bold">Admin Campaigns</h1>
      <p class="text-lg mt-4">Welcome to the admin campaigns page</p>

      <button
        class="btn bg-black text-white font-['Inter'] w-fit rounded-sm mt-8"
        aria-label="See More Products"
        onClick$={handleOpenTextDialog}
      >
        Send Phone Text To All Users
      </button>
      <dialog id="my_modal_1" class="modal">
        <div class="modal-box">
          <div class="form-control">
            <label for="body-text" class="label">
              Body
            </label>
            <textarea
              id="body-text"

              class="input h-32 resize-none border-2 border-gray-300 rounded-md w-full p-2 focus:outline-none focus:border-black"
              placeholder="Enter Body"
            ></textarea>
          </div>
          <div class="modal-action">
            <button class="btn" onClick$={handleSendText}>
              Send Phone Text
            </button>
          </div>
          <div class="modal-action">
            <form method="dialog">
              <button class="btn">Close</button>
            </form>
          </div>
        </div>
      </dialog>

      <button
        class="btn bg-black text-white font-['Inter'] w-fit rounded-sm mt-8"
        aria-label="See More Products"
        onClick$={handleOpenEmailDialog}
      >
        Send Email To All Users
      </button>
      <dialog id="my_modal_2" class="modal">
        <div class="modal-box">
          <div class="form-control">
            <label for="fromName" class="label">
              From Name
            </label>
            <input
              type="text"
              id="fromName"
              class="input border-2 border-gray-300 rounded-md w-full p-2 focus:outline-none focus:border-black"
              placeholder="Enter From Name"
            />

          </div>
          <div class="form-control">
            <label for="subject" class="label">
              Subject
            </label>
            <input
              type="text"
              id="subject"
              class="input border-2 border-gray-300 rounded-md w-full p-2 focus:outline-none focus:border-black"
              placeholder="Enter Subject"
            />
          </div>
          <div class="form-control">
            <label for="body" class="label">
              Body
            </label>
            <textarea
              id="body"

              class="input h-32 resize-none border-2 border-gray-300 rounded-md w-full p-2 focus:outline-none focus:border-black"
              placeholder="Enter Body"
            ></textarea>
          </div>
          <div class="modal-action">
            <button class="btn" onClick$={handleSendEmail}>
              Send Email
            </button>
          </div>
          <div class="modal-action">
            <form method="dialog">
              <button class="btn">Close</button>
            </form>
          </div>
        </div>
      </dialog>
    </div>
  );
});
