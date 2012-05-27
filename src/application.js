(function ($) {
    var AppRouter = Backbone.Router.extend({
            routes: {
                "posts/:id": "getPost",
                "download/*path": "downloadFile",
                "/:route/:action": "loadView",
                "*actions": "defaultRoute"
            },
            getPost: function(id){
                alert( "Get post number " + id );
            },
            downloadFile: function(path){
                alert(path);
            },
            loadView: function( route, action ){ 
                alert(route + "_" + action); 
            },
            defaultRoute: function(actions){
                alert( "defaultRoute " + actions); 
            }
        });
    var SearchView = Backbone.View.extend({
            initialize: function(){
                this.render();
            },
            render: function(){
                var template = _.template( $('#search_template').html(), {title: "Title1"});
                this.$el.html(template);
            },
            events: {
                "click input[type=button]": "doSearch" 
            },
            doSearch: function(event){
                alert( "Search for " + $('#search_input').val() );
            }
        });    
        
    var search_view = new SearchView({ el: $('#search_container') });    
    var app_router = new AppRouter;
    
    Backbone.history.start();
    
})(jQuery);
