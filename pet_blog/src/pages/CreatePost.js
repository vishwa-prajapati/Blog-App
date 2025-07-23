import React, { useEffect, useState, useContext } from 'react'
import { Navigate, useNavigate, useLocation, Link} from 'react-router-dom'
import LoadingPage from './LoadingPage'
import { getTopicData, createPost, updatePost } from '../utils/api'
import { validatePost } from '../utils/validators'
import { url } from '../utils/urls'
import { ContentLayoutContext } from '../layouts/ContentLayout'
import paw from '../images/paw.webp'
import ReactQuill from 'react-quill'


function CreatePost() {
    const [post, setPost] = useState({image:'',topic:'',title:'',content:''})
    const [topics, setTopics] = useState(null)
    const [isError, setIsError] = useState(false)
    const [isLoading, setIsLoading] = useState(true)
    const [missingValue, setMissingValue] = useState(null)
    const {isAuthenticated} = useContext(ContentLayoutContext)
    const [selected, setSelected ] = useState(null)
    const {state, pathname} = useLocation()
    const navigate = useNavigate()
    const [showTextEditor, setShowTextEditor] = useState(false)
    const [submiting, setSubmiting] = useState(false)

    
    const handleSubmit = async(e)=> {
        e.preventDefault()
        setMissingValue(null)
        const form = new FormData()
        const obj = validatePost(post)
       
        if(obj !== 'valid') {
            setMissingValue(obj)

        }else {
            setSubmiting(true)
            const keys = Object.keys(post)
            keys.forEach((key)=>{
                if(key === 'image'){
                    if (post[key] instanceof Object) {
                        form.append(key, post[key][0])
                    }else {
                        form.append(key, post[key])
                    }
                }else {
                    form.append(key, post[key])
                }
            })

            const data = await createPost(`${url}/api/create/`, form, isAuthenticated.token)
            
            if(data.message === 'Successfully created'){
                setSubmiting(false)
                setPost({image:'',topic:'',title:'',content:''})
                navigate(`/post/${data.id}/detail`, {state:{message:data.message}})
            }
            else if (data.error) {
                setSubmiting(false)
                console.log(data.error)
            }
        }
    }

    function handleChange(e) {
        const {name, value} = e.target 
        if (name === 'image') {
            setPost((prev)=>({...prev, [name]:e.target.files})) 
            const  imgName = e.target.files[0].name
            setSelected(imgName)
        }
        else {
            setPost((prev)=>({...prev, [name]:value})) 
        }
    }

    function handleReactQuillContent(value) {
        setPost((prev) => ({...prev, content:value}))
    }

    function removeSelectedImage(ele) {
        setSelected(null)
        setPost((prev)=>({...prev, image:''}))
        ele.value = ''
    }

    function removeDivImageInputContainerFocus(e) {
        const createPostImageInputContainer = document
            .querySelector('.create-post-img-input-container')
        const createPostTextareaContainer = document
            .querySelector('.create-post-textarea-container')
        const imageInputWrapper = document
            .querySelector('.create-post-image-input-wrapper')
        const quillTextarea = document
            .querySelector('.create-post-react-quill-textarea')

        if (createPostImageInputContainer || createPostTextareaContainer) {

            if (createPostImageInputContainer.contains(e.target)) {
                imageInputWrapper.style.outline = '3px solid var(--focus)'
            }
            if (createPostTextareaContainer.contains(e.target)) {
                quillTextarea.style.outline = '3px solid var(--focus)'
            }

            if(!createPostTextareaContainer.contains(e.target)) {
                quillTextarea.style.outline = 'none'
                quillTextarea.style.border = '1px solid var(--black-80)'
            }
            if (!createPostImageInputContainer.contains(e.target)) {
                imageInputWrapper.style.outline = 'none'
                imageInputWrapper.style.border = '1px solid var(--black-80)'
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
 
    const getData = async()=> {
        try {
            const data = await getTopicData(`${url}/api/topics/`)
            const topicArray = data.map((topic)=>topic.name)
            setTopics(topicArray)
            setIsLoading(false)
        } 
        catch ({message}) {
            setIsLoading(false)
            setIsError(true)
        }
    }

    useEffect(()=>{
        getData()
        document.title = 'Create Post'
    }, [])

    useEffect(() => {
        window.addEventListener(
            'click', removeDivImageInputContainerFocus
        )
        return () => window.removeEventListener(
            'click', removeDivImageInputContainerFocus
        )
    }, [])

    if(!isAuthenticated) {
        return (
            <Navigate to='/login' replace={true} state={{error:'Please login first!', redirect:pathname}}/>
        )
    }
    if(isLoading) {
        return (
            <LoadingPage />
        )
    }
    if(isError) {
        return (
            <h2>There was an unknown server error!</h2>
        )
    }
    return (
        <div className='create-post-container'>
            <Link to='/' className='navbar-brand-link'>
                <img className='navbar-brand-logo' src={paw} alt="paw" />
                <h2 className='navbar-brand-name'>
                    <span>Canine</span>
                    <span>Blog</span>
                </h2>
            </Link>
            <div className="create-post__form-container">
                <h2 className='user-login__header'>Create Post</h2>
                <form className="create-post__form" onSubmit={handleSubmit}>
                    <div className="create-post-select-topic-container">
                        <label className='create-post__label' htmlFor="topic">Topic</label>
                        {missingValue && missingValue.topic === '' && <p className='create-post__error'>This field is required.</p>}
                        <select autoFocus={true} id='topic' onChange={handleChange} className='create-post__select' name="topic" value={post.topic}>
                            <option className='create-post__option' value=''>Please choose a topic</option>
                            {topics.map((topic)=>{
                                return (
                                    <option className='create-post__option' key={topic} value={topic}>
                                        {topic}
                                    </option>
                                )
                            })}
                        </select>
                    </div>
                    <div className='create-post-img-input-container'>
                        <label className='create-post__img-input-label' htmlFor="image">Image</label>
                        {missingValue && missingValue.image === '' && <p className='create-post__error'>This field is required.</p>}
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
                                    className='create-post__img-input'
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
                    <div className='create-post-title-input-container'>
                        <label className='create-post__label' htmlFor="title">Title</label>
                        {missingValue && missingValue.title === '' && <p className='create-post__error'>This field is required.</p>}
                        <input id='title' onChange={handleChange} className='create-post__input' type="text" value= {post.title} name='title'/>
                    </div>
                    <div className="create-post-textarea-container" >
                        <label className='create-post__label' htmlFor="content">Content</label>
                        {missingValue && missingValue.content === '' && <p className='create-post__error'>This field is required.</p>}
                        <div className='create-post-react-quill-textarea'>
                            <ReactQuill
                                id='content' 
                                onChange={handleReactQuillContent} 
                                name="content" 
                                className='create-post__textarea' 
                                value= {post.content}
                            />
                        </div>
                    </div>
                    <div className='create-post-btns'>
                        <button className='comment-btn-toggle-editor' type='button' onClick={showFormatTools}>
                            {showTextEditor? 'Hide Editor':'Show Editor'}
                        </button>
                        <Link to='/posts' className='create-post-cancel-btn'>Cancel</Link>
                        <button className='create-post__btn' type='submit'>
                            {submiting ?
                                <div style={{display:'flex',gap:'0.3rem',alignItems:'center', fontSize:'0.85rem'}}>
                                    Submit...<p style={{width:'20px'}} className='registering-animation'></p>
                                </div>
                                : 'Comment'
                            }
                        </button>
                    </div>
                </form>
            </div>
        </div>
    )
}

export default CreatePost