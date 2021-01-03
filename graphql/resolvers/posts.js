const { UserInputError } = require('apollo-server');
const Post = require('../../models/Post');
const checkAuth = require('../../util/check-auth');

module.exports = {
    Query: {
        async getPosts() {
            try {
                const posts = await Post.find().sort({createdAt: -1});
                return posts;
            } catch(err) {
                throw new Error(err);
            }
        },

        async getPost(_, { postId }) {
            try {
                const post = await Post.findById(postId);
                if (post) {
                    return post;
                } else {
                    throw new Error('Post not found');
                }
            } catch(err) {
                throw new Error(err);
            }
        }
    },

    Mutation: {
        async createPost(_, { body }, context) {
            const user = checkAuth(context);
           
            if (body.trim() === '') {
                throw new Error('Post body must not be empty');
            }

            const newPost = Post({
                body,
                user: user.id,
                username: user.username,
                createdAt: new Date().toISOString()
            });

            const post = newPost.save();
            context.pubsub.publish('NEW_POST', {
                newPost: post
            });
            
            return post;
        },

        async deletePost(_, { postId }, context) {
            const user = checkAuth(context);

            try {
                const post = await Post.findById(postId);
                
                if(!post) {
                    throw new Error('Post not found');
                }
                if (post.username === user.username) {
                    await post.delete();

                    return 'Post deleted successfully';
                } else {
                    throw new Error('Action not allowed');
                }
            } catch(err) {
                throw new Error(err);
            }
        },

        async likePost(_, { postId }, context) {
            const { username } = checkAuth(context);
            
            const post = await Post.findById(postId);

            if(!post) {
                throw new UserInputError("Post not found");
            }

            if (post.likes.find(p => p.username === username)) {
                post.likes = post.likes.filter(p => p.username != username);
            } else {
                post.likes.push({
                    username,
                    createdAt: new Date().toISOString()
                });
            }

            await post.save();
            return post;
        }
    },

    Subscription: {
        newPost: {
            subscribe: (_, __, { pubsub }) => {
                return pubsub.asyncIterator('NEW_POST');
            }
        }
    }
}