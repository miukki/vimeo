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

        if (method == 'read') {
            params.data = {
                method: "albums.getAll", 
                params: {"user_id": options.userId}
            }
        };
        
        if (method == 'delete') {
            params.data = {
                method: "albums.delete", 
                params: {
                    album_id: model.id,
                }
            }
        };

        if (method == 'create') {
            params.data = {
                method: "albums.create", 
                params: {
                    video_id: model.get('video_id'),
                    title: model.get('title'),
                    description: model.get('description')
                }
            }
        };

        
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
            return resp.albums.album;
        }
    });
    
    myAlbumsCollection = new AlbumsCollection;
    
    CreateAlbumView = Backbone.View.extend({
        template: _.template($('#myCreateAlbumViewTmpl').html()),
        initialize: function(){
            this.render();
        },
        render: function(){
           $(this.el).empty();
           $(this.el).html(this.template({}));
        },
        events: {
            "click .createAlbumSubmit": "createAlbumSubmit"
        },
        createAlbumSubmit: function(){
            //console.log('1');
            //console.log(this.$el.find('#id').val());
            this.model.set({title: this.$el.find('#title').val(), description: this.$el.find('textarea').val(), video_id: this.$el.find('#id').val()});
            console.log('this.model.isNew()', this.model.isNew());
            this.model.save({success: function(){
                console.log('reloadAlbums()');
                reloadAlbums();
            }});
        }        
    });

    AlbumView = Backbone.View.extend({
        template: _.template($('#myAlbumViewTmpl').html()),
        initialize: function(){
            this.render();
        },
        render: function(){
           $(this.el).empty();
           $(this.el).html(this.template(this.model.toJSON()));
        },
        events: {
           "click .deleteAlbum": "deleteAlbum",
           "click .editAlbum": "editAlbum",
           "click .viewAlbum": "viewAlbum",
           "click .addVideo": "addVideo"
        },
        deleteAlbum: function(){
            var that = this;
            this.model.destroy({success: function(model, response){
                that.trigger("deleted");
            }});
        },
        editAlbum: function(event){
           console.log('editAlbum');
        },
        viewAlbum: function(event){
           console.log('viewAlbum');
        },
        addVideo: function(event){
           console.log('addVideo');
        }
    });
    
    AlbumsView = Backbone.View.extend({
            template: _.template($('#AllAblumsViewTmpl').html()),
            initialize: function(){
                this.render();
                this.collection.on("change", this.render, this)
            },
            render: function(){
                $(this.el).empty();
                $(this.el).html(this.template({}));
                _.each(this.collection.models, function(album) {
                    console.log('album', album);
                    var $div = $('<div></div>');
                    $(this.el).append($div);
                    var myAlbumView = new AlbumView({ model: album, el: $div });
                    myAlbumView.on("deleted", this.render, this);
                }, this); 
            },
            events: {
                "click .createAlbum": "createAlbum"
            },
            createAlbum: function(){
               var myCreateAlbumView = new CreateAlbumView({ model: new AlbumsModel, el: $('#myCreateAlbumViewHtml') });
            }
            
        });    
        
    function reloadAlbums(){
        myAlbumsCollection.fetch({
            userId: userId,
            success: function(){
                console.log("myAlbumsCollection.fetch succeeded")
                var myAlbumsView = new AlbumsView({ collection: myAlbumsCollection, el: $('#AllAblumsViewHtml') });
            }
        });        
    };
    
    reloadAlbums();
        
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
