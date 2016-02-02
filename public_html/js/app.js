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
            sorted: false,
            piczoom: false
        };
    },
    computed: {
        length: function () {
            if (this.pics.gallery) {
                return this.pics.gallery.length;
            } else {
                return 0;
            }
        },
        gallery: function () {
            return this.pics.gallery;
        },
        sortStatus: function () {
            if (this.sorted) {
                return "Sorted oldest to newest";
            } else {
                return "Sorted newest to oldest";
            }
        },
        sortLink: function () {
            if (this.sorted) {
                return "/sortedbynew";
            } else {
                return "/sortedbyold";
            }
        }
    },
    compiled: function () {
        this.fetchData();
    },
    ready: function () {
        this.downloadlazyload();
    },
    methods: {
        fetchData: function () {
            var self = this;
            $.getJSON("js/gallery.json", function (json) {
                self.pics = json;
            });
        },
        sort: function () {
            $('#sort_arrows').addClass('moved');
            $('#sort_text').addClass('text_showed');

            setTimeout(function () {
                $('#sort_text').removeClass('text_showed');
                $('#sort_arrows').removeClass('moved');
            }, 500);
        },
        downloadlazyload: function () {
            var self = this;
            $.ajax({
                url: url,
                dataType: 'script',
                success: function () {
                    window.lazySizesConfig = {
                        addClasses: true
                    };

                }});
        }
    }
});



var sortedbynew = Vue.extend({
    template: "#gallery_template",
    ready: function () {
        this.$parent.sorted = false;
        initPhotoSwipeFromDOM('#gallery');
    },
    data: function () {
        return {
            zoomLink: "sortedbynew"
        };
    },
    computed: {
        gallery: function () {
            var self = this;
            var pics = self.$parent.gallery.slice();
            pics.reverse();
            return pics;
        },
        folders: function () {
            return this.$parent.folders;
        }
    }
});

var sortedbyold = Vue.extend({
    template: "#gallery_template",
    ready: function () {
        this.$parent.sorted = true;
        initPhotoSwipeFromDOM('#gallery');
    },
    data: function () {
        return {
            zoomLink: "sortedbyold"
        };
    },
    computed: {
        gallery: function () {
            var self = this;
            var pics_notsorted = self.$parent.gallery;
            return pics_notsorted;
        },
        folders: function () {
            return this.$parent.folders;
        }
    }
});



var router = new VueRouter({
});


router.redirect({
    '/': '/sortedbynew'
});

router.map({
    '/sortedbynew': {
        component: sortedbynew

    },
    '/sortedbyold': {
        component: sortedbyold
    }



});


router.start(allPics, 'body', function () {

});

