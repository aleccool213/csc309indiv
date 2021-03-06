var app = angular.module('start-idea', ['ui.router', 'UserApp', 'ngTagsInput', 'xeditable']);

app.config([
  '$stateProvider',
  '$urlRouterProvider',
  function($stateProvider, $urlRouterProvider) {
    $urlRouterProvider.otherwise('home');

    $stateProvider
      .state('landing', {
        url: '',
        templateUrl: '/landing.html',
        data: {
          public: true
        }
      })
      .state('home', {
        url: '/home',
        templateUrl: '/home.html',
        controller: 'HomeCtrl',
        resolve: {
            postPromise: ['posts', function(posts){
              return posts.getAll();
            }]
          },
        data: {
          public: true
        }
      })
      .state('posts', {
        url: '/posts/{id}',
        templateUrl: '/posts.html',
        controller: 'PostsCtrl',
        resolve: {
          post: ['$stateParams', 'posts', function($stateParams, posts) {
            return posts.get($stateParams.id);
          }]
        },
        data: {
          public: true
        }
      })
      .state('login', {
        url: "/login",
        templateUrl: "/login.html",
        data: {
          login: true
        }
      })
      .state('signup', {
        url: "/signup",
        templateUrl: "/signup.html",
        data: {
          public: true
        }
      })
      .state('profile',{
        url:"/profile",
        templateUrl: "/profile.html",
        controller: 'HomeCtrl',
        resolve: {
            postPromise: ['posts', function(posts){
              return posts.getAll();
            }]
          },
        data:{
          public: false
        }
      });
    
}]);

app.run(function(user, editableOptions) {
    user.init({ appId: '550a503de6883' });
    currentUser = user.current;
    editableOptions.theme = 'bs3'; // bootstrap3 theme. Can be also 'bs2', 'default'
});

app.factory('posts',['$http', function($http){
  var o = {
    posts: []
  };
  o.getAll = function() {
    return $http.get('/posts').success(function(data){
      angular.copy(data, o.posts);
    });
  };
  o.create = function(post) {
    post.author = currentUser.first_name;
    return $http.post('/posts', post).success(function(data){
      o.posts.push(data);
    });
  };
  o.remove = function(post) {
    return $http.delete('/posts/' + post._id + '/delete').success(function(data){
      int = o.posts.indexOf(post);
      if (int > -1){
        o.posts.splice(int, 1);
      }
    });
  };
  o.upvote = function(post, author) {
    return $http.put('/posts/' + post._id + '/upvote/' + author.first_name)
      .success(function(data){
        post.upvotes.push({author: currentUser.first_name});
      });
  };
  o.downvote = function(post, author) {
    return $http.put('/posts/' + post._id + '/downvote/' + author.first_name)
      .success(function(data){
        for(i = 0;i < post.upvotes.length;i++){
          if (post.upvotes[i]['author'] == currentUser.first_name){
            post.upvotes.splice(i, 1);
          }
        }
      });
  };
  o.get = function(id) {
    return $http.get('/posts/' + id).then(function(res){
      return res.data;
    });
  };
  o.getTags = function(id) {
    return $http.get('/posts/' + id + '/tags').then(function(res){
      return res.data;
    });
  };
  o.addTags = function(id) {
    return $http.post('/posts/' + id + '/tags', tags);
  };
  o.addComment = function(id, comment) {
    //comment.author = currentUser.first_name;
    return $http.post('/posts/' + id + '/comments', comment);
  };
  o.upvoteComment = function(post, comment, author) {
    return $http.put('/posts/' + post._id + '/comments/'+ comment._id + '/upvote/' + author.first_name)
      .success(function(data){
        comment.upvotes.push({author: currentUser.first_name});
      });
  };
  o.downvoteComment = function(post, comment, author) {
    return $http.put('/posts/' + post._id + '/comments/'+ comment._id + '/downvote/' + author.first_name)
      .success(function(data){
        for(i = 0;i < comment.upvotes.length;i++){
          if (comment.upvotes[i]['author'] == currentUser.first_name){
            comment.upvotes.splice(i, 1);
          }
        }
      });
  };
  return o;
}])

app.controller('HomeCtrl', [
	'$scope',
  'posts',
	function($scope, posts){
    $scope.posts = posts.posts;
    $scope.items = [
      {title: "Health"},
      {title: "Technology"},
      {title: "Education"},
      {title: "Finance"},
      {title: "Travel"},
    ];
    $scope.category = $scope.items[0]
    $scope.addPost = function(){
      if(!$scope.title || $scope.title === '' || !$scope.description || 
        $scope.description === '') {
        toastr.warning('Missing fields!')
        return;
      }
      posts.create({
        title: $scope.title,
        category: $scope.category.title,
        tags: $scope.tags,
        description: $scope.description, 
      });
      $scope.title = '';
      $scope.description = '';
      $scope.tags = '';
      toastr.success('New idea posted!');
    };
    $scope.incrementUpvotes = function(post) {
      checker = false;
      for (i = 0; i < post.upvotes.length; i ++){
        if (post.upvotes[i]['author'] == currentUser.first_name){
          checker = true;
        }
      }
      if (checker == false){
        posts.upvote(post, currentUser);
        toastr.success('Upvoted!');
        $scope.userVoted(post);
      }
      else{
        posts.downvote(post, currentUser);
        toastr.error('Downvoted!');
        $scope.userVoted(post);
      }
    };
    $scope.userVoted = function (post) {
      for (i = 0; i < post.upvotes.length; i ++){
        if (post.upvotes[i]['author'] == currentUser.first_name){
          return true;
        }
      }
      return false;
    };
    $scope.deletePost = function (post) {
      posts.remove(post);
    };
  }]

);

app.controller('PostsCtrl', [
  '$scope',
  'posts',
  'post',
  function($scope, posts, post){
    $scope.post = post;
    $scope.addComment = function(){
      if($scope.body === '' || !$scope.body) {
        toastr.warning('Missing fields!')
        return;
      }
      posts.addComment(post._id, {
        body: $scope.body,
        author: currentUser.first_name,
      }).success(function(comment) {
        $scope.post.comments.push(comment);
      });
      $scope.body = '';
      toastr.success('Comment posted!');
    };
    $scope.incrementUpvotes = function(comment){
      checker = false;
      for (i = 0; i < comment.upvotes.length; i ++){
        if (comment.upvotes[i]['author'] == currentUser.first_name){
          checker = true;
        }
      }
      if (checker == false){
        posts.upvoteComment(post, comment, currentUser);
        toastr.success('Upvoted!');
        $scope.userVoted(comment);
      }
      else{
        posts.downvoteComment(post, comment, currentUser);
        toastr.error('Downvoted!');
        $scope.userVoted(comment);
      }
    };
    $scope.userVoted = function (comment){
      for (i = 0; i < comment.upvotes.length; i ++){
        if (comment.upvotes[i]['author'] == currentUser.first_name){
          return true;
        }
      }
      return false;

    };
  }]  
);

