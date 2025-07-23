import React, { useContext, useEffect, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { editComment } from '../utils/api'
import { url } from '../utils/urls'
import { ContentLayoutContext } from '../layouts/ContentLayout'
import DOMPurify from 'dompurify';
import ReactQuill from 'react-quill'


function UpdateCommentForm(props) {
    const [comment, setComment] = useState(props.comment)
    const [isError, setIsError] =  useState(false)
    const {setShowCommentEditForm, setComments, getPost} = props
    const { isAuthenticated } = useContext(ContentLayoutContext)
    const [showTextEditor, setShowTextEditor] = useState(false)
    
    const handleSubmit = async(e)=> {
        e.preventDefault()
        try {
            const data = await editComment(`${url}/api/comment/${comment.id}/update/`, comment, isAuthenticated.token)
            if(!data.error){
                if(!comment.parent_id) {
                    setComments((prev)=> prev.map((commentObj)=> commentObj.id === comment.id ? comment : commentObj))
                }else {
                    getPost()
                }
                e.target.reset()
                setShowCommentEditForm(false)

            }else {
                console.log(data.error)
                setIsError(data.error)
            }
        } catch (error) {
            console.log(setIsError(error.message))
        }
    }
    
    const handleChange = (value)=> {
        setComment((prev)=> ({...prev, content:value}))
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

    return (
        <form className='post-detail-update-comment-form' onSubmit={handleSubmit}>
            {isError && <p style={{color:'orangered'}}>{isError}</p>}
             <div>
                <ReactQuill
                    required 
                    onChange={handleChange} 
                    name="content" 
                    value={DOMPurify.sanitize(comment.content)} 
                />
            </div>
            <div className="post-detail-update-comment-form-btns">
                <button className='comment-btn-toggle-editor' type='button' onClick={(e)=> showFormatTools(e.target.parentElement.parentElement.className)}>
                    {showTextEditor? 'Hide Editor':'Show Editor'}
                </button>
                <button className='post-detail-update-comment-cancel-btn' onClick={()=>setShowCommentEditForm(false)} type='button'>Cancel</button>
                <button className='post-detail-update-comment-update-btn' type='submit'>Update</button>
            </div>
        </form>
    )
}

export default UpdateCommentForm