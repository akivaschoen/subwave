(function () {
	'use strict';

	var arch = require ('./archives');
	var comp = require ('./compiler');
	var io = require ('./io');
	var md = require ('markdown').markdown;

	var templatesPath = 'resources/templates/';

	function convertStringToDate (date) {
		var pattern;

		pattern = /(\d{4}-\d{2}-\d{2})\s(\d+:\d+)/;

		return new Date (date.replace (pattern, '$1T$2:00'));
	}

	function comparePosts (postA, postB) {
		if (!postA || !postB) {
			return false;
		}

		if (postA.title === postB.title &&
				postA.author === postB.author &&
				postA.date === postB.date) {
			return true;
		}

		return false;
	}

	function processDirectory (path) {
		var filelist, file, pages = [];

		filelist = io.getFileList (path);

		filelist.forEach (function (entry) {
			file = io.readFile (path + entry);

			pages.push (processPage (file));
		});

		return pages;
	}

	function processPage (page) {
		var content, compiler, pagedata, matches, filename, output;
		var path, pattern, srcfile, template;

		pattern = /(\{(?:.|\n)+\})(?:\n)*((.|\n)*)/;
		matches = page.match (pattern);

		if (!matches || matches.length === 0) {
			throw {
				type: 'Error',
				message: 'The file isn\'t the correct format.'
			};
		}

		pagedata = JSON.parse (matches [1]);
		page = {};

		for (var attr in pagedata) {
			page [attr] = pagedata [attr];
		}

		content = md.toHTML (matches [2]);

		if (content) {
			page.content = content;
		}

		if (page.type === 'post') {
			page.template = templatesPath + 'post.jade';

			processPost (page);
		} else if (page.type === 'page') {
			page.template = templatesPath + 'page.jade';
		} else if (page.type === 'archives') {
			page.template = templatesPath + 'archives.jade';
			page.filename = 'archives';
		} else {
			throw {
				type: 'Error',
				message: 'Unable to determine template type from page.'
			};
		}

		return page;
	}

	function processPost (post) {
		post.date = convertStringToDate (post.date);
		post.filename	= io.getPostFilename (post.title, post.date);
		post.path = io.getPostDirectoryPathname (post.date);
	}

	function processArchives (posts, archives) {
		var idx;

		posts.forEach (arch.addPost);

		idx = archives.posts.length - posts.length;

		posts.forEach (function (post) {
			var next, previous;
		
			next = archives.posts [idx + 1];
			previous = archives.posts [idx - 1];

			if (previous) {
				processSiblingPosts (post, previous, archives, idx, 'previous');
			}

			if (next) {
				processSiblingPosts (post, next, archives, idx, 'next');
			}

			idx = idx + 1;
		});
	}

	function processSiblingPosts (post, sibling, archives, index, direction) {
		var oppDirection, nextSibling;

		if (direction === 'previous') {
			oppDirection = 'next';
			index = index - 2;
		} else {
			oppDirection = direction;
			index = index + 2;
		}

		linkSibling (sibling, post, direction);

		sibling = processSibling (post, direction);

		linkSibling (post, sibling, oppDirection);

		if (archives.posts [index]) {
			nextSibling = archives.posts [index];

			linkSibling (nextSibling, sibling, direction);
		}

		comp.compilePost (sibling);

		io.createPostDirectory (io.postsPath + sibling.path);

		io.savePage (sibling);
	}

	function processSibling (post, direction) {
		var path, sibling;

		path = io.getPostDirectoryPathname (post [direction].date);
		sibling = io.readFile (io.archivePath + path + post [direction].filename + '.md');
		sibling = processPage (sibling);

		return sibling;
	}

	function linkSibling (sibling, post, direction)
	{
		var date;

		date = new Date (sibling.date);

		post [direction] = {};

		post [direction].title = sibling.title;
		post [direction].date = date;
		post [direction].path = io.getPostDirectoryPathname (date);
		post [direction].filename = sibling.filename;
	}

	module.exports.processArchives = processArchives;
	module.exports.processDirectory = processDirectory;
	module.exports.processPage = processPage;
} ());
