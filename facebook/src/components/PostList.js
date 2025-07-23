// src/components/PostList.js
import React, { useEffect, useState } from 'react';
import axios from 'axios';
import Post from './Post';

const PostList = ({ currentUserId }) => {
  const [posts, setPosts] = useState([]);

  useEffect(() => {
    const getPosts = async () => {
      const res = await axios.get('http://localhost:5000/api/posts');
      setPosts(res.data);
    };
    getPosts();
  }, []);

  return (
    <div>
      {posts.map((post) => (
        <Post key={post._id} post={post} currentUserId={currentUserId} />
      ))}
    </div>
  );
};

export default PostList;
