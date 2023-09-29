import React from "react";
import { Swiper, SwiperSlide } from "swiper/react";
import { Navigation, Autoplay, EffectCube } from "swiper";
import "swiper/css";
import "swiper/css/navigation";
import "swiper/css/autoplay"
import "swiper/css/effect-cube";

import "./PictureSlider.css"

function PictureSlider( {pics} ) {

  return (
    <>
        <Swiper navigation={true} 
                modules={[Navigation, Autoplay, EffectCube]} 
                className="mySwiper"
                effect="cube"
                cubeEffect={{
                    shadow: true,
                    slideShadows: true,
                    shadowOffset: 22,
                    shadowScale: 1.0,

                    // shadowOffset: 20,
                    // shadowScale: 0.94,
                }}
          
                loop={true}
                autoplay={{ delay: 2500, disableOnInteraction: false }}
                slidesPerView={1}
        >
            { pics.map( ( pic, id ) => (
                <SwiperSlide key={id}>
                    <img src={ pic } alt="" />
                </SwiperSlide>
            ))}

{/* 
            { props.data.map ((rec, id) => (
            <SwiperSlide key={id} className="">
                <Link to={`/recipe/${rec._id}`} >
                    <img src={rec.picture} alt="" 
                        className="pic" 
                        style={{ height: "100%", width: "100%" }}
                    />
                </Link>
            </SwiperSlide>
            ))}
*/}
        </Swiper>
    </>
  )
}

export default PictureSlider;