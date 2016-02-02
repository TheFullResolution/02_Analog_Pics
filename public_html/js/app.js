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
            piczoom: false
        };
    },
    computed: {
        length: function () {
            if(this.pics.gallery) {
            return this.pics.gallery.length;
        } else {
            return 0;
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
        }
    }
});


var sorting = Vue.extend({
    template: "#header",
    data: function () {
        return {
            sorted: false
        };
    },
    computed: {
        gallery: function () {
            return this.$parent.pics.gallery;
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
                return "/gallery/sortedbynew";
            } else {
                return "/gallery/sortedbyold";
            }
        },
        folders: function () {
            return this.$parent.folders;
        }

    },
    methods: {
        sort: function () {
            $('#sort_arrows').addClass('moved');
            $('#sort_text').addClass('text_showed');

            setTimeout(function () {
                $('#sort_text').removeClass('text_showed');
                $('#sort_arrows').removeClass('moved');
            }, 500);
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

var zoom_pics = Vue.extend({
    template: "#zoom",
    ready: function () {
        this.swipe();
    },
    computed: {
        sorting: function () {
            if (this.$route.name === "sortedbynew") {
                return false;
            } else {
                return true;
            }
        },
        gallery: function () {
            if (!this.sorting) {
                var self = this;
                var pics = self.$parent.pics.gallery.slice();
                pics.reverse();
                return pics;
            } else {
                var self = this;
                var pics_notsorted = self.$parent.pics.gallery;
                return pics_notsorted;
            }
        },
        index: function () {
            if (this.$route.params.picId) {
                return this.$route.params.picId;
            } else {
                return 0;
            }
        },
        currentPic: function () {
            var self = this;
            if (self.gallery) {
                var pic = self.gallery[self.index];
                return pic;
            } else {
                return '';
            }
        },
        currentPicSrc: function () {
            var self = this;
            if (self.gallery) {
                var pic = self.gallery[self.index];
                return this.$parent.folders.zoom + pic.name;
            } else {
                return 'data:image/gif;base64,R0lGODlhAQABAAAAACH5BAEKAAEALAAAAAABAAEAAAICTAEAOw==';
            }
        },
        zoomLink: function () {
            return this.$route.name;
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
    '/' : '/gallery/sortedbynew'
});

router.map({
    '/gallery': {
        component: sorting,
        subRoutes: {
            '/sortedbynew': {
                component: sortedbynew

            },
            '/sortedbyold': {
                component: sortedbyold
            }

        }
    },
    '/sortedbynew/:picId': {
        name: 'sortedbynew',
        component: zoom_pics
    },
    '/sortedbyold/:picId': {
        name: 'sortedbyold',
        component: zoom_pics
    }
});


router.start(allPics, 'body', function () {

});

