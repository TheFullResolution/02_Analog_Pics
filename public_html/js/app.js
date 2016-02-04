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
    },
    data: function () {
        return {
            zoomLink: "sortedbynew"
        };
    },
    computed: {
        gallery: function () {
            if(this.$parent.gallery) {
            var pics = this.$parent.gallery.slice();
            pics.reverse();
            return pics;
        } else {
            return '';
        }
        },
        folders: function () {
            return this.$parent.folders;
        },
        length: function () {
            return this.$parent.length;
        }
        
    }
});

var sortedbyold = Vue.extend({
    template: "#gallery_template",
    ready: function () {
        this.$parent.sorted = true;
    },
    data: function () {
        return {
            zoomLink: "sortedbyold"
        };
    },
    computed: {
        gallery: function () {
            if(this.$parent.gallery) {
            var pics_notsorted = this.$parent.gallery;
            return pics_notsorted;
        } else {
            return '';
        }
        },
        folders: function () {
            return this.$parent.folders;
        },
        length: function () {
            return this.$parent.length;
        }
    }
});

var zoom = Vue.extend({
     template: "#popup",
     
     
}); 

var router = new VueRouter({
});


router.redirect({
    '/': '/sortedbynew'
});

router.map({
    '/sortedbynew': {
        component: sortedbynew,
         subRoutes: {
             '/:picId' : {
                 name: 'gallery',
                 component: 'zoom'
             }
         }

    },
    '/sortedbyold': {
        component: sortedbyold,
         subRoutes: {
             '/:picId' : {
                 name: 'gallery',
                 component: 'zoom'
             }
         }
    }



});


router.start(allPics, 'body', function () {

});

