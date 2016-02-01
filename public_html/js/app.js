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
            piczoom: false
        };
    },
    computed: {
        lenghtPics: function () {
            if (this.pics.gallery) {
                counter = 0;

                return this.pics.gallery.length;
            } else {
                return 0;
            }
        },
        sorted: function () {
            var path = this.$route.path.split('/');
            if (path[1] === 'sortedbyold') {
                return true;
            } else {
                return false;
            }
        },
        sortStatus: function () {
            var self = this;
            if (self.sorted) {
                return "Sorted oldest to newest";
            } else {
                return "Sorted newest to oldest";
            }
        },
        zoomLink: function () {
            var self = this;
            if (!self.sorted) {
                return "sortedbynew";
            } else {
                return "sortedbyold";
            }
        },
        sortLink: function () {
            var self = this;
            if (self.sorted) {
                return "/sortedbynew/gallery";
            } else {
                return "/sortedbyold/gallery";
            }
        },
        gallery: function () {
            var self = this;
            if (self.pics.gallery) {
                if (this.sorted) {
                    var pics_notsorted = self.pics.gallery;
                    return pics_notsorted;
                } else {
                    var pics = self.pics.gallery.slice();
                    pics.reverse();
                    return pics;
                }
            } else {
                return '';
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
            $('#sort_arrows').addClass('moved');
            $('#sort_text').addClass('text_showed');

            setTimeout(function () {
                $('#sort_text').removeClass('text_showed');
                $('#sort_arrows').removeClass('moved');
            }, 500);

            $('.img_div').each(function () {
                var self = this;
                $(self).css({'opacity': 0});
                setTimeout(function () {
                    $(self).animate({
                        opacity: 1
                    }, 500);
                }, (Math.random() * 1000));

            });
        }
    }
});


var sorting = Vue.extend({
});

var zoom_pics = Vue.extend({
    template: "#popup",
    ready: function () {
        this.swipe();
    },
    computed: {
        gallery: function () {
            return this.$parent.gallery;
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
        sortLink: function () {
            if (!this.$parent.sorted) {
                return "/sortedbynew/gallery";
            } else {
                return "/sortedbyold/gallery";
            }
        },
        zoomLink: function () {
            return this.$parent.zoomLink;
        },
        nextpic: function () {
            var check = this.$parent.lenghtPics;
            var index = parseInt(this.index);

            if ((index + 1) === check) {
                return 0;
            } else {
                return index + 1;
            }
        },
        prevpic: function () {
            var check = this.$parent.lenghtPics;
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
            $('.img_link_img').removeClass('lazyloaded').addClass('lazyload');

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

router.map({
    '/': {
        component: sorting
    },
    '/sortedbynew/gallery': {
        component: sorting
    },
    '/sortedbyold/gallery': {
        component: sorting
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

