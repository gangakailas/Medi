import React from 'react'

const Hero = ({title, imageUrl}) => {
  return (
    <div className='hero container'>
        <div className="banner">
            <h1>{title}</h1>
            <p>
            Say goodbye to endless waiting rooms and hello to a 
            better way of booking your health appointments! Whether 
            you’re after the perfect doctor or just need a quick chat 
            with a healthcare pro, we’ve got you covered. Need an online 
            consultation? No problem — we’ll connect you faster than you 
            can say “checkup!” At MediConnect, we believe in making 
            health care as easy as ordering your favorite coffee — only 
            with fewer long lines and more personalized care. So, let’s 
            get started — your health deserves the VIP treatment!
            </p>
        </div>
        <div className="banner">
            <img src={imageUrl} alt="hero" className="animated-image"/>
            <span>
                <img src="/Vector.png" alt="vector " />
            </span>
        </div>
    </div>
  )
}

export default Hero