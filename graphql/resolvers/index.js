const postsResolovers = require('./posts');
const usersResolvers = require('./users');
const commentsResolvers = require('./comments');

module.exports = {
    Post: {
        likeCount: (parent) => parent.likes.length,
        commentCount: (parent) => parent.comments.length
    },
    Query: {
        ...postsResolovers.Query
    },
    Mutation: {
        ...usersResolvers.Mutation,
        ...postsResolovers.Mutation,
        ...commentsResolvers.Mutation
    },
    Subscription: {
        ...postsResolovers.Subscription
    }
}