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

PostSchema.methods.downvote = function(cb, user_first_name) {
  for(i = 0;i < this.upvotes.length;i++){
    if (this.upvotes[i]['author'] == user_first_name){
      this.upvotes.splice(i, 1);
    }
  }
  this.save(cb);
};

mongoose.model('Post', PostSchema);