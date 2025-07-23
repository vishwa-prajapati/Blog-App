import React, { useEffect, useState } from 'react'
import { useContext } from 'react'
import { updatePost } from '../utils/api'
import { url } from '../utils/urls'
import { ContentLayoutContext } from '../layouts/ContentLayout'
import DOMPurify from 'dompurify';
import ReactQuill from 'react-quill'


function UpdatePostForm(props) {
    const [post, setPost] = useState(props.post)
    const { showUpdatePostForm, getPost } = props
    const { isAuthenticated } = useContext(ContentLayoutContext)
    const [showTextEditor, setShowTextEditor] = useState(false)

    const handleSubmit = async(e)=> {
        e.preventDefault()
        const token = isAuthenticated.token
        const newFormData = new FormData()
        const keys = Object.keys(post)
        keys.forEach((key)=>{
            newFormData.append(key, post[key])
        })
        const body = newFormData
        try {
            const data = await updatePost(`${url}/api/post/${post.id}/update/`, body, token)
            if(!data.error) {
                getPost()
                showUpdatePostForm(false)
            }else {
                console.log(data.error) 
            }
        } catch (error) {
            console.log(error.message)
        }
    }

    const handleChange = (e)=> {
        const {name, value} = e.target
        setPost((prev)=> ({...prev, [name]:value}))
    }

    function handleContentChange(value) {
        setPost((prev)=> ({...prev, content:value}))
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

    function handleFormInputFocus(e) {
        const textArea = document.querySelector('.post-edit-react-quill')
        if (textArea) {
            if (textArea.contains(e.target)) {
                textArea.style.outline = '3px solid var(--focus)'
                textArea.style.border = '1px solid transparent'
            }else {
                textArea.style.outline = 'none'
                textArea.style.border = '1px solid var(--black-80)'
            }
        }
    }

    useEffect(() => {
        window.addEventListener('click', handleFormInputFocus)
        return () => window.removeEventListener('click', handleFormInputFocus)
    }, [])

    return (
        <form id='post-edit-form' action="" className="post-detail-post-edit-form" onSubmit={handleSubmit}>
            <input 
                id='post-edit-form-input' 
                name='title' onChange={handleChange} 
                value={post.title} type="text"
            />
             <div className='post-edit-react-quill'>
                <ReactQuill
                    required 
                    onChange={handleContentChange} 
                    name="content" 
                    value={DOMPurify.sanitize(post.content)} 
                />
            </div>
            <div className="post-detail-post-edit-btns">
                <button className='comment-btn-toggle-editor' type='button' onClick={(e)=> showFormatTools(e.target.parentElement.parentElement.className)}>
                    {showTextEditor? 'Hide Editor':'Show Editor'}
                </button>
                <button 
                    onClick={()=> {
                        showUpdatePostForm(false)
                        const ele = document
                            .querySelector('.post-detail-main-container')
                        ele.scrollIntoView()
                    }} 
                    className='post-detail-post-edit-btn-cancel' 
                    type='button'
                >
                    Cancel
                </button>
                <button className='post-detail-post-edit-btn-submit' type='submit'>Update</button>
            </div>
        </form>
    )
}

export default UpdatePostForm