// This collects all functions related to individual posts.
(function () {
	'use strict';

	var jade = require ('jade');
	var marked = require ('marked');

	var io = require ('./io');
	var pa = require ('./pages');

	// Allows sorting of posts by date.
	function comparePostsByDate (postA, postB) {
		if (postA.date < postB.date) {
			return -1;
		}

		if (postB.date < postA.date) {
			return 1;
		}

		return 0;
	}

	// Filters out any pages that aren't posts.
	function getPosts (files) {
		return files.filter (function (file) {
			if (file.type === 'post') {
				return true;
			}

			return false;
		});
	}

	function handlePostsWithSiblings (state, posts) {
		var i, idx, next, post, previous;

		// TODO: What did you do, Ray.
		idx = state.posts.length - posts.length;

		for (i = 0; i < posts.length; i++) {
			post = posts [i];
			next = state.posts [idx + 1];
			previous = state.posts [idx - 1];

			if (previous) {
				processSiblingPosts (post, previous, state, posts, idx, 'previous');
			}

			if (next) {
				processSiblingPosts (post, next, state, posts, idx, 'next');
			}

			idx = idx + 1;
		}
	}

	// Links navigation information between two posts
	function linkSibling (source) {
		var target;

		target = {};
		target.title = source.title;
		target.date = source.date;
		target.filename = source.filename;

		if (!source.path) {
			target.path = io.getPostDirectoryPathname (source.date);
		} else {
			target.path = source.path;
		}	
		
		return target;
	}

	// Loads and processes an existing post from resources/archives/..
	function processSibling (sibling, direction) {
		var file, filename, path;

		path = io.getPostDirectoryPathname (sibling.date);
		filename = sibling.filename;
		file = io.readFile (io.archivePath + 'posts/' + path + filename + '.md');

		sibling.type = 'post';
		sibling.content = pa.getContent (file);
		sibling.template = io.templatesPath + 'post.jade';
		sibling.title = marked (sibling.title);

		return sibling;
	}

	// Connect a new post's navigation with its existing sibling posts, saving the 
	// existing sibling posts along the way. This allows us to add new posts and modify
	// existing ones without having to rebuild every post from scratch.
	function processSiblingPosts (post, sibling, state, posts, index, direction) {
		var oppDirection, nextSibling, tmpSibling;

		tmpSibling = pa.copyAttributes (sibling);

		if (direction === 'previous') {
			oppDirection = 'next';
			index = index - 2;
		} else {
			oppDirection = 'previous';
			index = index + 2;
		}

		post [direction] = linkSibling (tmpSibling);
		tmpSibling [oppDirection] = linkSibling (post);

		// If a sibling has its own sibling, update the navigation of that post as well.
		// This allows us to handle the case when more than one new post is added simultaneously
		// and the previous most recent post is part of the sibling chain.
		if (state.posts [index]) {
			nextSibling = pa.copyAttributes (state.posts [index]);

			tmpSibling [direction] = linkSibling (nextSibling);
		}

		tmpSibling = processSibling (tmpSibling, oppDirection);
		tmpSibling.path = io.getPostDirectoryPathname (tmpSibling.date);

		savePost (tmpSibling);
	}

	// Commit a post to disk.
	function savePost (post) {
		post.output = pa.compilePage (post);

		io.createPostDirectory (io.postsPath + post.path);

		io.saveHtmlPage (post);
	}

	module.exports.comparePostsByDate = comparePostsByDate;
	module.exports.getPosts = getPosts;
	module.exports.handlePostsWithSiblings = handlePostsWithSiblings;
	module.exports.savePost = savePost;
} ());
