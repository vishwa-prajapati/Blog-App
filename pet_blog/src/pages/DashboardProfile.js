import React, { useContext, useEffect, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { ContentLayoutContext } from '../layouts/ContentLayout'
import { updateProfile } from '../utils/api'
import { url } from '../utils/urls'

function DashboardProfile() {
	const [isUpdating, setIsUpdating] = useState(false)
	const { isAuthenticated, setIsAuthenticated } = useContext(ContentLayoutContext)
	const [profile, setProfile] = useState({
		username:'', image:'', first_name:'', last_name:'', email:''})
	const [selected, setSelected ] = useState(null)
	const navigate = useNavigate()

	const handleSubmit = async(e)=> {
		e.preventDefault()
		setIsUpdating(true)
		const updateProfileURL = `${url}/api/auth/update/profile/`
		const formData = new FormData()
		const keys = Object.keys(profile)

		keys.forEach((key)=> {
		if (key === "image") {
			if (profile[key] instanceof Object) {
			formData.append(key, profile[key][0])
			}else {
			formData.append(key, profile[key])
			}
		}else {
			formData.append(key, profile[key])
		}
		})
		const body = formData
		const data = await updateProfile(updateProfileURL, body, isAuthenticated.token)
		
		if (data.message === 'Profile updated successfully' 
		&& profile.username !== isAuthenticated.username) {
		setIsAuthenticated(null)
		window.localStorage.removeItem('auth')
		navigate('/login',{state:{
				message:'Your username has been change. Please log back in again.',
				redirect:`/user/${profile.username}/dashboard/profile/`
			}
			}
		)
		}else if (data.message === 'Profile updated successfully') {
		setIsAuthenticated(data)
		window.localStorage.removeItem('auth')
		window.localStorage.setItem('auth', JSON.stringify(data))
		}
		const timeOutID = setTimeout(() => {
		setIsUpdating(false)
		clearTimeout(timeOutID)
		}, 1000)
	}

	function handleChange(e) {
		const {name, value, files} = e.target
		if (name === 'image') {
			setProfile((prev)=> ({...prev, [name]:files}))
			const  imgName = e.target.files[0].name
            setSelected(imgName)
		}else {
			setProfile((prev)=> ({...prev, [name]:value}))
		}
	}

	useEffect(()=> {
		if (isAuthenticated) {
			setProfile((prev)=> {
			const userInfo = {
				...prev,
				username: isAuthenticated.username,
				image: isAuthenticated.image,
				first_name: isAuthenticated.first_name || '',
				last_name: isAuthenticated.last_name || '',
				email: isAuthenticated.email || ''
			}
			return userInfo
			})
		}
	}, [])

	function removeSelectedImage(ele) {
		setSelected(null)
		setProfile((prev)=>({...prev, image:''}))
		ele.value = ''
	}

	function removeDivImageInputContainerFocus(e) {
        const profileFormInputImageContainer = document
            .querySelector('.profile-form-input-image-container')
        const imageInputContainer = document
            .querySelector('.create-post-image-input-wrapper')

        if ( profileFormInputImageContainer) {
            if ( profileFormInputImageContainer.contains(e.target)) {
                imageInputContainer.style.outline = '3px solid var(--focus)'
            }

            if (!profileFormInputImageContainer.contains(e.target)) {
                imageInputContainer.style.outline = 'none'
                imageInputContainer.style.border = '1px solid var(--black-80)'
            }
        }
    }

	useEffect(() => {
        window.addEventListener(
            'click', removeDivImageInputContainerFocus
        )
        return () => window.removeEventListener(
            'click', removeDivImageInputContainerFocus
        )
    }, [])

	return (
		<div className="profile-form-container">
			<form className='profile-form' onSubmit={handleSubmit}>
			<div className='profile-form-input'>
				<label htmlFor="username">Username</label>
				<input autoFocus={true} onChange={handleChange} id='username' value={profile.username} type="text" name='username'/>
			</div>
			<div className="profile-form-input profile-form-input-image-container">
				<label htmlFor="img">Image</label>
				<div className='create-post-image-input-wrapper'>
					<label className='create-post-hidden-input-label'>
						<div className='create-post-upload-btn'>
							<i className="fa-solid fa-upload"></i>
							<span>Upload</span>
						</div>
						<input 
							style={{display:'none'}}
							id='image' 
							onChange={handleChange} 
							type="file" 
							accept='image/*' 
							name='image' 
							className='image-input' 
						/>
					</label>
					{selected &&
						<div className='create-post-selected-image'>
							<span>{selected}</span>
							<button 
								className='create-post-remove-btn'
								type='button' 
								onClick={(e)=>{
									const ele = e.currentTarget.parentElement
									.previousElementSibling.lastElementChild
									removeSelectedImage(ele)
								}}
							>
								<i className='fas fa-close'></i>
							</button>
						</div>
					}
				</div>
			</div>
			<div className='profile-form-input'>
				<label htmlFor="first">First Name</label>
				<input onChange={handleChange} id='first' value={profile.first_name} type="text" name='first_name'/>
			</div>
			<div className='profile-form-input'>
				<label htmlFor="last">Lat Name</label>
				<input onChange={handleChange} id='last' value={profile.last_name} type="text" name='last_name'/>
			</div>
			<div className='profile-form-input'>
				<label htmlFor="email">Email</label>
				<input onChange={handleChange} id='email' value={profile.email} type="email" name='email'/>
			</div>
			<button className='profile-update-btn' type="submit">
				{isUpdating ? 
				<div className='btn-animation-container'>
					Updating...<p className='registering-animation'></p>
				</div> 
				: 'Update'
				}
			</button>
			</form>
		</div>
	)
}

export default DashboardProfile