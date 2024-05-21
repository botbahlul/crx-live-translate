self.addEventListener('load', function(event) {
	event.waitUntil(
		new Promise(function(resolve, reject) {

			chrome.storage.sync.get(['recognizing'], function(result) {
				recognizing = result.recognizing;
				console.log('onLoad: recognizing =', recognizing);

				resolve();
			});


		})
	);
});

self.addEventListener('load', function(event) {
	event.respondWith(
		new Promise(function(resolve, reject) {

			chrome.storage.sync.get(['recognizing'], function(result) {
				recognizing = result.recognizing;
				console.log('onLoad: recognizing =', recognizing);
				resolve(new Response('Loaded successfully.'));
			});

		})
	);
});
