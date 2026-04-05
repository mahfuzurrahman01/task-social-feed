"use client";

import { useRef } from "react";

const DESKTOP_STORIES = [
  { img: "/assets/images/card_ppl2.png", name: "Ryan Roslansky" },
  { img: "/assets/images/card_ppl3.png", name: "Karim Saif" },
  { img: "/assets/images/card_ppl4.png", name: "Dylan Field" },
  { img: "/assets/images/card_ppl2.png", name: "Sarah Johnson" },
  { img: "/assets/images/card_ppl3.png", name: "Mike Torres" },
  { img: "/assets/images/card_ppl4.png", name: "Aisha Patel" },
];

export default function StoryCards() {
  const scrollRef = useRef<HTMLDivElement>(null);

  function scrollRight() {
    if (scrollRef.current) {
      scrollRef.current.scrollBy({ left: 220, behavior: "smooth" });
    }
  }

  return (
    <>
      {/* Desktop story cards */}
      <div className="_feed_inner_ppl_card _mar_b16">
        <div className="_feed_inner_story_arrow" onClick={scrollRight} style={{ cursor: "pointer" }}>
          <button type="button" className="_feed_inner_story_arrow_btn">
            <svg xmlns="http://www.w3.org/2000/svg" width="9" height="8" fill="none" viewBox="0 0 9 8">
              <path fill="#fff" d="M8 4l.366-.341.318.341-.318.341L8 4zm-7 .5a.5.5 0 010-1v1zM5.566.659l2.8 3-.732.682-2.8-3L5.566.66zm2.8 3.682l-2.8 3-.732-.682 2.8-3 .732.682zM8 4.5H1v-1h7v1z" />
            </svg>
          </button>
        </div>
        <div
          ref={scrollRef}
          style={{
            display: "flex",
            gap: "12px",
            overflowX: "hidden",
            scrollBehavior: "smooth",
          }}
        >
          {/* Your Story */}
          <div style={{ flex: "0 0 calc(25% - 9px)", minWidth: "calc(25% - 9px)" }}>
            <div className="_feed_inner_profile_story _b_radious6">
              <div className="_feed_inner_profile_story_image">
                <img src="/assets/images/card_ppl1.png" alt="Image" className="_profile_story_img" />
                <div className="_feed_inner_story_txt">
                  <div className="_feed_inner_story_btn">
                    <button className="_feed_inner_story_btn_link">
                      <svg xmlns="http://www.w3.org/2000/svg" width="10" height="10" fill="none" viewBox="0 0 10 10">
                        <path stroke="#fff" strokeLinecap="round" d="M.5 4.884h9M4.884 9.5v-9" />
                      </svg>
                    </button>
                  </div>
                  <p className="_feed_inner_story_para">Your Story</p>
                </div>
              </div>
            </div>
          </div>

          {/* Other stories */}
          {DESKTOP_STORIES.map((s, i) => (
            <div key={i} style={{ flex: "0 0 calc(25% - 9px)", minWidth: "calc(25% - 9px)" }}>
              <div className="_feed_inner_public_story _b_radious6">
                <div className="_feed_inner_public_story_image">
                  <img src={s.img} alt="Image" className="_public_story_img" />
                  <div className="_feed_inner_pulic_story_txt">
                    <p className="_feed_inner_pulic_story_para">{s.name}</p>
                  </div>
                  <div className="_feed_inner_public_mini">
                    <img src="/assets/images/mini_pic.png" alt="Image" className="_public_mini_img" />
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Mobile story cards */}
      <div className="_feed_inner_ppl_card_mobile _mar_b16">
        <div className="_feed_inner_ppl_card_area">
          <ul className="_feed_inner_ppl_card_area_list">
            <li className="_feed_inner_ppl_card_area_item">
              <a href="#" className="_feed_inner_ppl_card_area_link">
                <div className="_feed_inner_ppl_card_area_story">
                  <img src="/assets/images/mobile_story_img.png" alt="Image" className="_card_story_img" />
                  <div className="_feed_inner_ppl_btn">
                    <button className="_feed_inner_ppl_btn_link" type="button">
                      <svg xmlns="http://www.w3.org/2000/svg" width="10" height="10" fill="none" viewBox="0 0 10 10">
                        <path stroke="#fff" strokeLinecap="round" d="M.5 4.884h9M4.884 9.5v-9" />
                      </svg>
                    </button>
                  </div>
                </div>
                <p className="_feed_inner_ppl_card_area_link_txt">Your Story</p>
              </a>
            </li>
            {[
              { img: "/assets/images/mobile_story_img1.png", name: "Ryan...", active: true },
              { img: "/assets/images/mobile_story_img2.png", name: "Karim...", active: false },
              { img: "/assets/images/mobile_story_img1.png", name: "Dylan...", active: true },
              { img: "/assets/images/mobile_story_img2.png", name: "Sarah...", active: false },
              { img: "/assets/images/mobile_story_img1.png", name: "Mike...", active: true },
              { img: "/assets/images/mobile_story_img1.png", name: "Aisha...", active: true },
            ].map((s, i) => (
              <li key={i} className="_feed_inner_ppl_card_area_item">
                <a href="#" className="_feed_inner_ppl_card_area_link">
                  <div className={s.active ? "_feed_inner_ppl_card_area_story_active" : "_feed_inner_ppl_card_area_story_inactive"}>
                    <img src={s.img} alt="Image" className="_card_story_img1" />
                  </div>
                  <p className="_feed_inner_ppl_card_area_txt">{s.name}</p>
                </a>
              </li>
            ))}
          </ul>
        </div>
      </div>
    </>
  );
}
