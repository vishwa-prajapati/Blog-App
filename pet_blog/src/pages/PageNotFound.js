import React from 'react'
import { Link } from 'react-router-dom'
import dogImg from '../images/cartoon_dog.png'


const pageNotFoundContainer = {
  width: '90%',
  minHeight: '100dvh',
  margin: '0 auto',
  padding: '4rem 0',
  display: 'grid',
  alignContent: 'start',
  justifyContent: 'center',
  alignItems: 'start',
  gap: '1rem',
  textAlign: 'center'
}

const dogImageContainer = {
	width: '180px',
	margin: '0 auto'
}

const dogImage = {
  width: '100%',
  height: 'auto',
  display: 'block',
  marginBottom: '1rem'
}

const pageNotFoundHeader = {
	color: 'var(--black-15)',
	fontWeight: '600',
}

const pageNotFoundText = {
	color: 'var(--black-20)',
	letterSpacing: '0.03rem',
	maxWidth: '400px',
	margin: '0 auto',
	lineHeight: '1.4'
}

const pageNotFoundBackHomeBtn = {
	padding: '1rem 1.5rem',
	color: 'white',
	background: 'var(--cta)',
	borderRadius: '30px',
	justifySelf: 'center',
	marginTop: '0.5rem',
	fontSize: '1.1rem',
	fontWeight: '500'
}

function PageNotFound() {
  return (
    <div style={pageNotFoundContainer}>
        <div style={dogImageContainer}>
    		<img style={dogImage} src={dogImg} alt="funny-dog" />
        </div>
        <h2 style={pageNotFoundHeader}>Oops! We can't find that page.</h2>
		<p style={pageNotFoundText}>
			The link you followed may be broken or page may have been removed.
		</p>
        <Link to='/posts' style={pageNotFoundBackHomeBtn}>
			Back to Posts
        </Link>
    </div>
  )
}

export default PageNotFound