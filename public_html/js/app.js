/* global Vue */

var url = "js/lazysizes.min.js";

var allPics = Vue.extend({
    data: function () {
        return {
            pics: {},
            folders: {
                full: "img/gallery/full_size/",
                mid: "img/gallery/mid/",
                small: "img/gallery/small/",
                zoom: "img/gallery/zoom/"
            },
            jsonloaded: false,
            sorted: false
        };
    },
    computed: {
        sortStatus: function () {
            var self = this;
            if (!self.sorted) {
                return "Sort: oldest to newest";
            } else {
                return "Sort: newest to oldest";
            }
        }

    },
    compiled: function () {
        this.fetchData();
    },
    ready: function () {
        var self = this;
        $.ajax({
            url: url,
            dataType: 'script',
            success: function () {
                window.lazySizesConfig = {
                    addClasses: true
                };
                self.jsonloaded = true;
            }});
    },
    methods: {
        fetchData: function () {
            var self = this;
            $.getJSON("js/gallery.json", function (json) {
                self.pics = json;
            }).done(function () {

            });
        },
        sort: function () {
            this.pics.gallery.reverse();
            this.sorted = !this.sorted;
            
            $('.img_div, #sort_icon').css({
                'opacity': 0
            }).animate({
                opacity: 1
            }, 1000);
            
        }
    }
});



var router = new VueRouter({
});

router.start(allPics, 'body', function () {

});

