import { component$, $ } from "@builder.io/qwik";

export default component$(() => {
  const updateFeed = $(async () => {
    try {
      const response = await fetch("/api/merchantCenter", { method: "POST" });
      const result = await response.json();
      if (result.redirect) {
        window.location.href = result.redirect;
      }
      if (result.success) {
        alert("Feed updated successfully!");
      } else {
        console.error(result.error);
        alert("Failed to update feed.");
      }
    } catch (error) {
      console.error("Error:", error);
      alert("Error occurred while updating feed.");
    }
  });

  return (
    <button onClick$={updateFeed}>Update Google Merchant Center Feed</button>
  );
});
