$(document).ready(function() {
    var $banner = $("#bannerSlider");

    $banner.owlCarousel({
        items: 1,
        // `loop` clones slides, which throws off jumping to the last one by
        // index. `rewind` gives the same wrap-around with no clones.
        loop: false,
        rewind: true,
        autoplay: true,
        margin: 20,
        nav: false,
        dots: false,
        autoplayTimeout: 5500,
        autoplayHoverPause: true,
        smartSpeed: 900,
        mouseDrag: false,
        touchDrag: true,
    });

    // Category strip under the hero: click a label to jump to that slide,
    // and keep the active label in sync while the carousel autoplays.
    var $tabs = $("#heroTabs .hero-tab");

    if ($tabs.length) {
        var setActive = function (index) {
            $tabs.removeClass("is-active").attr("aria-selected", "false");
            var $current = $tabs.filter('[data-slide="' + index + '"]');
            $current.addClass("is-active").attr("aria-selected", "true");

            // Keep the active label visible when the strip scrolls on small screens.
            var track = $current.closest(".hero-tabs-track")[0];
            if (track && track.scrollWidth > track.clientWidth && $current.length) {
                var el = $current[0];
                var target = el.offsetLeft - (track.clientWidth - el.offsetWidth) / 2;
                track.scrollTo({ left: Math.max(0, target), behavior: "smooth" });
            }
        };

        $tabs.on("click", function () {
            $banner.trigger("to.owl.carousel", [parseInt($(this).data("slide"), 10), 600]);
        });

        $banner.on("changed.owl.carousel", function (event) {
            setActive(event.item.index);
        });
    }
})
