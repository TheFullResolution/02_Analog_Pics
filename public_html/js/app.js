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
            piczoom: false,
            windowWidth: ''
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
        },
        folderGallery: function () {
            if ($(window).width() < 740) {
                return this.folders.small;
            } else {
                return this.folders.mid;
            }
        },
        zoomGallery: function () {
            if ($(window).width() < 740) {
                return this.folders.mid;
            } else {
                return this.folders.zoom;
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
            zoomLink: "/sortedbynew"
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
            return this.$parent.folderGallery;
        },
        zoomGallery: function () {
            return this.$parent.zoomGallery;
        },
        folderFull: function () {
            return this.$parent.folders.full;
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
            zoomLink: "/sortedbyold"
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
            return this.$parent.folderGallery;
        },
        folderFull: function () {
            return this.$parent.folders.full;
        },
        zoomGallery: function () {
            return this.$parent.zoomGallery;
        },
        length: function () {
            return this.$parent.length;
        }
    }
});

var zoom = Vue.extend({
    template: "#popup",
    ready: function () {
        $('body, html').css('overflow', 'hidden');
        $('body').addClass('disable-scrolling');
        this.swipe();
        this.$watch(function () {
            return this.index;
        },
                function () {
                    this.imgChange();
                });
    },
    computed: {
        index: function () {
            if (this.$route.params.picId) {
                return parseInt(this.$route.params.picId) - 1;
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
        fullSizeSrc: function () {
            var self = this;
            if (self.$parent.gallery) {
                var pic = self.$parent.gallery[self.index];
                return this.$parent.folderFull + pic.name;
            } else {
                return '';
            }
        },
        currentPicSrc: function () {
            var self = this;
            if (self.$parent.gallery) {
                var pic = self.$parent.gallery[self.index];
                return this.$parent.zoomGallery + pic.name;
            } else {
                return 'data:image/gif;base64,R0lGODlhAQABAAAAACH5BAEKAAEALAAAAAABAAEAAAICTAEAOw==';
            }
        },
        link: function () {
            return this.$parent.zoomLink;
        },
        nextpic: function () {
            var check = this.$parent.length;
            if ((this.index + 1) === check) {
                return 1;
            } else {
                return this.index + 2;
            }
        },
        prevpic: function () {
            var check = this.$parent.length;
            if (this.index === 0) {
                return check;
            } else {
                return this.index;
            }
        },
        imgClass: function () {
            if (this.currentPic.ratio === "portrait") {
                return 'img_link_port';
            } else {
                return '.img_link_land';
            }
        },
        popClass: function () {
            if (this.currentPic.ratio === "portrait") {
                return 'popup_container_h';
            } else {
                return '';
            }
        }
    },
    methods: {
        imgChange: function () {
            $(".img_link_img").attr("src", "data:image/gif;base64,R0lGODlhAQABAAAAACH5BAEKAAEALAAAAAABAAEAAAICTAEAOw==");
            $('.img_link_img').removeClass('lazyloaded').addClass('lazyload');
        },
        details: function () {
            $('.popup_details').slideToggle("fast");
            $('.popup_details_top').slideToggle("fast");

        },
        swipe: function () {
            var self = this;
            var options = {
                preventDefault: true
            };
            var myElement = document.getElementById('swipe_div');
            var mc = new Hammer(myElement, options);
            mc.on('swipeleft', function () {
                var path = {path: self.link + '/' + self.nextpic};
                router.go(path);
                self.imgChange();
            });
            mc.on('swiperight', function () {
                var path = {path: self.link + '/' + self.prevpic};
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
            '/': {
                component: {
                    template: '',
                    ready: function () {
                        $('body, html').css('overflow', 'auto');
                        $('body').removeClass('disable-scrolling');
                    }
                }
            },
            '/:picId': {
                component: zoom
            }
        }

    },
    '/sortedbyold': {
        component: sortedbyold,
        subRoutes: {
            '/': {
                component: {
                    template: '',
                    ready: function () {
                        $('body, html').css('overflow', 'auto');
                        $('body').removeClass('disable-scrolling');
                    }
                }
            },
            '/:picId': {
                component: zoom
            }
        }
    }



});


router.start(allPics, 'body', function () {

});

document.ontouchmove = function (event) {
    var isTouchMoveAllowed = true, target = event.target;
    while (target !== null) {
        if (target.classList && target.classList.contains('disable-scrolling')) {
            isTouchMoveAllowed = false;
            break;
        }
        target = target.parentNode;
    }

    if (!isTouchMoveAllowed) {
        event.preventDefault();
    }
};