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
            zoomLink: "/sortedbynew/"
        };
    },
    computed: {
        gallery: function () {
            if (this.$parent.gallery) {
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
            zoomLink: "/sortedbyold/"
        };
    },
    computed: {
        gallery: function () {
            if (this.$parent.gallery) {
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
    ready: function () {
        this.swipe();
    },
    computed: {
        index: function () {
            if (this.$route.params.picId) {
                return this.$route.params.picId;
            } else {
                return 0;
            }
        },
        currentPic: function () {
            var self = this;
            if (self.$parent.gallery) {
                var pic = self.$parent.gallery[self.index];
                return pic;
            } else {
                return '';
            }
        },
        currentPicSrc: function () {
            var self = this;
            if (self.$parent.gallery) {
                var pic = self.$parent.gallery[self.index];
                return this.$parent.folders.zoom + pic.name;
            } else {
                return 'data:image/gif;base64,R0lGODlhAQABAAAAACH5BAEKAAEALAAAAAABAAEAAAICTAEAOw==';
            }
        },
        sortLink: function () {
            return this.$route.router;
        },
        nextpic: function () {
            var check = this.$parent.length;
            var index = parseInt(this.index);
            if ((index + 1) === check) {
                return 0;
            } else {
                return index + 1;
            }
        },
        prevpic: function () {
            var check = this.$parent.length;
            var index = parseInt(this.index);
            if (index === 0) {
                return check - 1;
            } else {
                return index - 1;
            }
        },
        imgClass: function () {
            if (this.currentPic.ratio === "portrait") {
                return 'img_link_port';
            } else {
                return 'img_link_land';
            }
        },
        popClass: function () {
            if (this.currentPic.ratio === "portrait") {
                return 'popup-container-h';
            } else {
                return '';
            }
        }
    },
    methods: {
        imgChange: function () {

        },
        swipe: function () {
            var self = this;
            var myElement = document.getElementById('swipe_div');
            var mc = new Hammer(myElement);
            mc.on('swipeleft', function () {
                var path = {name: self.zoomLink, params: {picId: self.nextpic}};
                router.go(path);
                self.imgChange();
            });
            mc.on('swiperight', function () {
                var path = {name: self.zoomLink, params: {picId: self.prevpic}};
                router.go(path);
                self.imgChange();
            });
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
        component: sortedbynew,
        subRoutes: {
            '/:picId': {
                component: zoom
            }
        }

    },
    '/sortedbyold': {
        component: sortedbyold,
                subRoutes: {
                    '/:picId': {
                        component: zoom
                    }
                }
    }



});


router.start(allPics, 'body', function () {

});

