(function ($) {
    var userId = 9580389;
    
    Backbone.sync = function(method, model, options) {
        console.log('sync', method, JSON.stringify(model))
        var params = {
            url: "http://new.undev.ru/vimeo/api.json",
            type: 'POST', 
            dataType: 'json',
            success: options.success,
            error: options.error
        };

        if (model instanceof AlbumsCollection && method == 'read') {
            params.data = {
                method: "albums.getAll", 
                params: {"user_id": options.userId}
            }
        };
        
        if (model instanceof AlbumsModel && method == 'delete') {
            params.data = {
                method: "albums.delete", 
                params: {
                    album_id: model.id,
                }
            }
        };

        if (model instanceof AlbumsModel && method == 'create') {
            params.data = {
                method: "albums.create", 
                params: {
                    video_id: model.get('video_id'),
                    title: model.get('title'),
                    description: model.get('description')
                }
            }
        };
        if (model instanceof AlbumsModel && method == 'update') {
            params.data = {
                method: "albums.setTitle", 
                params: {
                    album_id: model.id,
                    title: model.get('title')
                }
            }
        };

        if (model instanceof VideoModel && method == 'create') {
            params.data = {
                method: "albums.addVideo", 
                params: {
                    album_id: model.id,
                    video_id: model.get('video_id')
                }
            }
        };
        
        

        
        return $.ajax(params);
    };
    
    VideoModel = Backbone.Model.extend({
        human_name: "VideoModel",
        defaults: {
        },
        validate: function(){
        },
        initialize: function(){
            console.log('VideoModel');
        }        

    });

    AlbumsModel = Backbone.Model.extend({
        human_name: "AlbumsModel",
        defaults: {
            title: 'title default',
        },
        validate: function(){
        },
        initialize: function(){
        }        

    });
    
    AlbumsCollection = Backbone.Collection.extend({
        human_name: "AlbumsCollection",
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
        createAlbumSubmit: function(event){
            event.preventDefault();
            this.model.set({title: this.$el.find('#title').val(), description: this.$el.find('textarea').val(), video_id: this.$el.find('#id').val()});
            this.model.save(this.model.attributes, {success: function(){ reloadAlbums(); }});
        }        
    });
    VideoView = Backbone.View.extend({
        template: _.template($('#myVideoViewTmpl').html()),
        initialize: function(){
            this.render();
        },
        render: function(){
            $(this.el).empty();
            $(this.el).html(this.template(this.model.toJSON()));
            console.log(this.model.toJSON());
        }
        
    });

    AlbumView = Backbone.View.extend({
        addvideotmpl: _.template($('#myAddVideoTmpl').html()),
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
           "click .editTitle": "editTitle",
           "click .viewAlbum": "viewAlbum",
           "click .addVideo": "addVideo",
           "click .addVideoSubmit": "addVideoSubmit"
           
        },
        deleteAlbum: function(){
            var that = this;
            this.model.destroy({success: function(model, response){
                that.trigger("deleted");
            }});
        },
        editTitle: function(event){
            console.log(this.model.get('title'));
            var $input = $("<input />").attr({
                  class: "titleField",
                  placeholder: this.model.get('title'),
                  type: 'text'});
                  
           $(this.el).find('.editTitle').html('').append($input);
           $input.focus();
           var model = this.model;
           $input.bind('blur', function(){ 
               console.log('$(this).val()', $(this).val()); 
               model.save({title: $(this).val(), success: function(){ console.log('model.save succeeded')} })  });
           
        },
        viewAlbum: function(){
           console.log('viewAlbum');
        },
        addVideo: function(){
            this.$('.addVideoForm').html(this.addvideotmpl({}));
        },
        addVideoSubmit: function(event){
            event.preventDefault();
            var myVideoModel = new VideoModel;
            myVideoModel.set({video_id: this.$('#videoid').val()});
            myVideoModel.save(myVideoModel.attributes, {success: function(){ reloadAlbums(); }});
            console.log('myVideoModel.isNew()', this.model.isNew());
            var $div = $('<div></div>');
            $(this.el).append($div);
            var myVideoView = new VideoView({ model: myVideoModel, el: $div });

            
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
