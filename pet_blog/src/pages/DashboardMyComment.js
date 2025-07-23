import React, { useState, useEffect, useContext } from 'react'
import { Link, Navigate, useLocation, useNavigate } from 'react-router-dom'
import { url } from '../utils/urls'
import LoadingPage from './LoadingPage'
import { fetchComments, removeComment, editComment } from '../utils/api'
import { ContentLayoutContext } from '../layouts/ContentLayout'
import { formatDate } from '../utils/formatDate'
import DOMPurify from 'dompurify'
import ReactQuill from 'react-quill'


function DashboardMyComment() {
  const [comments, setComments] = useState(null)
  const [update, setUpdate] = useState(null)
  const [isError, setIsError] = useState(false)
  const [isLoading, setIsLoading] = useState(true)
  const navigate = useNavigate()
  const {state, pathname} = useLocation()
  const { isAuthenticated } = useContext(ContentLayoutContext)
  const [showTextEditor, setShowTextEditor] = useState(false)


  const deleteComment = async(id)=> {
    const obj = {isMyComment:true}
    try {
      const data = await removeComment(`${url}/api/comment/${id}/delete/`, isAuthenticated.token, obj)
      if(!data.error){
        const new_comment_array = comments.filter((comment)=> comment.id !== id)
        setComments(new_comment_array)
        setIsLoading(false)
        console.log(data)

      }else{
        console.log(data.message)
        setIsLoading(false)
        navigate('/error', {replace:true, state:{message:{error:`${data.error}`}}})
        
      }

    } catch (error) {
      console.log(error.message)
      setIsLoading(false)
      navigate('/error', {replace:true, state:{message:{error:`${error.message}`}}})
    }

  }

  const updateComment = async(e, id)=> {
    e.preventDefault()
    const body = {content:update.content, user:isAuthenticated.username}
    try {
      const data = await editComment(`${url}/api/comment/${id}/update/`, body, isAuthenticated.token)
      if(!data.error) {
        const newComments = comments.map((comment)=> {
          if(comment.id === data.id){
            return data
          }else {
            return comment
          }
        })
        setComments(newComments)
        setUpdate(null)
        setIsLoading(false)

      }else {
        console.log(data.error)
      }

    } catch (error) {
      console.log(error.message)
    }
  }

  const handleChange = (value)=> {
    // const {name, value} = e.target
    setUpdate((prev)=>({...prev, content:value}))
  }

  function showFormatTools(className) {
	setShowTextEditor(!showTextEditor)
	const qlToolbar = document.querySelector(`.${className} .ql-toolbar`)

	if (!showTextEditor) {
		qlToolbar.style.display = 'block'
	}else {
		qlToolbar.style.display = 'none'
	}
}


  useEffect(()=> {
    const getComments = async()=> {
      const data = await fetchComments(`${url}/api/my-comment/`, isAuthenticated.token)
      if(data.length !== 0) {
        setComments(data)
      }
      setIsLoading(false)
    }
    getComments()
  }, [])

  if(!isAuthenticated) {
    return (
      <Navigate to='/login'  replace={true} state={{error:'Please login to see your comment!', redirect:pathname}}/>
    )
  }

  if(isLoading) {
      return (
          <LoadingPage />
      )
  }
 
  return (
    <React.Fragment>
      {comments ?
        <div className='my-comments-container'>
          {comments.map((comment)=> {
            return (
              <div key={comment.id} className="my-comments-container__my-comment">
                <p className='my-comments__date-replied'>
                  {formatDate(comment.date_posted)}
                </p>
                <Link className='my-comments__post-name-link' to={`/post/${comment.post_id}/detail/`}>{comment.post}</Link>
                <div className='my-comments__content'
                  dangerouslySetInnerHTML={{ __html: DOMPurify.sanitize(comment.content)}}/>
                <div className="my-comments-container__buttons">
                  <button
                    onClick={()=>setUpdate({content:comment.content, id:comment.id})} 
                    className='my-comments__update-button'
                  >
                    <i className="fa-solid fa-pen"></i>
                    Edit
                  </button>
                  <button
                    onClick={()=>deleteComment(comment.id)} 
                    className='my-comments__delete-button'
                  >
                    <i className="fa-solid fa-trash-can"></i>
                    Remove
                  </button>
                </div>
                {update && update.id === comment.id &&
                  <div className="update-comment-form-container">
                    <form action="" className="update-comment-form" onSubmit={(e)=>updateComment(e,comment.id)}>
						<div className='update-comment-textarea'>
							<ReactQuill
								onChange={handleChange} 
								name="content" 
								value={DOMPurify.sanitize(update.content)} 
							/>
						</div>

                      <div className="update-comment-form-buttons-container">
					  	<button className='comment-btn-toggle-editor' type='button' onClick={(e)=> showFormatTools(e.target.parentElement.parentElement.className)}>
							{showTextEditor? 'Hide Editor':'Show Editor'}
						</button>
						<button onClick={()=>setUpdate(null)} type='button' className='update-comment-cancel-btn'>Cancel</button>
                        <button type='submit' className='update-comment-submit-btn'>Update</button>
                      </div>
                    </form>
                  </div>
                }
              </div>
            )
          })}
        </div>
      :
        <div className="no-topic-post-container my-comment-no-comment">
          <div className="no-topic-post-text-container">
              <h3 className="no-topic-post-header">Comments not available!</h3>
              <p className='no-topic-post-text'>
                  Please pick a post and comment.
              </p>
              <Link className='no-topic-post-create-btn' to='/posts'>
                <span>See posts</span>
                <i className="fa fa-chevron-right"></i>
              </Link>
          </div>
        </div>
      }
    </React.Fragment>
  )
}

export default DashboardMyComment