(function () {
	'use strict';

	var _ = require ('underscore-contrib');
	var moment = require ('moment');

	var $config = require ('../config');
	var $links = require ('./links');
	var $miniposts = require ('./miniposts');
	var $pages = require ('./pages');
	var $posts = require ('./posts');

	
	function addPostNav (pages) {
		return _.map (pages, function (page, idx) {
			if (idx === 0 && pages.length > 1) {
				page.previous = 'index2';

				return page;
			}

			page.next = 'index';

			if (idx > 1) {
				page.next = page.next + idx;
			}

			if (idx < pages.length - 1) {
				page.previous = 'index' + (idx + 2);
			}

			return page;
		});
	}
	

	function createHome () {
		return {
			type: 'home',
			posts: []
		};
	}


	// If home page pagination is enabled, a number of 'home pages' are 
	// created split by the number of posts per page set in the config.
	function createPages (posts) {
		return (function loop (posts, pages, idx) {
			var page, i, post, skip, tail;

			i = 1;
			skip = 0;

			if (posts.length < 1) {
				// Add postnav for last page

				return pages;
			}

			page = _.compose ($pages.createPage, createHome) ();

			if ($config.index.countPostsOnly) {
				while (skip < posts.length && i <= $config.index.postsPerPage) {
					post = posts [skip];

					page.posts.push (post);
					
					if (post.type === 'post') {
						i = i + 1;
					}

					skip = skip + 1;
				}
			} else {
				page.posts = _.head (posts, $config.index.postsPerPage);

				skip = $config.index.postsPerPage;
			}

			page.posts.reverse ();
			page.filename = 'index';

			if (idx > 1) {
				page.filename = page.filename + idx;
			}

			pages.push (page);

			// If we're not paginating, we're already done
			if (!$config.index.usePagination) {
				return pages;
			}

			return loop (_.tail (posts, skip), 
									 pages, 
									 idx + 1);
		}) (posts, [], 1);
	}
	

	function processPost (item) {
		item.displayDate = $pages.formatDateForDisplay (item.date);
		item.displayTitle = $pages.convertToHtml (item.title);
		item.content = $pages.prepareForDisplay (item.content);
		
		if (item.excerpt) {
			item.excerpt = $pages.prepareForDisplay (item.excerpt);
		}

		return item;
	}


	function processPosts (posts) {
		var links, miniposts;

		posts = _.map (posts, function (post) {
			if (post.type === 'post') {
				if (!post.content) {
						post = _.compose (processPost, $pages.createPage, $posts.createPost, 
															$pages.processFile, $posts.loadPost) (post);
				}

				return post;
			}
		});

		posts = posts.concat (_.map ($miniposts.loadMiniposts (), function (post) {
			return $miniposts.processMinipost (post);
		}));

		posts = posts.concat (_.map ($links.loadItems ('links'), function (link) {
			return $links.processItem (link);
		}));

		posts = _.flatten (posts);

		return _.sortBy (posts, function (post) { return -post.date; });
	}


	// The home page is generated here. A number of posts specified
	// in the site configuration file are displayed with or without
	// excerpts.
	function publishHome (repo) {
		var page, pages, posts;

		posts = processPosts (repo.posts);

		pages = createPages (posts);
		pages = addPostNav (pages);

		_.each (pages, function (page) {
			$pages.savePage (page, repo.tags);
		});
	}


	module.exports.publishHome = publishHome;
} ());
