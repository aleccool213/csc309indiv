var mongoose = require('mongoose');
var timestamps = require('mongoose-timestamp');

var CommentSchema = new mongoose.Schema({
  body: String,
  author: String,
  upvotes: [{author: String}],
  post: { type: mongoose.Schema.Types.ObjectId, ref: 'Post' }
});

CommentSchema.methods.upvote = function(cb, user_first_name) {
  this.upvotes.push({author: user_first_name});
  this.save(cb);
};

CommentSchema.methods.downvote = function(cb, user_first_name) {
  for(i = 0;i < this.upvotes.length;i++){
    if (this.upvotes[i]['author'] == user_first_name){
      this.upvotes.splice(i, 1);
    }
  }
  this.save(cb);
};

mongoose.model('Comment', CommentSchema);