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

        if (model.model == Album && method == 'read') {
            params.data = {
                method: "albums.getAll", 
                params: {"user_id": options.userId}
            }
        }
        return $.ajax(params);
    };
    
    AlbumsModel = Backbone.Model.extend({
        defaults: {
            video_sort_method: '',
            created_on: '',
            title: '',
            url: '',
            id: '',
            total_videos: '',
            description: '',
            thumbnail_video: {},
        },
        validate: function(){
        },
        initialize: function(){
        }
    });
    
    AlbumsCollection = Backbone.Collection.extend({
        initialize: function(){},
        silent: true,
        model: AlbumsModel,
        parse: function(resp, xhr) {
          return resp.albums.album;
        }
    });
    
    var myAlbumsCollection = new AlbumsCollection([]);
    myAlbumsCollection.reset();
    myAlbumsCollection.fetch({
        //add: false,
        userId: userId,
        success: function(){
            console.log("user_albums.fetch succeeded")
        }
    });
    
    console.log(myAlbumCollection.models);
    
    var myAlbumsView = Backbone.View.extend({
            template: _.template($('#myAlbumsView').html(), variables),
            initialize: function(){
                this.render();
            },
            render: function(){
                var variables = { };
                //this.$el
                $(this.el).html(this.template(this.model.toJSON()));
                
            },
            events: {
                "click input[type=button]": "doSearch" 
            },
            doSearch: function(event){
                //console.log( "Search for " + $('#search_input').val() );
            }
        });    
    var app_view = new AppView({ el: $('#search_container') });
        
    
    
    /*example code*/
    AppModel = Backbone.Model.extend({
        defaults: {
            name: '',
            age: 0,
            children: []
        },
        validate: function(attributes){
            if(attributes.age < 0){
                return attributes.age;
            }
        },
        initialize: function(){
            this.bind('change', function(){
                var array = this.get('children' );
                var name = this.get('name');
                //console.log(array, name);
            });
            this.bind('error', function(model, error){
                //console.log( error );
            });
        },
        addchildren: function(NewChildrenName){
            var childArray = this.get('children');
            childArray = _.union(childArray, [NewChildrenName]);
            this.set({children: childArray});
        },
        replacename: function(NewName){
            this.set({name: NewName});
        }
    });
        

    AppCollection = Backbone.Collection.extend({
        model: AppModel,
    });    
    
    var app_model1 = new AppModel({ name: "Thomas", age: 70, children: ['Ryan', 'Any'] });
    app_model1.addchildren('Antony');
    app_model1.replacename('Katty');
    var app_model2 = new AppModel({ name: "Anya", age: 25, children: ['Bob', 'Di'] });
    var app_model3 = new AppModel({ name: "Marvine", age: 35, children: ['Tom', 'Devis'] });
    
    var myCollection = new AppCollection([app_model1, app_model2, app_model3]);

    AppRouter = Backbone.Router.extend({
        routes: {
            "posts/:id": "getPost",
            "download/*path": "downloadFile",
            "/:route/:action": "loadView",
            "*actions": "defaultRoute"
        },
        getPost: function(id){
        },
        downloadFile: function(path){
        },
        loadView: function( route, action ){ 
        },
        defaultRoute: function(actions){
        }
    });
    
    var app_router = new AppRouter;
    Backbone.history.start();
    
        
  
    
    
})(jQuery);
