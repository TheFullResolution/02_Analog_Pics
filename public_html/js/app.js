/* global Vue Hammer $ VueRouter*/

/*
allPics - main Vue.js component. Called by Vue router to start the app.

Due the fact that I am using Vue router, there is no root Vue instance, that is why all objects start with Vue.extend.

- data - because it is so called vue component all data has to be a function where static data is returned.
    - pics - variable which will store picture list, downloaded from gallery.json
    - folders - this part contains links to the folders of different sizes of the presented pictures.
    From full resolution pictures to small (640 px width).
    - sorted - used to track which version of gallery is displayed - sorted oldest to newest or newest to oldest.
- computed - store all none static values, basically function which keep track of changes of the variables.
    - length - return length of pictures array. Due the fact that gallery object is loaded asynchronously, when page
    is loaded it would go to error. When gallery is in the zoom mode, this way app track when to go to the beginning
    of the array.
    - gallery - returns picture array.
    - sortStatus - returns the text displayed to show how the gallery is sorted
    - sortLink - returns the link for the sorting changing link.
    - folderGallery - checks what is width of widow and checks if a device has a defined window orientation,
    if width is smaller than 800 and it had window orientation defined I assume that it must be mobile so pictures should be taken
    from small folder.
    - zoomGallery - same check as above for zoomed gallery.
- compiled - functions here are being called as soon as component is loaded.
    - fetchData is being called to download JSON file with picture list
- ready - functions here are being called as soon as component finished inserting all the data in DOM.
    - downloadlazyload - is being called to download lazysizes script for asynchronous load of pictures.
- methods - functions which are being called by component or user.
    - fetchData - jQuery JSON load method for picture array.
    - sort - being called upon filter change, to animate the link change.
    - downloadlazyload - jQuery Ajax request to download lazysizes script.
*/
var allPics = Vue.extend({
    data: function() {
        return {
            pics: {},
            folders: {
                full: 'img/gallery/full_size/',
                mid: 'img/gallery/mid/',
                small: 'img/gallery/small/',
                zoom: 'img/gallery/zoom/'
            },
            sorted: false
        };
    },
    computed: {
        length: function() {
            if (this.pics.gallery) {
                return this.pics.gallery.length;
            } else {
                return 0;
            }
        },
        gallery: function() {
            return this.pics.gallery;
        },
        sortStatus: function() {
            if (this.sorted) {
                return 'Sorted oldest to newest';
            } else {
                return 'Sorted newest to oldest';
            }
        },
        sortLink: function() {
            if (this.sorted) {
                return '/sortedbynew';
            } else {
                return '/sortedbyold';
            }
        },
        folderGallery: function() {
            var width = Math.max(document.documentElement.clientWidth, window.innerWidth);
            if (width < 800 && (typeof window.orientation) !== 'undefined') {
                return this.folders.small;
            } else {
                return this.folders.mid;
            }
        },
        zoomGallery: function() {
            var width = Math.max(document.documentElement.clientWidth, window.innerWidth);
            if (width < 800 && (typeof window.orientation) !== 'undefined') {
                return this.folders.mid;
            } else {
                return this.folders.zoom;
            }
        }
    },
    compiled: function() {
        this.fetchData();
    },
    methods: {
        fetchData: function() {
            var self = this;
            $.getJSON('js/gallery.json', function(json) {
                self.pics = json;
            });
        },
        sort: function() {
            $('#sort_arrows').addClass('moved');
            $('#sort_text').addClass('text_showed');

            setTimeout(function() {
                $('#sort_text').removeClass('text_showed');
                $('#sort_arrows').removeClass('moved');
            }, 500);
        }
    }
});


/*
sortedbynew - Vue.js component. Called by Vue router once the page address URL is 'sortedbynew'

 */

var sortedbynew = Vue.extend({
    template: '#gallery_template',
    ready: function() {
        this.$parent.sorted = false;
    },
    data: function() {
        return {
            zoomLink: '/sortedbynew'
        };
    },
    computed: {
        gallery: function() {
            if (this.$parent.gallery) {
                var pics = this.$parent.gallery.slice();
                pics.reverse();
                return pics;
            } else {
                return '';
            }
        },
        folders: function() {
            return this.$parent.folderGallery;
        },
        zoomGallery: function() {
            return this.$parent.zoomGallery;
        },
        folderFull: function() {
            return this.$parent.folders.full;
        },
        length: function() {
            return this.$parent.length;
        }

    }
});

var sortedbyold = Vue.extend({
    template: '#gallery_template',
    ready: function() {
        this.$parent.sorted = true;
    },
    data: function() {
        return {
            zoomLink: '/sortedbyold'
        };
    },
    computed: {
        gallery: function() {
            if (this.$parent.gallery) {
                var pics_notsorted = this.$parent.gallery;
                return pics_notsorted;
            } else {
                return '';
            }
        },
        folders: function() {
            return this.$parent.folderGallery;
        },
        folderFull: function() {
            return this.$parent.folders.full;
        },
        zoomGallery: function() {
            return this.$parent.zoomGallery;
        },
        length: function() {
            return this.$parent.length;
        }
    }
});

var zoom = Vue.extend({
    template: '#popup',
    ready: function() {
        $('body').css('overflow-y', 'hidden');
        $('body').addClass('disable-scrolling');
        this.swipe();

        this.$watch(function() {
                return this.currentPicSrc;
            },
            function() {
                this.imgChange();
            });

    },
    computed: {
        index: function() {
            if (this.$route.params.picId) {
                return parseInt(this.$route.params.picId) - 1;
            } else {
                return 0;
            }
        },
        currentPic: function() {
            var self = this;
            if (self.$parent.gallery) {
                var pic = self.$parent.gallery[self.index];
                return pic;
            } else {
                return '';
            }
        },
        fullSizeSrc: function() {
            var self = this;
            if (self.$parent.gallery) {
                var pic = self.$parent.gallery[self.index];
                return this.$parent.folderFull + pic.name;
            } else {
                return '';
            }
        },
        currentPicSrc: function() {
            var self = this;
            if (self.$parent.gallery) {
                var pic = self.$parent.gallery[self.index];
                return this.$parent.zoomGallery + pic.name;
            } else {
                return 'data:image/gif;base64,R0lGODlhAQABAAAAACH5BAEKAAEALAAAAAABAAEAAAICTAEAOw==';
            }
        },
        link: function() {
            return this.$parent.zoomLink;
        },
        nextpic: function() {
            var check = this.$parent.length;
            if ((this.index + 1) === check) {
                return 1;
            } else {
                return this.index + 2;
            }
        },
        prevpic: function() {
            var check = this.$parent.length;
            if (this.index === 0) {
                return check;
            } else {
                return this.index;
            }
        },
        imgClass: function() {
            if (this.currentPic.ratio === 'portrait') {
                return 'img_link_port';
            } else {
                return '';
            }
        },
        popClass: function() {
            if (this.currentPic.ratio === 'portrait') {
                return 'popup_container_h';
            } else {
                return '';
            }
        }
    },
    methods: {
        imgChange: function() {
            $('.img_link_img').attr('src', 'data:image/gif;base64,R0lGODlhAQABAAAAACH5BAEKAAEALAAAAAABAAEAAAICTAEAOw==');
            $('.img_link_img').removeClass('lazyloaded').addClass('lazyload');
        },
        details: function() {
            $('.popup_details').slideToggle('fast');
            $('.popup_details_top').slideToggle('fast');

        },
        swipe: function() {
            var self = this;
            var options = {
                preventDefault: true
            };
            var myElement = document.getElementById('swipe_div');
            var mc = new Hammer(myElement, options);
            mc.on('swipeleft', function() {
                var path = {
                    path: self.link + '/' + self.nextpic
                };
                router.go(path);
                self.imgChange();
            });
            mc.on('swiperight', function() {
                var path = {
                    path: self.link + '/' + self.prevpic
                };
                router.go(path);
                self.imgChange();
            });

        }
    }


});



var router = new VueRouter({});


router.redirect({
    '/': '/sortedbynew'
});

router.map({
    '/sortedbynew': {
        component: sortedbynew,
        subRoutes: {
            '/': {
                component: {
                    template: '<span></span>',
                    ready: function() {
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
                    template: '<span></span>',
                    ready: function() {
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


router.start(allPics, 'body', function() {

});

document.ontouchmove = function(event) {
    var isTouchMoveAllowed = true,
        target = event.target;
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
