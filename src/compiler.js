// This is the 'heart' of subwave. It processes all incoming posts and pages from 
// the inbox and generates necessary support pages such as archives.html.
(function () {
	'use strict';

	var Rss = require ('rss');

	var ar = require ('./archives');
	var config = require ('./config');
	var io = require ('./io');
	var pa = require ('./pages');
	var po = require ('./posts');
	var st = require ('./state');
	var ta = require ('./tags');

	var siteUrl = 'http://www.example.com/';

	// Ceci n'est pas un commentaire.
	function compile () {
		var homePage, i, entries, files, page, pages, path, posts, resources, state;

		if (config.verbose) {
			console.log ('Compiling the site...');
		}

		pages = pa.getNewPages ();

		if (pages.length === 0) {
			console.log ('No new pages found');

			return 1;
		}

		state = st.getState ();
		posts = po.getPosts (pages);

		if (posts.length !== 0) {
			entries = ar.createNewArchiveEntries (posts);

			handlePosts (state, posts, entries);
		}

		// Processes and saves any page files in inbox.
		for (i = 0; i < pages.length; i++) {
			page = pages [i];

			if (page.type !== 'post') {
				pa.savePage (page, state.tags);

				io.renameFile (config.path.inbox + page.origFilename, 
											 config.path.archive + page.origFilename);
			}
		}

		// Creates the index.html page.
		homePage = pa.createHomePage (state.posts.slice (-3), posts);

		pa.savePage (homePage, state.tags);

		config.resources.forEach (function (resource) {
			files = io.getFiles (config.path.resources + resource);

			for (var file in files) {
				path = files [file];

				io.copyFile (path + file, config.path.pub + resource + file);
			}
		});
	}

	function handleArchives (posts, tags) {
		var archives;

		archives = ar.createArchives (posts);
		archives = pa.createPage (JSON.stringify (archives));

		ar.saveArchives (archives, tags);
	}

	// Take [currently only] new posts, add them to the site's state, process them,
	// fold them, spindle them, mutilate them...
	function handlePosts (state, posts, entries, archives) {
		var archivePostsPath, entry, file, i, index, postCount, output, post;

		// Each post gets a unique index number which is later used 
		// for updates.
		if (state.posts && state.posts.length > 0) {
			postCount = st.getLastIndex (state.posts);

			index = postCount + 1;
		} else {
			index = 1;
		}

		for (i = 0; i < entries.length; i++) {
			entry = entries [i];
			
			if (!entry.index) {
				entry.index = index;

				posts [i].index = index;
			}

			if (entry.index < postCount) {
				state.posts [entry.index - 1] = entry;
			} else {
				state.posts.push (entry);
			}
				
			index = index + 1;
		}
		
		// Some last prepatory work on new posts including moving the now loaded
		// files into the archive.
		for (i = 0; i < posts.length; i++) {
			post = posts [i];

			post.excerpt = pa.getExcerpt (post.content);

			st.addPostToTagGroups (state, post);

			archivePostsPath = config.path.archive + 'posts/';

			io.createPostDirectory (archivePostsPath + post.path);

			output = JSON.stringify ({
				type: 'post',
				index: post.index,
				title: post.title,
				author: post.author,
				date: post.date,
				tags: post.tags}, null, '  ');


			file = io.readFile (config.path.inbox + post.origFilename);
			output = output + '\n\n' + pa.getContent (file, false);

			io.writeFile (archivePostsPath + post.path + post.filename + '.md', output);
			
			io.removeFile (config.path.inbox + post.origFilename);
		}
	
		// We handle appending the archives first (above) so we can more easily determine
		// if a post has siblings that need to be handled.
		po.handlePostsWithSiblings (state, posts);

		for (i = 0; i < posts.length; i++) {
			post = posts [i];

			po.savePost (post, state.tags);
		}

		// Create archives.html.
		handleArchives (state.posts, state.tags);

		// Create tag index files in tags directory.
		ta.createTagPages (state);

		updateRssFeed (state);

		st.saveState (state);
	}

	// Clears out the public directory, copies everything from resource/archives
	// then builds the site again. Useful for when changing templates that affect the
	// entire site.
	function rebuild () {
		var files, path;

		files = [];

		if (config.verbose) {
			console.log ('Rebuilding the site...');
		}

		io.cleanPublic (false);

		files = io.getFiles (config.path.archive);

		for (var file in files) {
			path = files [file];

			io.copyFile (path + file, config.path.inbox + file);
		}

		compile ();
	}

	function updateRssFeed (state) {
		var feed, feedName, feedOptions, itemOptions;

		feedName = 'rss.xml';

		feedOptions = {
			title: config.blog.title,
			description: config.blog.description,
			feed_url: config.blog.url + '/' + feedName,
			site_url: config.blog.url,
			copyright: config.blog.copyright,
			langauge: 'en',
			pubDate: new Date ()
		};

		feed = new Rss (feedOptions);

		state.posts.forEach (function (post) {
			itemOptions = {
				title: post.title,
				url: siteUrl + config.path.posts + post.path + post.filename + '.html',
				date: post.date,
				categories: post.tags,
				author: post.author
			};

			feed.item (itemOptions);
		});

		io.writeFile (config.path.pub + feedName, feed.xml ());
	}

	module.exports.compile = compile;
	module.exports.rebuild = rebuild;
} ());
