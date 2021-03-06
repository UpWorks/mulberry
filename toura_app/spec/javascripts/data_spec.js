describe("data API", function() {
  var source, api, node, image, audio, video;

  beforeEach(function() {
    toura.app.manifest = {
      images : [
        'org-27-images-172-images-gallery.jpg',
        'org-27-images-172-images-featured.jpg',
        'org-27-images-172-images-original.jpg'
      ]
    };

    api = dataAPI;
  });

  describe("get model for item", function() {
    beforeEach(function() {
      node = api.getModel('node-368');
    });

    it("should return an object of the given type", function() {
      expect(node.declaredClass).toEqual('toura.models.Node');
    });

    it("should throw an error if id is not provided", function() {
      expect(function() { api.getModel(); }).toThrow();
    });

    it("should throw an error if id argument is not a string", function() {
      expect(function() { api.getModel(1); }).toThrow();
    });

    it("should throw an error if a model for an unknown type is requested", function() {
      expect(function() { api.getModel('image-183'); }).toThrow();
    });

    it("should allow specifying a model type", function() {
      // note that a limited number of types are defined in toura.app.Data!
      expect(api.getModel('node-368', 'node') instanceof toura.models.Node).toBeTruthy();
      expect(api.getModel('image-183', 'backgroundImage') instanceof toura.models.BackgroundImage).toBeTruthy();
    });

    it("should cache the results of getting a model", function() {
      expect(api.cache['node-368']).toBeDefined();
      expect(api.cache['node-368'].name).toEqual(node.name);
    });

    it("should return a falsy value if there is no matching item", function() {
      expect(api.getModel('fake-id')).toBeFalsy();
    });

  });

  describe("get item by id", function() {
    it("should return an object when asked for an available id", function() {
      expect(api.getById('node-368')).toBeTruthy();
    });

    it("should return nothing when asked for an unavailable id", function() {
      expect(api.getById('nonexistent')).toBeFalsy();
    });
  });

  describe("search", function() {
    it("should return search results objects for the specified term", function() {
      var results = api.search('citaaay');
      expect(results.length).toEqual(1);
      expect(results[0].displayName).toBe('California Love');
      expect(results[0].asset).toBeTruthy();
    });

    it("should search the text and body properties of text assets for matches", function() {
      var results = api.search('citaaay');
      expect(results.length).toEqual(1);

      results = api.search('California');
      expect(results.length).toEqual(1);
    });

    it("should allow multi-word searches", function() {
      expect(api.search('city of Compton').length).toEqual(1);
    });

    it("should make searches case insensitive", function() {
      expect(api.search('city of compTON').length).toEqual(1);
    });

    it("should return an empty array if no search term is provided", function() {
      var results = api.search();
      expect(results.length).toBe(0);
    });

    it("should use a cached result for a term if it has one", function() {
      var results = api.search('citaaay');
      var length = results.length;

      spyOn(api._store, 'fetch');

      var resultsCached = api.search('citaaay');
      expect(api._store.fetch).wasNotCalled();
      expect(resultsCached.length).toEqual(1);
      expect(results[0].name).toBe(resultsCached[0].name);
    });

    it("should sanitize the search to include only letters, numbers, and spaces", function() {
      expect(api.search('city*of+Compton><').length).toBe(1);
    });
  });

  describe("node object", function() {
    beforeEach(function() {
      node = api.getModel('node-368');
    });

    it("should have its properties populated correctly from the data", function() {
      expect(node.id).toEqual('node-368');
      expect(node.name).toEqual('Image Gallery');
      expect(node.children).toBeDefined();

      expect(node.images.length).toEqual(9);
      expect(node.images[0].declaredClass).toEqual('toura.models.Image');

      expect(node.audios.length).toEqual(0);
      expect(node.videos.length).toEqual(0);

      expect(node.siblings).toBeDefined();
      expect(node.siblings.length).toBeTruthy();
    });
  });

  describe("image object", function() {
    var image;

    beforeEach(function() {
      image = node.images[0];
    });

    describe("data population", function() {
      it("should get all it's data from the image asset except the name and caption", function() {
        expect(image.id).toBeDefined();
        expect(image.caption).toBeDefined();
        expect(image.height).toBeDefined();
        expect(image.width).toBeDefined();
        expect(image.featured).toBeDefined();
        expect(image.gallery).toBeDefined();
        expect(image.original).toBeDefined();
      });

      it("should get its name and caption data from the associated text asset if it has one", function() {
        expect(image.name).toBeDefined();
        expect(image.caption).toBeDefined();
      });

      it("should use the name from the caption, if the image doesn't have one", function() {
        image = node.images[1];
        expect(image.caption).toBeUndefined();
        expect(image.name).toBeDefined();
        expect(image.id).toBeDefined();
      });
    });

    describe("determine streamability of assets", function() {
      it("should use a remote URL if it is not in the manifest", function() {
        var image = node.images[1];
        expect(image.original.url).toMatch(/^http/);
        expect(image.featured.url).toMatch(/^http/);
        expect(image.gallery.url).toMatch(/^http/);
      });

      it("should use a local URL if it is in the manifest and is marked not to stream", function() {
        var image = node.images[0];
        expect(image.original.url).not.toMatch(/^http/);
        expect(image.featured.url).not.toMatch(/^http/);
        expect(image.gallery.url).not.toMatch(/^http/);
      });
    });

  });

  describe("audio object", function() {
    var audio;

    beforeEach(function() {
      node = api.getModel('node-369');
      audio = node.audios[0];
    });

    it("should have its properties populated correctly from the data", function() {
      expect(audio.id).toBeDefined();
      expect(audio.name).toBeDefined();
      expect(audio.url).toBeDefined();
    });
  });

  describe("video object", function() {
    var video;

    beforeEach(function() {
      node = api.getModel('node-372');
      video = node.videos[0];
    });

    it("should have its properties populated correctly from the data", function() {
      expect(video.id).toBeDefined();
      expect(video.name).toBeDefined();
      expect(video.url).toBeDefined();
    });
  });

  describe("google map pin object", function() {
    var pin;

    beforeEach(function(){
      node = api.getModel('node-371');
      pin = node.googleMapPins[0];
    });

    it("should have its properties populated correctly from the data", function() {
      expect(pin.id).toBeDefined();
      expect(pin.lat).toBeDefined();
      expect(pin.lon).toBeDefined();
      expect(pin.name).toBeDefined();
      expect(pin.address).toBeDefined();
    });
  });
});
