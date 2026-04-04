export default function StoryCards() {
  return (
    <>
      {/* Desktop story cards */}
      <div className="_feed_inner_ppl_card _mar_b16">
        <div className="_feed_inner_story_arrow">
          <button type="button" className="_feed_inner_story_arrow_btn">
            <svg xmlns="http://www.w3.org/2000/svg" width="8" height="14" fill="none" viewBox="0 0 8 14">
              <path stroke="#fff" strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M7 1L1 7l6 6" />
            </svg>
          </button>
        </div>
        <div className="_feed_inner_profile_story _b_radious6">
          <div className="_feed_inner_profile_story_image">
            <img src="/assets/images/card_ppl1.png" alt="Image" className="_profile_story_img" />
            <div className="_feed_inner_story_txt">
              <div className="_feed_inner_story_btn">
                <button className="_feed_inner_story_btn_link">
                  <svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" fill="none" viewBox="0 0 14 14">
                    <circle cx="7" cy="7" r="6" stroke="#fff" strokeWidth="2" />
                    <path stroke="#fff" strokeLinecap="round" strokeWidth="2" d="M7 4v3l2 2" />
                  </svg>
                </button>
              </div>
              <p className="_feed_inner_story_para">Your Story</p>
            </div>
          </div>
        </div>
        <div className="_feed_inner_public_story _b_radious6">
          <div className="_feed_inner_public_story_image">
            <img src="/assets/images/card_ppl2.png" alt="Image" className="_public_story_img" />
            <div className="_feed_inner_pulic_story_txt">
              <p className="_feed_inner_pulic_story_para">Ryan Roslansky</p>
            </div>
          </div>
        </div>
        <div className="_feed_inner_public_story _b_radious6">
          <div className="_feed_inner_public_story_image">
            <img src="/assets/images/card_ppl3.png" alt="Image" className="_public_story_img" />
            <div className="_feed_inner_pulic_story_txt">
              <p className="_feed_inner_pulic_story_para">Ryan Roslansky</p>
            </div>
          </div>
        </div>
        <div className="_feed_inner_public_story _b_radious6">
          <div className="_feed_inner_public_story_image">
            <img src="/assets/images/card_ppl4.png" alt="Image" className="_public_story_img" />
            <div className="_feed_inner_pulic_story_txt">
              <p className="_feed_inner_pulic_story_para">Ryan Roslansky</p>
            </div>
          </div>
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
                      <svg xmlns="http://www.w3.org/2000/svg" width="12" height="12" fill="none" viewBox="0 0 12 12">
                        <path stroke="#fff" strokeLinecap="round" strokeWidth="2" d="M6 1v10M1 6h10" />
                      </svg>
                    </button>
                  </div>
                </div>
                <p className="_feed_inner_ppl_card_area_link_txt">Your Story</p>
              </a>
            </li>
            {[
              { img: "/assets/images/mobile_story_img1.png", name: "Ryan...", active: true },
              { img: "/assets/images/mobile_story_img2.png", name: "Ryan...", active: false },
              { img: "/assets/images/mobile_story_img1.png", name: "Ryan...", active: true },
              { img: "/assets/images/mobile_story_img2.png", name: "Ryan...", active: false },
              { img: "/assets/images/mobile_story_img1.png", name: "Ryan...", active: true },
              { img: "/assets/images/mobile_story_img1.png", name: "Ryan...", active: true },
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
