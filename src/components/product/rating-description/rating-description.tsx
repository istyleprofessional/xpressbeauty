import {
  $,
  Fragment,
  component$,
  useSignal,
  useStore,
  useTask$,
  useVisibleTask$,
} from "@builder.io/qwik";
import { server$, useNavigate } from "@builder.io/qwik-city";
import { postRequest } from "~/utils/fetch.utils";
import { Toast } from "~/components/admin/toast/toast";
import { getRatingByProductId } from "~/express/services/rating.reviews.service";

interface RatingAndDescriptionProps {
  product_description: string;
  ingredients: string;
  directions: string;
  user?: any;
  productId: string;
}

export const ratingServer = server$(async (productId: string) => {
  const request = await getRatingByProductId(productId ?? "");
  return JSON.stringify(request);
});

export const RatingAndDescription = component$(
  (props: RatingAndDescriptionProps) => {
    const { product_description, user, productId, ingredients, directions } =
      props;
    const nav = useNavigate();
    const isDescriptionActive = useSignal<boolean>(true);
    const isReviewActive = useSignal<boolean>(false);
    const isRecaptcha = useSignal<boolean>(false);
    const errorMessage = useSignal<string>("");
    const userRateObject = useStore<any>(
      {
        ratings: 0,
        reviewTitle: "",
        reviewDescription: "",
        productId: productId,
        userId: user?._id,
        recaptcha: "",
      },
      { deep: true }
    );
    const ratings = useSignal<any[]>([]);
    const recaptchaToken = useSignal<string>("");
    const tabState = useSignal<string>("description");
    const ratingsPercentatge = useSignal<number[]>([0, 0, 0, 0, 0, 0]);

    useTask$(async () => {
      const request: any = await ratingServer(productId);
      const response = JSON.parse(request);
      if (response.status === "success") {
        ratings.value = response?.result?.ratings || [];
      }
    });
    const handleDescription = $(() => {
      isDescriptionActive.value = true;
    });

    const handleRatingAndReviews = $(() => {
      isDescriptionActive.value = false;
      isRecaptcha.value = true;
    });

    const handleWriteReview = $(() => {
      if (!user) {
        nav("/login");
        return;
      } else {
        isReviewActive.value = true;
      }
    });

    const handleRatingStarsChange = $((e: any) => {
      const value = e.target.getAttribute("id");
      userRateObject.ratings = parseFloat(value);
    });

    const handleSubmit = $(async () => {
      userRateObject.createdAt = new Date();
      if (userRateObject.ratings === 0) {
        userRateObject.ratings = 5;
      }
      userRateObject.recaptcha = recaptchaToken.value;
      const request = await postRequest("/api/rating", userRateObject);
      const response = await request.json();
      // console.log(response);
      if (response.status !== "failed") {
        isReviewActive.value = false;
      } else {
        errorMessage.value = "Something went wrong please try again later";
      }
      window.location.reload();
    });

    useVisibleTask$(
      ({ track }) => {
        track(() => isRecaptcha.value);
        if (isRecaptcha.value === true) {
          setTimeout(() => {
            (window as any).grecaptcha.ready(async () => {
              const token = await (window as any).grecaptcha.execute(
                import.meta.env.VITE_RECAPTCHA_SITE_KEY ?? "",
                { action: "submit" }
              );
              recaptchaToken.value = token;
            });
          }, 1000);
        }
      },
      { strategy: "intersection-observer" }
    );

    const handleAlertClose = $(() => {
      errorMessage.value = "";
    });

    useVisibleTask$(
      ({ track }) => {
        track(() => ratings.value);
        ratings.value;
        for (let i = 0; i < ratings.value.length; i++) {
          const ratingValue = ratings.value[i].rating;
          ratingsPercentatge.value[ratingValue] += 1;
        }
      },
      { strategy: "document-ready" }
    );

    // console.log(ratings.value);

    return (
      <div class="flex flex-col gap-8 md:pl-14 justify-center items-center md:justify-start md:items-start">
        <div class="bg-[#F4F4F5] w-96 md:w-[32rem] h-20 justify-center flex items-center rounded-lg">
          {isRecaptcha.value === true && (
            <script
              src={`https://www.google.com/recaptcha/api.js?render=${
                import.meta.env.VITE_RECAPTCHA_SITE_KEY
              }`}
            ></script>
          )}
          <div class="btn-group w-96 flex justify-center items-center">
            <button
              class={`btn ${
                isDescriptionActive.value ? "btn-active" : ""
              } w-22 md:w-60 text-xs md:text-base`}
              onClick$={handleDescription}
            >
              Product Description
            </button>
            <button
              class={`btn ${
                !isDescriptionActive.value ? "btn-active" : ""
              } w-22 md:w-60 text-xs font-inter md:text-base`}
              onClick$={handleRatingAndReviews}
            >
              Ratings and Reviews
            </button>
          </div>
        </div>
        <div class="w-full md:w-96 lg:w-[36rem]">
          {isDescriptionActive.value ? (
            <div class="flex flex-col gap-2 w-full">
              <div role="tablist" class="tabs tabs-bordered w-full">
                {product_description && (
                  <button
                    role="tab"
                    onClick$={() => {
                      const mainDiv = document.getElementById("mainDiv");
                      if (mainDiv) {
                        mainDiv.innerHTML = product_description
                          .replace(/<img .*?>/g, "")
                          .replace(/Cosmo Prof/g, "Xpress Beauty")
                          .replace(/CanRad /g, "Xpress Beauty")
                          // .replace(/([A-Z])([a-z])/g, " $1")
                          .trim();

                        tabState.value = "description";
                      }
                    }}
                    class={`tab ${
                      tabState.value === "description" ? "tab-active" : ""
                    }`}
                  >
                    Description
                  </button>
                )}

                {ingredients && (
                  <button
                    role="tab"
                    onClick$={() => {
                      const mainDiv = document.getElementById("mainDiv");
                      if (mainDiv) {
                        mainDiv.innerHTML = ingredients
                          .replace(/<img .*?>/g, "")
                          .replace(/Cosmo Prof/g, "Xpress Beauty")
                          .replace(/CanRad /g, "Xpress Beauty")
                          // .replace(/([A-Z])([a-z])/g, " $1")
                          .trim();
                        tabState.value = "ingredients";
                      }
                    }}
                    class={`tab ${
                      tabState.value === "ingredients" ? "tab-active" : ""
                    }`}
                  >
                    Ingredients
                  </button>
                )}
                {directions && (
                  <button
                    role="tab"
                    onClick$={() => {
                      const mainDiv = document.getElementById("mainDiv");
                      if (mainDiv) {
                        mainDiv.innerHTML = directions
                          .replace(/<img .*?>/g, "")
                          .replace(/Cosmo Prof/g, "Xpress Beauty")
                          .replace(/CanRad /g, "Xpress Beauty")
                          // .replace(/([A-Z])([a-z])/g, " $1")
                          .trim();
                        tabState.value = "directions";
                      }
                    }}
                    class={`tab ${
                      tabState.value === "directions" ? "tab-active" : ""
                    }`}
                  >
                    Directions
                  </button>
                )}
              </div>
              <div
                class="text-black font-normal text-base w-full p-2"
                id="mainDiv"
                itemProp="description"
                dangerouslySetInnerHTML={product_description
                  .replace(/<img .*?>/g, "")
                  .replace(/Cosmo Prof/g, "Xpress Beauty")
                  .replace(/CanRad /g, "Xpress Beauty")
                  // .replace(/([A-Z])([a-z])/g, " $1")
                  .trim()}
              ></div>
            </div>
          ) : (
            <div class="flex flex-col gap-10">
              <div class="flex flex-col gap-4">
                <h2 class="text-black font-bold text-3xl">Ratings & Reviews</h2>
                <button
                  onClick$={handleWriteReview}
                  class="text-[#BF0A30] btn-sm btn-ghost w-52 rounded-full"
                >
                  {user ? "Write a review" : "Login to add a review"}
                </button>
              </div>
              {/* <RatingSummary ratings={ratings} />
               */}

              <div class="flex flex-col gap-4">
                <h1 class="text-black text-sm">Summary</h1>
                <div class="flex flex-col gap-8">
                  {Array.from(Array(5).keys())
                    .sort((a, b) => b - a)
                    .map((index) => (
                      <div
                        key={index}
                        class="flex flex-row gap-2 jusify-center items-center"
                      >
                        <p class="text-black text-xs">{index + 1}</p>
                        <progress
                          class="progress w-56 bg-[#E4E4E7]"
                          value={
                            (ratingsPercentatge.value[index + 1] * 100) /
                            ratings.value.length
                          }
                          max="100"
                        ></progress>
                      </div>
                    ))}
                </div>
                {ratings.value.length > 0 && (
                  <div class="card shadow-md w-full h-fit md:p-5">
                    <div class="card-body h-96 overflow-y-auto">
                      {ratings.value
                        .sort((ratingA: any, ratingB: any) => {
                          return (
                            new Date(ratingB.createdAt).getTime() -
                            new Date(ratingA.createdAt).getTime()
                          );
                        })
                        .map((rating: any, index: number) => (
                          <Fragment key={index}>
                            <div
                              itemProp="review"
                              itemScope
                              itemType="https://schema.org/Review"
                            >
                              <div class="flex flex-row gap-3">
                                <div class="flex flex-col gap-5 justify-center items-center">
                                  <div class="rating rating-xs md:rating-md rating-half">
                                    {Array(5)
                                      .fill("")
                                      .map((_, index) => (
                                        <Fragment key={index}>
                                          <input
                                            id={`${index + 0.5}`}
                                            type="radio"
                                            name="rating-10"
                                            class={`mask mask-star-2 mask-half-1 bg-[#FFC75B]`}
                                            checked={
                                              rating.rating === index + 0.5
                                            }
                                            disabled={true}
                                          />
                                          <input
                                            id={`${index + 1}`}
                                            type="radio"
                                            name="rating-10"
                                            class={` mask mask-star-2 mask-half-2 bg-[#FFC75B]`}
                                            checked={
                                              rating.rating === index + 1
                                            }
                                            disabled={true}
                                          />
                                        </Fragment>
                                      ))}
                                  </div>
                                  <p
                                    class="text-xs md:text-base"
                                    itemProp="datePublished"
                                  >
                                    {new Date(rating.createdAt).toLocaleString(
                                      "en-US",
                                      {
                                        timeZone: "America/New_York",
                                      }
                                    )}
                                  </p>
                                </div>
                                <div class="flex flex-col gap-3 lg:col-span-3 w-full ">
                                  <h3 class="text-black font-bold text-md break-words">
                                    {rating.reviewTitle}
                                  </h3>
                                  <p
                                    class="text-black text-sm break-words"
                                    itemProp="reviewBody"
                                  >
                                    {rating.reviewDescription}
                                  </p>
                                </div>
                              </div>
                            </div>
                            <div class="divider"></div>
                          </Fragment>
                        ))}
                    </div>
                  </div>
                )}
              </div>

              {isReviewActive.value && (
                <div class="w-full h-full fixed top-0 left-0 backdrop-blur-md z-50 ">
                  <div class="card shadow-2xl p-5 w-fit h-fit fixed top-1/2 left-1/2 bg-white -translate-y-1/2 -translate-x-1/2 z-50">
                    {errorMessage.value && (
                      <div class="w-full">
                        <Toast
                          status="e"
                          handleClose={handleAlertClose}
                          message={errorMessage.value}
                          index={1}
                        />
                      </div>
                    )}
                    <div class="card-body">
                      <div class="card-actions justify-end">
                        <button
                          class="btn btn-square btn-sm"
                          onClick$={() => {
                            isReviewActive.value = false;
                          }}
                        >
                          <svg
                            xmlns="http://www.w3.org/2000/svg"
                            class="h-6 w-6"
                            fill="none"
                            viewBox="0 0 24 24"
                            stroke="currentColor"
                          >
                            <path
                              stroke-linecap="round"
                              stroke-linejoin="round"
                              stroke-width="2"
                              d="M6 18L18 6M6 6l12 12"
                            />
                          </svg>
                        </button>
                      </div>
                      <div class="flex flex-col gap-3">
                        <label class="label">
                          How would you rate this product?
                        </label>
                        <div class="rating rating-lg rating-half">
                          <input
                            type="radio"
                            name="rating-10"
                            class="rating-hidden"
                          />
                          {Array(5)
                            .fill("")
                            .map((_, index) => (
                              <Fragment key={index}>
                                <input
                                  id={`${index + 0.5}`}
                                  type="radio"
                                  name="rating-10"
                                  class={`mask mask-star-2 mask-half-1 bg-[#FFC75B]`}
                                  onChange$={handleRatingStarsChange}
                                />
                                <input
                                  id={`${index + 1}`}
                                  type="radio"
                                  name="rating-10"
                                  class={` mask mask-star-2 mask-half-2 bg-[#FFC75B]`}
                                  onChange$={handleRatingStarsChange}
                                />
                              </Fragment>
                            ))}
                        </div>
                      </div>
                      <div class="flex flex-col gap-3">
                        <label class="label">Review Title</label>
                        <input
                          type="text"
                          placeholder="Review Title"
                          class="input input-bordered"
                          onChange$={(e: any) =>
                            (userRateObject.reviewTitle = e.target.value)
                          }
                        />
                      </div>
                      <div class="flex flex-col gap-3">
                        <label class="label">Review Description</label>
                        <textarea
                          placeholder="Review Description"
                          class="textarea h-32 textarea-bordered"
                          onChange$={(e: any) =>
                            (userRateObject.reviewDescription = e.target.value)
                          }
                        ></textarea>
                      </div>
                      <button class="btn btn-primary" onClick$={handleSubmit}>
                        Submit
                      </button>
                    </div>
                  </div>
                </div>
              )}
            </div>
          )}
        </div>
      </div>
    );
  }
);
