import { component$, $ } from "@builder.io/qwik";
import { server$ } from "@builder.io/qwik-city";
import Twilio from "twilio";
import dummyUsers from "~/express/schemas/dummy.user.schema";
import { User } from "~/express/schemas/users.schema";

export const sendTextSer = server$(async function () {
  try {
    const client = new (Twilio as any).Twilio(
      this.env.get("VITE_TWILIO_ACCOUNT_SID") ?? "",
      this.env.get("VITE_TWILIO_AUTH_TOKEN") ?? ""
    );
    const getGesutsUsersHasPhone = await dummyUsers.find({
      phoneNumber: { $ne: "" },
    });
    const users = await User.find({ phoneNumber: { $ne: "" } });
    const allUsers = [...getGesutsUsersHasPhone, ...users];
    for (const user of allUsers) {
      try {
        // without country code and start with 1
        const checkPhonenumberReg = /^[1]\d{10}$/;
        if (!checkPhonenumberReg.test(user.phoneNumber ?? "")) {
          continue;
        }
        console.log(user.phoneNumber);
        await client.messages.create({
          body: `
          XPRESS BEAUTY 
    
          💝💝 Valentines Day Savings STARTS NOW!! 💝💝 
    
          Get ready to save big on your next purchase with our exclusive shipping discounts:
          
          🛒 Spend more than $80 less than $100 ➡️ Enjoy 30% off shipping!
          🚚 Spend more than $100 less than $150 ➡️ Enjoy 50% off shipping!
          📦 Spend more than $150 less than $200 ➡️ Enjoy a whopping 70% off shipping!
          🎁 Spend over $200 ➡️ Get FREE shipping on us!
          
          Hurry, this offer won't last forever! Shop now and save on shipping costs while stocking up on your favorite items. Visit our website today! 🛍️✨
          
          Shop now at xpressbeauty.ca to avail these amazing shipping discounts!`,
          from: "+12134014667",
          to: `+${user.phoneNumber}`,
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

export default component$(() => {
  const handleSendText = $(() => {
    sendTextSer();
    alert("Sending Text To All Users");
  });

  return (
    <div class="flex flex-col items-center justify-center h-screen">
      <h1 class="text-4xl font-bold">Admin Campaigns</h1>
      <p class="text-lg mt-4">Welcome to the admin campaigns page</p>

      <button
        class="btn bg-black text-white font-['Inter'] w-fit rounded-sm mt-8"
        aria-label="See More Products"
        onClick$={handleSendText}
      >
        Send Phone Text To All Users
      </button>

      <button
        class="btn bg-black text-white font-['Inter'] w-fit rounded-sm mt-8"
        aria-label="See More Products"
        onClick$={() => {
          alert("Send Email To All Users");
        }}
      >
        Send Email To All Users
      </button>
    </div>
  );
});
