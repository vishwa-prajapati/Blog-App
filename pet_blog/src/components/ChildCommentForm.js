import React, { useEffect, useRef, useState, useContext } from 'react'
import { useNavigate } from 'react-router-dom'
import { ContentLayoutContext } from '../layouts/ContentLayout'
import { createChildComment } from '../utils/api'
import { url } from '../utils/urls'

import ReactQuill from 'react-quill'


function ChildCommentForm(props) {
    const [commenting, setCommenting] = useState(false)
    const [isError, setIsError] =  useState(false)
    const { isAuthenticated } = useContext(ContentLayoutContext)
    const [showTextEditor, setShowTextEditor] = useState(false)
    const commentContent = useRef()
    const navigate = useNavigate()
    const { 
        setShowCommentForm, 
        setChildrenComments,
        post,
        setPost,
        comment,
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
                const commentURL = `${url}/api/comments/${comment.id}/comment/?url=${URLpath}`
                const newComment = commentContent.current.value
                const body = {content:newComment}
                const data = await createChildComment(commentURL, {...body, postId:post.id}, isAuthenticated.token)
                if(!data.error) {
                    e.target.reset()
                    setShowCommentForm({id:null})
                    const newCommentObj = {
                        ...data, user:isAuthenticated.username, 
                        user_image_url:isAuthenticated.profile_image_url,
                    }
                    setChildrenComments((prev)=>[newCommentObj, ...prev])
                    setPost((prev)=>(
                        {...prev, qs_count:{...prev.qs_count, 
                                comment_count:prev.qs_count.comment_count+1
                            }
                        }
                    ))
                    setCommenting(false)

                }else {
                    setIsError(data.error)
                    setCommenting(false)
                }
            }else {
                navigate('/login')
            }
        }
    }

    function showFormatTools(id) {
        setShowTextEditor(!showTextEditor)
        const qlToolbar = document.querySelector(`#${id} .ql-toolbar`)

        if (!showTextEditor) {
            qlToolbar.style.display = 'block'
        }else {
            qlToolbar.style.display = 'none'
        }
    }

    useEffect(()=> {
        const id = setTimeout(()=> {
            setIsError(false)
            clearTimeout(id)
        }, 7000)
    }, [isError])

    console.log('hello world')

    return (
        <form 
            style={{margin:'1.5rem 0'}}
            id={`child-comment-form-${comment.id}`} 
            className="comment-form child-comment-form"
            onSubmit={handleCommentSubmit}
        >
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
            <div className={`react-quill-${comment.id}`}>
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
                <button className='comment-btn-toggle-editor' type='button' onClick={(e)=> showFormatTools(e.target.parentElement.parentElement.id)}>
                    {showTextEditor? 'Hide Editor':'Show Editor'}
                </button>
                <button onClick={()=>setShowCommentForm(false)} className='comment-btn-cancel' type='button'>Cancel</button>
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

export default ChildCommentForm