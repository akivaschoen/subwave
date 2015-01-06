(function () {
	'use strict';

	var _ = require ('underscore-contrib');

	var cf = require ('../resources/config');
	var io = require ('./io');
	var pa = require ('./pages');


	function addPostToMiniposts (posts, post) {
		var _post;

		_post = pa.findById (posts, post.id);
			
		if (_.isEmpty (_post)) {
			posts.push (post);
		} else {
			posts [_post.index] = post;
		}
		
		return posts;
	}


	// Takes a string in the format of 'YYYY-MM-DD HH:MM' and returns a
	// Date object.
	function convertStringToDate (date) {
		var pattern;

		pattern = /(\d{4}-\d{2}-\d{2})\s(\d+:\d+)/;

		return new Date (date.replace (pattern, '$1T$2:00'));
	}


	function compileMiniposts (page, tags) {
		var compileFn;

		compileFn = function (page) {
			page.title = cf.miniposts.title;

			return _.map (page.posts, function (post) {
				post.displayDate = pa.formatDateForDisplay (post.date);
				post.content = pa.convertToHtml (post.content);

				return post;
			});
		};

		return pa.compilePage (page, tags, compileFn);
	}


	function createMiniposts () {
		return {
			type: 'mini',
			posts: []
		};
	}


	function findPost (posts, id) {
		var result;

		result = {};
		result.post = _.findWhere (posts, { id: id });

		if (result.post) {
			result.index = _.indexOf (posts, result.post);

			return result;
		}

		return {};
	}


	function loadMiniposts (path) {
		return pa.getPages (cf.paths.repository + cf.miniposts.title.toLowerCase () + '/');
	}


	function publishMiniposts (posts, repo) {
		var page;

		posts = posts.concat (loadMiniposts ());

		page = _.compose (pa.createPage, createMiniposts) ();

		page.posts = _.reduce (posts, function (res, post) {
			return addPostToMiniposts (page.posts, post);
		}, page.posts);

		page.posts = _.flatten (_.sortBy (page.posts, function (post) { 
			return -(new Date (post.date)); }));

		saveMiniposts (page, repo.tags);
	}


	function saveMiniposts (page, tags) {
		var date, filename, output, repoPostsPath;

		repoPostsPath = cf.paths.repository + cf.miniposts.title.toLowerCase () + '/';
		
		// Move new miniposts to the repository
		_.each (page.posts, function (post) {
			date = convertStringToDate (post.date);
			filename = io.getPostFilename (post.title, post.date);

			output = JSON.stringify (_.pick (post, 'type', 'id', 'title', 'author', 'date'),
															null, '  ');
			output = output + '\n\n' + post.content;

			io.writeFile (repoPostsPath + 
										(io.getPostFilename (post.title, post.date)) + 
										'.md', output);

			io.removeFile (cf.paths.inbox + post.origFilename);
		});

		page.output = compileMiniposts (page, tags);
		
		page.filename = '1'; // Temporary until pagination

		io.saveHtmlPage (page);
	}

	
	module.exports.loadMiniposts = loadMiniposts;
	module.exports.publishMiniposts = publishMiniposts;
} ());
