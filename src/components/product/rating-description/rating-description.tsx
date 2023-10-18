import {
  $,
  Fragment,
  component$,
  useSignal,
  useStore,
  useVisibleTask$,
} from "@builder.io/qwik";
import { RatingSummary } from "../rating-summary/rating-summary";
import { useNavigate } from "@builder.io/qwik-city";
import { getRequest, postRequest } from "~/utils/fetch.utils";
import { Toast } from "~/components/admin/toast/toast";

interface RatingAndDescriptionProps {
  product_description: string;
  user?: any;
  productId: string;
}

export const RatingAndDescription = component$(
  (props: RatingAndDescriptionProps) => {
    const { product_description, user, productId } = props;
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

    useVisibleTask$(
      async () => {
        const request: any = await getRequest(`/api/rating/?id=${productId}`);
        const response = await request.json();
        if (response.status === "success") {
          ratings.value = response?.result?.ratings || [];
        }
      },
      { strategy: "document-idle" }
    );
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
      ratings.value = response?.result?.ratings || [];
      nav();
    });

    useVisibleTask$(
      ({ track }) => {
        track(() => isRecaptcha.value);
        if (isRecaptcha.value === true) {
          setTimeout(() => {
            (window as any).grecaptcha.ready(async () => {
              const token = await (window as any).grecaptcha.execute(
                process.env.RECAPTCHA_SITE_KEY ?? "",
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

    return (
      <div class="flex flex-col gap-8 md:pl-14 justify-center items-center md:justify-start md:items-start">
        <div class="bg-[#F4F4F5] w-96 md:w-[32rem] h-20 justify-center flex items-center rounded-lg">
          {isRecaptcha.value === true && (
            <script
              src={`https://www.google.com/recaptcha/api.js?render=${process.env.RECAPTCHA_SITE_KEY}`}
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
        <div class="w-3/4">
          {isDescriptionActive.value ? (
            <div
              class="text-black font-normal text-sm md:text-lg"
              itemProp="description"
              dangerouslySetInnerHTML={product_description.replace(
                /<img .*?>/g,
                "<text>"
              )}
            ></div>
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
              <RatingSummary ratings={ratings} />

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
                                  class={`bg-green-500 mask mask-star-2 mask-half-1 bg-[#FFC75B]`}
                                  onChange$={handleRatingStarsChange}
                                />
                                <input
                                  id={`${index + 1}`}
                                  type="radio"
                                  name="rating-10"
                                  class={`bg-green-500 mask mask-star-2 mask-half-2 bg-[#FFC75B]`}
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
