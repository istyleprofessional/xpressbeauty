import { component$ } from "@builder.io/qwik";
import { Card } from "~/components/admin/card/card";

export default component$(() => {
  return (
    <div class="w-full h-full flex-col justify-start items-start gap-10 inline-flex">
      <div class="w-full h-full px-6 py-4 bg-white rounded-lg shadow flex-col justify-center items-center flex">
        <div class="self-stretch h-[22px] pb-4 flex-col justify-start items-start gap-4 flex">
          <div class="self-stretch justify-center items-center gap-2.5 inline-flex">
            <div class="grow shrink basis-0 text-gray-500 text-sm font-extrabold font-['Nunito Sans'] leading-tight">
              Choose Date
            </div>
            <div class="w-[109px] pl-3 pr-1.5 rounded border border-gray-300 justify-center items-center gap-4 flex">
              <input
                class="text-gray-500 text-xs font-normal font-['Nunito Sans'] leading-[18px]"
                type="date"
                value="14/09/2023"
              />

              <div class="w-2.5 h-1.5 relative"></div>
            </div>
          </div>
        </div>
      </div>
      <div class="flex-col justify-start items-start gap-6 flex">
        <div class="text-gray-500 text-2xl font-medium font-['Inter'] leading-loose">
          Orders
        </div>
        <div class="w-[1104px] justify-start items-start gap-6 inline-flex">
          <div class="grow shrink basis-0 self-stretch px-6 py-4 bg-white rounded-lg shadow flex-col justify-start items-start inline-flex">
            <div class="self-stretch h-[116px] pb-4 flex-col justify-start items-start gap-4 flex">
              <div class="self-stretch justify-center items-center gap-2.5 inline-flex">
                <div class="grow shrink basis-0 text-slate-500 text-sm font-semibold font-['Inter'] leading-tight">
                  Shipped Orders
                </div>
                <div class="w-[89px] pl-3 pr-1.5 rounded border border-slate-300 justify-center items-center gap-4 flex">
                  <div class="text-slate-500 text-xs font-normal font-['Nunito Sans'] leading-[18px]">
                    30 Days
                  </div>
                  <div class="w-2.5 h-1.5 relative"></div>
                </div>
              </div>
              <div class="h-[60px] justify-start items-center gap-4 inline-flex">
                <div class="p-4 bg-violet-600 rounded-lg justify-center items-center gap-2.5 flex">
                  <div class="w-6 h-6 relative"></div>
                </div>
                <div class="flex-col justify-center items-start gap-1 inline-flex">
                  <div class="text-slate-500 text-4xl font-normal font-['Nunito Sans'] leading-10">
                    6,000
                  </div>
                </div>
              </div>
            </div>
          </div>
          <div class="grow shrink basis-0 self-stretch px-6 py-4 bg-white rounded-lg shadow flex-col justify-start items-start inline-flex">
            <div class="self-stretch h-[116px] pb-4 flex-col justify-start items-start gap-4 flex">
              <div class="self-stretch justify-center items-center gap-2.5 inline-flex">
                <div class="grow shrink basis-0 text-slate-500 text-sm font-semibold font-['Inter'] leading-tight">
                  Pending Orders
                </div>
                <div class="w-[89px] pl-3 pr-1.5 rounded border border-slate-300 justify-center items-center gap-4 flex">
                  <div class="text-slate-500 text-xs font-normal font-['Nunito Sans'] leading-[18px]">
                    30 Days
                  </div>
                  <div class="w-2.5 h-1.5 relative"></div>
                </div>
              </div>
              <div class="h-[60px] justify-start items-center gap-4 inline-flex">
                <div class="p-4 bg-violet-600 rounded-lg justify-center items-center gap-2.5 flex">
                  <div class="w-6 h-6 relative"></div>
                </div>
                <div class="flex-col justify-center items-start gap-1 inline-flex">
                  <div class="text-slate-500 text-4xl font-normal font-['Nunito Sans'] leading-10">
                    200
                  </div>
                </div>
              </div>
            </div>
          </div>
          <div class="grow shrink basis-0 self-stretch px-6 py-4 bg-white rounded-lg shadow flex-col justify-start items-start inline-flex">
            <div class="self-stretch h-[116px] pb-4 flex-col justify-start items-start gap-4 flex">
              <div class="self-stretch justify-center items-center gap-2.5 inline-flex">
                <div class="grow shrink basis-0 text-slate-500 text-sm font-semibold font-['Inter'] leading-tight">
                  New Orders
                </div>
                <div class="w-[89px] pl-3 pr-1.5 rounded border border-slate-300 justify-center items-center gap-4 flex">
                  <div class="text-slate-500 text-xs font-normal font-['Nunito Sans'] leading-[18px]">
                    30 Days
                  </div>
                  <div class="w-2.5 h-1.5 relative"></div>
                </div>
              </div>
              <div class="h-[60px] justify-start items-center gap-4 inline-flex">
                <div class="p-4 bg-violet-600 rounded-lg justify-center items-center gap-2.5 flex">
                  <div class="w-6 h-6 relative"></div>
                </div>
                <div class="flex-col justify-center items-start gap-1 inline-flex">
                  <div class="text-slate-500 text-4xl font-normal font-['Nunito Sans'] leading-10">
                    1,000
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
      <div class="flex-col justify-start items-start gap-6 flex">
        <div class="text-gray-500 text-2xl font-medium font-['Inter'] leading-loose">
          Visited Users
        </div>
        <div class="w-[1104px] justify-start items-start gap-6 inline-flex">
          <div class="grow shrink basis-0 self-stretch px-6 py-4 bg-white rounded-lg shadow flex-col justify-start items-start inline-flex">
            <div class="self-stretch h-[116px] pb-4 flex-col justify-start items-start gap-4 flex">
              <div class="self-stretch justify-center items-center gap-2.5 inline-flex">
                <div class="grow shrink basis-0 text-slate-500 text-sm font-semibold font-['Inter'] leading-tight">
                  Old Registered Users
                </div>
                <div class="w-[89px] pl-3 pr-1.5 rounded border border-slate-300 justify-center items-center gap-4 flex">
                  <div class="text-slate-500 text-xs font-normal font-['Nunito Sans'] leading-[18px]">
                    30 Days
                  </div>
                  <div class="w-2.5 h-1.5 relative"></div>
                </div>
              </div>
              <div class="h-[60px] justify-start items-center gap-4 inline-flex">
                <div class="p-4 bg-violet-600 rounded-lg justify-center items-center gap-2.5 flex">
                  <div class="w-6 h-6 relative"></div>
                </div>
                <div class="flex-col justify-center items-start gap-1 inline-flex">
                  <div class="text-slate-500 text-4xl font-normal font-['Nunito Sans'] leading-10">
                    200
                  </div>
                </div>
              </div>
            </div>
          </div>
          <div class="grow shrink basis-0 self-stretch px-6 py-4 bg-white rounded-lg shadow flex-col justify-start items-start inline-flex">
            <div class="self-stretch h-[116px] pb-4 flex-col justify-start items-start gap-4 flex">
              <div class="self-stretch justify-center items-center gap-2.5 inline-flex">
                <div class="grow shrink basis-0 text-slate-500 text-sm font-semibold font-['Inter'] leading-tight">
                  New Registered Users
                </div>
                <div class="w-[89px] pl-3 pr-1.5 rounded border border-slate-300 justify-center items-center gap-4 flex">
                  <div class="text-slate-500 text-xs font-normal font-['Nunito Sans'] leading-[18px]">
                    30 Days
                  </div>
                  <div class="w-2.5 h-1.5 relative"></div>
                </div>
              </div>
              <div class="h-[60px] justify-start items-center gap-4 inline-flex">
                <div class="p-4 bg-violet-600 rounded-lg justify-center items-center gap-2.5 flex">
                  <div class="w-6 h-6 relative"></div>
                </div>
                <div class="flex-col justify-center items-start gap-1 inline-flex">
                  <div class="text-slate-500 text-4xl font-normal font-['Nunito Sans'] leading-10">
                    1,000
                  </div>
                </div>
              </div>
            </div>
          </div>
          <div class="grow shrink basis-0 self-stretch px-6 py-4 bg-white rounded-lg shadow flex-col justify-start items-start inline-flex">
            <div class="self-stretch h-[116px] pb-4 flex-col justify-start items-start gap-4 flex">
              <div class="self-stretch justify-center items-center gap-2.5 inline-flex">
                <div class="grow shrink basis-0 text-slate-500 text-sm font-semibold font-['Inter'] leading-tight">
                  Dummy Users
                </div>
                <div class="w-[89px] pl-3 pr-1.5 rounded border border-slate-300 justify-center items-center gap-4 flex">
                  <div class="text-slate-500 text-xs font-normal font-['Nunito Sans'] leading-[18px]">
                    30 Days
                  </div>
                  <div class="w-2.5 h-1.5 relative"></div>
                </div>
              </div>
              <div class="h-[60px] justify-start items-center gap-4 inline-flex">
                <div class="p-4 bg-violet-600 rounded-lg justify-center items-center gap-2.5 flex">
                  <div class="w-6 h-6 relative"></div>
                </div>
                <div class="flex-col justify-center items-start gap-1 inline-flex">
                  <div class="text-slate-500 text-4xl font-normal font-['Nunito Sans'] leading-10">
                    6,000
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
      <div class="h-[446px] flex-col justify-center items-start gap-6 flex">
        <div class="text-gray-500 text-2xl font-medium font-['Inter'] leading-loose">
          Revenues{" "}
        </div>
        <div class="w-[1131px] justify-start items-center gap-10 inline-flex">
          <div class="w-[736px] h-[390px] relative">
            <div class="w-[736px] h-[390px] left-0 top-0 absolute bg-white shadow"></div>
            <div class="left-[31px] top-[28px] absolute text-black text-xl font-medium font-['Inter']">
              2023 Revenue
            </div>
            <div class="h-6 pl-3 pr-1.5 left-[626px] top-[28px] absolute rounded border border-gray-300 justify-center items-center gap-4 inline-flex">
              <div class="text-gray-500 text-xs font-normal font-['Nunito Sans'] leading-[18px]">
                2023
              </div>
              <div class="w-2.5 h-1.5 relative"></div>
            </div>
            <div class="h-[215px] left-0 top-[101px] absolute">
              <div class="w-[686px] h-[190px] left-[15px] top-[25px] absolute">
                <div class="w-[651px] h-[167px] left-[35px] top-[9px] absolute">
                  <div class="w-[651px] h-[167px] left-0 top-0 absolute border border-stone-300"></div>
                </div>
                <div class="w-5 h-2.5 left-[35px] top-[180px] absolute text-neutral-600 text-[9px] font-normal font-['Inter']">
                  Jan
                </div>
                <div class="w-5 h-2.5 left-[83px] top-[180px] absolute text-neutral-600 text-[9px] font-normal font-['Inter']">
                  Feb
                </div>
                <div class="w-5 h-2.5 left-[139px] top-[180px] absolute text-neutral-600 text-[9px] font-normal font-['Inter']">
                  Mar
                </div>
                <div class="w-5 h-2.5 left-[194px] top-[180px] absolute text-neutral-600 text-[9px] font-normal font-['Inter']">
                  Apr
                </div>
                <div class="w-5 h-2.5 left-[250px] top-[180px] absolute text-neutral-600 text-[9px] font-normal font-['Inter']">
                  Mai
                </div>
                <div class="w-5 h-2.5 left-[305px] top-[180px] absolute text-neutral-600 text-[9px] font-normal font-['Inter']">
                  Jun
                </div>
                <div class="w-5 h-2.5 left-[360px] top-[180px] absolute text-neutral-600 text-[9px] font-normal font-['Inter']">
                  Jul
                </div>
                <div class="w-5 h-2.5 left-[416px] top-[180px] absolute text-neutral-600 text-[9px] font-normal font-['Inter']">
                  Aug
                </div>
                <div class="w-5 h-2.5 left-[471px] top-[180px] absolute text-neutral-600 text-[9px] font-normal font-['Inter']">
                  Sep
                </div>
                <div class="w-5 h-2.5 left-[527px] top-[180px] absolute text-neutral-600 text-[9px] font-normal font-['Inter']">
                  Oct
                </div>
                <div class="w-5 h-2.5 left-[582px] top-[180px] absolute text-neutral-600 text-[9px] font-normal font-['Inter']">
                  Nov
                </div>
                <div class="w-5 h-2.5 left-[638px] top-[180px] absolute text-neutral-600 text-[9px] font-normal font-['Inter']">
                  Dec
                </div>
                <div class="w-[27px] h-[9.94px] left-0 top-[166px] absolute text-right text-neutral-600 text-[9px] font-normal font-['Inter']">
                  0
                </div>
                <div class="w-[27px] h-[9.94px] left-0 top-[146px] absolute text-right text-neutral-600 text-[9px] font-normal font-['Inter']">
                  10 K
                </div>
                <div class="w-[27px] h-[9.94px] left-0 top-[125px] absolute text-right text-neutral-600 text-[9px] font-normal font-['Inter']">
                  20 K
                </div>
                <div class="w-[27px] h-[9.94px] left-0 top-[104px] absolute text-right text-neutral-600 text-[9px] font-normal font-['Inter']">
                  30 K
                </div>
                <div class="w-[27px] h-[9.94px] left-0 top-[83px] absolute text-right text-neutral-600 text-[9px] font-normal font-['Inter']">
                  40 K
                </div>
                <div class="w-[27px] h-[9.94px] left-0 top-[62px] absolute text-right text-neutral-600 text-[9px] font-normal font-['Inter']">
                  50 K
                </div>
                <div class="w-[27px] h-[9.94px] left-0 top-[42px] absolute text-right text-neutral-600 text-[9px] font-normal font-['Inter']">
                  60 K
                </div>
                <div class="w-[27px] h-[9.94px] left-0 top-[21px] absolute text-right text-neutral-600 text-[9px] font-normal font-['Inter']">
                  70 K
                </div>
                <div class="w-[27px] h-[9.94px] left-0 top-0 absolute text-right text-neutral-600 text-[9px] font-normal font-['Inter']">
                  80 K
                </div>
              </div>
            </div>
            <div class="w-1.5 h-[83px] left-[70px] top-[219px] absolute bg-violet-600"></div>
            <div class="w-1.5 h-[66px] left-[124px] top-[236px] absolute bg-violet-600"></div>
            <div class="w-1.5 h-[50px] left-[179px] top-[252px] absolute bg-violet-600"></div>
            <div class="w-1.5 h-[115px] left-[236px] top-[187px] absolute bg-violet-600"></div>
            <div class="w-1.5 h-[82px] left-[291px] top-[220px] absolute bg-violet-600"></div>
            <div class="w-1.5 h-[165px] left-[347px] top-[137px] absolute bg-violet-600"></div>
            <div class="w-1.5 h-[50px] left-[402px] top-[252px] absolute bg-violet-600"></div>
            <div class="w-1.5 h-[66px] left-[456px] top-[236px] absolute bg-violet-600"></div>
            <div class="w-1.5 h-[132px] left-[512px] top-[170px] absolute bg-violet-600"></div>
            <div class="w-1.5 h-[165px] left-[567px] top-[137px] absolute bg-violet-600"></div>
            <div class="w-1.5 h-[99px] left-[623px] top-[203px] absolute bg-violet-600"></div>
            <div class="w-1.5 h-[132px] left-[673px] top-[170px] absolute bg-violet-600"></div>
          </div>
        </div>
      </div>
      <div class="flex-col justify-start items-start gap-6 flex">
        <div class="flex-col justify-start items-start gap-6 flex">
          <div class="w-[105px] text-gray-500 text-2xl font-medium font-['Inter'] leading-loose">
            Products
          </div>
        </div>
        <div class="justify-start items-start gap-4 inline-flex">
          <div class="w-[355px] h-[461px] relative bg-white shadow">
            <div class="w-[355px] h-[461px] left-0 top-0 absolute bg-white"></div>
            <div class="left-[31px] top-[28px] absolute text-black text-xl font-medium font-['Inter']">
              Best Seller
            </div>
            <div class="h-6 pl-3 pr-1.5 left-[220px] top-[28px] absolute rounded border border-slate-300 justify-center items-center gap-4 inline-flex">
              <div class="text-slate-500 text-xs font-normal font-['Nunito Sans'] leading-[18px]">
                Choose Date
              </div>
              <div class="w-2.5 h-1.5 relative"></div>
            </div>
            <div class="w-[78px] left-[31px] top-[385px] absolute">
              <div class="w-[61px] h-[17px] left-[17px] top-0 absolute text-black text-xs font-normal font-['Inter']">
                Product 1
              </div>
              <div class="w-[9px] h-[9px] left-0 top-[4px] absolute bg-red-500 rounded-full"></div>
            </div>
            <div class="w-[164px] left-[31px] top-[410px] absolute">
              <div class="w-[61px] h-[17px] left-[17px] top-0 absolute text-black text-xs font-normal font-['Inter']">
                Product 4
              </div>
              <div class="w-[9px] h-[9px] left-0 top-[4px] absolute bg-amber-300 rounded-full"></div>
              <div class="w-[61px] h-[17px] left-[103px] top-0 absolute text-black text-xs font-normal font-['Inter']">
                Product 5
              </div>
              <div class="w-[9px] h-[9px] left-[86px] top-[4px] absolute bg-stone-400 rounded-full"></div>
            </div>
            <div class="w-[164px] left-[117px] top-[385px] absolute">
              <div class="w-[61px] h-[17px] left-[17px] top-0 absolute text-black text-xs font-normal font-['Inter']">
                Product 2
              </div>
              <div class="w-[9px] h-[9px] left-0 top-[4px] absolute bg-violet-600 rounded-full"></div>
              <div class="w-[61px] h-[17px] left-[103px] top-0 absolute text-black text-xs font-normal font-['Inter']">
                Product 3
              </div>
              <div class="w-[9px] h-[9px] left-[86px] top-[4px] absolute bg-amber-500 rounded-full"></div>
            </div>
            <div class="w-[228px] h-[228px] left-[63px] top-[133px] absolute bg-red-500 rounded-full"></div>
            <div class="w-[228px] h-[228px] left-[291px] top-[361px] absolute origin-top-left -rotate-180 bg-amber-500 rounded-full"></div>
            <div class="w-[228px] h-[228px] left-[291px] top-[361px] absolute origin-top-left -rotate-180 bg-violet-600 rounded-full"></div>
            <div class="w-[228px] h-[228px] left-[291px] top-[133px] absolute origin-top-left rotate-90 bg-amber-300 rounded-full"></div>
            <div class="w-[228px] h-[228px] left-[291px] top-[133px] absolute origin-top-left rotate-90 bg-stone-400 rounded-full"></div>
            <div class="left-[226px] top-[170px] absolute text-white text-xs font-normal font-['Inter']">
              25%
            </div>
            <div class="left-[106px] top-[170px] absolute text-white text-xs font-normal font-['Inter']">
              25%
            </div>
            <div class="left-[106px] top-[308px] absolute text-white text-xs font-normal font-['Inter']">
              25%
            </div>
            <div class="left-[200px] top-[323px] absolute text-white text-xs font-normal font-['Inter']">
              13%
            </div>
            <div class="left-[250px] top-[274px] absolute text-white text-xs font-normal font-['Inter']">
              12%
            </div>
          </div>
          <div class="w-[736px] h-[436px] relative">
            <div class="w-[736px] h-[459px] left-[0.50px] top-0 absolute bg-white shadow"></div>
            <div class="w-[121px] h-[24.06px] left-[31px] top-[28.07px] absolute text-black text-xl font-medium font-['Inter']">
              Sold Items
            </div>
            <div class="h-6 pl-3 pr-1.5 left-[564px] top-[40px] absolute rounded border border-slate-300 justify-center items-center gap-4 inline-flex">
              <div class="text-slate-500 text-xs font-normal font-['Nunito Sans'] leading-[18px]">
                Choose Product
              </div>
              <div class="w-2.5 h-1.5 relative"></div>
            </div>
            <div class="h-6 pl-3 pr-1.5 left-[424px] top-[40px] absolute rounded border border-slate-300 justify-center items-center gap-4 inline-flex">
              <div class="text-slate-500 text-xs font-normal font-['Nunito Sans'] leading-[18px]">
                Choose Date
              </div>
              <div class="w-2.5 h-1.5 relative"></div>
            </div>
            <div class="w-[736px] h-[256.96px] left-0 top-[147.04px] absolute">
              <div class="w-[642px] h-[163px] left-[49px] top-[40px] absolute">
                <div class="w-[642px] h-[163px] left-0 top-0 absolute border border-stone-300"></div>
              </div>
              <div class="w-[43px] h-2.5 left-[50px] top-[206px] absolute text-neutral-600 text-[9px] font-normal font-['Inter']">
                Jan
              </div>
              <div class="w-[5.29px] h-[9.71px] left-[37.17px] top-[195.52px] absolute text-right text-neutral-600 text-[9px] font-normal font-['Inter']">
                0
              </div>
              <div class="w-6 h-2.5 left-[19px] top-[162px] absolute text-right text-neutral-600 text-[9px] font-normal font-['Inter']">
                20
              </div>
              <div class="w-5 h-[9px] left-[22px] top-[97px] absolute text-right text-neutral-600 text-[9px] font-normal font-['Inter']">
                60
              </div>
              <div class="w-[17px] h-2.5 left-[25px] top-[64px] absolute text-right text-neutral-600 text-[9px] font-normal font-['Inter']">
                80
              </div>
              <div class="w-[18px] h-2.5 left-[25px] top-[31px] absolute text-right text-neutral-600 text-[9px] font-normal font-['Inter']">
                100
              </div>
              <div class="w-3 h-2.5 left-[30px] top-[129px] absolute text-right text-neutral-600 text-[9px] font-normal font-['Inter']">
                40
              </div>
              <div class="w-[43px] h-2.5 left-[211px] top-[206px] absolute text-neutral-600 text-[9px] font-normal font-['Inter']">
                Feb
              </div>
              <div class="w-[55px] h-2.5 left-[368px] top-[206px] absolute text-neutral-600 text-[9px] font-normal font-['Inter']">
                Mar
              </div>
              <div class="w-[52px] h-2 left-[531px] top-[206px] absolute text-neutral-600 text-[9px] font-normal font-['Inter']">
                Apr
              </div>
              <div class="w-9 h-2 left-[691px] top-[206px] absolute text-neutral-600 text-[9px] font-normal font-['Inter']">
                May
              </div>
              <div class="w-[7.05px] h-[7.06px] left-[46.69px] top-[43.64px] absolute bg-violet-600 rounded-full"></div>
              <div class="w-[7.05px] h-[7.06px] left-[207px] top-[83.38px] absolute bg-violet-600 rounded-full"></div>
              <div class="w-[7.05px] h-[7.06px] left-[365px] top-[108.98px] absolute bg-violet-600 rounded-full"></div>
              <div class="w-[7.05px] h-[7.06px] left-[527px] top-[96.62px] absolute bg-violet-600 rounded-full"></div>
              <div class="w-[7.05px] h-[7.06px] left-[687px] top-[135.47px] absolute bg-violet-600 rounded-full"></div>
              <div class="w-[311.50px] h-[17px] left-[31px] top-[239.96px] absolute">
                <div class="w-[294px] h-[17px] left-[17.50px] top-0 absolute text-gray-500 text-sm font-normal font-['Nunito Sans'] leading-tight">
                  BabylissPro GoldFX Skeleton Metal Trimmer
                </div>
                <div class="w-[9px] h-[9.02px] left-0 top-[4.04px] absolute bg-violet-600 rounded-full"></div>
              </div>
            </div>
            <div class="left-[31px] top-[60px] absolute text-black text-[32px] font-medium font-['Inter']">
              200
            </div>
          </div>
        </div>
      </div>
    </div>
  );
});
