import React from 'react'

const Biography = ({imageUrl}) => {
  return (
    <div className='container biography'>
        <div className="banner">
            <img src={imageUrl} alt="about Img" />
        </div>
        <div className="banner">
            <p>Biography</p>
            <h3>Who We Are</h3>
            <p>
                At MediConnect, we aim to simplify healthcare access with a 
                user-friendly platform that makes booking doctor appointments, 
                whether in-person or online, hassle-free. Patients can easily 
                browse doctors by department, schedule appointments, and track 
                their health journey, all from one place. 
            </p>
            <p>
                Our platform provides secure communication and real-time appointment 
                updates, ensuring users stay connected to healthcare providers. 
                Even in remote or quarantine situations, MediConnect enables patients 
                to access the care they need. We empower users to take control of their 
                health while offering healthcare providers an efficient system for 
                managing appointments and patient interactions.
            </p>
            
        </div>
    </div>
  )
}

export default Biography