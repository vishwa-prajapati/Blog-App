import React, { useState, useEffect, useContext } from 'react'
import { useLocation, Navigate, Link} from 'react-router-dom'
import { getMyData, deletePost } from '../utils/api'
import LoadingPage from './LoadingPage'
import { url } from '../utils/urls'
import { formatDate } from '../utils/formatDate'
import { ContentLayoutContext } from '../layouts/ContentLayout'
import DOMPurify from 'dompurify';


function DashboardMyPost() {
	const [posts, setPosts] = useState(null)
	const [isError, setIsError] = useState(false)
	const [isLoading, setIsLoading] = useState(true)
	const {pathname} = useLocation()
	const [ scrollHeight, setScrollHeight] = useState(window.pageYOffset)
	const {isAuthenticated} = useContext(ContentLayoutContext)
	const [showContent, setShowContent] = useState(false)


	const getMyPosts = async()=> {
		const data = await getMyData(`${url}/api/my-post/`, isAuthenticated.token)
		if(data.error || data.message || data.length === 0) {
			setIsLoading(false)

		}
		else {
			const objs = data.sort((a, b)=>new Date(b.date_posted)-new Date(a.date_posted))
			setPosts(objs)
			setIsLoading(false)
		}
	}

	const removePost = async(e, post)=> {
		const data = await deletePost(`${url}/api/post/${post.id}/delete/`, isAuthenticated.token)
		if(!data.error) {
			const newPostArray = posts.filter((obj)=>obj.id !== post.id)
			setPosts(newPostArray)
			console.log(data.message)

		}else {
			setIsError({error:data.error})
		}
	}

	function showContentOrHide(e, postID) {
		if(showContent === postID) {
			setShowContent(false)
			e.currentTarget.lastElementChild.style.transform = 'rotate(0deg)'
		}
		else {
			setShowContent(postID)
			e.currentTarget.lastElementChild.style.transform = 'rotate(180deg)'
		}
	}

	useEffect(()=> {
		getMyPosts()
	}, [])

	if(!isAuthenticated) {
		return (
			<Navigate 
				to='/login' 
				replace={true} 
				state={
					{redirect:pathname ,error:'Please login to see your post!'}
				}
			/>
		)
	}

	if(isLoading) {
		return (
			<LoadingPage />
		)
	}

	if(isError) {
		return (
			<Navigate 
				to='/error' 
				replace={true} 
				state={
					{message:{error:isError.error,name:isError.name}}
				}
			/>
		)
	}

	return (
		<React.Fragment>
			<div className='my-posts-container'>
				{!posts ?
					<div className="no-topic-post-container">
						<div className="no-topic-post-text-container">
							<h3 className="no-topic-post-header">Posts not available!</h3>
							<p className="no-topic-post-text">
								Please pick a topic and create a post to start a new conversation.
							</p>
							<Link className="no-topic-post-create-btn" to='/create/post'>
							<span>Create Post</span>
							<i className="fa fa-chevron-right"></i>
							</Link>
						</div>
					</div> 
				: 
					<div className="my-posts-container__posts">
						{posts.map((post)=> {
							return (
								<div key={post.id} className="my-posts-container__post">
									<div className="my-posts-container__post-image-container">
										<img className='my-posts-container__post-image' src={post.image_url} alt={post.title} /> 
										<div className='landing-page-post-image-background-overlay'></div> 
									</div>
									<div className='my-posts-container__post-contents'>
										<h3 className='my-posts-container__post-title'>{post.title}</h3>
										<p className='my-posts-container__date-posted'>{formatDate(post.date_posted)}</p>
										{post.content.length > 100 &&
											<button className='my-post-content-show-or-hide' onClick={(e)=>showContentOrHide(e, post.id)}>
												{showContent && showContent === post.id ? 'Minimize content' : 'Show full content'}
												<i className='fas fa-chevron-down'></i>
											</button>
										}
										{post.content.length > 100 ?
												showContent && showContent === post.id ? 
													<div 
														className='my-posts-container__post-content'  
														dangerouslySetInnerHTML={{ __html:DOMPurify.sanitize(post.content) }}
													/>
												:
													<div 
														className='my-posts-container__post-content' 
														dangerouslySetInnerHTML={{ 
															__html:DOMPurify.sanitize(post.content.substring(0, 100)+'...')
														}}
													/>
											:
											<div dangerouslySetInnerHTML={{ __html:DOMPurify.sanitize(post.content) }}/>
										}
										<div className='my-post-container__btns'>
											<div className='my-post-container__post-like'>
												<i className="fa-solid fa-hands-clapping"></i>
												<span>{post.qs_count.like_count}</span>
											</div>
											<div className='my-post-container__num-of-replies'>
												<i className="fa-solid fa-comment"></i>
												<span>{post.qs_count.comment_count}</span>
											</div>
											<Link 
												to={`/update/${post.id}/post`} state={{update:post, redirect:pathname, name:'Dashboard Posts'}} 
												className='my-posts-container__post-update'
											>
												<i className="fa-solid fa-pen"></i>
												<span>Edit</span>
											</Link>
											<button onClick={(e)=>removePost(e, post)} className='my-posts-container__post-delete'>
												<i className="fa-solid fa-trash-can"></i>
												<span>Remove</span>
											</button>
										</div>
									</div>
								</div>
							)
						})}
					</div>
				}
			</div>
		</React.Fragment>
	)
}

export default DashboardMyPost