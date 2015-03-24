var app = angular.module('start-idea', ['ui.router', 'UserApp', 'ngTagsInput']);

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
    
}]);

app.run(function(user) {
    user.init({ appId: '550a503de6883' });
    currentUser = user.current;
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
  o.upvote = function(post, author) {
    return $http.put('/posts/' + post._id + '/upvote/' + author.first_name)
      .success(function(data){
        post.upvotes.push({author: currentUser.first_name});
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
  o.upvoteComment = function(post, comment) {
    return $http.put('/posts/' + post._id + '/comments/'+ comment._id + '/upvote')
      .success(function(data){
        comment.upvotes += 1;
      });
  };
  return o;
}])

app.controller('HomeCtrl', [
	'$scope',
  'posts',
	function($scope, posts){
    $scope.posts = posts.posts;
    $scope.addPost = function(){
      if(!$scope.title || $scope.title === '' || !$scope.description || 
        $scope.description === '') {
        toastr.warning('Missing fields!')
        return;
      }
      posts.create({
        title: $scope.title,
        author: $scope.author,
        tags: $scope.tags,
        description: $scope.description, 
      });
      $scope.title = '';
      $scope.description = '';
      $scope.tags = '';
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
      }
      else{
        toastr.warning('You can only upvote once!')
      }
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
    };
    $scope.incrementUpvotes = function(comment){
      posts.upvoteComment(post, comment);
    };

  }]  
);

