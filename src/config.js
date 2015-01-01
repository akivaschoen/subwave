(function () {
	'use strict';

	var config = module.exports = {};

	config.blog = {
		title: 'Blog Title',
		description: 'Blog description',
		url: 'http://www.example.com',
		copyright: '&copy; 2014 Bob Sacamano',
		dateFormat: 'MMMM DD, YYYY'
	};
	config.index = {
		useExcerpts: true,
		excerptParagraphs: 3,
<<<<<<< HEAD
		postCount: 3,
		recentPostsCount: 5
=======
		postCount: 3
>>>>>>> configuration
	};
	config.paths = {
		resources: 'resources/',
		inbox: 'resources/' + 'inbox/',
		archive: 'resources/' + 'archive/',
		templates: 'resources/' + 'templates/',
		output: 'public/',
		posts: 'public/' + 'posts/',
		tags: 'public/' + 'tags/'
	};
	config.resources = ['css/', 'js/', 'img/'];
	config.rss = { 
		useExcerpts: true,
		excerptParagraphs: 3,
		postCount: 5
	};
	config.verbose = false;
} ());
