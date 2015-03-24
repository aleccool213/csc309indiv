var mongoose = require('mongoose');

var PostSchema = new mongoose.Schema({
  title: String,
  description: String,
  author: String,
  upvotes: [{author: String}],
  tags: [{text: String}],
  comments: [{ type: mongoose.Schema.Types.ObjectId, ref: 'Comment' }]
});

PostSchema.methods.upvote = function(cb, user_first_name) {
  this.upvotes.push({author: user_first_name});
  this.save(cb);
};

PostSchema.methods.checkUpvotes = function(cb, current_user){
  for(i = 0; i < this.upvotes.length; i ++){
    if (this.upvotes[i].author == current_user.first_name){
      return false;
    }
  }
  return true;
};

mongoose.model('Post', PostSchema);