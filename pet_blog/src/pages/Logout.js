import React, { useEffect } from 'react'
import { Link, useNavigate, useOutletContext } from 'react-router-dom'
import paw from '../images/paw.webp'


function Logout() {
    const navigate = useNavigate()
    const { setIsAuthenticated } = useOutletContext()
    
    const logout = ()=> {
        setIsAuthenticated(null)
        localStorage.removeItem('auth')
        navigate('/login', {state:{message:'Successfully logged out.'}, replace:true})
    }

    useEffect(()=> {
        document.title = 'Logout'
    }, [])

    return (
        <div className='logout-container'>
             <Link to='/' className='navbar-brand-link'>
                <img className='navbar-brand-logo' src={paw} alt="paw" />
                <h2 className='navbar-brand-name'>
                    <span>Canine</span>
                    <span>Blog</span>
                </h2>
            </Link>
            <div className="logout-content">
                <h2>Are you sure you want to sign out?</h2>
                <button className="logout-message-logout-btn" onClick={logout}>Sign Out</button>
            </div>
        </div>
    )
}

export default Logout