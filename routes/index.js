var express = require('express');
var router = express.Router();

var mongoose = require('mongoose');
var Comment = mongoose.model('Comment');
var Post = mongoose.model('Post');
var passport = require('passport');
var UserAppStrategy = require('passport-userapp').Strategy;

passport.use(new UserAppStrategy({
        appId: '550a503de6883'
    },
    function (userprofile, done) {
        Users.findOrCreate(userprofile, function(err,user) {
            if(err) return done(err);
            return done(null, user);
        });
    }
));

/* GET home page. */
router.get('/', function(req, res, next) {
  res.render('index', { title: 'Express' });
});

/* 
////////////Helper routes///////////////
*/

router.param('post', function(req, res, next, id) {
  var query = Post.findById(id);

  query.exec(function (err, post){
    if (err) { return next(err); }
    if (!post) { return next(new Error('can\'t find post')); }

    req.post = post;
    return next();
  });
});

router.param('comment', function(req, res, next, id) {
  var query = Comment.findById(id);

  query.exec(function (err, comment){
    if (err) { return next(err); }
    if (!comment) { return next(new Error('can\'t find comment')); }

    req.comment = comment;
    return next();
  });
});

/* Posts */

/* GET: All Posts 
	Tips: 'req' stands for 'request' and contains all the information 
	about the request that was made to the server including data fields.
	'res' stands for response and is the object used to respond to the client.
*/
router.get('/posts', function(req, res, next) {
  Post.find(function(err, posts){
    if(err){ return next(err); }

    res.json(posts);
  });
});

/* GET: A single post */
router.get('/posts/:post', function(req, res, next) {
  req.post.populate('comments', function(err, post) {
    if (err) { return next(err); }

    res.json(post);
  });
});

/* POST: A single Post */
router.post('/posts', function(req, res, next) {
  var post = new Post(req.body);

  post.save(function(err, post){
    if(err){ return next(err); }

    res.json(post);
  });
});

/* PUT: Delete a single post */
router.delete('/posts/:post/delete', function(req, res, next) {
  req.post.remove({
     _id: req.params.post
  }, function(err, post){
    if (err) { return next(err); }
    res.json(post);
  });
});

/* PUT: Upvote a single post */
router.put('/posts/:post/upvote/:author', function(req, res, next) {
  req.post.upvote(function(err, post){
    if (err) { return next(err); }
    res.json(post);
  }, req.params.author);
});

/* PUT: Downvote a single post */
router.put('/posts/:post/downvote/:author', function(req, res, next) {
  req.post.downvote(function(err, post){
    if (err) { return next(err); }
    res.json(post);
  }, req.params.author);
});

/* GET: Get a single posts tags */
router.get('/posts/:post/tags', function(req, res, next) {
  req.post.populate('tags', function(err, post) {
    if (err) { return next(err); }

    res.json(post);
  });
});

/* Comments */

/* POST: A single comment for a single post */
router.post('/posts/:post/comments', function(req, res, next) {
  var comment = new Comment(req.body);
  
  comment.post = req.post;
  comment.save(function(err, comment){
    if(err){ return next(err); }

    req.post.comments.push(comment);
    req.post.save(function(err, post) {
      if(err){ return next(err); }

      res.json(comment);
    });
  });
});

/* PUT: Upvote a single comment */
router.put('/posts/:post/comments/:comment/upvote/:author', function(req, res, next) {
  req.comment.upvote(function(err, comment){
    if (err) { return next(err); }

    res.json(comment);
  }, req.params.author);
});

/* PUT: Downvote a single comment */
router.put('/posts/:post/comments/:comment/downvote/:author', function(req, res, next) {
  req.comment.downvote(function(err, comment){
    if (err) { return next(err); }

    res.json(comment);
  }, req.params.author);
});

module.exports = router;
