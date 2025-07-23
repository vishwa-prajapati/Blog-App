import React, { useContext, useEffect, useState } from 'react'
import { Link, useLocation } from 'react-router-dom'
import { formatDate } from '../utils/formatDate'
import { ContentLayoutContext } from '../layouts/ContentLayout'
import DOMPurify from 'dompurify';


function LatestPostsSidebar() {
    const { posts } = useContext(ContentLayoutContext)
    const [ postObjs, setPostObjs] = useState(null)
    const { pathname } = useLocation()
   
    useEffect(()=> {
        const sortedPosts = posts && posts.slice(0, 3)
        .sort((a, b)=>new Date(b.date_posted)-new Date(a.date_posted))

        setPostObjs(sortedPosts)
    }, [posts])
   
    return (
        <div className="right-side-bar-container">
            <h2 className='right-side-bar-header'>Latest Posts</h2>
            <div className="side-bar-latest-posts-container">
                {postObjs && postObjs.map((post)=> {
                    return (
                        <div key={post.id} className="side-bar-latest-post">
                            <Link 
                                to={`/topic/${post.topic}/posts/?filter=${post.topic}`}
                                state={{topic:post.topic, redirect:pathname}} 
                                className='post-topic-btn'
                                style={{justifySelf:'start'}}
                            >
                                {post.topic}
                            </Link>
                            <h4 className='right-sidebar-post-title'>
                                {post.title}
                            </h4>
                            {/* <div 
                                className='right-sidebar-post-content'
                                dangerouslySetInnerHTML={{ __html: DOMPurify.sanitize(post.content.substring(0, 60)+'...') }}
                            /> */}
                            <Link 
                                to={`/post/${post.id}/detail/`} 
                                state={{redirect:pathname}} 
                                className='landing-page-featured-post-read-post-btn'
                                style={{fontSize:'0.9rem'}}
                            >
                                <span>Read More</span>
                                <i className="fa fa-chevron-right" style={{fontSize:'0.9rem', paddingTop:'0'}}></i>
                            </Link>
                        </div>
                    )
                })}
            </div>
        </div>
    )
}

export default LatestPostsSidebar