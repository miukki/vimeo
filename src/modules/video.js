http://habrahabr.ru/post/118782/
http://backbonejs.org/docs/todos.html
http://documentcloud.github.com/backbone/docs/backbone.html
http://backbonetutorials.com/what-is-a-collection/


// Initialize your application here. http://weblog.bocoup.com/organizing-your-backbone-js-application-with-modules/
//src/app.js

jQuery(function($) {

    var app = {
     // Create this closure to contain the cached modules
     module: function() {
        // Internal module cache.
        var modules = {};

        // Create a new module reference scaffold or load an
        // existing module.
        return function(name) {
          // If this module has already been created, return it.
          if (modules[name]) {
            return modules[name];
          }

          // Create a module and save it under this name
          return modules[name] = { Views: {} };
        };
      }()
    };

});





//file src/module/video.js
(function(Video) {

//Define Video
    Video.Model = Backbone.Model.extend({
        initialize: function() {
         // Add a nested messages collection
         this.set({ messages: new Message.List() });
         };
         defaults: {
       };
     });
     

//Define a friend list
    Video.List = Backbone.Collection.extend({
       model: Video.Model
     });     
     

})(app.module("Video"));





$('document').ready(function() {
    var MAP_THUMB_WIDTH = '200';
    var ARRAY_ALBUMS = [];
    var URL = 'http://new.undev.ru/vimeo/api.json';
    var ARRAY_VIDEOS = [];

    function vimeo_ajax(options) {
        return $.ajax($.extend({
            type: 'POST',
            url: URL, 
            dataType: 'json',
            error: function() { alert("error");}
            }, options))
    }

    /* <script id="tmplListVideo" type="text/x-jquery-tmpl" src="tmpl/list_video.tmpl"></script>  
    function load_temlate()

        (function($) {
       var compiled = {};
       $.fn.handlebars = function(template, data) {
         if (template instanceof jQuery) {
           template = $(template).html();
         }

         compiled[template] = Handlebars.compile(template);
         this.html(compiled[template](data));
       };
     })(jQuery);

    
    */

    
    function getAllAlbumsRequest(){
        vimeo_ajax({
            data: {
                "method": "albums.getAll", 
                "params": {"user_id": "9580389"}
            }, 
            success: getAlbums
        })
    };
    
    function getVideoRequest(id_album){
        vimeo_ajax({
            data: {
                method: "albums.getVideos", 
                params: {
                    album_id: id_album,
                    full_response: true,
                }
            }, 
            success: getVideosHandler
        });
        
    };

    function getAlbums(response){
        var on_this_page = response.albums.on_this_page;
        $('#totalDesc').empty().html('Найдено альбомов:&nbsp;' + on_this_page);
        var map = response.albums.album;
        ARRAY_ALBUMS = [];
        $.each(map, function(key, value){
            var obj = {};
            obj.id = value.id;
            obj.date = value.created_on;
            obj.title = value.title;
            obj.description = value.description;
            var map_thumbnails = value.thumbnail_video.thumbnails.thumbnail;
            $.each(map_thumbnails, function(key, value){
                if (value.width == MAP_THUMB_WIDTH){
                    return obj.url_thumbnail = value._content;
                }
            }); 
            ARRAY_ALBUMS.push(obj);
        });
        buildTmplAlbums(ARRAY_ALBUMS);

    };

    function buildTmplAlbums(data){
        var listAlbums = $('#listAlbums');
        listAlbums.empty();
        $('<button id="add-album">Add album</button>').appendTo(listAlbums).click(createAlbumHandler);
        $('#albumsTemplate').tmpl(data).appendTo(listAlbums);
    };

    function getVideosHandler(response){
        console.log(response);
        var map = response.videos.video;
        ARRAY_VIDEOS = [];
        $.each(map, function(key, value){
            var obj = {};
            obj.id = value.id;
            obj.date = value.modified_date;
            obj.title = value.title;
            obj.description = value.description;
            obj.is_like = value.is_like;
            obj.number_of_likes = value.number_of_likes;
            
            var map_thumbnails = value.thumbnails.thumbnail;
            $.each(map_thumbnails, function(key, value){
                if (value.width == MAP_THUMB_WIDTH){
                    return obj.url_thumbnail = value._content;
                }
            }); 

            var map_url = value.urls.url;
            $.each(map_url, function(key, value){
                if(value.type == 'video') return obj.url_video = value._content;
            });
            ARRAY_VIDEOS.push(obj);
        });
        
        buildTmplListVideo(ARRAY_VIDEOS);
    };    
    
    function buildTmplListVideo(data){
        $('.list-video').empty();
        $('#tmplListVideo').tmpl(data).appendTo('.list-video');
    };
    

        
    $(".delete-album").live('click', function(){
        var $elem = $(this);
        var id = $elem.data('id');
        
        vimeo_ajax({
            data: {
                method: "albums.delete", 
                params: {
                    album_id: id,
                }
            }, 
            success: getAllAlbumsRequest
        });
            
        return false;
    });

    $(".view-album").live('click', function(){
        var $elem = $(this);
        var tools  = $elem.parents('.album').find('.video-tools');
        var id = $elem.data('id');

        tools.find('.add-video-block').empty();
        tools.find('.edit-album-block').empty();
        getVideoRequest(id);
        
    });
        
    $(".add-video").live('click', function(){
        var $elem = $(this);
        var tools = $elem.parents('.album').find('.video-tools');
        var id = $elem.data('id');
        
        tools.find('.add-video-block').empty();
        tools.find('.edit-album-block').empty();
        
        $('#tmplAddVideo').tmpl().appendTo(tools.find('.add-video-block'));

        $('.form-add-video').submit(function() {
            vimeo_ajax({
                data: {
                    method: "albums.addVideo", 
                    params: {
                        album_id: id,
                        video_id: parseInt($('#videoid').val()),
                    }
                }, 
                success: function(){
                    tools.find('.add-video-block').html('<p style="color:red;">Ваше видео добавлено</p>');
                    getVideoRequest(id);
                }
            });
            return false;
        });
    });
    
    $('.delete-video').live('click', function(){
        
        var id = $(this).data('id');
        var current_video = $(this).parents('.video');
        
        vimeo_ajax({
            data: {
                method: "videos.delete", 
                params: {
                    video_id: id,
                }
            }, 
            success: function(){current_video.remove();},
        });

    });
    
    $('.view-video').live('click', function(){
        var id = $(this).data('id');
        var thumbnail = $(this).parents('.video').find('.thumbnail');
        thumbnail.html('<iframe src="http://player.vimeo.com/video/' + id +'" width="400" height="300" frameborder="0" webkitAllowFullScreen mozallowfullscreen allowFullScreen></iframe>');
        return false;
    });

    $('.edit-album').live('click', function(){
        var $elem = $(this);
        var tools = $elem.parents('.album').find('.video-tools');
        var id = $elem.data('id');
        var descAlbum = '';
        var tilteAlbum = '';
        $.each(ARRAY_ALBUMS, function(key, value){

            if( id == value.id){
                tilteAlbum = value.title;
                descAlbum = value.description;
                return;
            }
        });
        
        tools.find('.edit-album-block').empty();
        tools.find('.add-video-block').empty();
        $('#editAlbumsTemplate').tmpl({ title: tilteAlbum, description: descAlbum}).appendTo(tools.find('.edit-album-block'));

        $('#edit').submit(function() {

            vimeo_ajax({
                data: {
                    method: "albums.setTitle", 
                    params: {
                        album_id: id,
                        title: $('#videotitle').val()
                    }
                }, 
                success: function(){
                    console.log('edit title album');
                }
            });

            vimeo_ajax({
                data: {
                    method: "albums.setDescription", 
                    params: {
                        album_id: id,
                        description: $('#videodesc').val()
                    }
                }, 
                success: function(){
                    console.log('edit description album');
                }
            });
            getAllAlbumsRequest();
            
            return false;
        });
        
    });

    function createAlbumHandler() {
        $('.create-album').remove();
        $('#createAlbumsTemplate').tmpl().insertAfter($(this));
        
        $('.create-album').submit(function() {
            vimeo_ajax({
                data: {
                    method: "albums.create", 
                    params: {
                        video_id: parseInt($('#videoid').val()),
                        title: $('#videotitle').val(),
                        description: $('#videodesc').val()
                    }
                }, 
                success: getAllAlbumsRequest
            });
            return false;
        });
    };
    
    function empty(){
        $('#totalDesc').empty();
        $('#listAlbums').empty();
    };
    
    getAllAlbumsRequest();
});




<script id="tmplListVideo" type="text/x-jquery-tmpl">
    <div class="video">
    	<b>${title}</b><br/>${description}<br/>${date}
    	<div class="thumbnail"><img src="${url_thumbnail}"></div>
    	<div class="video-links">
    		<a href="#delete-${id}" name="delete-${id}" class="delete-video" data-id="${id}">delete</a>&nbsp;
    		<a href="#edit-${id}" name="edit-${id}" class="like-video" data-id="${id}">like (залайкало: ${number_of_likes})</a>&nbsp;
    		<a href="#view-${id}" name="view-${id}" class="view-video" data-id="${id}">view</a>
    	</div>
    	<div class="view-video-block"></div>
    </div>
</script>  



<script id="createAlbumsTemplate" type="text/x-jquery-tmpl"> 
	<form class="create-album" action="">
		<input type="text" id="videoid" placeholder="enter video id" /><br/>
		<input type="text" id="videotitle" placeholder="enter video title" /><br/>
		<textarea id="videodesc">add description</textarea><br/>
		<input type="submit" value="Create album" />
	</form>
</script>

<script id="tmplAddVideo" type="text/x-jquery-tmpl"> 
	<form class="form-add-video" action="">
		<input type="text" id="videoid" placeholder="enter video id" /><br/>
		<input type="submit" value="add video" />
	</form>
</script>

<script id="editAlbumsTemplate" type="text/x-jquery-tmpl"> 
	<form id="edit" action="">
		<input type="text" id="videotitle" placeholder="${title}" /><br/>
		<textarea id="videodesc" placeholder="${description}"></textarea><br/>
		<input type="submit" value="edit title, description" />
	</form>
</script>