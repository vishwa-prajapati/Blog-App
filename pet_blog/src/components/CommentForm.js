import React, { useEffect, useRef, useState, useContext } from 'react'
import { Navigate, useNavigate } from 'react-router-dom'
import { ContentLayoutContext } from '../layouts/ContentLayout'
import { url } from '../utils/urls'
import { createComment } from '../utils/api'
import ReactQuill from 'react-quill'



function CommentForm(props) {
    const [commenting, setCommenting] = useState(false)
    const [isError, setIsError] =  useState(false)
    const { isAuthenticated } = useContext(ContentLayoutContext)
    const [showTextEditor, setShowTextEditor] = useState(false)
    const commentContent = useRef()
    const navigate = useNavigate()
    const { 
        setShowCommentForm, 
        post,
        setPost, 
        comments, 
        setComments
    } = props
    
    const handleCommentSubmit = async(e)=> {
        const qlEditor = document.querySelector('.ql-editor')
        e.preventDefault()

        if(!commentContent.current.value || 
            commentContent.current.value === "<p><br></p>") {
            setIsError('This field can\'t be empty.')
        }
        else {
            setCommenting(true)
            qlEditor.innerHTML = ''

            if(isAuthenticated) {
                const URLpath = window.location.href
                const commentURL = `${url}/api/post/${post.id}/create/comment/?url=${URLpath}`
                const newComment = commentContent.current.value
                const body = {content:newComment}
                const data = await createComment(commentURL, body, isAuthenticated.token)
                if(!data.error) {
                    e.target.reset()
                    setShowCommentForm(false)
                    const newCommentObj = {
                        ...data, user:isAuthenticated.username, 
                        user_image_url:isAuthenticated.profile_image_url
                    }
                    setPost((prev)=>({...prev, qs_count:{...prev.qs_count, comment_count:prev.qs_count.comment_count+1}}))
                    setComments((prev)=> comments ? [newCommentObj, ...prev] : [newCommentObj])
                    setCommenting(false)

                }else {
                    setIsError(data.error)
                    setCommenting(false)
                }
            }else {
                navigate('/login', {replace:true})
           }
        }
    }

    function showFormatTools() {
        setShowTextEditor(!showTextEditor)
        const qlToolbar = document.querySelector('.ql-toolbar')

        if (!showTextEditor) {
            qlToolbar.style.display = 'block'
        }else {
            qlToolbar.style.display = 'none'
        }
    }

    function handleFormInputFocus(e) {
        const form = document.querySelector('.comment-form')
        if (form) {
            if (form.contains(e.target)) {
                form.style.outline = '3px solid var(--focus)'
                form.style.border = '1px solid transparent'
            }else {
                form.style.outline = 'none'
                form.style.border = '1px solid var(--black-80)'
            }
        }
    }

    useEffect(() => {
        window.addEventListener('click', handleFormInputFocus)
        return () => window.removeEventListener('click', handleFormInputFocus)
    }, [])

    // useEffect(()=> {
    //     const id = setTimeout(()=> {
    //         setIsError(false)
    //         clearTimeout(id)
    //     }, 10000)
    // }, [isError])

    return (
        <form action="" className="comment-form" onSubmit={handleCommentSubmit}>
            {isError && 
                <p style={{
                        color:'var(--error-text)',
                        display:'flex', 
                        gap:'2rem',
                        alignItems: 'center'
                    }}
                >
                    {isError}
                    <button onClick={() => setIsError(false)} 
                        style={{
                            background:'none', 
                            color:'var(--black-40)', 
                            border: 'none',
                            lineHeight:'0',
                            marginTop:'0.2rem',
                            fontSize:'1rem'
                        }}
                    >
                        <i className='fas fa-close'></i>
                    </button>
                </p>
            }
            <div>
                <ReactQuill
                    required 
                    id='comment' 
                    name='comment'
                    ref={commentContent}
                    placeholder='Add a comment'
                    theme="snow"
                />
            </div>
            <div className="comment-btns">
                <button className='comment-btn-toggle-editor' type='button' onClick={showFormatTools}>
                    {showTextEditor? 'Hide Editor':'Show Editor'}
                </button>
                <button className='comment-btn-submit' type='submit'>
                    {commenting ?
                        <div style={{display:'flex',gap:'0.3rem',alignItems:'center', fontSize:'0.85rem'}}>
                            Submit...<p style={{width:'20px'}} className='registering-animation'></p>
                        </div>
                        : 'Comment'
                    }
                </button>
                
            </div>
        </form>
    )
}

export default CommentForm