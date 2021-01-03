const { UserInputError, AuthenticationError } = require("apollo-server");

const User = require("../../models/User");
const Post = require('../../models/Post');
const checkAuth = require("../../util/check-auth");

module.exports = {
    Mutation: {
        createComment: async (_, {postId, body}, context) => {
            const { username } = checkAuth(context);

            try {
                if (body.trim === '') {
                    throw new UserInputError('Empty Comment', {
                        errors: {
                            body: 'Comment body must not be empty'
                        }
                    });
                }
                const post = await Post.findById(postId);
                if(post) {
                    post.comments.unshift({
                        body,
                        username,
                        createdAt: new Date().toISOString(),
                    });

                    await post.save();
                    return post;
                } else {
                    throw new UserInputError('Post not found');
                }
            } catch(err) {
                throw new Error(err);
            }
        },

        deleteComment: async (_, { postId, commentId }, context) => {
            const { username } = checkAuth(context);

            try {
                const post = await Post.findById(postId);
                
                if (!post) {
                    throw new UserInputError('Post not found');
                }               

                const commentIndex = post.comments.findIndex(c => c.id === commentId);

                if (commentIndex === -1) {
                    throw new UserInputError('Comment not found');
                }

                if (post.comments[commentIndex].username !== username) {
                    throw new AuthenticationError('Action not allowed');
                }

                post.comments.splice(commentIndex, 1);
                await post.save();
                return post;
            } catch(err) {
                throw new Error(err);
            }
        }
    }
};