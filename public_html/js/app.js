/* global Vue */

var url = "js/lazysizes.min.js";

var allPics = Vue.extend({
    el: function () {
        return "#gallery";
    },
    data: function () {
        return {
            pics: {},
            folders: {
                full: "img/gallery/full_size/",
                mid: "img/gallery/mid/",
                small: "img/gallery/small/",
                zoom: "img/gallery/zoom/"
            },
            jsonloaded: false
        };
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
        }
    }
});




var router = new VueRouter({
});

router.start(allPics, 'body', function () {

});

