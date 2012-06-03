(function ($) {
    var userId = 9580389;
    
    Backbone.sync = function(method, model, options) {
        var params = {
            url: "http://new.undev.ru/vimeo/api.json",
            type: 'POST', 
            dataType: 'json',
            success: options.success,
            error: options.error
        };

        if (model.model == AlbumsModel && method == 'read') {
            params.data = {
                method: "albums.getAll", 
                params: {"user_id": options.userId}
            }
        }
        return $.ajax(params);
    };
    
    AlbumsModel = Backbone.Model.extend({
        defaults: {
            title: 'title default',
        },
        validate: function(){
        },
        initialize: function(){
        }
    });
    
    AlbumsCollection = Backbone.Collection.extend({
        model: AlbumsModel,
        initialize: function(){},
        silent: true,
        parse: function(resp, xhr) {
            console.log(resp.albums.album);
            return resp.albums.album;
        }
    });
    
    var myAlbumsCollection = new AlbumsCollection;

    
    
    AlbumsView = Backbone.View.extend({
            template: _.template($('#myAlbumViewTmpl').html()),
            initialize: function(){
                this.render();
            },
            render: function(){
                var variables = {};
                $(this.el).empty();
                _.each(this.collection.toJSON(), function(album) {
                    album.thumbnail = album.thumbnail_video.thumbnails.thumbnail[1]._content;
                    $(this.el).append($(this.template(album)));
                }, this); 
            },
            events: {
                "click .deleteAlbum": "deleteAlbum",
                "click .editAlbum": "editAlbum",
                "click .viewAlbum": "viewAlbum",
                "click .addVideo": "addVideo"
            },
            deleteAlbum: function(event){
                console.log( "deleteAlbum");
            },
            editAlbum: function(event){
                console.log( "editAlbum");
            },
            viewAlbum: function(event){
                console.log( "viewAlbum");
            },
            addVideo: function(event){
                console.log( "addVideo");
            }
        });    
        
    myAlbumsCollection.fetch({
        userId: userId,
        success: function(){
            console.log("myAlbumsCollection.fetch succeeded")
            var myAlbumsView = new AlbumsView({ collection: myAlbumsCollection, el: $('#myAlbumsViewHtml') });
        }
    });
        
    AppRouter = Backbone.Router.extend({
         routes: {
             "!/": "rootRoute",
             "!/albums": "albumsRoute",
             "*actions": "defaultRoute"
         },
         rootRoute: function(){
             // alert('rootRoute');
         },
         defaultRoute: function(actions){
             // alert('defaultRoute');
         },
         
     });

     var myAppRouter = new AppRouter;
     Backbone.history.start();
     
    
        
  
    
    
})(jQuery);
