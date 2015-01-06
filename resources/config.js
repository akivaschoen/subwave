(function () {
	'use strict';

	var config = module.exports = {};

	config.archive = {
		title: 'Archive'
	};
	config.blog = {
		title: 'Blog Title',
		description: 'Blog description',
		url: 'http://www.example.com',
		copyright: '&copy; 2014 Bob Sacamano',
		dateFormat: 'MMMM DD, YYYY'
	};
	config.htmlElements = {
		scrub: ['excerpt']
	};
	config.index = {
		postsPerPage: 3,
		countPostsOnly: true,
		useExcerpts: true,
		usePagination: true
	};
	config.miniposts = {
		usePagination: false,
		postsPerPage: 10,
		title: 'Bits'
	};
	config.pages = {
		content: ['post', 'info', 'mini']
	};
	config.paths = {
		inbox: 'resources/' + 'inbox/',
		output: 'public/',
		repository: 'resources/' + 'repository/',
		resources: 'resources/',
		templates: 'resources/' + 'templates/',
	};
	config.resources = ['css/', 'js/', 'img/'];
	config.rss = { 
		filename: 'rss.xml',
		postCount: 5,
		useExcerpts: true
	};
	config.verbose = false;
} ());
