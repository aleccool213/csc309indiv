var mongoose = require('mongoose');
var timestamps = require('mongoose-timestamp');

var PostSchema = new mongoose.Schema({
  title: String,
  description: String,
  author: String,
  upvotes: [{author: String}],
  tags: [{text: String}],
  category: String,
  comments: [{ type: mongoose.Schema.Types.ObjectId, ref: 'Comment' }]
});

PostSchema.plugin(timestamps);

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